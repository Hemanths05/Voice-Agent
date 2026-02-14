"""
WebSocket Call Handler
Handles real-time bidirectional audio streaming with Twilio Media Streams
"""
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Any, Optional
import json
import asyncio
from datetime import datetime

from app.services.voice_pipeline_service import VoicePipelineService
from app.services.call_service import CallService
from app.services.agent_service import AgentService
from app.schemas.call import CallUpdate, CallTranscriptMessage
from app.core.logging_config import get_logger
from app.core.exceptions import CallNotFoundError

logger = get_logger(__name__)


class CallHandler:
    """
    Handles WebSocket connection for a single call
    """

    def __init__(self, call_sid: str):
        """
        Initialize call handler

        Args:
            call_sid: Twilio Call SID
        """
        self.call_sid = call_sid
        self.voice_pipeline = VoicePipelineService()
        self.call_service = CallService()
        self.agent_service = AgentService()

        # Audio buffer
        self.audio_buffer: bytes = b""
        self.buffer_duration_ms: int = 0
        self.target_buffer_ms: int = 2000  # 2 seconds of audio before processing

        # Session state
        self.company_id: Optional[str] = None
        self.stream_sid: Optional[str] = None
        self.is_active: bool = False
        self.greeting_sent: bool = False

        # Statistics
        self.start_time: Optional[datetime] = None
        self.total_messages: int = 0
        self.total_audio_processed: int = 0

    async def handle_connection(self, websocket: WebSocket):
        """
        Handle WebSocket connection lifecycle

        Args:
            websocket: FastAPI WebSocket connection
        """
        try:
            # Accept WebSocket connection
            await websocket.accept()
            logger.info(f"WebSocket connected: {self.call_sid}")

            self.is_active = True
            self.start_time = datetime.utcnow()

            # Main message loop
            while self.is_active:
                try:
                    # Receive message from Twilio
                    raw_message = await websocket.receive_text()
                    message = json.loads(raw_message)

                    self.total_messages += 1

                    # Handle message based on event type
                    event = message.get("event")

                    if event == "connected":
                        await self._handle_connected(message)

                    elif event == "start":
                        await self._handle_start(websocket, message)

                    elif event == "media":
                        await self._handle_media(websocket, message)

                    elif event == "stop":
                        await self._handle_stop(websocket, message)
                        break

                    elif event == "mark":
                        # Mark event indicates media was played
                        logger.debug(f"Media mark received: {message.get('mark')}")

                    else:
                        logger.warning(f"Unknown event type: {event}")

                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON from Twilio: {str(e)}")

                except asyncio.TimeoutError:
                    logger.warning(f"WebSocket timeout: {self.call_sid}")
                    break

        except WebSocketDisconnect:
            logger.info(f"WebSocket disconnected: {self.call_sid}")

        except Exception as e:
            logger.error(f"WebSocket error: {str(e)}", exc_info=True)

        finally:
            # Cleanup
            await self._cleanup(websocket)

    async def _handle_connected(self, message: Dict[str, Any]):
        """
        Handle 'connected' event from Twilio

        Args:
            message: Connected event message
        """
        logger.info(f"Call connected: {self.call_sid}")
        logger.debug(f"Connected message: {message}")

    async def _handle_start(self, websocket: WebSocket, message: Dict[str, Any]):
        """
        Handle 'start' event from Twilio

        This event signals the beginning of media streaming.

        Args:
            websocket: WebSocket connection
            message: Start event message
        """
        try:
            # Extract start event details
            start_data = message.get("start", {})
            self.stream_sid = start_data.get("streamSid")

            logger.info(f"Media stream started: {self.call_sid} (stream_sid={self.stream_sid})")

            # Look up call in database to get company_id
            try:
                call = await self.call_service.get_call_by_sid(self.call_sid)
                self.company_id = call.company_id
                logger.info(f"Call {self.call_sid} belongs to company {self.company_id}")
            except CallNotFoundError:
                logger.error(f"Call not found in database: {self.call_sid}")
                # Send error message and close
                await self._send_error_message(
                    websocket,
                    "Sorry, we couldn't process your call. Please try again."
                )
                self.is_active = False
                return

            # Update call status to in_progress
            await self.call_service.update_call_by_sid(
                call_sid=self.call_sid,
                data=CallUpdate(status="in_progress")
            )

            # Initialize voice pipeline session
            await self.voice_pipeline.initialize_session(
                call_sid=self.call_sid,
                company_id=self.company_id
            )

            # Get agent config for greeting
            agent_config = await self.agent_service.get_agent_config(self.company_id)

            # Send greeting message if configured
            if agent_config.greeting_message and not self.greeting_sent:
                await self._send_agent_message(websocket, agent_config.greeting_message)
                self.greeting_sent = True

        except Exception as e:
            logger.error(f"Error handling start event: {str(e)}", exc_info=True)
            await self._send_error_message(
                websocket,
                "Sorry, we're experiencing technical difficulties."
            )
            self.is_active = False

    async def _handle_media(self, websocket: WebSocket, message: Dict[str, Any]):
        """
        Handle 'media' event from Twilio

        This event contains audio chunks from the caller.

        Args:
            websocket: WebSocket connection
            message: Media event message
        """
        try:
            # Extract media payload
            media_data = message.get("media", {})
            audio_base64 = media_data.get("payload")

            if not audio_base64:
                logger.warning("Received media event without payload")
                return

            # Add to buffer
            # Note: We're storing base64 strings and will decode when processing
            # Each media chunk is ~20ms of audio
            self.audio_buffer += audio_base64.encode('utf-8')
            self.buffer_duration_ms += 20  # Twilio sends 20ms chunks

            # Check if buffer is ready for processing
            if self.buffer_duration_ms >= self.target_buffer_ms:
                await self._process_buffer(websocket)

        except Exception as e:
            logger.error(f"Error handling media event: {str(e)}", exc_info=True)

    async def _handle_stop(self, websocket: WebSocket, message: Dict[str, Any]):
        """
        Handle 'stop' event from Twilio

        This event signals the end of media streaming.

        Args:
            websocket: WebSocket connection
            message: Stop event message
        """
        logger.info(f"Media stream stopped: {self.call_sid}")

        # Process any remaining buffered audio
        if self.audio_buffer:
            try:
                await self._process_buffer(websocket)
            except Exception as e:
                logger.error(f"Error processing final buffer: {str(e)}")

        # Mark call as completed
        try:
            # Get final session state
            session = self.voice_pipeline.get_session(self.call_sid)

            # Calculate duration
            duration = None
            if self.start_time:
                duration = int((datetime.utcnow() - self.start_time).total_seconds())

            # Build transcript
            transcript_messages = []
            if session:
                for msg in session.messages:
                    transcript_messages.append(
                        CallTranscriptMessage(
                            role=msg["role"],
                            content=msg["content"],
                            timestamp=msg["timestamp"]
                        )
                    )

            # Update call record
            await self.call_service.update_call_by_sid(
                call_sid=self.call_sid,
                data=CallUpdate(
                    status="completed",
                    duration=duration,
                    transcript=transcript_messages
                )
            )

            logger.info(
                f"Call completed: {self.call_sid} | "
                f"Duration: {duration}s | "
                f"Messages: {len(transcript_messages)}"
            )

        except Exception as e:
            logger.error(f"Error finalizing call: {str(e)}", exc_info=True)

        self.is_active = False

    async def _process_buffer(self, websocket: WebSocket):
        """
        Process accumulated audio buffer through voice pipeline

        Args:
            websocket: WebSocket connection
        """
        try:
            if not self.audio_buffer or not self.company_id:
                return

            # Decode buffer (it's stored as base64 bytes)
            audio_base64 = self.audio_buffer.decode('utf-8')

            logger.debug(
                f"Processing audio buffer: {len(audio_base64)} chars, "
                f"{self.buffer_duration_ms}ms"
            )

            # Process through voice pipeline
            result = await self.voice_pipeline.process_audio(
                audio_base64=audio_base64,
                call_sid=self.call_sid,
                company_id=self.company_id
            )

            self.total_audio_processed += 1

            # Log latency
            logger.info(
                f"Voice pipeline completed: {self.call_sid} | "
                f"Latency: {result['latency_ms']}ms | "
                f"Transcript: '{result['transcript'][:50]}...'"
            )

            # Log detailed latency breakdown for optimization
            logger.debug(f"Latency breakdown: {result['latency_breakdown']}")

            # Send response audio to Twilio
            if result['response_audio']:
                await self._send_audio(websocket, result['response_audio'])

            # Clear buffer
            self.audio_buffer = b""
            self.buffer_duration_ms = 0

        except Exception as e:
            logger.error(f"Error processing audio buffer: {str(e)}", exc_info=True)

            # Send error message to caller
            await self._send_error_message(
                websocket,
                "I'm sorry, I didn't catch that. Could you please repeat?"
            )

            # Clear buffer anyway to prevent buildup
            self.audio_buffer = b""
            self.buffer_duration_ms = 0

    async def _send_audio(self, websocket: WebSocket, audio_base64: str):
        """
        Send audio to Twilio for playback

        Args:
            websocket: WebSocket connection
            audio_base64: Base64-encoded mulaw audio
        """
        try:
            # Split audio into chunks (Twilio expects ~20ms chunks)
            # For simplicity, we'll send the entire audio in one media event
            # In production, you might want to chunk this for smoother playback

            media_message = {
                "event": "media",
                "streamSid": self.stream_sid,
                "media": {
                    "payload": audio_base64
                }
            }

            await websocket.send_text(json.dumps(media_message))

            logger.debug(f"Sent audio to Twilio: {len(audio_base64)} chars")

        except Exception as e:
            logger.error(f"Error sending audio: {str(e)}", exc_info=True)

    async def _send_agent_message(self, websocket: WebSocket, text: str):
        """
        Convert text to speech and send to Twilio

        Args:
            websocket: WebSocket connection
            text: Text message to speak
        """
        try:
            # Use voice pipeline to synthesize speech
            result = await self.voice_pipeline.synthesize_greeting(
                text=text,
                company_id=self.company_id
            )

            # Send audio
            await self._send_audio(websocket, result['audio_base64'])

            logger.info(f"Sent greeting: '{text[:50]}...'")

        except Exception as e:
            logger.error(f"Error sending agent message: {str(e)}", exc_info=True)

    async def _send_error_message(self, websocket: WebSocket, error_text: str):
        """
        Send error message to caller

        Args:
            websocket: WebSocket connection
            error_text: Error message to speak
        """
        try:
            await self._send_agent_message(websocket, error_text)
        except Exception as e:
            logger.error(f"Error sending error message: {str(e)}", exc_info=True)

    async def _cleanup(self, websocket: WebSocket):
        """
        Cleanup resources after call ends

        Args:
            websocket: WebSocket connection
        """
        try:
            # Close voice pipeline session
            if self.call_sid:
                self.voice_pipeline.cleanup_session(self.call_sid)

            # Close WebSocket if still open
            try:
                await websocket.close()
            except:
                pass

            # Log statistics
            if self.start_time:
                duration = (datetime.utcnow() - self.start_time).total_seconds()
                logger.info(
                    f"Call cleanup: {self.call_sid} | "
                    f"Duration: {duration:.1f}s | "
                    f"Messages: {self.total_messages} | "
                    f"Audio processed: {self.total_audio_processed}"
                )

        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}", exc_info=True)


# FastAPI WebSocket endpoint
async def handle_call_websocket(websocket: WebSocket, call_sid: str):
    """
    FastAPI WebSocket endpoint handler

    Args:
        websocket: FastAPI WebSocket connection
        call_sid: Twilio Call SID from URL path
    """
    handler = CallHandler(call_sid)
    await handler.handle_connection(websocket)


# Export
__all__ = ["handle_call_websocket", "CallHandler"]

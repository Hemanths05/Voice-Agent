# Voice Agent Platform - Backend

A production-grade, multi-tenant SaaS platform for AI-powered voice agents for customer support and cold calling.

## 🚀 Features

- **Multi-Provider AI Architecture**: Support for multiple STT, LLM, TTS, and Embeddings providers
  - **STT**: Groq Whisper, OpenAI Whisper, AssemblyAI, Deepgram
  - **LLM**: Groq (Llama 3.1/3.3), OpenAI (GPT-4o), Anthropic (Claude), Google (Gemini)
  - **TTS**: ElevenLabs, OpenAI TTS, Google Cloud TTS, Azure TTS
  - **Embeddings**: OpenAI ada-002, Voyage AI, Cohere, Gemini

- **Real-time Voice Processing**: WebSocket-based voice streaming with Twilio
- **RAG (Retrieval-Augmented Generation)**: Company-specific knowledge bases with Qdrant vector DB
- **Multi-tenancy**: Complete data isolation between companies
- **Role-Based Access Control**: SuperAdmin and Admin roles
- **Production-Ready**: Comprehensive error handling, logging, and monitoring hooks

## 🏗️ Architecture

```
┌─────────────┐
│   Twilio    │  Incoming call
│   Voice     │──────────────┐
└─────────────┘              │
                             ▼
                    ┌─────────────────┐
                    │   WebSocket     │
                    │   Handler       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Voice Pipeline  │
                    │   Service       │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
    ┌────────┐          ┌────────┐         ┌────────┐
    │  STT   │          │  LLM   │         │  TTS   │
    │Provider│          │Provider│         │Provider│
    └────────┘          └────┬───┘         └────────┘
                             │
                             ▼
                        ┌─────────┐
                        │ Qdrant  │
                        │ (RAG)   │
                        └─────────┘
```

## 📋 Prerequisites

- Python 3.11+
- MongoDB Atlas account or local MongoDB
- Qdrant Cloud account or local Qdrant
- Twilio account with phone number
- API keys for AI providers (at least one per type)

## 🛠️ Installation

### 1. Clone the repository

```bash
cd backend
```

### 2. Create virtual environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your API keys and configuration. **Required variables**:
- `SECRET_KEY`: Generate with `openssl rand -hex 32`
- `MONGODB_URL`: Your MongoDB connection string
- `QDRANT_URL`: Your Qdrant instance URL
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- At least one API key per provider type (STT, LLM, TTS, Embeddings)

### 5. Create initial SuperAdmin user

```bash
python scripts/seed_superadmin.py --email admin@example.com --password YourSecurePassword123
```

### 6. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## 🔧 Development Setup

### With ngrok (for Twilio webhooks in development)

```bash
# In a separate terminal
ngrok http 8000
```

Copy the ngrok HTTPS URL and configure it in your Twilio phone number settings:
- **Incoming Call Webhook**: `https://your-ngrok-url.ngrok.io/webhooks/incoming-call`

Update `PUBLIC_URL` and `WEBSOCKET_BASE_URL` in `.env`:
```bash
PUBLIC_URL=https://your-ngrok-url.ngrok.io
WEBSOCKET_BASE_URL=wss://your-ngrok-url.ngrok.io
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new admin user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### SuperAdmin
- `GET /api/superadmin/companies` - List all companies
- `POST /api/superadmin/companies` - Create new company
- `PUT /api/superadmin/companies/{id}` - Update company
- `PUT /api/superadmin/companies/{id}/status` - Change company status
- `GET /api/superadmin/analytics/global` - Global analytics

### Admin (Company-specific)
- `GET /api/admin/dashboard` - Company dashboard stats
- `GET /api/admin/calls` - List calls
- `GET /api/admin/calls/{id}/transcript` - Get call transcript
- `POST /api/admin/knowledge/upload` - Upload knowledge document
- `GET /api/admin/knowledge` - List knowledge entries
- `DELETE /api/admin/knowledge/{id}` - Delete knowledge entry
- `GET /api/admin/agent/config` - Get agent configuration
- `PUT /api/admin/agent/config` - Update agent configuration

### Webhooks
- `POST /webhooks/incoming-call` - Twilio incoming call webhook
- `WS /ws/call/{call_sid}` - WebSocket for voice streaming

## 🧪 Testing

### Run all tests
```bash
pytest
```

### Run with coverage
```bash
pytest --cov=app --cov-report=html
```

### Run specific test file
```bash
pytest tests/unit/test_utils/test_audio.py -v
```

## 🔐 Environment Variables

See [.env.example](.env.example) for all available environment variables.

### Critical Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SECRET_KEY` | JWT signing key (min 32 chars) | ✅ |
| `MONGODB_URL` | MongoDB connection string | ✅ |
| `QDRANT_URL` | Qdrant instance URL | ✅ |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | ✅ |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | ✅ |
| `WEBSOCKET_BASE_URL` | WebSocket base URL (wss://...) | ✅ |
| `STT_PROVIDER` | Default STT provider | ✅ |
| `LLM_PROVIDER` | Default LLM provider | ✅ |
| `TTS_PROVIDER` | Default TTS provider | ✅ |
| `EMBEDDINGS_PROVIDER` | Default embeddings provider | ✅ |

## 🔄 Provider Configuration

### Switching AI Providers

Providers can be switched at two levels:

1. **Global (via environment variables)**:
```bash
STT_PROVIDER=groq
LLM_PROVIDER=openai
TTS_PROVIDER=elevenlabs
EMBEDDINGS_PROVIDER=openai
```

2. **Per-company (via agent configuration API)**:
```bash
PUT /api/admin/agent/config
{
  "stt_provider": "deepgram",
  "llm_provider": "anthropic",
  "tts_provider": "openai",
  "embeddings_provider": "voyage"
}
```

### Getting API Keys

- **Groq**: https://console.groq.com/keys
- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/settings/keys
- **Google (Gemini)**: https://makersuite.google.com/app/apikey
- **AssemblyAI**: https://www.assemblyai.com/app/account
- **Deepgram**: https://console.deepgram.com/
- **ElevenLabs**: https://elevenlabs.io/app/settings/api-keys
- **Voyage AI**: https://www.voyageai.com/
- **Cohere**: https://dashboard.cohere.com/api-keys

## 📊 Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration management
│   ├── core/                   # Core infrastructure
│   ├── database/               # Database connections & models
│   ├── providers/              # Multi-provider AI architecture
│   ├── services/               # Business logic
│   ├── utils/                  # Utility functions
│   ├── api/                    # API routes
│   └── schemas/                # Pydantic schemas
├── tests/                      # Test suite
├── scripts/                    # Utility scripts
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variables template
└── README.md                   # This file
```

## 🚀 Deployment

### Production Checklist

Before deploying to production:

1. **Security**:
   - Generate a strong `SECRET_KEY` (32+ chars)
   - Use strong passwords for all admin accounts
   - Enable HTTPS/TLS for all endpoints
   - Configure CORS to only allow your domains
   - Review all API keys and rotate regularly

2. **Database**:
   - Use MongoDB Atlas with backups enabled
   - Configure Qdrant with authentication
   - Set up database indexes (done automatically on startup)

3. **Monitoring**:
   - Set up health check monitoring on `/health`
   - Configure log aggregation (logs are JSON formatted)
   - Monitor Twilio webhook success rates

4. **Scaling**:
   - Use a reverse proxy (nginx) with load balancing
   - Consider Redis for session management (currently in-memory)
   - Monitor voice pipeline latency (<2s target)

5. **Twilio**:
   - Configure production phone numbers
   - Set webhook URL to production domain
   - Configure WebSocket URL for Media Streams

### Docker Deployment (Coming Soon)

Docker and docker-compose configurations will be added in a future update.

## 🐛 Troubleshooting

### Issue: "ModuleNotFoundError"
**Solution**: Ensure virtual environment is activated and dependencies are installed:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: "MongoDB connection failed"
**Solution**: Check `MONGODB_URL` in `.env` and ensure MongoDB is running

### Issue: "Provider API key not configured"
**Solution**: Verify the API key for your selected provider is set in `.env`

### Issue: "Twilio webhook not receiving calls"
**Solution**:
1. Check `PUBLIC_URL` points to your ngrok URL
2. Verify Twilio webhook is configured correctly
3. Check ngrok is running

## 📝 License

(Add your license information here)

## 👥 Contributing

(Add contributing guidelines here)

## 📧 Support

(Add support contact information here)

---

## ✅ Implementation Status

**Batch 1** (✅ Complete): Foundation, Database, AI Provider Architecture
**Batch 2** (✅ Complete): Services, Utilities, Voice Pipeline
**Batch 3** (✅ Complete): API Routes, WebSocket Handler, Testing

### What's Working:
- ✅ Complete REST API (Auth, SuperAdmin, Admin, Webhooks)
- ✅ Real-time WebSocket voice streaming with Twilio
- ✅ Multi-provider AI architecture (4 STT, 4 LLM, 4 TTS, 4 Embeddings)
- ✅ RAG with Qdrant vector database
- ✅ Voice pipeline orchestration (<2s latency target)
- ✅ Multi-tenancy with role-based access
- ✅ Basic testing suite (unit + integration tests)

### Next Steps (Future Enhancements):
- Redis for distributed session management
- Celery for background document processing
- Circuit breaker pattern for provider resilience
- Comprehensive test coverage
- Docker & Kubernetes deployment configs
- Frontend dashboard

---

Built with ❤️ using FastAPI, MongoDB, Qdrant, and Twilio

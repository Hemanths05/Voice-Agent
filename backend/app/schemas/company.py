"""
Company Schemas
Request/response models for company management
"""
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime


class CompanyCreate(BaseModel):
    """Schema for creating a new company"""

    name: str = Field(..., min_length=2, max_length=200, description="Company name")
    phone_number: str = Field(..., description="Twilio phone number (E.164 format: +1XXXXXXXXXX)")
    description: Optional[str] = Field(None, max_length=1000, description="Company description")
    industry: Optional[str] = Field(None, max_length=100, description="Industry/vertical")

    @validator('phone_number')
    def validate_phone_format(cls, v):
        """Validate phone is in Twilio format"""
        import re
        if not re.match(r'^\+1\d{10}$', v):
            raise ValueError('Phone number must be in format: +1XXXXXXXXXX')
        return v

    class Config:
        schema_extra = {
            "example": {
                "name": "Acme Corporation",
                "phone_number": "+15551234567",
                "description": "Leading provider of roadrunner traps",
                "industry": "Manufacturing"
            }
        }


class CompanyUpdate(BaseModel):
    """Schema for updating company information"""

    name: Optional[str] = Field(None, min_length=2, max_length=200, description="Company name")
    phone_number: Optional[str] = Field(None, description="Twilio phone number")
    description: Optional[str] = Field(None, max_length=1000, description="Company description")
    industry: Optional[str] = Field(None, max_length=100, description="Industry/vertical")

    @validator('phone_number')
    def validate_phone_format(cls, v):
        """Validate phone is in Twilio format"""
        if v is not None:
            import re
            if not re.match(r'^\+1\d{10}$', v):
                raise ValueError('Phone number must be in format: +1XXXXXXXXXX')
        return v

    class Config:
        schema_extra = {
            "example": {
                "name": "Acme Corporation Inc.",
                "description": "Updated description"
            }
        }


class CompanyStatusUpdate(BaseModel):
    """Schema for updating company status"""

    status: str = Field(..., description="Company status (active, inactive, suspended)")

    @validator('status')
    def validate_status(cls, v):
        """Validate status is valid"""
        allowed_statuses = ['active', 'inactive', 'suspended']
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {', '.join(allowed_statuses)}")
        return v

    class Config:
        schema_extra = {
            "example": {
                "status": "active"
            }
        }


class CompanyResponse(BaseModel):
    """Response schema for company information"""

    id: str = Field(..., description="Company ID")
    name: str = Field(..., description="Company name")
    phone_number: str = Field(..., description="Twilio phone number")
    description: Optional[str] = Field(None, description="Company description")
    industry: Optional[str] = Field(None, description="Industry/vertical")
    status: str = Field(..., description="Company status")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    # Stats (populated by service layer)
    total_calls: Optional[int] = Field(None, description="Total number of calls")
    total_admins: Optional[int] = Field(None, description="Total number of admin users")

    class Config:
        schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439012",
                "name": "Acme Corporation",
                "phone_number": "+15551234567",
                "description": "Leading provider of roadrunner traps",
                "industry": "Manufacturing",
                "status": "active",
                "created_at": "2024-01-15T10:30:00Z",
                "updated_at": "2024-01-15T10:30:00Z",
                "total_calls": 1250,
                "total_admins": 3
            }
        }


class CompanyListResponse(BaseModel):
    """Response schema for paginated company list"""

    companies: list[CompanyResponse] = Field(..., description="List of companies")
    total: int = Field(..., description="Total number of companies")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Number of items per page")
    total_pages: int = Field(..., description="Total number of pages")

    class Config:
        schema_extra = {
            "example": {
                "companies": [
                    {
                        "id": "507f1f77bcf86cd799439012",
                        "name": "Acme Corporation",
                        "phone_number": "+15551234567",
                        "description": "Leading provider",
                        "industry": "Manufacturing",
                        "status": "active",
                        "created_at": "2024-01-15T10:30:00Z",
                        "updated_at": "2024-01-15T10:30:00Z",
                        "total_calls": 1250,
                        "total_admins": 3
                    }
                ],
                "total": 25,
                "page": 1,
                "page_size": 20,
                "total_pages": 2
            }
        }


class CompanyStatsResponse(BaseModel):
    """Response schema for company statistics"""

    company_id: str = Field(..., description="Company ID")
    total_calls: int = Field(..., description="Total number of calls")
    successful_calls: int = Field(..., description="Number of successful calls")
    failed_calls: int = Field(..., description="Number of failed calls")
    avg_call_duration: float = Field(..., description="Average call duration in seconds")
    total_knowledge_entries: int = Field(..., description="Total knowledge base entries")
    total_admins: int = Field(..., description="Total admin users")
    last_call_at: Optional[datetime] = Field(None, description="Timestamp of last call")

    class Config:
        schema_extra = {
            "example": {
                "company_id": "507f1f77bcf86cd799439012",
                "total_calls": 1250,
                "successful_calls": 1180,
                "failed_calls": 70,
                "avg_call_duration": 185.5,
                "total_knowledge_entries": 45,
                "total_admins": 3,
                "last_call_at": "2024-01-20T15:45:00Z"
            }
        }


# Export schemas
__all__ = [
    "CompanyCreate",
    "CompanyUpdate",
    "CompanyStatusUpdate",
    "CompanyResponse",
    "CompanyListResponse",
    "CompanyStatsResponse"
]

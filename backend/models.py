from pydantic import BaseModel
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class FundBase(BaseModel):
    code: str
    name: str

class FundCreate(FundBase):
    holding_count: float
    holding_amount: float
    current_profit: float | None = None

class Fund(FundBase):
    id: int
    user_id: int
    holding_count: float
    holding_amount: float
    current_profit: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

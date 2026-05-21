from pydantic import BaseModel, EmailStr
from typing import Optional


class UserSignup(BaseModel):
    name: str
    gender: str
    email: EmailStr
    mobile: Optional[str] = None   # FIX 3: mobile is now optional
    password: str


class LoginModel(BaseModel):
    email: EmailStr
    password: str

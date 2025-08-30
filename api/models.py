from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class Document(BaseModel):
    id: int
    user_id: str
    summary: Optional[str]
    updated_at: Optional[datetime]

class User(BaseModel):
    username: str
    password: str

class CreateUser(BaseModel):
    username: str
    password: str
    confirm_password: str

class LogUser(BaseModel):
    username: str
    password: str
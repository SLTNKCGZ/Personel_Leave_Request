from database import Base
from sqlalchemy import Column, Integer, Date, String, ForeignKey
from pydantic import BaseModel
from datetime import date

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    first_name = Column(String)
    last_name = Column(String)
    hashed_password = Column(String)
    role = Column(String)
    register_date = Column(Date)

class Request(Base):
    __tablename__ = "request"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    start_date = Column(Date)
    end_date = Column(Date)
    request_type = Column(String)
    description = Column(String)
    created_at = Column(Date, default=date.today)
    status = Column(String, default="Onay Bekliyor")


class RequestCreate(BaseModel):
    start_date: date
    end_date: date
    request_type: str
    description: str


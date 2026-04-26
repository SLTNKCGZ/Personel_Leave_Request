from fastapi import APIRouter, HTTPException, Depends, Path
from sqlalchemy import Integer
from sqlalchemy.orm import Session
from database import SessionLocal
from typing import Annotated
from pydantic import BaseModel
from router.auth import get_current_user
from models import Request, User
from starlette import status

class UpdateStatusRequest(BaseModel):
    updated_status: str

router= APIRouter(prefix="/yonetici", tags=["Yönetici"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

from sqlalchemy.orm import Session
# Modellerini import ettiğinden emin ol (User ve Request)

@router.get("/izin")
def get_izinler(db: db_dependency, current_user: user_dependency):
    if current_user is None:
        raise HTTPException(status_code=403, detail="Kullanıcı yetkisi gereklidir.")
    
    if current_user["role"] != "Yönetici":
        raise HTTPException(status_code=403, detail="Yönetici yetkisi gereklidir.")
    
    # 1. Sorguyu Join ile yapıyoruz
    # Request tablosu ile User tablosunu user_id üzerinden birleştiriyoruz
    sorgu_sonucu = db.query(Request, User.first_name, User.last_name)\
        .join(User, Request.user_id == User.id)\
        .all()
    
    # 2. Veriyi JSON formatına (list of dict) çeviriyoruz
    # Çünkü sorgu sonucu (Request nesnesi, "Ad", "Soyad") şeklinde tuple döner
    donus_verisi = []
    for request, first_name, last_name in sorgu_sonucu:
        # Request nesnesini sözlüğe çevirip üzerine isimleri ekliyoruz
        izin_dict = {
            "id": request.id,
            "user_id": request.user_id,
            "request_type": request.request_type,
            "start_date": request.start_date,
            "end_date": request.end_date,
            "description": request.description,
            "status": request.status,
            "first_name": first_name, # User tablosundan geldi
            "last_name": last_name    # User tablosundan geldi
        }
        donus_verisi.append(izin_dict)
        
    return donus_verisi

@router.put("/izin_durum/{id}",status_code=status.HTTP_200_OK)
def update_izin_durum(request: UpdateStatusRequest, db: db_dependency, current_user: user_dependency, id: int = Path(...)):
    if current_user is None:
        raise HTTPException(status_code=403, detail="Kullanıcı yetkisi gereklidir.")

    if current_user["role"] != "Yönetici":
        raise HTTPException(status_code=403, detail="Yönetici yetkisi gereklidir.")

    izin = db.query(Request).filter(Request.id == id).first()
    if izin is None:
        raise HTTPException(status_code=404, detail="İzin talebi bulunamadı.")

    izin.status = request.updated_status
    db.commit()
    db.refresh(izin)
    return izin

@router.get("/user")
def get_users(db:db_dependency, current_user: user_dependency):
    if current_user is None:
        raise HTTPException(status_code=403, detail="Kullanıcı yetkisi gereklidir.")
    
    if current_user["role"] != "Yönetici":
        raise HTTPException(status_code=403, detail="Yönetici yetkisi gereklidir.")
    
    users = db.query(User).all()
    return users
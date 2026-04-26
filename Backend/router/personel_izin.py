from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Request, RequestCreate
from router.auth import get_current_user
from typing import Annotated

router= APIRouter(prefix="/personel_izin", tags=["Personel_izin"])
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@router.post("/izin-talep")
def create_izin_talebi(request: RequestCreate, db: db_dependency, current_user: user_dependency):
    if current_user is None:
        raise HTTPException(status_code=403, detail="Kullanıcı yetkisi gereklidir.")
    
    if current_user["role"] != "Personel":
        raise HTTPException(status_code=403, detail="Personel yetkisi gereklidir.")
    
    if not request.start_date or not request.end_date:
        raise HTTPException(status_code=400, detail="Lütfen başlangıç ve bitiş tarihlerini seçiniz.")
    
    if len(request.description or "") < 3:
        raise HTTPException(status_code=400, detail="Lütfen en az 3 karakterlik bir açıklama giriniz.")
    
    new_request = Request(
        user_id=current_user["id"],
        start_date=request.start_date,
        end_date=request.end_date,
        request_type=request.request_type,
        description=request.description,
        status="Onay Bekliyor"
    )
    if(new_request.end_date < new_request.start_date):
        raise HTTPException(status_code=409, detail="Bitiş tarihi başlangıç tarihinden önce olamaz.")
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@router.get("/izin")
def get_izinler(db: db_dependency, current_user: user_dependency):
    if current_user is None:
        raise HTTPException(status_code=403, detail="Kullanıcı yetkisi gereklidir.")
    
    if current_user["role"] != "Personel":
        raise HTTPException(status_code=403, detail="Personel yetkisi gereklidir.")
    
    
    izinler = db.query(Request).filter(Request.user_id == current_user["id"]).all()
    return izinler

@router.put("/izin_guncelle/{id}")
def update_izin(id: int, request: RequestCreate, db: db_dependency, current_user: user_dependency):
    if current_user is None:
        raise HTTPException(status_code=403, detail="Kullanıcı yetkisi gereklidir.")

    if current_user["role"] != "Personel":
        raise HTTPException(status_code=403, detail="Personel yetkisi gereklidir.")

    izin = db.query(Request).filter(Request.id == id, Request.user_id == current_user["id"]).first()
    if izin is None:
        raise HTTPException(status_code=404, detail="İzin talebi bulunamadı.")

    izin.start_date = request.start_date
    izin.end_date = request.end_date
    izin.request_type = request.request_type
    izin.description = request.description

    if(izin.end_date < izin.start_date):
        raise HTTPException(status_code=409, detail="Bitiş tarihi başlangıç tarihinden önce olamaz.")
    
    db.commit()
    db.refresh(izin)
    return izin

@router.delete("/izin_sil/{id}")
def delete_izin(id: int, db: db_dependency, current_user: user_dependency):
    if current_user is None:
        raise HTTPException(status_code=403, detail="Kullanıcı yetkisi gereklidir.")
    
    if current_user["role"] != "Personel":
        raise HTTPException(status_code=403, detail="Personel yetkisi gereklidir.")
    
    izin = db.query(Request).filter(Request.id == id, Request.user_id == current_user["id"]).first()
    if izin is None:
        raise HTTPException(status_code=404, detail="İzin talebi bulunamadı.")
    
    db.delete(izin)
    db.commit()
    return {"detail": "İzin talebi silindi."}

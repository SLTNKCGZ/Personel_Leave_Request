from fastapi import FastAPI
from database import Base, engine
from router import auth, personel_izin, yonetici
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(auth.router)
app.include_router(personel_izin.router)
app.include_router(yonetici.router)

origins = [
    "http://localhost:5173", # Frontend'in çalıştığı adres
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Tüm metodlara (GET, POST, PUT, DELETE) izin ver
    allow_headers=["*"], # Tüm başlıklara izin ver
)


Base.metadata.create_all(bind=engine)
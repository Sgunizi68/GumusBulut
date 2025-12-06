import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

from db.database import engine, Base
from api.v1.endpoints import (
    sube, users, roles, permissions, kullanici_rol, rol_yetki, e_fatura,
    b2b_ekstre, diger_harcama, gelir, gelir_ekstra, stok, stok_fiyat, calisan, puantaj_secimi, puantaj, avans_istek, kategori, ust_kategori, token, deger, e_fatura_referans, nakit, odeme, odeme_referans, report, fatura_diger_harcama_rapor, pos_hareketleri, yemek_ceki, fatura_bolme, calisan_talep, rapor, email, cari, mutabakat
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SilverCloud Backend API",
    version="1.0.0",
    description="API for SilverCloud application"
)


origins = [
    "http://localhost:5173", # Frontend development server
    "http://localhost:8000", # Backend itself
    "https://gumusbulut.onrender.com", # Production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(sube.router, prefix="/api/v1", tags=["Sube"])
app.include_router(users.router, prefix="/api/v1", tags=["Users"])
app.include_router(roles.router, prefix="/api/v1", tags=["Roles"])
app.include_router(permissions.router, prefix="/api/v1", tags=["Permissions"])
app.include_router(kullanici_rol.router, prefix="/api/v1", tags=["Kullanici Rolleri"])
app.include_router(rol_yetki.router, prefix="/api/v1", tags=["Rol Yetkileri"])
app.include_router(e_fatura.router, prefix="/api/v1", tags=["EFatura"])
app.include_router(b2b_ekstre.router, prefix="/api/v1", tags=["B2BEkstre"])
app.include_router(diger_harcama.router, prefix="/api/v1", tags=["Diger Harcamalar"])
app.include_router(gelir.router, prefix="/api/v1", tags=["Gelir"])
app.include_router(gelir_ekstra.router, prefix="/api/v1", tags=["Gelir Ekstra"])
app.include_router(stok.router, prefix="/api/v1", tags=["Stok"])
app.include_router(stok_fiyat.router, prefix="/api/v1", tags=["Stok Fiyat"])

app.include_router(ust_kategori.router, prefix="/api/v1", tags=["Ust Kategori"])
app.include_router(kategori.router, prefix="/api/v1", tags=["Kategori"])
app.include_router(deger.router, prefix="/api/v1", tags=["Deger"])
app.include_router(token.router, prefix="/api/v1", tags=["Token"])
app.include_router(e_fatura_referans.router, prefix="/api/v1", tags=["EFatura Referans"])
app.include_router(nakit.router, prefix="/api/v1", tags=["Nakit"])
app.include_router(odeme.router, prefix="/api/v1", tags=["Odeme"])
app.include_router(odeme_referans.router, prefix="/api/v1", tags=["Odeme Referans"])
app.include_router(pos_hareketleri.router, prefix="/api/v1", tags=["POS Hareketleri"])
app.include_router(yemek_ceki.router, prefix="/api/v1", tags=["Yemek Cekiler"])
app.include_router(fatura_bolme.router, prefix="/api/v1", tags=["Fatura Bolme"])
app.include_router(calisan_talep.router, prefix="/api/v1", tags=["Calisan Talep"])
app.include_router(cari.router, prefix="/api/v1", tags=["Cari"])

app.include_router(calisan.router, prefix="/api/v1", tags=["Calisan"])
app.include_router(puantaj_secimi.router, prefix="/api/v1", tags=["Puantaj Secimi"])
app.include_router(puantaj.router, prefix="/api/v1", tags=["Puantaj"])
app.include_router(avans_istek.router, prefix="/api/v1", tags=["Avans Istek"])
app.include_router(report.router, prefix="/api/v1", tags=["Reports"])
app.include_router(rapor.router, prefix="/api/v1", tags=["Raporlar"])
app.include_router(fatura_diger_harcama_rapor.router, prefix="/api/v1/fatura-diger-harcama-rapor", tags=["Reports"])
app.include_router(email.router, prefix="/api/v1", tags=["Email"])
app.include_router(mutabakat.router, prefix="/api/v1", tags=["Mutabakat"])

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to SilverCloud Backend API"}
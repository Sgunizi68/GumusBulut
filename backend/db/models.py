from sqlalchemy import Column, Integer, String, Text, Date, DateTime, Boolean, DECIMAL, Enum, ForeignKey, LargeBinary
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Sube(Base):
    __tablename__ = "Sube"

    Sube_ID = Column(Integer, primary_key=True, index=True)
    Sube_Adi = Column(String(100), nullable=False)
    Aciklama = Column(Text, nullable=True)
    Aktif_Pasif = Column(Boolean, default=True)

    calisanlar = relationship("Calisan", back_populates="sube")
    kullanici_rolleri = relationship("KullaniciRol", back_populates="sube")
    e_faturalar = relationship("EFatura", back_populates="sube")
    b2b_ekstreler = relationship("B2BEkstre", back_populates="sube")
    diger_harcamalar = relationship("DigerHarcama", back_populates="sube")
    gelirler = relationship("Gelir", back_populates="sube")
    gelir_ekstralar = relationship("GelirEkstra", back_populates="sube")
    stok_sayimlar = relationship("StokSayim", back_populates="sube")
    stok_fiyatlar = relationship("StokFiyat", back_populates="sube")
    puantajlar = relationship("Puantaj", back_populates="sube")
    avans_istekler = relationship("AvansIstek", back_populates="sube")
    nakitler = relationship("Nakit", back_populates="sube")
    odemeler = relationship("Odeme", back_populates="sube")
    pos_hareketleri = relationship("POSHareketleri", back_populates="sube")
    calisan_talepler = relationship("CalisanTalep", back_populates="sube")

class Kullanici(Base):
    __tablename__ = "Kullanici"

    Kullanici_ID = Column(Integer, primary_key=True, index=True)
    Adi_Soyadi = Column(String(100), nullable=False)
    Kullanici_Adi = Column(String(50), nullable=False, unique=True)
    Password = Column(String(255), nullable=False) # Hashed password
    Email = Column(String(100), nullable=True)
    Expire_Date = Column(Date, nullable=True)
    Aktif_Pasif = Column(Boolean, default=True)

    kullanici_rolleri = relationship("KullaniciRol", back_populates="kullanici")
    is_onay_veren_talepler = relationship("CalisanTalep", foreign_keys="[CalisanTalep.Is_Onay_Veren_Kullanici_ID]", back_populates="is_onay_veren_kullanici")
    ssk_onay_veren_talepler = relationship("CalisanTalep", foreign_keys="[CalisanTalep.SSK_Onay_Veren_Kullanici_ID]", back_populates="ssk_onay_veren_kullanici")

class Rol(Base):
    __tablename__ = "Rol"

    Rol_ID = Column(Integer, primary_key=True, index=True)
    Rol_Adi = Column(String(50), nullable=False, unique=True)
    Aciklama = Column(Text, nullable=True)
    Aktif_Pasif = Column(Boolean, default=True)

    kullanici_rolleri = relationship("KullaniciRol", back_populates="rol")
    rol_yetkileri = relationship("RolYetki", back_populates="rol")

class Yetki(Base):
    __tablename__ = "Yetki"

    Yetki_ID = Column(Integer, primary_key=True, index=True)
    Yetki_Adi = Column(String(100), nullable=False, unique=True)
    Aciklama = Column(Text, nullable=True)
    Tip = Column(String(50), nullable=True) # e.g., 'Ekran', 'Islem'
    Aktif_Pasif = Column(Boolean, default=True)

    rol_yetkileri = relationship("RolYetki", back_populates="yetki")

class KullaniciRol(Base):
    __tablename__ = "Kullanici_Rol"

    Kullanici_ID = Column(Integer, ForeignKey("Kullanici.Kullanici_ID"), primary_key=True)
    Rol_ID = Column(Integer, ForeignKey("Rol.Rol_ID"), primary_key=True)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), primary_key=True)
    Aktif_Pasif = Column(Boolean, default=True)

    kullanici = relationship("Kullanici", back_populates="kullanici_rolleri")
    rol = relationship("Rol", back_populates="kullanici_rolleri")
    sube = relationship("Sube", back_populates="kullanici_rolleri")

class RolYetki(Base):
    __tablename__ = "Rol_Yetki"

    Rol_ID = Column(Integer, ForeignKey("Rol.Rol_ID"), primary_key=True)
    Yetki_ID = Column(Integer, ForeignKey("Yetki.Yetki_ID"), primary_key=True)
    Aktif_Pasif = Column(Boolean, default=True)

    rol = relationship("Rol", back_populates="rol_yetkileri")
    yetki = relationship("Yetki", back_populates="rol_yetkileri")

class Deger(Base):
    __tablename__ = "Deger"

    Deger_ID = Column(Integer, primary_key=True, index=True)
    Deger_Adi = Column(String(100), nullable=False)
    Gecerli_Baslangic_Tarih = Column(Date, nullable=False)
    Gecerli_Bitis_Tarih = Column(Date, nullable=False, default="2100-01-01")
    Deger_Aciklama = Column(Text, nullable=True)
    Deger = Column(DECIMAL(15, 2), nullable=False)

class UstKategori(Base):
    __tablename__ = "UstKategori"

    UstKategori_ID = Column(Integer, primary_key=True, index=True)
    UstKategori_Adi = Column(String(100), nullable=False, unique=True)
    Aktif_Pasif = Column(Boolean, default=True, nullable=True)

    kategoriler = relationship("Kategori", back_populates="ust_kategori")

class Kategori(Base):
    __tablename__ = "Kategori"

    Kategori_ID = Column(Integer, primary_key=True, index=True)
    Kategori_Adi = Column(String(100), nullable=False)
    Ust_Kategori_ID = Column(Integer, ForeignKey("UstKategori.UstKategori_ID"), nullable=True) # Changed to nullable=True based on schema
    Tip = Column(Enum('Gelir', 'Gider', 'Bilgi', 'Ödeme', 'Giden Fatura'), nullable=False)
    Aktif_Pasif = Column(Boolean, default=True)
    Gizli = Column(Boolean, default=False)

    ust_kategori = relationship("UstKategori", back_populates="kategoriler")
    e_faturalar = relationship("EFatura", back_populates="kategori")
    b2b_ekstreler = relationship("B2BEkstre", back_populates="kategori")
    diger_harcamalar = relationship("DigerHarcama", back_populates="kategori")
    gelirler = relationship("Gelir", back_populates="kategori")
    odemeler = relationship("Odeme", back_populates="kategori")
    odeme_referanslar = relationship("OdemeReferans", back_populates="kategori")

class EFatura(Base):
    __tablename__ = "e_Fatura"

    Fatura_ID = Column(Integer, primary_key=True, index=True)
    Fatura_Tarihi = Column(Date, nullable=False)
    Fatura_Numarasi = Column(String(50), nullable=False, unique=True)
    Alici_Unvani = Column(String(200), nullable=False)
    Alici_VKN_TCKN = Column(String(20), nullable=True)
    Tutar = Column(DECIMAL(15, 2), nullable=False)
    Kategori_ID = Column(Integer, ForeignKey("Kategori.Kategori_ID"), nullable=True)
    Aciklama = Column(Text, nullable=True)
    Donem = Column(Integer, nullable=False) # Stored as INT in DB, but often handled as string 'YYMM'
    Ozel = Column(Boolean, default=False)
    Gunluk_Harcama = Column(Boolean, default=False)
    Giden_Fatura = Column(Boolean, default=False)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=False)
    Kayit_Tarihi = Column(DateTime, default=func.now())

    kategori = relationship("Kategori", back_populates="e_faturalar")
    sube = relationship("Sube", back_populates="e_faturalar")

class B2BEkstre(Base):
    __tablename__ = "B2B_Ekstre"

    Ekstre_ID = Column(Integer, primary_key=True, index=True)
    Tarih = Column(Date, nullable=False)
    Fis_No = Column(String(50), nullable=False)
    Fis_Turu = Column(String(50), nullable=True)
    Aciklama = Column(Text, nullable=True)
    Borc = Column(DECIMAL(15, 2), default=0.00)
    Alacak = Column(DECIMAL(15, 2), default=0.00)
    Toplam_Bakiye = Column(DECIMAL(15, 2), nullable=True)
    Fatura_No = Column(String(50), nullable=True)
    Fatura_Metni = Column(Text, nullable=True)
    Donem = Column(Integer, nullable=False) # Stored as INT in DB, but often handled as string 'YYMM'
    Kategori_ID = Column(Integer, ForeignKey("Kategori.Kategori_ID"), nullable=True)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=False)
    Kayit_Tarihi = Column(DateTime, default=func.now())

    kategori = relationship("Kategori", back_populates="b2b_ekstreler")
    sube = relationship("Sube", back_populates="b2b_ekstreler")

class DigerHarcama(Base):
    __tablename__ = "Diger_Harcama"

    Harcama_ID = Column(Integer, primary_key=True, index=True)
    Alici_Adi = Column(String(200), nullable=False)
    Belge_Numarasi = Column(String(50), nullable=True)
    Belge_Tarihi = Column(Date, nullable=False)
    Donem = Column(Integer, nullable=False) # Stored as INT in DB, but often handled as string 'YYMM'
    Tutar = Column(DECIMAL(15, 2), nullable=False)
    Kategori_ID = Column(Integer, ForeignKey("Kategori.Kategori_ID"), nullable=False)
    Harcama_Tipi = Column(Enum('Nakit', 'Banka Ödeme', 'Kredi Kartı'), nullable=False)
    Gunluk_Harcama = Column(Boolean, default=False)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=False)
    Açıklama = Column(String(45), nullable=True)
    Kayit_Tarihi = Column(DateTime, default=func.now())
    Imaj = Column(LargeBinary, nullable=True)
    Imaj_Adi = Column(String(255), nullable=True)

    kategori = relationship("Kategori", back_populates="diger_harcamalar")
    sube = relationship("Sube", back_populates="diger_harcamalar")

class Gelir(Base):
    __tablename__ = "Gelir"

    Gelir_ID = Column(Integer, primary_key=True, index=True)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=False)
    Tarih = Column(Date, nullable=False)
    Kategori_ID = Column(Integer, ForeignKey("Kategori.Kategori_ID"), nullable=False)
    Tutar = Column(DECIMAL(15, 2), nullable=False)
    Kayit_Tarihi = Column(DateTime, default=func.now())

    sube = relationship("Sube", back_populates="gelirler")
    kategori = relationship("Kategori", back_populates="gelirler")

class GelirEkstra(Base):
    __tablename__ = "GelirEkstra"

    GelirEkstra_ID = Column(Integer, primary_key=True, index=True)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=False)
    Tarih = Column(Date, nullable=False)
    RobotPos_Tutar = Column(DECIMAL(15, 2), nullable=False)
    
    ZRapor_Tutar = Column(DECIMAL(15, 2), nullable=False, default=0.00)
    Tabak_Sayisi = Column(Integer, nullable=False, default=0)
    Kayit_Tarihi = Column(DateTime, default=func.now())

    sube = relationship("Sube", back_populates="gelir_ekstralar")

class Stok(Base):
    __tablename__ = "Stok"

    Stok_ID = Column(Integer, primary_key=True, index=True)
    Urun_Grubu = Column(String(100), nullable=False)
    Malzeme_Kodu = Column(String(50), nullable=False, unique=True)
    Malzeme_Aciklamasi = Column(Text, nullable=False)
    Birimi = Column(String(20), nullable=False)
    Sinif = Column(String(50), nullable=True)
    Aktif_Pasif = Column(Boolean, default=True)

    stok_fiyatlar = relationship("StokFiyat", back_populates="stok")
    stok_sayimlar = relationship("StokSayim", back_populates="stok")

class StokFiyat(Base):
    __tablename__ = "Stok_Fiyat"

    Fiyat_ID = Column(Integer, primary_key=True, index=True)
    Malzeme_Kodu = Column(String(50), ForeignKey("Stok.Malzeme_Kodu"), nullable=False)
    Gecerlilik_Baslangic_Tarih = Column(Date, nullable=False)
    Fiyat = Column(DECIMAL(10, 2), nullable=False)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=False)
    Aktif_Pasif = Column(Boolean, default=True)

    stok = relationship("Stok", back_populates="stok_fiyatlar")
    sube = relationship("Sube", back_populates="stok_fiyatlar")

class StokSayim(Base):
    __tablename__ = "Stok_Sayim"

    Sayim_ID = Column(Integer, primary_key=True, index=True)
    Malzeme_Kodu = Column(String(50), ForeignKey("Stok.Malzeme_Kodu"), nullable=False)
    Donem = Column(Integer, nullable=False) # Stored as INT in DB, but often handled as string 'YYMM'
    Miktar = Column(DECIMAL(10, 0), nullable=False)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=False)
    Kayit_Tarihi = Column(DateTime, default=func.now())

    stok = relationship("Stok", back_populates="stok_sayimlar")
    sube = relationship("Sube", back_populates="stok_sayimlar")

class Calisan(Base):
    __tablename__ = "Calisan"

    TC_No = Column(String(11), primary_key=True, index=True)
    Adi = Column(String(50), nullable=False)
    Soyadi = Column(String(50), nullable=False)
    Hesap_No = Column(String(30), nullable=True)
    IBAN = Column(String(26), nullable=True)
    Net_Maas = Column(DECIMAL(10, 2), nullable=True)
    Sigorta_Giris = Column(Date, nullable=True)
    Sigorta_Cikis = Column(Date, nullable=True)
    Aktif_Pasif = Column(Boolean, default=True)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=False)

    sube = relationship("Sube", back_populates="calisanlar")
    puantajlar = relationship("Puantaj", back_populates="calisan")
    avans_istekler = relationship("AvansIstek", back_populates="calisan")

class PuantajSecimi(Base):
    __tablename__ = "Puantaj_Secimi"

    Secim_ID = Column(Integer, primary_key=True, index=True)
    Secim = Column(String(100), nullable=False, unique=True)
    Degeri = Column(DECIMAL(3, 1), nullable=False)
    Renk_Kodu = Column(String(15), nullable=False)
    Aktif_Pasif = Column(Boolean, default=True)

    puantajlar = relationship("Puantaj", back_populates="secim")

class Puantaj(Base):
    __tablename__ = "Puantaj"

    Puantaj_ID = Column(Integer, primary_key=True, index=True)
    Tarih = Column(Date, nullable=False)
    TC_No = Column(String(11), ForeignKey("Calisan.TC_No"), nullable=False)
    Secim_ID = Column(Integer, ForeignKey("Puantaj_Secimi.Secim_ID"), nullable=False)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=False)
    Kayit_Tarihi = Column(DateTime, default=func.now())

    calisan = relationship("Calisan", back_populates="puantajlar")
    secim = relationship("PuantajSecimi", back_populates="puantajlar")
    sube = relationship("Sube", back_populates="puantajlar")

class AvansIstek(Base):
    __tablename__ = "Avans_Istek"

    Avans_ID = Column(Integer, primary_key=True, index=True)
    Donem = Column(Integer, nullable=False) # Stored as INT in DB, but often handled as string 'YYMM'
    TC_No = Column(String(11), ForeignKey("Calisan.TC_No"), nullable=False)
    Tutar = Column(DECIMAL(10, 2), nullable=False)
    Aciklama = Column(Text, nullable=True)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=False)
    Kayit_Tarihi = Column(DateTime, default=func.now())

    calisan = relationship("Calisan", back_populates="avans_istekler")
    sube = relationship("Sube", back_populates="avans_istekler")

class EFaturaReferans(Base):
    __tablename__ = "e_Fatura_Referans"

    Alici_Unvani = Column(String(200), primary_key=True, index=True)
    Referans_Kodu = Column(String(50), nullable=False)
    Kategori_ID = Column(Integer, ForeignKey("Kategori.Kategori_ID"), nullable=True)
    Aciklama = Column(Text, nullable=True)
    Aktif_Pasif = Column(Boolean, default=True)
    Kayit_Tarihi = Column(DateTime, default=func.now())

    kategori = relationship("Kategori")

class Nakit(Base):
    __tablename__ = "Nakit"

    Nakit_ID = Column(Integer, primary_key=True, index=True)
    Tarih = Column(Date, nullable=False)
    Kayit_Tarih = Column(DateTime, server_default=func.now())
    Tutar = Column(DECIMAL(15, 2), nullable=False)
    Tip = Column(String(50), default='Bankaya Yatan')
    Donem = Column(Integer, nullable=False)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=False)
    Imaj_Adı = Column(String(255), nullable=True)
    Imaj = Column(LargeBinary, nullable=True)

    sube = relationship("Sube", back_populates="nakitler")

class Odeme(Base):
    __tablename__ = "Odeme"

    Odeme_ID = Column(Integer, primary_key=True, index=True)
    Tip = Column(String(50), nullable=False)
    Hesap_Adi = Column(String(50), nullable=False)
    Tarih = Column(Date, nullable=False)
    Aciklama = Column(String(200), nullable=False)
    Tutar = Column(DECIMAL(15, 2), nullable=False, default=0.00)
    Kategori_ID = Column(Integer, ForeignKey("Kategori.Kategori_ID"), nullable=True)
    Donem = Column(Integer, nullable=True)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), default=1)
    Kayit_Tarihi = Column(DateTime, default=func.now())

    kategori = relationship("Kategori", back_populates="odemeler")
    sube = relationship("Sube", back_populates="odemeler")

class OdemeReferans(Base):
    __tablename__ = "Odeme_Referans"

    Referans_ID = Column(Integer, primary_key=True, index=True)
    Referans_Metin = Column(String(50), nullable=False, unique=True)
    Kategori_ID = Column(Integer, ForeignKey("Kategori.Kategori_ID"), nullable=False)
    Aktif_Pasif = Column(Boolean, default=True)
    Kayit_Tarihi = Column(DateTime, default=func.now())

    kategori = relationship("Kategori", back_populates="odeme_referanslar")

class POSHareketleri(Base):
    __tablename__ = "POS_Hareketleri"

    ID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Islem_Tarihi = Column(Date, nullable=False)
    Hesaba_Gecis = Column(Date, nullable=False)
    Para_Birimi = Column(String(5), nullable=False)
    Islem_Tutari = Column(DECIMAL(15, 2), nullable=False)
    Kesinti_Tutari = Column(DECIMAL(15, 2), default=0.00)
    Net_Tutar = Column(DECIMAL(15, 2), nullable=True)
    Kayit_Tarihi = Column(DateTime, default=func.now())
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=True)

    sube = relationship("Sube", back_populates="pos_hareketleri")

class YemekCeki(Base):
    __tablename__ = "Yemek_Ceki"

    ID = Column(Integer, primary_key=True, index=True, autoincrement=True)
    Kategori_ID = Column(Integer, ForeignKey("Kategori.Kategori_ID"), nullable=False)
    Tarih = Column(Date, nullable=False)
    Tutar = Column(DECIMAL(15, 2), nullable=False)
    Odeme_Tarih = Column(Date, nullable=False)
    Ilk_Tarih = Column(Date, nullable=False)
    Son_Tarih = Column(Date, nullable=False)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=False, default=1)
    Imaj = Column(LargeBinary, nullable=True)
    Imaj_Adi = Column(String(255), nullable=True)
    Kayit_Tarihi = Column(DateTime, default=func.now())

    kategori = relationship("Kategori")
    sube = relationship("Sube")

class CalisanTalep(Base):
    __tablename__ = "Calisan_Talep"

    Calisan_Talep_ID = Column(Integer, primary_key=True, autoincrement=True)
    Talep = Column(Enum('İşten Çıkış', 'İşe Giriş'), default='İşe Giriş')
    TC_No = Column(String(11), nullable=False)
    Adi = Column(String(50), nullable=False)
    Soyadi = Column(String(50), nullable=False)
    Ilk_Soyadi = Column(String(50), nullable=False)
    Hesap_No = Column(String(30), nullable=True)
    IBAN = Column(String(26), nullable=True)
    Ogrenim_Durumu = Column(String(26), nullable=True)
    Cinsiyet = Column(Enum('Erkek', 'Kadın'), default='Erkek')
    Gorevi = Column(String(26), nullable=True)
    Anne_Adi = Column(String(26), nullable=True)
    Baba_Adi = Column(String(26), nullable=True)
    Dogum_Yeri = Column(String(26), nullable=True)
    Dogum_Tarihi = Column(Date, nullable=True)
    Medeni_Hali = Column(Enum('Bekar', 'Evli'), default='Bekar')
    Cep_No = Column(String(16), nullable=True)
    Adres_Bilgileri = Column(String(50), nullable=True)
    Gelir_Vergisi_Matrahi = Column(DECIMAL(15, 2), nullable=True)
    SSK_Cikis_Nedeni = Column(String(50), nullable=True)
    Net_Maas = Column(DECIMAL(10, 2), nullable=True)
    Sigorta_Giris = Column(Date, nullable=True)
    Sigorta_Cikis = Column(Date, nullable=True)
    Is_Onay_Veren_Kullanici_ID = Column(Integer, ForeignKey("Kullanici.Kullanici_ID"), nullable=True)
    Is_Onay_Tarih = Column(DateTime, nullable=True)
    SSK_Onay_Veren_Kullanici_ID = Column(Integer, ForeignKey("Kullanici.Kullanici_ID"), nullable=True)
    SSK_Onay_Tarih = Column(DateTime, nullable=True)
    Sube_ID = Column(Integer, ForeignKey("Sube.Sube_ID"), nullable=False)
    Imaj_Adi = Column(String(255), nullable=True)
    Imaj = Column(LargeBinary, nullable=True)
    Kayit_Tarih = Column(DateTime, default=func.now())

    sube = relationship("Sube", back_populates="calisan_talepler")
    is_onay_veren_kullanici = relationship("Kullanici", foreign_keys=[Is_Onay_Veren_Kullanici_ID], back_populates="is_onay_veren_talepler")
    ssk_onay_veren_kullanici = relationship("Kullanici", foreign_keys=[SSK_Onay_Veren_Kullanici_ID], back_populates="ssk_onay_veren_talepler")

class Cari(Base):
    __tablename__ = "Cari"

    Cari_ID = Column(Integer, primary_key=True, index=True)
    Alici_Unvani = Column(String(200), nullable=False)
    e_Fatura_Kategori_ID = Column(Integer, nullable=True)
    Referans_ID = Column(Integer, ForeignKey("Odeme_Referans.Referans_ID"), nullable=True)
    Cari = Column(Boolean, default=True)
    Aciklama = Column(Text, nullable=True)
    Aktif_Pasif = Column(Boolean, default=True)
    Kayit_Tarihi = Column(DateTime, default=func.now(), onupdate=func.now())

class Mutabakat(Base):
    __tablename__ = "Mutabakat"

    Mutabakat_ID = Column(Integer, primary_key=True, index=True)
    Cari_ID = Column(Integer, ForeignKey("Cari.Cari_ID"), nullable=False)
    Mutabakat_Tarihi = Column(Date, nullable=False)
    Tutar = Column(DECIMAL(15, 2), nullable=False)

# Gumusbulut Projesi Teknik Dokümantasyonu

**Tarih:** 24 Eylül 2025

## 1. Proje Genel Bakış

Bu proje, dosya yapısına göre bir Python tabanlı arka uç (backend) uygulaması ile bir React/TypeScript tabanlı ön uç (frontend) uygulamasını içeren tam yığın (full-stack) bir yapıya sahip gibi görünmektedir. Ayrıca, çeşitli test betikleri ve yardımcı dosyalar da bulunmaktadır.

## 2. Proje Yapısı

Proje ana dizininde aşağıdaki önemli klasörler ve dosyalar bulunmaktadır:

-   `backend/`: Python ile geliştirilmiş arka uç uygulaması.
-   `CopyCat/`: React/TypeScript ile geliştirilmiş ön uç uygulaması.
-   `Test Scripts/`: Çeşitli test ve yardımcı betikler.
-   `package.json`, `package-lock.json`: Ön uç bağımlılıkları ve proje bilgileri.
-   `run_server.py`: Arka uç sunucusunu çalıştırmak için kullanılan betik.
-   `update_kategoriler.py`: Kategori güncellemeleriyle ilgili bir betik.
-   `.git/`: Git versiyon kontrol sistemi dosyaları.
-   `.qoder/`: Gemini CLI ile ilgili dosyalar.

---

## 3. Backend Uygulaması (`backend/`)

`backend` dizini, projenin sunucu tarafı mantığını ve API hizmetlerini barındırır. Ana bileşenleri şunlardır:

-   **`api/`**: API uç noktalarını tanımlayan modüller. Genellikle versiyonlama (`v1/`) içerir.
-   **`core/`**: Uygulamanın temel yapılandırması, güvenlik ayarları ve yardımcı fonksiyonları.
-   **`db/`**: Veritabanı bağlantısı, modeller (ORM) ve CRUD (Oluşturma, Okuma, Güncelleme, Silme) işlemleri.
-   **`schemas/`**: Veri doğrulama ve serileştirme için kullanılan Pydantic modelleri veya benzeri şemalar.
-   **`tests/`**: Arka uç uygulaması için yazılmış birim ve entegrasyon testleri.
-   **`venv/`**: Python sanal ortamı, projenin bağımlılıklarını izole eder.
-   **`main.py`**: Uygulamanın ana giriş noktası, FastAPI uygulamasını başlatır.
-   **`requirements.txt`**: Python bağımlılıklarını listeler.
-   **`gunicorn_config.py`**: Gunicorn sunucusu için yapılandırma dosyası.
-   Diğer `.py` dosyaları: Çeşitli yardımcı betikler veya tekil işlevler (örneğin, `add_b2b_permission.py`, `check_efatura_referans.py`).

---

## 3.1. Core Modülü (`backend/core/`)

Bu modül, uygulamanın temel yapılandırma ve güvenlik ayarlarını içerir.

-   **`config.py`**:
    -   Ortam değişkenlerini (`.env.local` dosyasından) yükler.
    -   Proje adı (`PROJECT_NAME`), sürümü (`PROJECT_VERSION`) gibi temel proje bilgilerini tanımlar.
    -   JWT için `SECRET_KEY` ve `ACCESS_TOKEN_EXPIRE_MINUTES` gibi güvenlik ayarlarını barındırır.
    -   Veritabanı bağlantı URL'sini (MySQL için) ortam değişkenlerinden oluşturur.

-   **`security.py`**:
    -   Kullanıcı kimlik doğrulama ve yetkilendirme için gerekli güvenlik fonksiyonlarını sağlar.
    -   Parola hash'leme için `passlib` kütüphanesini (`bcrypt` şeması ile) kullanır.
    -   JSON Web Token (JWT) oluşturma ve doğrulama için `jose` kütüphanesini kullanır.
    -   `create_access_token`: Erişim token'ları oluşturur.
    -   `verify_password`: Düz metin parolayı hash'lenmiş parola ile karşılaştırır.
    -   `get_password_hash`: Bir parolanın hash'ini oluşturur.

---

## 3.2. Veritabanı Modülü (`backend/db/`)

Bu modül, uygulamanın veritabanı bağlantısını, ORM modellerini ve temel veritabanı işlemlerini yönetir.

-   **`database.py`**:
    -   SQLAlchemy ORM kütüphanesini kullanır.
    -   `core.config`'den alınan `DATABASE_URL` ile MySQL veritabanına bağlantı kurar.
    -   Veritabanı oturumları için `SessionLocal`'ı yapılandırır.
    -   Deklaratif model tanımları için `declarative_base()` kullanır.
    -   FastAPI bağımlılık enjeksiyonu için `get_db()` fonksiyonunu sağlar.

-   **`models.py`**:
    -   Uygulamanın tüm veritabanı şemasını temsil eden SQLAlchemy modellerini tanımlar.
    -   **Detaylı Veritabanı Şeması:**

### Tablo: `Sube`

-   **Açıklama**: Şubeleri temsil eder.
-   **Sütunlar**:
    -   `Sube_ID`: `Integer`, Primary Key, Index
    -   `Sube_Adi`: `String(100)`, Not Null
    -   `Aciklama`: `Text`, Nullable
    -   `Aktif_Pasif`: `Boolean`, Default: `True`
-   **İlişkiler**:
    -   `calisanlar`: `Calisan` ile bire çok ilişki
    -   `kullanici_rolleri`: `KullaniciRol` ile bire çok ilişki
    -   `e_faturalar`: `EFatura` ile bire çok ilişki
    -   `b2b_ekstreler`: `B2BEkstre` ile bire çok ilişki
    -   `diger_harcamalar`: `DigerHarcama` ile bire çok ilişki
    -   `gelirler`: `Gelir` ile bire çok ilişki
    -   `gelir_ekstralar`: `GelirEkstra` ile bire çok ilişki
    -   `stok_sayimlar`: `StokSayim` ile bire çok ilişki
    -   `stok_fiyatlar`: `StokFiyat` ile bire çok ilişki
    -   `puantajlar`: `Puantaj` ile bire çok ilişki
    -   `avans_istekler`: `AvansIstek` ile bire çok ilişki
    -   `nakitler`: `Nakit` ile bire çok ilişki
    -   `odemeler`: `Odeme` ile bire çok ilişki
    -   `pos_hareketleri`: `POSHareketleri` ile bire çok ilişki

### Tablo: `Kullanici`

-   **Açıklama**: Kullanıcı bilgilerini saklar.
-   **Sütunlar**:
    -   `Kullanici_ID`: `Integer`, Primary Key, Index
    -   `Adi_Soyadi`: `String(100)`, Not Null
    -   `Kullanici_Adi`: `String(50)`, Not Null, Unique
    -   `Password`: `String(255)`, Not Null (Hashlenmiş parola)
    -   `Email`: `String(100)`, Nullable
    -   `Expire_Date`: `Date`, Nullable
    -   `Aktif_Pasif`: `Boolean`, Default: `True`
-   **İlişkiler**:
    -   `kullanici_rolleri`: `KullaniciRol` ile bire çok ilişki

### Tablo: `Rol`

-   **Açıklama**: Kullanıcı rollerini tanımlar.
-   **Sütunlar**:
    -   `Rol_ID`: `Integer`, Primary Key, Index
    -   `Rol_Adi`: `String(50)`, Not Null, Unique
    -   `Aciklama`: `Text`, Nullable
    -   `Aktif_Pasif`: `Boolean`, Default: `True`
-   **İlişkiler**:
    -   `kullanici_rolleri`: `KullaniciRol` ile bire çok ilişki
    -   `rol_yetkileri`: `RolYetki` ile bire çok ilişki

### Tablo: `Yetki`

-   **Açıklama**: Uygulama yetkilerini tanımlar.
-   **Sütunlar**:
    -   `Yetki_ID`: `Integer`, Primary Key, Index
    -   `Yetki_Adi`: `String(100)`, Not Null, Unique
    -   `Aciklama`: `Text`, Nullable
    -   `Tip`: `String(50)`, Nullable (örn: 'Ekran', 'Islem')
    -   `Aktif_Pasif`: `Boolean`, Default: `True`
-   **İlişkiler**:
    -   `rol_yetkileri`: `RolYetki` ile bire çok ilişki

### Tablo: `Kullanici_Rol`

-   **Açıklama**: Kullanıcıların hangi şubede hangi role sahip olduğunu belirler.
-   **Sütunlar**:
    -   `Kullanici_ID`: `Integer`, Foreign Key (`Kullanici.Kullanici_ID`), Primary Key
    -   `Rol_ID`: `Integer`, Foreign Key (`Rol.Rol_ID`), Primary Key
    -   `Sube_ID`: `Integer`, Foreign Key (`Sube.Sube_ID`), Primary Key
    -   `Aktif_Pasif`: `Boolean`, Default: `True`
-   **İlişkiler**:
    -   `kullanici`: `Kullanici` ile bire bir ilişki
    -   `rol`: `Rol` ile bire bir ilişki
    -   `sube`: `Sube` ile bire bir ilişki

### Tablo: `Rol_Yetki`

-   **Açıklama**: Rollerin sahip olduğu yetkileri belirler.
-   **Sütunlar**:
    -   `Rol_ID`: `Integer`, Foreign Key (`Rol.Rol_ID`), Primary Key
    -   `Yetki_ID`: `Integer`, Foreign Key (`Yetki.Yetki_ID`), Primary Key
    -   `Aktif_Pasif`: `Boolean`, Default: `True`
-   **İlişkiler**:
    -   `rol`: `Rol` ile bire bir ilişki
    -   `yetki`: `Yetki` ile bire bir ilişki

### Tablo: `Deger`

-   **Açıklama**: Genel değerleri ve geçerlilik tarihlerini saklar.
-   **Sütunlar**:
    -   `Deger_ID`: `Integer`, Primary Key, Index
    -   `Deger_Adi`: `String(100)`, Not Null
    -   `Gecerli_Baslangic_Tarih`: `Date`, Not Null
    -   `Gecerli_Bitis_Tarih`: `Date`, Not Null, Default: "2100-01-01"
    -   `Deger_Aciklama`: `Text`, Nullable
    -   `Deger`: `DECIMAL(15, 2)`, Not Null

### Tablo: `UstKategori`

-   **Açıklama**: Üst kategorileri tanımlar.
-   **Sütunlar**:
    -   `UstKategori_ID`: `Integer`, Primary Key, Index
    -   `UstKategori_Adi`: `String(100)`, Not Null, Unique
    -   `Aktif_Pasif`: `Boolean`, Nullable, Default: `True`
-   **İlişkiler**:
    -   `kategoriler`: `Kategori` ile bire çok ilişki

### Tablo: `Kategori`

-   **Açıklama**: Kategorileri tanımlar.
-   **Sütunlar**:
    -   `Kategori_ID`: `Integer`, Primary Key, Index
    -   `Kategori_Adi`: `String(100)`, Not Null
    -   `Ust_Kategori_ID`: `Integer`, Foreign Key (`UstKategori.UstKategori_ID`), Nullable
    -   `Tip`: `Enum('Gelir', 'Gider', 'Bilgi', 'Ödeme', 'Giden Fatura')`, Not Null
    -   `Aktif_Pasif`: `Boolean`, Default: `True`
    -   `Gizli`: `Boolean`, Default: `False`
-   **İlişkiler**:
    -   `ust_kategori`: `UstKategori` ile bire bir ilişki
    -   `e_faturalar`: `EFatura` ile bire çok ilişki
    -   `b2b_ekstreler`: `B2BEkstre` ile bire çok ilişki
    -   `diger_harcamalar`: `DigerHarcama` ile bire çok ilişki
    -   `gelirler`: `Gelir` ile bire çok ilişki
    -   `odemeler`: `Odeme` ile bire çok ilişki
    -   `odeme_referanslar`: `OdemeReferans` ile bire çok ilişki

### Tablo: `e_Fatura`

-   **Açıklama**: E-fatura kayıtlarını saklar.
-   **Sütunlar**:
    -   `Fatura_ID`: `Integer`, Primary Key, Index
    -   `Fatura_Tarihi`: `Date`, Not Null
    -   `Fatura_Numarasi`: `String(50)`, Not Null, Unique
    -   `Alici_Unvani`: `String(200)`, Not Null
    -   `Alici_VKN_TCKN`: `String(20)`, Nullable
    -   `Tutar`: `DECIMAL(15, 2)`, Not Null
    -   `Kategori_ID`: `Integer`, Foreign Key (`Kategori.Kategori_ID`), Nullable
    -   `Aciklama`: `Text`, Nullable
    -   `Donem`: `Integer`, Not Null (YYMM formatında saklanır)
    -   `Ozel`: `Boolean`, Default: `False`
    -   `Gunluk_Harcama`: `Boolean`, Default: `False`
    -   `Giden_Fatura`: `Boolean`, Default: `False`
    -   `Sube_ID`: `Integer`, Foreign Key (`Sube.Sube_ID`), Not Null
    -   `Kayit_Tarihi`: `DateTime`, Default: `func.now()`
-   **İlişkiler**:
    -   `kategori`: `Kategori` ile bire bir ilişki
    -   `sube`: `Sube` ile bire bir ilişki

### Tablo: `B2B_Ekstre`

-   **Açıklama**: B2B ekstre kayıtlarını saklar.
-   **Sütunlar**:
    -   `Ekstre_ID`: `Integer`, Primary Key, Index
    -   `Tarih`: `Date`, Not Null
    -   `Fis_No`: `String(50)`, Not Null
    -   `Fis_Turu`: `String(50)`, Nullable
    -   `Aciklama`: `Text`, Nullable
    -   `Borc`: `DECIMAL(15, 2)`, Default: `0.00`
    -   `Alacak`: `DECIMAL(15, 2)`, Default: `0.00`
    -   `Toplam_Bakiye`: `DECIMAL(15, 2)`, Nullable
    -   `Fatura_No`: `String(50)`, Nullable
    -   `Fatura_Metni`: `Text`, Nullable
    -   `Donem`: `Integer`, Not Null (YYMM formatında saklanır)
    -   `Kategori_ID`: `Integer`, Foreign Key (`Kategori.Kategori_ID`), Nullable
    -   `Sube_ID`: `Integer`, Foreign Key (`Sube.Sube_ID`), Not Null
    -   `Kayit_Tarihi`: `DateTime`, Default: `func.now()`
-   **İlişkiler**:
    -   `kategori`: `Kategori` ile bire bir ilişki
    -   `sube`: `Sube` ile bire bir ilişki

### Tablo: `Diger_Harcama`

-   **Açıklama**: Diğer harcama kayıtlarını saklar.
-   **Sütunlar**:
    -   `Harcama_ID`: `Integer`, Primary Key, Index
    -   `Alici_Adi`: `String(200)`, Not Null
    -   `Belge_Numarasi`: `String(50)`, Nullable
    -   `Belge_Tarihi`: `Date`, Not Null
    -   `Donem`: `Integer`, Not Null (YYMM formatında saklanır)
    -   `Tutar`: `DECIMAL(15, 2)`, Not Null
    -   `Kategori_ID`: `Integer`, Foreign Key (`Kategori.Kategori_ID`), Not Null
    -   `Harcama_Tipi`: `Enum('Nakit', 'Banka Ödeme', 'Kredi Kartı')`, Not Null
    -   `Gunluk_Harcama`: `Boolean`, Default: `False`
    -   `Sube_ID`: `Integer`, Foreign Key (`Sube.Sube_ID`), Not Null
    -   `Açıklama`: `String(45)`, Nullable
    -   `Kayit_Tarihi`: `DateTime`, Default: `func.now()`
    -   `Imaj`: `LargeBinary`, Nullable
    -   `Imaj_Adi`: `String(255)`, Nullable
-   **İlişkiler**:
    -   `kategori`: `Kategori` ile bire bir ilişki
    -   `sube`: `Sube` ile bire bir ilişki

### Tablo: `Gelir`

-   **Açıklama**: Gelir kayıtlarını saklar.
-   **Sütunlar**:
    -   `Gelir_ID`: `Integer`, Primary Key, Index
    -   `Sube_ID`: `Integer`, Foreign Key (`Sube.Sube_ID`), Not Null
    -   `Tarih`: `Date`, Not Null
    -   `Kategori_ID`: `Integer`, Foreign Key (`Kategori.Kategori_ID`), Not Null
    -   `Tutar`: `DECIMAL(15, 2)`, Not Null
    -   `Kayit_Tarihi`: `DateTime`, Default: `func.now()`
-   **İlişkiler**:
    -   `sube`: `Sube` ile bire bir ilişki
    -   `kategori`: `Kategori` ile bire bir ilişki

### Tablo: `GelirEkstra`

-   **Açıklama**: Ek gelir kayıtlarını saklar.
-   **Sütunlar**:
    -   `GelirEkstra_ID`: `Integer`, Primary Key, Index
    -   `Sube_ID`: `Integer`, Foreign Key (`Sube.Sube_ID`), Not Null
    -   `Tarih`: `Date`, Not Null
    -   `RobotPos_Tutar`: `DECIMAL(15, 2)`, Not Null
    -   `ZRapor_Tutar`: `DECIMAL(15, 2)`, Not Null, Default: `0.00`
    -   `Tabak_Sayisi`: `Integer`, Not Null, Default: `0`
    -   `Kayit_Tarihi`: `DateTime`, Default: `func.now()`
-   **İlişkiler**:
    -   `sube`: `Sube` ile bire bir ilişki

### Tablo: `Stok`

-   **Açıklama**: Stok ürünlerini tanımlar.
-   **Sütunlar**:
    -   `Stok_ID`: `Integer`, Primary Key, Index
    -   `Urun_Grubu`: `String(100)`, Not Null
    -   `Malzeme_Kodu`: `String(50)`, Not Null, Unique
    -   `Malzeme_Aciklamasi`: `Text`, Not Null
    -   `Birimi`: `String(20)`, Not Null
    -   `Sinif`: `String(50)`, Nullable
    -   `Aktif_Pasif`: `Boolean`, Default: `True`
-   **İlişkiler**:
    -   `stok_fiyatlar`: `StokFiyat` ile bire çok ilişki
    -   `stok_sayimlar`: `StokSayim` ile bire çok ilişki

### Tablo: `Stok_Fiyat`

-   **Açıklama**: Stok ürünlerinin fiyat bilgilerini saklar.
-   **Sütunlar**:
    -   `Fiyat_ID`: `Integer`, Primary Key, Index
    -   `Malzeme_Kodu`: `String(50)`, Foreign Key (`Stok.Malzeme_Kodu`), Not Null
    -   `Gecerlilik_Baslangic_Tarih`: `Date`, Not Null
    -   `Fiyat`: `DECIMAL(10, 2)`, Not Null
    -   `Sube_ID`: `Integer`, Foreign Key (`Sube.Sube_ID`), Not Null
    -   `Aktif_Pasif`: `Boolean`, Default: `True`
-   **İlişkiler**:
    -   `stok`: `Stok` ile bire bir ilişki
    -   `sube`: `Sube` ile bire bir ilişki

### Tablo: `Stok_Sayim`

-   **Açıklama**: Stok sayım kayıtlarını saklar.
-   **Sütunlar**:
    -   `Sayim_ID`: `Integer`, Primary Key, Index
    -   `Malzeme_Kodu`: `String(50)`, Foreign Key (`Stok.Malzeme_Kodu`), Not Null
    -   `Donem`: `Integer`, Not Null (YYMM formatında saklanır)
    -   `Miktar`: `DECIMAL(10, 0)`, Not Null
    -   `Sube_ID`: `Integer`, Foreign Key (`Sube.Sube_ID`), Not Null
    -   `Kayit_Tarihi`: `DateTime`, Default: `func.now()`
-   **İlişkiler**:
    -   `stok`: `Stok` ile bire bir ilişki
    -   `sube`: `Sube` ile bire bir ilişki

### Tablo: `Calisan`

-   **Açıklama**: Çalışan bilgilerini saklar.
-   **Sütunlar**:
    -   `TC_No`: `String(11)`, Primary Key, Index
    -   `Adi`: `String(50)`, Not Null
    -   `Soyadi`: `String(50)`, Not Null
    -   `Hesap_No`: `String(30)`, Nullable
    -   `IBAN`: `String(26)`, Nullable
    -   `Net_Maas`: `DECIMAL(10, 2)`, Nullable
    -   `Sigorta_Giris`: `Date`, Nullable
    -   `Sigorta_Cikis`: `Date`, Nullable
    -   `Aktif_Pasif`: `Boolean`, Default: `True`
    -   `Sube_ID`: `Integer`, Foreign Key (`Sube.Sube_ID`), Not Null
-   **İlişkiler**:
    -   `sube`: `Sube` ile bire bir ilişki
    -   `puantajlar`: `Puantaj` ile bire çok ilişki
    -   `avans_istekler`: `AvansIstek` ile bire çok ilişki

### Tablo: `Puantaj_Secimi`

-   **Açıklama**: Puantaj seçim seçeneklerini tanımlar.
-   **Sütunlar**:
    -   `Secim_ID`: `Integer`, Primary Key, Index
    -   `Secim`: `String(100)`, Not Null, Unique
    -   `Degeri`: `DECIMAL(3, 1)`, Not Null
    -   `Renk_Kodu`: `String(15)`, Not Null
    -   `Aktif_Pasif`: `Boolean`, Default: `True`
-   **İlişkiler**:
    -   `puantajlar`: `Puantaj` ile bire çok ilişki

### Tablo: `Puantaj`

-   **Açıklama**: Çalışan puantaj kayıtlarını saklar.
-   **Sütunlar**:
    -   `Puantaj_ID`: `Integer`, Primary Key, Index
    -   `Tarih`: `Date`, Not Null
    -   `TC_No`: `String(11)`, Foreign Key (`Calisan.TC_No`), Not Null
    -   `Secim_ID`: `Integer`, Foreign Key (`Puantaj_Secimi.Secim_ID`), Not Null
    -   `Sube_ID`: `Integer`, Foreign Key (`Sube.Sube_ID`), Not Null
    -   `Kayit_Tarihi`: `DateTime`, Default: `func.now()`
-   **İlişkiler**:
    -   `calisan`: `Calisan` ile bire bir ilişki
    -   `secim`: `PuantajSecimi` ile bire bir ilişki
    -   `sube`: `Sube` ile bire bir ilişki

### Tablo: `Avans_Istek`

-   **Açıklama**: Çalışan avans isteklerini saklar.
-   **Sütunlar**:
    -   `Avans_ID`: `Integer`, Primary Key, Index
    -   `Donem`: `Integer`, Not Null (YYMM formatında saklanır)
    -   `TC_No`: `String(11)`, Foreign Key (`Calisan.TC_No`), Not Null
    -   `Tutar`: `DECIMAL(10, 2)`, Not Null
    -   `Aciklama`: `Text`, Nullable
    -   `Sube_ID`: `Integer`, Foreign Key (`Sube.Sube_ID`), Not Null
    -   `Kayit_Tarihi`: `DateTime`, Default: `func.now()`
-   **İlişkiler**:
    -   `calisan`: `Calisan` ile bire bir ilişki
    -   `sube`: `Sube` ile bire bir ilişki

### Tablo: `e_Fatura_Referans`

-   **Açıklama**: E-fatura referanslarını saklar.
-   **Sütunlar**:
    -   `Alici_Unvani`: `String(200)`, Primary Key, Index
    -   `Referans_Kodu`: `String(50)`, Not Null
    -   `Kategori_ID`: `Integer`, Foreign Key (`Kategori.Kategori_ID`), Nullable
    -   `Aciklama`: `Text`, Nullable
    -   `Aktif_Pasif`: `Boolean`, Default: `True`
    -   `Kayit_Tarihi`: `DateTime`, Default: `func.now()`
-   **İlişkiler**:
    -   `kategori`: `Kategori` ile bire bir ilişki

### Tablo: `Nakit`

-   **Açıklama**: Nakit işlemlerini saklar.
-   **Sütunlar**:
    -   `Nakit_ID`: `Integer`, Primary Key, Index
    -   `Tarih`: `Date`, Not Null
    -   `Kayit_Tarih`: `DateTime`, Server Default: `func.now()`
    -   `Tutar`: `DECIMAL(15, 2)`, Not Null
    -   `Tip`: `String(50)`, Default: 'Bankaya Yatan'
    -   `Donem`: `Integer`, Not Null (YYMM formatında saklanır)
    -   `Sube_ID`: `Integer`, Foreign Key (`Sube.Sube_ID`), Not Null
    -   `Imaj_Adı`: `String(255)`, Nullable
    -   `Imaj`: `LargeBinary`, Nullable
-   **İlişkiler**:
    -   `sube`: `Sube` ile bire bir ilişki

### Tablo: `Odeme`

-   **Açıklama**: Ödeme kayıtlarını saklar.
-   **Sütunlar**:
    -   `Odeme_ID`: `Integer`, Primary Key, Index
    -   `Tip`: `String(50)`, Not Null
    -   `Hesap_Adi`: `String(50)`, Not Null
    -   `Tarih`: `Date`, Not Null
    -   `Aciklama`: `String(200)`, Not Null
    -   `Tutar`: `DECIMAL(15, 2)`, Not Null, Default: `0.00`
    -   `Kategori_ID`: `Integer`, Foreign Key (`Kategori.Kategori_ID`), Nullable
    -   `Donem`: `Integer`, Nullable (YYMM formatında saklanır)
    -   `Sube_ID`: `Integer`, Foreign Key (`Sube.Sube_ID`), Default: `1`
    -   `Kayit_Tarihi`: `DateTime`, Default: `func.now()`
-   **İlişkiler**:
    -   `kategori`: `Kategori` ile bire bir ilişki
    -   `sube`: `Sube` ile bire bir ilişki

### Tablo: `Odeme_Referans`

-   **Açıklama**: Ödeme referanslarını saklar.
-   **Sütunlar**:
    -   `Referans_ID`: `Integer`, Primary Key, Index
    -   `Referans_Metin`: `String(50)`, Not Null, Unique
    -   `Kategori_ID`: `Integer`, Foreign Key (`Kategori.Kategori_ID`), Not Null
    -   `Aktif_Pasif`: `Boolean`, Default: `True`
    -   `Kayit_Tarihi`: `DateTime`, Default: `func.now()`
-   **İlişkiler**:
    -   `kategori`: `Kategori` ile bire bir ilişki

### Tablo: `POS_Hareketleri`

-   **Açıklama**: POS (Point of Sale) hareketlerini saklar.
-   **Sütunlar**:
    -   `ID`: `Integer`, Primary Key, Index, Auto Increment
    -   `Islem_Tarihi`: `Date`, Not Null
    -   `Hesaba_Gecis`: `Date`, Not Null
    -   `Para_Birimi`: `String(5)`, Not Null
    -   `Islem_Tutari`: `DECIMAL(15, 2)`, Not Null
    -   `Kesinti_Tutari`: `DECIMAL(15, 2)`, Default: `0.00`
    -   `Net_Tutar`: `DECIMAL(15, 2)`, Nullable
    -   `Kayit_Tarihi`: `DateTime`, Default: `func.now()`
    -   `Sube_ID`: `Integer`, Foreign Key (`Sube.Sube_ID`), Nullable
-   **İlişkiler**:
    -   `sube`: `Sube` ile bire bir ilişki

### Tablo: `Yemek_Ceki`

-   **Açıklama**: Yemek çeki kayıtlarını saklar.
-   **Sütunlar**:
    -   `ID`: `Integer`, Primary Key, Index, Auto Increment
    -   `Kategori_ID`: `Integer`, Foreign Key (`Kategori.Kategori_ID`), Not Null
    -   `Tarih`: `Date`, Not Null
    -   `Tutar`: `DECIMAL(15, 2)`, Not Null
    -   `Odeme_Tarih`: `Date`, Not Null
    -   `Ilk_Tarih`: `Date`, Not Null
    -   `Son_Tarih`: `Date`, Not Null
    -   `Sube_ID`: `Integer`, Foreign Key (`Sube.Sube_ID`), Not Null, Default: `1`
    -   `Imaj`: `LargeBinary`, Nullable
    -   `Imaj_Adi`: `String(255)`, Nullable
    -   `Kayit_Tarihi`: `DateTime`, Default: `func.now()`
-   **İlişkiler**:
    -   `kategori`: `Kategori` ile bire bir ilişki
    -   `sube`: `Sube` ile bire bir ilişki

---

## 3.3. Şema Modülü (`backend/schemas/`)

Bu modül, FastAPI uygulaması için veri doğrulama, serileştirme ve API istek/yanıt gövdelerinin tanımlanması amacıyla Pydantic modellerini içerir. Her bir `.py` dosyası genellikle `db/models.py` içindeki ilgili bir veritabanı modeli veya belirli bir API işlemi için veri yapısını temsil eder.

-   **Örnek Şemalar:**
    -   `user.py`: Kullanıcı verileri için şemalar (oluşturma, güncelleme, okuma).
    -   `token.py`: Kimlik doğrulama token'ları için şemalar.
    -   `sube.py`: Şube verileri için şemalar.
    -   `e_fatura.py`: E-fatura verileri için şemalar.
    -   `pos_hareketleri.py`: POS hareketleri verileri için şemalar.

Bu şemalar, API'nin beklediği ve döndürdüğü veri formatlarını açıkça tanımlayarak hem istemci hem de sunucu tarafında tutarlılık ve hata kontrolü sağlar.

---

## 3.4. API Modülü (`backend/api/`)

Bu modül, FastAPI uygulamasının HTTP uç noktalarını ve bu uç noktaların iş mantığını tanımlar. API, `v1` alt dizini ile versiyonlanmıştır, bu da API uyumluluğunu korumak için iyi bir yaklaşımdır.

-   **`v1/`**:
    -   **`deps.py`**: API uç noktaları için bağımlılıkları (örneğin, kimlik doğrulama, veritabanı oturumları, ortak yardımcı fonksiyonlar) yönetir.
    -   **`endpoints/`**: Gerçek API rota tanımlarını içeren dosyaları barındırır. Her dosya genellikle belirli bir kaynak veya işlevsel alanla ilgilidir.
        -   **Örnek Uç Nokta Dosyaları:**
            -   `users.py`: Kullanıcı yönetimi ile ilgili API uç noktaları.
            -   `e_fatura.py`: E-fatura işlemleri için API uç noktaları.
            -   `pos_hareketleri.py`: POS hareketleri ile ilgili API uç noktaları.
            -   `token.py`: Kimlik doğrulama ve token işlemleri.

Bu yapı, API'nin modüler ve düzenli bir şekilde geliştirilmesini sağlar, her bir kaynak için ayrı bir dosya veya modül bulunur.

---

## 3.5. Testler (`backend/tests/`)

Bu dizin, arka uç uygulaması için yazılmış birim ve entegrasyon testlerini içerir. Projenin doğru çalıştığını ve beklenen davranışları sergilediğini doğrulamak için kullanılır.

## 3.6. Dokümantasyon (`backend/docs/`)

Bu dizin, arka uç API'si ile ilgili ek dokümantasyonları barındırır. Örneğin, `pos_hareketleri_upload_api.md` gibi dosyalar belirli API uç noktalarının kullanımını veya detaylarını açıklayabilir.

---

## 4. Frontend Uygulaması (`CopyCat/`)

`CopyCat` dizini, projenin kullanıcı arayüzünü oluşturan React/TypeScript tabanlı ön uç uygulamasını barındırır. Modern web geliştirme araçları ve kütüphaneleri kullanılmıştır.

-   **Teknolojiler:**
    -   **React**: Kullanıcı arayüzü oluşturmak için ana kütüphane.
    -   **TypeScript**: Kod kalitesini ve geliştirici deneyimini artıran tip güvenliği sağlar.
    -   **Vite**: Hızlı geliştirme sunucusu ve derleme aracı.
    -   **Tailwind CSS**: Hızlı ve esnek UI geliştirme için bir CSS framework'ü.

-   **Ana Bileşenler ve Dizinler:**
    -   **`App.tsx`, `index.tsx`**: Uygulamanın ana giriş noktaları ve kök bileşenleri.
    -   **`pages/`**: Uygulamanın farklı sayfalarını temsil eden React bileşenleri (örneğin, `B2BEkstreRaporu.tsx`, `POSHareketleriYukleme.tsx`).
    -   **`components/`**: Uygulama genelinde yeniden kullanılabilir UI bileşenleri (örneğin, `ExpandableBankaHesabiRow.tsx`).
    -   **`contexts/`**: React Context API kullanarak global durum yönetimi (örneğin, `ErrorContext.tsx`, `ToastContext.tsx`).
    -   **`utils/`**: Yardımcı fonksiyonlar ve genel amaçlı modüller.
    -   **`styles/`**: Tailwind CSS yapılandırması ve diğer stil dosyaları.
    -   **`public/`**: Statik varlıklar (resimler, ikonlar vb.).
    -   **`package.json`**: Proje bağımlılıkları ve betikleri.
    -   **`tsconfig.json`**: TypeScript derleyici ayarları.
    -   **`vite.config.ts`**: Vite derleme aracı yapılandırması.

Bu yapı, ön uç uygulamasının modüler, bakımı kolay ve ölçeklenebilir olmasını sağlar.

---

## 4.1. Ekran Detayları (`CopyCat/pages/`)

Bu bölüm, ön uç uygulamasındaki her bir ekranın amacını, temel özelliklerini ve işlevselliğini detaylandırmaktadır.

Bu bölüm, ön uç uygulamasındaki tüm ekranların amacını, temel özelliklerini ve işlevselliğini detaylandırmaktadır.

#### Yönetim ve Ayarlar Ekranları

-   **`LoginPage`**: Kullanıcıların sisteme kullanıcı adı ve şifre ile giriş yaptığı ekran.
-   **`SubePage`**: Şube bilgilerinin yönetildiği (ekleme, düzenleme, aktif/pasif yapma) ekran.
-   **`UsersPage`**: Kullanıcı hesaplarının yönetildiği (ekleme, düzenleme, şifre sıfırlama, aktif/pasif yapma) ekran.
-   **`RolesPage`**: Kullanıcı rollerinin (örn: Admin, Kullanıcı) tanımlandığı ve yönetildiği ekran.
-   **`PermissionsPage`**: Sistemdeki yetkilerin (örn: Fatura Yükleme, Rapor Görüntüleme) tanımlandığı ve yönetildiği ekran.
-   **`UserRoleAssignmentPage`**: Kullanıcılara, belirli şubeler için rollerin atandığı veya kaldırıldığı yetkilendirme ekranı.
-   **`RolePermissionAssignmentPage`**: Rollere, sistemdeki yetkilerin atandığı veya kaldırıldığı yetkilendirme ekranı.
-   **`DegerlerPage`**: Sistemde kullanılacak genel geçerli sayısal değerlerin (örn: Asgari Ücret) tarih aralığı ile tanımlandığı ekran.
-   **`UstKategorilerPage`**: Gelir ve gider kalemlerinin gruplandırıldığı ana kategorilerin (örn: Satış Gelirleri, Personel Giderleri) yönetildiği ekran.
-   **`KategorilerPage`**: Üst kategorilere bağlı alt kategorilerin (örn: Restoran Ciro, Maaş Ödemesi) tanımlandığı ve yönetildiği ekran.
-   **`EFaturaReferansPage`**: E-fatura yükleme işleminde, fatura alıcısına göre otomatik kategori ataması yapmak için referansların tanımlandığı ekran.
-   **`OdemeReferansPage`**: Ödeme yükleme işleminde, ödeme açıklamasına göre otomatik kategori ataması yapmak için referansların tanımlandığı ekran.

#### Veri Giriş ve Yükleme Ekranları

-   **`InvoiceUploadPage` (e-Fatura Yükleme)**: E-faturaların bir Excel dosyasından toplu olarak sisteme yüklendiği ekran.
-   **`B2BUploadPage` (B2B Ekstre Yükleme)**: B2B (işletmeden işletmeye) ekstrelerinin Excel veya CSV formatında sisteme yüklendiği ekran.
-   **`OdemeYuklemePage`**: Banka ekstrelerinden alınan ödeme kayıtlarının CSV veya Excel formatında sisteme yüklendiği ekran.
-   **`POSHareketleriYuklemePage`**: Bankalardan alınan POS hareket ekstrelerinin Excel formatında sisteme yüklendiği ekran.
-   **`DigerHarcamalarPage`**: Fatura niteliğinde olmayan diğer harcamaların (fiş, makbuz vb.) manuel olarak girildiği ve resimlerinin yüklendiği ekran.
-   **`GelirPage` (Gelir Girişi)**: Günlük gelirlerin (RobotPos, Z Raporu ve diğer gelir kalemleri) manuel olarak girildiği ve düzenlendiği ekran.
-   **`StokSayimPage`**: Belirli bir dönem için stok sayım sonuçlarının (miktar) girildiği ve güncellendiği ekran.
-   **`PuantajPage` (Puantaj Girişi)**: Çalışanların aylık puantajlarının (çalışma günü, izin, rapor vb.) takvim üzerinden girildiği ve yönetildiği ekran.
-   **`AvansPage` (Avans Talebi)**: Çalışanlar için avans taleplerinin oluşturulduğu ve yönetildiği ekran.
-   **`NakitPage` (Nakit Girişi)**: Kasaya giren veya kasadan çıkan nakit hareketlerinin (örn: bankaya yatırılan) dekont resmi ile birlikte kaydedildiği ekran.
-   **`YemekCekiPage`**: Yemek çeki firmalarıyla yapılan anlaşmaların ve ilgili dekontların yönetildiği ekran.
-   **`TabakSayisiYuklemePage`**: Günlük satılan tabak sayısı verisinin Excel dosyasından sisteme yüklendiği ekran.

#### Kategori Atama Ekranları

-   **`InvoiceCategoryAssignmentPage` (Fatura Kategori Atama)**: Sisteme yüklenmiş ancak kategorisi olmayan e-faturalara manuel olarak kategori ataması yapılan ekran.
-   **`B2BCategoryAssignmentPage` (B2B Kategori Atama)**: Kategorisiz B2B ekstre kayıtlarına manuel olarak kategori ataması yapılan ekran.
-   **`OdemeKategoriAtamaPage`**: Kategorisiz ödeme kayıtlarına manuel olarak kategori ataması yapılan ekran.

#### Rapor ve Dashboard Ekranları

-   **`DashboardPage`**: Seçilen dönem için gelir, gider ve özet verilerini tek bir ekranda gösteren ana gösterge paneli.
-   **`B2BEkstreRaporu.tsx`**: B2B ekstrelerini, seçilen dönem ve kategorilere göre gruplandırarak detaylı bir rapor sunar.
-   **`BayiKarlilikRaporu.tsx`**: Seçilen bir yıl için aylık bazda detaylı bir bayi karlılık analizi sunar.
-   **`FaturaBolmeYonetimi.tsx`**: Yüksek meblağlı faturaların alt kategorilere nasıl bölündüğünü gösteren ve yöneten ekran.
-   **`FaturaDigerHarcamaRaporu.tsx`**: E-faturalar ve diğer harcamaları birleştirerek bütünsel bir gider raporu sunar.
-   **`FaturaRaporu.tsx`**: Sadece e-fatura kayıtlarını içeren detaylı bir rapor sunar.
-   **`NakitYatirmaRaporu.tsx`**: Bankaya yatırılan nakit ile kasadan yapılan nakit girişlerini karşılaştırarak mutabakat sağlar.
-   **`OdemeRapor.tsx`**: Banka hesaplarından yapılan ödemeleri, seçilen dönem ve kategorilere göre gruplandırarak raporlar.
-   **`OzetKontrolRaporuPage.tsx`**: Aylık finansal verilerin genel bir özetini ve mutabakatını sunan bir kontrol panelidir.
-   **`POSKontrolDashboard.tsx`**: Girilen POS gelirleri ile bankadan yüklenen POS hareketlerini günlük bazda karşılaştırarak mutabakat sağlar.
-   **`VPSDashboard.tsx`**: "Personel Başına Ziyaretçi Sayısı" (VPS) ve diğer personel performans metriklerini aylık bazda sunar.
-   **`YemekCekiKontrolDashboard.tsx`**: Yemek çeki gelirleri ile kesilen faturaları ve yapılan ödemeleri karşılaştırarak mutabakat sağlar.
-   **`OnlineKontrolDashboardPage`**: Online satış platformlarından (Getir, Trendyol vb.) gelen gelirler ile bu platformlara ait virman ve komisyonları haftalık bazda karşılaştırır.

#### Personel ve Stok Yönetimi Ekranları

-   **`CalisanPage` (Çalışan Yönetimi)**: Personel bilgilerinin (maaş, sigorta giriş/çıkış vb.) yönetildiği ekran.
-   **`PuantajSecimPage`**: Puantaj tablosunda kullanılacak seçimlerin (Çalışma, Raporlu, Yıllık İzin vb.) ve bu seçimlerin değerlerinin (örn: Çalışma = 1 gün, Yarım Gün = 0.5 gün) tanımlandığı ekran.
-   **`StokPage` (Stok Tanımlama)**: Stok ürünlerinin (malzeme kodu, ürün grubu, birim vb.) tanımlandığı ekran.
-   **`StokFiyatPage` (Stok Fiyat Tanımlama)**: Stok ürünlerine, belirli bir başlangıç tarihinden itibaren geçerli olacak şekilde fiyatların atandığı ekran.
### `B2BEkstreRaporu.tsx`

-   **Amaç**: Kullanıcıların B2B ekstrelerini dönem ve kategoriye göre gruplandırılmış olarak görüntülemesini sağlayan bir B2B Ekstre Raporu görüntüler.
-   **Temel Özellikler**:
    -   **Filtreleme**: Raporu birden fazla dönem (son 12 ay) ve kategoriye (arka uçtan "Bilgi" tipi kategorilere göre filtrelenmiş) göre filtreleyebilir.
    -   **İzinler**: Raporu görüntüleme, yazdırma ve Excel'e aktarma için kullanıcı izinlerini kontrol eder.
    -   **Rapor Oluşturma**: Seçilen filtrelere göre `/api/v1/report/b2b-ekstre-rapor/` adresinden rapor verilerini getirir.
    -   **Etkileşimli Görüntüleme**: Rapor verilerini, döneme ve ardından kategoriye göre gruplandırılmış, genişletilebilir bir tablo formatında görüntüler.
    -   **Özet İstatistikleri**: Toplam kayıtları, dönem sayısını ve genel toplamı gösterir.
    -   **Dışa Aktırma**: PDF ve Excel formatında dışa aktırma seçenekleri sunar. PDF için `html2canvas` ve `jspdf`, Excel için `xlsx` kullanılır.
    -   **Hata Yönetimi ve Yükleme Durumları**: Yükleme için görsel geri bildirim ve hata mesajları sağlar.

### `BayiKarlilikRaporu.tsx`

-   **Amaç**: Seçilen bir yıl için detaylı bir "Bayi Karlılık Raporu" görüntüler, finansal analiz ve performans takibi sağlar.
-   **Temel Özellikler**:
    -   **Yıl Seçimi**: Kullanıcılar raporu görüntülemek için bir yıl seçebilir.
    -   **İzinler**: Raporu görüntüleme, yazdırma ve Excel'e aktarma için kullanıcı izinlerini kontrol eder.
    -   **Veri Bağlamı ve Getirme**: Global uygulama bağlamına ve çeşitli veri listelerine erişir. Ayrıca arka uçtan `all-expenses-by-category` verilerini getirir.
    -   **Kapsamlı Hesaplamalar**: Plaka Sayısı, Çalışma Gün Sayısı, Günlük Ziyaretçi Sayısı, Toplam Ciro, Stok Değerleri, Maliyet, Personel Sayısı, Kira Giderleri, Lojistik Giderleri, Diğer Giderler, Ciro Primleri, Toplam Kar/Zarar gibi birçok metriği hesaplar.
    -   **Dinamik Tablo Görüntüleme**: Hesaplanan verileri aylık dökümler ve toplam sütunu ile tablo formatında sunar.
    -   **Gizlenebilir Bölümler**: "Diğer Detayı" bölümü genişletilebilir/daraltılabilir.
    -   **Kompakt Görünüm**: Raporun detaylı ve kompakt görünümü arasında geçiş yapılmasına olanak tanır.
    -   **Dışa Aktırma**: Excel (çok sayfalı) ve PDF formatında dışa aktırma seçenekleri sunar.

### `DigerHarcamalarPage.tsx`

-   **Amaç**: Seçilen bir şube için "Diğer Harcamalar"ı yönetir, kullanıcıların harcama kayıtlarını görüntülemesine, aramasına, eklemesine ve düzenlemesine olanak tanır.
-   **Temel Özellikler**:
    -   **Harcama Listeleme**: Mevcut seçili şubeye göre filtrelenmiş diğer harcama kayıtlarının bir tablosunu görüntüler.
    -   **Arama İşlevselliği**: Alıcı adına, belge numarasına veya açıklamaya göre harcamaları arayabilir.
    -   **Harcama Ekle/Düzenle (Modal Form)**: Yeni harcamalar eklemek veya mevcut olanları düzenlemek için bir modal form kullanılır. Form, çeşitli harcama detaylarını içerir ve arka uç API'sine (POST/PUT) kaydeder.
    -   **Bildirimler**: API işlemlerinden sonra başarı veya hata mesajlarını görüntülemek için `useToast` kullanır.

### `FaturaBolmeYonetimi.tsx`

-   **Amaç**: "Fatura Bölme Yönetimi" için bir yönetim arayüzü sağlar. Kullanıcıların bölünmüş orijinal faturaları görüntülemesine, alt detaylarını yönetmesine ve yeni faturaları bölmesine olanak tanır.
-   **Temel Özellikler**:
    -   **Bölünmüş Faturaları Görüntüleme**: Daha önce bölünmüş faturaları getirir ve orijinal fatura numaralarına göre gruplandırır.
    -   **Dönem Filtreleme**: Görüntülenen bölünmüş faturaları döneme göre filtreleyebilir.
    -   **Fatura Detayları Genişletme**: Her orijinal fatura, bölünmüş detaylarını (alt faturalar) göstermek için genişletilebilir.
    -   **Toplam Tutar Mutabakatı**: Orijinal tutar ile bölünmüş detayların toplamını karşılaştırır ve tutarsızlıkları vurgular.
    -   **Yeni Bölünmüş Detay Ekleme/Düzenleme/Silme**: Kullanıcılar yeni detaylar ekleyebilir, mevcut detayları düzenleyebilir (tutar, kategori, dönem, özel bayrak) ve silebilir.
    -   **Yeni Fatura Bölme (Modal)**: Mevcut bir faturayı numarasına göre bulup, otomatik olarak iki başlangıç bölünmüş detay oluşturarak bölme işlemini başlatır. Orijinal faturanın kategorisini "Bölünmüş Fatura" olarak güncelleyebilir.

### `FaturaDigerHarcamaRaporu.tsx`

-   **Amaç**: Hem e-faturaların hem de diğer harcama kayıtlarının birleştirilmiş bir görünümünü sağlayan bir "Fatura ve Diğer Harcama Raporu" görüntüler.
-   **Temel Özellikler**:
    -   **Filtreleme**: Raporu birden fazla dönem ve kategoriye göre filtreleyebilir.
    -   **Rapor Oluşturma**: Seçilen filtrelere ve şubeye göre `/fatura-diger-harcama-rapor/` adresinden rapor verilerini getirir.
    -   **Etkileşimli Görüntüleme**: Rapor verilerini, önce döneme, sonra kategoriye göre gruplandırılmış, genişletilebilir bir tablo formatında görüntüler.
    -   **Özet İstatistikleri**: Toplam kayıtları, dönem sayısını ve genel toplamı gösterir.
    -   **İzinler**: Yazdırma, Excel'e aktarma ve "gizli" kategorileri görüntüleme için kullanıcı izinlerini kontrol eder.
    -   **Dışa Aktırma**: PDF ve Excel formatında dışa aktırma seçenekleri sunar.

### `FaturaRaporu.tsx`

-   **Amaç**: E-fatura kayıtlarının ayrıntılı bir görünümünü sağlayan bir "Fatura Raporu" görüntüler.
-   **Temel Özellikler**:
    -   **Filtreleme**: Raporu birden fazla dönem ve kategoriye göre filtreleyebilir.
    -   **Rapor Oluşturma**: Seçilen filtrelere ve şubeye göre `/fatura-rapor/` adresinden rapor verilerini getirir.
    -   **Etkileşimli Görüntüleme**: Rapor verilerini, önce döneme, sonra kategoriye göre gruplandırılmış, genişletilebilir bir tablo formatında görüntüler.
    -   **Özet İstatistikleri**: Toplam kayıtları, dönem sayısını ve genel toplamı gösterir.
    -   **İzinler**: Yazdırma, Excel'e aktarma ve "gizli" kategorileri görüntüleme için kullanıcı izinlerini kontrol eder.
    -   **Dışa Aktırma**: PDF ve Excel formatında dışa aktırma seçenekleri sunar.

### `NakitYatirmaRaporu.tsx`

-   **Amaç**: "Bankaya Yatan" ile "Nakit Girişi"ni karşılaştırmak ve eşleştirmek için bir "Nakit Yatırma Kontrol Raporu" sağlar.
-   **Temel Özellikler**:
    -   **Dönem Seçimi**: Kullanıcılar belirli bir dönemi (YYAA formatı) seçebilir.
    -   **Veri Getirme**: Arka uç API'sinden banka yatırma ve nakit giriş kayıtlarını getirir.
    -   **Eşleştirme Mantığı**: Aynı dönem ve benzer tutara göre kayıtları eşleştirmeye çalışır, eşleşen ve eşleşmeyen kayıtları belirler.
    -   **Etkileşimli Görüntüleme**: "Bankaya Yatan" ve "Nakit Girişi" için iki ayrı tablo görüntüler, eşleşen/eşleşmeyen kayıtları görsel olarak vurgular.
    -   **Özet ve Eşleşme İstatistikleri**: Toplam tutarları, farkı ve eşleşme oranını gösterir.
    -   **Dışa Aktırma**: PDF ve çok sayfalı Excel formatında dışa aktarma seçenekleri sunar.

### `OzetKontrolRaporuPage.tsx`

-   **Amaç**: Finansal mutabakat için bir gösterge paneli olan bir "Özet Kontrol Raporu" görüntüler.
-   **Temel Özellikler**:
    -   **Dönem Seçimi**: Kullanıcılar belirli bir dönemi (YYAA formatı) seçebilir.
    -   **Veri Getirme**: Çeşitli arka uç API uç noktalarından finansal metrikleri eşzamanlı olarak getirir.
    -   **Hesaplamalar**: Gelir Farkı, Nakit Farkı, Kredi Kartı Farkı, Online Farkı, Yemek Çeki Farkı ve Toplam Fark gibi ana mutabakat hesaplamalarını yapar.
    -   **Etkileşimli Görüntüleme**: Veritabanı verilerini ve otomatik hesaplamaları bir ızgarada görüntüler, farkları görsel olarak vurgular.
    -   **Dışa Aktırma**: Excel formatında dışa aktarma seçeneği sunar.
    -   **İzinler**: Raporu görüntüleme ve Excel'e aktarma için kullanıcı izinlerini kontrol eder.

### `POSHareketleriYukleme.tsx`

-   **Amaç**: POS (Point of Sale) işlem verilerini bir Excel dosyasından sisteme yüklemek için bir arayüz sağlar.
-   **Temel Özellikler**:
    -   **Şube Seçimi**: POS hareketlerinin yükleneceği şubeyi seçebilir.
    -   **Dosya Yükleme**: Excel dosyası (`.xlsx` veya `.xls`) yüklemeye izin verir, dosya türü doğrulaması yapar.
    -   **Yükleme Süreci**: Seçilen şube kimliğini ve Excel dosyasını arka uca gönderir, yükleme göstergesi ve sonuç mesajları sağlar.
    -   **Gerekli Excel Sütunları**: Excel dosyasında beklenen sütun başlıklarını ve formatlarını listeler.
    -   **Bildirimler**: `useToast` kullanarak kullanıcı geri bildirimi sağlar.

### `TabakSayisiYukleme.tsx`

-   **Amaç**: Günlük "Tabak Sayısı" verilerini bir Excel dosyasından sisteme yüklemek ve güncellemek için bir arayüz sağlar.
-   **Temel Özellikler**:
    -   **Şube Seçimi**: Tabak sayılarının güncelleneceği şubeyi seçebilir.
    -   **Dosya Yükleme**: Excel dosyası (`.xls` veya `.xlsx`) yüklemeye izin verir, dosya türü doğrulaması yapar.
    -   **Yükleme Süreci**: Seçilen şube kimliğini ve Excel dosyasını arka uca gönderir, yükleme göstergesi ve sonuç mesajları sağlar.
    -   **Gerekli Excel Sütunları**: Excel dosyasında beklenen sütun başlıklarını ve formatlarını listeler.
    -   **Bildirimler**: `useToast` kullanarak kullanıcı geri bildirimi sağlar.

### `VPSDashboard.tsx`

-   **Amaç**: Seçilen bir ay için personel performansı ve operasyonel metrikler hakkında bilgi sağlayan bir "VPS Kontrol Paneli" görüntüler.
-   **Temel Özellikler**:
    -   **Ay Seçimi**: Kullanıcılar belirli bir ayı (YYAA formatı) seçebilir.
    -   **Veri Bağlamı**: Katılım seçim seçenekleri, katılım kayıtları, ek gelir/tabak sayısı verileri ve çalışan listesi gibi çeşitli veri listelerine erişir.
    -   **Kapsamlı Hesaplamalar**: Çalışan Ortalaması, Aktif Çalışan Ortalaması, İzinli Çalışan Ortalaması, Puantaj Günü, Tabak Sayısı ve VPS gibi günlük ve aylık metrikleri hesaplar.
    -   **Temel Performans Göstergeleri (KPI'lar)**: İşe giren/çıkan çalışan sayısı gibi önemli istatistikleri gösterir.
    -   **Detaylı Analiz Tablosu**: Tüm hesaplanan günlük metrikleri kapsamlı bir tablo formatında sunar, hafta sonlarını vurgular ve aylık toplamları içerir.
    -   **Puantaj Özeti Tablosu**: Katılım puanlarını detaylandıran ayrı bir bölüm sunar.

### `YemekCekiKontrolDashboard.tsx`

-   **Amaç**: Yemek çeki gelirini gerçek yemek çeki kayıtları ve bunlara karşılık gelen ödemeler ve faturalarla mutabakat etmek için bir "Yemek Çeki Kontrol Paneli" sağlar.
-   **Temel Özellikler**:
    -   **Dönem Seçimi**: Kullanıcılar belirli bir dönemi (YYAA formatı) seçebilir.
    -   **Veri Bağlamı**: Çeşitli veri listelerine erişir.
    -   **Karmaşık Veri İşleme**: İlgili yemek çeki kategorilerini tanımlar, seçilen şube ve dönem için yemek çeklerini filtreler ve her yemek çeki kategorisi için aylık gelir, dönem tutarı ve fark gibi metrikleri hesaplar.
    -   **Etkileşimli Görüntüleme**: Toplam aylık gelir, dönem tutarı, fark ve kontrol edilen kayıt sayısı için özet kartları görüntüler. Yemek çeki kategorilerine göre gruplandırılmış ayrıntılı bir tablo sunar.
    -   **Dışa Aktırma**: Excel formatında dışa aktarma seçeneği sunar.
    -   **Tarih Ayrıştırma ve Biçimlendirme**: Sağlam tarih ayrıştırma ve dönem biçimlendirme için yardımcı işlevler içerir.
    -   **Stil ve Animasyonlar**: Özel CSS kullanarak görsel olarak çekici bir tasarım ve satır animasyonları sağlar.

### `YemekCekiPage.tsx`

-   **Amaç**: Seçilen bir şube için "Yemek Çeki" kayıtlarını yönetir, kullanıcıların yemek çeki girişlerini görüntülemesine, aramasına, eklemesine, düzenlemesine ve silmesine olanak tanır. Ayrıca her bir çek için resim yüklemeyi de destekler.
-   **Temel Özellikler**:
    -   **Yemek Çeki Listeleme**: Mevcut seçili şube ve döneme göre filtrelenmiş yemek çeki kayıtlarının bir tablosunu görüntüler.
    -   **Arama ve Filtreleme**: Kullanıcılar kategori adına göre arama yapabilir ve döneme göre filtreleyebilir.
    -   **Yemek Çeki Ekle/Düzenle (Modal Form)**: Yeni yemek çekleri eklemek veya mevcut olanları düzenlemek için bir modal form kullanılır. Form, çeşitli yemek çeki detaylarını içerir ve arka uç API'sine kaydeder. Resim yükleme, önizleme ve kaldırma işlevselliği sunar. Tarih aralıkları için doğrulama içerir.
    -   **Yemek Çeki Silme**: Kullanıcılar bireysel yemek çeki kayıtlarını silebilir.
    -   **Resim İşleme**: Yemek çekleri için resim yüklemeye izin verir. Mevcut resimler bir bağlantı aracılığıyla görüntülenebilir.
    -   **Dışa Aktırma Seçenekleri**: PDF ve Excel formatında dışa aktırma seçenekleri sunar.
    -   **Bildirimler**: `useToast` kullanarak kullanıcı geri bildirimi sağlar.

---


---
# 5. Veritabanı Bağlantısı ve Ortam Yönetimi

Bu bölümde, uygulamanın veritabanı ile nasıl bağlantı kurduğu, bu bağlantının nasıl yapılandırıldığı ve farklı ortamlar (geliştirme, test, canlı) için nasıl yönetildiği açıklanmaktadır.

### 5.1. Bağlantı Mimarisi

Uygulama, veritabanı işlemleri için **SQLAlchemy** ORM kütüphanesini kullanır. Bağlantı süreci iki ana dosyada yönetilir:

1.  **`backend/core/config.py`**: Bu dosya, veritabanı bağlantısı için gerekli olan bilgileri çevre değişkenlerinden (environment variables) okur ve bir bağlantı metni (`DATABASE_URL`) oluşturur.
2.  **`backend/db/database.py`**: Bu dosya, `config.py`'den aldığı `DATABASE_URL`'i kullanarak SQLAlchemy'nin veritabanı motorunu (`engine`) oluşturur ve veritabanı oturumlarını (`Session`) yönetir.

### 5.2. Yapılandırma ve Çevre Değişkenleri

Uygulama, `python-dotenv` kütüphanesi aracılığıyla `backend/.env.local` dosyasından yüklenen çevre değişkenlerini kullanır. Bu yaklaşım, veritabanı şifreleri gibi hassas bilgilerin koddan ayrı ve güvenli bir şekilde saklanmasını sağlar.

`DATABASE_URL`, aşağıdaki çevre değişkenleri kullanılarak dinamik olarak oluşturulur:

-   `DB_HOST`: Veritabanı sunucusunun adresi.
-   `DB_PORT`: Veritabanı sunucusunun portu.
-   `DB_USER`: Veritabanı kullanıcı adı.
-   `DB_PASSWORD`: Veritabanı şifresi.
-   `DB_NAME`: Uygulamanın kullanacağı veritabanının adı.

### 5.3. Ortam Yapılandırmaları

Uygulama, farklı ortamlarda (geliştirme, canlı) çalışabilmesi için çevre değişkenlerini kullanır. Bu, aynı kodun farklı veritabanlarına ve ayarlara bağlanabilmesini sağlar.

-   **Geliştirme (Lokal) Ortamı:**
    Geliştirme ortamı, `backend/.env.local` dosyasında tanımlanan değerleri kullanır. Mevcut yapılandırma aşağıdaki gibidir:
    -   **DB_HOST**: `mysql-sg72-silvercloud-1.j.aivencloud.com`
    -   **DB_PORT**: `21958`
    -   **DB_USER**: `avnadmin`
    -   **DB_PASSWORD**: `AVNS_0f9aUBdHAOZ7c2Ai-Ie`
    -   **DB_NAME**: `SilverCloud`

-   **Canlı (Production) Ortamı:**
    Canlı ortam, uygulamanın deploy edildiği sunucudaki (Render) çevre değişkenlerini kullanır. Bu değişkenler güvenlik nedeniyle kod içinde veya projenin dosyalarında saklanmaz. Bu bilgilere Render platformundaki projenizin "Environment" bölümünden ulaşabilirsiniz.

    Aşağıda, canlı ortam için doldurmanız gereken bir şablon bulunmaktadır:
    -   **DB_HOST**: `[Render üzerindeki veritabanı sunucu adresiniz]`
    -   **DB_PORT**: `[Render üzerindeki veritabanı portunuz]`
    -   **DB_USER**: `[Canlı veritabanı kullanıcı adınız]`
    -   **DB_PASSWORD**: `[Canlı veritabanı şifreniz]`
    -   **DB_NAME**: `[Canlı veritabanı adınız]`
## 6. Bayi Karlılık Raporu Hesaplama Detayları

Bu bölümde, "Bayi Karlılık Raporu"nda yer alan her bir metriğin nasıl hesaplandığına dair teknik detaylar ve kod mantığı açıklanmaktadır. Hesaplamalar, `CopyCat/pages/BayiKarlilikRaporu.tsx` dosyasında, `useMemo` hook'u içinde çeşitli veri kaynakları (`useDataContext` üzerinden gelen listeler) kullanılarak yapılır.

### 6.1. Operasyonel Metrikler

-   **Tabak Sayısı**:
    -   **Veri Kaynağı**: `gelirEkstraList`
    -   **Mantık**: Raporun seçili yılına ait her ay için, `gelirEkstraList` içindeki kayıtların `Tarih` alanına bakılır. İlgili aydaki tüm kayıtların `Tabak_Sayisi` alanları toplanır.

-   **Çalışma Gün Sayısı**:
    -   **Mantık**: İlgili ayın kaç gün çektiği hesaplanır (`new Date(year, monthIndex + 1, 0).getDate()`).

-   **Günlük Ziyaretçi Sayısı**:
    -   **Mantık**: `Tabak Sayısı` / `Çalışma Gün Sayısı`.

### 6.2. Ciro Metrikleri

-   **Toplam Ciro**:
    -   **Veri Kaynağı**: `gelirEkstraList`
    -   **Mantık**: Raporun seçili yılına ait her ay için, `gelirEkstraList` içindeki kayıtların `RobotPos_Tutar` alanları toplanır.

-   **Şefteniste Ciro**:
    -   **Veri Kaynağı**: `gelirList`, `kategoriList`
    -   **Mantık**: `kategoriList` içinden `Ust_Kategori_ID`'si 1 (Şefteniste) olan tüm kategoriler bulunur. `gelirList` içindeki kayıtlardan, ilgili aya ait olan ve kategori ID'si bu listede bulunanların `Tutar` alanları toplanır.

-   **Restoran Ciro**:
    -   **Mantık**: `Toplam Ciro` - `Şefteniste Ciro`.

### 6.3. Stok ve Maliyet Metrikleri

-   **Ay Sonu Sayılan Stok Değeri**:
    -   **Veri Kaynağı**: `stokSayimList`, `stokFiyatList`
    -   **Mantık**: İlgili ay için `stokSayimList`'teki her bir kaydın `Miktar`'ı, o malzeme için o dönemde geçerli olan en son fiyatla (`getLatestPriceForPeriod` fonksiyonu ile `stokFiyatList`'ten bulunur) çarpılır ve tüm sonuçlar toplanır.

-   **Ay Başı Stok Değeri**:
    -   **Mantık**: Bir önceki ayın "Ay Sonu Sayılan Stok Değeri"dir. Yılın ilk ayı (Ocak) için, bir önceki yılın Aralık ayının stok değeri kullanılır.

-   **Ay içerisindeki Alımlar**:
    -   **Veri Kaynağı**: `digerHarcamaList`, `eFaturaList`, `kategoriList`, `ustKategoriList`
    -   **Mantık**: Üst kategorisi "Satışların Maliyeti" olan tüm kategoriler bulunur. Bu kategorilere ait olan ve ilgili ayda `digerHarcamaList` ve `eFaturaList`'te yer alan tüm harcamaların `Tutar`'ları toplanır.

-   **Maliyet**:
    -   **Mantık**: `Ay Başı Stok Değeri` + `Ay içerisindeki Alımlar` - `Ay Sonu Sayılan Stok Değeri`. (Not: `Ay içerisindeki İade` şu anki kodda `0` olarak kabul edilmektedir).

-   **Maliyet %**:
    -   **Mantık**: (`Maliyet` / `Toplam Ciro`) * 100.

### 6.4. Personel Metrikleri

-   **Personel Sayısı (Sürücü Sayısı Hariç)**:
    -   **Veri Kaynağı**: `calisanList`
    -   **Mantık**: İlgili ayın her bir günü için, o gün aktif olan (işe giriş yapmış ve işten çıkmamış) çalışan sayısı bulunur. Bu günlük sayıların aylık ortalaması alınır.

-   **Personel Maaş Giderleri; SGK, Stopaj (Muhtasar) Dahil**:
    -   **Veri Kaynağı**: `digerHarcamaList`, `eFaturaList`, `kategoriList`, `ustKategoriList`
    -   **Mantık**: Üst kategorisi "Maaş Giderleri" olan tüm kategoriler bulunur. Bu kategorilere ait olan ve ilgili ayda `digerHarcamaList` ve `eFaturaList`'te yer alan tüm harcamaların `Tutar`'ları toplanır.

-   **Ortalama Kişi Başı Maaş**:
    -   **Mantık**: `Personel Maaş Giderleri` / `Personel Sayısı`.

-   **Maaş Giderleri %**:
    -   **Mantık**: (`Personel Maaş Giderleri` / `Toplam Ciro`) * 100.

-   **VPS (Personel Başına Ziyaretçi Sayısı)**:
    -   **Mantık**: `Günlük Ziyaretçi Sayısı` / `Personel Sayısı`.

### 6.5. Kira Metrikleri

-   **Sabit Kira**, **Ciro Kira**, **Ortak alan ve Genel Giderler**:
    -   **Veri Kaynağı**: `digerHarcamaList`, `eFaturaList`, `kategoriList`
    -   **Mantık**: İlgili kategori adına ("Sabit Kira", "Ciro Kira", "Ortak Gider") sahip olan kategori bulunur. Bu kategoriye ait olan ve ilgili ayda `digerHarcamaList` ve `eFaturaList`'te yer alan tüm harcamaların `Tutar`'ları toplanır.

-   **Depo Kira**:
    -   **Veri Kaynağı**: `depoKiraRapor`
    -   **Mantık**: `depoKiraRapor` verisinden ilgili aya ait `Toplam_Tutar` alınır.

-   **Toplam Kira**:
    -   **Mantık**: `Stopajlı Kira` + `Sabit Kira` + `Ciro Kira` + `Depo Kira` + `Ortak alan ve Genel Giderler`. (Not: `Stopajlı Kira` şu anki kodda `0` olarak kabul edilmektedir).

-   **Toplam Kira %**:
    -   **Mantık**: (`Toplam Kira` / `Toplam Ciro`) * 100.

### 6.6. Lojistik ve Komisyon Metrikleri

-   **Yemeksepeti, Trendyol, Getir, Migros Komisyon ve Lojistik Giderleri**:
    -   **Veri Kaynağı**: `eFaturaList`, `kategoriList`
    -   **Mantık**: Kategorisi "Yemek Sepeti (Online) Komisyonu" olan ve `Aciklama` alanında ilgili platformun adı ("yemek sepeti", "trendyol" vb.) geçen e-faturaların `Tutar`'ları toplanır.

-   **Paket Komisyon ve Lojistik Giderleri**:
    -   **Mantık**: Yukarıda listelenen tüm online platform komisyonlarının toplamıdır.

-   **Paket Komisyon ve Lojistik (Paket Satış) %**:
    -   **Mantık**: (`Paket Komisyon ve Lojistik Giderleri` / `Toplam Ciro`) * 100.

### 6.7. Diğer Giderler ve Kar/Zarar

-   **Kredi Kartı Komisyon Giderleri**:
    -   **Veri Kaynağı**: `digerHarcamaList`, `eFaturaList`, `kategoriList`
    -   **Mantık**: Kategorisi "Banka Komisyonu" olan harcamaların toplamıdır.

-   **Yemek Kartı Komisyon Giderleri**:
    -   **Veri Kaynağı**: `digerHarcamaList`, `eFaturaList`, `kategoriList`
    -   **Mantık**: Kategorisi "Yemek Çekleri Komisyonu" olan harcamaların toplamıdır.

-   **Diğer Giderler**:
    -   **Veri Kaynağı**: `digerHarcamaList`, `eFaturaList`, `kategoriList`, `ustKategoriList`
    -   **Mantık**: Üst kategorisi "Diğer Giderler" olan tüm kategorilere ait harcamaların toplamıdır.

-   **Diğer Detay Toplamı**:
    -   **Mantık**: `Diğer Giderler` + `Kredi Kartı Komisyon Giderleri` + `Yemek Kartı Komisyon Giderleri`.

-   **Tavuk Dünyası Lojistik Giderleri**:
    -   **Veri Kaynağı**: `digerHarcamaList`, `eFaturaList`, `kategoriList`
    -   **Mantık**: Kategorisi "Tavuk Dünyası Lojistik" olan harcamaların toplamıdır.

-   **Toplam Diğer Giderler**:
    -   **Mantık**: `Diğer Detay Toplamı` + `Tavuk Dünyası Lojistik Giderleri`.

-   **Tavuk Dünyası Ciro Primi** ve **Tavuk Dünyası Reklam Primi**:
    -   **Veri Kaynağı**: `digerHarcamaList`, `eFaturaList`, `kategoriList`
    -   **Mantık**: İlgili kategori adlarına ("Tavuk Dünyası Ciro Primi", "Tavuk Dünyası Reklam Primi") sahip olan harcamaların toplamıdır.

-   **Ciro Primi ve Reklam Primi**:
    -   **Mantık**: `Tavuk Dünyası Ciro Primi` + `Tavuk Dünyası Reklam Primi`.

-   **Toplam Kar / Zarar**:
    -   **Mantık**: `Toplam Ciro` - `Maliyet` - `Personel Maaş Giderleri` - `Toplam Kira` - `Paket Komisyon ve Lojistik Giderleri` - `Toplam Diğer Giderler` - `Ciro Primi ve Reklam Primi`.

-   **Toplam Kar / Zarar %**:
    -   **Mantık**: (`Toplam Kar / Zarar` / `Toplam Ciro`) * 100.
	
Tabak sayısı Hesabı

SELECT 
    DATE_FORMAT(Tarih, '%b%y') AS Donem,   -- örnek: Oca25, Şub25
    SUM(Tabak_Sayisi) AS Toplam_Tabak
FROM SilverCloud.GelirEkstra
WHERE Tarih BETWEEN Ekran.Yıl.YılınİlkGünü AND 'Ekran.Yıl.YılınSonGünü
GROUP BY DATE_FORMAT(Tarih, '%b%y')
ORDER BY MIN(Tarih);

Örnek
SELECT 
    DATE_FORMAT(Tarih, '%b%y') AS Donem,   -- örnek: Jan25, Feb25
    SUM(Tabak_Sayisi) AS Toplam_Tabak
FROM SilverCloud.GelirEkstra
WHERE Tarih BETWEEN '2025-01-01' AND '2025-12-31'
GROUP BY DATE_FORMAT(Tarih, '%b%y')
ORDER BY MIN(Tarih);

Toplam Ciro
SELECT 
    DATE_FORMAT(Tarih, '%b%y') AS Donem,   -- örnek: Jan25, Feb25
    SUM(RobotPos_Tutar) AS Toplam_Ciro
FROM SilverCloud.GelirEkstra
WHERE Tarih BETWEEN Ekran.Yıl.YılınİlkGünü AND 'Ekran.Yıl.YılınSonGünü
GROUP BY DATE_FORMAT(Tarih, '%b%y')
ORDER BY MIN(Tarih);

Örnek
SELECT 
    DATE_FORMAT(Tarih, '%b%y') AS Donem,   -- örnek: Jan25, Feb25
    SUM(RobotPos_Tutar) AS Toplam_Ciro
FROM SilverCloud.GelirEkstra
WHERE Tarih BETWEEN '2025-01-01' AND '2025-12-31'
GROUP BY DATE_FORMAT(Tarih, '%b%y')
ORDER BY MIN(Tarih);
----------
Seften İste

SELECT 
    DATE_FORMAT(Tarih, '%b%y') AS Donem, 
    SUM(Tutar) AS Seften_Iste
FROM SilverCloud.Gelir
WHERE Tarih BETWEEN Ekran.Yıl.YılınİlkGünü AND 'Ekran.Yıl.YılınSonGünü
  AND Kategori_ID IN (
        SELECT Kategori_ID 
        FROM SilverCloud.Kategori 
        WHERE Ust_Kategori_ID = 1
  )
GROUP BY DATE_FORMAT(Tarih, '%b%y')
ORDER BY MIN(Tarih);
Örnek
SELECT 
    DATE_FORMAT(Tarih, '%b%y') AS Donem, 
    SUM(Tutar) AS Seften_Iste
FROM SilverCloud.Gelir
WHERE Tarih BETWEEN '2025-01-01' AND '2025-12-31'
  AND Kategori_ID IN (
        SELECT Kategori_ID 
        FROM SilverCloud.Kategori 
        WHERE Ust_Kategori_ID = 1
  )
GROUP BY DATE_FORMAT(Tarih, '%b%y')
ORDER BY MIN(Tarih);


Restoran Ciro = Toplam Ciro - Şefteniste Ciro
--------------------------------------------

Aylık Stok değeri
---------------
SELECT 
    p.Donem,
    SUM(
        p.Miktar *
        (
            SELECT s.Fiyat
            FROM SilverCloud.Stok_Fiyat s
            WHERE s.Malzeme_Kodu = p.Malzeme_Kodu
			AND s.Gecerlilik_Baslangic_Tarih <= STR_TO_DATE(CONCAT('20', p.Donem, '01'), '%Y%m%d')
            ORDER BY s.Gecerlilik_Baslangic_Tarih DESC
            LIMIT 1
        )
    ) AS Donem_Toplami
FROM SilverCloud.Stok_Sayim p
Where Year(STR_TO_DATE(CONCAT('20', p.Donem, '01'), '%Y%m%d'))=Ekran.Yıl
GROUP BY p.Donem
ORDER BY p.Donem;
Örnek

SELECT 
    p.Donem,
    SUM(
        p.Miktar *
        (
            SELECT s.Fiyat
            FROM SilverCloud.Stok_Fiyat s
            WHERE s.Malzeme_Kodu = p.Malzeme_Kodu
			AND s.Gecerlilik_Baslangic_Tarih <= STR_TO_DATE(CONCAT('20', p.Donem, '01'), '%Y%m%d')
            ORDER BY s.Gecerlilik_Baslangic_Tarih DESC
            LIMIT 1
        )
    ) AS Donem_Toplami
FROM SilverCloud.Stok_Sayim p
Where Year(STR_TO_DATE(CONCAT('20', p.Donem, '01'), '%Y%m%d'))=2025
GROUP BY p.Donem
ORDER BY p.Donem;
----------------
Averaj Çalışan sayısı 
-------------------------

WITH RECURSIVE takvim AS (
    SELECT DATE(Ekran.Yıl.İlkGünü) AS Tarih
    UNION ALL
    SELECT DATE_ADD(Tarih, INTERVAL 1 DAY)
    FROM takvim
    WHERE Tarih < kran.Yıl.SonGünü
),
Gunluk AS (
    SELECT 
        t.Tarih,
        COUNT(c.TC_No) AS Gunluk_Calisan
    FROM takvim t
    LEFT JOIN SilverCloud.Calisan c
      ON c.Sigorta_Giris <= t.Tarih
     AND (c.Sigorta_Cikis IS NULL OR c.Sigorta_Cikis > t.Tarih)
    WHERE t.Tarih <= NOW()
    GROUP BY t.Tarih
)
SELECT 
    DATE_FORMAT(Tarih, '%b%y') AS Donem,
    ROUND(AVG(Gunluk_Calisan),2) AS Ortalama_Calisan
FROM Gunluk
GROUP BY Donem
ORDER BY MIN(Tarih);

Örnek
WITH RECURSIVE takvim AS (
    SELECT DATE('2025-01-01') AS Tarih
    UNION ALL
    SELECT DATE_ADD(Tarih, INTERVAL 1 DAY)
    FROM takvim
    WHERE Tarih < '2025-12-31'
),
Gunluk AS (
    SELECT 
        t.Tarih,
        COUNT(c.TC_No) AS Gunluk_Calisan
    FROM takvim t
    LEFT JOIN SilverCloud.Calisan c
      ON c.Sigorta_Giris <= t.Tarih
     AND (c.Sigorta_Cikis IS NULL OR c.Sigorta_Cikis > t.Tarih)
    WHERE t.Tarih <= NOW()
    GROUP BY t.Tarih
)
SELECT 
    DATE_FORMAT(Tarih, '%b%y') AS Donem,
    ROUND(AVG(Gunluk_Calisan),2) AS Ortalama_Calisan
FROM Gunluk
GROUP BY Donem
ORDER BY MIN(Tarih);
----------------------------------------- 
Satılan Malın Maliyeti
WITH maliyet_kategorileri AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori 
    WHERE Ust_Kategori_ID IN (
        SELECT UstKategori_ID
        FROM SilverCloud.UstKategori
        WHERE UstKategori_Adi = 'Satışların Maliyeti'
    )
),
tumunu_veriler AS (
    SELECT Donem, Tutar, 'Diger_Harcama' AS Kaynak
    FROM SilverCloud.Diger_Harcama
    WHERE Kategori_ID IN (SELECT Kategori_ID FROM maliyet_kategorileri)
    
    UNION ALL
    
    SELECT Donem, Tutar, 'e_Fatura' AS Kaynak
    FROM SilverCloud.e_Fatura
    WHERE Kategori_ID IN (SELECT Kategori_ID FROM maliyet_kategorileri)
)
SELECT Donem, SUM(Tutar) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;
-----------------------------
Maaş Toplamı

WITH maas_kategorileri AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori 
    WHERE Ust_Kategori_ID IN (
        SELECT UstKategori_ID
        FROM SilverCloud.UstKategori
        WHERE UstKategori_Adi = 'Maaş Giderleri'
    )
),
tumunu_veriler AS (
    SELECT Donem, Tutar, 'Diger_Harcama' AS Kaynak
    FROM SilverCloud.Diger_Harcama
    WHERE Kategori_ID IN (SELECT Kategori_ID FROM maas_kategorileri)
    
    UNION ALL
    
    SELECT Donem, Tutar, 'e_Fatura' AS Kaynak
    FROM SilverCloud.e_Fatura
    WHERE Kategori_ID IN (SELECT Kategori_ID FROM maas_kategorileri)
)
SELECT Donem, SUM(Tutar) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;
------Kira Hesabı ---

WITH X_kategorileri AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori 
    WHERE Kategori_Adi = 'Ciro kira'  ---> Buraya kategori yazılaraK istediğini hesapla
),
tumunu_veriler AS (
    SELECT Donem, Tutar, 'Diger_Harcama' AS Kaynak
    FROM SilverCloud.Diger_Harcama
    WHERE Kategori_ID IN (SELECT Kategori_ID FROM X_kategorileri)
    
    UNION ALL
    
    SELECT Donem, Tutar, 'e_Fatura' AS Kaynak
    FROM SilverCloud.e_Fatura
    WHERE Kategori_ID IN (SELECT Kategori_ID FROM X_kategorileri)
)
SELECT Donem, SUM(Tutar) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;


Not: Ekran.Donem ekrandaki seçilen dönem  ve Ekran.Sube_ID ekrandaki şube kodu demektir. 
--------------------------
Su

SET @DDonem = Ekran.Donem;
SET @Sube_ID = Ekran.Sube;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'Su'
),
tumunu_veriler AS (
    SELECT SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE dh.Donem = @DDonem
    And dh.Sube_ID = @Sube_ID

    UNION ALL

    SELECT SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE ef.Donem = @DDonem
    and ef.Sube_Id = @Sube_ID
)
SELECT COALESCE(SUM(Tutar),0) AS Toplam_Tutar
FROM tumunu_veriler;

Not: Ekran.Yil ekrandaki seçilen Yıl  ve Ekran.Sube_ID ekrandaki şube kodu demektir. 
Örneğin Ekran.Yıl = 2025 ve Ekran.Sube_ID = 1 olabilir
--------------------------
Su

SET @DYil = Ekran.Yil;
SET @Sube_ID = Ekran.Sube_ID;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'Su'
),
tumunu_veriler AS (
    SELECT dh.Donem, SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(dh.Donem, '01'), '%y%m%d')) = @DYil
      AND dh.Sube_ID = @Sube_ID
    GROUP BY dh.Donem

    UNION ALL

    SELECT ef.Donem, SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(ef.Donem, '01'), '%y%m%d')) = @DYil
      AND ef.Sube_ID = @Sube_ID
    GROUP BY ef.Donem
)
SELECT Donem, COALESCE(SUM(Tutar), 0) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;


--------------------------
Elektrik


SET @DYil = Ekran.Yil;
SET @Sube_ID = Ekran.Sube_ID;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'Elektrik'
),
tumunu_veriler AS (
    SELECT dh.Donem, SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(dh.Donem, '01'), '%y%m%d')) = @DYil
      AND dh.Sube_ID = @Sube_ID
    GROUP BY dh.Donem

    UNION ALL

    SELECT ef.Donem, SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(ef.Donem, '01'), '%y%m%d')) = @DYil
      AND ef.Sube_ID = @Sube_ID
    GROUP BY ef.Donem
)
SELECT Donem, COALESCE(SUM(Tutar), 0) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;
--------------------------
Doğalgaz Gideri


SET @DYil = Ekran.Yil;
SET @Sube_ID = Ekran.Sube_ID;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'Doğalgaz Gideri'
),
tumunu_veriler AS (
    SELECT dh.Donem, SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(dh.Donem, '01'), '%y%m%d')) = @DYil
      AND dh.Sube_ID = @Sube_ID
    GROUP BY dh.Donem

    UNION ALL

    SELECT ef.Donem, SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(ef.Donem, '01'), '%y%m%d')) = @DYil
      AND ef.Sube_ID = @Sube_ID
    GROUP BY ef.Donem
)
SELECT Donem, COALESCE(SUM(Tutar), 0) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;



--------------------------
İnternet ve Telefon


SET @DYil = Ekran.Yil;
SET @Sube_ID = Ekran.Sube_ID;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'İnternet ve Telefon'
),
tumunu_veriler AS (
    SELECT dh.Donem, SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(dh.Donem, '01'), '%y%m%d')) = @DYil
      AND dh.Sube_ID = @Sube_ID
    GROUP BY dh.Donem

    UNION ALL

    SELECT ef.Donem, SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(ef.Donem, '01'), '%y%m%d')) = @DYil
      AND ef.Sube_ID = @Sube_ID
    GROUP BY ef.Donem
)
SELECT Donem, COALESCE(SUM(Tutar), 0) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;

-------------------------
Personel Yemek Giderleri


SET @DYil = Ekran.Yil;
SET @Sube_ID = Ekran.Sube_ID;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'Personel Yemek Giderleri'
),
tumunu_veriler AS (
    SELECT dh.Donem, SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(dh.Donem, '01'), '%y%m%d')) = @DYil
      AND dh.Sube_ID = @Sube_ID
    GROUP BY dh.Donem

    UNION ALL

    SELECT ef.Donem, SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(ef.Donem, '01'), '%y%m%d')) = @DYil
      AND ef.Sube_ID = @Sube_ID
    GROUP BY ef.Donem
)
SELECT Donem, COALESCE(SUM(Tutar), 0) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;

-------------------------
Temizlik Giderleri


SET @DYil = Ekran.Yil;
SET @Sube_ID = Ekran.Sube_ID;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'Temizlik Giderleri'
),
tumunu_veriler AS (
    SELECT dh.Donem, SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(dh.Donem, '01'), '%y%m%d')) = @DYil
      AND dh.Sube_ID = @Sube_ID
    GROUP BY dh.Donem

    UNION ALL

    SELECT ef.Donem, SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(ef.Donem, '01'), '%y%m%d')) = @DYil
      AND ef.Sube_ID = @Sube_ID
    GROUP BY ef.Donem
)
SELECT Donem, COALESCE(SUM(Tutar), 0) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;
-------------------------
Bakım Onarım


SET @DYil = Ekran.Yil;
SET @Sube_ID = Ekran.Sube_ID;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'Bakım Onarım'
),
tumunu_veriler AS (
    SELECT dh.Donem, SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(dh.Donem, '01'), '%y%m%d')) = @DYil
      AND dh.Sube_ID = @Sube_ID
    GROUP BY dh.Donem

    UNION ALL

    SELECT ef.Donem, SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(ef.Donem, '01'), '%y%m%d')) = @DYil
      AND ef.Sube_ID = @Sube_ID
    GROUP BY ef.Donem
)
SELECT Donem, COALESCE(SUM(Tutar), 0) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;

-------------------------
Personel Tazminat (Kıdem, İhbar vb.)


SET @DYil = Ekran.Yil;
SET @Sube_ID = Ekran.Sube_ID;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'Personel Tazminat (Kıdem, İhbar vb.)'
),
tumunu_veriler AS (
    SELECT dh.Donem, SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(dh.Donem, '01'), '%y%m%d')) = @DYil
      AND dh.Sube_ID = @Sube_ID
    GROUP BY dh.Donem

    UNION ALL

    SELECT ef.Donem, SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(ef.Donem, '01'), '%y%m%d')) = @DYil
      AND ef.Sube_ID = @Sube_ID
    GROUP BY ef.Donem
)
SELECT Donem, COALESCE(SUM(Tutar), 0) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;

-------------------------
İlaçlama


SET @DYil = Ekran.Yil;
SET @Sube_ID = Ekran.Sube_ID;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'İlaçlama'
),
tumunu_veriler AS (
    SELECT dh.Donem, SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(dh.Donem, '01'), '%y%m%d')) = @DYil
      AND dh.Sube_ID = @Sube_ID
    GROUP BY dh.Donem

    UNION ALL

    SELECT ef.Donem, SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(ef.Donem, '01'), '%y%m%d')) = @DYil
      AND ef.Sube_ID = @Sube_ID
    GROUP BY ef.Donem
)
SELECT Donem, COALESCE(SUM(Tutar), 0) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;

-----------------------------
Baca Temizliği


SET @DYil = Ekran.Yil;
SET @Sube_ID = Ekran.Sube_ID;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'Baca Temizliği'
),
tumunu_veriler AS (
    SELECT dh.Donem, SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(dh.Donem, '01'), '%y%m%d')) = @DYil
      AND dh.Sube_ID = @Sube_ID
    GROUP BY dh.Donem

    UNION ALL

    SELECT ef.Donem, SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(ef.Donem, '01'), '%y%m%d')) = @DYil
      AND ef.Sube_ID = @Sube_ID
    GROUP BY ef.Donem
)
SELECT Donem, COALESCE(SUM(Tutar), 0) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;

-----------------------------
ÇTV, İşgaliye, İlan Reklam Vergi Bedelleri


SET @DYil = Ekran.Yil;
SET @Sube_ID = Ekran.Sube_ID;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'ÇTV, İşgaliye, İlan Reklam Vergi Bedelleri'
),
tumunu_veriler AS (
    SELECT dh.Donem, SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(dh.Donem, '01'), '%y%m%d')) = @DYil
      AND dh.Sube_ID = @Sube_ID
    GROUP BY dh.Donem

    UNION ALL

    SELECT ef.Donem, SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(ef.Donem, '01'), '%y%m%d')) = @DYil
      AND ef.Sube_ID = @Sube_ID
    GROUP BY ef.Donem
)
SELECT Donem, COALESCE(SUM(Tutar), 0) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;

-----------------------------
Kırtasiye


SET @DYil = Ekran.Yil;
SET @Sube_ID = Ekran.Sube_ID;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'Kırtasiye'
),
tumunu_veriler AS (
    SELECT dh.Donem, SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(dh.Donem, '01'), '%y%m%d')) = @DYil
      AND dh.Sube_ID = @Sube_ID
    GROUP BY dh.Donem

    UNION ALL

    SELECT ef.Donem, SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(ef.Donem, '01'), '%y%m%d')) = @DYil
      AND ef.Sube_ID = @Sube_ID
    GROUP BY ef.Donem
)
SELECT Donem, COALESCE(SUM(Tutar), 0) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;


-----------------------------
Müşavirlik Ücreti


SET @DYil = Ekran.Yil;
SET @Sube_ID = Ekran.Sube_ID;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'Müşavirlik Ücreti'
),
tumunu_veriler AS (
    SELECT dh.Donem, SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(dh.Donem, '01'), '%y%m%d')) = @DYil
      AND dh.Sube_ID = @Sube_ID
    GROUP BY dh.Donem

    UNION ALL

    SELECT ef.Donem, SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(ef.Donem, '01'), '%y%m%d')) = @DYil
      AND ef.Sube_ID = @Sube_ID
    GROUP BY ef.Donem
)
SELECT Donem, COALESCE(SUM(Tutar), 0) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;
-----------------------------
HIJYEN DENETİMİ

SET @DYil = Ekran.Yil;
SET @Sube_ID = Ekran.Sube_ID;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'Hijyen / Gizli Müşteri Denetimi'
),
tumunu_veriler AS (
    SELECT dh.Donem, SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(dh.Donem, '01'), '%y%m%d')) = @DYil
      AND dh.Sube_ID = @Sube_ID
    GROUP BY dh.Donem

    UNION ALL

    SELECT ef.Donem, SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(ef.Donem, '01'), '%y%m%d')) = @DYil
      AND ef.Sube_ID = @Sube_ID
    GROUP BY ef.Donem
)
SELECT Donem, COALESCE(SUM(Tutar), 0) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;

-----------------------------
İşyeri Sigorta Gideri

SET @DYil = Ekran.Yil;
SET @Sube_ID = Ekran.Sube_ID;

WITH MatchingKategori AS (
    SELECT Kategori_ID
    FROM SilverCloud.Kategori
    WHERE Kategori_Adi = 'İşyeri Sigorta Gideri'
),
tumunu_veriler AS (
    SELECT dh.Donem, SUM(dh.Tutar) AS Tutar
    FROM SilverCloud.Diger_Harcama dh
    JOIN MatchingKategori k ON dh.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(dh.Donem, '01'), '%y%m%d')) = @DYil
      AND dh.Sube_ID = @Sube_ID
    GROUP BY dh.Donem

    UNION ALL

    SELECT ef.Donem, SUM(ef.Tutar) AS Tutar
    FROM SilverCloud.e_Fatura ef
    JOIN MatchingKategori k ON ef.Kategori_ID = k.Kategori_ID
    WHERE YEAR(STR_TO_DATE(CONCAT(ef.Donem, '01'), '%y%m%d')) = @DYil
      AND ef.Sube_ID = @Sube_ID
    GROUP BY ef.Donem
)
SELECT Donem, COALESCE(SUM(Tutar), 0) AS Toplam_Tutar
FROM tumunu_veriler
GROUP BY Donem
ORDER BY Donem;
 
SELECT 
    e.Donem, 
    r.Referans_Kodu, 
    SUM(e.Tutar) AS Toplam_Tutar
FROM SilverCloud.e_Fatura e
JOIN SilverCloud.e_Fatura_Referans r
    ON e.Alici_Unvani = r.Alici_Unvani
WHERE e.Kategori_ID = (
    SELECT k.Kategori_ID 
    FROM SilverCloud.Kategori k
    WHERE k.Kategori_Adi = 'Yemek Çekleri Komisyonu'
)
AND r.Referans_Kodu = 'Metropal'
GROUP BY e.Donem, r.Referans_Kodu
ORDER BY e.Donem, r.Referans_Kodu;

---------------------------------------------

Yemeksepeti Komisyon ve Lojistik Giderleri

Not: Ekran.Yil ekrandaki seçilen yılı  ve Ekran.Sube_ID ekrandaki şube kodu demektir.

WHERE Kategori_ID = (
    SELECT Kategori_ID
    FROM Kategori
    WHERE Kategori_Adi = 'Yemek Sepeti (Online) Komisyonu'
)
AND Aciklama like '%Yemek Sepeti%'
nd YEAR(STR_TO_DATE(CONCAT(Donem, '01'), '%y%m%d')) = Ekran.Yil
AND Sube_ID= Ekran.Sube_ID
Group by Donem
Order by Donem;


WHERE Kategori_ID = (
    SELECT Kategori_ID
    FROM Kategori
    WHERE Kategori_Adi = 'Yemek Sepeti (Online) Komisyonu'
)
AND Aciklama like '%Yemek Sepeti%'
and YEAR(STR_TO_DATE(CONCAT(Donem, '01'), '%y%m%d')) =2025
AND Sube_ID= 1
Group by Donem
Order by Donem;
-------------------------------------------
Trendyol Komisyon ve Lojistik Giderleri

Not: Ekran.Yıl ekrandaki seçilen yılı  ve Ekran.Sube_ID ekrandaki şube kodu demektir.

WHERE Kategori_ID = (
    SELECT Kategori_ID
    FROM Kategori
    WHERE Kategori_Adi = 'Yemek Sepeti (Online) Komisyonu'
)
AND Aciklama like '%Trendyol%'
nd YEAR(STR_TO_DATE(CONCAT(Donem, '01'), '%y%m%d')) = Ekran.Yıl
AND Sube_ID= Ekran.Sube_ID
Group by Donem
Order by Donem;

Örnek Ekran.Yıl =2025 ve Ekran.Sube_ID = 1

WHERE Kategori_ID = (
    SELECT Kategori_ID
    FROM Kategori
    WHERE Kategori_Adi = 'Yemek Sepeti (Online) Komisyonu'
)
AND Aciklama like '%Trendyol%'
and YEAR(STR_TO_DATE(CONCAT(Donem, '01'), '%y%m%d')) =2025
AND Sube_ID= 1
Group by Donem
Order by Donem;
------------------------------------------
Migros Hemen Komisyon ve Lojistik Giderleri

SELECT Donem, Sum(Tutar) 
FROM e_Fatura 
WHERE Kategori_ID = (
    SELECT Kategori_ID 
    FROM Kategori 
    WHERE Kategori_Adi = 'Yemek Sepeti (Online) Komisyonu'
) 
AND Aciklama like '%Migros%'
Group by Donem
Order by Donem;
# 7. Özet Kontrol Raporu Hesaplama Detayları

Bu bölümde, "Özet Kontrol Raporu"nda yer alan her bir metriğin nasıl hesaplandığına dair teknik detaylar ve kod mantığı açıklanmaktadır. Rapor, `CopyCat/pages/OzetKontrolRaporuPage.tsx` dosyasında, seçilen şube ve dönem için bir dizi API uç noktasından veri çekerek ve bu verileri ön uçta karşılaştırarak oluşturulur.

### 7.1. Veri Kaynakları (API Uç Noktaları)

Rapor, aşağıdaki API uç noktalarından gelen verileri kullanarak hesaplamalarını yapar. Her bir uç nokta, belirli bir finansal metriğin toplam değerini döndürür.

-   `/ozet-kontrol-raporu/robotpos-tutar/{sube_id}/{donem}`: `GelirEkstra` tablosundan ilgili dönemdeki `RobotPos_Tutar` toplamı.
-   `/ozet-kontrol-raporu/toplam-satis-gelirleri/{sube_id}/{donem}`: `Gelir` tablosundan ilgili dönemdeki tüm gelirlerin toplamı.
-   `/ozet-kontrol-raporu/nakit/{sube_id}/{donem}`: `Gelir` tablosundan, kategorisi "Nakit" olan gelirlerin toplamı.
-   `/ozet-kontrol-raporu/gunluk-harcama-diger/{sube_id}/{donem}`: `Diger_Harcama` tablosundan, `Gunluk_Harcama` olarak işaretlenmiş kayıtların toplamı.
-   `/ozet-kontrol-raporu/gunluk-harcama-efatura/{sube_id}/{donem}`: `e_Fatura` tablosundan, `Gunluk_Harcama` olarak işaretlenmiş kayıtların toplamı.
-   `/ozet-kontrol-raporu/nakit-girisi-toplam/{sube_id}/{donem}`: `Nakit` tablosundan ilgili dönemdeki tüm girişlerin toplamı.
-   `/ozet-kontrol-raporu/bankaya-yatan-toplam/{sube_id}/{donem}`: `Odeme` tablosundan, kategorisi "Bankaya Yatan" olan kayıtların toplamı.
-   `/ozet-kontrol-raporu/gelir-pos-toplam/{sube_id}/{donem}`: `Gelir` tablosundan, kategorisi "POS" olan gelirlerin toplamı.
-   `/ozet-kontrol-raporu/pos-hareketleri-toplam/{sube_id}/{donem}`: `POS_Hareketleri` tablosundan ilgili dönemdeki `Islem_Tutari` toplamı.
-   `/ozet-kontrol-raporu/online-gelir-toplam/{sube_id}/{donem}`: `Gelir` tablosundan, üst kategorisi "Online Satış" olan tüm gelirlerin toplamı.
-   `/ozet-kontrol-raporu/online-virman-toplam/{sube_id}/{donem}`: `B2B_Ekstre` tablosundan, açıklaması "Virman" içeren ve online satış platformlarına ait kayıtların `Alacak` tutarlarının toplamı.
-   `/ozet-kontrol-raporu/yemek-ceki-aylik-gelir-toplam/{sube_id}/{donem}`: `Gelir` tablosundan, üst kategorisi "Yemek Çeki" olan tüm gelirlerin toplamı.
-   `/ozet-kontrol-raporu/yemek-ceki-donem-toplam/{sube_id}/{donem}`: `Yemek_Ceki` tablosundan, ilgili döneme denk gelen çek tutarlarının hesaplanmış toplamı.

### 7.2. Otomatik Hesaplamalar (Farklar)

Ön uç, yukarıdaki API'lerden aldığı verileri kullanarak aşağıdaki fark hesaplamalarını yapar:

-   **Kalan Nakit**:
    -   **Formül**: `Nakit` - `Günlük Harcama-eFatura` - `Günlük Harcama-Diğer`
    -   **Açıklama**: Kasada olması gereken teorik nakit miktarını hesaplar.

-   **Gelir Fark**:
    -   **Formül**: `Toplam Satış Gelirleri` - `Robotpos Tutar`
    -   **Açıklama**: Manuel girilen toplam satış gelirleri ile RobotPos'tan gelen ciro arasındaki farkı gösterir.

-   **Nakit Fark**:
    -   **Formül**: `Bankaya Yatan Toplam` - `Kalan Nakit`
    -   **Açıklama**: Bankaya yatırılan toplam para ile kasada olması beklenen teorik nakit arasındaki farkı gösterir.

-   **Kredi Kartı Fark**:
    -   **Formül**: `POS Hareketleri` - `Gelir POS`
    -   **Açıklama**: Bankadan gelen POS hareketleri toplamı ile sisteme girilen POS geliri arasındaki farkı gösterir.

-   **Online Fark**:
    -   **Formül**: `Online Virman Toplam` - `Online Gelir Toplam`
    -   **Açıklama**: Online platformlardan (Getir, Trendyol vb.) bankaya yatan virman tutarı ile sisteme girilen online satış geliri arasındaki farkı gösterir.

-   **Yemek Çeki Fark**:
    -   **Formül**: `Yemek Çeki Dönem Toplamı` - `Yemek Çeki Aylık Gelir`
    -   **Açıklama**: Anlaşması yapılan yemek çeki tutarının döneme denk gelen kısmı ile o ay için sisteme girilen yemek çeki geliri arasındaki farkı gösterir.

-   **Toplam Fark**:
    -   **Formül**: `Gelir Fark` + `Nakit Fark` + `Kredi Kartı Fark` + `Online Fark` + `Yemek Çeki Fark`
    -   **Açıklama**: Tüm fark kalemlerinin matematiksel toplamıdır. İdealde sıfıra yakın olması beklenir.

Robotpos Tutar 
SELECT 
    SUM(RobotPos_Tutar) AS Robotpos_Tutar
    FROM SilverCloud.GelirEkstra
WHERE DATE_FORMAT(Tarih, '%y%m') = Ekran.Donem;

Örnek
SELECT 
    SUM(RobotPos_Tutar) AS Robotpos_Tutar
    FROM SilverCloud.GelirEkstra
WHERE DATE_FORMAT(Tarih, '%y%m') = '2509';
----------------------------------------------
-------Toplam_Satis_Gelirleri------------
SELECT 
    SUM(Tutar) AS Toplam_Satis_Gelirleri
FROM SilverCloud.Gelir
WHERE DATE_FORMAT(Tarih, '%y%m')=Ekran.Dönem
  AND Kategori_ID IN (
        SELECT Kategori_ID 
        FROM SilverCloud.Kategori 
        WHERE Ust_Kategori_ID IN (
            SELECT UstKategori_ID 
            FROM SilverCloud.UstKategori 
            WHERE UstKategori_Adi IN ('E-Ticaret Kredi Kart', 'Kredi Kartı', 'Nakit', 'Yemek Çeki')
        )
  );

Örnek
Dönem 2508 seçildiğinde

SELECT 
    SUM(Tutar) AS Toplam_Satis_Gelirleri
FROM SilverCloud.Gelir
WHERE DATE_FORMAT(Tarih, '%y%m')=2508
  AND Kategori_ID IN (
        SELECT Kategori_ID 
        FROM SilverCloud.Kategori 
        WHERE Ust_Kategori_ID IN (
            SELECT UstKategori_ID 
            FROM SilverCloud.UstKategori 
            WHERE UstKategori_Adi IN ('E-Ticaret Kredi Kart', 'Kredi Kartı', 'Nakit', 'Yemek Çeki')
        )
  );

Örnek
Dönem 2507 seçildiğinde

SELECT 
    SUM(Tutar) AS Toplam_Satis_Gelirleri
FROM SilverCloud.Gelir
WHERE DATE_FORMAT(Tarih, '%y%m')=2507
  AND Kategori_ID IN (
        SELECT Kategori_ID 
        FROM SilverCloud.Kategori 
        WHERE Ust_Kategori_ID IN (
            SELECT UstKategori_ID 
            FROM SilverCloud.UstKategori 
            WHERE UstKategori_Adi IN ('E-Ticaret Kredi Kart', 'Kredi Kartı', 'Nakit', 'Yemek Çeki')
        )
  );

--------------------------------------------------------------------
------ Nakit -------------------------------------
SELECT 
    SUM(Tutar) AS Nakit
FROM SilverCloud.Gelir
WHERE DATE_FORMAT(Tarih, '%y%m')= Ekran.Donem
  AND Kategori_ID = (
        SELECT Kategori_ID 
        FROM SilverCloud.Kategori 
        WHERE Kategori_Adi = 'Nakit'
	);
Örnek
Dönem 2508 seçildiğinde

SELECT 
    SUM(Tutar) AS Nakit
FROM SilverCloud.Gelir
WHERE DATE_FORMAT(Tarih, '%y%m')=2508
  AND Kategori_ID = (
        SELECT Kategori_ID 
        FROM SilverCloud.Kategori 
        WHERE Kategori_Adi = 'Nakit'
	);

-----------------------------------------------------
Günlük Harcama-eFatura
SELECT sum(Tutar)
FROM SilverCloud.e_Fatura 
where Gunluk_Harcama=1
and Donem =Ekran.Donem;

Örnek Donem =2507
SELECT sum(Tutar)
FROM SilverCloud.e_Fatura 
where Gunluk_Harcama=1
and Donem =2507;
-----------------------
Günlük Harcama-Diğer
Not: Ekran.Dönem ekrandaki seçilen dönem demektir. Buna göre değer değişir.

SELECT sum(Tutar)
FROM SilverCloud.Diger_Harcama 
where Gunluk_Harcama=1
and Donem =Ekran.Donem;

Örnek Donem =2509
SELECT sum(Tutar)
FROM SilverCloud.Diger_Harcama 
where Gunluk_Harcama=1
and Donem =2509;
------------------------
Nakit Girişi Toplam
SELECT sum(Tutar) FROM SilverCloud.Nakit
where Tip='Bankaya Yatan'
And Donem =Ekran.Donem; 

Örnek Donem =2507
SELECT sum(Tutar) FROM SilverCloud.Nakit
where Tip='Bankaya Yatan'
And Donem = 2507
------------------------
Bankaya Yatan Toplam
SELECT Sum(Tutar) FROM SilverCloud.Odeme
where Donem = Ekran.Donem
And Kategori_ID = (
select Kategori_ID from Kategori
where Kategori_Adi ='ATM Para Yatırma' )


Örnek Donem =2509
SELECT Sum(Tutar) FROM SilverCloud.Odeme
where Donem = 2509 
And Kategori_ID = (
select Kategori_ID from Kategori
where Kategori_Adi ='ATM Para Yatırma' )
-----------------------
Gelir POS
SELECT 
    SUM(Tutar) AS Nakit
FROM SilverCloud.Gelir
WHERE DATE_FORMAT(Tarih, '%y%m')=Ekran.Donem
  AND Kategori_ID = (
        SELECT Kategori_ID 
        FROM SilverCloud.Kategori 
        WHERE Kategori_Adi = 'POS'
	);
Örnek Donem =2509
SELECT 
    SUM(Tutar) AS Nakit
FROM SilverCloud.Gelir
WHERE DATE_FORMAT(Tarih, '%y%m')=2509
  AND Kategori_ID = (
        SELECT Kategori_ID 
        FROM SilverCloud.Kategori 
        WHERE Kategori_Adi = 'POS'
	);

-------------------------
POS Hareketleri






---------------------
Online Gelir Toplam
SELECT 
    SUM(Tutar) AS Online_Satis_Gelirleri
FROM SilverCloud.Gelir
WHERE DATE_FORMAT(Tarih, '%y%m')=Ekran.Donem
  AND Kategori_ID IN (
        SELECT Kategori_ID 
        FROM SilverCloud.Kategori 
        WHERE Ust_Kategori_ID IN (
            SELECT UstKategori_ID 
            FROM SilverCloud.UstKategori 
            WHERE UstKategori_Adi ='E-Ticaret Kredi Kart'
        )
  );

Örnek Donem =2507
SELECT 
    SUM(Tutar) AS Online_Satis_Gelirleri
FROM SilverCloud.Gelir
WHERE DATE_FORMAT(Tarih, '%y%m')=2507
  AND Kategori_ID IN (
        SELECT Kategori_ID 
        FROM SilverCloud.Kategori 
        WHERE Ust_Kategori_ID IN (
            SELECT UstKategori_ID 
            FROM SilverCloud.UstKategori 
            WHERE UstKategori_Adi ='E-Ticaret Kredi Kart'
        )
  );

---------------------
Not: Ekran.Donem ekrandaki seçilen dönem  ve Ekran.Sube_ID ekrandaki şube kodu demektir. 
Online Virman Toplam
SELECT -1*sum(Alacak) as Online_Virman_Toplam
FROM SilverCloud.B2B_Ekstre
where Aciklama like '%Online Alacak Virman%'
and donem =Ekran.Donem
and Sube_ID = Ekran.Sube_ID


Örnek Donem =2508
SELECT -1*sum(Alacak) as Online_Virman_Toplam
FROM SilverCloud.B2B_Ekstre
where Aciklama like '%Online Alacak Virman%'
and donem =2508
and Sube_ID = 1

--------------------------
Yemek Çeki Aylık Gelir
SELECT 
    SUM(Tutar) AS Online_Satis_Gelirleri
FROM SilverCloud.Gelir
WHERE DATE_FORMAT(Tarih, '%y%m')=Ekran.Donem
  AND Kategori_ID IN (
        SELECT Kategori_ID 
        FROM SilverCloud.Kategori 
        WHERE Ust_Kategori_ID IN (
            SELECT UstKategori_ID 
            FROM SilverCloud.UstKategori 
            WHERE UstKategori_Adi ='Yemek Çeki'
        )
  );

Örnek Donem =2507
SELECT 
    SUM(Tutar) AS Online_Satis_Gelirleri
FROM SilverCloud.Gelir
WHERE DATE_FORMAT(Tarih, '%y%m')=2507
  AND Kategori_ID IN (
        SELECT Kategori_ID 
        FROM SilverCloud.Kategori 
        WHERE Ust_Kategori_ID IN (
            SELECT UstKategori_ID 
            FROM SilverCloud.UstKategori 
            WHERE UstKategori_Adi ='Yemek Çeki'
        )
  );




--------------------

Yemek Çeki Dönem Toplamı

WITH Aktif_YemekCeki AS (
    SELECT 
        Kategori_ID,
        Ilk_Tarih,
        Son_Tarih,
        Tutar
    FROM SilverCloud.Yemek_Ceki
    WHERE CAST(DATE_FORMAT(Ilk_Tarih, '%y%m') AS UNSIGNED) <= Ekran.Donem
      AND CAST(DATE_FORMAT(Son_Tarih, '%y%m') AS UNSIGNED) >= Ekran.Donem
),
Excluded AS (
    SELECT 
        SUM(g.Tutar) AS Excluded_Tutar
    FROM Aktif_YemekCeki y
    JOIN SilverCloud.Gelir g 
      ON g.Kategori_ID = y.Kategori_ID
     AND CAST(DATE_FORMAT(g.Tarih, '%y%m') AS UNSIGNED) <> Ekran.Donem
     AND g.Tarih >= y.Ilk_Tarih
     AND g.Tarih <= y.Son_Tarih
),
Included AS (
    SELECT 
        SUM(Tutar) AS Included_Tutar
    FROM Aktif_YemekCeki
)
SELECT 
    i.Included_Tutar - COALESCE(e.Excluded_Tutar,0) AS Donem_Tutar
FROM Included i
CROSS JOIN Excluded e;



Örnek Dönem 2508 seçilirse

WITH Aktif_YemekCeki AS (
    SELECT 
        Kategori_ID,
        Ilk_Tarih,
        Son_Tarih,
        Tutar
    FROM SilverCloud.Yemek_Ceki
    WHERE CAST(DATE_FORMAT(Ilk_Tarih, '%y%m') AS UNSIGNED) <= 2508
      AND CAST(DATE_FORMAT(Son_Tarih, '%y%m') AS UNSIGNED) >= 2508
),
Excluded AS (
    SELECT 
        SUM(g.Tutar) AS Excluded_Tutar
    FROM Aktif_YemekCeki y
    JOIN SilverCloud.Gelir g 
      ON g.Kategori_ID = y.Kategori_ID
     AND CAST(DATE_FORMAT(g.Tarih, '%y%m') AS UNSIGNED) <> 2508
     AND g.Tarih >= y.Ilk_Tarih
     AND g.Tarih <= y.Son_Tarih
),
Included AS (
    SELECT 
        SUM(Tutar) AS Included_Tutar
    FROM Aktif_YemekCeki
)
SELECT 
    i.Included_Tutar - COALESCE(e.Excluded_Tutar,0) AS Donem_Tutar
FROM Included i
CROSS JOIN Excluded e;






------
Kullanılamayacak ama Yemek Çeki detay Görmek için lazım olabilir 

WITH Aktif_YemekCeki AS (
    SELECT 
        Kategori_ID,
        Tutar,
        Ilk_Tarih,
        Son_Tarih
    FROM SilverCloud.Yemek_Ceki
    WHERE CAST(DATE_FORMAT(Ilk_Tarih, '%y%m') AS UNSIGNED) <= 2508
      AND CAST(DATE_FORMAT(Son_Tarih, '%y%m') AS UNSIGNED) >= 2508
),
Excluded AS (
    SELECT 
        y.Kategori_ID,
        SUM(g.Tutar) AS Excluded_Tutar
    FROM Aktif_YemekCeki y
    JOIN SilverCloud.Gelir g 
      ON g.Kategori_ID = y.Kategori_ID
     AND CAST(DATE_FORMAT(g.Tarih, '%y%m') AS UNSIGNED) <> 2508
     AND g.Tarih >= y.Ilk_Tarih
     AND g.Tarih <= y.Son_Tarih
    GROUP BY y.Kategori_ID
),
Included AS (
    SELECT 
        y.Kategori_ID,
        SUM(y.Tutar) AS Included_Tutar
    FROM Aktif_YemekCeki y
    GROUP BY y.Kategori_ID
)
SELECT 
    i.Kategori_ID,
    i.Included_Tutar,
    COALESCE(e.Excluded_Tutar,0) AS Excluded_Tutar,
    i.Included_Tutar - COALESCE(e.Excluded_Tutar,0) AS Donem_Tutar
FROM Included i
LEFT JOIN Excluded e 
  ON i.Kategori_ID = e.Kategori_ID;

## 8. VPS Dashboard Raporu Hesaplama Detayları

Bu bölümde, "VPS Dashboard" raporunda yer alan her bir metriğin nasıl hesaplandığına dair teknik detaylar ve kod mantığı açıklanmaktadır. Rapor, `CopyCat/pages/VPSDashboard.tsx` dosyasında, seçilen aydaki personel ve operasyonel verileri (`useDataContext` üzerinden) birleştirerek günlük ve aylık bazda metrikler oluşturur.

### 8.1. Ana Metrikler (Günlük ve Ortalama)

Bu metrikler, raporun üst kısmındaki analiz tablosunda her bir gün için ayrı ayrı ve aylık ortalama olarak hesaplanır.

-   **Çalışan Ortalaması**:
    -   **Veri Kaynağı**: `calisanList`
    -   **Mantık**: İlgili ayın her bir günü için, o gün sigorta giriş tarihi geçmiş ve sigorta çıkış tarihi gelmemiş olan (yani o gün "aktif" olan) toplam çalışan sayısı bulunur. Raporun üstündeki kartta bu günlük sayıların aylık ortalaması gösterilir.

-   **Aktif Çalışan Ortalaması**:
    -   **Veri Kaynağı**: `puantajList`, `puantajSecimiList`
    -   **Mantık**: İlgili ayın her bir günü için, puantajda "Çalışma" içeren bir seçime sahip olan çalışanların sayısı toplanır. Raporun üstündeki kartta bu günlük sayıların aylık ortalaması gösterilir.

-   **İzinli Çalışan Ortalaması**:
    -   **Veri Kaynağı**: `puantajList`, `puantajSecimiList`
    -   **Mantık**: İlgili ayın her bir günü için, puantajda "İzin" içeren bir seçime sahip olan çalışanların sayısı toplanır. Raporun üstündeki kartta bu günlük sayıların aylık ortalaması gösterilir.

-   **Puantaj Günü**:
    -   **Veri Kaynağı**: `puantajList`, `puantajSecimiList`
    -   **Mantık**: İlgili ayın her bir günü için, o güne ait tüm puantaj kayıtları bulunur. Her bir kaydın `Puantaj_Secimi`'ne karşılık gelen `Degeri` (örn: Tam Gün Çalışma = 1.0, Yarım Gün İzin = 0.5) ile çarpılır ve o gün için tüm çalışanların değerleri toplanarak günlük "Puantaj Günü" bulunur.

-   **Tabak Sayısı**:
    -   **Veri Kaynağı**: `gelirEkstraList`
    -   **Mantık**: İlgili ayın her bir günü için, `gelirEkstraList` içindeki o güne ait kaydın `Tabak_Sayisi` alanı doğrudan alınır.

-   **VPS (Personel Başına Ziyaretçi Sayısı)**:
    -   **Mantık**: Günlük `Tabak Sayısı` / Günlük `Çalışan Sayısı`. Bu hesaplama her bir gün için ayrı ayrı yapılır.

### 8.2. KPI Kartları (Aylık Toplam)

-   **İşe Giren Çalışan Sayısı**:
    -   **Veri Kaynağı**: `calisanList`
    -   **Mantık**: `Sigorta_Giris` tarihi, raporun seçili ayı içinde olan toplam çalışan sayısıdır.

-   **İşten Çıkan Çalışan Sayısı**:
    -   **Veri Kaynağı**: `calisanList`
    -   **Mantık**: `Sigorta_Cikis` tarihi, raporun seçili ayı içinde olan toplam çalışan sayısıdır.

### 8.3. Puantaj Özeti Tablosu

-   **Mantık**: Bu tablo, "Puantaj Seçim Yönetimi" ekranında tanımlanmış olan her bir puantaj türü (örn: Yıllık İzin, Raporlu, Ücretsiz İzin vb.) için, ayın her bir gününde o puantaj türüne sahip kaç kişi olduğunu sayar ve tabloya yazar. Bu, ay boyunca personel devamlılığının detaylı bir dökümünü suna


SELECT count(*) FROM SilverCloud.Calisan
where Sigorta_Giris BETWEEN Ekran.Donem.ilkGun AND Ekran.Donem.SonGun;
Örnek 
SELECT count(*) FROM SilverCloud.Calisan
where Sigorta_Giris BETWEEN '2025-08-01' AND '2025-08-31';


SELECT count(*) FROM SilverCloud.Calisan
where Sigorta_Cikis BETWEEN Ekran.Donem.ilkGun AND Ekran.Donem.SonGun;
Örnek 
SELECT count(*) FROM SilverCloud.Calisan
where Sigorta_Cikis BETWEEN '2025-08-01' AND '2025-08-31';

SELECT count(TC_No) FROM SilverCloud.Puantaj where Tarih= Donem + Ekran.MetricGun (Format YYYY-MM-DD)
and Secim_ID=(SELECT Secim_ID FROM SilverCloud.Puantaj_Secimi where Secim =Ekran.Secim);
Örnek..
SELECT count(TC_No) FROM SilverCloud.Puantaj where Tarih='2025-08-01' 
and Secim_ID=(SELECT Secim_ID FROM SilverCloud.Puantaj_Secimi where Secim ='Çalışıyor');

SELECT 
    p.Tarih,
    COUNT(p.TC_No) AS Kayit_Sayisi
FROM SilverCloud.Puantaj p
INNER JOIN SilverCloud.Puantaj_Secimi s 
    ON p.Secim_ID = s.Secim_ID
WHERE p.Tarih BETWEEN Ekran.Donem.ilkGun AND Ekran.Donem.SonGun
  AND s.Secim LIKE '%Çalışma%'
GROUP BY p.Tarih
ORDER BY p.Tarih;
Örnek
SELECT 
    p.Tarih,
    COUNT(p.TC_No) AS Kayit_Sayisi
FROM SilverCloud.Puantaj p
INNER JOIN SilverCloud.Puantaj_Secimi s 
    ON p.Secim_ID = s.Secim_ID
WHERE p.Tarih BETWEEN '2025-08-01' AND '2025-08-31'
  AND s.Secim LIKE '%Çalışma%'
GROUP BY p.Tarih
ORDER BY p.Tarih;

WITH RECURSIVE takvim AS (
    SELECT DATE(Ekran.Donem.ilkGun) AS Tarih
    UNION ALL
    SELECT DATE_ADD(Tarih, INTERVAL 1 DAY)
    FROM takvim
    WHERE Tarih < Ekran.Donem.SonGun
)
-- 2. Çalışanları günlere göre say
SELECT 
    t.Tarih,
    COUNT(c.TC_No) AS Calisan_Sayisi
FROM takvim t
LEFT JOIN SilverCloud.Calisan c
  ON c.Sigorta_Giris <= t.Tarih
 AND (c.Sigorta_Cikis IS NULL OR c.Sigorta_Cikis > t.Tarih)
GROUP BY t.Tarih
ORDER BY t.Tarih;

Örnek
-- 1. Ağustos 2025 için gün listesi oluştur
WITH RECURSIVE takvim AS (
    SELECT DATE('2025-08-01') AS Tarih
    UNION ALL
    SELECT DATE_ADD(Tarih, INTERVAL 1 DAY)
    FROM takvim
    WHERE Tarih < '2025-08-31'
)
-- 2. Çalışanları günlere göre say
SELECT 
    t.Tarih,
    COUNT(c.TC_No) AS Calisan_Sayisi
FROM takvim t
LEFT JOIN SilverCloud.Calisan c
  ON c.Sigorta_Giris <= t.Tarih
 AND (c.Sigorta_Cikis IS NULL OR c.Sigorta_Cikis > t.Tarih)
GROUP BY t.Tarih
ORDER BY t.Tarih;

SELECT Tabak_Sayisi FROM SilverCloud.GelirEkstra 
WHERE Tarih BETWEEN Ekran.Donem.ilkGun AND Ekran.Donem.SonGun

Örnek 
SELECT Tabak_Sayisi FROM SilverCloud.GelirEkstra 
WHERE Tarih BETWEEN '2025-08-01' AND '2025-08-31'

SELECT 
    p.Tarih,
    s.Secim,
    COUNT(p.TC_No) AS Kayit_Sayisi
FROM SilverCloud.Puantaj p
INNER JOIN SilverCloud.Puantaj_Secimi s 
    ON p.Secim_ID = s.Secim_ID
WHERE p.Tarih BETWEEN Ekran.Donem.ilkGun AND Ekran.Donem.SonGun   -- dönem aralığı
GROUP BY p.Tarih, s.Secim
ORDER BY p.Tarih, s.Secim;

SELECT
    x.Tarih,
    SUM(x.Kayit_Sayisi * x.Degeri) AS Toplam_Deger
FROM (
    SELECT
        p.Tarih,
        p.Secim_ID,
        s.Degeri,
        COUNT(p.TC_No) AS Puantaj_Gunu
    FROM SilverCloud.Puantaj p
    JOIN SilverCloud.Puantaj_Secimi s
      ON p.Secim_ID = s.Secim_ID
    WHERE p.Tarih BETWEEN Ekran.Donem.ilkGun AND Ekran.Donem.SonGun
    GROUP BY p.Tarih, p.Secim_ID, s.Degeri
) AS x
GROUP BY x.Tarih
ORDER BY x.Tarih;

Örnek
SELECT
    x.Tarih,
    SUM(x.Kayit_Sayisi * x.Degeri) AS Puantaj_Gunu
FROM (
    SELECT
        p.Tarih,
        p.Secim_ID,
        s.Degeri,
        COUNT(p.TC_No) AS Kayit_Sayisi
    FROM SilverCloud.Puantaj p
    JOIN SilverCloud.Puantaj_Secimi s
      ON p.Secim_ID = s.Secim_ID
    WHERE p.Tarih BETWEEN '2025-08-01' AND '2025-08-31'
    GROUP BY p.Tarih, p.Secim_ID, s.Degeri
) AS x
GROUP BY x.Tarih
ORDER BY x.Tarih;

## 9. Yemek Çeki Kontrol Dashboard Hesaplama Detayları

Bu bölümde, "Yemek Çeki Kontrol Dashboard" raporunda yer alan metriklerin nasıl hesaplandığına dair teknik detaylar ve kod mantığı açıklanmaktadır. Rapor, `CopyCat/pages/YemekCekiKontrolDashboard.tsx` dosyasında, seçilen şube ve dönem için birden çok veri kaynağını (`useDataContext` üzerinden) birleştirerek oluşturulur.

### 9.1. Temel Mantık

Raporun amacı, yemek çeki firmalarından (Sodexo, Multinet vb.) gelen gelirler ile bu firmalara kesilen faturalar ve alınan ödemeler arasındaki mutabakatı sağlamaktır. Rapor, "Yemek Çeki" üst kategorisine ait her bir alt kategori (örn: Sodexo, Multinet) için ayrı ayrı hesaplama yapar.

### 9.2. Veri Kaynakları

-   `yemekCekiList`: Yönetim ekranından girilen, her bir çek anlaşmasının detaylarını (toplam tutar, başlangıç/bitiş tarihi, ödeme tarihi vb.) içerir.
-   `gelirList`: "Gelir Girişi" ekranından girilen günlük gelirleri içerir.
-   `eFaturaList`: Sisteme yüklenen tüm e-faturaları içerir.
-   `eFaturaReferansList`: Fatura alıcısı ile kategori arasında bağlantı kuran referansları içerir.
-   `odemeList`: Banka ekstrelerinden yüklenen ödeme kayıtlarını içerir.
-   `kategoriList` ve `ustKategoriList`: Kategori hiyerarşisini tanımlar.

### 9.3. Hesaplama Adımları

Her bir yemek çeki kategorisi için aşağıdaki metrikler hesaplanır:

-   **Aylık Gelir (`grupAylikGelir`)**:
    -   **Mantık**: `gelirList` içinden, ilgili kategoriye ve seçili rapor dönemine ait tüm gelir kayıtlarının `Tutar`'ları toplanır. Bu, o ay kasaya girdiği varsayılan tutardır.

-   **Dönem Tutar (`grupDonemTutar`)**:
    -   **Mantık**: Bu, bir çek anlaşmasının raporun seçili dönemine denk gelen payını hesaplar.
    1.  Öncelikle, rapor dönemiyle zaman aralığı kesişen `yemekCekiList` içindeki ilgili çek anlaşmaları bulunur.
    2.  Her bir çek için, toplam `Tutar`'ından, rapor döneminden *önceki* ve *sonraki* aylara ait gelirler düşülür.
        -   **Önceki Dönem Tutar**: Çekin başlangıç tarihi ile rapor döneminin başlangıcı arasındaki `gelirList` kayıtlarının toplamıdır.
        -   **Sonraki Dönem Tutar**: Rapor döneminin bitişi ile çekin bitiş tarihi arasındaki `gelirList` kayıtlarının toplamıdır.
    3.  **Hesaplama**: `Dönem Tutar` = `Yemek_Ceki.Tutar` - `Önceki Dönem Tutar` - `Sonraki Dönem Tutar`.

-   **Fark (`grupFark`)**:
    -   **Mantık**: `Dönem Tutar` - `Aylık Gelir`. Bu fark, o ay için hak edilen tutar ile kasaya giren tutar arasındaki farkı gösterir.

-   **Fatura Durumu (`faturaStatus`)**:
    -   **Mantık**: İlgili `Yemek_Ceki` kaydının `Tutar` ve `Son_Tarih` bilgileri ile eşleşen bir "Giden Fatura" kaydının `eFaturaList`'te olup olmadığı kontrol edilir. Eşleşme, `eFaturaReferansList` üzerinden kategori adı ile alıcı unvanı eşleştirilerek yapılır. Sonuç "Kesildi" veya "Beklemede" olarak gösterilir.

-   **Ödeme Tutarı (`odemeTutari`)**:
    -   **Veri Kaynağı**: `odemeList`, `kategoriList`
    -   **Mantık**: İlgili `Yemek_Ceki` kaydının `Odeme_Tarih`'i ve kategorisine karşılık gelen "Ödemesi" kategorisindeki (örn: "Sodexo Ödemesi") bir kaydın `odemeList`'te olup olmadığı kontrol edilir. Eşleşen bir ödeme bulunursa, `Tutar`'ı bu alanda gösterilir.

### 9.4. Genel Toplamlar

-   Raporun en üstündeki özet kartları ve en altındaki toplam satırı, tüm yemek çeki kategorileri için hesaplanan `Aylık Gelir`, `Dönem Tutar` ve `Fark` metriklerinin genel toplamını gösterir.

Ekran Parametreleri

Ekran.Dönem (Zorunlu)
Örnek:

2508 → Ağustos 2025

2509 → Eylül 2025

Ekran.Kategori (Dinamik)
→ Yalnızca Kategori.ÜstKategori = "Yemek Çeki" olan kategoriler listelenecek

Üst Bilgiler (Toplamlar)

Aylık Toplam Gelir
SUM(Gelir.Tutar)
→ Kategori.ÜstKategori = "Yemek Çeki" ve Donem = Ekran.Dönem

Dönem Tutar Toplamı
→ Aşağıdaki satır bazlı hesaplamalardan gelen Dönem Tutar toplamı

Fark
Aylık Toplam Gelir – Dönem Tutar Toplamı

Kontrol Edilen Kayıt
COUNT(*) FROM Yemek_Ceki
→ Eğer Yemek_Ceki.İlk_Tarih <= Ekran.Dönem.Son_Gün
VE Yemek_Ceki.Son_Tarih >= Ekran.Dönem.İlk_Gün
VE Yemek_Ceki.Kategori IN (SELECT Kategori FROM Kategori WHERE Kategori.ÜstKategori = 'Yemek Çeki')

Satır Bazlı Kayıtlar (Detay Tablosu)

Gösterilecek Alanlar:

Ekran.Kategori (Yalnızca ÜstKategori = "Yemek Çeki")

Yemek_Ceki.İlk_Tarih

Yemek_Ceki.Son_Tarih

Yemek_Ceki.Tutar

Önceki Dönem

Sonraki Dönem

Dönem Tutar

Fatura

Fatura Tarihi

Ödeme Tarihi

Hesaplama Kuralları

Önceki Dönem

Eğer Yemek_Ceki.İlk_Tarih < Ekran.Dönem.İlk_Gün ise:
SUM(Gelir.Tutar)
→ Aralık: Yemek_Ceki.İlk_Tarih >= ve < Ekran.Dönem.İlk_Gün
→ Filtre: Gelir.Kategori = Ekran.Kategori

Sonraki Dönem

Eğer Yemek_Ceki.Son_Tarih > Ekran.Dönem.Son_Gün ise:
SUM(Gelir.Tutar)
→ Aralık: Ekran.Dönem.Son_Gün < ve <= Yemek_Ceki.Son_Tarih
→ Filtre: Gelir.Kategori = Ekran.Kategori

Dönem Tutar
Yemek_Ceki.Tutar – Önceki Dönem – Sonraki Dönem

Fatura

Kesildi → eğer aşağıdaki kayıt varsa:

e_Fatura.Giden_Fatura = 1
AND e_Fatura.Tarih = Yemek_Ceki.Tarih
AND e_Fatura.Tutar = Yemek_Ceki.Tutar



Beklemede → aksi durumda

Fatura Tarihi

Eğer Fatura = Kesildi → e_Fatura.Tarih

Eğer Fatura = Beklemede → boş

Ödeme Tarihi

Eğer Fatura = Kesildi:

Odeme.Tarih BETWEEN Yemek_Ceki.Odeme_Tarih AND Yemek_Ceki.Odeme_Tarih +3
AND Odeme.Kategori = Ekran.Kategori + ' Ödemesi'


→ Eşleşen Odeme.Tarih yazılacak

## 10. Online Kontrol Dashboard Hesaplama Detayları

Bu bölümde, "Online Kontrol Dashboard" raporunda yer alan metriklerin nasıl hesaplandığına dair teknik detaylar ve kod mantığı açıklanmaktadır. Rapor, `CopyCat/pages.tsx` dosyasındaki `OnlineKontrolDashboardPage` bileşeninde, seçilen aydaki online platform verilerini (`useDataContext` üzerinden) birleştirerek haftalık bazda bir mutabakat sunar.

### 10.1. Temel Mantık

Raporun amacı, online satış platformlarından (Getir, Trendyol, Yemeksepeti vb.) elde edilen gelirler ile bu platformların B2B ekstrelerinde görünen "virman" (bankaya geçen tutar) ve "komisyon" tutarlarını karşılaştırmaktır. Rapor, seçilen ayı haftalara bölerek (1-7, 8-14, 15-21, 22-28, 29-son gün) analizi sunar.

### 10.2. Veri Kaynakları

-   `gelirList`: "Gelir Girişi" ekranından girilen günlük gelirleri içerir.
-   `b2bEkstreList`: B2B ekstrelerinden yüklenen, virman ve komisyon gibi detayları içeren kayıtları barındırır.
-   `kategoriList` ve `ustKategoriList`: Online platformları temsil eden kategorileri ("Şefteniste" üst kategorisi altındakiler) tanımlar.

### 10.3. Hesaplama Adımları

Her bir online platform ve her bir hafta için aşağıdaki metrikler hesaplanır:

-   **Haftalık Gelir (`calculateWeeklyGelir`)**:
    -   **Mantık**: `gelirList` içinden, ilgili platforma (kategoriye) ve ilgili haftanın tarih aralığına denk gelen tüm gelir kayıtlarının `Tutar`'ları toplanır.

-   **Haftalık Virman (`calculateVirman`)**:
    -   **Veri Kaynağı**: `b2bEkstreList`
    -   **Mantık**: `b2bEkstreList` içinden, `Donem`'i seçili rapor dönemiyle eşleşen kayıtlar filtrelenir. Ardından, `Aciklama` alanı belirli bir kalıba uyan (örn: "01-07 Eylül Getir Online Alacak Virmanlar") kayıtların `Alacak` tutarları toplanır. Açıklama metnindeki boşluklar ve büyük/küçük harf farkları göz ardı edilir.

-   **Aylık Komisyon (`calculateMonthlyKomisyon`)**:
    -   **Veri Kaynağı**: `b2bEkstreList`
    -   **Mantık**: `b2bEkstreList` içinden, `Donem`'i seçili rapor dönemiyle eşleşen kayıtlar filtrelenir. Ardından, `Aciklama` alanı `<Ay Adı> <Platform Adı> Komisyon Yansıtma` kalıbına uyan kayıtların `Borc` tutarları toplanır.

-   **Komisyon %**:
    -   **Mantık**: (`Aylık Komisyon` / `Aylık Toplam Virman`) * 100. Bu hesaplama, her platform için aylık bazda yapılır.

### 10.4. Genel Toplamlar

-   Raporun en alt satırı, tüm platformlar için her bir haftanın "Gelir" ve "Virman" toplamlarını, ayrıca tüm ay için "Toplam Gelir", "Toplam Virman" ve "Toplam Komisyon" değerlerini gösterir.



## 11. POS Kontrol Dashboard Hesaplama Detayları

Bu bölümde, "POS Kontrol Dashboard" raporunda yer alan metriklerin nasıl hesaplandığına dair teknik detaylar ve kod mantığı açıklanmaktadır. Bu rapor, diğerlerinden farklı olarak, ana hesaplama ve karşılaştırma mantığını arka uçta (backend) çalıştırır. Ön uç (`CopyCat/pages/POSKontrolDashboard.tsx`), işlenmiş verileri API'den alarak kullanıcıya sunar.

### 11.1. Veri Kaynağı (API Uç Noktası)

Rapor, tüm veriyi tek bir API çağrısı ile alır:

-   **Uç Nokta**: `/pos-kontrol/{sube_id}/{donem}`
-   **Dönen Veri**: Seçilen şube ve dönem için, ayın her gününe ait aşağıdaki verileri içeren bir liste döndürür:
    -   `Tarih`: İlgili gün.
    -   `Gelir_POS`: O gün "Gelir Girişi" ekranından "POS" kategorisi ile girilmiş gelirlerin toplamı.
    -   `POS_Hareketleri`: O gün bankadan gelen ve sisteme yüklenmiş POS hareketlerinin brüt işlem tutarı toplamı.
    -   `POS_Kesinti`: Bankadan gelen POS hareketlerindeki kesinti tutarı toplamı.
    -   `POS_Net`: `POS_Hareketleri` - `POS_Kesinti`.
    -   `Odeme`: O gün "Ödeme Yükleme" ekranından yüklenmiş ve POS ile ilişkili ödeme kayıtlarının toplamı.
    -   `Odeme_Kesinti`: POS ile ilişkili ödeme kayıtlarındaki kesinti tutarı.
    -   `Odeme_Net`: `Odeme` - `Odeme_Kesinti`.
    -   `Kontrol_POS`: Arka uçta yapılan kontrolün sonucu ('OK' veya 'Not OK').
    -   `Kontrol_Kesinti`: Arka uçta yapılan kesinti kontrolünün sonucu ('OK' veya 'Not OK').

### 11.2. Arka Uç (Backend) Hesaplama Mantığı

Arka uç, her bir gün için aşağıdaki karşılaştırmaları yaparak `Kontrol_POS` ve `Kontrol_Kesinti` alanlarını doldurur:

-   **`Kontrol_POS`**:
    -   **Mantık**: O güne ait `Gelir_POS` tutarı ile `POS_Hareketleri` tutarı karşılaştırılır.
    -   **Sonuç**: Eğer iki tutar birbirine eşitse (veya çok küçük bir tolerans dahilindeyse) "OK", değilse "Not OK" olarak işaretlenir.

-   **`Kontrol_Kesinti`**:
    -   **Mantık**: O güne ait `POS_Kesinti` tutarı ile `Odeme_Kesinti` tutarı karşılaştırılır.
    -   **Sonuç**: Eğer iki tutar birbirine eşitse "OK", değilse "Not OK" olarak işaretlenir.

### 11.3. Ön Uç (Frontend) Görevleri

-   **Veri Gösterimi**: API'den gelen günlük verileri bir tablo halinde gösterir. `Kontrol_POS` ve `Kontrol_Kesinti` alanlarının sonucuna göre ilgili satırı yeşil ("OK") veya kırmızı ("Not OK") ile renklendirir.
-   **Genel Toplamlar**: Tablonun en altında, `Gelir_POS`, `POS_Hareketleri`, `POS_Kesinti` gibi tüm sayısal sütunların aylık toplamlarını hesaplayarak gösterir.
-   **Özet İstatistikler**: API'den gelen `summary` verisini (toplam kayıt, başarılı/hatalı eşleşme sayısı, başarı oranı) raporun altında gösterir.

## 12. Nakit Yatırma Kontrol Raporu Hesaplama Detayları

Bu bölümde, "Nakit Yatırma Kontrol Raporu"nun nasıl çalıştığı, hangi verileri kullandığı ve eşleştirme mantığının teknik detayları açıklanmaktadır. Rapor, `CopyCat/pages/NakitYatirmaRaporu.tsx` dosyasında, arka uçtan alınan iki farklı veri setini ön uçta karşılaştırarak oluşturulur.

### 12.1. Veri Kaynağı (API Uç Noktası)

Rapor, tüm veriyi tek bir API çağrısı ile alır:

-   **Uç Nokta**: `/nakit-yatirma-kontrol/{sube_id}/{donem}`
-   **Dönen Veri**: API, seçilen şube ve dönem için iki ayrı liste döndürür:
    1.  **`bankaya_yatan`**: `Odeme` tablosundan, `Kategori_ID`'si "Bankaya Yatan" olarak belirlenmiş kayıtların listesi.
    2.  **`nakit_girisi`**: `Nakit` tablosundan, `Tip`'i "Nakit Girişi" olan kayıtların listesi.

### 12.2. Ön Uç (Frontend) Eşleştirme Mantığı

Raporun temel işlevi, `bankaya_yatan` listesindeki her bir kaydı, `nakit_girisi` listesindeki bir kayıtla bire bir eşleştirmektir.

-   **Eşleştirme Kriterleri**:
    1.  **Dönem Eşleşmesi**: Her iki kaydın da `Donem` alanı aynı olmalıdır.
    2.  **Tutar Eşleşmesi**: Her iki kaydın `Tutar` alanı birbirine çok yakın olmalıdır. Kodda, bu karşılaştırma için `0.01` (bir kuruş) gibi küçük bir tolerans payı kullanılır.

-   **Eşleştirme Süreci**:
    1.  `bankaya_yatan` listesindeki her bir kayıt sırayla ele alınır.
    2.  Bu kayıt için, `nakit_girisi` listesinde daha önce başka bir kayıtla eşleşmemiş ve yukarıdaki **Dönem** ve **Tutar** kriterlerini sağlayan ilk kayıt aranır.
    3.  Bir eşleşme bulunduğunda, her iki kayıt da "eşleşti" olarak kabul edilir ve arayüzde yeşil renkle vurgulanır.
    4.  Eğer `bankaya_yatan` listesindeki bir kayıt için `nakit_girisi` listesinde uygun bir eşleşme bulunamazsa, bu kayıt "eşleşmedi" olarak kabul edilir ve kırmızı renkle vurgulanır.
    5.  Aynı şekilde, `nakit_girisi` listesinde herhangi bir `bankaya_yatan` kaydı ile eşleşmeyen tüm kayıtlar da "eşleşmedi" olarak işaretlenir.

### 12.3. Arayüz ve Gösterim

-   **İkili Tablo Yapısı**: Arayüzde, "Bankaya Yatan" ve "Nakit Girişi" için iki ayrı tablo yan yana gösterilir.
-   **Görsel Vurgu**: Eşleşen kayıtlar yeşil, eşleşmeyenler ise kırmızı bir çizgi ile görsel olarak belirtilir, bu da kullanıcıların farkları hızla tespit etmesini sağlar.
-   **Özet İstatistikler**:
    -   Her iki tablonun kendi içindeki toplam tutarları ve kayıt sayıları gösterilir.
    -   İki tablonun toplam tutarları arasındaki **Fark** hesaplanır.
    -   Eşleşen ve eşleşmeyen kayıt sayıları belirtilir.
    -   Genel **Eşleşme Oranı** (`Eşleşen Kayıt Sayısı * 2 / Toplam Kayıt Sayısı`) yüzde olarak gösterilir.
	
	## 13. Gelir Girişi Ekranı Hesaplama Detayları

Bu bölümde, "Gelir Girişi" ekranının nasıl çalıştığı, hangi verileri kullandığı ve yapılan hesaplamaların teknik detayları açıklanmaktadır. Ekran, `CopyCat/pages.tsx` dosyasındaki `GelirPage` bileşeninde tanımlanmıştır ve kullanıcıların günlük gelirlerini manuel olarak girmesine olanak tanır.

### 13.1. Temel İşlevsellik

-   **Arayüz**: Ekran, seçilen ayın günlerini sütun olarak, gelir kalemlerini ise satır olarak gösteren bir tablo (matris) yapısındadır.
-   **Veri Girişi**: Kullanıcılar, her bir gün ve her bir gelir kalemi için (örn: RobotPos Tutar, Nakit, Kredi Kartı) ilgili hücreye tıklayarak veya değer girerek veri girişi yapabilir.
-   **Dönem Kontrolü**: Kullanıcılar aylar arasında geçiş yapabilir. Geçmiş dönemlere veri girişi, özel bir yetkiye (`GELIR_GECMISI_YETKI_ADI`) sahip olmayan kullanıcılar için kısıtlanmıştır (sadece içinde bulunulan ay ve bir önceki ayın ilk 5 günü düzenlenebilir).

### 13.2. Veri Kaynakları ve Yönetimi

-   **`gelirEkstraList`**: `RobotPos_Tutar` ve `ZRapor_Tutar` gibi özel gelir kalemlerinin günlük değerlerini tutar. `handleEkstraChange` fonksiyonu ile bu veriler güncellenir.
-   **`gelirList`**: "Kategori Yönetimi"nde tanımlanmış ve tipi "Gelir" olan diğer tüm kategorilerin günlük tutarlarını tutar. `handleTutarChange` fonksiyonu ile bu veriler güncellenir.
-   **`eFaturaList`** ve **`digerHarcamaList`**: "Günlük Harcama" olarak işaretlenmiş giderleri, özet satırlarında göstermek için kullanılır.

### 13.3. Tablo Satırları ve Hesaplamalar

#### Veri Giriş Satırları:

-   **RobotPos Tutar** ve **Z Rapor Tutar**:
    -   **Mantık**: Kullanıcının girdiği değerler, ilgili gün için `gelirEkstraList` tablosundaki kaydı oluşturur veya günceller.
-   **Diğer Gelir Kalemleri** (Kategorilerden gelir):
    -   **Mantık**: "Kategori Yönetimi"nde tanımlanmış, tipi "Gelir" olan her bir kategori (örn: Nakit, Kredi Kartı, Yemek Çeki) için bir satır oluşturulur. Kullanıcının girdiği değerler, ilgili gün ve kategori için `gelirList` tablosundaki kaydı oluşturur veya günceller.

#### Özet ve Kontrol Satırları:

-   **Toplam Satış Gelirleri**:
    -   **Mantık**: Her bir gün (sütun) için, o güne ait tüm "Gelir" tipi kategorilerin tutarları toplanır.
-   **Günlük Harcama-eFatura**:
    -   **Mantık**: `eFaturaList` içinden, `Gunluk_Harcama` bayrağı `True` olan ve tarihi ilgili güne denk gelen faturaların tutarları toplanır.
-   **Günlük Harcama-Diğer**:
    -   **Mantık**: `digerHarcamaList` içinden, `Gunluk_Harcama` bayrağı `True` olan ve tarihi ilgili güne denk gelen harcamaların tutarları toplanır.
-   **GÜNLÜK TOPLAM**:
    -   **Formül**: `Toplam Satış Gelirleri` - `Günlük Harcama-eFatura` - `Günlük Harcama-Diğer`
    -   **Açıklama**: O günün net gelir/gider durumunu gösterir.

#### Günlük Validasyon:

-   **Mantık**: Her bir gün için, `RobotPos Tutar` değeri, o günkü `Toplam Satış Gelirleri`'nden büyükse, ilgili günün başlığının yanında bir uyarı ikonu (⚠️) gösterilir. Bu, manuel girilen gelirlerin, otomatik gelen POS verisinden daha az olduğunu ve bir tutarsızlık olabileceğini belirtir.


## 14. Puantaj Girişi Ekranı Hesaplama Detayları

Bu bölümde, "Puantaj Girişi" ekranının nasıl çalıştığı, hangi verileri kullandığı ve yapılan hesaplamaların teknik detayları açıklanmaktadır. Ekran, `CopyCat/pages.tsx` dosyasındaki `PuantajPage` bileşeninde tanımlanmıştır ve çalışanların aylık devamlılık durumlarını yönetmek için interaktif bir arayüz sunar.

### 14.1. Temel İşlevsellik

-   **Arayüz**: Ekran, seçilen ayın günlerini sütun, şubedeki aktif çalışanları ise satır olarak gösteren bir takvim (matris) yapısındadır.
-   **Veri Girişi**: Kullanıcı, bir çalışanın belirli bir gününe denk gelen hücreye tıkladığında, önceden tanımlanmış puantaj durumlarını (örn: Çalışma, Raporlu, Yıllık İzin) içeren bir seçim menüsü (popover) açılır.
-   **Kayıt/Güncelleme**: Kullanıcı bir durum seçtiğinde, o çalışan ve o tarih için `Puantaj` tablosunda bir kayıt oluşturulur veya mevcut kayıt güncellenir. "-- Boş --" seçeneği, mevcut kaydı siler.
-   **Dönem Kontrolü**: Kullanıcılar aylar arasında geçiş yapabilir. Geçmiş dönemlere veri girişi, özel bir yetkiye (`PUANTAJ_HISTORY_ACCESS_YETKI_ADI`) sahip olmayan kullanıcılar için kısıtlanmıştır.
-   **Validasyon**:
    -   Gelecek tarihlere veri girişi engellenir.
    -   Çalışanın sigorta giriş tarihinden öncesine veya çıkış tarihinden sonrasına veri girişi engellenir.

### 14.2. Veri Kaynakları

-   **`calisanList`**: İlgili şubedeki aktif çalışanların listesi.
-   **`puantajSecimiList`**: "Puantaj Seçim Yönetimi" ekranında tanımlanan, puantaj durumlarını (örn: "Çalışma"), değerlerini (örn: 1.0) ve renk kodlarını içeren liste.
-   **`puantajList`**: Belirli bir dönem için daha önce kaydedilmiş tüm puantaj verilerini içerir.

### 14.3. Tablo Hücreleri ve Hesaplamalar

-   **Hücre Gösterimi**:
    -   Her bir hücre (çalışan-gün kesişimi), o güne ait puantaj kaydını temsil eder.
    -   Hücrenin içindeki metin, `puantajSecimiList`'ten gelen `Secim` adıdır (örn: "Çalışma").
    -   Hücrenin arkaplan rengi, yine `puantajSecimiList`'ten gelen `Renk_Kodu` ile belirlenir.

-   **"Toplam" Sütunu Hesaplaması**:
    -   **Mantık**: Her bir çalışan (satır) için, o ayki tüm günlerin puantaj değerleri toplanır.
    -   **Süreç**:
        1.  Ayın her bir günü için, çalışanın o güne ait puantaj kaydı bulunur.
        2.  Bu kaydın `Secim_ID`'si kullanılarak, `puantajSecimiList`'ten karşılık gelen `Degeri` alanı alınır (örn: "Tam Gün Çalışma" için 1.0, "Yarım Gün İzin" için 0.5).
        3.  Ayın tüm günleri için bulunan bu değerler toplanır ve çalışanın satır sonundaki "Toplam" sütununda gösterilir. Bu, çalışanın o ayki toplam çalışma gününe denk gelen puantaj puanını verir.

### 14.4. Lejant (Legend)

-   Ekranın altında, `puantajSecimiList`'teki tüm aktif puantaj türlerini, renklerini ve değerlerini gösteren bir lejant bulunur. Bu, kullanıcının tablodaki renklerin ve kısaltmaların anlamını kolayca anlamasını sağlar.

## 15. Veri Yükleme Ekranları Teknik Detayları

Bu bölümde, sisteme toplu veri aktarımı sağlayan yükleme ekranlarının çalışma mantığı, kabul ettikleri dosya formatları ve beklenen sütun yapıları detaylandırılmaktadır.

### 15.1. e-Fatura Yükleme (`InvoiceUploadPage`)

-   **Amaç**: Gelen ve giden e-faturaların toplu olarak sisteme kaydedilmesi.
-   **Dosya Formatı**: Excel (`.xlsx`, `.xls`).
-   **Çalışma Mantığı**:
    1.  Kullanıcı bir Excel dosyası seçer.
    2.  Ön uç (frontend), dosyayı tarayıcıda okur ve içeriğini JSON formatına çevirir.
    3.  Her bir satır için aşağıdaki alanların varlığı ve temel formatı kontrol edilir.
    4.  "Durum" sütununa bakılarak faturanın "Giden Fatura" olup olmadığına karar verilir.
    5.  "Alıcı Ünvanı" kullanılarak `eFaturaReferansList`'ten otomatik kategori ataması yapılmaya çalışılır.
    6.  Hazırlanan fatura listesi, tek bir API isteği ile (`/api/v1/e-faturalar/`) arka uca gönderilir.
    7.  Arka uç, veritabanına kayıt işlemini gerçekleştirir ve mükerrer kayıtları (`Fatura_Numarasi`'na göre) atlar.
-   **Gerekli Excel Sütunları**:
    -   `Fatura Tarihi`: Faturanın tarihi (GG.AA.YYYY formatı desteklenir).
    -   `Fatura Numarası`: Faturanın benzersiz numarası.
    -   `Alıcı Ünvanı` (veya `Alıcı Adı`): Faturanın kesildiği firma veya kişi.
    -   `Tutar`: Faturanın KDV dahil toplam tutarı.
    -   `Durum` (Opsiyonel): "Gönderildi" veya "Alıcı Kabul Etti" gibi ifadeler faturanın "Giden Fatura" olarak işaretlenmesini sağlar.

### 15.2. B2B Ekstre Yükleme (`B2BUploadPage`)

-   **Amaç**: Tedarikçi firmalardan (örn: Eczacıbaşı) alınan B2B ekstrelerinin sisteme yüklenmesi.
-   **Dosya Formatı**: Excel (`.xlsx`, `.xls`) veya CSV (`.csv`).
-   **Çalışma Mantığı**:
    1.  Kullanıcı bir dosya seçer.
    2.  Eğer dosya Excel formatında ise, ön uç bunu tarayıcıda CSV formatına dönüştürür.
    3.  Dosya, `FormData` olarak doğrudan arka uçtaki `/api/v1/b2b-ekstreler/upload/` uç noktasına gönderilir.
    4.  Tüm ayrıştırma (parsing), veri işleme ve veritabanına kaydetme mantığı **arka uç (backend)** tarafından yönetilir. Arka uç, CSV dosyasındaki sütunları ilgili veritabanı alanlarıyla eşleştirir.
-   **Gerekli Sütunlar**: Arka uç tarafından belirlenir. Genellikle `Fiş No`, `Tarih`, `Açıklama`, `Borc`, `Alacak` gibi standart ekstre sütunlarını içermesi beklenir.

### 15.3. Ödeme Yükleme (`OdemeYuklemePage`)

-   **Amaç**: Banka ekstrelerinden alınan ödeme (giden para çıkışı) kayıtlarının sisteme toplu olarak yüklenmesi.
-   **Dosya Formatı**: CSV (`.csv`), Excel (`.xlsx`, `.xls`).
-   **Çalışma Mantığı**:
    1.  Kullanıcı bir dosya seçer.
    2.  Eğer dosya Excel ise, ön uçta noktalı virgül (`;`) ile ayrılmış bir CSV formatına dönüştürülür. Bu dönüşüm sırasında tarih sütunları `GG/AA/YYYY` formatına getirilir.
    3.  Oluşturulan CSV dosyası, `FormData` olarak `/api/v1/odeme/upload-csv/` uç noktasına gönderilir.
    4.  Arka uç, bu CSV dosyasını işleyerek `Odeme` tablosuna kayıtları ekler.
-   **Gerekli Sütunlar**:
    -   `Tip`: Ödeme tipi (örn: EFT, Havale).
    -   `Hesap_Adi`: Ödemenin yapıldığı banka hesabı.
    -   `Tarih`: Ödeme tarihi (GG/AA/YYYY formatında).
    -   `Açıklama`: İşlem açıklaması.
    -   `Tutar`: Ödeme tutarı.

### 15.4. POS Hareketleri Yükleme (`POSHareketleriYuklemePage`)

-   **Amaç**: Bankalardan alınan POS işlem ekstrelerinin sisteme yüklenmesi.
-   **Dosya Formatı**: Excel (`.xlsx`). Eski `.xls` formatı desteklenmez.
-   **Çalışma Mantığı**:
    1.  Kullanıcı `.xlsx` formatında bir dosya seçer.
    2.  Dosya, `FormData` olarak doğrudan arka uçtaki `/api/v1/pos-hareketleri/upload/` uç noktasına gönderilir.
    3.  Tüm dosya okuma, veri ayrıştırma ve veritabanına kaydetme işlemleri **arka uç (backend)** tarafından yapılır.
-   **Gerekli Excel Sütunları**:
    -   `Islem_Tarihi`: İşlemin yapıldığı tarih.
    -   `Hesaba_Gecis`: Paranın hesaba geçtiği tarih.
    -   `Para_Birimi`: İşlem para birimi (örn: "TRY").
    -   `Islem_Tutari`: Brüt işlem tutarı.
    -   `Kesinti_Tutari`: Bankanın yaptığı kesinti.
    -   `Net_Tutar`: Hesaba geçen net tutar.

### 15.5. Tabak Sayısı Yükleme (`TabakSayisiYuklemePage`)

-   **Amaç**: Günlük satılan toplam tabak sayısı verisini toplu olarak güncellemek.
-   **Dosya Formatı**: Excel (`.xls`, `.xlsx`).
-   **Çalışma Mantığı**:
    1.  Kullanıcı bir Excel dosyası seçer.
    2.  Dosya, `FormData` olarak doğrudan arka uçtaki `/api/v1/upload-tabak-sayisi/` uç noktasına gönderilir.
    3.  Arka uç, Excel dosyasını okur ve her bir satırdaki `Tarih` bilgisine göre `GelirEkstra` tablosunda ilgili günü bulur ve o günün `Tabak_Sayisi` alanını günceller.
-   **Gerekli Excel Sütunları**:
    -   `Tarih`: Verinin ait olduğu tarih (DD-MM-YYYY SS:DD:SS formatı desteklenir).
    -   `Toplam Tabak Sayısı`: O gün satılan toplam tabak sayısı.


## 16. Test Betikleri (`Test Scripts/`)


Bu dizin, çeşitli test senaryoları ve yardımcı betikler içerir. Bu betikler, farklı modüllerin veya özelliklerin işlevselliğini test etmek, veri manipülasyonu yapmak veya belirli senaryoları doğrulamak için kullanılabilir.

-   **Örnek Betikler:**
    -   `test_efatura_matching.js`: E-fatura eşleştirme testleri.
    -   `test_odeme_rapor_implementation.py`: Ödeme raporu uygulaması testleri.
    -   `fetch_efatura_referans.py`: E-fatura referanslarını getirme betiği.

## 17. Diğer Önemli Dosyalar

-   **`run_server.py`**: Arka uç uygulamasını başlatmak için kullanılan ana betik.
-   **`update_kategoriler.py`**: Kategori verilerini güncellemek için kullanılan bir betik.
-   **`.gitignore`**: Git versiyon kontrol sistemi tarafından izlenmeyecek dosya ve dizinleri belirtir.
-   **`README.md`**: Proje hakkında genel bilgiler, kurulum talimatları ve kullanım kılavuzu içermesi beklenen ana dokümantasyon dosyası.

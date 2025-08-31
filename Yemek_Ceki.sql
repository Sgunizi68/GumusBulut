CREATE TABLE Yemek_Ceki (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Kategori_ID INT NOT NULL,
    Tarih DATE NOT NULL,
    Tutar DECIMAL(15,2) NOT NULL,
    Odeme_Tarih DATE NOT NULL,
    Ilk_Tarih DATE NOT NULL,
    Son_Tarih DATE NOT NULL,
    Sube_ID INT NOT NULL DEFAULT 1,
    Kayit_Tarihi DATETIME DEFAULT NOW(),
    CONSTRAINT fk_YEF_sube 
        FOREIGN KEY (Sube_ID) REFERENCES Sube(Sube_ID),
    CONSTRAINT fk_YEF_Kategori 
        FOREIGN KEY (Kategori_ID) REFERENCES Kategori(Kategori_ID),
    CONSTRAINT chk_YEF_Tarih CHECK (Ilk_Tarih <= Son_Tarih)
);

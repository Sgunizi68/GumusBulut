CREATE TABLE POS_Hareketleri (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    Islem_Tarihi DATE NOT NULL,
    Hesaba_Gecis DATE NOT NULL,
    Para_Birimi VARCHAR(5) NOT NULL,
    Islem_Tutari DECIMAL(15,2) NOT NULL,
    Kesinti_Tutari DECIMAL(15,2) DEFAULT 0.00,
    Net_Tutar DECIMAL(15,2),
    Kayit_Tarihi DATETIME DEFAULT NOW(),
    Sube_ID INT,
    CONSTRAINT fk_pos_sube FOREIGN KEY (Sube_ID) REFERENCES Sube(Sube_ID)
);


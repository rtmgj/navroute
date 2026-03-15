-- ============================================================
-- NavRoute — SQL Server Database Schema
-- ============================================================

-- ──────────────────────────────────────────────
-- 1. Users / Kullanicilar
-- ──────────────────────────────────────────────
CREATE TABLE Kullanicilar (
    KullaniciID   INT           IDENTITY(1,1) PRIMARY KEY,
    Ad            NVARCHAR(50)  NOT NULL,
    Soyad         NVARCHAR(50)  NOT NULL,
    Email         NVARCHAR(150) NOT NULL UNIQUE,
    Sifre         NVARCHAR(256) NOT NULL,   -- BCrypt hashed
    KayitTarihi   DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- ──────────────────────────────────────────────
-- 2. Locations / Konumlar
-- ──────────────────────────────────────────────
CREATE TABLE Konumlar (
    KonumID       INT            IDENTITY(1,1) PRIMARY KEY,
    KullaniciID   INT            NOT NULL REFERENCES Kullanicilar(KullaniciID) ON DELETE CASCADE,
    KonumAdi      NVARCHAR(200)  NOT NULL,
    Enlem         FLOAT          NOT NULL,   -- Latitude
    Boylam        FLOAT          NOT NULL,   -- Longitude
    Kategori      NVARCHAR(50)   NOT NULL DEFAULT 'genel'  -- restaurant | gas | hospital | star | genel
        CHECK (Kategori IN ('restaurant','gas','hospital','star','genel'))
);
GO

-- ──────────────────────────────────────────────
-- 3. Routes / Rotalar
-- ──────────────────────────────────────────────
CREATE TABLE Rotalar (
    RotaID            INT            IDENTITY(1,1) PRIMARY KEY,
    KullaniciID       INT            NOT NULL REFERENCES Kullanicilar(KullaniciID) ON DELETE CASCADE,
    BaslangicKonum    NVARCHAR(300)  NOT NULL,
    BitisKonum        NVARCHAR(300)  NOT NULL,
    Mesafe            NVARCHAR(30),     -- e.g. "12.4 km"
    Sure              NVARCHAR(30),     -- e.g. "23 dk"
    Tarih             DATETIME2        NOT NULL DEFAULT GETDATE()
);
GO

-- ──────────────────────────────────────────────
-- 4. Traffic Status / TrafikDurumu
-- ──────────────────────────────────────────────
CREATE TABLE TrafikDurumu (
    TrafikID           INT           IDENTITY(1,1) PRIMARY KEY,
    BolgeAdi           NVARCHAR(150) NOT NULL,
    YogunlukSeviyesi   NVARCHAR(10)  NOT NULL   -- 'green' | 'yellow' | 'red'
        CHECK (YogunlukSeviyesi IN ('green','yellow','red')),
    GuncellenmeTarihi  DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- ──────────────────────────────────────────────
-- 5. Favorites / Favoriler
-- ──────────────────────────────────────────────
CREATE TABLE Favoriler (
    FavoriID      INT       IDENTITY(1,1) PRIMARY KEY,
    KullaniciID   INT       NOT NULL REFERENCES Kullanicilar(KullaniciID) ON DELETE CASCADE,
    KonumID       INT       NOT NULL REFERENCES Konumlar(KonumID) ON DELETE NO ACTION,
    EklenmeTarihi DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_Favori UNIQUE (KullaniciID, KonumID)
);
GO

-- ──────────────────────────────────────────────
-- Indexes
-- ──────────────────────────────────────────────
CREATE INDEX IX_Konumlar_KullaniciID   ON Konumlar(KullaniciID);
CREATE INDEX IX_Rotalar_KullaniciID    ON Rotalar(KullaniciID);
CREATE INDEX IX_Rotalar_Tarih          ON Rotalar(Tarih DESC);
CREATE INDEX IX_Favoriler_KullaniciID  ON Favoriler(KullaniciID);
CREATE INDEX IX_TrafikDurumu_Bolge     ON TrafikDurumu(BolgeAdi);
GO

-- ──────────────────────────────────────────────
-- Seed data — demo user (password: 123456 bcrypt placeholder)
-- ──────────────────────────────────────────────
INSERT INTO Kullanicilar (Ad, Soyad, Email, Sifre)
VALUES ('Admin', 'User', 'admin@navroute.com',
        '$2a$12$placeholder_bcrypt_hash_here');

INSERT INTO TrafikDurumu (BolgeAdi, YogunlukSeviyesi)
VALUES
  ('Taksim - Beyoglu', 'red'),
  ('Eminonu',          'yellow'),
  ('Besiktas',         'green'),
  ('Kadikoy',          'yellow'),
  ('Sisli',            'green'),
  ('Uskudar',          'red');
GO

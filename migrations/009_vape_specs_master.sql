-- =============================================================
-- VAPE STORE - MIGRATION 009: MASTER SPESIFIKASI PRODUK
--
-- Tabel referensi berisi spesifikasi umum toko vape (kelompok,
-- label, nilai). Dipakai admin untuk menambah spesifikasi produk
-- dengan cepat & konsisten via pencarian di form produk.
-- =============================================================

CREATE TABLE IF NOT EXISTS payota_specs (
    id         serial PRIMARY KEY,
    group_name varchar(50)  NOT NULL DEFAULT 'Lainnya',
    label      varchar(120) NOT NULL,
    value      varchar(255) NOT NULL,
    sort_index integer      NOT NULL DEFAULT 0,
    UNIQUE (label, value)
);

-- Isi awal master spesifikasi (vape store umum).
INSERT INTO payota_specs (group_name, label, value, sort_index) VALUES
    ('Baterai', 'Kapasitas Baterai', '650 mAh', 10),
    ('Baterai', 'Kapasitas Baterai', '1000 mAh', 10),
    ('Baterai', 'Kapasitas Baterai', '1500 mAh', 10),
    ('Baterai', 'Kapasitas Baterai', '2500 mAh', 10),
    ('Baterai', 'Tipe Baterai', 'Internal', 11),
    ('Baterai', 'Tipe Baterai', '18650 (Dapat Dilepas)', 11),
    ('Baterai', 'Tipe Baterai', '21700 (Dapat Dilepas)', 11),
    ('Daya & Mode', 'Output Maksimum', '25 Watt', 20),
    ('Daya & Mode', 'Output Maksimum', '60 Watt', 20),
    ('Daya & Mode', 'Output Maksimum', '80 Watt', 20),
    ('Daya & Mode', 'Mode Vaping', 'MTL', 21),
    ('Daya & Mode', 'Mode Vaping', 'RDL', 21),
    ('Daya & Mode', 'Mode Vaping', 'DTL', 21),
    ('Pengisian', 'Konektor Pengisian', 'USB-C', 30),
    ('Pengisian', 'Konektor Pengisian', 'Micro-USB', 30),
    ('Pengisian', 'Waktu Pengisian', '± 45 Menit', 31),
    ('Pengisian', 'Fast Charging', 'Ya (QC 3.0)', 31),
    ('Coil & Pod', 'Tipe Coil', 'Meshed', 40),
    ('Coil & Pod', 'Tipe Coil', 'Single Coil', 40),
    ('Coil & Pod', 'Resistensi Coil', '0.15 Ω', 41),
    ('Coil & Pod', 'Resistensi Coil', '0.3 Ω', 41),
    ('Coil & Pod', 'Resistensi Coil', '0.6 Ω', 41),
    ('Coil & Pod', 'Resistensi Coil', '0.8 Ω', 41),
    ('Coil & Pod', 'Kapasitas Pod', '2 mL', 42),
    ('Coil & Pod', 'Kapasitas Pod', '3 mL', 42),
    ('Coil & Pod', 'Kapasitas Pod', '4 mL', 42),
    ('Material & Bodi', 'Material', 'Aluminium Alloy', 50),
    ('Material & Bodi', 'Material', 'Zinc Alloy', 50),
    ('Material & Bodi', 'Material', 'PCTG', 50),
    ('Material & Bodi', 'Lapisan Warna', 'Matte', 51),
    ('Material & Bodi', 'Lapisan Warna', 'Glossy', 51),
    ('Layar & Info', 'Layar', 'Tanpa Layar', 60),
    ('Layar & Info', 'Layar', 'OLED 0.96 Inch', 60),
    ('Layar & Info', 'Layar', 'TFT 1.3 Inch', 60),
    ('Layar & Info', 'Keaslian', 'Garansi Resmi', 61),
    ('Layar & Info', 'Keaslian', 'NFC Anti Palsu', 61)
ON CONFLICT (label, value) DO NOTHING;

-- Reload skema PostgREST agar tabel & data baru dipakai.
NOTIFY pgrst, 'reload schema';
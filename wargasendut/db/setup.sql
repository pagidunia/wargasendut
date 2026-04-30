-- Warga table
CREATE TABLE warga (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  honorific VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL DEFAULT 'Warga',
  nomor_rumah INT,
  rt VARCHAR(20) DEFAULT '07',
  rw VARCHAR(20) DEFAULT '03',
  is_active SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Iuran table
CREATE TABLE iuran (
  id SERIAL PRIMARY KEY,
  warga_id INT NOT NULL REFERENCES warga(id),
  bulan VARCHAR(20) NOT NULL,
  tahun INT NOT NULL,
  jumlah DECIMAL(15,2) NOT NULL DEFAULT 150000,
  status VARCHAR(20) DEFAULT 'belum' CHECK (status IN ('lunas', 'belum', 'terlambat')),
  tanggal_bayar DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (warga_id, bulan, tahun)
);

-- Login attempts table
CREATE TABLE login_attempts (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  success SMALLINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_username_created ON login_attempts (username, created_at);

-- Insert demo users (password: warga123)
-- bcrypt hash: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm
INSERT INTO warga (username, password_hash, display_name, honorific, role, nomor_rumah) VALUES
('pak_rt_07', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm', 'Pak Slamet', 'Pak Slamet', 'Ketua RT 07', 7),
('bu_bendahara', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm', 'Bu Siti', 'Bu Siti', 'Bendahara RT 07', 3),
('pak_ketua_rw', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm', 'Pak Budi', 'Pak Budi', 'Ketua RW 03', 1),
('bu_ketua_rt', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm', 'Bu Ani', 'Bu Ani', 'Sekretaris RT 07', 5),
('pak_warga_1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm', 'Pak Joko', 'Pak Joko', 'Warga', 12),
('pak_warga_2', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm', 'Pak Rudi', 'Pak Rudi', 'Warga', 18),
('bu_warga_1', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm', 'Bu Rina', 'Bu Rina', 'Warga', 14),
('bu_warga_2', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36gZvWFm', 'Bu Siska', 'Bu Siska', 'Warga', 21);

-- Insert iuran data (April 2026)
INSERT INTO iuran (warga_id, bulan, tahun, status, tanggal_bayar) VALUES
(1, 'April', 2026, 'lunas', '2026-04-12'),
(2, 'April', 2026, 'lunas', '2026-04-10'),
(3, 'April', 2026, 'lunas', '2026-04-11'),
(4, 'April', 2026, 'belum', NULL),
(5, 'April', 2026, 'lunas', '2026-04-08'),
(6, 'April', 2026, 'belum', NULL),
(7, 'April', 2026, 'belum', NULL),
(8, 'April', 2026, 'lunas', '2026-04-15');

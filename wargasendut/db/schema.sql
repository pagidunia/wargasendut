-- Warga table
CREATE TABLE IF NOT EXISTS warga (
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
CREATE TABLE IF NOT EXISTS iuran (
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
CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  success SMALLINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_username_created ON login_attempts (username, created_at);

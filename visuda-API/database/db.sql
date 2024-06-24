CREATE Table users (
  user_id integer AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  nik int(16) NOT NULL,
  password varchar(100) NOT NULL,
  rt varchar(2) NOT NULL,
  rw varchar(2) NOT NULL,
  created_at timestamp,
  PRIMARY KEY (user_id)
);

CREATE Table tokens (
  id_token int AUTO_INCREMENT NOT NULL,
  user_id int(11) NOT NULL,
  token text NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  PRIMARY KEY (id_token),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE data_warga (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_lengkap VARCHAR(255) NOT NULL,
    NIK CHAR(16) NOT NULL UNIQUE,
    jenis_kelamin ENUM('Pria', 'Wanita') NOT NULL,
    tanggal_lahir DATE NOT NULL,
    tempat_lahir VARCHAR(255) NOT NULL,
    alamat TEXT NOT NULL,
    agama VARCHAR(50) NOT NULL,
    status ENUM('Nikah', 'Belum Nikah') NOT NULL,
    status_hubungan_dalam_keluarga VARCHAR(50) NOT NULL,
    wilayah_rt VARCHAR(10) NOT NULL,
    wilayah_rw VARCHAR(10) NOT NULL,
    foto_wajah LONGBLOB,
    scan_KTP LONGBLOB,
    scan_kartu_keluarga LONGBLOB,
    pekerjaan VARCHAR(255) NOT NULL
);

CREATE TABLE kategori_surat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_surat VARCHAR(255) NOT NULL
);

CREATE TABLE permintaan_surat_pengantar_rt_rw (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kategori_surat_id INT,
    nama_lengkap VARCHAR(255) NOT NULL,
    NIK CHAR(16) NOT NULL,
    jenis_kelamin ENUM('Pria', 'Wanita') NOT NULL,
    tanggal_lahir DATE NOT NULL,
    tempat_lahir VARCHAR(255) NOT NULL,
    alamat TEXT NOT NULL,
    agama VARCHAR(50) NOT NULL,
    status ENUM('Nikah', 'Belum Nikah') NOT NULL,
    wilayah_rt VARCHAR(10) NOT NULL,
    wilayah_rw VARCHAR(10) NOT NULL,
    keperluan_surat TEXT NOT NULL,
    scan_KTP LONGBLOB,
    scan_kartu_keluarga LONGBLOB,
    pekerjaan VARCHAR(255) NOT NULL,
    waktu_dan_tanggal DATETIME NOT NULL,
    FOREIGN KEY (kategori_surat_id) REFERENCES kategori_surat(id)
);


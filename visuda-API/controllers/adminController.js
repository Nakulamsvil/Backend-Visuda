const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { knex } = require("../configs/db");

const { validateUsername, validatePassword } = require("../validate/validate");

// Konfigurasi Multer untuk menyimpan file dalam bentuk buffer di memory

const registerAdmin = async (req, res) => {
  const { username, password } = req.body;

  // Validasi semua atribut
  if (!username || !password) {
    return res.status(400).send({
      code: "400",
      status: "Bad Request",
      errors: {
        message: "Missing attribute",
      },
    });
  }

  // Validasi format username
  if (validateUsername(username)) {
    return res.status(400).send({
      code: "400",
      status: "Bad Request",
      errors: {
        message: "Invalid username format",
      },
    });
  }

  // Validasi format password
  if (validatePassword(password)) {
    return res.status(400).send({
      code: "400",
      status: "Bad Request",
      errors: {
        message: "The password must be between 8-16 characters and contain numbers",
      },
    });
  }

  // Validasi username sudah ada atau belum
  const verifName = await knex("admins").where("username", username);
  if (verifName.length !== 0) {
    return res.status(409).send({
      code: "409",
      status: "Conflict",
      errors: {
        message: "Username already exists",
      },
    });
  }

  const admin = {
    username,
    password,
  };

  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) {
      return res.status(500).send({
        code: "500",
        status: "Internal Server Error",
        errors: {
          message: "Error generating salt",
        },
      });
    }
    bcrypt.hash(admin.password, salt, function (err, hash) {
      if (err) {
        return res.status(500).send({
          code: "500",
          status: "Internal Server Error",
          errors: {
            message: "Error hashing password",
          },
        });
      }
      admin.password = hash;
      // Store data user to database
      knex("admins")
        .insert({
          username: admin.username,
          password: admin.password,
          createdAt: knex.fn.now(),
        })
        .then(() => {
          res.status(200).send({
            code: "200",
            status: "success",
            data: {
              message: "Register success. please log in",
            },
          });
        })
        .catch((err) => {
          res.status(500).send({
            code: "500",
            status: "Internal Server Error",
            errors: {
              message: "Error inserting admin into database",
            },
          });
        });
    });
  });
};

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  // Validasi username dan password
  const admin = await knex("admins").where("username", username).first();

  if (!admin) {
    return res.status(401).send({
      code: "401",
      status: "Unauthorized",
      errors: {
        message: "Invalid username or password",
      },
    });
  }

  const match = await bcrypt.compare(password, admin.password);

  if (!match) {
    return res.status(401).send({
      code: "401",
      status: "Unauthorized",
      errors: {
        message: "Invalid username or password",
      },
    });
  }

  res.status(200).send({
    code: "200",
    status: "success",
    data: {
      message: "Login successful",
      admin: {
        id: admin.id,
        username: admin.username,
      },
    },
  });
};

const logoutAdmin = async (req, res) => {
  try {
    return res.status(200).send({
      code: "200",
      status: "success",
      data: {
        message: "Logout berhasil",
      },
    });
  } catch (err) {
    return res.status(500).send({
      code: "500",
      status: "Internal Server Error",
      errors: {
        message: "Terjadi kesalahan saat memproses data",
      },
    });
  }
};

const getWarga = async (req, res) => {
  try {
    const data = await knex("data_warga").select("*");
    res.json(data);
  } catch (error) {
    console.error("Error fetching citizen data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getWargaByNamaAndNIK = async (req, res) => {
  const { nama_lengkap, NIK } = req.query;
  try {
    let queryBuilder = knex("data_warga");

    if (nama_lengkap) {
      queryBuilder = queryBuilder.where("nama_lengkap", "like", `%${nama_lengkap}%`);
    }

    if (NIK) {
      queryBuilder = queryBuilder.orWhere("NIK", NIK);
    }

    const result = await queryBuilder.select("*");

    if (result.length > 0) {
      return res.status(200).json({ data: result });
    } else {
      return res.status(404).json({ message: "Data not found" });
    }
  } catch (error) {
    console.error("Error fetching data warga by nama and/or NIK:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

const addWarga = async (req, res) => {
  const { nama_lengkap, NIK, jenis_kelamin, tanggal_lahir, tempat_lahir, alamat, agama, status, status_hubungan_dalam_keluarga, wilayah_rt, wilayah_rw, pekerjaan } = req.body;

  if (
    !nama_lengkap ||
    !NIK ||
    !jenis_kelamin ||
    !tanggal_lahir ||
    !tempat_lahir ||
    !alamat ||
    !agama ||
    !status ||
    !status_hubungan_dalam_keluarga ||
    !wilayah_rt ||
    !wilayah_rw ||
    !req.files["foto_wajah"] ||
    !req.files["scan_KTP"] ||
    !req.files["scan_kartu_keluarga"] ||
    !pekerjaan
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const fotoWajahBuffer = req.files["foto_wajah"][0].buffer;
    const scanKTPBuffer = req.files["scan_KTP"][0].buffer;
    const scanKartuKeluargaBuffer = req.files["scan_kartu_keluarga"][0].buffer;

    const result = await knex("data_warga").insert({
      nama_lengkap,
      NIK,
      jenis_kelamin,
      tanggal_lahir,
      tempat_lahir,
      alamat,
      agama,
      status,
      status_hubungan_dalam_keluarga,
      wilayah_rt,
      wilayah_rw,
      foto_wajah: fotoWajahBuffer,
      scan_KTP: scanKTPBuffer,
      scan_kartu_keluarga: scanKartuKeluargaBuffer,
      pekerjaan,
    });

    const id = result[0];

    return res.status(200).json({
      message: "Successfully added citizen data",
      data: {
        id,
        ...req.body,
        ...req.files,
      },
    });
  } catch (error) {
    console.error("Error inserting citizen data:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

const updateWarga = async (req, res) => {
  const { id } = req.params;
  const { nama_lengkap, NIK, jenis_kelamin, tanggal_lahir, tempat_lahir, alamat, agama, status, status_hubungan_dalam_keluarga, wilayah_rt, wilayah_rw, pekerjaan } = req.body;

  if (
    !nama_lengkap ||
    !NIK ||
    !jenis_kelamin ||
    !tanggal_lahir ||
    !tempat_lahir ||
    !alamat ||
    !agama ||
    !status ||
    !status_hubungan_dalam_keluarga ||
    !wilayah_rt ||
    !wilayah_rw ||
    !pekerjaan
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  let fotoWajahBuffer, scanKTPBuffer, scanKartuKeluargaBuffer;
  if (req.files["foto_wajah"]) {
    fotoWajahBuffer = req.files["foto_wajah"][0].buffer;
  }
  if (req.files["scan_KTP"]) {
    scanKTPBuffer = req.files["scan_KTP"][0].buffer;
  }
  if (req.files["scan_kartu_keluarga"]) {
    scanKartuKeluargaBuffer = req.files["scan_kartu_keluarga"][0].buffer;
  }

  try {
    const updatedData = {
      nama_lengkap,
      NIK,
      jenis_kelamin,
      tanggal_lahir,
      tempat_lahir,
      alamat,
      agama,
      status,
      status_hubungan_dalam_keluarga,
      wilayah_rt,
      wilayah_rw,
      pekerjaan,
    };

    if (fotoWajahBuffer) {
      updatedData.foto_wajah = fotoWajahBuffer;
    }
    if (scanKTPBuffer) {
      updatedData.scan_KTP = scanKTPBuffer;
    }
    if (scanKartuKeluargaBuffer) {
      updatedData.scan_kartu_keluarga = scanKartuKeluargaBuffer;
    }

    await knex("data_warga").where({ id }).update(updatedData);

    return res.status(200).json({
      message: "Successfully updated citizen data",
      data: {
        id,
        ...req.body,
        ...req.files,
      },
    });
  } catch (error) {
    console.error("Error updating citizen data:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

const deleteWarga = async (req, res) => {
  const { id } = req.params;

  try {
    // Pastikan bahwa id dapat diubah menjadi integer sebelum digunakan
    const idToDelete = parseInt(id);

    if (isNaN(idToDelete)) {
      return res.status(400).json({ message: "ID warga tidak valid" });
    }

    // Menghapus data warga dari database menggunakan Knex
    const deletedCount = await knex('data_warga').where({ id: idToDelete }).del();

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Data warga tidak ditemukan" });
    }

    return res.status(200).json({
      pesan: "Hapus data warga berhasil",
    });
  } catch (error) {
    console.error("Error deleting citizen data:", error);
    return res.status(500).json({ message: "Terjadi kesalahan saat menghapus data", error });
  }
};

const getSurat = async (req, res) => {
  try {
    const data = await knex("permintaan_surat_pengantar_rt_rw")
      .select("*")
      .leftJoin("kategori_surat", "permintaan_surat_pengantar_rt_rw.kategori_surat_id", "kategori_surat.id")
      .select("permintaan_surat_pengantar_rt_rw.*", "kategori_surat.nama_surat as nama_kategori_surat");
    
    res.json(data);
  } catch (error) {
    console.error("Error fetching surat pengantar RT/RW data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getSuratByNamaLengkap = async (req, res) => {
  const { nama_lengkap } = req.query;
  try {
    console.log("Nama lengkap yang dicari:", nama_lengkap);

    let queryBuilder = knex("permintaan_surat_pengantar_rt_rw");

    if (nama_lengkap) {
      queryBuilder = queryBuilder.where("nama_lengkap", "like", `%${nama_lengkap}%`);
    }

    const result = await queryBuilder.select("*");
    console.log("Hasil query:", result);

    if (result.length > 0) {
      return res.status(200).json({ data: result });
    } else {
      return res.status(404).json({ message: "Data not found" });
    }
  } catch (error) {
    console.error("Error fetching surat pengantar RT/RW by nama_lengkap:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

const addSurat = async (req, res) => {
  const {
    kategori_surat_id,
    nama_lengkap,
    NIK,
    jenis_kelamin,
    tanggal_lahir,
    tempat_lahir,
    alamat,
    agama,
    status,
    wilayah_rt,
    wilayah_rw,
    keperluan_surat,
    pekerjaan,
    waktu_dan_tanggal
  } = req.body;

  if (
    !kategori_surat_id ||
    !nama_lengkap ||
    !NIK ||
    !jenis_kelamin ||
    !tanggal_lahir ||
    !tempat_lahir ||
    !alamat ||
    !agama ||
    !status ||
    !wilayah_rt ||
    !wilayah_rw ||
    !keperluan_surat ||
    !req.files["scan_KTP"] ||
    !req.files["scan_kartu_keluarga"] ||
    !pekerjaan ||
    !waktu_dan_tanggal
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const scanKTPBuffer = req.files["scan_KTP"][0].buffer;
    const scanKartuKeluargaBuffer = req.files["scan_kartu_keluarga"][0].buffer;

    const result = await knex("permintaan_surat_pengantar_rt_rw").insert({
      kategori_surat_id,
      nama_lengkap,
      NIK,
      jenis_kelamin,
      tanggal_lahir,
      tempat_lahir,
      alamat,
      agama,
      status,
      wilayah_rt,
      wilayah_rw,
      keperluan_surat,
      scan_KTP: scanKTPBuffer,
      scan_kartu_keluarga: scanKartuKeluargaBuffer,
      pekerjaan,
      waktu_dan_tanggal
    });

    const id = result[0];

    return res.status(200).json({
      message: "Successfully added surat pengantar data",
      data: {
        id,
        ...req.body,
        ...req.files,
      },
    });
  } catch (error) {
    console.error("Error inserting surat pengantar data:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getWarga,
  getWargaByNamaAndNIK,
  addWarga,
  updateWarga,
  deleteWarga,
  getSurat,
  getSuratByNamaLengkap,
  addSurat
};

const jwt = require("jsonwebtoken");
const saltRounds = 10;
const bcrypt = require("bcrypt");
const { knex } = require("../configs/db");
const multer = require("multer");
const { validateNIK, validatePassword } = require("../validate/validate");

const register = async (req, res) => {
  const { name, password, nik, rt, rw } = req.body;

  // Validasi semua atribut
  if (!name || !password || !nik || !rt || !rw) {
    return res.status(400).send({
      code: "400",
      status: "Bad Request",
      errors: {
        message: "Missing attribute",
      },
    });
  }

  // Validasi format NIK
  if (validateNIK(nik)) {
    return res.status(400).send({
      code: "400",
      status: "Bad Request",
      errors: {
        message: "NIK must be 16 characters",
      },
    });
  }

  // Validasi password
  if (validatePassword(password)) {
    return res.status(400).send({
      code: "400",
      status: "Bad Request",
      errors: {
        message: "The password must be between 8-16 characters and contain numbers",
      },
    });
  }

  // Validasi NIK sudah ada atau belum
  const verifNIK = await knex("users").where("nik", nik);
  if (verifNIK.length !== 0) {
    return res.status(409).send({
      code: "409",
      status: "Conflict",
      errors: {
        message: "NIK already exists",
      },
    });
  }

  const user = {
    nik,
    password,
  };

  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) throw err;
      user.password = hash;
      //Store data user to database
      knex("users")
        .insert(user)
        .then(
          res.status(200).send({
            code: "200",
            status: "success",
            data: {
              message: "Register succes. please log in",
            },
          })
        );
    });
  });
};

const login = async (req, res) => {
  const { name, password } = req.body;

  // Validasi nama pengguna
  const validationName = await knex("users").where("name", name);
  if (validationName.length === 0) {
    return res.status(401).send({
      code: "401",
      status: "Unauthorized",
      errors: {
        message: "Incorrect email or password",
      },
    });
  }

  // Validasi password
  bcrypt.compare(password, validationName[0].password, function (err, result) {
    if (result) {
      const user = {
        nik: validationName[0].nik,
        name: validationName[0].name,
        rt: validationName[0].rt,
        rw: validationName[0].rw,
        createdAt: validationName[0].createdAt,
      };

      // Buat token JWT
      const accesToken = jwt.sign(user, process.env.ACCES_TOKEN_KEY, { expiresIn: "1hr" });
      const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_KEY, { expiresIn: "365d" });

      // Verifikasi refresh token dan simpan ke database
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, function (err, decoded) {
        const data = {
          user_id: validationName[0].user_id,
          token: refreshToken,
          created_at: new Date(decoded.iat * 1000).toISOString().slice(0, 19).replace("T", " "),
          expires_at: new Date(decoded.exp * 1000).toISOString().slice(0, 19).replace("T", " "),
        };
        knex("tokens")
          .insert(data)
          .then(
            res.status(200).send({
              code: "200",
              status: "ok",
              data: {
                accesToken: accesToken,
                refreshToken: refreshToken,
              },
            })
          );
      });
    } else {
      return res.status(401).send({
        code: "401",
        status: "Unauthorized",
        errors: {
          message: "Incorrect email or password",
        },
      });
    }
  });
};

const token = async (req, res) => {
  const { name, nik } = req;
  const user = {
    name,
    nik,
  };

  // Buat token JWT
  const accesToken = jwt.sign(user, process.env.ACCES_TOKEN_KEY, { expiresIn: "1hr" });
  return res.status(200).send({
    code: "200",
    status: "Success",
    data: {
      accesToken: accesToken,
    },
  });
};

const logout = async (req, res) => {
  const refreshToken = req.refreshToken;
  try {
    const result = await knex("tokens").where("token", refreshToken).del();

    if (result === 1) {
      return res.status(200).send({
        code: "200",
        status: "Success",
        data: {
          message: "Logout success",
        },
      });
    } else {
      return res.status(404).send({
        code: "404",
        status: "Not Found",
        errors: {
          message: "Token not found",
        },
      });
    }
  } catch (err) {
    console.error("Error deleting token:", err);
    return res.status(500).send({
      code: "500",
      status: "Internal Server Error",
      errors: {
        message: "Failed to logout user",
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

  // Validasi semua field yang diperlukan ada
  //   if (!nama_lengkap || !NIK || !jenis_kelamin || !tanggal_lahir || !tempat_lahir || !alamat || !agama || !status || !status_hubungan_dalam_keluarga || !wilayah_rt || !wilayah_rw || !req.files['foto_wajah'] || !req.files['scan_KTP'] || !req.files['scan_kartu_keluarga'] || !pekerjaan) {
  //       return res.status(400).json({ message: 'Missing required fields' });
  //   }

  //   try {
  //       // Ambil buffer dari file yang di-upload menggunakan multer
  //       const fotoWajahBuffer = req.files['foto_wajah'][0].buffer;
  //       const scanKTPBuffer = req.files['scan_KTP'][0].buffer;
  //       const scanKartuKeluargaBuffer = req.files['scan_kartu_keluarga'][0].buffer;

  //       // Simpan data warga ke dalam database
  //       const [id] = await knex('data_warga').insert({
  //           nama_lengkap,
  //           NIK,
  //           jenis_kelamin,
  //           tanggal_lahir,
  //           tempat_lahir,
  //           alamat,
  //           agama,
  //           status,
  //           status_hubungan_dalam_keluarga,
  //           wilayah_rt,
  //           wilayah_rw,
  //           foto_wajah: fotoWajahBuffer,
  //           scan_KTP: scanKTPBuffer,
  //           scan_kartu_keluarga: scanKartuKeluargaBuffer,
  //           pekerjaan
  //       });

  //       // Berikan respons sukses dengan data yang ditambahkan
  //       return res.status(200).json({
  //           message: 'Successfully added citizen data',
  //           data: {
  //               id,
  //               nama_lengkap,
  //               NIK,
  //               jenis_kelamin,
  //               tanggal_lahir,
  //               tempat_lahir,
  //               alamat,
  //               agama,
  //               status,
  //               status_hubungan_dalam_keluarga,
  //               wilayah_rt,
  //               wilayah_rw,
  //               foto_wajah: {
  //                   filename: req.files['foto_wajah'][0].originalname,
  //                   mimetype: req.files['foto_wajah'][0].mimetype,
  //                   size: req.files['foto_wajah'][0].size
  //               },
  //               scan_KTP: {
  //                   filename: req.files['scan_KTP'][0].originalname,
  //                   mimetype: req.files['scan_KTP'][0].mimetype,
  //                   size: req.files['scan_KTP'][0].size
  //               },
  //               scan_kartu_keluarga: {
  //                   filename: req.files['scan_kartu_keluarga'][0].originalname,
  //                   mimetype: req.files['scan_kartu_keluarga'][0].mimetype,
  //                   size: req.files['scan_kartu_keluarga'][0].size
  //               },
  //               pekerjaan
  //           },
  //       });
  //   } catch (error) {
  //       console.error("Error inserting citizen data:", error);
  //       return res.status(500).json({ message: 'Something went wrong', error });
  //   }
};

const updateWarga = async (req, res) => {
  const { nama_lengkap, NIK } = req.query;

  const { jenis_kelamin, tanggal_lahir, tempat_lahir, alamat, agama, status, status_hubungan_dalam_keluarga, wilayah_rt, wilayah_rw, pekerjaan } = req.body;

  try {
    // Ambil buffer dari file yang di-upload menggunakan multer jika ada
    const fotoWajahBuffer = req.files["foto_wajah"] ? req.files["foto_wajah"][0].buffer : null;
    const scanKTPBuffer = req.files["scan_KTP"] ? req.files["scan_KTP"][0].buffer : null;
    const scanKartuKeluargaBuffer = req.files["scan_kartu_keluarga"] ? req.files["scan_kartu_keluarga"][0].buffer : null;

    // Update data warga di dalam database
    const updatedRows = await knex("data_warga").where({ nama_lengkap, NIK }).update({
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

    if (updatedRows > 0) {
      return res.status(200).json({
        message: "Successfully updated citizen data",
        data: {
          ...req.body,
        },
      });
    } else {
      return res.status(404).json({ message: "Data not found" });
    }
  } catch (error) {
    console.error("Error updating citizen data:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

const deleteWarga = async (req, res) => {
  const { nama_lengkap, NIK } = req.query;

  try {
    // Hapus data warga dari database
    const deletedRows = await knex("data_warga").where({ nama_lengkap, NIK }).del();

    if (deletedRows > 0) {
      return res.status(200).json({
        message: "Successfully deleted citizen data",
      });
    } else {
      return res.status(404).json({ message: "Data not found" });
    }
  } catch (error) {
    console.error("Error deleting citizen data:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

module.exports = {
  register,
  login,
  token,
  logout,
  getWarga,
  getWargaByNamaAndNIK,
  addWarga,
  updateWarga,
  deleteWarga,
};

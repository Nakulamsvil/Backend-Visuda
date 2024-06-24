const express = require("express");
const router = express.Router();
const { registerAdmin, loginAdmin, logoutAdmin, getWarga, getWargaByNamaAndNIK, addWarga, updateWarga, deleteWarga, getSurat, getSuratByNamaLengkap, addSurat } = require("../controllers/adminController");
const { authenticateRefreshToken } = require("../middleware/authenticate");
const upload = require("../middleware/multer");

router.post("/registeradmin", registerAdmin);
router.post("/loginadmin", loginAdmin);
router.post("/logoutadmin", authenticateRefreshToken, logoutAdmin);
router.get("/datawarga", getWarga);
router.get("/datawarga/:id", getWargaByNamaAndNIK);
router.post("/tambahwarga", upload, addWarga);
router.put("/ubahwarga/:id", updateWarga);
router.delete("/hapusdatawarga/:id", deleteWarga);
router.get("/suratrtrw", getSurat);
router.get("/suratrtrw/:id", getSuratByNamaLengkap);
router.post("/tambahsurat", upload, addSurat);

module.exports = router;

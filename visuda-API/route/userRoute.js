const express = require("express");
const router = express.Router();
const { register, login, token, logout, getWarga, getWargaByNamaAndNIK, addWarga, updateWarga, deleteWarga } = require("../controllers/userController");
const { authenticateRefreshToken, authenticateAccesToken } = require("../middleware/authenticate");

router.post('/register', register);
router.post('/login', login);
router.post('/token', authenticateRefreshToken ,token);
router.post('/logout', authenticateRefreshToken ,logout)
router.get("/datawarga", getWarga);
router.get("/datawarga/:NamaAndNIK", getWargaByNamaAndNIK);
router.post("/tambahdatawarga", addWarga);
router.put("/ubahdatawarga/:id", updateWarga);
router.delete("/hapusdatawarga/:id", deleteWarga);

module.exports = router;
const express = require("express");
const router = express.Router();

const controller = require("../controllers/auth.controller");

router.get("/check", controller.check);

router.get("/logout", controller.logout);

module.exports = router;

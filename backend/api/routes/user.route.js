const express = require("express");
const router = express.Router();

const controller = require("../controllers/user.controller");

router.get("/", controller.index);

router.get("/detail/:UserID", controller.detail);

router.get("/role/:roleName", controller.getUsersByRole);

router.post("/login", controller.login);

router.post("/google-login", controller.googleLogin );

router.post("/register", controller.register);

router.post("/password/forgot", controller.forgotPassword);

router.post("/password/otp", controller.otpPassword);

router.post("/password/reset", controller.resetPassword);

router.post("/password/change", controller.changePassword);

router.put("/updateinfor/:UserID", controller.updateinfor);

router.put("/updaterole/:UserID", controller.updaterole);

router.delete("/delete/:UserID", controller.delete);

module.exports = router;

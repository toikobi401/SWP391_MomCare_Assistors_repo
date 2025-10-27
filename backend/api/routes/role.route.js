const express = require("express");
const router = express.Router();

const controller = require("../controllers/role.controller");

router.get("/", controller.index);

router.get("/detail/:RoleID", controller.detail);

router.post("/create", controller.create);

router.put("/update/:RoleID", controller.update);

router.delete("/delete/:RoleID", controller.delete);

module.exports = router;

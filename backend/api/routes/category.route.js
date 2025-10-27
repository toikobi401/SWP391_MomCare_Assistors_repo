const express = require("express");
const router = express.Router();

const controller = require("../controllers/category.controller");

router.get("/", controller.index);

router.get("/detail/:CategoryID", controller.detail);

router.post("/create", controller.create);

router.put("/update/:CategoryID", controller.update);

router.get("/delete/:CategoryID", controller.delete);

module.exports = router;
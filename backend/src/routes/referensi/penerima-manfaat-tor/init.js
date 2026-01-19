const express = require("express");
const router = express.Router();
const { createData } = require("./post");
const { getData, getDetail } = require("./get");
const { udpateData } = require("./put");
const { deleteData } = require("./delete");

router.get("/", getData);
router.get("/:id", getDetail);

router.post("/", createData);

router.put("/:id", udpateData);

router.delete("/:id", deleteData);

module.exports = router;

const express = require("express");
const { authRequired } = require("../middlewares/auth");
const { listActiveCategories } = require("../controllers/categoryController");

const router = express.Router();

router.use(authRequired);
router.get("/", listActiveCategories);

module.exports = router;


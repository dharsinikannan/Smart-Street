const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/login", (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone is required" });
  }

  const token = jwt.sign({ phone }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });

  res.json({ token });
});

module.exports = router;

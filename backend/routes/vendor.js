const router = require("express").Router();
const db = require("../db");

// Register vendor
router.post("/register", async (req, res) => {
  const { name, phone, business_type } = req.body;

  try {
    await db.query(
      "INSERT INTO vendors (name, phone, business_type) VALUES ($1,$2,$3)",
      [name, phone, business_type]
    );
    res.json({ message: "Vendor registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all vendors
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM vendors");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

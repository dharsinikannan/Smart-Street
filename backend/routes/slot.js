const router = require("express").Router();
const db = require("../db");

// Get all slots
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM slots ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book a slot
router.post("/book/:id", async (req, res) => {
  const slotId = req.params.id;

  try {
    await db.query(
      "UPDATE slots SET is_booked = true WHERE id = $1",
      [slotId]
    );
    res.json({ message: "Slot booked successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

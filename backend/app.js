const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const vendorRoutes = require("./routes/vendor");
const slotRoutes = require("./routes/slot");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/slots", slotRoutes);

app.get("/", (req, res) => {
  res.send("Smart Street Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Dummy users (for testing)
const users = [
  {
    email: "admin@geopits.com",
    password: "admin123"
  }
];

// Login API
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  res.json({
    success: true,
    message: "Login successful",
    user: {
      email: user.email
    }
  });
});

// Health check
app.get("/", (req, res) => {
  res.send("Backend running ✅");
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});

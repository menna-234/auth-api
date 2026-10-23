require("dotenv").config();
const express = require("express");
const app = express();
const authRoutes = require("./routes/auth");
const authenticateToken = require("./middleware/authmiddleware");
const PORT = 3000;

// Allow API to receive JSON
app.use(express.json());

// Register and Login routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "My first API is working!"
    });
});


app.get("/api/auth/profile", authenticateToken, (req, res) => {
    res.json({
        message: "Token is valid",
        user: req.user
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

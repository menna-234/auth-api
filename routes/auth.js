
const express = require("express");
const bcrypt = require("bcryptjs");
const { poolPromise, sql } = require("../db");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Register API
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters"
            });
        }

        const pool = await poolPromise;

        const existingUser = await pool.request()
            .input("Email", sql.NVarChar(255), email)
            .query("SELECT Id FROM Users WHERE Email = @Email");

        if (existingUser.recordset.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await pool.request()
            .input("Name", sql.NVarChar(100), name)
            .input("Email", sql.NVarChar(255), email)
            .input("PasswordHash", sql.NVarChar(255), passwordHash)
            .query(`
                INSERT INTO Users (Name, Email, PasswordHash)
                VALUES (@Name, @Email, @PasswordHash)
            `);

        return res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        console.error("Register error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const pool = await poolPromise;

        const result = await pool.request()
            .input("Email", sql.NVarChar(255), email)
            .query("SELECT Id, Name, Email, PasswordHash FROM Users WHERE Email = @Email");

        if (result.recordset.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result.recordset[0];

        const passwordMatch = await bcrypt.compare(
            password,
            user.PasswordHash
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

       const token = jwt.sign(
    {
        id: user.Id,
        email: user.Email
    },
    process.env.JWT_SECRET,
    {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h"
    }
);

return res.status(200).json({
    message: "Login successful",
    user: {
        id: user.Id,
        name: user.Name,
        email: user.Email
    },
    token: token
});

    } catch (error) {
        console.error("Login error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
});

module.exports = router;

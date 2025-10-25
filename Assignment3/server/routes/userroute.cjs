// server/routes/user.cjs
const express = require("express");
const User = require("../backend/user.cjs");

module.exports = function userRouterFactory(db)
{
    const router = express.Router();
    var user = new User(db);
    
    app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "username and password required" });
        res.json({ successful: user.Login(username, password)});
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
    })
    return router;
};

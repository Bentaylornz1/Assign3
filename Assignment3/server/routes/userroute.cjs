// server/routes/user.cjs
const express = require("express");
const User = require("../backend/user.cjs");

module.exports = function userRouterFactory(db)
{
    const router = express.Router();
    var user = new User(db);
    
    router.post('/login', (req, res) => {
        const { username, password } = req.body;
        res.json({ successful: user.Login(username, password)});
    });
    return router;
};

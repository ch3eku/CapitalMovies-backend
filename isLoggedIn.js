const jwt = require("jsonwebtoken");
const User = require('./models/user');
require('dotenv').config()

const isLoggedIn = async(req, res, next) => {

    try {
        const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
        
        if (token) {
            return res.status(401).send('Authentication required!');
        }
        const verifyToken = jwt.verify(token, process.env.TOKEN_KEY);

        const rootUser = await User.findOne({ _id: verifyToken._id });

        if (!rootUser) {
            throw new Error('User not found.');
        }

        req.token = token;
        req.rootUser = rootUser;
        req._id = rootUser._id;

        next();
    } catch (error) {
        res.status(401).send('Authentication required!');
        console.log(error);
    }
};

module.exports = isLoggedIn;
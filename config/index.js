require("dotenv").config(); 

module.exports = {
    CONNECTION_STRING: process.env.CONNECTION_STRING || "mongodb://mongodb:27017/nodejs",
    "JWT": {
        "SECRET": process.env.JWT_SECRET || "default_secret_key",
        "EXPIRE_TIME": !isNaN(parseInt(process.env.JWT_EXPIRE_TIME)) ? parseInt(process.env.JWT_EXPIRE_TIME) : 24 * 60 * 60 // 1 gün
    }
};
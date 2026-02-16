require("dotenv").config(); 

module.exports = {
    CONNECTION_STRING: process.env.CONNECTION_STRING || "mongodb://localhost:27017/nodejs",
    "JWT": {
        "SECRET": process.env.JWT_SECRET || "default_secret_key",
        "EXPIRE_TIME": !isNaN(parseInt(process.env.JWT_EXPIRE_TIME)) ? parseInt(process.env.JWT_EXPIRE_TIME) : 24 * 60 * 60 // 1 gün
    },
    "DEFAULT_LANGUAGE": process.env.DEFAULT_LANGUAGE || "EN",
    "FILE_UPLOAD": {
        "MIMETYPES": ["image/jpeg", "image/png", "image/jpg"], // Sadece resimlere izin verelim
        "MAX_SIZE": 5 * 1024 * 1024, // 5 MB
        "PATH": "public/uploads" // Dosyaların kaydedileceği yer
    },
    "EMAIL": {
        "HOST": "smtp.ethereal.email",
        "PORT": 587,
        "SECURE": false, // true for 465, false for other ports
        "auth": {
            "user": "", 
            "pass": ""         
        },
        "FROM": "noreply@superbackend.com"
    },
    "SWAGGER": {
        "definition": {
            "openapi": "3.0.0",
            "info": {
                "title": "Node.js Backend API",
                "version": "0.0.0",
                "description": "Node.js Backend API Documentation"
            },
            "servers": [
                {
                    "url": "http://localhost:3000/api/"
                }
            ],
            // JWT Auth 
            "components": {
                "securitySchemes": {
                    "bearerAuth": {
                        "type": "http",
                        "scheme": "bearer",
                        "bearerFormat": "JWT"
                    }
                }
            },
            "security": [
                {
                    "bearerAuth": []
                }
            ]
        },
        // Hangi dosyalarda doküman arayayım?
        "apis": ["./routes/*.js"] 
    },
    "HTTP": {
        "CORS": {
            // Frontend adresini buraya yazmalısın. "*" her yere izin verir (Geliştirme için).
            // Production'da: ["http://localhost:3000", "https://siteadi.com"]
            "ORIGIN": "*", 
            "METHODS": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        },
        "RATE_LIMIT": {
            "WINDOW_MS": 15 * 60 * 1000, // 15 Dakika
            "MAX": 100 // 15 dakikada max 100 istek (IP başına)
        }
    }
};
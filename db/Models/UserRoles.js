const mongoose = require("mongoose");

const schema = mongoose.Schema({
    role_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: "roles"
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: "users" // Senin oluşturduğun users tablosuna referans
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

class UserRoles extends mongoose.Model { }

schema.loadClass(UserRoles);
module.exports = mongoose.models.userRoles || mongoose.model("user_roles", schema);
const mongoose = require("mongoose");

const schema = mongoose.Schema({
    role_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true, 
        ref: "roles" 
    },
    permission: { type: String, required: true },
    created_by: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "users" 
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

class RolePrivileges extends mongoose.Model { }

schema.loadClass(RolePrivileges);
module.exports = mongoose.models.rolePrivileges || mongoose.model("role_privileges", schema);
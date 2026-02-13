const mongoose = require("mongoose");

const schema = mongoose.Schema({
    is_active: { type: Boolean, default: true },
    name: { type: String, required: true },
    created_by: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "users" 
    }
}, {
    versionKey: false,
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
});

class Categories extends mongoose.Model { }

schema.loadClass(Categories);
module.exports = mongoose.models.categories || mongoose.model("categories", schema);
const mongoose = require("mongoose");

let instance = null;

class Database{
    constructor(){
        if(instance != null)
        {   
            this.mongoConnection == null;
            instance = this;
        }
    }

    async connect(conectionString){
        console.log("Connecting to MongoDB...", conectionString);
        let db = await mongoose.connect(conectionString);
        this.mongoConnection = db;
        console.log("MongoDB Connected!");
    }
}

module.exports = Database;
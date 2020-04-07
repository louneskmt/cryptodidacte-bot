const { websiteDbConfig } = require('../config');
const {__} = require("../src/logger.js");
const Database = require("../src/database.js");

class Session{
    constructor({username, password}){
        this.username = username;
        this.password = websiteDbConfig.hash({username,password});
        this.isValid = false;
        
        this.url = `mongodb://${websiteDbConfig.user}:${websiteDbConfig.password}@localhost:27017/adminWebsite`;
    }
    async create(){
        this.db = new Database("adminWebsite", this.url);
        await this.db.connect();
        let {username, password} = this;
        let query = await this.db.find("users", {username, password})
        
        __(query); // TO BE REMOVED
        if(query.length > 1){
            __("URGENT ERROR : MULTIPLE USERS FOUND AT WEBSITE CONNECTION",9);
            return -1;
        }else if(query.length === 0){
            return -1;
        }
        // ELSE : 

        let res = await this.db.insert("tokens",{username, timestamp: new Date().getTime(), openedFile: false});
        this.id = insertedId;
        this.isValid = true;
        this.timestamp = new Date();
        console.log("insertedID:", res);
        
        return insertedId;
    }

    async delete(){
        return await this.db.remove({_id: this.id});
    }
}

module.exports = Session;

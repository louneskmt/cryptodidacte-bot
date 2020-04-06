const { websiteDbConfig } = require('../config');
const {__} = require("../src/logger.js");
const Database = require("../src/database.js");

class Session{
    constructor({username, password}){
        this.username = username;
        this.password = websiteDbConfig.hash({username,password});
        this.url = `mongodb://${websiteDbConfig.username}:${websiteDbConfig.password}@localhost:27017/adminWebsite`;
    }
    async connect(){
        this.db = new Database("adminWebsite", this.url);
        await db.connect();
        let query = await this.db.find("users", {username, password})
        
        __(query); // TO BE REMOVED
        if(query.length > 1){
            __("URGENT ERROR : MULTIPLE USERS FOUND AT WEBSITE CONNECTION",9);
            return -1;
        }else if(query.length === 0){
            return -1;
        }
        // ELSE : 

        let { insertedId } = await this.db.insert({username, timestamp: new Date().getTime(), openedFile: false});
        this.id = insertedId;
        return insertedId;
    }
}

module.exports = Session;
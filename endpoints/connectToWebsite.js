const { websiteDbConfig } = require('../config');
const Database = require("../src/database.js");

class Session{
    constructor({username, password}){
        this.username = username;
        this.password = websiteDbConfig.hash({username,password});
        this.url = `mongodb://${websiteDbConfig.username}:${websiteDbConfig.password}@localhost:27017/adminWebsite`;
    }
    async init(){
        this.db = new Database("adminWebsite", this.url);
        await db.connect();
        let query = await this.db.find("users", {username, password})
        console.log(query)
    }
}
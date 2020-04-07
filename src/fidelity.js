const {__} = require("./logger.js");
const Database = require("./database.js");

const { websiteDbConfig } = require('../config.js'); 

const processEvent = async (event, data) => {
    let db = new Database("fidelity", `mongodb://${websiteDbConfig.user}:${websiteDbConfig.password}@localhost:27017/fidelity`);

    await db.insert("history", data);

    let reward;
    switch (event) {
        case 'favorite':
            reward = 2;
            break;
        case 'retweet':
            reward = 5;
            break;
        case 'quote':
            reward = 6;
            break;
        case 'reply':
            reward = 3;
            break;
        default:
            reward = 0;
            break;
    }

    db.find("users", {user_id: data.user_id}).then((docs) => {
        if(docs.length === 0) {
            db.insert("users", {
                user_id: data.user_id,
                user_name: data.user_name,
                balance: reward
            });
        } else {
            db.update("users", {user_id: data.user_id}, {balance: reward}, 'inc');
        }
    });
};

module.exports = {
    processEvent
}
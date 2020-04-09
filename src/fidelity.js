const {__} = require("./logger.js");
const Database = require("./database.js");
const ethereum = require('./ethereum.js'); 

const { websiteDbConfig, ethereumConfig } = require('../config.js'); 

/*
eventData Object sample:
{
    user_id: user_id,
    user_name: user_name,
    tweet_id: tweet_id,
    type: 'retweet',
    target_tweet_id,
    timestamp
}
*/
const processEvent = async (eventData) => {
    // Connect to DB
    let db = new Database("fidelity", `mongodb://${websiteDbConfig.user}:${websiteDbConfig.password}@localhost:27017/fidelity`);
    await db.connect();

    let research = await db.find("history", {user_id: eventData.user_id, type: eventData.type, target_tweet_id: eventData.target_tweet_id});
    if(research.length != 0) return;
    await db.insert("history", eventData);

    let reward;
    switch (eventData.event_type) {
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

    db.find("users", {user_id: eventData.user_id}).then(async (docs) => {
        if(typeof docs == undefined || docs.length === 0) {
            await db.insert("users", {
                user_id: eventData.user_id,
                user_name: eventData.user_name,
                balance: reward
            });
        } else {
            await db.update("users", { 
                filter: {user_id: eventData.user_id},
                edit:{balance: reward},
                mode: 'inc'
            });
        }
        await db.disconnect();
    });

    check(eventData);
};

const payout = (user_id) => {
    let db = new Database("fidelity", `mongodb://${websiteDbConfig.user}:${websiteDbConfig.password}@localhost:27017/fidelity`);
    const CDT = new ethereum.ERC20(contractAddress, CryptodidacteTokenABI);

    db.find("users", {user_id: eventData.user_id}).then((docs) => {
        if(!docs[0].address) {
            __(`There is not any address linked to this account (@${docs[0].user_name})`);
            return;
        }
        if(docs[0].balance == 0) {
            __(`There is not enough funds in this account (@${docs[0].user_name})`);
            return;
        }

        CDT.send(docs[0].address, docs[0].balance).then(async (tx) => {
            __("Payout user ID " + docs[0].user_id + " - " + docs[0].balance + " CDT - Tx hash : " + tx.hash);
            await tx.wait();
            __("Done!");
        });

        db.disconnect();
    });
}

module.exports = {
    processEvent
}
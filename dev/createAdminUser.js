const readline = require("readline");
const Db = require("../src/database.js");
const crypto = require("crypto")

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

let prompt = async text => {
    return new Promise((resolve, reject) => {
        rl.question(text, resolve);
    })
}

let hashPasswordd = ({username, password}) =>{
    let salt = process.env.SALT+password+"*#*"+process.env.SALT
    let shasum = crypto.createHash("sha1").update(salf).digest();
    return shasum;
} 

(async function(){
    console.log("************************* CONNECT TO DATABASE *************************")
    let username = await prompt("Enter your username: ");
    let password = await prompt("Enter your password: ");

    console.log("\n TRYING TO CONNECT \n");
    
    let db = new Db("users",`mongodb://${username}:${password}@localhost:27017/adminWebsite`);
    await db.connect();
    if(!db.connected){
        console.error("Couldn't log in");
        return process.exit(1);
        // END
    }

    console.log("You are connected to the authAdminTable");
    console.log("************************* CREATING USER *************************");
    let nUsername = await prompt("Enter username of new user:")
    let nPassword = await prompt("Enter password of new user:");


    db.insert({username: nUsername, password: nPassword})

})();
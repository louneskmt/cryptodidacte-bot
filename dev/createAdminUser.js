const readline = require("readline");
const Db = require("../src/database.js");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

let prompt = async text => {
    return new Promise((resolve, reject) => {
        rl.question(text, resolve);
    })
}

(async function(){
    console.log("************************* CONNECT TO DATABASE *************************")
    let username = await prompt("Enter your username: ");
    let password = await prompt("Enter your password: ", {method: "mask"});

    console.log("\n TRYING TO CONNECT \n");
    
    let db = new Db("users",`mongodb://${username}:${password}@localhost:27017/adminAuthTable`);
    console.log(db.connect());
})();

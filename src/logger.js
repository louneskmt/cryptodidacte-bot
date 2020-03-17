if(typeof fs != "object"){
    var fs = require("fs");
}
var main = fs.createWriteStream("./logs/main.log", {flags: "a"});

function __(message, lvl = 0){


    var date = new Date();
    var date = date.getDate()+"/"+(date.getMonth()+1)+" "+date.getHours()+":"+date.getSeconds()+":"+date.getMilliseconds()

    var levels = {
        0: "VERBOSE",
        1: "DEBUG",
        2: "IMPORTANT",
        9: "ERROR"
    }
    var level = levels[lvl]

    var text = `\n[${date}] | [${level}] |: ${message}`


    console.log(text);

    main.write(text);
}
var date = new Date();
var date = date.getDate()+"/"+(date.getMonth()+1)+" "+date.getHours()+":"+date.getSeconds()+":"+date.getMilliseconds()

main.write(`\n\n\n------------------------ ${date} ------------------------`)

__`Logger has started`

module.exports = {
    __
}

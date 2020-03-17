const beautify = require("json-beautify");

if(typeof fs != "object"){
    var fs = require("fs");
}
var main = fs.createWriteStream("./logs/main.log", {flags: "a"});

function __(message, lvl = 0){


    var date = new Date();
    var date = date.getDate()+"/"+(date.getMonth()+1)+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()

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

function __json(message, lvl){
    __(beautify(message, null, 2, 100),lvl);
}

var date = new Date();
var date = date.getDate()+"/"+(date.getMonth()+1)+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()

main.write(`\n\n\n------------------------ ${date} ------------------------`)

__`Logger has started`

module.exports = {
    __, __json
}

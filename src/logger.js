const beautify = require("json-beautify");
const colors = require("colors");

if(typeof fs != "object"){
    var fs = require("fs");
}
var main = fs.createWriteStream("./logs/main.log", {flags: "a"});

function __(message, lvl = 0){
    if(typeof message != undefined && message.toString() === "[object Object]"){
        try{
            message = beautify(message, null, 2, 100);
        }catch(err){
            console.dir(message);
            __("CIRCULAR OBJECTS CAN'T BE LOGGED", 2);
        }
    }

    var date = new Date();
    var date = date.getDate()+"/"+(date.getMonth()+1)+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()

    var levels = {
      0: "VERBOSE",
      1: "DEBUG",
      2: "IMPORTANT",
      9: "ERROR"
    }

    var color_list = {
      0: "grey",
      1: "bgWhite",
      2: "blue",
      9: "red"
    }

    var level = levels[lvl]

    var color = color_list[lvl];

    try{
      var text = colors[color](`\n[${date}] | [${level}] |: ${message}`)
    }catch(err){
      console.log("Couldn't find color n°", lvl)
    }


    console.log(text);

    main.write(text);
}
var date = new Date();
var date = date.getDate()+"/"+(date.getMonth()+1)+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()

main.write(`\n\n\n------------------------ ${date} ------------------------`)

__`Logger has started`

module.exports = {
    __
}

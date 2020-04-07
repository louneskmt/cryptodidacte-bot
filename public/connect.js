String.prototype.hexEncode = function(){
    let hex, i;
    let result = "";
    for (i=0; i<this.length; i++) {
        hex = this.charCodeAt(i).toString(16);
        result += ("000"+hex).slice(-4);
    }
    return result
}

$(function(){
    $("#auth-connect").click(() => connect() );

});

let connect = async function(){
    let username = $("#auth-username").val();   
    let password = $("#auth-password").val();

    let nPassword = await hashPassword(password);

    $("#sect-auth").addClass("retract");
    let request = $.post("/login", {
        username, password: nPassword
    });
    request.then(function(res){
        if(res === "-1") return retryAuth();

        window.location.href = "/index"
    });
    request.catch(function(res){
        retryAuth();
    })
}

let sleep = async secs => {
    return new Promise((resolve, reject) => {
        setTimeout(()=>{
            resolve(secs);
        }, secs*1000)
    })
}

let retryAuth = ()=>{
    $("#sect-auth").removeClass("retract");
}

let loadSecureJS = (token)=>{
    let script = $("<script></script>");
    $(script).attr("src", "/secure.js?token="+token);
    $("head").append(script)
}

let hashPassword = function(password){
    let hash = sha256.create();
    hash.update("1d34caabaa37"+password+"ead78d1d5753583562b6");
    return hash.hex();
}

$(function(){
    $("#auth-connect").click(() => connect() );
});

let connect = async function(){
    $("#sect-auth").addClass("retract");
    await sleep(2);
    showIndex();
}

let sleep = async secs => {
    return new Promise((resolve, reject) => {
        setTimeout(()=>{
            resolve(secs);
        }, secs*1000)
    })
}

let showIndex = async function(){
    $("#sect-auth").addClass("hideEffect");
    await sleep(.3);
    $("#sect-auth").addClass("dis-none");
    $("#sect-index").removeClass("dis-none");
}
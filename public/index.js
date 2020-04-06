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
    $("#index-rewards").click(() => showDatabase("rewards") );

    $("#data-table tr td:first-child").click(selectElementRow);
    $(".data-thead tr th:first-child").click(selectAllTabEl);

});

let connect = async function(){
    let username = $("#auth-username").val();   
    let password = $("#auth-password").val();

    let nPassword = await hashPassword(password);

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

let showDatabase = async (menu)=>{
    $("#sect-index .whitebox").removeClass("reveal");
    await sleep(.01);
    $("#sect-index .whitebox").addClass("hideEffect");
    await sleep(1);
    $("#sect-index").addClass("dis-none")
    
    if(menu === "rewards"){
        // Load rewards
    }
    $("#sect-data").removeClass("dis-none")
    await sleep(.5);
    $("#sect-data").addClass("reveal")
    updateTableRows();
}

let showIndex = async () => {
    $("#sect-auth").addClass("hideEffect");
    await sleep(.3);
    $("#sect-auth").addClass("dis-none");
    $("#sect-index").removeClass("dis-none");
    $("#sect-index .whitebox").addClass("reveal")

    

}

let selectElementRow = function (ev){
    $(this).parents("tr").toggleClass("selected");    
    checkIfAllSelected();
}

let selectAllTabEl = function (ev){
    $(this).toggleClass("selected");

    if( $(this).hasClass("selected") ){
        $("#data-table").children("tbody").children("tr").each(async function(ix, el){
            await sleep(ix*0.05);
            $(el).addClass("selected")
        });    
    }else{
        $("#data-table").children("tbody").children("tr").each(async function(ix, el){
            await sleep(ix*0.05);
            $(el).removeClass("selected")
        });       
    }
}

let updateTableRows = ()=>{
    $("#data-table tr:first-child td").each( (ix, el) => {
        if(ix==0) return true;
        let width = $(el).width();
        
        $(`.data-thead tr th:nth-child(${ix+1})`).css({width})
    })
    
}

let hashPassword = function(password){
    let hash = sha256.create();
    hash.update("1d34caabaa37"+password+"ead78d1d5753583562b6");
    return hash.hex();
}

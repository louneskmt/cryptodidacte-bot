$(function(){
    $("#auth-connect").click(() => connect() );

    $("#data-table tr td:first-child").click(selectElementRow)
    $("#data-table tr th:first-child").click(selectAllTabEl)
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

let showIndex = async () => {
    $("#sect-auth").addClass("hideEffect");
    await sleep(.3);
    $("#sect-auth").addClass("dis-none");
    $("#sect-index").removeClass("dis-none");
}

let selectElementRow = function (ev){
    $(this).parents("tr").toggleClass("selected");    
    checkIfAllSelected();
}

let selectAllTabEl = function (ev){
    $(this).toggleClass("selected");
    if( $(this).hasClass("selected") ){
        $(this).parents("table").children("tbody").children("tr").each(async function(ix, el){
            await sleep(ix*0.05);
            $(el).addClass("selected")
        });    
    }else{
        $(this).parents("table").children("tbody").children("tr").each(async function(ix, el){
            await sleep(ix*0.05);
            $(el).removeClass("selected")
        });       
    }
}

let
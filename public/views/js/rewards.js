onViewLoaded = function(){
    updateTableRows();
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
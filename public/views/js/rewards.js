onViewLoaded = function(){
    updateTableRows();

    let req = $.post("/db/get", {
        collection: "rewards", 
        filter: {}
    }, function(...args){
        console.log(args);
        
        let json = JSON.parse(res);
        console.log(json);
        
        for(const entry of json){
            let tr = $(`
                <tr>
                    <td class="data-table-check"></td>
                    <td>${entry.username}</td>
                    <td>?</td>
                    <td>?</td>
                    <td>${entry.reward}</td>
                </tr>
            `)

            $("#data-table tbody").append(tr);
        }

        updateTableRows();
    })
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
    $("#data-table-checkall").click(selectAllTabEl);
    $(".data-table-check").click(selectElementRow)

    $("#data-table tr:first-child td").each( (ix, el) => {
        if(ix==0) return true;
        let width = $(el).width();
        
        $(`.data-thead tr th:nth-child(${ix+1})`).css({width})
    })
    
}
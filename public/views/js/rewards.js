onViewLoaded = async function(){
    updateTableRows();

    $("#data-table-checkall").click(selectAllTabEl);

    $("#data-table tbody").html("");
    $("body").addClass("loading");
    let req = $.post("/db/get", {
        collection: "rewards", 
        filter: {}
    }, function(data){
        
        for(const entry of data){
            let tr = $(`
                <tr class="--anim-swipeEnter">
                    <td class="data-table-check"></td>
                    <td>${entry.username}</td>
                    <td>?</td>
                    <td>?</td>
                    <td>${entry.reward}</td>
                </tr>
            `)

            $("#data-table tbody").append(tr);
            $("body").removeClass("loading");
        }

        $("#data-table tr").each(async function(ix, el){
            await sleep(ix*0.2)
            $(el).addClass("reveal");
        })

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
    $("#data-table-check").click(selectElementRow)
    $("#data-table tr:first-child td").each( (ix, el) => {
        if(ix==0) return true;
        let width = $(el).width();
        
        $(`.data-thead tr th:nth-child(${ix+1})`).css({width})
    })
    
}
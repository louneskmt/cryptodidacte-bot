viewDetails = {}
onViewLoaded = async function(obj){
    let {query, title} = obj;
    
    viewDetails.query = query;
    $(".sect-data-header h1").text(title || "Database");
    $("#data-table-checkall").click(selectAllTabEl);

    $("#data-table tbody").html("");
    $("body").addClass("loading");
    $.post("/db/get", query, function(data){
        let keyOrder = obj.keyOrder || [];

        let headTarget = $("#data-thead table tr");
        $(headTarget).html(`
            <th id="data-table-checkall" class="--icon"></th>
        `);
        if (keyOrder.length === 0) {
            for(const key in data[0]){
                if(key === "_id") continue;
                
                keyOrder.push(key);
            }
        }

        for (const key of keyOrder) {
            $(headTarget).append(`<th>${key}</th>`)
        }
        
        for(const entry of data){
            let tr = $(`
                <tr class="--anim-swipeEnter">
                    <td class="data-table-check"></td>
                </tr>
            `)

            for(const key of keyOrder){
                if(entry.hasOwnProperty(key)){
                    $(tr).append(`<td>${entry[key]}</td>`)
                }
            }

            $("#data-table tbody").append(tr);
        }

        $("#data-table tr").each(async function(ix, el){
            await sleep(ix*0.2)
            $(el).addClass("reveal");
        })

        $("body").removeClass("loading");
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
    $(".data-table-check").click(selectElementRow)
    $("#data-table tr:first-child td").each( (ix, el) => {
        if(ix==0) return true;
        let width = $(el).width();
        
        $(`.data-thead tr th:nth-child(${ix+1})`).css({width})
    })
    
}
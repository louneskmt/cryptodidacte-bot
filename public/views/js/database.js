viewDetails = {}
onViewLoaded = async function (params) {
    let mode = "view";

    let obj = JSON.parse(params);
    let selectElementRow = function (ev) {
        $(this).parents("tr").toggleClass("selected");
        checkIfAllSelected();
    }

    let selectAllTabEl = function (ev) {
        $(this).toggleClass("selected");

        if ($(this).hasClass("selected")) {
            $("#data-table").children("tbody").children("tr").each(async function (ix, el) {
                await sleep(ix * 0.05);
                $(el).addClass("selected")
            });
        } else {
            $("#data-table").children("tbody").children("tr").each(async function (ix, el) {
                await sleep(ix * 0.05);
                $(el).removeClass("selected")
            });
        }
    }

    let checkIfAllSelected = function(){
        let total = $("#data-table tr").get().length;
        let selected = $("#data-table tr.selected").get().length;

        if(total === selected)$("#data-table-checkall").addClass("selected");
        else $("#data-table-checkall").removeClass("selected");
    }

    let updateTableRows = () => {
        $(".data-table-check").click(selectElementRow)
        $("#data-table-checkall").click(selectAllTabEl);
        $("#data-table tr:first-child td").each((ix, el) => {
            if (ix == 0) return true;
            let width = $(el).width();

            $(`.data-thead tr th:nth-child(${ix+1})`).css({
                width
            })
        })
    }

    let {
        collection,
        filter = {},
        title
    } = obj;

    let query = {
        collection,
        filter
    };

    let hideKeys = obj.hideKeys || ["_id"];

    viewDetails.query = query;
    $(".sect-data-header h1").text(title || "Database");

    $("#data-table tbody").html("");
    $("body").addClass("loading");

    let receivedData;
    let keyOrder;
    $.post("/db/get", query, function (data) {
        receivedData = data;

        keyOrder = obj.keyOrder || [];

        let headTarget = $(".data-thead table tr");
        $(headTarget).html(`
            <th id="data-table-checkall" class="--icon"></th>
        `);
        if (keyOrder.length === 0) {
            for (const key in data[0]) {
                if (hideKeys.includes(key)) continue;

                keyOrder.push(key);
            }
        }

        for (const key of keyOrder) {
            $(headTarget).append(`<th>${key}</th>`)
        }

        for (const entry of data) {
            let tr = $(`
                <tr class="--anim-swipeEnter" mongo-id="${entry._id}" >
                    <td class="data-table-check"></td>
                </tr>
            `)

            for (const key of keyOrder) {
                if (entry.hasOwnProperty(key)) {
                    $(tr).append(`<td>${entry[key]}</td>`)
                }
            }

            $("#data-table tbody").append(tr);
        }

        $("#data-table tr").each(async function (ix, el) {
            await sleep(ix * 0.1)
            $(el).addClass("reveal");
        })

        $("body").removeClass("loading");
        updateTableRows();
    });

    let addElement = function(){
        let newEl = $(`<tr class="data-table-newElement" form-entry entry-type="tableRow"><td class="--icon">error_outline</td></tr>`);
        for(const key of keyOrder){
            $(newEl).append(`
                <td><input entry-name="${key}" placeholder="${key}" class="--input-in-table" contentEditable/></td>
            `)
        }

        $("#data-table tbody").prepend(newEl) 
        setMode("edit")
    }

    let setMode = function(newMode){
        if(newMode === mode) return false;
        mode = newMode;
        if(mode === "edit"){
            setFooterTools(`
                <span class="--icon" click-role="addElement">playlist_add</span>
                <span class="--icon">clear</span>
                <span class="--icon" click-role="sendNewElements">save</span>
            `)
        }
        if(mode === "view"){
            setFooterTools(`
                <span class="--icon" click-role="addElement">playlist_add</span>
                <span class="--icon" click-role="deleteElements">delete</span>
                <span class="--icon" click-role="edit">edit</span>
            `)
        }
    }

    let setFooterTools = async function(html){
        $(".sect-data-footer .footer-cont").addClass("--anim-swipeExit reveal --anim-fill");
        await sleep(.5);
        $(".sect-data-footer .footer-cont").removeClass("--anim-swipeExit");
        $(".sect-data-footer .footer-cont").html(html);
        $(".sect-data-footer .footer-cont").addClass("--anim-swipeEnter reveal");
    }


    let doAction = function(){
        setMode("view");
    }

    let deleteElements = function(){
        let ids = [];
        $(`#data-table .selected[mongo-id]`).each(function(ix, el){
            ids.push($(this).attr("mongo-id"));
        })

        let req = $.post("/db/deleteAllById", {
            collection: viewDetails.query.collection,
            idList: ids
        }, function(data){
            reloadView();
        });
        req.fail(err => console.log(err));
    }

    sendNewElements = function(ev){
        let data = [];
        
        $("#data-table tr[form-entry]").each(function(ix, el){
            let entry = {} ;
            $(el).find("*[entry-name]").each(function(iy, child){
                let key = $(child).attr("entry-name");
                let val = $(child).val();
                console.log(val.length)
                if(val.length <= 0) return true; // continue;
                entry[key] = val;
            })

            if(Object.keys(entry).length>0) data.push(entry);
        })

        if (data.length<=0) return;

        let req = $.post("/db/insert", {
            collection: viewDetails.query.collection,
            entry: data
        }, function(data, status){
            reloadView();
        });
        req.fail(function(err){
            console.log(err);
        });

        setMode("view");
    }

    $("*[click-role=showIndex]").click(showIndex);
    $("footer").on("click", "*[click-role=addElement]", addElement);
    $("footer").on("click", "*[click-role=sendNewElements]", sendNewElements);
    $("footer").on("click", "*[click-role=deleteElements]", deleteElements);
}
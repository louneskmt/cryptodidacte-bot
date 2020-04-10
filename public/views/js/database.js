viewDetails = {}
onViewLoaded = async function (params) {
    let mode = null;
    let obj = JSON.parse(params);
    let isEditing = false;

    let selectElementRow = function (ev) {
        if(mode === "edit") return editEntry.call(this, ev);

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
        $("#data-table tr:first-child td").each((ix, el) => {
            if (ix == 0) return true;
            let width = $(el).width();

            $(`.data-thead tr th:nth-child(${ix+1})`).css({
                width
            })
        })

        $(".data-table-check").click(selectElementRow)
        $("#data-table-checkall").click(selectAllTabEl);
    }

    let editEntry = async function(ev){
        let self = this;
        console.log(self);
        
        
        if(isEditing){
            return new Popup({
                title:"Save?",
                content: `Do you want to save your edit?`,
                buttons: [
                    {
                        text: "Cancel",
                        onclick: pop=>pop.destroy()
                    },{
                        text: "Discard",
                        onclick: function(pop){pop.destroy(); reallyCancel(); isEditing=false; setMode("edit"); editEntry.call(self,ev)}
                    },{
                        text: "Save",
                        classes: "--button-fill",
                        onclick: function(){
                            this.destroy();
                            reallyDeleteElements(ids);
                        }
                    }
                ]
            })
        }
        isEditing = true;
        
        let tr = $(this).parent();
        await sleep(.1)
        $(tr).addClass("--tr-editing");

        let newEl = $(`<tr class="data-table-newElement" form-entry entry-type="tableRow"><td class="--icon">error_outline</td></tr>`);
        for(let i = 0; i < keyOrder.length; i++){
            let value = $($(tr).find("td")[i+1]).text();
            let key = keyOrder[i];
            $(newEl).append(`
                <td><input entry-name="${key}" placeholder="${value}" class="--input-in-table" contentEditable/></td>
            `)
        }

        $(newEl).insertAfter(tr);
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
        setMode("add")
    }

    let setMode = function(newMode){
        if(newMode === mode) return false;
        mode = newMode;
        if(mode === "add"){
            setFooterTools(`
                <span class="--icon" click-role="addElement">playlist_add</span>
                <span class="--icon" click-role="cancelEdit">clear</span>
                <span class="--icon" click-role="sendNewElements">save</span>
            `)
        }
        if(mode === "view"){
            $("#data-table").removeClass("data-edit");
            setFooterTools(`
                <span class="--icon" click-role="addElement">playlist_add</span>
                <span class="--icon" click-role="deleteElements">delete</span>
                <span class="--icon" click-role="startEdit">edit</span>
            `)
        }
        if(mode === "edit"){
            $("#data-table").addClass("data-edit");
            setFooterTools(`
                <span class="--icon" click-role="cancelEdit">clear</span>
                <span class="--icon" click-role="sendEdit">save</span>
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

        if(ids.length === 0) return;

        let p = new Popup({
            title:"Delete?",
            content: `You are about to delete ${ids.length} entries`,
            buttons: [
                {
                    text: "Cancel",
                    onclick: pop=>pop.destroy()
                },{
                    text: "Delete",
                    classes: "--button-fill",
                    onclick: function(){
                        this.destroy();
                        reallyDeleteElements(ids);
                    }
                }
            ]
        })
    }

    let reallyDeleteElements = function(ids){
        if(ids.length===0) return;
        let req = $.post("/db/removeAllById", {
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
                
                if(val.length <= 0) return true; // continue;
                entry[key] = val;
            })

            if(Object.keys(entry).length>0) data.push(entry);
        })

        setMode("view");
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

    }

    let cancelAdd = function(){
        // TODO : Modal to confirm
        let p = new Popup({
            title:"Cancel?",
            content: `All non-saved changes will be definitely lost. `,
            buttons: [
                {
                    text: "Return",
                    onclick: pop=>pop.destroy()
                },{
                    text: "Discard",
                    classes: "--button-fill",
                    onclick: function(){
                        this.destroy();
                        reallyCancel();
                    }
                }
            ]
        })

    }

    let reallyCancel = function(){
        $("#data-table tr[form-entry]").remove();
        $(".--tr-editing").removeClass("--tr-editing");
        isEditing = false;
        setMode("view")
    }


    let sendEdit = function(){
        let el = $("#data-table tr[form-entry]");
        if($(el).get().length>1){
            return console.error("More than one entry to edit. Aborting...")
        }

        let id = $(el).attr("mongo-id");
        let data = {};
        $(el).find("input[entry-name]").each(function(ix,child){
            let key = $(child).attr("entry-name");
            let val = $(child).val();
            
            if(val.length<=0 || !val) return true;
            data[key] = val;
        })

        let req = $.post("/db/updateById/", {
            collection: viewDetails.query.collection,
            query: data
        }, function(data){
            reloadView();
        })
        req.fail(function(err){
            console.error(err);
        })
        
    }

    $("*[click-role=showIndex]").click(showIndex);
    $("footer").off("click");
    $("footer").on("click", "*[click-role=addElement]", addElement);
    $("footer").on("click", "*[click-role=sendNewElements]", sendNewElements);
    $("footer").on("click", "*[click-role=deleteElements]", deleteElements);
    $("footer").on("click", "*[click-role=cancelEdit]", cancelAdd);
    $("footer").on("click", "*[click-role=startEdit]", ()=>setMode("edit"));
    $("footer").on("click", "*[click-role=sendEdit]", sendEdit);
    setMode("view");
}
$(function(){
    let defView = $("#params-view").val();
    if(defView){
        loadView(defView);
    }else{
        showIndex();
    }

    $(".whitebox[open-view]").click(loadViewOnClick);
});

// GLOBAL
sleep = async secs => {
    return new Promise((resolve, reject) => {
        setTimeout(()=>{
            resolve(secs);
        }, secs*1000)
    })
}

let transition = async function(from, to){
    return new Promise(async (resolve, reject)=>{
        $(from).removeClass("reveal");
        await sleep(.01);
        $(from).addClass("hideEffect");
        await sleep(1);
        $(from).addClass("dis-none")
        $(to).removeClass("dis-none")
        await sleep(.1);
        $(to).addClass("reveal");

        resolve(to);
    })
}

let loadViewOnClick = async function(ev){
    let viewName = $(this).attr("open-view");
    let params = $(this).attr("view-args") || "null";
    try{
        params = JSON.parse(params)
    }catch(err){
        __("Can't parse view, got :", 9);
        __(err, 9);
    }
    await loadView(viewName, params);
}

let loadView = async function(viewName, params){
    let url = `/views/${viewName}.html`;

    let request = $("#sect-view").load(url, async function(res, status){
        // ANIM
        if(status==="error") return showIndex();
        $("body").removeClass("loading");
        await transition("", "#sect-view");    
        onViewLoaded(params);
    });

    let newJS = $("<script></script>",{id:"view-js", src:`/views/js/${viewName}.js`})
    $("#view-js").replaceWith(newJS);
    $("body").addClass("loading");
    await transition("#sect-index .whitebox", "");
    $("#sect-index").addClass("dis-none");
    
   

    history.pushState({view: viewName}, viewName, "/view/"+viewName);
}

let showIndex = async () => {
    await sleep(.3);
    $("#sect-index").removeClass("dis-none");
    $("#sect-index .whitebox").addClass("reveal")
}


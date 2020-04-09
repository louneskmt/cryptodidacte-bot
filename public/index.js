let popupShowing = false;

$(async function(){
    let defView = $("#params-view").val();
    let viewParams = $("#params-viewParams").val() || null;
    if(defView){
        loadView(defView, viewParams);
    }else{
        showIndex();
    }

    $(".whitebox[open-view]").click(loadViewOnClick);

    window.onpopstate = function(ev){
        let {state} = ev;
        if(state.view === "index") return showIndex();
        loadView(state.view, state.params);
    }
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
        $(to).removeClass("hideEffect");
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
    await loadView(viewName, params);
}

let loadView = async function(viewName, params){
    $("body").addClass("loading");
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
    await transition("#sect-index .whitebox", "");
    $("#sect-index").addClass("dis-none");
    
    let paramsString = "";
    if(params) paramsString = "/"+btoa(params)
    history.pushState({view: viewName, params}, viewName, "/view/"+viewName+paramsString);
}

let showIndex = async () => {
    transition("#sect-view", "#sect-index .whitebox")
    $("#sect-index").removeClass("dis-none");
    history.pushState({view: "index", params: ""}, "Cryptodidacte - admin", "/index");
}


let reloadView = function(){
    onViewLoaded(JSON.stringify(viewDetails.query));
}

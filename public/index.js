$(function(){
    let defView = $("#params-view").val();
    if(defView){
        loadView(defView);
    }else{
        showIndex(true);
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
        if(from){
            $(from).removeClass("reveal");
            await sleep(.01);
            $(from).addClass("hideEffect");
            await sleep(1);        
            $(from).addClass("dis-none")
        }

        $(to).removeClass("dis-none")
        await sleep(.1);
        $(to).addClass("reveal");

        resolve(to);
    })
}

let loadViewOnClick = async function(ev){
    let viewName = $(this).attr("open-view");
    let params = $(this).attr("view-args") || "null";
    params = JSON.parse(params)
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
    
    let paramString = "?";
    for(const key in params){
        let value  = params[key];
        if(typeof value === "object") value = JSON.stringify(value);
        paramString += key+"="+value+"&";
    }	
    paramString.slice(0, -1);

    history.pushState({view: viewName}, viewName, "/view/"+viewName+paramString);
}

let showIndex = async (first = false) => {
    $("#sect-index").removeClass("dis-none");
    await sleep(.1)
    transition(first ? "" : "#sect-view", "#sect-index .whitebox");
}


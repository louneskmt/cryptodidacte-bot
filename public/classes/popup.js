class Popup{
    constructor({title="Alerte", content, buttons, classes=""}){

        this.isShown = false;
        this.title = title;
        this.content = content;
        this.buttons = buttons;
        this.classes = classes;
        
        this.update();
        this.show();
    }

    update(){
        let self = this;

        $(`#sect-popup`).addClass(this.classes);
        $(`#sect-popup main p`).html(this.content);
        $(`#sect-popup main h3`).text(this.title);
        
        $(`#sect-popup main .popup-buttons`).html("");
        for(const button of this.buttons){
            let btn = $(`<button>${button.text}</button>`);
            $(`#sect-popup main .popup-buttons`).append(btn);
            if(button.classes) $(btn).addClass(button.classes);
            if(button.onclick){
                $(btn).click(function(){
                    button.onclick.call(self, self);
                });
            }
        }
    }

    async show(){

        $("#sect-popup").removeClass("dis-none");
        await sleep(.01);
        $("#sect-popup").addClass("reveal");
    }

    destroy(){
        $("#sect-popup").addClass("dis-none");
        delete this;
    }
}
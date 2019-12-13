function loadDep(url="", callback=()=>{}) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
       callback(this.responseText);
      }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

class Hope{
    constructor(settings={}){
        this.settings = settings;
        this.canvas = document.getElementById(settings.name);
        this.canvas.setAttribute("class", "hope-container");
        this.elements = {};

        const deps = [
            "https://code.jquery.com/jquery-3.4.1.min.js"
        ]; for (var i=0; i<deps.length; i++){loadDep(deps[i]); (data)=>{
            eval(data);}}
        
        loadDep("https://raw.githubusercontent.com/ElhamAryanpur/Hope/master/src/Hope.css", (response)=>{
            const style = document.createElement("style");
            style.innerHTML = response;
            document.head.appendChild(style);
        });
        
    }

    run(){
        if (this.settings.table != undefined){
            var tableDiv = document.createElement("div");
            var table = this.settings.table.data;
            this.elements.table = [];

            for (var i=0; i<table.length; i++){
                var field = document.createElement("input");
                field.placeholder = " " + table[i].name;
                field.type = table[i].type;
                field.setAttribute("class", "hope-input")
                field.id = "hope-table-" + i.toString()
                
                tableDiv.appendChild(field);
                this.elements.table.push(field);
            }

            const submitButton = document.createElement("button");
            submitButton.innerHTML = "Submit";
            submitButton.setAttribute("class", "hope-button");

            const buttonCallBack = (callback)=>{
                var data = {};
                for (var i=0;i<this.elements.table.length;i++){
                    data[this.elements.table[i].id] = this.elements.table[i].value;
                } callback(data);
            }

            submitButton.addEventListener("click", ()=>{
                buttonCallBack(this.settings.table.callback)
            })

            tableDiv.appendChild(document.createElement("br"));
            tableDiv.appendChild(submitButton);
            this.canvas.appendChild(tableDiv);
        }
    }
}

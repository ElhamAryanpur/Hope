function init(settings={}){
    if (settings.table != undefined){
        this.tableCanvas = document.getElementById(settings.table.name);
        this.tableCanvas.setAttribute("class", "hope-container");
        var tableDiv = document.createElement("div");
        var table = settings.table.data;
        var tableDB = new this.DB(name="table");
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

            tableDB.data = data;
            tableDB.saveData();

        }

        submitButton.addEventListener("click", ()=>{
            buttonCallBack(settings.table.callback)
        })

        tableDiv.appendChild(document.createElement("br"));
        tableDiv.appendChild(submitButton);

        this.tableCanvas.appendChild(tableDiv);
    }
}

module.exports = init;
/**
 * TODO:
 * 
 * 1. Make Compression of data
 */

const pako = require("pako");

global.DB = class{
    constructor(name="data"){
        this.name = name;
        this.data = this.loadData();

        if (this.data == null){this.data={};}
    }

    saveData(name=this.name, data=this.data){
        const stringify = JSON.stringify(data);
        const CompressData = pako.deflate(stringify, { to: 'string' });
        localStorage.setItem(name, CompressData);
    }
    loadData(name=this.name){
        const getData = localStorage.getItem(name);
        const decompress = pako.inflate(getData, { to: 'string' });
        return JSON.parse(decompress);
    }
}

global.Hope = class{
    constructor(settings={}){
        this.settings = settings;
        this.canvas = document.getElementById(settings.name);
        this.canvas.setAttribute("class", "hope-container");
        this.elements = {};

        const deps = [
            ""
        ]; for (var i=0; i<deps.length; i++){this._loadDep(deps[i]); (data)=>{
            eval(data);}}
        
        this._loadDep("https://raw.githubusercontent.com/ElhamAryanpur/Hope/master/src/Hope.css",
        (response)=>{
            const style = document.createElement("style");
            style.innerHTML = response;
            document.head.appendChild(style);
        });

    }

    init(settings={}){
        if (settings.table != undefined){
            var tableDiv = document.createElement("div");
            var table = settings.table.data;
            var tableDB = new DB(name="table");
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
                /** TODO - Compress And Save To Local Storage */

            }

            submitButton.addEventListener("click", ()=>{
                buttonCallBack(settings.table.callback)
            })

            tableDiv.appendChild(document.createElement("br"));
            tableDiv.appendChild(submitButton);
            this.canvas.appendChild(tableDiv);
        }
    }
/************************************************************************************************/
    _loadDep(url="", callback=()=>{}) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
        callback(this.responseText);
        }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }
}
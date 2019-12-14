/**
 * TODO:
 * 1. Load the saved data
 */

const pako = require("pako");
const init = require("./lib/init");
const load = require("./lib/load");

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
        this.elements = {}; this.DB = DB;

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
        
        this.init = init;
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
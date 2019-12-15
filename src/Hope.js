/**
 * TODO:
 * 1. Load the saved data
 */

const init = require("./lib/init_new");
const load = require("./lib/load");
const DB = require("./lib/db");

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
        this.load = load;
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

module.exports = Hope;
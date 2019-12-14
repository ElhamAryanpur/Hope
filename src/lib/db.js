const pako = require("pako");

class DB{
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

module.exports = DB;
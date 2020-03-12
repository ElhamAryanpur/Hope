<script context="module">

class Settings{
    constructor(setting={}){
        this.setting = setting
    }
    
    compile(){
        if (this.setting.table != undefined){
            this.tableExist = true;
            this.query = this.setting.table.query
        }
    }
}

</script>
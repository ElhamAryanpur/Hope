<script>
import Dialog from "../components/dialog.svelte";

let DATA = [['N/A']];
let colspan;
let newData = [];
let LOADED = false;

let basicData = {columnNames: []}
window.TableDB.get_clean(window.choosenTable, (doc)=>{
    basicData.columnNames = doc.values
    basicData.types = doc.types
    colspan = basicData.columnNames.length
});

function submitData(){
    window.socket.emit('new query', {table_name: window.choosenTable, fields: basicData.columnNames, data: newData});
}

function changeType(inpt){
    const i = parseInt(inpt.id)
    inpt.setAttribute("type", basicData.types[i])
}

function getQuery(page=1){
    window.socket.emit('get query', {
        name: window.choosenTable,
        page: page
    })

    window.socket.on('client get query', data=>{
        const newResult = []
        for (var i = 0; i < data.length; i++) {
            var d = data[i]
            delete d.id
            newResult.push(d)
        }
        
        const finalResult = [];
        for (var i=0; i<newResult.length; i++){
            const row = []
            for (var key in newResult[i]){
                row.push(newResult[i][key])
            }
            finalResult.push(row);
        }
        DATA = finalResult;
    })
}

getQuery();

</script>

<style>
    table{ margin: 0 auto; text-align: center; }
    span { font-weight: bold; }
    .title{ font-size: 40px; }
    .display{
        border: 2px solid #6AAAC9;
        padding: 20px;
    }
</style>

<table>
    <tr><td colspan="{colspan + 1}"><span class="title">{window.choosenTable}</span></td></tr>
    <br>

    <tr>
        <td></td>
        <td>
            <Dialog
                title="Filter The Table Data"
                button="Filter" id="{window.choosenTable}-filter">
            </Dialog>
        </td>

        <td>
            <Dialog
                title="Add New Query To The Table"
                button="New" id="{window.choosenTable}-new">
            
                {#each basicData.columnNames as name, n}
                    <input 
                        id="{n}" 
                        placeholder="{name}" 
                        bind:value={newData[`${n}`]}
                        use:changeType
                    ><br>
                {/each}

                <br><br><br>
                <button on:click={()=> submitData()}>Submit</button>

            </Dialog>
        </td>
    
    </tr>
    <tr class="display">
        <td class="display"><span>No.</span></td>
        {#each basicData.columnNames as name}
            <td class="display"><span>{name}</span></td>
        {/each}
    </tr>

    {#each DATA as d, n}
        <tr class="display">
            <td class="display">{n + 1}</td>
            {#each d as item}
                <td class="display">{item}</td>
            {/each}
        </tr>
    {/each}
</table>
<script>
import Dialog from "../components/dialog.svelte";

let basicData = {columnNames: []}

window.TableDB.get_clean(window.choosenTable, (doc)=>{
    basicData.columnNames = doc.values
    basicData.types = doc.types
    colspan = basicData.columnNames.length
});

const CurrentTable = new DB(`table-${window.choosenTable}`);
CurrentTable.get('settings', (doc)=>{
    console.log(doc)
});

let data = [['N/A']];
let colspan;
let newData = [];
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
                button="Filter" id="filter">
            </Dialog>
        </td>

        <td>
            <Dialog
                title="Add New Query To The Table"
                button="New" id="new">
            
                {#each basicData.columnNames as name, n}
                    <input type="text" placeholder="{name}" bind:value={newData[`${n}`]}><br>
                {/each}

                <br><br><br>
                <button>Submit</button>

            </Dialog>
        </td>
    
    </tr>
    <tr class="display">
        <td class="display"><span>No.</span></td>
        {#each basicData.columnNames as name}
            <td class="display"><span>{name}</span></td>
        {/each}
    </tr>

    {#each data as d, n}
        <tr class="display">
            <td class="display">{n}</td>
            {#each d as item}
                <td class="display">{item}</td>
            {/each}
        </tr>
    {/each}
</table>
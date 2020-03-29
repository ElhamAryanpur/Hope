<script>
let numberOfFields = 2;

$: fieldList = ((NOF)=>{
    const l = [];
    for(var i=0; i<NOF; i++){
        l.push("text");
    }
    return l;
})(numberOfFields);

function createTable(){
    const data = {
        name: tableName,
        values: fieldValues,
        types: fieldTypes
    };
    window.TableDB.get("tableNames", (doc)=>{
        if (doc.status == 404){
            window.TableDB.try_put("tableNames", {names: [data.name]});
            window.TableDB.put(data.name, data);
        } else {
            const d = doc;
            d.names.push(data.name)
            window.TableDB.try_put("tableNames", d);
            window.TableDB.put(data.name, data);
        }
    })
    
    jQuery(`#dialog`).dialog('close');
}

let fieldValues = [];
let fieldTypes = [];
let tableName = "";
</script>

<style>
    tr td {
        text-align: center;
    }

    button {
        border: 1px solid #6AAAC9;
        border-radius: 0px;
    }

    .style{
        border: 1px solid #6AAAC9;
        padding: 10px;
        padding-top: 20px;
        font-weight: bold;
    }
</style>

<table>
    <tr>
        <td><span>Number Of Fields:</span></td>
        <td><input type="number" bind:value={numberOfFields}></td>
    </tr>
    <br>
    <tr class="style">
        <td class="style">Field Name</td>
        <td class="style">Field Type</td>
    </tr>
    {#each fieldList as i, n}
        <tr class="style">
            <td class="style"><input bind:value={fieldValues[`${n}`]} type="text" placeholder="Field {n + 1}"></td>

            <td class="style">
                <select bind:value={fieldTypes[`${n}`]}>
                    <option value="text">text</option>
                    <option value="number">number</option>
                </select> <br>
            </td>
        </tr>
    {/each}
    <br> <br> <br>
    <tr>
        <td> <input bind:value={tableName} type="text" placeholder="Table Name"></td>
        <td><button on:click={()=> createTable()}>Create Table</button></td>
    </tr>
</table>
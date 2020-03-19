<script>
export let socket;

let numberOfFields = 2;

$: fieldList = ((NOF)=>{
    const l = [];
    for(var i=0; i<NOF; i++){
        l.push("text");
    }
    return l;
})(numberOfFields);

let fieldTypes = [];
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
            <td class="style"><input type="text" value="Field {n + 1}" placeholder="Name"></td>

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
        <td> <input type="text" placeholder="Table Name" value="My Table"></td>
        <td><button>Create Table</button></td>
    </tr>
</table>
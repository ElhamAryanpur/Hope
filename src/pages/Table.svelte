<script>
export let socket;
import Dialog from '../components/dialog.svelte';

let TABLE_NAMES = ["test"];

</script>

<style>
  table {
    margin: 0 auto;
  }

  span{
    font-weight: bold;
    margin-right: 10px;
  }
</style>

<table>
    <tr>
        <span>Table: </span>
        <select>
            {#each TABLE_NAMES as name}
                <option value="{name}">{name}</option>
            {/each}
        </select>
        <Dialog button="New Table" style="padding: 10px;">AAA</Dialog>
    </tr>
</table>
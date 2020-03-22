<script>
  import Dialog from '../components/dialog.svelte'
  import Box from '../components/box.svelte'
  import TableNew from './TableNew.svelte'

  let TABLE_NAMES = []

  const TableDB = new DB('tableDB')
  TableDB.get('tableNames', data => {
    if (data.names != undefined) {
      TABLE_NAMES = data.names
    }
  })

  TableDB.change(() => {
    TableDB.get('tableNames', data => {
      if (data.names != undefined) {
        TABLE_NAMES = data.names
      }
    })
  });
</script>

<style>
  button {
    font-weight: bold;
    margin-right: 10px;
    border: 1px solid #6aaac9;
    border-radius: 0px;
    font-size: 20px;
    height: 100px;
    width: 100px;
    background: #1a2835;
  }
</style>

<Dialog
  button="New Table"
  style="padding: 7px; border-radius: 0px; height: 100px; width: 100px;
  margin-left: 0px;"
  title="Create A New Table">
  <TableNew />
</Dialog>
{#each TABLE_NAMES as name}
  <button class="box">{name}</button>
{/each}

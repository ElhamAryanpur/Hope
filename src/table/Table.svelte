<script>
  import Dialog from "../components/dialog.svelte";
  import Box from "../components/box.svelte";
  import TableNew from "./TableNew.svelte";

  let TABLE_NAMES = [];

  window.TableDB = new DB("tableDB");
  function getUpdates() {
    window.TableDB.get_clean("tableNames", data => {
      if (data.names != null) {
        TABLE_NAMES = data.names;
      }
    });
  }
  getUpdates();

  window.socket.on("update table", () => {
    getUpdates();
  });

  window.TableDB.change(() => {
    getUpdates();
  });

  function changeTable(choosen = "") {
    window.changePage("tableview");
    window.choosenTable = choosen;
  }

  window.changeTable = changeTable;
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

  .down {
    animation: fadeInDown 0.7s;
  }
</style>

<svelte:head>
  <title>Hope</title>
</svelte:head>

<Dialog
  id="new-table"
  button="New Table"
  style="padding: 7px; border-radius: 0px; height: 100px; width: 100px;
  margin-left: 0px; animation: fadeInDown 0.7s;"
  title="Create A New Table">
  <TableNew />
</Dialog>

{#each TABLE_NAMES as name}
  <button class="box down" title={name} on:click={() => changeTable(name)}>
    {name.substr(0, 5)}
  </button>
{/each}

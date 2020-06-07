<script>
  import Dialog from "../components/dialog.svelte";
  import Box from "../components/box.svelte";

  let DATA = [["N/A"]];
  let EDIT = {};
  let EDIT_SHOW = false;
  let colspan;
  let newData = [];
  let LOADED = false;
  let CURRENT_PAGE = 1;

  let basicData = { columnNames: [] };
  window.TableDB.get_clean(window.choosenTable, doc => {
    basicData.columnNames = doc.values;
    basicData.types = doc.types;
    colspan = basicData.columnNames.length;
  });

  window.socket.on("update", () => {
    getQuery();
  });

  function submitData() {
    if (newData.length != 0) {
      window.socket.emit("new query", {
        table_name: window.choosenTable,
        fields: basicData.columnNames,
        data: newData
      });
      getQuery();
      const NewData = [];
      console.log(newData);
      for (var i = 0; i < newData.length; i++) {
        NewData.push("");
      }
      newData = NewData;
      console.log(NewData);
    } else {
      alert("Please Fill The Fields Before Submitting");
    }
  }

  function changeType(inpt) {
    const i = parseInt(inpt.id);
    inpt.setAttribute("type", basicData.types[i]);
  }

  function getQuery(page = 1) {
    window.socket.emit("get query", {
      name: window.choosenTable,
      page: page
    });

    window.socket.on("client get query", data => {
      const newResult = [];
      for (var i = 0; i < data.length; i++) {
        var d = data[i];
        delete d.id;
        newResult.push(d);
      }

      const finalResult = [];
      for (var i = 0; i < newResult.length; i++) {
        const row = [];
        for (var key in newResult[i]) {
          row.push(newResult[i][key]);
        }
        finalResult.push(row);
      }
      DATA = finalResult;
    });
  }

  getQuery();

  function nextPage() {
    CURRENT_PAGE += 1;
    getQuery(CURRENT_PAGE);
  }

  function beforePage() {
    if (CURRENT_PAGE <= 1) {
      CURRENT_PAGE = 1;
    } else {
      CURRENT_PAGE -= 1;
    }
    getQuery(CURRENT_PAGE);
  }

  function deleteTable() {
    const confirmation = confirm("Are You Sure You Want To Delete This Table?");
    if (confirmation) {
      window.TableDB.get_clean("tableNames", doc => {
        const filterNames = [];
        for (var i = 0; i < doc.names.length; i++) {
          if (doc.names[i] != window.choosenTable) {
            filterNames.push(doc.names[i]);
          }
        }

        window.TableDB.delete(window.choosenTable);
        window.socket.emit("delete table", { name: window.choosenTable });
        window.TableDB.put("tableNames", { names: filterNames });
        location.reload();
      });
    }
  }

  function deleteQuery(rowNum) {
    const rowData = DATA[rowNum];
    const confirmation = confirm("Are You Sure You Want To Delete This Table?");
    if (confirmation) {
      window.socket.emit("delete query", {
        name: window.choosenTable,
        columnNames: basicData.columnNames,
        data: rowData
      });
      DATA.splice(rowNum, 1);
      DATA = DATA;
    }
  }

  function editQuery(rowNum) {
    const noOfFields = basicData.columnNames.length;
    const inputs = [];
    for (var i = 0; i < noOfFields; i++) {
      inputs.push(
        document.getElementById(`row-${rowNum}-field-${i}`).innerHTML
      );
    }
    EDIT = {
      field: basicData.columnNames,
      type: basicData.types,
      data: inputs
    };

    EDIT_SHOW = true;
    window.dialog_show(`${window.choosenTable}-edit-dialog`);
  }
</script>

<style>
  table {
    margin: 0 auto;
    text-align: center;
  }
  span {
    font-weight: bold;
  }
  .title {
    font-size: 40px;
  }
  .display {
    border: 2px solid #6aaac9;
    padding: 20px;
  }
  img {
    width: 20px;
    height: 20px;
  }

  img:hover {
    background: #112436;
  }

  button {
    padding: 10px;
    padding-left: 20px;
    padding-right: 20px;
  }

  .delete-button {
    padding: 20px;
    width: 100%;
  }

  .right {
    animation: backInRight 0.5s;
  }

  .left {
    animation: backInLeft 0.5s;
  }

  .down {
    animation: backInDown 0.5s;
  }
</style>

<svelte:head>
  <title>{window.choosenTable} | Hope</title>
</svelte:head>

<table>
  <tr>
    <td colspan={colspan + 3}>
      <span class="title unselectable down">{window.choosenTable}</span>
    </td>
  </tr>
  <br />

  <tr class="down">
    <td />
    <td>
      <Box>
        <button
          class="delete-button unselectable"
          on:click={() => deleteTable()}>
          Delete
        </button>
      </Box>
    </td>

    <td>
      <Dialog
        title="Filter The Table Data"
        button="Filter"
        style="width: 100%; margin: 0; border-radius: 0px; border-radius: 10px;
        height: 59px;"
        id="{window.choosenTable}-filter" />
    </td>

  </tr>

  <tr class="down">
    <td />
    {#each basicData.columnNames as name, n}
      <td>
        <input
          id={n}
          placeholder={name}
          bind:value={newData[`${n}`]}
          use:changeType />
        <br />
      </td>
    {/each}
    <td>
      <button on:click={() => submitData()}>Submit</button>
    </td>
  </tr>
  <br />
  <tr class="display down">
    <td class="display unselectable">
      <span>No.</span>
    </td>
    {#each basicData.columnNames as name}
      <td class="display unselectable">
        <span>{name}</span>
      </td>
    {/each}
    <td colspan="2" class="display unselectable">
      <span>Setting</span>
    </td>
  </tr>

  {#if EDIT_SHOW == true}
    <Dialog id="{window.choosenTable}-edit-dialog" title="EDIT DATA">
      {#each EDIT.data as e, n}
        <span>Field {EDIT.field[n]}:</span>
        <input type="{EDIT.type[n]}}" placeholder={e} />
        <br />
      {/each}
    </Dialog>
  {/if}

  {#each DATA as d, n}
    <tr class="display" id="row-{n}-{window.choosenTable}-table">
      <td class="display left">{n + 1}</td>
      {#each d as item, m}
        <td class="display right" id="row-{n}-field-{m}">{item}</td>
      {/each}
      <td>
        <img
          on:click={() => editQuery(n)}
          class="display unselectable right"
          src="/icon-edit.png"
          alt="Edit" />
        <img
          on:click={() => deleteQuery(n)}
          class="display unselectable right"
          src="/icon-delete.png"
          alt="Delete" />
      </td>
    </tr>
  {/each}
  <tr class="display">
    <td />
    <td>
      <Box>
        <button on:click={() => beforePage()} class="delete-button">
          Previous Page
        </button>
      </Box>
    </td>
    <td>
      <Box>
        <button on:click={() => nextPage()} class="delete-button">
          Next Page
        </button>
      </Box>
    </td>
  </tr>
</table>

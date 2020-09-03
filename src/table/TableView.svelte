<script>
  import { onMount } from "svelte";
  import Dialog from "../components/dialog.svelte";
  import Box from "../components/box.svelte";
  import { text } from "svelte/internal";

  let t = 0;
  let DATA = [["N/A"]];
  let EDIT = {};
  let EDIT_SHOW = false;
  let EDIT_DATA = [];
  let colspan = 0;
  let newData = [];
  let LOADED = false;
  let CURRENT_PAGE = 1;
  let FILTER_SHOW = false;
  let FILTER_FIELD = 0;
  let code = "";
  let CODE_SHOW = false;
  let basicData = { values: [], types: [] };

  onMount(() => {
    getScript();
    window.TableDB.get_clean(window.choosenTable, (doc) => {
      new Promise((success, fail) => {
        try {
          basicData = doc;
          success("Data Loaded");
        } catch {
          fail("Couldn't load data...");
        }
      })
        .then(() => {
          const len = basicData.values.length;
          colspan = len;
        })
        .then(() => {
          if (code == "" || code == null) {
            code = `function code(data){
        // const fields = ${JSON.stringify(basicData.values)}
}`;
            document.getElementById(
              `${window.choosenTable}-script`
            ).innerHTML = code;
          }
        })
        .then(() => {
          LOADED = true;
        })
        .catch((e) => {
          console.log(e);
        });
    });
  });

  window.socket.on("update", () => {
    getQuery();
  });

  function getScript() {
    window.TableDB.get_clean(`${window.choosenTable}-script`, (result) => {
      if (result.code != null) {
        const newCode = `
      window.codes["${window.choosenTable}-function"] = ${result.code}`;
        const script = document.createElement("script");
        script.innerHTML = newCode;
        document.head.appendChild(script);
        document.getElementById(`${window.choosenTable}-script`).innerHTML =
          result.code;

        code = result.code;
      }
    });
  }

  // Test with TableDB, if worked, delete from main and make it final

  function submitData() {
    if (newData.length != 0) {
      const encFieldValues = [];
      for (var i = 0; i < basicData.values.length; i++) {
        encFieldValues.push(basicData.values[i]);
      }
      window.socket.emit("new query", {
        table_name: window.choosenTable,
        fields: encFieldValues,
        data: newData,
      });

      getQuery();
      window.codes[`${window.choosenTable}-function`](newData);

      const NewData = [];
      for (var i = 0; i < newData.length; i++) {
        NewData.push("");
      }
      newData = NewData;
    } else {
      alert("Please Fill The Fields Before Submitting");
    }
  }

  function changeType(inpt) {
    const i = parseInt(inpt.id);
    inpt.setAttribute("type", basicData.types[i]);
  }

  function changeTypeEdit(inpt) {
    const i = parseInt(inpt.id.replace("edit-", ""));
    inpt.setAttribute("type", basicData.types[i]);
  }

  function getQuery(page = 1) {
    window.socket.emit("get query", {
      name: window.choosenTable,
      page: page,
    });

    window.socket.on("client get query", (data) => {
      const finalResult = [];
      for (var i = 0; i < data.length; i++) {
        const row = [];
        for (var key in data[i]) {
          row.push(data[i][key]);
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
      window.TableDB.get_clean("tableNames", (doc) => {
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
    const confirmation = confirm("Are You Sure You Want To Delete This Row?");
    if (confirmation) {
      window.socket.emit("delete query", {
        name: window.choosenTable,
        columnNames: basicData.values,
        data: rowData,
      });
      DATA.splice(rowNum, 1);
      DATA = DATA;
    }
  }

  function editQuery(rowNum) {
    const noOfFields = basicData.values.length;
    const inputs = [];
    for (var i = 0; i < noOfFields; i++) {
      inputs.push(
        document.getElementById(`row-${rowNum}-field-${i}`).innerHTML
      );
    }
    EDIT = {
      field: basicData.values,
      type: basicData.types,
      data: inputs,
    };

    EDIT_DATA = [];
    for (var i = 0; i < inputs.length; i++) {
      EDIT_DATA.push(inputs[i]);
    }

    EDIT_SHOW = true;
    window.dialog_show(`${window.choosenTable}-edit-dialog`);
  }

  function update(d) {
    const confirmation = confirm("Are You Sure You Want To Update This Query?");
    if (confirmation) {
      window.socket.emit("update query", {
        name: window.choosenTable,
        columnNames: basicData.values,
        default: EDIT.data,
        data: EDIT_DATA,
      });
    }
    onClose();
    getQuery();
  }

  function filterData() {
    const field = basicData.values[FILTER_FIELD];
    const value = document.getElementById("filterField").value;
    const value2 = document.getElementById("filterField2").value;

    window.socket.emit("filter query", {
      table: window.choosenTable,
      field: field,
      value: [value, value2],
    });

    window.socket.on("filter query client", (data) => {
      const finalResult = [];
      for (var i = 0; i < data.length; i++) {
        const row = [];
        for (var key in data[i]) {
          row.push(data[i][key]);
        }
        finalResult.push(row);
      }
      DATA = finalResult;
    });

    onClose();
  }

  function onClose() {
    FILTER_SHOW = false;
    EDIT_SHOW = false;
    CODE_SHOW = false;
  }

  function codeSave() {
    window.TableDB.put(`${window.choosenTable}-script`, {
      name: window.choosenTable,
      code: code,
    });
    document.getElementById(`${window.choosenTable}-script`).innerHTML = code;
  }

  function total() {
    const numberFileds = [];

    for (var i = 0; i < basicData.types.length; i++) {
      if (basicData.types[i] == "number") {
        numberFileds.push(i);
      }
    }

    for (var i = 0; i < numberFileds.length; i++) {
      var sum = 0;

      for (var o = 0; o < DATA.length; o++) {
        sum += DATA[o][numberFileds[i]];
      }

      alert(
        `sum of ${window.choosenTable} table, field ${
          basicData.values[numberFileds[i]]
        }: ${sum}`
      );
    }
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
    border: 1px solid #6aaac9;
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

  .header {
    font-size: 160%;
    font-weight: bold;
  }

  .mainContent {
    font-size: 100%;
    font-weight: bold;
  }

  .child {
    width: 100%;
    height: 100%;
  }

  fieldset {
    border-color: #6aaac9;
  }

  #codeDiv {
    width: 300px;
    height: 200px;
  }

  #codeArea {
    height: 100%;
    width: 100%;
    resize: none;
  }
</style>

<svelte:head>
  <title>{window.choosenTable} | Hope</title>
</svelte:head>

<div>
  {#if LOADED === true}
    <table>
      <tr>
        <td colspan={basicData.values.length + 3}>
          <span class="title unselectable down">{window.choosenTable}</span>
        </td>
      </tr>
      <br />

      {#if window.editable == true}
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
            <button
              on:click={() => (FILTER_SHOW = true)}
              style="width: 100%; margin: 0; border-radius: 0px; border-radius:
              10px; height: 59px;">
              Filter
            </button>
            {#if FILTER_SHOW === true}
              <Dialog
                title="Filter The Table Data"
                open="true"
                {onClose}
                id="{window.choosenTable}-{t}-filter">
                <table>
                  <tr>
                    <td>
                      <fieldset>
                        <legend>Filter By:</legend>
                        <select bind:value={FILTER_FIELD} class="child">
                          {#each basicData.values as name, n}
                            <option value={n}>{name}</option>
                          {/each}
                        </select>
                      </fieldset>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <fieldset>
                        <legend>Start Search:</legend>
                        <input
                          class="child"
                          id="filterField"
                          type={basicData.types[FILTER_FIELD]} />
                      </fieldset>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <fieldset>
                        <legend>End Search:</legend>
                        <input
                          class="child"
                          id="filterField2"
                          type={basicData.types[FILTER_FIELD]} />
                      </fieldset>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <button on:click={() => filterData()}>Filter</button>
                    </td>
                  </tr>
                </table>
              </Dialog>
            {/if}
          </td>

          <td>
            <button
              on:click={() => (CODE_SHOW = true)}
              style="width: 100%; margin: 0; border-radius: 0px; border-radius:
              10px; height: 59px;">
              Script
            </button>
            {#if CODE_SHOW === true}
              <Dialog
                title="Script"
                open="true"
                {onClose}
                id="{window.choosenTable}-script-dialog">
                <div id="codeDiv">
                  <textarea id="codeArea" bind:value={code} />
                </div>
                <br />
                <button on:click={() => codeSave()}>Save</button>
              </Dialog>
            {/if}
          </td>

          <td>
            <!-- Print total -->
            <button
              style="width: 100%; margin: 0; border-radius: 0px; border-radius:
              10px; height: 59px;"
              on:click={() => total()}
              title="Tells total of all numbers in this table;">Total</button>
          </td>
        </tr>

        <tr class="down">
          <td />
          {#each basicData.values as name, n}
            <td>
              <input
                id={n}
                placeholder={name}
                bind:value={newData[`${n}`]}
                use:changeType />
              <br />
            </td>
          {/each}
          <td><button on:click={() => submitData()}>Submit</button></td>
        </tr>
        <br />
      {/if}
      <tr class="display down">
        <td class="display unselectable"><span>No.</span></td>
        {#each basicData.values as name}
          <td class="display unselectable header"><span>{name}</span></td>
        {/each}
        {#if window.editable == true}
          <td colspan="2" class="display unselectable"><span>Setting</span></td>
        {/if}
      </tr>

      {#if EDIT_SHOW == true}
        <Dialog
          id="{window.choosenTable}-edit-dialog"
          title="EDIT DATA"
          style=""
          open="true">
          {#each EDIT.data as e, n}
            <span>Field {EDIT.field[n]}:</span>
            <input
              use:changeTypeEdit
              id="edit-{n}"
              placeholder={e}
              bind:value={EDIT_DATA[n]} />
            <br />
          {/each}
          <br />
          <button on:click={() => update(EDIT)}>Update</button>
        </Dialog>
      {/if}

      {#each DATA as d, n}
        <tr class="display" id="row-{n}-{window.choosenTable}-table">
          <td class="display left">{n + 1}</td>
          {#each d as item, m}
            <td class="display right mainContent" id="row-{n}-field-{m}">
              {item}
            </td>
          {/each}
          {#if window.editable == true}
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
          {/if}
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
        <td class="display unselectable">Page: {CURRENT_PAGE}</td>
      </tr>
    </table>
  {/if}
  <script id="{window.choosenTable}-script">

  </script>
</div>

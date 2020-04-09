<script>
  import Dialog from '../components/dialog.svelte'
  import Box from '../components/box.svelte'

  let DATA = [['N/A']]
  let colspan
  let newData = []
  let LOADED = false

  let basicData = { columnNames: [] }
  window.TableDB.get_clean(window.choosenTable, doc => {
    basicData.columnNames = doc.values
    basicData.types = doc.types
    colspan = basicData.columnNames.length
  })

  function submitData() {
    window.socket.emit('new query', {
      table_name: window.choosenTable,
      fields: basicData.columnNames,
      data: newData,
    })
    DATA = [...DATA, newData]
  }

  function changeType(inpt) {
    const i = parseInt(inpt.id)
    inpt.setAttribute('type', basicData.types[i])
  }

  function getQuery(page = 1) {
    window.socket.emit('get query', {
      name: window.choosenTable,
      page: page,
    })

    window.socket.on('client get query', data => {
      const newResult = []
      for (var i = 0; i < data.length; i++) {
        var d = data[i]
        delete d.id
        newResult.push(d)
      }

      const finalResult = []
      for (var i = 0; i < newResult.length; i++) {
        const row = []
        for (var key in newResult[i]) {
          row.push(newResult[i][key])
        }
        finalResult.push(row)
      }
      DATA = finalResult
    })
  }

  getQuery()

  function deleteTable() {
    const confirmation = confirm('Are You Sure You Want To Delete This Table?')
    if (confirmation) {
      window.TableDB.get_clean('tableNames', doc => {
        const filterNames = []
        for (var i = 0; i < doc.names.length; i++) {
          if (doc.names[i] != window.choosenTable) {
            filterNames.push(doc.names[i])
          }
        }

        window.TableDB.delete(window.choosenTable)
        window.socket.emit('delete table', { name: window.choosenTable })
        window.TableDB.put('tableNames', { names: filterNames })
        location.reload()
      })
    }
  }

  function deleteQuery(rowNum) {
    const rowData = DATA[rowNum]
    const confirmation = confirm('Are You Sure You Want To Delete This Table?')
    if (confirmation) {
      window.socket.emit('delete query', {
        name: window.choosenTable,
        columnNames: basicData.columnNames,
        data: rowData,
      })
      DATA.splice(rowNum, 1)
      DATA = DATA
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

  button {
    padding: 10px;
    padding-left: 20px;
    padding-right: 20px;
  }

  .delete-button {
    padding: 20px;
  }
</style>

<table>
  <tr>
    <td colspan={colspan + 3}>
      <span class="title">{window.choosenTable}</span>
    </td>
  </tr>
  <br />

  <tr>
    <td />
    <td>
      <Box>
        <button class="delete-button" on:click={() => deleteTable()}>
          Delete
        </button>
      </Box>
    </td>

    <td>
      <Dialog
        title="Filter The Table Data"
        button="Filter"
        style="width: 100%; margin: 0;"
        id="{window.choosenTable}-filter" />
    </td>

  </tr>

  <tr>
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
  <tr class="display">
    <td class="display">
      <span>No.</span>
    </td>
    {#each basicData.columnNames as name}
      <td class="display">
        <span>{name}</span>
      </td>
    {/each}
    <td colspan="2" class="display">
      <span>Setting</span>
    </td>
  </tr>

  {#each DATA as d, n}
    <tr class="display" id="row-{n}-{window.choosenTable}-table">
      <td class="display">{n + 1}</td>
      {#each d as item}
        <td class="display">{item}</td>
      {/each}
      <td>
        <img class="display" src="/icon-edit.png" alt="Edit" />
        <img
          on:click={() => deleteQuery(n)}
          class="display"
          src="/icon-delete.png"
          alt="Delete" />
      </td>
    </tr>
  {/each}
  <tr class="display">
    <td />
    <td>
      <Box>
        <button class="delete-button">Previous Page</button>
      </Box>
    </td>
    <td>
      <Box>
        <button class="delete-button">Next Page</button>
      </Box>
    </td>
  </tr>
</table>

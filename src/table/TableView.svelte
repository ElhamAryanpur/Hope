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
    console.log("AAAA")
    window.socket.emit('new query', {
      table_name: window.choosenTable,
      fields: basicData.columnNames,
      data: newData,
    })
    DATA = [...DATA, newData]
    jQuery(`#${window.choosenTable}-new`).dialog('close')
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
      window.socket.emit('delete table', { name: window.choosenTable })
      window.TableDB.get_clean('tableNames', doc => {
        var names = doc.names
        const index = names.indexOf(window.choosenTable)
        if (index > -1) {
          names.splice(index, 1)
        }
        window.TableDB.put_v2('tableNames', { names: names })
        window.TableDB.delete(window.choosenTable, resp => {
          location.reload()
          window.changePage('table')
        })
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
        id="{window.choosenTable}-filter" />
    </td>

    <td>
      <Dialog
        title="Add New Query To The Table"
        button="New"
        id="{window.choosenTable}-new-dialog">

        {#each basicData.columnNames as name, n}
          <input
            id={n}
            placeholder={name}
            bind:value={newData[`${n}`]}
            use:changeType />
          <br />
        {/each}

        <br />
        <br />
        <br />
        <button on:click={() => submitData()}>Submit</button>

      </Dialog>
    </td>

  </tr>
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

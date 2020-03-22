<script>
  import Menu from './pages/Menu.svelte'
  import Dash from './pages/Dash.svelte'
  import Table from './pages/Table.svelte'

  let choosen = window.choosen;
  if (choosen == null){ choosen = 'table' }

  window.updateChoosen = function(){ choosen = window.choosen }

  window.HEIGHT = window.innerHeight - 10
  let width
  window.addEventListener('resize', () => {
    window.HEIGHT = window.innerHeight - 10
  });
</script>

<style>
  #menu {
    padding: 5px;
    width: 90px;
    background: #18212b;
  }

  #main {
    background: #1f2b3a;
    padding: 20px;
    border-radius: 10px;
    margin-left: 30px;
    margin-right: 30px;
    padding-top: 30px;
    padding-bottom: 30px;
    overflow-y: scroll;
  }

</style>

<table style="width: 100%">
  <tr>
    <td style="width: {width}px">
      <div id="menu" style="height: {window.HEIGHT}px; width: {width}px">
        <table bind:clientWidth={width}>
          <Menu />
        </table>
      </div>
    </td>
    <td>
      <div id="main" style="max-height: {window.HEIGHT - 100}px;">
          {#if choosen === 'dash'}
            <Dash/>
          {:else if choosen === 'table'}
             <Table/>
          {/if}
      </div>
    </td>
  </tr>
</table>

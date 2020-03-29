<script>
  import Box from '../components/box.svelte'

  window.changePage = function(to = 'account') {
    window.choosen = to
    window.updateChoosen()
  }
</script>

<style>
  div {
    padding: 20px;
  }
</style>

<tr>
  <td>
    <Box>
      <div on:click={() => window.changePage('dash')}>Dashboard</div>
    </Box>
  </td>
</tr>
<tr>
  <td>
    <Box>
      <div on:click={() => window.changePage('table')}>Table</div>
    </Box>
  </td>
</tr>

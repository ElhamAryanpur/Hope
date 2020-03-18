<script>
  import Box from '../components/box.svelte'

  function change(to = 'account') {
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
      <div on:click={() => change('dash')}>Dashboard</div>
    </Box>
  </td>
</tr>
<tr>
  <td>
    <Box>
      <div on:click={() => change('table')}>Table</div>
    </Box>
  </td>
</tr>

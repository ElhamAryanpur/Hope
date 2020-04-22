<script>
  import Box from './box.svelte'

  export let id
  if (id == undefined) {
    id = 'dialog'
  }

  export let title
  if (title == undefined) {
    title = ''
  }

  export let button
  if (button == undefined) {
    button = false
  }

  export let style
  if (style == undefined) {
    style = ''
  }

  import { onMount } from 'svelte'

  onMount(() => {
    const height = window.HEIGHT - 100
    const d = document.getElementById(id)
    if (button) {
    } else {
      d.show()
    }
  })

  window.dialog_show = (id)=> {
    document.getElementById(id).show()
  }

  window.dialog_close = (id) => {
    document.getElementById(id).close()
  }
</script>

<style>
  button {
    padding: 20px;
    background: #1a2835;
    border-radius: 10px;
    text-align: center;
    cursor: pointer;
    font-weight: bold;
    color: #6aaac9;
    border: 1px solid #6aaac9;
    margin: 10px;
  }

  dialog {
    background: #1a2835;
    color: #6aaac9;
    z-index: 99;
    position: absolute;
    top: 20%;
  }

  table {
    text-align: center;
  }
</style>

<dialog {id}>
  <table>
    <tr>
      <td colspan="5">
        <h2>{title}</h2>
      </td>
      <td>
        <button on:click={() => window.dialog_close(id)}>X</button>
      </td>
    </tr>
    <tr>
      <td colspan="6">
        <slot />
      </td>
    </tr>
  </table>
</dialog>

{#if button != false}
  <button class="box" on:click={() => window.dialog_show(id)} {style}>{button}</button>
{/if}

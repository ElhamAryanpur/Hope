<script>
  import Box from "./box.svelte";
  import { center } from "../lib/center.svelte";

  export let id;
  if (id == undefined) {
    id = "dialog";
  }

  export let title;
  if (title == undefined) {
    title = "";
  }

  export let button;
  if (button == undefined) {
    button = false;
  }

  export let style;
  if (style == undefined) {
    style = "";
  }

  export let open;
  if (open == undefined) {
    open = "false";
  }

  import { onMount } from "svelte";

  onMount(() => {
    const height = window.HEIGHT - 100;
    if (button) {
    } else {
      window.dialog_show(id);
    }
    if (open == "false") {
      window.dialog_close(id);
    }
  });

  window.dialog_show = id => {
    document.getElementById(id).style.display = "";
  };

  window.dialog_close = id => {
    document.getElementById(id).style.display = "none";
  };
</script>

<style>
  button {
    padding: 10px;
    background: #1a2835;
    border-radius: 10px;
    text-align: center;
    cursor: pointer;
    font-weight: bold;
    color: #6aaac9;
    border: 1px solid #6aaac9;
    border-radius: 50px;
    margin: 10px;
  }

  .dialog {
    background: #1a2835;
    color: #6aaac9;
    z-index: 99;
    position: fixed;
    border-radius: 10px;
    padding: 1%;
    display: block;
    animation: backInDown 0.3s;
    max-height: 50vh;
    overflow: auto;
  }

  .table {
    text-align: center;
  }
</style>

<table use:center class="dialog" {id}>
  <table class="table">
    <tr>
      <td colspan="5">
        <h2 class="unselectable">{title}</h2>
      </td>
      <td>
        <button class="unselectable" on:click={() => window.dialog_close(id)}>
          X
        </button>
      </td>
    </tr>
    <tr>
      <td colspan="6">
        <slot />
      </td>
    </tr>
  </table>
</table>

{#if button != false}
  <button class="box" on:click={() => window.dialog_show(id)} {style}>
    {button}
  </button>
{/if}

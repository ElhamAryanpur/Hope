<script>
  import Table from "./table/Table.svelte";
  import TableView from "./table/TableView.svelte";
  import { encode } from "./lib/enc.svelte";

  let pass = false;
  let choosen = window.choosen;

  const auth = function () {
    var askForPassword = prompt("Enter Password", "");
    if (askForPassword != null) {
      askForPassword = encode(askForPassword);
      const xh = new XMLHttpRequest();
      xh.open("GET", `/apiv1/auth/${askForPassword}`, false);
      xh.send(null);
      const result = JSON.parse(xh.responseText);

      if (result["auth"] == true) {
        success();
        pass = true;
      } else {
        auth();
      }
    }
  };

  const success = function () {
    if (choosen == null) {
      choosen = "table";
    }

    window.changePage = function (to = "account") {
      window.choosen = to;
      window.updateChoosen();
    };

    window.updateChoosen = function () {
      choosen = window.choosen;
    };

    window.HEIGHT = window.innerHeight - 10;
    window.addEventListener("resize", () => {
      location.reload();
    });

    window.editable = true;

    window.socket.on("no edit", () => {
      window.editable = false;
    });

    window.codes = {};
  };

  auth();
</script>

<style>
  button {
    position: fixed;
    top: 20px;
    left: 20px;
    font-weight: bold;
    padding: 10px;
  }

  #main {
    background: #1f2b3a;
    padding: 20px;
    border-radius: 10px;
    margin-left: 30px;
    margin-right: 30px;
    padding-top: 30px;
    padding-bottom: 30px;
    overflow: auto;
  }
</style>

{#if pass == true}
  <table style="height: 100%; width: 100%;">
    <tr>
      <td>
        <div
          id="main"
          style="max-height: {window.HEIGHT - 100}px; width: {window.innerWidth - 100}px;">
          {#if choosen === 'table'}
            <Table />
          {:else if choosen === 'tableview'}
            <TableView />
          {/if}
        </div>
      </td>
    </tr>
  </table>

  {#if choosen === 'tableview'}
    <button on:click={() => window.changePage('table')}>Back</button>
  {/if}
{/if}

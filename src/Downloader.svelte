<script>
  import { flows } from './stores.js';
  import Button from './Button.svelte';
  import { Workbook } from 'exceljs';

  export let closePopup;

  function download() {
    let data = JSON.stringify($flows, (key, value) => {
      if (key === 'history') {
        return undefined;
      }
      return value;
    });
    let element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/json;charset=utf-8, ' + encodeURIComponent(data)
    );
    element.setAttribute('download', 'flow.json');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    closePopup();
  }
  function downloadXLSX() {
    let wb = new Workbook();
    for (let flow of $flows) {
      let data = [];
      function childToData(box, x, y) {
        while (!data[y]) {
          let row = [];
          for (let i = 0; i < flow.columns.length; i++) {
            row.push('');
          }
          data.push(row);
        }
        // exclude root
        if (x >= 0) {
          data[y][x] = box.content;
        }
        box.children.forEach(function (child, index) {
          childToData(child, x + 1, y + index);
        });
      }
      childToData(flow, -1, 0);

      let name = flow.content;
      if (name.length >= 31) {
        name = name.substring(0, 31);
      }
      let ws = wb.addWorksheet(name);
      ws.columns = flow.columns.map(function (column) {
        return { header: column, width: 25 };
      });
      let row;
      for (let y = 0; y < data.length; y++) {
        // make space for header with + 2
        row = ws.getRow(y + 2);
        for (let x = 0; x < data[y].length; x++) {
          row.getCell(x + 1).value = data[y][x];
        }
      }
      // bold headers
      ws.getRow(1).font = { bold: true };
    }
    wb.xlsx
      .writeBuffer({
        base64: true,
      })
      .then(function (xls64) {
        // build anchor tag and attach file (works in chrome)
        var a = document.createElement('a');
        var data = new Blob([xls64], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        var url = URL.createObjectURL(data);
        a.href = url;
        a.download = 'flow.xlsx';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 0);
      })
      .catch(function (error) {
        console.log(error.message);
      });
    closePopup();
  }
</script>

<div class="top">
  <section class="json">
    <Button
      icon="download"
      text="download as JSON"
      tooltip="saves JSON file on your computer"
      tooltipLayout="top"
      on:click={download}
      disabled={$flows.length == 0}
      disabledReason={'nothing to download'}
    />
    <ul>
      <li>Can reopen file in this editor</li>
      <li>More data is saved (last focused cell etc.)</li>
    </ul>
  </section>
  <section class="xlsx">
    <Button
      icon="download"
      text="download as XLSX"
      tooltip="saves XLSX file on your computer"
      tooltipLayout="top"
      on:click={downloadXLSX}
      disabled={$flows.length == 0}
      disabledReason={'nothing to download'}
    />
    <ul>
      <li>Anyone can view it</li>
    </ul>
  </section>
</div>

<style>
  .top {
    width: clamp(400px, 30vw, 600px);
    height: min-content;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
  ul {
    line-height: 1.6em;
    margin: 0;
    padding-left: var(--padding-big);
    color: var(--color-subtle);
  }

  section {
    width: 100%;
    padding: var(--padding-big);
    padding-top: calc(var(--button-size) + var(--padding));
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--padding);
  }
  .xlsx {
    background: var(--background-secondary);
  }
</style>

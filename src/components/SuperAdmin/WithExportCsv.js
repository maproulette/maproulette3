import json from 'highlight.js/lib/languages/json'
import React, { Component } from 'react'
const WithExportCsv = function (WrappedComponent) {
  return class extends Component {

    render() {
      function filterData() {
        let allRow = document.querySelectorAll('[role="row"]:not(.-padRow)')
        let headers = document.querySelectorAll('[role="row"]:not(.-padRow)')[0]
        let headerParsed = [], dataParsed = []
        for (let i = 0; i < headers.children.length; i++) {
          headerParsed.push(headers.children[i].childNodes[0].innerHTML)
        }
        allRow = [].slice.call(allRow, 1)
        allRow.map((row) => {
          let item = []
          for (let i = 0; i < row.children.length; i++) {
            item.push(row.children[i].childNodes[0].innerHTML ? row.children[i].childNodes[0].innerHTML : row.children[i].innerHTML)
          }
          dataParsed.push(item)
        }
        )
        let json_pre = [headerParsed, dataParsed]
        return json_pre
      }

      function download() {

        var json_pre = challenges.map((c) => ({ id: c.id, Name: c.name, TaskRemaining: c.tasksRemaining, CompletionPercentage: c.completionPercentage }));

        var csv = JSON2CSV(json_pre);
        var downloadLink = document.createElement("a");
        var blob = new Blob(["\ufeff", csv]);
        var url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = "data.csv";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }

      function JSON2CSV(objArray) {
        const header = Object.keys(objArray[0]);
        const headerString = header.join(',');
        // handle null or undefined values here
        const replacer = (key, value) => value ?? '';
        const rowItems = objArray.map((row) =>
          header
            .map((fieldName) => JSON.stringify(row[fieldName], replacer))
            .join(',')
        );
        // join header and body, and break into separate lines
        const csv = [headerString, ...rowItems].join('\r\n');
        return csv;
      }
      return <WrappedComponent
        {...this.props}
        filterData={filterData}
      />
    }
  }
}

export default (WrappedComponent) => WithExportCsv(WrappedComponent)
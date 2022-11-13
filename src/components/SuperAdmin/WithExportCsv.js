import React, { Component } from 'react'
import AsManageableProject from '../../interactions/Project/AsManageableProject'
const WithExportCsv = function (WrappedComponent) {
  return class extends Component {
    render() {
      function formatChallengeData(props) {
        let json_pre = props.challenges.map((item) => {
          const created = new Date(item.created);
          const modified = new Date(item.modified);
          
          return {
            'ID': item.id,
            'NAME': item.name,
            'OWNER': item.owner,
            'TASKS REMAINING': item.tasksRemaining,
            '% COMPLETED TASKS': item.completionPercentage,
            'PROJECT': item.parent,
            'VISIBLE': item.enabled.toString(),
            'ARCHIVED': item.isArchived.toString(),
            'DATE CREATED': `${created.getMonth() + 1}/${created.getDate()}/${created.getFullYear()}`,
            'DATE LAST MODIFIED': `${modified.getMonth() + 1}/${modified.getDate()}/${modified.getFullYear()}`,
          };
        })
        console.log(json_pre)
        return json_pre;
      }

    function formatProjectData(props) {
        let json_pre = props.projects.map((item) => {
          const created = new Date(item.created);
          const modified = new Date(item.modified);
          const projectManage= AsManageableProject(item)
          const numOfChallenges = projectManage.childChallenges(props.challenges).length
          return {
            'ID': item.id,
            'NAME': item.name,
            'OWNER': item.owner,
            '# OF CHALLENGES': numOfChallenges,
            'VISIBLE': item.enabled.toString(),
            'ARCHIVED': item.isArchived.toString(),
            'VIRTUAL': item.isVirtual.toString(),
            'DATE CREATED': `${created.getMonth() + 1}/${created.getDate()}/${created.getFullYear()}`,
            'DATE LAST MODIFIED': `${modified.getMonth() + 1}/${modified.getDate()}/${modified.getFullYear()}`,
          };
        })
        return json_pre;
      }

      function download(currentTab, props) {
        let json_pre
        console.log(currentTab)
        if(currentTab === 'challenge'){
          json_pre = formatChallengeData(props)
        }
        else if(currentTab === 'project'){
          json_pre = formatProjectData(props)
        }
        const csv = jsonToCsv(json_pre);
        let downloadLink = document.createElement('a');
        const blob = new Blob(['\ufeff', csv]);
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = "data.csv";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }

      function jsonToCsv(jsonData) {
        const header = Object.keys(jsonData[0]);
        const headerString = header.join(',');

        // handle null or undefined values here
        const replacer = (key, value) => value ?? '';
        const rowItems = jsonData.map((row) =>
          header
            .map((fieldName) => JSON.stringify(row[fieldName], replacer))
            .join(',')
        );
        // join header and body, and break into separate lines
        const csv = [headerString, ...rowItems].join('\r\n');
        return csv;
      }

      function getNumOfRows() {
        let allRow = document.querySelectorAll('[role="row"]:not(.-padRow)').length
        return allRow
      }

      return <WrappedComponent
        {...this.props}
        downloadCsv={download}
      />
    }
  }
}

export default (WrappedComponent) => WithExportCsv(WrappedComponent)

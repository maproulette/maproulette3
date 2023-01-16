import React, { Component } from 'react'
/**
 * WithExportCsv handles CSV file formatting/downloading for challenges/projects/users table in super admin.
 */
const WithExportCsv = function (WrappedComponent) {
  return class extends Component {
    render() {
      function formatChallengeData(props) {
        let json_pre = props.challenges.map((item) => {
          const created = item.created ? new Date(item.created) : ''
          const dataOriginDate = item.dataOriginDate
            ? new Date(item.dataOriginDate)
            : ''
          const lastTaskRefresh = item.lastTaskRefresh
            ? new Date(item.lastTaskRefresh)
            : ''

          return {
            ID: item.id,
            NAME: item.name,
            OWNER: item.owner,
            'TASKS REMAINING': item.tasksRemaining,
            '% COMPLETED TASKS': item.completionPercentage,
            PROJECT: item.parent?.displayName,
            DISCOVERABLE: item.enabled.toString(),
            ARCHIVED: item.isArchived.toString(),
            'DATE CREATED': created
              ? `${
                  created.getMonth() + 1
                }/${created.getDate()}/${created.getFullYear()}`
              : '',
            'DATA ORIGIN DATE': dataOriginDate
              ? `${
                  dataOriginDate.getMonth() + 1
                }/${dataOriginDate.getDate()}/${dataOriginDate.getFullYear()}`
              : '',
            'LAST TASK REFRESH': lastTaskRefresh
              ? `${
                  lastTaskRefresh.getMonth() + 1
                }/${lastTaskRefresh.getDate()}/${lastTaskRefresh.getFullYear()}`
              : '',
          }
        })

        return json_pre
      }

      function formatProjectData(props) {
        let json_pre = props.projects.map((item) => {
          const created = item.created ? new Date(item.created) : ''
          const modified = item.modified ? new Date(item.modified) : ''

          return {
            ID: item.id,
            NAME: item.displayName,
            OWNER: item.owner,
            DISCOVERABLE: item.enabled.toString(),
            ARCHIVED: item.isArchived.toString(),
            VIRTUAL: item.isVirtual.toString(),
            'DATE CREATED': created
              ? `${
                  created.getMonth() + 1
                }/${created.getDate()}/${created.getFullYear()}`
              : '',
            'DATE LAST MODIFIED': modified
              ? `${
                  modified.getMonth() + 1
                }/${modified.getDate()}/${modified.getFullYear()}`
              : '',
          }
        })

        return json_pre
      }

      function formatUserData(props) {
        let json_pre = props.users.map((item) => {
          const created = item.created ? new Date(item.created) : ''
          const modified = item.modified ? new Date(item.modified) : ''

          return {
            ID: item.id,
            NAME: item.osmProfile.displayName,
            SCORE: item.score,
            'DATE CREATED': created
              ? `${
                  created.getMonth() + 1
                }/${created.getDate()}/${created.getFullYear()}`
              : '',
            'DATE LAST ACTIVE': modified
              ? `${
                  modified.getMonth() + 1
                }/${modified.getDate()}/${modified.getFullYear()}`
              : '',
          }
        })

        return json_pre
      }

      function download(currentTab, props) {
        let json_pre
        if (currentTab === 'challenges') {
          json_pre = formatChallengeData(props)
        } else if (currentTab === 'projects') {
          json_pre = formatProjectData(props)
        } else {
          json_pre = formatUserData(props)
        }
        const csv = jsonToCsv(json_pre)
        let downloadLink = document.createElement('a')
        const blob = new Blob(['\ufeff', csv])
        const url = URL.createObjectURL(blob)
        downloadLink.href = url
        downloadLink.download = 'data.csv'
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
      }

      function jsonToCsv(jsonData) {
        const header = Object.keys(jsonData[0])
        const headerString = header.join(',')

        // handle null or undefined values here
        const replacer = (key, value) => value ?? ''
        const rowItems = jsonData.map((row) =>
          header
            .map((fieldName) => JSON.stringify(row[fieldName], replacer))
            .join(',')
        )
        // join header and body, and break into separate lines
        const csv = [headerString, ...rowItems].join('\r\n')
        return csv
      }

      return <WrappedComponent {...this.props} downloadCsv={download} />
    }
  }
}

export default (WrappedComponent) => WithExportCsv(WrappedComponent)

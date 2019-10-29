import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with RebuildTasksControl
 */
export default defineMessages({
  label: {
    id: "RebuildTasksControl.label",
    defaultMessage: "Rebuild Tasks",
  },

  modalTitle: {
    id: "RebuildTasksControl.modal.title",
    defaultMessage: "Rebuild Challenge Tasks",
  },

  overpass: {
    id: "RebuildTasksControl.modal.intro.overpass",
    defaultMessage: "Rebuilding will re-run the Overpass query and rebuild the challenge tasks with the latest data:"
  },

  remote: {
    id: "RebuildTasksControl.modal.intro.remote",
    defaultMessage: "Rebuilding will re-download the GeoJSON data from the challenge's remote URL and rebuild the challenge tasks with the latest data:"
  },

  local: {
    id: "RebuildTasksControl.modal.intro.local",
    defaultMessage: "Rebuilding will allow you to upload a new local file with the latest GeoJSON data and rebuild the challenge tasks:"
  },

  explanation: {
    id: "RebuildTasksControl.modal.explanation",
    defaultMessage:
`* Existing tasks included in the latest data will be updated
* New tasks will be added
* If you choose to first remove incomplete tasks (below), existing __incomplete__ tasks will first be removed
* If you do not first remove incomplete tasks, they will be left as-is, possibly leaving tasks that have already been addressed outside of MapRoulette`,
  },

  warning: {
    id: "RebuildTasksControl.modal.warning",
    defaultMessage: "Warning: Rebuilding can lead to task duplication if your feature ids are not setup properly or if matching up old data with new data is unsuccessful. This operation cannot be undone!"
  },

  moreInfo: {
    id: "RebuildTasksControl.modal.moreInfo",
    defaultMessage: "[Learn More](https://github.com/osmlab/maproulette3/wiki/Rebuilding-(Updating)-Challenge-Task-Data)"
  },

  removeUnmatchedLabel: {
    id: "RebuildTasksControl.modal.controls.removeUnmatched.label",
    defaultMessage: "First remove incomplete tasks"
  },

  cancel: {
    id: "RebuildTasksControl.modal.controls.cancel.label",
    defaultMessage: "Cancel"
  },

  proceed: {
    id: "RebuildTasksControl.modal.controls.proceed.label",
    defaultMessage: "Proceed"
  },

  dataOriginDateLabel: {
    id: 'RebuildTasksControl.modal.controls.dataOriginDate.label',
    defaultMessage: "Date data was sourced",
  },
})

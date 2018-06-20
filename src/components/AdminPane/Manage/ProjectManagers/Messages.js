import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ProjectManagers
 */
export default defineMessages({
  noManagers: {
    id: "Admin.ProjectManagers.noManagers",
    defaultMessage: "No Managers"
  },

  addManager: {
    id: "Admin.ProjectManagers.addManager",
    defaultMessage: "Add Project Manager"
  },

  projectOwner: {
    id: "Admin.ProjectManagers.projectOwner",
    defaultMessage: "Owner"
  },

  removeManagerTooltip: {
    id: "Admin.ProjectManagers.controls.removeManager.tooltip",
    defaultMessage: "Remove Manager"
  },

  removeManagerConfirmation: {
    id: "Admin.ProjectManagers.controls.removeManager.confirmation",
    defaultMessage: "Are you sure you wish to remove this manager from the project?"
  },

  chooseRole: {
    id: "Admin.ProjectManagers.controls.selectRole.choose.label",
    defaultMessage: "Choose Role"
  },
})


import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ProjectManagersWidget
 */
export default defineMessages({
  title: {
    id: "Widgets.ProjectManagersWidget.label",
    defaultMessage: "Project Managers",
  },

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

  removeManagerLabel: {
    id: "Admin.ProjectManagers.controls.removeManager.label",
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

  osmUsernamePlaceholder: {
    id: "Admin.ProjectManagers.controls.chooseOSMUser.placeholder",
    defaultMessage: "OpenStreetMap username"
  },

  teamNamePlaceholder: {
    id: "Admin.ProjectManagers.controls.chooseTeam.placeholder",
    defaultMessage: "Team name"
  },

  teamOption: {
    id: "Admin.ProjectManagers.options.teams.label",
    defaultMessage: "Team"
  },

  userOption: {
    id: "Admin.ProjectManagers.options.users.label",
    defaultMessage: "User"
  },

  teamIndicator: {
    id: "Admin.ProjectManagers.team.indicator",
    defaultMessage: "Team"
  },
})

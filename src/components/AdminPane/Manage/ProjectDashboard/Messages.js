import { defineMessages } from "react-intl";

/**
 * Internationalized messages for use with ProjectDashboard
 */
export default defineMessages({
  editProjectLabel: {
    id: "Admin.ProjectCard.controls.editProject.label",
    defaultMessage: "Edit Project",
  },

  deleteProjectLabel: {
    id: "Admin.Project.controls.delete.label",
    defaultMessage: "Delete Project",
  },

  archiveProjectLabel: {
    id: "Admin.ProjectCard.controls.archiveProject.label",
    defaultMessage: "Archive Project",
  },

  unarchiveProjectLabel: {
    id: "Admin.ProjectCard.controls.unarchiveProject.label",
    defaultMessage: "Unarchive Project",
  },

  addChallengeLabel: {
    id: "Admin.Project.controls.addChallenge.label",
    defaultMessage: "Add Challenge",
  },

  manageChallengesLabel: {
    id: "Admin.ProjectDashboard.controls.manageChallenges.label",
    defaultMessage: "Manage Challenges",
  },

  projectNotFound: {
    id: "Admin.ProjectDashboard.projectNotFound",
    defaultMessage: "Project Not Found",
  },
});

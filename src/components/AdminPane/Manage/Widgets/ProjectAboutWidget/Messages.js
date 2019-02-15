import { defineMessages } from 'react-intl'

/**
 * Internationalized messages for use with ProjectAboutWidget
 */
export default defineMessages({
  label: {
    id: "Widgets.ProjectAboutWidget.label",
    defaultMessage: "About Projects",
  },

  title: {
    id: "Widgets.ProjectAboutWidget.title",
    defaultMessage: "About Projects",
  },

  content: {
    id: "Widgets.ProjectAboutWidget.content",
    defaultMessage:
`Projects serve as a means of grouping related challenges together. All
challenges must belong to a project.

You can create as many projects as needed to organize your challenges, and can
invite other MapRoulette users to help manage them with you.

Projects must be set to visible before any challenges within them will show up
in public browsing or searching.`,
  },
})

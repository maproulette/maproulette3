// Column definitions for TasksReviewTable
export const setupConfigurableColumns = (reviewTasksType, metaReviewEnabled) => {
  let columns = {
    id: {},
    featureId: {},
    reviewStatus: { permanent: true },
    reviewRequestedBy: {},
    challengeId: {},
    challenge: {},
    projectId: {},
    project: {},
    mappedOn: {},
    reviewedBy: {},
    reviewedAt: {},
    status: {},
    priority: {},
    reviewCompleteControls: { permanent: true },
    reviewerControls: { permanent: true },
    mapperControls: { permanent: true },
    viewComments: {},
    tags: {},
    additionalReviewers: {},
  };

  if (metaReviewEnabled) {
    columns.metaReviewStatus = {};
    columns.metaReviewedBy = {};
    columns.metaReviewedAt = {};
    columns.metaReviewerControls = { permanent: true };
  }

  let defaultColumns = Object.keys(columns);

  // Remove any columns not relevant to the current tab.
  switch (reviewTasksType) {
    case "reviewedByMe":
      columns = Object.fromEntries(
        Object.entries(columns).filter(
          ([key]) => !["reviewerControls", "mapperControls", "metaReviewerControls"].includes(key),
        ),
      );
      defaultColumns = defaultColumns.filter(
        (col) =>
          !["reviewedBy", "reviewerControls", "mapperControls", "metaReviewerControls"].includes(
            col,
          ),
      );
      break;

    case "toBeReviewed":
      columns = Object.fromEntries(
        Object.entries(columns).filter(
          ([key]) =>
            !["reviewCompleteControls", "mapperControls", "metaReviewerControls"].includes(key),
        ),
      );
      defaultColumns = defaultColumns.filter(
        (col) =>
          !["reviewCompleteControls", "mapperControls", "metaReviewerControls"].includes(col),
      );
      break;

    case "allReviewedTasks":
      columns = Object.fromEntries(
        Object.entries(columns).filter(
          ([key]) =>
            !["reviewCompleteControls", "reviewerControls", "metaReviewerControls"].includes(key),
        ),
      );
      defaultColumns = defaultColumns.filter(
        (col) =>
          !["reviewCompleteControls", "reviewerControls", "metaReviewerControls"].includes(col),
      );
      break;

    case "metaReviewTasks":
      columns = Object.fromEntries(
        Object.entries(columns).filter(
          ([key]) =>
            !["reviewCompleteControls", "reviewerControls", "mapperControls"].includes(key),
        ),
      );
      defaultColumns = defaultColumns.filter(
        (col) => !["reviewCompleteControls", "reviewerControls", "mapperControls"].includes(col),
      );
      break;

    case "myReviewedTasks":
    default:
      columns = Object.fromEntries(
        Object.entries(columns).filter(
          ([key]) =>
            ![
              "reviewRequestedBy",
              "reviewCompleteControls",
              "reviewerControls",
              "metaReviewerControls",
            ].includes(key),
        ),
      );
      defaultColumns = defaultColumns.filter(
        (col) =>
          ![
            "reviewRequestedBy",
            "reviewCompleteControls",
            "reviewerControls",
            "metaReviewerControls",
          ].includes(col),
      );
      break;
  }

  return { columns, defaultColumns };
};

export const ALL_COLUMNS = {
  id: {},
  featureId: {},
  reviewStatus: { permanent: true },
  reviewRequestedBy: {},
  challengeId: {},
  challenge: {},
  projectId: {},
  project: {},
  mappedOn: {},
  reviewedBy: {},
  reviewedAt: {},
  metaReviewedAt: {},
  metaReviewedBy: {},
  metaReviewStatus: {},
  status: {},
  priority: {},
  reviewCompleteControls: { permanent: true },
  reviewerControls: { permanent: true },
  mapperControls: { permanent: true },
  metaReviewerControls: { permanent: true },
  viewComments: {},
  tags: {},
  additionalReviewers: {},
};

export const DEFAULT_COLUMNS = ["id", "reviewStatus", "challenge", "mappedOn", "reviewerControls"];

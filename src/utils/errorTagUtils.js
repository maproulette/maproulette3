export const formatErrorTags = (errorTags, options) => {
  if (errorTags.length) {
    const tags = errorTags.split(",");

    return tags.map((tag) => {
      const option = options?.data.find((o) => o.id === Number(tag));

      return option?.name;
    });
  }
};

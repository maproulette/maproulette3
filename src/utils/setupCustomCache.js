export const setupCustomCache = (cacheTime) => {
  return {
    get: (variables, params, type) => {
      const cachedData = localStorage.getItem(
        `${type}::${JSON.stringify(variables)}::${JSON.stringify(params)}`,
      );

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const currentTime = Date.now();
        if (currentTime < parsed.date + cacheTime) {
          return JSON.parse(cachedData)?.data;
        }
      }

      return false;
    },

    set: (variables, params, data, type) => {
      const obj = JSON.stringify({
        date: Date.now(),
        data,
      });

      localStorage.setItem(`${type}::${JSON.stringify(variables)}::${JSON.stringify(params)}`, obj);
    },
  };
};

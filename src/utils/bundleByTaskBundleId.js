const bundleByTaskBundleId = (tasks, externalId) => {
  const bundled = [];
  let leftoverTasks = tasks;
  let infiniteLoopCount = 0;
  let prevLength = leftoverTasks.length;

  while (leftoverTasks.length) {
    const task = leftoverTasks[0];
    const id = task.properties[externalId];

    const matchingTasks = leftoverTasks.filter((t) => {
      if (t.properties[externalId] === id) {
        return true;
      }

      return false;
    });

    let bundledTask;

    if (matchingTasks.length > 1) {
      let features = [];

      for (let j = 0; j < matchingTasks.length; j++) {
        features = features.concat(matchingTasks[j]);
      }

      bundledTask = {
        type: "FeatureCollection",
        features,
      };
    } else {
      bundledTask = matchingTasks[0];
    }

    const nonMatchingTasks = leftoverTasks.filter((t) => {
      if (t.properties[externalId] !== id) {
        return true;
      }

      return false;
    });

    bundled.push(JSON.stringify(bundledTask));
    leftoverTasks = nonMatchingTasks;

    if (leftoverTasks.length === prevLength) {
      infiniteLoopCount++;

      if (infiniteLoopCount > 10) {
        console.log(
          "There was a problem with your data that caused an infinite loop.  Process stopped"
        );
        break;
      }
    } else {
      infiniteLoopCount = 0;
    }
  }

  return bundled;
};

export default bundleByTaskBundleId;

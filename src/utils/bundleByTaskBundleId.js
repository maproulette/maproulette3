const bundleByTaskBundleId = (tasks, externalId) => {
  const bundled = [];
  let leftoverTasks = tasks;

  while (leftoverTasks.length) {
    const task = leftoverTasks[0];
    const id = task.properties[externalId];
    const features = [];
    let infiniteLoopCount = 0;
    let prevLength = leftoverTasks.length;
    let bundledTask;

    if (id === undefined) {
      bundledTask = {
        type: "FeatureCollection",
        features: [task],
      };
      bundled.push(JSON.stringify(bundledTask));
      leftoverTasks.shift();
    } else {
      const matchingTasks = leftoverTasks.filter((t) => {
        if (t.properties[externalId] === id) {
          return true;
        }

        return false;
      });

      for (let j = 0; j < matchingTasks.length; j++) {
        features.push(matchingTasks[j]);
      }

      bundledTask = {
        type: "FeatureCollection",
        features,
      };

      const nonMatchingTasks = leftoverTasks.filter((t) => {
        if (t.properties[externalId] !== id) {
          return true;
        }

        return false;
      });

      bundled.push(JSON.stringify(bundledTask));
      leftoverTasks = nonMatchingTasks;
    }

    if (leftoverTasks.length === prevLength) {
      infiniteLoopCount++;

      if (infiniteLoopCount > 10) {
        console.log(
          "There was a problem with your data that caused an infinite loop.  Process stopped",
        );
        break;
      }
    } else {
      infiniteLoopCount = 0;
    }
  }

  return bundled.join("\n");
};

export default bundleByTaskBundleId;

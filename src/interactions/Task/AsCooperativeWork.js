import _compact from "lodash/compact";
import _isEmpty from "lodash/isEmpty";
import _map from "lodash/map";
import { CooperativeType } from "../../services/Challenge/CooperativeType/CooperativeType";

/**
 * AsCooperativeWork adds functionality to a Task related to working
 * cooperatively with OSM changes proposed by the challenge creator
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class AsCooperativeWork {
  constructor(task) {
    Object.assign(this, task);
  }

  /**
   * Determines if this represents a cooperative task
   */
  isCooperative() {
    return this.cooperativeWork !== undefined;
  }

  /**
   * Retrieve the format version of the cooperative work
   */
  cooperativeWorkVersion() {
    return this.cooperativeWork?.meta?.version;
  }

  /*
   * Returns true if this is v1-formatted cooperative work
   */
  isVersion1() {
    return this.cooperativeWorkVersion() === 1;
  }

  /*
   * Returns true if this is v2-formatted cooperative work
   */
  isVersion2() {
    return this.cooperativeWorkVersion() === 2;
  }

  /**
   * Retrieves the type of cooperative work
   */
  workType() {
    // Version 1 didn't have a type and only supported tag fixes
    if (this.isVersion1()) {
      return CooperativeType.tags;
    }

    return this.cooperativeWork?.meta?.type;
  }

  /**
   * Returns true if this is a tag fix type
   */
  isTagType() {
    return this.workType() === CooperativeType.tags;
  }

  /**
   * Returns true if this includes a change file
   */
  isChangeFileType() {
    return this.workType() === CooperativeType.changeFile;
  }

  /**
   * Returns true if the task is a tag fix type with at least one operation
   */
  hasTagOperations() {
    return this.isTagType() && (this.cooperativeWork?.operations?.length ?? 0) > 0;
  }

  /**
   * Returns an array of (existing) referenced OSM elements as objects in the
   * form of {elementType, elementId}
   */
  existingOSMElementIds() {
    if (!this.hasTagOperations()) {
      return [];
    }

    return _compact(
      _map(this.cooperativeWork.operations, (operation) => {
        switch (operation.operationType) {
          case "createElement":
            return null;
          case "modifyElement":
          case "deleteElement":
            return operation?.data?.id;
          default:
            throw new Error(`unrecognized operation type: ${operation.operationType}`);
        }
      }),
    );
  }

  tagDiffs(osmElements) {
    if (!this.hasTagOperations()) {
      return [];
    }

    return _compact(
      _map(this.cooperativeWork.operations, (independentOperation) => {
        if (independentOperation.operationType !== "modifyElement") {
          return null;
        }

        if (!osmElements.has(independentOperation.data.id)) {
          throw new Error(
            `Unable to generate tag diff: OSM data not available for ${independentOperation.data.id}`,
          );
        }

        const diff = {};
        for (const tag of osmElements.get(independentOperation.data.id).tag) {
          diff[tag.k] = {
            name: tag.k,
            value: tag.v,
            newValue: tag.v,
            status: "unchanged",
          };
        }

        for (const dependentOperation of independentOperation.data.operations) {
          switch (dependentOperation.operation) {
            case "setTags":
              for (const [key, value] of Object.entries(dependentOperation.data)) {
                const diffEntry = diff[key];
                if (!diffEntry) {
                  // New tag
                  diff[key] = {
                    name: key,
                    value: null,
                    newValue: value,
                    status: "added",
                  };
                } else if (diffEntry.value !== value) {
                  // Modified tag
                  diffEntry.newValue = value;
                  diffEntry.status = "changed";
                } else {
                  diffEntry.newValue = value;
                  diffEntry.status = "resolved";
                }
              }
              break;
            case "unsetTags":
              for (const key of dependentOperation.data) {
                const diffEntry = diff[key];
                if (diffEntry) {
                  // Delete tag
                  diffEntry.newValue = null;
                  diffEntry.status = "removed";
                } else {
                  diffEntry.newValue = null;
                  diffEntry.status = "resolved";
                }
              }
              break;
            default:
              break;
          }
        }

        return diff;
      }),
    );
  }

  /**
   * Summarizes tag changes for each OSM element in the form of
   * { osmId, osmType, updates, deletes }, taking into account the given tag
   * edits (if any)
   */
  tagChangeSummary(tagEdits = null) {
    if (!this.hasTagOperations()) {
      return [];
    }

    return _compact(
      _map(this.cooperativeWork.operations, (independentOperation) => {
        if (independentOperation.operationType !== "modifyElement") {
          return null;
        }

        const idTokens = independentOperation.data.id.split("/");
        const change = {
          osmType: idTokens[0].toUpperCase(),
          osmId: parseInt(idTokens[1]),
          updates: {},
          deletes: [],
        };

        if (tagEdits) {
          // Work from tag edits instead of dependent operations
          for (const edit of Object.values(tagEdits)) {
            if (edit.status === "added" || edit.status === "changed") {
              change.updates[edit.name] = edit.newValue;
            } else if (edit.status === "removed") {
              change.deletes.push(edit.name);
            }
          }
        } else {
          for (const dependentOperation of independentOperation.data.operations) {
            if (dependentOperation.operation === "setTags") {
              change.updates = Object.assign(change.updates, dependentOperation.data);
            } else if (dependentOperation.operation === "unsetTags") {
              change.deletes = change.deletes.concat(dependentOperation.data);
            }
          }
        }

        if (_isEmpty(change.updates) && _isEmpty(change.deletes)) {
          return null;
        }

        return change;
      }),
    );
  }
}

export default (task) => new AsCooperativeWork(task);

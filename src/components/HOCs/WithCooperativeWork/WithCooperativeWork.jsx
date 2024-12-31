import _find from "lodash/find";
import _isEmpty from "lodash/isEmpty";
import _values from "lodash/values";
import { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import AsCooperativeWork from "../../../interactions/Task/AsCooperativeWork";
import AppErrors from "../../../services/Error/AppErrors";
import { addErrorWithDetails } from "../../../services/Error/Error";
import { fetchOSMElement } from "../../../services/OSM/OSM";
import { fetchCooperativeTagFixChangeset } from "../../../services/Task/Task";

/**
 * Provides WrappedComponent with details of a task's cooperative work, along
 * with accessory data such as the latest OSM versions of elements referenced
 * by the work
 *
 * There are two supported types of cooperative work: tag fixes and change
 * files
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export const WithCooperativeWork = function (WrappedComponent) {
  return class extends Component {
    state = {
      loadingOSMData: false,
      osmElements: null,
      tagDiffs: null,
      hasTagChanges: false,
      loadingChangeset: false,
      xmlChangeset: null,
      tagEdits: null,
    };

    loadOSMElements = async (task) => {
      const fix = AsCooperativeWork(task);
      if (!fix.hasTagOperations()) {
        return;
      }

      this.setState({
        loadingOSMData: true,
        osmElements: null,
        tagDiffs: null,
        tagEdits: null,
        hasTagChanges: false,
      });

      const elementMap = new Map();
      try {
        await Promise.all(
          fix.existingOSMElementIds().map(async (elementId) => {
            const elementJSON = await fetchOSMElement(elementId);
            elementMap.set(elementId, elementJSON);
          }),
        );
      } catch (error) {
        this.props.addErrorWithDetails(
          AppErrors.task.cooperativeFailure,
          error.message || error.defaultMessage,
        );
        this.setState({ loadingOSMData: false });
        return;
      }

      const tagDiffs = fix.tagDiffs(elementMap);
      const hasTagChanges = this.tagsAreChanged(tagDiffs);

      this.setState({ loadingOSMData: false, osmElements: elementMap, tagDiffs, hasTagChanges });
    };

    loadXMLChangeset = async () => {
      if (this.state.xmlChangeset) {
        return;
      }

      this.setState({ loadingChangeset: true });

      const taskFix = AsCooperativeWork(this.props.task);
      const cooperativeWorkSummary = taskFix.tagChangeSummary(this.state.tagEdits);

      if (_isEmpty(cooperativeWorkSummary)) {
        this.setState({ xmlChangeset: "", loadingChangeset: false });
        return;
      }

      return fetchCooperativeTagFixChangeset(cooperativeWorkSummary)
        .then((xml) => {
          this.setState({ xmlChangeset: xml, loadingChangeset: false });
        })
        .catch((error) => {
          console.log(error);
          this.setState({ xmlChangeset: "", loadingChangeset: false });
        });
    };

    setTagEdits = (edits) => {
      if (edits === null) {
        return this.revertTagEdits();
      }

      const hasTagChanges = this.tagsAreChanged([edits]);
      this.setState({ tagEdits: edits, hasTagChanges, xmlChangeset: null });
    };

    revertTagEdits = () => {
      const hasTagChanges = this.tagsAreChanged(this.state.tagDiffs);
      this.setState({ tagEdits: null, hasTagChanges, xmlChangeset: null });
    };

    /**
     * Determines if there are any changes in the given tag diffs
     *
     * @private
     */
    tagsAreChanged = (tagDiffs) => {
      return !!_find(tagDiffs, (diff) => {
        return !!_find(_values(diff), (change) => change.status !== "unchanged");
      });
    };

    componentDidMount() {
      if (this.props.task) {
        this.loadOSMElements(this.props.task);
      }
    }

    componentDidUpdate(prevProps) {
      if (this.props.task?.id !== prevProps?.task?.id) {
        this.loadOSMElements(this.props.task);
      }
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          osmElements={this.state.osmElements}
          tagDiffs={this.state.tagEdits ? [this.state.tagEdits] : this.state.tagDiffs}
          hasTagChanges={this.state.hasTagChanges}
          xmlChangeset={this.state.xmlChangeset}
          tagEdits={this.state.tagEdits}
          setTagEdits={this.setTagEdits}
          revertTagEdits={this.revertTagEdits}
          loadXMLChangeset={this.loadXMLChangeset}
          loadingOSMData={this.state.loadingOSMData}
          loadingChangeset={this.state.loadingChangeset}
        />
      );
    }
  };
};

export const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ addErrorWithDetails }, dispatch);

export default (WrappedComponent) =>
  connect(null, mapDispatchToProps)(WithCooperativeWork(WrappedComponent));

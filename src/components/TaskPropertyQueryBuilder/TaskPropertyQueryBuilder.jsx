import Form from "@rjsf/core";
import _cloneDeep from "lodash/cloneDeep";
import _isEmpty from "lodash/isEmpty";
import { Component, createRef } from "react";
import { FormattedMessage, injectIntl } from "react-intl";
import { TaskPropertySearchTypeString } from "../../services/Task/TaskProperty/TaskProperty";
import { CustomSelectWidget } from "../Custom/RJSFFormFieldAdapter/RJSFFormFieldAdapter";
import messages from "./Messages";
import { ArrayFieldTemplate, jsSchema, uiSchema } from "./TaskPropertiesSchema";
import {
  preparePropertyRulesForForm,
  preparePropertyRulesForSaving,
  validatePropertyRules,
} from "./TaskPropertyRules";
import "./TaskPropertiesSchema.scss";

/**
 * TaskPropertyQueryBuilder allows for assembling a query to filter task properties
 *
 * @author [Kelli Rotstan](https://github.com/krotstan)
 */
export class TaskPropertyQueryBuilder extends Component {
  state = {};

  formRef = createRef();

  clearForm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.clearTaskPropertyQuery();
    this.setState({ formData: {}, errors: null });
  };

  /** Receive updates to the form data, along with any validation errors */
  changeHandler = ({ formData }) => {
    const group = _cloneDeep(formData?.propertyRules?.rootRule);
    this.normalizeGroupLeafDefaults(group);
    this.setState({ formData: { propertyRules: { rootRule: group } }, errors: null });
    if (!!this.props.updateAsChange && group) this.updateAsChange(group);
  };

  /** Receive errors from form validation */
  errorHandler = (e) => {
    console.log(e);
  };

  finish = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const rootGroup = this.state.formData?.propertyRules?.rootRule;
    const binaryRoot = this.groupToBinary(rootGroup);
    const errors = validatePropertyRules(binaryRoot);

    if (errors.length === 0) {
      const preparedData = preparePropertyRulesForSaving(binaryRoot);

      this.setState({ preparedData, errors: null });
      this.props.updateTaskPropertyQuery(preparedData);
    } else {
      this.setState({ errors });
    }
  };

  addNewFilter = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const currentGroup = _cloneDeep(this.state.formData?.propertyRules?.rootRule) || {};
    const newLeaf = { valueType: "string", key: "", operator: "equals", value: [""] };

    const newGroup = {
      condition: (currentGroup.condition || "and").toLowerCase(),
      rules: Array.isArray(currentGroup.rules) ? currentGroup.rules.slice() : [],
    };
    newGroup.rules.push(newLeaf);

    this.setState({ formData: { propertyRules: { rootRule: newGroup } }, errors: null });
    if (!!this.props.updateAsChange) this.updateAsChange(newGroup);
  };

  removeFilter = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const currentGroup = _cloneDeep(this.state.formData?.propertyRules?.rootRule) || {};

    const newGroup = {
      condition: (currentGroup.condition || "and").toLowerCase(),
      rules: Array.isArray(currentGroup.rules) ? currentGroup.rules.slice() : [],
    };

    newGroup.rules.pop();

    this.setState({ formData: { propertyRules: { rootRule: newGroup } }, errors: null });
    if (!!this.props.updateAsChange) this.updateAsChange(newGroup);
  };

  setupFormData = (taskPropertyQuery) => {
    const prepared = preparePropertyRulesForForm(taskPropertyQuery);

    const flattenToRules = (node, target) => {
      if (!node) return;
      if (node.left || node.right) {
        if (node.left) flattenToRules(node.left, target);
        if (node.right) flattenToRules(node.right, target);
      } else if (node.valueType) {
        target.push({
          key: node.key,
          value: node.value,
          valueType: node.valueType,
          operator: node.operator,
          commaSeparate: node.commaSeparate,
        });
      }
    };

    let rootGroup = {};
    if (prepared) {
      const rules = [];
      flattenToRules(prepared, rules);
      rootGroup = {
        condition: (prepared.condition || "and").toLowerCase(),
        rules,
      };
    }

    this.setState({
      formData: {
        propertyRules: {
          rootRule: taskPropertyQuery ? rootGroup : {},
        },
      },
    });
  };

  // Normalize leaf defaults for user-friendly editing
  normalizeGroupLeafDefaults = (group) => {
    if (group && Array.isArray(group.rules)) {
      group.rules.forEach((leaf) => {
        if (leaf && leaf.valueType && leaf.valueType !== "compound rule") {
          leaf.value = leaf.value || [""];
          leaf.operator = leaf.operator || "equals";
        }
      });
    }
  };

  // Convert a flat rule group to the binary compound structure expected by save/validate
  groupToBinary = (grp) => {
    if (!grp || !Array.isArray(grp.rules) || grp.rules.length === 0) return {};
    if (grp.rules.length === 1) return grp.rules[0];
    const condition = (grp.condition || "and").toLowerCase();
    let tree = grp.rules[0];
    for (let i = 1; i < grp.rules.length; i++) {
      tree = {
        valueType: "compound rule",
        condition: condition,
        left: tree,
        right: grp.rules[i],
      };
    }
    return tree;
  };

  // Prepare and push update when editing-as-you-type
  updateAsChange = (group) => {
    const binaryRoot = this.groupToBinary(group);
    const errors = validatePropertyRules(binaryRoot);
    const preparedData = preparePropertyRulesForSaving(binaryRoot);
    this.props.updateTaskPropertyQuery(preparedData, errors);
  };

  // For property rule value text inputs, we want to prevent return key presses from
  // clearing triggering the nearest submit button and clearing the entire form.
  onFormTextInputKeyDown = (e) => {
    const alphaRegex = /[0-9]{1,}/;

    if (e.keyCode === 13 && e.target.type === "text") {
      e.preventDefault();
      e.stopPropagation();

      const inputId = e.target.id;
      const rootId = inputId
        .split("_")
        .filter((item) => {
          if (item !== "value") {
            return !alphaRegex.test(item);
          }
          return false;
        })
        .join("_");

      const inputParentFieldset = document.getElementById(rootId);

      // If event target and parent idx match, the input is used in the challenge edit
      // to enter a new property key, so we should return early instead of attempting to
      // add multiple keys.
      if (inputParentFieldset.id === e.target.id) return;

      const fieldsetArray = Array.from(inputParentFieldset.elements);
      const addButton = fieldsetArray.filter((item) => item.type === "button").pop();

      addButton.click();

      const nextId = inputId.replace(alphaRegex, (match) => {
        const incremented = parseInt(match, 10) + 1;
        return incremented.toString();
      });

      // Focusing the next property value input field is useful to streamline the workflow.
      const nextInput = document.getElementById(nextId);
      nextInput.focus();
    }
  };

  componentDidMount() {
    if (this.props.taskPropertyQuery) {
      this.setupFormData(this.props.taskPropertyQuery);
    }
    if (this.formRef) {
      this.formRef.current.formElement.addEventListener("keydown", this.onFormTextInputKeyDown);
    }
  }

  componentDidUpdate() {
    // Clear form data if filters.taskPropertyQuery has been cleared.
    if (_isEmpty(this.props.taskPropertyQuery) && !_isEmpty(this.state.preparedData)) {
      this.setState({ formData: null, preparedData: null });
    }
  }

  componentWillUnmount() {
    if (this.formRef) {
      this.formRef.current.formElement.removeEventListener("keydown", this.onFormTextInputKeyDown);
    }
  }

  render() {
    const data = this.state.formData || this.props.taskPropertyStyleRules;

    // We have to clear out any values defined if the operator is "exists" or
    // "missing" otherwise the schema for will erroneously show the
    // "comma separate values" checkbox
    if (data?.propertyRules?.rootRule) {
      const clearOutValues = (group) => {
        if (!group || !Array.isArray(group.rules)) return;
        group.rules.forEach((rule) => {
          if (
            rule.operator === TaskPropertySearchTypeString.missing ||
            rule.operator === TaskPropertySearchTypeString.exists
          ) {
            rule.value = undefined;
          }
        });
      };

      clearOutValues(data.propertyRules.rootRule);
    }

    return (
      <div className="task-properties-form mr-w-full mr-pt-4">
        <Form
          ref={this.formRef}
          submitOnEnter={false}
          schema={jsSchema(this.props.intl, this.props.taskPropertyKeys)}
          className="mr-bg-black-15 mr-p-2"
          uiSchema={uiSchema(this.props.intl, this.props.taskPropertyKeys)}
          ArrayFieldTemplate={ArrayFieldTemplate}
          tagType={"taskProperties"}
          widgets={{ SelectWidget: CustomSelectWidget }}
          noHtml5Validate
          showErrorList={false}
          formData={data}
          onChange={this.changeHandler}
          onError={this.errorHandler}
        >
          {this.state.errors && (
            <div className="mr-ml-4 mr-mb-4 mr-text-red-light">
              {this.props.intl.formatMessage(messages[this.state.errors[0]])}
            </div>
          )}
          {!this.props.updateAsChange && (
            <div className="mr-pt-2 mr-pb-4 mr-pl-1">
              <button
                className="mr-button mr-button--green-lighter mr-mr-4"
                onClick={this.clearForm}
              >
                <FormattedMessage {...messages.clearButton} />
              </button>
              <button
                type="submit"
                className="mr-button mr-button--green-lighter"
                onClick={this.finish}
              >
                <FormattedMessage {...messages.searchButton} />
              </button>
            </div>
          )}
        </Form>
      </div>
    );
  }
}

export default injectIntl(TaskPropertyQueryBuilder);

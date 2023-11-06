import React, { Component } from "react";
import Form from "@rjsf/core";
import _isObject from "lodash/isObject";
import _isEmpty from "lodash/isEmpty";
import _omit from "lodash/omit";
import _filter from "lodash/filter";
import _get from "lodash/get";
import _merge from "lodash/merge";
import { FormattedMessage, injectIntl } from "react-intl";
import { Link } from "react-router-dom";
import {
  CustomArrayFieldTemplate,
  CustomFieldTemplate,
  CustomSelectWidget,
  CustomTextWidget,
  ColumnRadioField,
  MarkdownDescriptionField,
  MarkdownEditField,
  LabelWithHelp,
} from "../../../../Custom/RJSFFormFieldAdapter/RJSFFormFieldAdapter";
import KeywordAutosuggestInput from "../../../../KeywordAutosuggestInput/KeywordAutosuggestInput";
import BoundsSelectorModal from "../../../../BoundsSelectorModal/BoundsSelectorModal";
import WithCurrentProject from "../../../HOCs/WithCurrentProject/WithCurrentProject";
import WithChallengeManagement from "../../../HOCs/WithChallengeManagement/WithChallengeManagement";
import WithCurrentUser from "../../../../HOCs/WithCurrentUser/WithCurrentUser";
import WithTallied from "../../../HOCs/WithTallied/WithTallied";
import WithTaskPropertyStyleRules from "../../../HOCs/WithTaskPropertyStyleRules/WithTaskPropertyStyleRules";
import External from "../../../../External/External";
import Modal from "../../../../Modal/Modal";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import jsonLang from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import highlightColors from 'react-syntax-highlighter/dist/esm/styles/hljs/agate'
import {
  ChallengeCategoryKeywords
} from "../../../../../services/Challenge/ChallengeKeywords/ChallengeKeywords";
import AsEditableChallenge from "../../../../../interactions/Challenge/AsEditableChallenge";
import BusySpinner from "../../../../BusySpinner/BusySpinner";
import BulkEditSteps from "./BulkEditSteps";
import { preparePriorityRuleGroupForSaving } from "./PriorityRuleGroup";
import manageMessages from "../../Messages";
import messages from "./Messages";
import "./EditChallenge.scss";

SyntaxHighlighter.registerLanguage('json', jsonLang)

highlightColors.hljs.background="rgba(0, 0, 0, 0.15)"

export class EditChallenges extends Component {
  challengeState = null;

  state = {
    formData: {},
    formContext: {},
    extraErrors: {},
    isSaving: false,
    expandedFieldGroups: {},
    challengeNumberSaving: 0,
    confirmModal: false,
  };

  validationPromise = null;
  isFinishing = false;

  componentDidMount() {
    this.challengeState = this.props.history.location.state;
    window.scrollTo(0, 0);

    if (this.props.project?.id) {
      const tallied = this.props.user?.properties?.mr3Frontend?.settings?.tallied?.[(this.props.project?.id)];

      if (!tallied || !tallied.length) {
        this.props.history.push(`/admin/project/${this.props.project?.id}`)
      }
    } else {
      this.props.history.push(`/admin/projects`)
    }
  }

  /** Complete the workflow, saving the challenge data */
  handleSubmit = async () => {
    window.scrollTo(0, 0);
    this.setState({ isSaving: true });

    this.prepareFormDataForSaving().then(async (formData) => {
      const tallied = this.props.user?.properties?.mr3Frontend?.settings?.tallied?.[(this.props.project.id)];
      const challengesEditing = this.props.challenges.filter(c => tallied.includes(c.id));

      for (let i = 0; i < challengesEditing.length; i++) {
        const result = await this.props.saveChallenge({
          id: challengesEditing[i].id,
          changesetUrl: challengesEditing[i].changesetUrl,
          tags: formData.tags,
          preferredTags: formData.preferredTags,
          exportableProperties: formData.exportableProperties,
          customBasemap: formData.customBasemap,
          instruction: formData.instruction,
          defaultBasemap: formData.defaultBasemap,
          defaultBasemapId: formData.defaultBasemapId,
          defaultPriority: formData.defaultPriority,
          dataOriginDate: formData.dataOriginDate,
          highPriorityRule: formData.highPriorityRule === "{}" ? undefined : formData.highPriorityRule,
          mediumPriorityRule: formData.mediumPriorityRule === "{}" ? undefined : formData.mediumPriorityRule,
          lowPriorityRule: formData.lowPriorityRule === "{}" ? undefined : formData.lowPriorityRule
        });

        if (result?.id) {
          this.setState({ challengeNumberSaving: this.state.challengeNumberSaving + 1 });
        } else {
          break;
        }
      }

      this.setState({ challengeNumberSaving: 0, isSaving: false });
      return this.props.history.push(`admin/project/${this.props.project.id}`)
    });
  };

  /**
   * Perform additional validation, including async validation that will set
   * the extraErrors state field to a value as needed
   */
  validate = (formData, errors) => {
    return errors;
  };

  transformErrors = (intl) => (errors) => {
    return errors.map(error => {
      if (error.name === "required") {
        error.message = intl.formatMessage(messages.requiredErrorLabel);
      }
      return error;
    });
  }

  /** Cancel editing */
  cancel = () => {
    this.props.history.push(`/admin/project/${this.props.project.id}`);
  };

  /** Receive updates to the form data, along with any validation errors */
  changeHandler = ({ formData }) => {
    this.setState({ formData });
  };

  /**
   * Prepare challenge data for react-jsonschema-form, including merging
   * existing data with the latest changes made by the user, and massaging
   * certain fields into an alternative format for more intuitive editing.
   *
   * @private
   */
  prepareChallengeDataForForm = () => {
    let challengeData = Object.assign(
      { parent: _get(this.props, "project.id") },
      _omit(this.props.challenge, ["activity", "comments"]),
      this.state.formData
    );

    return challengeData;
  };

  toggleConfirmModal = (bool) => {
    if (bool) {
      this.prepareFormDataForSaving().then(async (formData) => {
        this.setState({ confirmModal: formData })
      })
    } else {
      this.setState({ confirmModal: false })
    }
  }

  /**
   * Performs the reverse of prepareChallengeDataForForm, taking the form data
   * and massaging it back into the format of challenge data expected by the
   * server.
   */
  prepareFormDataForSaving = async () => {
    const challengeData = AsEditableChallenge(
      Object.assign(
        this.prepareChallengeDataForForm(this.props.challenge),
        this.state.formData
      )
    );

    challengeData.normalizeDefaultBasemap();

    challengeData.highPriorityRule = preparePriorityRuleGroupForSaving(
      challengeData.highPriorityRules.ruleGroup
    );
    delete challengeData.highPriorityRules;

    challengeData.mediumPriorityRule = preparePriorityRuleGroupForSaving(
      challengeData.mediumPriorityRules.ruleGroup
    );
    delete challengeData.mediumPriorityRules;

    challengeData.lowPriorityRule = preparePriorityRuleGroupForSaving(
      challengeData.lowPriorityRules.ruleGroup
    );
    delete challengeData.lowPriorityRules;

    challengeData.tags =
      ChallengeCategoryKeywords[challengeData.category] ||
      ChallengeCategoryKeywords.other;

    if (!_isEmpty(challengeData.additionalKeywords)) {
      challengeData.tags = challengeData.tags.concat(
        // split on comma, and filter out any empty-string keywords
        _filter(
          challengeData.additionalKeywords.split(/,+/),
          (keyword) => !_isEmpty(keyword)
        )
      );
    }

    if (!_isEmpty(challengeData.taskTags)) {
      // replace whitespace with commas, split on comma, and filter out any
      // empty-string tags.
      challengeData.preferredTags = _filter(
        challengeData.taskTags.split(/,+/),
        (tag) => !_isEmpty(tag)
      );
    }

    return challengeData;
  };

  render() {
    const tallied = this.props.user?.properties?.mr3Frontend?.settings?.tallied?.[(this.props.project?.id)];

    if (
      !this.props.project ||
      this.state.isSaving
    ) {
      return (
        <div className="pane-loading full-screen-height mr-flex mr-justify-center mr-items-center">
          {this.state.challengeNumberSaving ? `Saving ${this.state.challengeNumberSaving} of ${tallied?.length}` : ""}
          <BusySpinner big />
        </div>
      );
    }

    const challengeData = this.prepareChallengeDataForForm();

    return (
      <BulkEditSteps
        {...this.props}
        isNewChallenge={false}
        finish={this.finish}
        isLongForm={true}
        renderStep={({
          activeStep,
          nextStep,
        }) => {

          // Override the standard form-field description renderer with our own that
          // supports Markdown. We pass this in to the `fields` prop on the Form.
          const customFields = {
            DescriptionField: MarkdownDescriptionField,
            markdown: MarkdownEditField,
            columnRadio: ColumnRadioField,
            tags: (props) => {
              return (
                <React.Fragment>
                  <LabelWithHelp {...props} />
                  <KeywordAutosuggestInput
                    {...props}
                    inputClassName="mr-p-2 mr-border-2 mr-border-grey-light-more mr-text-grey mr-rounded"
                    dropdownInnerClassName="mr-bg-blue-darker"
                  />
                </React.Fragment>
              );
            },
            taskTags: injectIntl((props) => {
              return (
                <React.Fragment>
                  <LabelWithHelp {...props} />
                  <KeywordAutosuggestInput
                    {...props}
                    inputClassName="mr-p-2 mr-border-2 mr-border-grey-light-more mr-text-grey mr-rounded"
                    dropdownInnerClassName="mr-bg-blue-darker"
                    placeholder={props.intl.formatMessage(
                      messages.addMRTagsPlaceholder
                    )}
                    tagType={props.uiSchema.tagType}
                  />
                </React.Fragment>
              );
            }),
            limitTags: injectIntl((props) => {
              return (
                <React.Fragment>
                  <div className="mr-mb-2">{props.uiSchema["ui:help"]}</div>
                  <div className="radio">
                    <input
                      type="radio"
                      name={props.name + "yes"}
                      className="mr-mr-1.5"
                      checked={!props.formData}
                      onChange={() => props.onChange(false)}
                    />
                    <label className="mr-mr-2 mr-text-grey-lighter">
                      <FormattedMessage {...messages.yesLabel} />
                    </label>
                  </div>
                  <div className="radio">
                    <input
                      type="radio"
                      name={props.name + "no"}
                      className="mr-mr-1.5"
                      checked={!!props.formData}
                      onChange={() => {
                        props.onChange(true);
                      }}
                    />
                    <label className="mr-text-grey-lighter">
                      <FormattedMessage {...messages.noLabel} />
                    </label>
                  </div>
                </React.Fragment>
              );
            })
          };

          return (
            <>
              <BreadcrumbWrapper
                {...this.props}
                cancel={this.cancel}
                isCloningChallenge={false}
                isNewChallenge={false}
                challengeState={this.challengeState}
              >
                <div className="mr-flex">
                  <div className="mr-p-4 md:mr-p-8 mr-w-full">
                    <Form
                      schema={activeStep.jsSchema(
                        this.props.intl,
                        this.props.user,
                        challengeData,
                        this.state.extraErrors,
                        {
                          longForm: true,
                        }
                      )}
                      uiSchema={activeStep.uiSchema(
                        this.props.intl,
                        this.props.user,
                        challengeData,
                        this.state.extraErrors,
                        {
                          longForm: true,
                        }
                      )}
                      className="form"
                      validate={(formData, errors) =>
                        this.validate(formData, errors, activeStep)
                      }
                      transformErrors={this.transformErrors(this.props.intl)}
                      widgets={{
                        SelectWidget: CustomSelectWidget,
                        TextWidget: CustomTextWidget,
                      }}
                      ArrayFieldTemplate={CustomArrayFieldTemplate}
                      FieldTemplate={CustomFieldTemplate}
                      fields={customFields}
                      tagType={"challenges"}
                      noHtml5Validate
                      showErrorList={false}
                      formData={challengeData}
                      formContext={_merge(this.state.formContext, {
                        bounding: _get(challengeData, "bounding"),
                        buttonAction: BoundsSelectorModal,
                      })}
                      onChange={this.changeHandler}
                      onSubmit={(formData) => {
                        this.toggleConfirmModal(formData)
                      }}
                      onError={() => null}
                      extraErrors={this.state.extraErrors}
                    >
                    </Form>
                  </div>
                </div>
              </BreadcrumbWrapper>
              {
                this.state.confirmModal
                  ? <ConfirmationModal
                      formData={this.state.confirmModal}
                      submit={() => {
                        this.toggleConfirmModal(false)
                        this.handleSubmit(formData, nextStep)}
                      }
                      cancel={() => {
                        this.toggleConfirmModal(false)
                      }}
                    />
                  : null
              }
            </>
          );
        }}
      />
    );
  }
}

const BreadcrumbWrapper = (props) => {
  const tallied = props.user?.properties?.mr3Frontend?.settings?.tallied?.[(props.project.id)];
  const challengesEditing = props.challenges.filter(c => tallied.includes(c.id));

  const renderChallengeButtons = () => {
    return challengesEditing.map(c => {
      return (
        <div className="mr-border-green-lighter mr-border-2 mr-text-green-lighter mr-mr-4 mr-mb-4 mr-py-1 mr-px-2 mr-rounded" key={c.id}>{c.name}{" "}
          {challengesEditing.length > 1 ? <span className="mr-pl-2 mr-text-white hover:mr-text-red mr-cursor-pointer" onClick={() => props.toggleChallengeTally(props.project.id, c.id)}>X</span> : null}
        </div>
      )
    })
  }

  return (
    <div className="admin__manage edit-challenge">
      <div className="admin__manage__pane-wrapper">
        <div className="admin__manage__primary-content">
          <div className="admin__manage__header">
            <nav
              className="breadcrumb mr-w-full mr-flex mr-flex-wrap mr-justify-between"
              aria-label="breadcrumbs"
            >
              <ul>
                <li className="nav-title">
                  <Link to={"/admin/projects"}>
                    <FormattedMessage {...manageMessages.manageHeader} />
                  </Link>
                </li>
                <li>
                  <Link to={`/admin/project/${props.project.id}`}>
                    {props.project.displayName || props.project.name}
                  </Link>
                </li>
                {_isObject(props.challenge) && (
                  <li>
                    <Link
                      to={{
                        pathname: `/admin/project/${props.project.id}/challenge/${props.challenge.id}`,
                        state: props.challengeState,
                      }}
                    >
                      {props.challenge.name}
                    </Link>
                  </li>
                )}
                <li className="is-active">
                  <a aria-current="page">
                    <FormattedMessage {...messages.editChallenges} />
                  </a>
                  {props.loadingChallenge && <BusySpinner inline />}
                </li>
              </ul>
              <button
                type="button"
                className="mr-button mr-button--white mr-button--small"
                onClick={() => props.cancel()}
              >
                <FormattedMessage {...messages.cancelChallenges} />
              </button>
            </nav>
          </div>

          <div className="mr-flex mr-flex-wrap">
            {renderChallengeButtons()}
          </div>

          <div className="mr-max-w-3xl mr-mx-auto mr-bg-blue-dark mr-mt-8 mr-rounded">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
};

const confirmationMap = () => {
  return [
    {
      id: 'additionalKeywords',
      displayName: <FormattedMessage {...messages.additionalKeywordsLabel} />
    },
    {
      id: 'taskTags',
      displayName: <FormattedMessage {...messages.preferredTagsLabel} />
    },
    {
      id: 'exportableProperties',
      displayName: <FormattedMessage {...messages.exportablePropertiesLabel} />
    },
    {
      id: 'customBasemap',
      displayName: <FormattedMessage {...messages.customBasemapLabel} />
    },
    {
      id: 'instruction',
      displayName: <FormattedMessage {...messages.instructionLabel} />,
      props: {
        wrapLines: true,
        lineProps: { style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap'} }
      }
    },
    {
      id: 'defaultBasemapId',
      displayName: <FormattedMessage {...messages.defaultBasemapLabel} />,
    },
    {
      id: 'defaultPriority',
      displayName: <FormattedMessage {...messages.defaultPriorityLabel} />,
    },
    {
      id: 'dataOriginDate',
      displayName: <FormattedMessage {...messages.dataOriginDateLabel} />,
    },
    {
      id: 'highPriorityRule',
      default: "{}",
      json: true,
      displayName: <FormattedMessage {...messages.highPriorityRulesLabel} />,
    },
    {
      id: 'mediumPriorityRule',
      default: "{}",
      json: true,
      displayName: <FormattedMessage {...messages.mediumPriorityRulesLabel} />,
    },
    {
      id: 'lowPriorityRule',
      default: "{}",
      json: true,
      displayName: <FormattedMessage {...messages.lowPriorityRulesLabel} />,
    }
  ]
}

class ConfirmationModal extends Component {
  render() {
    const { formData } = this.props
    return (
      <External>
        <Modal
          fullScreen
          isActive={true}
          onClose={this.props.onClose}
        >
          <h1 style={{ marginBottom: 10 }}><FormattedMessage {...messages.reviewAndSubmitLabel} /></h1>
          <div className="mr-text-red mr-text-lg" style={{ marginBottom: 14 }}><FormattedMessage {...messages.bulkEditWarningLabel} /></div>
          {confirmationMap().map((data) => {
            if (formData[data.id] && formData[data.id] !== data.default) {
              const val = data.json ? JSON.parse(formData[data.id]) : formData[data.id]
              return (
                <div key={data.id} style={{ marginBottom: 10 }}>
                  <div>{data.displayName || data.id}</div>
                  <SyntaxHighlighter language="json" style={{ ...highlightColors }} {...data.props}>
                    {JSON.stringify(val, null, 4)}
                  </SyntaxHighlighter>
                </div>
              )
            }
          })}
          <button
            type="button"
            className="mr-button mr-button--white mr-button--small mr-mr-8 mr-text-red mr-border-red"
            onClick={() => this.props.submit()}
          >
            <FormattedMessage {...messages.submitChallenges} />
          </button>
          <button
            type="button"
            className="mr-button mr-button--white mr-button--small"
            onClick={() => this.props.cancel()}
          >
            <FormattedMessage {...messages.cancelChallenges} />
          </button>
        </Modal>
      </External>
    )
  }
}

export default WithCurrentUser(
  WithCurrentProject(
    (WithTaskPropertyStyleRules(
      WithChallengeManagement(WithTallied(injectIntl(EditChallenges))))
    ),
    { includeChallenges: true }
  )
);

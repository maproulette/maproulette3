import React, { Component } from 'react'
import Form from '@rjsf/core'
import classNames from 'classnames'
import _isObject from 'lodash/isObject'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'
import _isFinite from 'lodash/isFinite'
import _omit from 'lodash/omit'
import _filter from 'lodash/filter'
import _difference from 'lodash/difference'
import _get from 'lodash/get'
import _remove from 'lodash/remove'
import _isEqual from 'lodash/isEqual'
import _merge from 'lodash/merge'
import _map from 'lodash/map'
import _without from 'lodash/without'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import External from '../../../../External/External'
import Modal from '../../../../Modal/Modal'
import AsLineReadableFile
       from '../../../../../interactions/File/AsLineReadableFile'
import StepNavigation
       from '../../StepNavigation/StepNavigation'
import { CustomArrayFieldTemplate,
         CustomFieldTemplate,
         CustomSelectWidget,
         CustomTextWidget,
         ColumnRadioField,
         MarkdownDescriptionField,
         MarkdownEditField,
         LabelWithHelp }
       from '../../../../Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import KeywordAutosuggestInput
       from '../../../../KeywordAutosuggestInput/KeywordAutosuggestInput'
import BoundsSelectorModal
       from '../../../../BoundsSelectorModal/BoundsSelectorModal'
import WithCurrentProject
       from '../../../HOCs/WithCurrentProject/WithCurrentProject'
import WithCurrentChallenge
       from '../../../HOCs/WithCurrentChallenge/WithCurrentChallenge'
import WithCurrentUser
       from '../../../../HOCs/WithCurrentUser/WithCurrentUser'
import WithTaskPropertyStyleRules
      from '../../../HOCs/WithTaskPropertyStyleRules/WithTaskPropertyStyleRules'
import { EMPTY_STYLE_RULE }
      from '../../../HOCs/WithTaskPropertyStyleRules/WithTaskPropertyStyleRules'
import { ChallengeCategoryKeywords,
         categoryMatchingKeywords,
         rawCategoryKeywords }
       from '../../../../../services/Challenge/ChallengeKeywords/ChallengeKeywords'
import { basemapLayerSources }
       from '../../../../../services/Challenge/ChallengeBasemap/ChallengeBasemap'
import AsEditableChallenge
       from '../../../../../interactions/Challenge/AsEditableChallenge'
import AsValidatableGeoJSON
       from '../../../../../interactions/GeoJSON/AsValidatableGeoJSON'
import AsValidatableOverpass
       from '../../../../../interactions/Overpass/AsValidatableOverpass'
import TaskUploadingProgress
       from '../../TaskUploadingProgress/TaskUploadingProgress'
import SvgSymbol from '../../../../SvgSymbol/SvgSymbol'
import BusySpinner from '../../../../BusySpinner/BusySpinner'
import TaskPropertyStyleRules
       from '../../TaskPropertyStyleRules/TaskPropertyStyleRules'
import { preparePriorityRuleGroupForForm,
         preparePriorityRuleGroupForSaving } from './PriorityRuleGroup'
import WorkflowSteps from './WorkflowSteps'
import manageMessages from '../../Messages'
import messages from './Messages'
import './EditChallenge.scss'

/**
 * EditChallenge manages a simple workflow for creating/editing a Challenge. We
 * make use of json-schema standard schemas that define the fields and basic
 * validation requirements for each step in the workflow, and the
 * react-jsonschema-forms library to render the forms from the schemas. We
 * utilize our own field adapter to massage the form markup and class names
 * into something that is roughly Bulma-compliant.
 *
 * Additionally, we make use of a form context object that is passed to each
 * field where fields can mark the form as invalid if they are given any errors
 * by react-jsonschema-forms. This is a bit of a hack as RJSF does not provide
 * the form-level onError handler with the initial set of validation errors
 * (e.g. when a required field is blank), and we don't want to allow users to
 * proceed through the workflow if the current form is not in a valid state.
 *
 * @see See http://json-schema.org/
 * @see See https://github.com/mozilla-services/react-jsonschema-form
 * @see See RJSFFormFieldAdapter
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
export class EditChallenge extends Component {
  state = {
    formData: {},
    formContext: {},
    extraErrors: {},
    isSaving: false,
  }

  validationPromise = null
  isFinishing = false

  componentDidMount() {
    window.scrollTo(0, 0)
  }

  /**
   * Returns true if this challenge's data is being cloned from another
   * challenge.
   */
  isCloningChallenge = () =>
    !!_get(this.props, 'location.state.cloneChallenge')

  /**
   * Returns true if all challenge fields should be displayed as a single,
   * long-form step based on the current user's preferences
   */
  isLongForm = () =>
    !!this.props.getUserAppSetting(this.props.user, 'longFormChallenge')

  /**
   * Update the current user's preferences as to whether all challenge fields
   * should be displayed as a single, long-form step. This will cause this
   * component to re-render with the updated settings
   */
  setIsLongForm = isLongForm => this.props.updateUserAppSetting(
    this.props.user.id,
    {longFormChallenge: isLongForm}
  )

  /**
   * Returns the list of challenge form groups that are to be rendered as
   * collapsed when in longform mode (does not affect stepped mode)
   */
  collapsedFormGroups = () =>
    this.props.getUserAppSetting(this.props.user, 'collapsedChallengeFormGroups') || []

  /**
   * Update the current user's preferences as to which challenge form groups
   * are expanded and collapsed when displayed in longform mode (does not
   * affect stepped mode)
   */
  toggleCollapsedFormGroup = groupId => {
    const collapsed = this.collapsedFormGroups()
    const updated =
      collapsed.indexOf(groupId) === -1 ?
      collapsed.concat([groupId]) :
      _without(collapsed, groupId)

    this.props.updateUserAppSetting(this.props.user.id, {
      collapsedChallengeFormGroups: updated,
    })
  }

  /**
   * Validate GeoJSON data
   */
  async validateGeoJSON(jsonFileField) {
    let response = {}

    const geoJSON = AsValidatableGeoJSON(jsonFileField.file)
    const lintErrors = await geoJSON.validate()

    if (lintErrors.length === 0) {
      jsonFileField.validated = true
    }
    else {
      response.errors = {
        localGeoJSON: {
          __errors: _map(lintErrors, e =>
            _isObject(e.message) ? this.props.intl.formatMessage(e.message) : `GeoJSON error: ${e.message}`
          )
        }
      }
    }

    return response
  }

  /**
   * Validate Overpass query
   */
  validateOverpass(query) {
    let response = {}

    const lintErrors = AsValidatableOverpass(query).validate()

    if (lintErrors.length > 0) {
      response.errors = {
        overpassQL: {__errors: [this.props.intl.formatMessage(lintErrors[0].message)]}
      }
    }

    return response
  }

  /**
   * Perform additional validation, including async validation that will set
   * the extraErrors state field to a value as needed
   */
  validate = (formData, errors, activeStep) => {
    this.validationPromise = this.validateDataSource(formData, activeStep)
    this.validationPromise.then(() => {
      if (!_isEmpty(this.state.extraErrors)) {
        this.setState({extraErrors: {}})
      }
    }).catch(dataSourceErrors => {
      this.setState({extraErrors: dataSourceErrors})
    }).finally(() => {
      this.validationPromise = null
    })

    return errors
  }

  /**
   * Perform additional validation checks beyond schema validation. Primarily
   * we check Overpass queries and GeoJSON
   */
  validateDataSource = async (formData, activeStep) => {
    let response = {}

    // Skip additional source data validation if user has indicated they wish
    // to ignore source errors
    if (formData.ignoreSourceErrors || activeStep.id !== "DataSource") {
      return response
    }

    if (formData.source === "Overpass Query") {
      response = this.validateOverpass(formData.overpassQL)
    }

    if (formData.source === "Local File" &&
        !_isEmpty(formData.localGeoJSON) &&
        !this.state.formContext["root_localGeoJSON"].validated) {
      response = await this.validateGeoJSON(this.state.formContext["root_localGeoJSON"])
    }

    if (response.errors) {
      throw response.errors
    }

    return response
  }

  /**
   * Process submit event at each step, waiting until any pending validation is
   * complete before deciding how to proceed
   */
  handleSubmit = (formData, nextStep) => {
    (this.validationPromise || Promise.resolve()).then(() => {
      this.isFinishing ? this.finish() : nextStep()
      window.scrollTo(0, 0)
      return false
    }).catch(err => {
      console.log(err)
    }) // Stay on current step if validation fails

    return false
  }

  /** Complete the workflow, saving the challenge data */
  finish = () => {
    // We cannot continue if the style rules have errors.
    if (this.hasTaskStyleRuleErrors()) {
      return
    }

    window.scrollTo(0, 0)
    this.setState({isSaving: true})

    this.prepareFormDataForSaving().then(formData => {
      return this.props.saveChallenge(formData).then(challenge => {
        if (_isObject(challenge) && _isNumber(challenge.parent)) {
          this.props.history.push(
            `/admin/project/${challenge.parent}/challenge/${challenge.id}`)
        }
        else {
          this.finishing = false
          this.setState({isSaving: false})
        }
      })
    })
  }

  /** Cancel editing */
  cancel = () => {
    _isObject(this.props.challenge) ?
      this.props.history.push(
        `/admin/project/${this.props.project.id}/challenge/${this.props.challenge.id}`) :
      this.props.history.push(`/admin/project/${this.props.project.id}`)
  }

  /** Receive updates to the form data, along with any validation errors */
  changeHandler = ({formData}) => {
    this.setState({formData})
  }

  /** Receive errors from form validation */
  errorHandler = (errors, err, formData) => {
    if ((errors && errors.length > 0) ||
        (err && err.length > 0)) {
      window.scrollTo(0, 100)
    }
  }

  /**
   * Prepare challenge data for react-jsonschema-form, including merging
   * existing data with the latest changes made by the user, and massaging
   * certain fields into an alternative format for more intuitive editing.
   *
   * @private
   */
  prepareChallengeDataForForm = () => {
    let challengeData = Object.assign(
      {parent: _get(this.props, 'project.id')},
      _omit(this.props.challenge, ['activity', 'comments']),
      this.state.formData
    )

    // If we're cloning a challenge, reset the id, status, and name, and remove
    // #maproulette hashtag from changeset comment as its presence will be
    // controlled by an explicit option offered to user during setup
    if (this.isCloningChallenge()) {
      delete challengeData.id
      delete challengeData.status
      delete challengeData.virtualParents

      if (_isEmpty(this.state.formData.name)) {
        delete challengeData.name
      }

      if (_isEmpty(this.state.formData.dataOriginDate)) {
        delete challengeData.dataOriginDate
      }

      if (_isEmpty(this.state.formData.overpassQL)) {
        delete challengeData.overpassQL
      }

      if (_isEmpty(this.state.formData.remoteGeoJson)) {
        delete challengeData.remoteGeoJson
      }

      challengeData.checkinComment =
        AsEditableChallenge(challengeData).checkinCommentWithoutMaprouletteHashtag()
    }

    if (this.state.formData.source === "Overpass Query") {
      // Overpass Query so delete other options
      delete challengeData.remoteGeoJson
      delete challengeData.localGeoJSON
    }
    else if (this.state.formData.source === "Local File") {
      // Local file so delete other options
      delete challengeData.remoteGeoJson
      delete challengeData.overpassQL
    }
    else if (this.state.formData.source === "Remote URL") {
      // Remote Url so delete other options
      delete challengeData.overpassQL
      delete challengeData.localGeoJSON
    }

    // The server uses two fields to represent the default basemap: a legacy
    // numeric identifier and a new optional string identifier for layers from
    // the OSM Editor Layer Index. If we're editing a legacy challenge that
    // doesn't use the layer index string identifiers, then we convert the
    // numeric id to an appropriate string identifier here (assuming it is
    // specifying a default layer at all).
    if (_isUndefined(this.state.formData.defaultBasemap)) {
      if (!_isEmpty(challengeData.defaultBasemapId)) { // layer index string
        challengeData.defaultBasemap = challengeData.defaultBasemapId
      }
      else if (_isFinite(challengeData.defaultBasemap)) { // numeric identifier
        // Convert to corresponding layer-index string identifier for form if
        // possible. Otherwise just go with string representation of numerical
        // id, which is still used to represent things like a custom basemap
        // indicator (this is a bit of a hack to support everything in a single
        // form field)
        challengeData.defaultBasemap =
          basemapLayerSources()[challengeData.defaultBasemap] ||
          challengeData.defaultBasemap.toString()
      }
    }

    if (!this.state.formData.highPriorityRules) {
      challengeData.highPriorityRules =
        preparePriorityRuleGroupForForm(challengeData.highPriorityRule)
    }

    if (!this.state.formData.mediumPriorityRules) {
      challengeData.mediumPriorityRules =
        preparePriorityRuleGroupForForm(challengeData.mediumPriorityRule)
    }

    if (!this.state.formData.lowPriorityRules) {
      challengeData.lowPriorityRules =
        preparePriorityRuleGroupForForm(challengeData.lowPriorityRule)
    }

    // Since we represent the challenge category as just another keyword behind
    // the scenes, we need to separate the category keyword and the rest of
    // the keywords so that they're all presented properly in the form. First,
    // though, strip out any empty tags.
    const keywords = _filter(challengeData.tags, tag => !_isEmpty(tag))

    // Only setup if not yet modified on the form
    if (!_isString(this.state.formData.category)) {
      challengeData.category = categoryMatchingKeywords(keywords)
    }

    // Only setup if not yet modified on the form
    if (!_isString(this.state.formData.additionalKeywords)) {
      challengeData.additionalKeywords =
        _difference(keywords, rawCategoryKeywords).join(',')
    }

    challengeData.taskTags =
      _isString(challengeData.taskTags) ?
      challengeData.taskTags :
      challengeData.preferredTags

    challengeData.reviewTaskTags =
      _isString(challengeData.reviewTaskTags) ?
      challengeData.reviewTaskTags :
      challengeData.preferredReviewTags

    if (_isUndefined(challengeData.customTaskStyles)) {
      challengeData.customTaskStyles = !_isEmpty(challengeData.taskStyles)
    }

    return challengeData
  }

  /**
   * Performs the reverse of prepareChallengeDataForForm, taking the form data
   * and massaging it back into the format of challenge data expected by the
   * server.
   */
  prepareFormDataForSaving = async () => {
    const challengeData = AsEditableChallenge(Object.assign(
      this.prepareChallengeDataForForm(this.props.challenge),
      this.state.formData,
    ))

    // Remove extraneous fields that should not be saved.
    delete challengeData.actions
    delete challengeData.ignoreSourceErrors

    if (this.props.challenge && challengeData.dataOriginDate) {
      // Don't update dataOriginDate if it hasn't changed (otherwise it's timezone could change)
      if (this.props.challenge.dataOriginDate === challengeData.dataOriginDate) {
        delete challengeData.dataOriginDate
      }
    }

    // Parent field should just be id, not object.
    if (_isObject(challengeData.parent)) {
      challengeData.parent = challengeData.parent.id
    }

    // For new challenges, append the #maproulette hashtag to the changeset comment
    // if user allows it.
    if (challengeData.isNew() && challengeData.includeCheckinHashtag) {
      challengeData.appendHashtagToCheckinComment()
    }

    challengeData.normalizeDefaultBasemap()

    challengeData.highPriorityRule =
      preparePriorityRuleGroupForSaving(challengeData.highPriorityRules.ruleGroup)
    delete challengeData.highPriorityRules

    challengeData.mediumPriorityRule =
      preparePriorityRuleGroupForSaving(challengeData.mediumPriorityRules.ruleGroup)
    delete challengeData.mediumPriorityRules

    challengeData.lowPriorityRule =
      preparePriorityRuleGroupForSaving(challengeData.lowPriorityRules.ruleGroup)
    delete challengeData.lowPriorityRules

    challengeData.tags = ChallengeCategoryKeywords[challengeData.category] ||
                         ChallengeCategoryKeywords.other

    if (!_isEmpty(challengeData.additionalKeywords)) {
      challengeData.tags = challengeData.tags.concat(
        // split on comma, and filter out any empty-string keywords
        _filter(
          challengeData.additionalKeywords.split(/,+/),
          keyword => !_isEmpty(keyword)
        )
      )
    }

    if (!_isEmpty(challengeData.taskTags)) {
      // replace whitespace with commas, split on comma, and filter out any
      // empty-string tags.
      challengeData.preferredTags =
        _filter(challengeData.taskTags.split(/,+/), tag => !_isEmpty(tag))
    }

    if (!_isEmpty(challengeData.reviewTaskTags)) {
      // replace whitespace with commas, split on comma, and filter out any
      // empty-string tags.
      challengeData.preferredReviewTags =
        _filter(challengeData.reviewTaskTags.split(/,+/), tag => !_isEmpty(tag))
    }

    // Note any old tags that are to be discarded. Right now a separate API
    // request will be needed to remove undesired tags.
    challengeData.removedTags =
      _difference(_get(this.props, 'challenge.tags', []),
                  challengeData.tags)

    // We don't allow task source data to be modified for existing challenges
    // once it has been provided.
    if (challengeData.isSourceReadOnly()) {
      challengeData.clearSources()
    }
    else {
      // Line-by-line geojson needs to be submitted separately as it cannot be
      // embedded as valid JSON. Move it to a different field for later
      // processing.
      if (challengeData.source === "Local File" &&
          challengeData.localGeoJSON) {
        const geoJSONFile = this.state.formContext["root_localGeoJSON"].file
        if (!geoJSONFile) {
          throw new Error("No geojson file")
        }

        if (await AsValidatableGeoJSON(geoJSONFile).isLineByLine()) {
          challengeData.lineByLineGeoJSON = geoJSONFile
          delete challengeData.localGeoJSON
        }
        else {
          challengeData.localGeoJSON =
            (await AsLineReadableFile(geoJSONFile).allLines()).join('\n')
        }
      }
      else {
        // It's possible someone could have uploaded a file and then changed
        // there source type so let's remove localGeoJSON if it's not local.
        delete challengeData.localGeoJSON
      }
    }

    if (challengeData.customTaskStyles) {
      const styleRules = this.props.taskPropertyStyleRules
      // Remove all empty style rules
      _remove(styleRules, (rule) => (_isEmpty(rule) || _isEqual(rule, {}) ||
        _isEqual(rule, EMPTY_STYLE_RULE) ||
        (!rule.propertySearch.key && !rule.propertySearch.value &&
         !rule.propertySearch.left && !rule.propertySearch.right)
      ))
      challengeData.taskStyles = styleRules
    }
    else {
      challengeData.taskStyles = []
    }

    return challengeData
  }

  hasTaskStyleRuleErrors = () => {
    const useCustom = !_isUndefined(_get(this.state.formData, 'customTaskStyles')) ?
      _get(this.state.formData, 'customTaskStyles') :
     !_isEmpty(_get(this.props.challenge, 'taskStyles'))

    return useCustom && this.props.hasAnyStyleRuleErrors
  }

  render() {
    const isUploadingTasks = _get(this.props, 'progress.creatingTasks.inProgress', false)
    if (isUploadingTasks) {
      return <TaskUploadingProgress {...this.props} />
    }

    if (!this.props.project || this.props.loadingChallenge || this.state.isSaving) {
      return (
        <div className="pane-loading full-screen-height mr-flex mr-justify-center mr-items-center">
          <BusySpinner big />
        </div>
      )
    }

    const challengeData = this.prepareChallengeDataForForm()
    const isNewChallenge = AsEditableChallenge(challengeData).isNew()
    return <WorkflowSteps
      {...this.props}
      isNewChallenge={isNewChallenge}
      finish={this.finish}
      isLongForm={this.isLongForm()}
      renderStep={({
        challengeSteps,
        activeStep,
        StepComponent,
        prevStep,
        nextStep,
        transitionToStep,
      }) => {
        if (StepComponent) {
          return (
            <BreadcrumbWrapper
              {...this.props}
              cancel={this.cancel}
              isCloningChallenge={this.isCloningChallenge}
              isNewChallenge={isNewChallenge}
            >
              <div className="mr-flex">
                <div className="mr-w-54 mr-flex mr-flex-col mr-items-center mr-bg-blue-darker mr-rounded-l mr-pt-8">
                  {activeStep.icon &&
                  <SvgSymbol
                    className="mr-fill-blue-light-75 mr-w-48 mr-h-48"
                    sym={activeStep.icon}
                    viewBox={activeStep.viewBox || '0 0 20 20'}
                  />
                  }
                </div>
                <div className="mr-p-4 md:mr-p-8 mr-w-full">
                  <LongFormToggle
                    {...this.props}
                    isLongForm={this.isLongForm()}
                    setIsLongForm={this.setIsLongForm}
                  />
                  <StepComponent
                    {...this.props}
                    step={activeStep}
                    transitionToStep={transitionToStep}
                    challengeSteps={challengeSteps}
                  />
                  <StepNavigation
                    activeStep={activeStep}
                    prevStep={stepName => {
                      this.isFinishing = false
                      prevStep(stepName)
                    }}
                    finish={() => {
                      this.isFinishing = true
                      this.handleSubmit()
                      return false
                    }}
                  />
                </div>
              </div>
            </BreadcrumbWrapper>
          )
        }

        // Override the standard form-field description renderer with our own that
        // supports Markdown. We pass this in to the `fields` prop on the Form.
        const customFields = {
          DescriptionField: MarkdownDescriptionField,
          markdown: MarkdownEditField,
          columnRadio: ColumnRadioField,
          tags: props => {
            return (
              <React.Fragment>
                <LabelWithHelp {...props} />
                <KeywordAutosuggestInput
                  {...props}
                  inputClassName="mr-p-2 mr-border-2 mr-border-grey-light-more mr-text-grey mr-rounded"
                  dropdownInnerClassName="mr-bg-blue-darker"
                />
              </React.Fragment>
            )
          },
          taskTags: injectIntl(props => {
            return (
              <React.Fragment>
                <LabelWithHelp {...props} />
                <KeywordAutosuggestInput
                  {...props}
                  inputClassName="mr-p-2 mr-border-2 mr-border-grey-light-more mr-text-grey mr-rounded"
                  dropdownInnerClassName="mr-bg-blue-darker"
                  placeholder={props.intl.formatMessage(messages.addMRTagsPlaceholder)}
                  tagType={props.uiSchema.tagType}
                />
              </React.Fragment>
            )
          }),
          limitTags: injectIntl(props => {
            return (
              <React.Fragment>
                <div className="mr-mb-2">
                  {props.uiSchema["ui:help"]}
                </div>
                <div className="radio">
                  <input
                    type="radio"
                    name={props.name + "yes"}
                    className="mr-mr-1.5"
                    checked={!props.formData}
                    onChange={(e) => props.onChange(false)}
                  />
                  <label className="mr-mr-2 mr-text-grey-lighter">
                    <FormattedMessage {...messages.yesLabel}/>
                  </label>
                </div>
                <div className="radio">
                  <input
                    type="radio"
                    name={props.name + "no"}
                    className="mr-mr-1.5"
                    checked={!!props.formData}
                    onChange={(e) => {
                      props.onChange(true)
                    }}
                  />
                  <label className="mr-text-grey-lighter">
                    <FormattedMessage {...messages.noLabel}/>
                  </label>
                </div>
              </React.Fragment>
            )
          }),
          configureCustomTaskStyles: (props) => {
            return configureCustomTaskStyles(props,
              () => this.setState({showTaskStyleRules: true}))
          },
        }

        return (
          <BreadcrumbWrapper
            {...this.props}
            cancel={this.cancel}
            isCloningChallenge={this.isCloningChallenge}
            isNewChallenge={isNewChallenge}
          >
            {this.state.showTaskStyleRules &&
              <External>
                <Modal className=""
                        isActive extraWide
                        onClose={() => this.setState({showTaskStyleRules: false})}>
                  <div className="mr-overflow-y-auto mr-max-h-screen80 mr-bg-black-15 mr-m-2 mr-p-4">
                    <TaskPropertyStyleRules {...this.props}>
                      <button className="mr-button mr-button--green mr-mr-4"
                        onClick={() => {
                          this.props.clearStyleRules()
                        }}>
                        <FormattedMessage {...messages.taskPropertyStylesClear} />
                      </button>
                      {!this.props.hasAnyStyleRuleErrors &&
                        <button className="mr-button mr-button--green"
                          onClick={() => {
                            this.setState({showTaskStyleRules: false})
                          }}>
                          <FormattedMessage {...messages.taskPropertyStylesClose} />
                        </button>
                      }
                    </TaskPropertyStyleRules>
                  </div>
                </Modal>
              </External>
            }

            <div className="mr-flex">
              <div className="mr-w-54 mr-flex mr-flex-col mr-items-center mr-bg-blue-darker mr-rounded-l mr-pt-8">
                {activeStep.icon &&
                 <SvgSymbol
                   className="mr-fill-blue-light-75 mr-w-48 mr-h-48"
                   sym={activeStep.icon}
                   viewBox={activeStep.viewBox || '0 0 20 20'}
                 />
                }
              </div>
              <div className="mr-p-4 md:mr-p-8 mr-w-full">
                <LongFormToggle
                  {...this.props}
                  isLongForm={this.isLongForm()}
                  setIsLongForm={this.setIsLongForm}
                />
                <Form
                  schema={activeStep.jsSchema(
                    this.props.intl, this.props.user, challengeData, this.state.extraErrors, {
                      longForm: this.isLongForm(),
                    }
                  )}
                  uiSchema={activeStep.uiSchema(
                    this.props.intl, this.props.user, challengeData, this.state.extraErrors, {
                      longForm: this.isLongForm(),
                      collapsedGroups: this.collapsedFormGroups(),
                      toggleCollapsed: this.toggleCollapsedFormGroup,
                    }
                  )}
                  className="form"
                  validate={(formData, errors) => this.validate(formData, errors, activeStep)}
                  widgets={{SelectWidget: CustomSelectWidget, TextWidget: CustomTextWidget}}
                  ArrayFieldTemplate={CustomArrayFieldTemplate}
                  FieldTemplate={CustomFieldTemplate}
                  fields={customFields}
                  tagType={"challenges"}
                  noHtml5Validate
                  showErrorList={false}
                  formData={challengeData}
                  formContext={_merge(this.state.formContext, {
                    bounding: _get(challengeData, 'bounding'),
                    buttonAction: BoundsSelectorModal,
                  })}
                  onChange={this.changeHandler}
                  onSubmit={formData => this.handleSubmit(formData, nextStep)}
                  onError={this.errorHandler}
                  extraErrors={this.state.extraErrors}
                >
                  {this.hasTaskStyleRuleErrors() &&
                    activeStep.id === "Properties" &&
                    <div className="mr-text-red-light mr-mb-4">
                      <FormattedMessage {...messages.customTaskStylesError} />
                    </div>
                  }

                  {/* Note: Next button submits the form, so nextStep isn't used here */}
                  <StepNavigation
                    activeStep={activeStep}
                    prevStep={stepName => {
                      this.isFinishing = false
                      prevStep(stepName)
                    }}
                    finish={() => {
                      this.isFinishing = true
                      this.handleSubmit()
                      return false
                    }}
                  />
                </Form>
              </div>
            </div>
          </BreadcrumbWrapper>
        )
      }}
    />
  }
}

function configureCustomTaskStyles(props, configureTaskStyleRules) {
  return (
    <React.Fragment>
      <LabelWithHelp {...props} />
      <div>
        <div className="radio">
          <input
            type="radio"
            name="no-styles"
            className="mr-mr-1.5"
            checked={!props.formData}
            onChange={(e) => props.onChange(false)}
          />
          <label className="mr-mr-2 mr-text-grey-lighter">
            <FormattedMessage {...messages.customTaskStyleDefaultLabel} />
          </label>
        </div>
        <div className="radio">
          <input
            type="radio"
            name="custom-styles"
            className="mr-mr-1.5"
            checked={!!props.formData}
            onChange={(e) => {
              props.onChange(true)
            }}
          />
          <label className="mr-text-grey-lighter">
            <FormattedMessage {...messages.customTaskStyleCustomLabel} />
          </label>
        </div>
        {!!props.formData &&
         <button
           className="mr-ml-4 mr-button mr-button--small"
           onClick={(e) => {
              configureTaskStyleRules()
              e.stopPropagation()
              e.preventDefault()
           }}
         >
            <FormattedMessage {...messages.customTaskStyleButton} />
          </button>
        }
      </div>
    </React.Fragment>
  )
}

const BreadcrumbWrapper = props => {
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
                  <Link to={'/admin/projects'}>
                    <FormattedMessage {...manageMessages.manageHeader} />
                  </Link>
                </li>
                <li>
                  <Link to={`/admin/project/${props.project.id}`}>
                    {props.project.displayName || props.project.name}
                  </Link>
                </li>
                {_isObject(props.challenge) &&
                  <li>
                    <Link to={`/admin/project/${props.project.id}/challenge/${props.challenge.id}`}>
                      {props.challenge.name}
                    </Link>
                  </li>
                }
                <li className="is-active">
                  {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                  <a aria-current="page">
                    {
                      props.isCloningChallenge() ?
                      <FormattedMessage {...messages.cloneChallenge} /> :
                      (_isObject(props.challenge) ?
                      <FormattedMessage {...messages.editChallenge} /> :
                      <FormattedMessage {...messages.newChallenge} />)
                    }
                  </a>
                  {props.loadingChallenge && <BusySpinner inline />}
                </li>
              </ul>
              <button
                type="button"
                className="mr-button mr-button--white mr-button--small"
                onClick={() => props.cancel()}
              >
                <FormattedMessage
                  {...(props.isNewChallenge ? messages.cancelNewChallengeLabel : messages.cancelLabel)}
                />
              </button>
            </nav>
          </div>

          <div className="mr-max-w-3xl mr-mx-auto mr-bg-blue-dark mr-mt-8 mr-rounded">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Controls for toggling between long-form and stepped presentation
 */
const LongFormToggle = function(props) {
  return (
    <div className="mr-w-full mr-flex mr-justify-end">
      <button
        type="button"
        title={props.intl.formatMessage(messages.showStepsTooltip)}
        onClick={() => props.setIsLongForm(false)}
      >
        <SvgSymbol
          sym="carousel-icon"
          viewBox="0 0 20 20"
          className={classNames(
            "mr-w-4 mr-h-4 mr-mr-4",
            props.isLongForm ? "mr-fill-green-lighter" : "mr-fill-white"
          )}
        />
      </button>
      <button
        type="button"
        title={props.intl.formatMessage(messages.showLongformTooltip)}
        onClick={() => props.setIsLongForm(true)}
      >
        <SvgSymbol
          sym="list-icon"
          viewBox="0 0 20 20"
          className={classNames(
            "mr-w-4 mr-h-4",
            !props.isLongForm ? "mr-fill-green-lighter" : "mr-fill-white"
          )}
        />
      </button>
    </div>
  )
}

export default WithCurrentUser(
  WithCurrentProject(
    WithCurrentChallenge(
      WithTaskPropertyStyleRules(
        injectIntl(EditChallenge)
      )
    )
  )
)

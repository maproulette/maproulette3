import React, { Component } from 'react'
import Form from 'react-jsonschema-form-async';
import _isObject from 'lodash/isObject'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _isEmpty from 'lodash/isEmpty'
import _isUndefined from 'lodash/isUndefined'
import _isFinite from 'lodash/isFinite'
import _omit from 'lodash/omit'
import _filter from 'lodash/filter'
import _first from 'lodash/first'
import _difference from 'lodash/difference'
import _get from 'lodash/get'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import AsLineReadableFile
       from '../../../../../interactions/File/AsLineReadableFile'
import Steps from '../../../../Bulma/Steps'
import StepNavigation
       from '../../StepNavigation/StepNavigation'
import { CustomArrayFieldTemplate,
         CustomSelectWidget,
         MarkdownDescriptionField,
         MarkdownEditField }
       from '../../../../Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import KeywordAutosuggestInput
       from '../../../../KeywordAutosuggestInput/KeywordAutosuggestInput'
import WithCurrentProject
       from '../../../HOCs/WithCurrentProject/WithCurrentProject'
import WithCurrentChallenge
       from '../../../HOCs/WithCurrentChallenge/WithCurrentChallenge'
import WithCurrentUser
       from '../../../../HOCs/WithCurrentUser/WithCurrentUser'
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
import BusySpinner from '../../../../BusySpinner/BusySpinner'
import { preparePriorityRuleGroupForForm,
         preparePriorityRuleGroupForSaving } from './PriorityRuleGroup'
import { jsSchema as step1jsSchema,
         uiSchema as step1uiSchema } from './Step1Schema'
import { jsSchema as step2jsSchema,
         uiSchema as step2uiSchema } from './Step2Schema'
import { jsSchema as step3jsSchema,
         uiSchema as step3uiSchema } from './Step3Schema'
import { jsSchema as step4jsSchema,
         uiSchema as step4uiSchema } from './Step4Schema'
import manageMessages from '../../Messages'
import messages from './Messages'
import './EditChallenge.scss'

// Workflow steps for creating/editing challenges
const challengeSteps = [
  {
    name: 'General',
    jsSchema: step1jsSchema,
    uiSchema: step1uiSchema,
  },
  {
    name: 'GeoJSON',
    jsSchema: step2jsSchema,
    uiSchema: step2uiSchema,
  },
  {
    name: 'Priorities',
    jsSchema: step3jsSchema,
    uiSchema: step3uiSchema,
  },
  {
    name: 'Extra',
    jsSchema: step4jsSchema,
    uiSchema: step4uiSchema,
  },
]

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
    activeStep: 0,
    formData: {},
    formContext: {},
    isSaving: false,
  }

  isFinishing = false

  /**
   * Returns true if this challenge's data is being cloned from another
   * challenge.
   */
  isCloningChallenge = () =>
    !!_get(this.props, 'location.state.cloneChallenge')

  /** Can the workflow back up to the previous step? */
  canPrev = () => this.state.activeStep > 0

  /** Can the workflow progress to the next step? */
  canNext = () => {
    return this.state.activeStep < challengeSteps.length - 1
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
      response.errors = {localGeoJSON: _first(lintErrors).message}
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
      response.errors = {overpassQL: this.props.intl.formatMessage(_first(lintErrors).message)}
    }

    return response
  }

  /**
   * Perform additional validation checks beyond schema validation. Primarily
   * we check Overpass queries and GeoJSON.
   */
  validateGeoJSONSource = async (formData) => {
    let response = {}

    // Skip additional source data validation if user has indicated they wish
    // to ignore source errors.
    if (formData.ignoreSourceErrors ||
        challengeSteps[this.state.activeStep].name !== "GeoJSON") {
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
      throw response
    }

    return response
  }

  asyncSubmit = (formData, result) => {
    return this.isFinishing ? this.finish() : this.nextStep()
  }

  /** Back up to the previous step in the workflow */
  prevStep = () => {
    this.isFinishing = false

    if (this.canPrev()) {
      this.setState({
        activeStep: this.state.activeStep - 1,
      })
    }
  }

  /** Advance to the next step in the workflow */
  nextStep = () => {
    if (this.canNext()) {
      this.setState({
        activeStep: this.state.activeStep + 1,
      })
      window.scrollTo(0, 0)
    }
    else {
      this.finish()
    }
  }

  /** Jump to the given step number */
  jumpToStep = stepNumber => {
    if (stepNumber !== this.state.activeStep &&
        stepNumber >= 0 && stepNumber < challengeSteps.length) {
      this.setState({
        activeStep: stepNumber,
        formContext: {},
      })
      window.scrollTo(0, 0)
    }
  }

  /** Complete the workflow, saving the challenge data */
  finish = () => {
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

      challengeData.checkinComment =
        AsEditableChallenge(challengeData).checkinCommentWithoutMaprouletteHashtag()
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
        // replace whitespace with commas, split on comma, and filter out any
        // empty-string keywords.
        _filter(
          challengeData.additionalKeywords.replace(/\s+/, ',').split(/,+/),
          keyword => !_isEmpty(keyword)
        )
      )
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

    return challengeData
  }

  render() {
    const isUploadingTasks = _get(this.props, 'progress.creatingTasks.inProgress', false)
    if (isUploadingTasks) {
      return <TaskUploadingProgress {...this.props} />
    }

    if (!this.props.project || this.state.isSaving) {
      return (
        <div className="pane-loading full-screen-height">
          <BusySpinner />
        </div>
      )
    }

    const challengeData = this.prepareChallengeDataForForm()
    const currentStep = challengeSteps[this.state.activeStep]

    // Override the standard form-field description renderer with our own that
    // supports Markdown. We pass this in to the `fields` prop on the Form.
    const customFields = {
      DescriptionField: MarkdownDescriptionField,
      markdown: MarkdownEditField,
      tags: KeywordAutosuggestInput,
    }

    return (
      <div className="admin__manage edit-challenge">
        <div className="admin__manage__pane-wrapper">
          <div className="admin__manage__primary-content">
            <div className="admin__manage__header">
              <nav className="breadcrumb" aria-label="breadcrumbs">
                <ul>
                  <li>
                    <Link to={'/admin/projects'}>
                      <FormattedMessage {...manageMessages.manageHeader} />
                    </Link>
                  </li>
                  <li>
                    <Link to={`/admin/project/${this.props.project.id}`}>
                      {this.props.project.displayName ||
                      this.props.project.name}
                    </Link>
                  </li>
                  {_isObject(this.props.challenge) &&
                    <li>
                      <Link to={`/admin/project/${this.props.project.id}/challenge/${this.props.challenge.id}`}>
                        {this.props.challenge.name}
                      </Link>
                    </li>
                  }
                  <li className="is-active">
                    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                    <a aria-current="page">
                      {
                        this.isCloningChallenge() ?
                        <FormattedMessage {...messages.cloneChallenge} /> :
                        (_isObject(this.props.challenge) ?
                        <FormattedMessage {...messages.editChallenge} /> :
                        <FormattedMessage {...messages.newChallenge} />)
                      }
                    </a>
                    {this.props.loadingChallenge && <BusySpinner inline />}
                  </li>
                </ul>
              </nav>
            </div>

            <Steps steps={challengeSteps} activeStep={this.state.activeStep}
                   onStepClick={AsEditableChallenge(challengeData).isNew() ? undefined : this.jumpToStep}
            />
            <div className="mr-max-w-2xl mr-mx-auto mr-bg-white mr-mt-8 mr-p-4 md:mr-p-8 mr-rounded">
              <Form schema={currentStep.jsSchema(this.props.intl, this.props.user, challengeData)}
                    className="form"
                    onAsyncValidate={this.validateGeoJSONSource}
                    uiSchema={currentStep.uiSchema(this.props.intl, this.props.user, challengeData)}
                    widgets={{SelectWidget: CustomSelectWidget}}
                    ArrayFieldTemplate={CustomArrayFieldTemplate}
                    fields={customFields}
                    tagType={"challenges"}
                    noHtml5Validate
                    showErrorList={false}
                    formData={challengeData}
                    formContext={this.state.formContext}
                    onChange={this.changeHandler}
                    onSubmit={this.asyncSubmit}
                    onError={this.errorHandler}
              >
                <StepNavigation steps={challengeSteps} activeStep={this.state.activeStep}
                                prevStep={this.prevStep} cancel={this.cancel}
                                finish={() => this.isFinishing = true}
                                canFinishEarly={!AsEditableChallenge(challengeData).isNew()} />
              </Form>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default WithCurrentUser(
  WithCurrentProject(
    WithCurrentChallenge(injectIntl(EditChallenge))
  )
)

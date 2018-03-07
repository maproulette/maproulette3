import React, { Component } from 'react'
import Form from "react-jsonschema-form"
import _isObject from 'lodash/isObject'
import _isNumber from 'lodash/isNumber'
import _isString from 'lodash/isString'
import _isEmpty from 'lodash/isEmpty'
import _filter from 'lodash/filter'
import _difference from 'lodash/difference'
import _get from 'lodash/get'
import { FormattedMessage, injectIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import Steps from '../../../../Bulma/Steps'
import StepNavigation
       from '../../../../Bulma/StepNavigation/StepNavigation'
import { CustomFieldTemplate,
         CustomArrayFieldTemplate,
         MarkdownDescriptionField,
         MarkdownEditField }
       from '../../../../Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
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
import './EditChallenge.css'

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
    formContext: {isValid: true},
    isSaving: false,
  }

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
    return this.state.activeStep < challengeSteps.length &&
           this.state.formContext.isValid
  }

  /** Back up to the previous step in the workflow */
  prevStep = () => {
    if (this.canPrev()) {
      this.setState({
        activeStep: this.state.activeStep - 1,
        formContext: {isValid: true}
      })
    }
  }

  /** Advance to the next step in the workflow */
  nextStep = () => {
    if (this.canNext()) {
      if (this.state.formContext.isValid) {
        this.setState({
          activeStep: this.state.activeStep + 1,
          formContext: {isValid: true}
        })
        window.scrollTo(0, 0)
      }
    }
    else {
      this.finish()
    }
  }

  /** Complete the workflow, saving the challenge data */
  finish = () => {
    if (this.state.activeStep === challengeSteps.length - 1 &&
        this.state.formContext.isValid) {
      const formData = this.prepareFormDataForSaving()
      this.setState({isSaving: true})

      this.props.saveChallenge(formData).then(challenge => {
        if (_isObject(challenge) && _isNumber(challenge.parent)) {
          this.props.history.push(
            `/admin/project/${challenge.parent}/challenge/${challenge.id}`)
        }
      })
    }
  }

  /** Cancel editing */
  cancel = () => {
    _isObject(this.props.challenge) ?
      this.props.history.push(
        `/admin/project/${this.props.project.id}/challenge/${this.props.challenge.id}`) :
      this.props.history.push(`/admin/project/${this.props.project.id}`)
  }

  /** Receive updates to the form data, along with any validation errors */
  changeHandler = ({formData, errors}) => {
    this.setState({
      formData,
      formContext: {isValid: errors.length === 0}
    })
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
      this.props.challenge,
      this.state.formData
    )

    // If we're cloning a challenge, reset the id and name.
    if (this.isCloningChallenge()) {
      delete challengeData.id

      if (_isEmpty(this.state.formData.name)) {
        delete challengeData.name
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
  prepareFormDataForSaving = () => {
    const challengeData = Object.assign(
      this.prepareChallengeDataForForm(this.props.challenge),
      this.state.formData,
    )

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

    return challengeData
  }

  render() {
    if (!this.props.project) {
      return <BusySpinner />
    }

    const challengeData = this.prepareChallengeDataForForm()
    const currentStep = challengeSteps[this.state.activeStep]

    // Override the standard form-field description renderer with our own that
    // supports Markdown. We pass this in to the `fields` prop on the Form.
    const customFields = {
      DescriptionField: MarkdownDescriptionField,
      markdown: MarkdownEditField,
    }

    // Each time we render, start formContext.isValid at true. It'll be set
    // to false if needed by an RJSFFormFieldAdapter if its value has errors.
    // This is an ugly workaround -- see above.
    // eslint-disable-next-line
    this.state.formContext.isValid = true

    return (
      <div className="admin__manage edit-challenge">
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

        <Steps steps={challengeSteps} activeStep={this.state.activeStep} />
        <Form schema={currentStep.jsSchema(this.props.intl, this.props.user)}
              uiSchema={currentStep.uiSchema}
              FieldTemplate={CustomFieldTemplate}
              ArrayFieldTemplate={CustomArrayFieldTemplate}
              fields={customFields}
              liveValidate
              noHtml5Validate
              showErrorList={false}
              formData={challengeData}
              formContext={this.state.formContext}
              onChange={this.changeHandler}
              onSubmit={this.nextStep}>
          <div className="form-controls" />
        </Form>

        <StepNavigation steps={challengeSteps} activeStep={this.state.activeStep}
                        canPrev={this.canPrev} prevStep={this.prevStep}
                        canNext={this.canNext} nextStep={this.nextStep}
                        finish={this.finish} cancel={this.cancel} />
      </div>
    )
  }
}

export default WithCurrentUser(
  WithCurrentProject(
    WithCurrentChallenge(injectIntl(EditChallenge))
  )
)

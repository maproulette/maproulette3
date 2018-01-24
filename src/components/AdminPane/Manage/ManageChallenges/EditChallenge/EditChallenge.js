import React, { Component } from 'react'
import Form from "react-jsonschema-form"
import { isObject as _isObject,
         isNumber as _isNumber,
         filter as _filter,
         isString as _isString,
         isEmpty as _isEmpty,
         difference as _difference,
         get as _get } from 'lodash'
import { FormattedMessage, injectIntl } from 'react-intl'
import Steps from '../../../../Bulma/Steps'
import StepNavigation from '../../../../Bulma/StepNavigation'
import { CustomFieldTemplate } from '../../../../Bulma/RJSFFormFieldAdapter/RJSFFormFieldAdapter'
import WithCurrentChallenge from '../../../HOCs/WithCurrentChallenge/WithCurrentChallenge'
import WithCurrentUser from '../../../../HOCs/WithCurrentUser/WithCurrentUser'
import { ChallengeCategoryKeywords,
         categoryMatchingKeywords,
         rawCategoryKeywords }
       from '../../../../../services/Challenge/ChallengeKeywords/ChallengeKeywords'
import BusySpinner from '../../../../BusySpinner/BusySpinner'
import { jsSchema as step1jsSchema,
         uiSchema as step1uiSchema } from './Step1Schema'
import { jsSchema as step2jsSchema,
         uiSchema as step2uiSchema } from './Step2Schema'
import { jsSchema as step3jsSchema,
         uiSchema as step3uiSchema } from './Step3Schema'
import { jsSchema as step4jsSchema,
         uiSchema as step4uiSchema } from './Step4Schema'
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
    const challengeData = this.prepareChallengeDataForForm()
    const currentStep = challengeSteps[this.state.activeStep]

    // Each time we render, start formContext.isValid at true. It'll be set
    // to false if needed by an RJSFFormFieldAdapter if its value has errors.
    // This is an ugly workaround -- see above.
    // eslint-disable-next-line
    this.state.formContext.isValid = true

    return (
      <div className="edit-challenge">
        <div className="edit-challenge__workflow-header">
          <h2 className="title">
            <div className="level">
              {
                _isObject(this.props.challenge) ?
                <FormattedMessage {...messages.editChallenge} /> :
                <FormattedMessage {...messages.newChallenge} />
              }
              {this.props.loadingChallenge && <BusySpinner inline />}
            </div>
          </h2>
          <Steps steps={challengeSteps} activeStep={this.state.activeStep} />
        </div>

        <Form schema={currentStep.jsSchema(this.props.intl, this.props.user)}
              uiSchema={currentStep.uiSchema}
              FieldTemplate={CustomFieldTemplate}
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
                        finish={this.finish} />
      </div>
    )
  }
}

export default WithCurrentUser(
  WithCurrentChallenge(injectIntl(EditChallenge))
)

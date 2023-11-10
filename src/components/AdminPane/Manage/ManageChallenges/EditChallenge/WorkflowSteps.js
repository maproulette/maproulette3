import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import _values from 'lodash/values'
import _isArray from 'lodash/isArray'
import _isString from 'lodash/isString'
import _isEmpty from 'lodash/isEmpty'
import _merge from 'lodash/merge'
import _reduce from 'lodash/reduce'
import { jsSchema as step1jsSchema,
         uiSchema as step1uiSchema } from './Schemas/DataSourceSchema'
import { jsSchema as step2jsSchema,
         uiSchema as step2uiSchema } from './Schemas/DescriptionSchema'
import { jsSchema as step3jsSchema,
         uiSchema as step3uiSchema } from './Schemas/InstructionsSchema'
import { jsSchema as prioritiesJsSchema,
         uiSchema as prioritiesUiSchema } from './Schemas/PrioritiesSchema'
import { jsSchema as zoomJsSchema,
         uiSchema as zoomUiSchema } from './Schemas/ZoomSchema'
import { jsSchema as osmCommitJsSchema,
         uiSchema as osmCommitUiSchema } from './Schemas/OSMCommitSchema'
import { jsSchema as basemapJsSchema,
         uiSchema as basemapUiSchema } from './Schemas/BasemapSchema'
import { jsSchema as propertiesJsSchema,
         uiSchema as propertiesUiSchema } from './Schemas/PropertiesSchema'
import { jsSchema as discoverabilityJsSchema,
         uiSchema as discoverabilityUiSchema } from './Schemas/DiscoverabilitySchema'
import { jsSchema as tagsJsSchema,
         uiSchema as tagsUiSchema } from './Schemas/TagsSchema'
import { jsSchema as editorJsSchema,
         uiSchema as editorUiSchema } from './Schemas/EditorSchema'
import {jsSchema as automatedEditsPolicyAgreementJsSchema,
        uiSchema as automatedEditsPolicyAgreementUiSchema} from './Schemas/AutomatedEditsPolicyAgreementSchema'
import MenuStep from './MenuStep'
import messages from './Messages'

// Define individual workflow steps. Steps can be driven by either schemas or
// by components
const dataSourceStep = {
  id: 'DataSource',
  description: <FormattedMessage {...messages.dataSourceStepDescription} />,
  jsSchema: step1jsSchema,
  uiSchema: step1uiSchema,
  icon: "datasource-icon",
  viewBox: "0 0 100 125",
}

const descriptionStep = {
  id: 'Description',
  description: <FormattedMessage {...messages.descriptionStepDescription} />,
  jsSchema: step2jsSchema,
  uiSchema: step2uiSchema,
  icon: "description-icon",
  viewBox: "0 0 100 125",
}

const instructionsStep = {
  id: 'Instructions',
  description: <FormattedMessage {...messages.instructionsStepDescription} />,
  jsSchema: step3jsSchema,
  uiSchema: step3uiSchema,
  icon: "instructions-icon",
  viewBox: "0 0 100 125",
}

const discoverabilityStep = {
  id: 'Discoverability',
  description: <FormattedMessage {...messages.discoverabilityStepDescription} />,
  jsSchema: discoverabilityJsSchema,
  uiSchema: discoverabilityUiSchema,
  icon: "discover-icon",
  viewBox: "0 0 64 80",
}

const prioritiesStep = {
  id: 'Priorities',
  description: <FormattedMessage {...messages.prioritiesStepDescription} />,
  jsSchema: prioritiesJsSchema,
  uiSchema: prioritiesUiSchema,
  icon: "priority-icon",
  viewBox: "0 0 100 125",
}

const zoomStep = {
  id: 'Zoom',
  description: <FormattedMessage {...messages.zoomStepDescription} />,
  jsSchema: zoomJsSchema,
  uiSchema: zoomUiSchema,
  icon: "zoom-icon",
  viewBox: "0 0 100 125",
}

const osmCommitStep = {
  id: 'OSMCommit',
  description: <FormattedMessage {...messages.osmCommitStepDescription} />,
  jsSchema: osmCommitJsSchema,
  uiSchema: osmCommitUiSchema,
  icon: "changeset-icon",
  viewBox: "0 0 50 62.5",
}

const basemapStep = {
  id: 'Basemap',
  description: <FormattedMessage {...messages.basemapStepDescription} />,
  jsSchema: basemapJsSchema,
  uiSchema: basemapUiSchema,
  icon: "basemap-icon",
  viewBox: "0 0 30 37.5",
}

const propertiesStep = {
  id: 'Properties',
  description: <FormattedMessage {...messages.propertiesStepDescription} />,
  jsSchema: propertiesJsSchema,
  uiSchema: propertiesUiSchema,
  icon: "configure-icon",
  viewBox: "0 0 100 125",
}

const tagsStep = {
  id: 'Tags',
  description: <FormattedMessage {...messages.tagsStepDescription} />,
  jsSchema: tagsJsSchema,
  uiSchema: tagsUiSchema,
  icon: "tag-icon",
  viewBox: "0 0 100 125",
}

const editorConfStep = {
  id: 'Editor',
  description: <FormattedMessage {...messages.editorStepDescription} />,
  jsSchema: editorJsSchema,
  uiSchema: editorUiSchema,
  icon: "editor-configuration-icon",
  viewBox: "0 0 126 129",
}

const automatedEditsPolicyAgreementStep = {
  id: "AutomatedEditsPolicy",
  description: <FormattedMessage {...messages.automatedEditsPolicyAgreementStepDescription} />,
  jsSchema: automatedEditsPolicyAgreementJsSchema,
  uiSchema: automatedEditsPolicyAgreementUiSchema,
  icon: "info-icon",
  viewBox: "0 0 100 125",
}

const advancedOptionsStep = {
  id: 'AdvancedOptions',
  component: props => (
    <MenuStep
      {...props}
      headerMessage={messages.advancedOptionsStepDescription}
      introMessage={messages.advancedOptionsStepIntro}
    />
  ),
  icon: "options-icon",
  viewBox: "0 0 20 20",
}

const allOptionsStep = {
  id: 'AllOptions',
  component: props => (
    <MenuStep
      {...props}
      headerMessage={messages.allOptionsStepDescription}
    />
  ),
  icon: "options-icon",
  viewBox: "0 0 20 20",
}

// String together workflow steps for creating a new challenge
const newChallengeSteps = {
  'DataSource': Object.assign({}, dataSourceStep, {
    next: 'Description',
    previous: null,
  }),
  'Description': Object.assign({}, descriptionStep, {
    next: 'Instructions',
    previous: 'DataSource',
  }),
  'Instructions': Object.assign({}, instructionsStep, {
    next: 'AutomatedEditsPolicy',
    previous: 'Description',
  }),
  'AdvancedOptions': Object.assign({}, advancedOptionsStep, {
    next: [
      'Discoverability',
      'Priorities',
      'Zoom',
      'OSMCommit',
      'Basemap',
      'Properties',
      'Tags',
      'Editor',
    ],
    previous: 'AutomatedEditsPolicy',
    canFinish: true,
  }),
  'Discoverability': Object.assign({}, discoverabilityStep, {
    next: 'AdvancedOptions',
    previous: 'AdvancedOptions',
    canFinish: true,
  }),
  'Priorities': Object.assign({}, prioritiesStep, {
    next: 'AdvancedOptions',
    previous: 'AdvancedOptions',
    canFinish: true,
  }),
  'Zoom': Object.assign({}, zoomStep, {
    next: 'AdvancedOptions',
    previous: 'AdvancedOptions',
    canFinish: true,
  }),
  'OSMCommit': Object.assign({}, osmCommitStep, {
    next: 'AdvancedOptions',
    previous: 'AdvancedOptions',
    canFinish: true,
  }),
  'Basemap': Object.assign({}, basemapStep, {
    next: 'AdvancedOptions',
    previous: 'AdvancedOptions',
    canFinish: true,
  }),
  'Properties': Object.assign({}, propertiesStep, {
    next: 'AdvancedOptions',
    previous: 'AdvancedOptions',
    canFinish: true,
  }),
  'Tags': Object.assign({}, tagsStep, {
    next: 'AdvancedOptions',
    previous: 'AdvancedOptions',
    canFinish: true,
  }),
  'Editor': Object.assign({}, editorConfStep, {
    next: 'AdvancedOptions',
    previous: 'AdvancedOptions',
    canFinish: true,
  }),
  'AutomatedEditsPolicy': Object.assign({}, automatedEditsPolicyAgreementStep, {
    next: 'AdvancedOptions',
    previous: 'Instructions'
  })
}

// String together workflow steps for editing an existing challenge
const editChallengeSteps = {
  'AllOptions': Object.assign({}, allOptionsStep, {
    next: [
      'DataSource',
      'Description',
      'Instructions',
      'Discoverability',
      'Priorities',
      'Zoom',
      'OSMCommit',
      'Basemap',
      'Properties',
      'Tags',
      'Editor',
    ],
    previous: null,
    canFinish: true,
  }),
  'DataSource': Object.assign({}, dataSourceStep, {
    next: 'AllOptions',
    previous: 'AllOptions',
    canFinish: true,
  }),
  'Description': Object.assign({}, descriptionStep, {
    next: 'AllOptions',
    previous: 'AllOptions',
    canFinish: true,
  }),
  'Instructions': Object.assign({}, instructionsStep, {
    next: 'AllOptions',
    previous: 'AllOptions',
    canFinish: true,
  }),
  'Discoverability': Object.assign({}, discoverabilityStep, {
    next: 'AllOptions',
    previous: 'AllOptions',
    canFinish: true,
  }),
  'Priorities': Object.assign({}, prioritiesStep, {
    next: 'AllOptions',
    previous: 'AllOptions',
    canFinish: true,
  }),
  'Zoom': Object.assign({}, zoomStep, {
    next: 'AllOptions',
    previous: 'AllOptions',
    canFinish: true,
  }),
  'OSMCommit': Object.assign({}, osmCommitStep, {
    next: 'AllOptions',
    previous: 'AllOptions',
    canFinish: true,
  }),
  'Basemap': Object.assign({}, basemapStep, {
    next: 'AllOptions',
    previous: 'AllOptions',
    canFinish: true,
  }),
  'Properties': Object.assign({}, propertiesStep, {
    next: 'AllOptions',
    previous: 'AllOptions',
    canFinish: true,
  }),
  'Tags': Object.assign({}, tagsStep, {
    next: 'AllOptions',
    previous: 'AllOptions',
    canFinish: true,
  }),
  'Editor': Object.assign({}, editorConfStep, {
    next: 'AllOptions',
    previous: 'AllOptions',
    canFinish: true,
  }),
}

// Combine given workflow steps into a single longform step
const combinedSteps = steps => ({
  id: 'AllFields',
  jsSchema: (intl, user, challengeData, extraErrors, options) => {
    return _reduce(steps, (schema, step) => {
      if (step.jsSchema) {
        const stepSchema = step.jsSchema(intl, user, challengeData, extraErrors, options)
        _merge(schema, stepSchema, {
          required: (schema.required || []).concat(stepSchema.required || []),
        })
      }
      return schema
    },
    {})
  },
  uiSchema: (intl, user, challengeData, extraErrors, options) => {
    const combinedSchema = _reduce(steps, (schema, step) => {
      if (step.uiSchema) {
        const stepSchema = step.uiSchema(intl, user, challengeData, extraErrors, options)
        _merge(schema, stepSchema, {
          "ui:order": (schema["ui:order"] || []).concat(stepSchema["ui:order"] || [])
        })
      }
      return schema
    },
    {})
    combinedSchema["ui:order"].push("*")
    combinedSchema["ui:order"].push("policyAgreement")
    return combinedSchema
  }
})

/**
 * Ensure a step transition is valid within a workflow based on the setup of
 * the active step and destination step
 */
export const validateStepTransition = (activeStep, toStepId, allowedStep, transitionName) => {
  const transitionError =
    new Error(`Invalid ${transitionName} step "${toStepId}" for step ${activeStep.id}`)

  if (_isEmpty(allowedStep)) {
    throw transitionError
  }

  // If we're given a specific step id, make sure it's valid for this step
  if (toStepId) {
    if (_isString(allowedStep) && allowedStep !== toStepId) {
      throw transitionError
    }
    else if (_isArray(allowedStep) && allowedStep.indexOf(toStepId) === -1) {
      throw transitionError
    }
  }
  else if (_isArray(allowedStep)) {
    throw new Error(`Indeterminate transition for step ${activeStep.id}`)
  }
}

/**
 * WorkflowSteps manages simple workflows for creating and editing challenges
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WorkflowSteps = props => {
  const challengeSteps = props.isNewChallenge ? newChallengeSteps : editChallengeSteps
  const [activeStep, setActiveStep] = useState(_values(challengeSteps)[0])

  // Transition to a given step in the workflow
  const transitionToStep = stepId => {
    if (!stepId || !challengeSteps[stepId]) {
      throw new Error(`Invalid attempt to transition to step "${stepId}"`)
    }

    setActiveStep(challengeSteps[stepId])
  }

  // Go back to the previous step in the workflow
  const prevStep = stepId => {
    validateStepTransition(activeStep, stepId, activeStep.previous, "previous")

    transitionToStep(
      _isString(activeStep.previous) ? activeStep.previous : stepId
    )
  }

  // Advance to the next step in the workflow, or finish if there is no next step
  const nextStep = stepId => {
    if (!_isEmpty(activeStep.next)) {
      validateStepTransition(activeStep, stepId, activeStep.next, "next")
      transitionToStep(
        _isString(activeStep.next) ? activeStep.next : stepId
      )
    }
    else {
      props.finish()
    }
  }

  const step = props.isLongForm ? combinedSteps(challengeSteps) : activeStep
  return props.renderStep({
    challengeSteps,
    activeStep: step,
    StepComponent: step.component,
    prevStep,
    nextStep,
    transitionToStep,
  })
}

export default WorkflowSteps

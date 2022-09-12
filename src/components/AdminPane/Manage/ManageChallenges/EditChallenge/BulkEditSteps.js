import React from 'react'
import { FormattedMessage } from 'react-intl'
import _merge from 'lodash/merge'
import _reduce from 'lodash/reduce'
import { jsSchema as discoverabilityJsSchema,
         uiSchema as discoverabilityUiSchema } from './BulkSchemas/DiscoverabilitySchema'
import messages from './Messages'

// Define individual workflow steps. Steps can be driven by either schemas or
// by components
const discoverabilityStep = {
  id: 'Discoverability',
  description: <FormattedMessage {...messages.discoverabilityStepDescription} />,
  jsSchema: discoverabilityJsSchema,
  uiSchema: discoverabilityUiSchema,
  icon: "discover-icon",
  viewBox: "0 0 64 80",
}

// String together workflow steps for creating a new challenge
const bulkEditSteps = {
  'Discoverability': Object.assign({}, discoverabilityStep, {
    next: 'AdvancedOptions',
    previous: 'AdvancedOptions',
    canFinish: true,
  }),
}

// Combine given workflow steps into a single longform step
const combinedSteps = steps => ({
  id: 'BulkEditFields',
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
    return combinedSchema
  }
})

const BulkEditSteps = props => {
  return props.renderStep({
    bulkEditSteps,
    activeStep: combinedSteps(bulkEditSteps),
  })
}

export default BulkEditSteps

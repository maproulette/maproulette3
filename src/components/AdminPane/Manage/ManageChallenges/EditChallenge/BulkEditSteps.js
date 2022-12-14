import React from 'react'
import { FormattedMessage } from 'react-intl'
import _merge from 'lodash/merge'
import _reduce from 'lodash/reduce'
import { jsSchema as discoverabilityJsSchema,
         uiSchema as discoverabilityUiSchema } from './BulkSchemas/DiscoverabilitySchema'
import { jsSchema as tagsJsSchema,
         uiSchema as tagsUiSchema } from './BulkSchemas/TagsSchema'
import { jsSchema as propertiesJsSchema,
         uiSchema as propertiesUiSchema } from './BulkSchemas/PropertiesSchema'
import { jsSchema as prioritiesJsSchema,
         uiSchema as prioritiesUiSchema } from './BulkSchemas/PrioritiesSchema'
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

const tagsStep = {
  id: 'Tags',
  description: <FormattedMessage {...messages.tagsStepDescription} />,
  jsSchema: tagsJsSchema,
  uiSchema: tagsUiSchema,
  icon: "tag-icon",
  viewBox: "0 0 100 125",
}

const propertiesStep = {
  id: 'Properties',
  description: <FormattedMessage {...messages.propertiesStepDescription} />,
  jsSchema: propertiesJsSchema,
  uiSchema: propertiesUiSchema,
  icon: "configure-icon",
  viewBox: "0 0 100 125",
}

const prioritiesStep = {
  id: 'Priorities',
  description: <FormattedMessage {...messages.prioritiesStepDescription} />,
  jsSchema: prioritiesJsSchema,
  uiSchema: prioritiesUiSchema,
  icon: "priority-icon",
  viewBox: "0 0 100 125",
}

// String together workflow steps for creating a new challenge
const bulkEditSteps = {
  'Discoverability': Object.assign({}, discoverabilityStep, {
    next: 'AdvancedOptions',
    previous: 'AdvancedOptions',
    canFinish: true,
  }),
  'Tags': Object.assign({}, tagsStep, {
    next: 'AdvancedOptions',
    previous: 'AdvancedOptions',
    canFinish: true,
  }),
  'Properties': Object.assign({}, propertiesStep, {
    next: 'AdvancedOptions',
    previous: 'AdvancedOptions',
    canFinish: true,
  }),
  'Priorities': Object.assign({}, prioritiesStep, {
    next: 'AdvancedOptions',
    previous: 'AdvancedOptions',
    canFinish: true,
  })
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

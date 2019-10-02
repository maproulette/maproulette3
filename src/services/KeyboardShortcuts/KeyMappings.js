import messages from './Messages'

/**
 * Keyboard shortcut mappings. Top-level should be functional groupings, with
 * individual actions nested underneath. Values of actions should be an object
 * with at least `key` and `label` fields, with `label` pointing to an
 * internationalized message that describes the action.  An optional `keyLabel`
 * field can also be provided if a different description of the key to press
 * (e.g. 'ESC' instead of 'Escape') is desired, in which case it too should
 * point to an internationalized message.
 *
 * > Note: `key` values should correspond to keyboard event
 * > [key values](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
 */
export default {
  openEditor: {
    editId: {key: 'e', label: messages.editId},
    editJosm: {key: 'r', label: messages.editJosm},
    editJosmLayer: {key: 't', label: messages.editJosmLayer},
    editJosmFeatures: {key: 'y', label: messages.editJosmFeatures},
    editLevel0: {key: 'v', label: messages.editLevel0},
    editRapid: {key: 'a', label: messages.editRapid},
  },
  taskEditing: {
    cancel: {key: 'Escape', label: messages.cancel, keyLabel: messages.escapeLabel},
    fitBounds: {key: '0', label: messages.fitBounds},
  },
  layers: {
    layerOSMData: {key: 'o', label: messages.layerOSMData},
    layerTaskFeatures: {key: 's', label: messages.layerTaskFeatures},
    layerMapillary: {key: 'm', label: messages.layerMapillary},
  },
  taskCompletion: {
    skip: {key: 'w', label: messages.skip},
    falsePositive: {key: 'q', label: messages.falsePositive},
    fixed: {key: 'f', label: messages.fixed},
    tooHard: {key: 'd', label: messages.tooHard},
    alreadyFixed: {key: 'x', label: messages.alreadyFixed},
    confirmSubmit: {key: 'Enter', label: messages.confirmSubmit},
  },
  taskInspect: {
    nextTask: {key: 'l', label: messages.nextTask},
    prevTask: {key: 'h', label: messages.prevTask},
  },
}

/**
 * Keyboard shortcut mappings. Top-level should be functional groupings, with
 * individual actions nested underneath. Values of actions should be an object
 * with at least a `key` field, but can also have a `label` field to describe
 * the action and a `keyLabel` field to provide a different description of the
 * key to press (e.g. 'ESC' instead of 'Escape').
 *
 * > Note: `key` values should match keypress event
 * > [key values](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
 */
export default {
  openEditor: {
    editId: {key: 'e', label: 'Edit in Id'},
    editJosm: {key: 'r', label: 'Edit in JOSM'},
    editJosmLayer: {key: 't', label: 'Edit in new JOSM layer'},
  },
  taskEditing: {
    cancel: {key: 'Escape', label: 'Cancel Editing', keyLabel: 'ESC'}
  },
  taskCompletion: {
    skip: {key: 'w', label: 'Skip'},
    falsePositive: {key: 'q', label: 'Not an Issue'},
  },
  taskReview: {
    nextTask: {key: 'l', label: 'Next Task'},
    prevTask: {key: 'h', label: 'Previous Task'},
  },
}

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
  taskEditing: {
    editId: {key: 'e', label: 'Edit in Id'},
    editJosm: {key: 'r', label: 'Edit in JOSM'},
    editJosmLayer: {key: 't', label: 'Edit in new JOSM layer'},
    falsePositive: {key: 'q', label: 'Not an Issue'},
    skip: {key: 'w', label: 'Skip'},
  },
  taskCompletion: {
    cancel: {key: 'Escape', label: 'Cancel Editing', keyLabel: 'ESC'}
  },
}

export const SET_RAPIDEDITOR = "SET_RAPIDEDITOR";

const initialState = {
  isRunning: false,
  hasUnsavedChanges: false,
};

export function rapidEditor(state = initialState, action) {
  switch (action.type) {
    case SET_RAPIDEDITOR: {
      return {
        ...state,
        ...action.context,
      };
    }
    default:
      return state;
  }
}

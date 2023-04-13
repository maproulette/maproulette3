export const SET_RAPIDEDITOR = 'SET_RAPIDEDITOR';

const initialState = {
  rapidContext: null,
};

export function rapidEditor(state = initialState, action) {
  switch (action.type) {
    case SET_RAPIDEDITOR: {
      return {
        ...state,
        rapidContext: action.context,
      };
    }
    default:
      return state;
  }
}
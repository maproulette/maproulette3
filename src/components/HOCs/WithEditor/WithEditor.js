import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  DEFAULT_EDITOR,
  closeEditor,
  editTask,
  isJosmEditor,
  josmHost,
  loadObjectsIntoJOSM,
  viewportToBBox,
  zoomJOSM,
} from "../../../services/Editor/Editor";
import AppErrors from "../../../services/Error/AppErrors";
import { addError } from "../../../services/Error/Error";

/**
 * WithEditor provides an editor prop to its WrappedComponent that contains the
 * current open editor (if any) from the redux store and the user's currently
 * configured editor (or the system default editor if none is configured), as
 * well as functions for interacting with editors. If the embedded Rapid Editor
 * is running, it also provides access to the RapidContext.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const WithEditor = (WrappedComponent) =>
  connect(mapStateToProps, mapDispatchToProps)(WrappedComponent);

export const mapStateToProps = (state) => {
  const userId = state.currentUser?.userId;
  const userEntity = state.entities?.users?.[userId];

  return {
    editor: state.openEditor,
    configuredEditor: userEntity?.settings?.defaultEditor ?? DEFAULT_EDITOR,
    rapidEditorState: state.rapidEditor,
  };
};

export const mapDispatchToProps = (dispatch) => {
  return Object.assign(
    {
      loadObjectsIntoJOSM: (objectIds, asNewLayer) => {
        josmAction(() => loadObjectsIntoJOSM(objectIds, asNewLayer), dispatch);
      },
      zoomJOSM: (bbox) => josmAction(() => zoomJOSM(bbox), dispatch),
      isJosmEditor,
      josmHost,
      viewportToBBox,
    },
    bindActionCreators(
      {
        editTask,
        closeEditor,
      },
      dispatch,
    ),
  );
};

export const josmAction = function (action, dispatch) {
  return action().then((success) => {
    if (!success) {
      dispatch(addError(AppErrors.josm.noResponse));
    }
  });
};

export default WithEditor;

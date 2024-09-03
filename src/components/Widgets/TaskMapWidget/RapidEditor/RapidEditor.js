import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import _get from 'lodash/get';

import { constructRapidURI } from '../../../../services/Editor/Editor.js';
import { replacePropertyTags } from '../../../../hooks/UsePropertyReplacement/UsePropertyReplacement.js';
import AsMappableTask from '../../../../interactions/Task/AsMappableTask.js';
import { DEFAULT_ZOOM } from '../../../../services/Challenge/ChallengeZoom/ChallengeZoom.js';
import WithSearch from '../../../HOCs/WithSearch/WithSearch.js';
import useHash from '../../../../hooks/UseHash.js';
import { SET_RAPIDEDITOR } from '../../../../services/RapidEditor/RapidEditor.js';

/**
 * Generate the initial URL hash for the Rapid editor.
 */
function generateStartingHash({ mapBounds, task, comment }) {
  let replacedComment = comment;
  const asMappableTask = task ? AsMappableTask(task) : null;

  if (asMappableTask) {
    const taskFeatureProperties = asMappableTask.allFeatureProperties();
    if (taskFeatureProperties && Object.keys(taskFeatureProperties).length) {
      replacedComment = replacePropertyTags(comment, taskFeatureProperties, false);
    }

    if (!mapBounds) {
      mapBounds = asMappableTask.calculateCenterPoint();
    }

    if (!mapBounds.zoom) {
      mapBounds.zoom = _get(task, 'parent.defaultZoom', DEFAULT_ZOOM);
    }
  }

  const rapidUrl = constructRapidURI(task, mapBounds, {}, replacedComment);
  const rapidParams = new URL(rapidUrl).hash;
  return rapidParams;
}

const RapidEditor = ({ token, task, mapBounds, comment }) => {
  let dispatch = useDispatch();
  let initialHash = generateStartingHash({ task, mapBounds, comment });
  let [, setHash] = useHash();

  useEffect(() => {
    // when this component unmounts, reset the rapid editor state fields in our Redux store
    return () =>  dispatch({ type: SET_RAPIDEDITOR, context: { isRunning: false, hasUnsavedChanges: false } });
  }, []);

  return (
    <iframe
      id="rapid-container-root"
      style={{ width: '100%', height: '100%' }}
      src={`/rapid-editor.html${initialHash}&token=${token}`}
      onLoad={async (event) => {
        let iframe = event.target;
        iframe.contentWindow.token = token;
        
        let context = iframe.contentWindow.rapidContext;

        // Wait for Rapid to finish initializing
        await context.initAsync();
        
        dispatch({ type: SET_RAPIDEDITOR, context: { isRunning: true } });

        // When Rapid re-renders its map, it updates the URL hash of the iframe window.
        // We listen for this event and update the parent window's hash to match.
        context.systems.map.on('draw', () => {
          setHash(iframe.contentWindow.location.hash);
        });

        // When the user makes an edit, the 'stablechange' event fires. When that happens
        // we update the 'hasUnsavedChanges' property in our Redux store so that the
        // MapRoulette UI can change depending on whether the user has unsaved edits.
        context.systems.editor.on('stablechange', () => {
          let hasUnsavedChanges = context.systems.editor.hasChanges();
          dispatch({ type: SET_RAPIDEDITOR, context: { hasUnsavedChanges }});
        })
      }}
    />
  );
};

export default WithSearch(RapidEditor);

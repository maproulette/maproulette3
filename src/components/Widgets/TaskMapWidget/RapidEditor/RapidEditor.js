import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import _get from 'lodash/get';

import { constructRapidURI } from '../../../../services/Editor/Editor.js';
import { replacePropertyTags } from '../../../../hooks/UsePropertyReplacement/UsePropertyReplacement.js';
import AsMappableTask from '../../../../interactions/Task/AsMappableTask.js';
import { DEFAULT_ZOOM } from '../../../../services/Challenge/ChallengeZoom/ChallengeZoom.js';
import WithSearch from '../../../HOCs/WithSearch/WithSearch.js';
import useHash from '../../../../hooks/UseHash.js';
import { SET_RAPIDEDITOR } from '../../../../services/RapidEditor/RapidEditor.js';
import { FormattedMessage } from 'react-intl';
import messages from './Messages.js';

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
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  let initialHash = generateStartingHash({ task, mapBounds, comment });
  let [, setHash] = useHash();

  useEffect(() => {
    // when this component unmounts, reset the rapid editor state fields in our Redux store
    const cleanup = () => {
      dispatch({ type: SET_RAPIDEDITOR, context: { isRunning: false, hasUnsavedChanges: false } });
    };
    return cleanup;
  }, []);

  if (process.env.REACT_APP_OSM_API_SERVER === "https://api.openstreetmap.org") {
    // Only pass auth token to Rapid if it's for the production OSM API (not the dev API)
    // since Rapid assumes any token it's given is valid on api.openstreetmap.org.
    // See: https://github.com/facebook/Rapid/issues/1341

    // NOTE: the assumption here is that REACT_APP_OSM_API_SERVER is the same as
    // the maproulette-backend's config.osm.server; fix your configs if they differ!
    initialHash += `&token=${token}`;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 1000 }}>
          <FormattedMessage {...messages.loadingRapid} />
        </div>
      )}
      <iframe
        id="rapid-container-root"
        style={{ width: '100%', height: '100%' }}
        src={`/static/rapid-editor.html${initialHash}`}
        onLoad={async (event) => {
          let iframe = event.target;
          iframe.contentWindow.token = token;

          let context = iframe.contentWindow.rapidContext;

          if (!context) {
            console.warn(
              "Embedded Rapid iframe finished loading but no Rapid Context found afterwards; "
              + "Rapid may not have initialized successfully."
            );
            return;
          }

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
          });

          setIsLoading(false);
        }}
      />
    </div>
  );
};

export default WithSearch(RapidEditor);

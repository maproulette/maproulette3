import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import _get from 'lodash/get';

import { constructRapidURI } from '../../../../services/Editor/Editor';
import { replacePropertyTags } from '../../../../hooks/UsePropertyReplacement/UsePropertyReplacement';
import AsMappableTask from '../../../../interactions/Task/AsMappableTask';
import { DEFAULT_ZOOM } from '../../../../services/Challenge/ChallengeZoom/ChallengeZoom';
import WithSearch from '../../../HOCs/WithSearch/WithSearch';
import useHash from '../../../../hooks/UseHash';
import { SET_RAPIDEDITOR } from '../../../../services/RapidEditor/RapidEditor';
import BusySpinner from '../../../BusySpinner/BusySpinner';

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
  const [error, setError] = useState(null);
  let initialHash = generateStartingHash({ task, mapBounds, comment });
  let [, setHash] = useHash();

  useEffect(() => {
    // when this component unmounts, reset the rapid editor state fields in our Redux store
    const cleanup = () => {
      dispatch({ type: SET_RAPIDEDITOR, context: { isRunning: false, hasUnsavedChanges: false } });
    };
    return cleanup;
  }, []);

  if (import.meta.env.VITE_OSM_API_SERVER === "https://api.openstreetmap.org") {
    // Only pass auth token to Rapid if it's for the production OSM API (not the dev API)
    // since Rapid assumes any token it's given is valid on api.openstreetmap.org.
    // See: https://github.com/facebook/Rapid/issues/1341

    // NOTE: the assumption here is that VITE_OSM_API_SERVER is the same as
    // the maproulette-backend's config.osm.server; fix your configs if they differ!
    initialHash += `&token=${token}`;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {isLoading && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <BusySpinner xlarge />
        </div>
      )}
      {error && (
        <div>Error: {error.message}</div>
      )}
      <iframe
        id="rapid-container-root"
        style={{ width: '100%', height: '100%' }}
        src={`/static/rapid-editor.html${initialHash}`}
        onLoad={async (event) => {
          let iframe = event.target;

          try {
            let context = await iframe.contentWindow.setupRapid();

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
          } catch (err) {
            setError(err);
          } finally {
            setIsLoading(false);
          }
        }}
      />
    </div>
  );
};

export default WithSearch(RapidEditor);

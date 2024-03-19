//credit https://github.com/hotosm/tasking-manager/blob/develop/frontend/src/components/rapidEditor.js for implementation guidance

import React, { useEffect, useState } from 'react';
import _get from 'lodash/get'
import { UseRouter } from '../../../../hooks/UseRouter/UseRouter.js';
import { constructRapidURI } from '../../../../services/Editor/Editor.js';
import { replacePropertyTags } from '../../../../hooks/UsePropertyReplacement/UsePropertyReplacement.js';
import AsMappableTask from '../../../../interactions/Task/AsMappableTask.js';
import WithSearch from '../../../HOCs/WithSearch/WithSearch.js';
import { DEFAULT_ZOOM } from '../../../../services/Challenge/ChallengeZoom/ChallengeZoom.js';
import { useDispatch, useSelector } from 'react-redux';
import rapidPackage from '@rapideditor/rapid/package.json';

const { version: rapidVersion, name: rapidName } = rapidPackage;
const baseCdnUrl = `https://cdn.jsdelivr.net/npm/${rapidName}@~${rapidVersion}/dist/`;

/**
 * Resize rapid
 * @param {Context} rapidContext The rapid context to resize
 * @type {import('@rapideditor/rapid').Context} Context
 */
function resizeRapid(rapidContext) {
  // Get rid of black bars when toggling the TM sidebar
  const uiSystem = rapidContext?.systems?.ui;
  if (uiSystem?.started) {
    uiSystem.resize();
  }
}

/**
 * Check if there are changes
 * @param changes The changes to check
 * @returns {boolean} {@code true} if there are changes
 */
function thereAreChanges(changes) {
  return changes.modified.length || changes.created.length || changes.deleted.length;
}

/**
 * Update the disable state for the sidebar map actions
 * @param {function(boolean)} setDisable
 * @param {EditSystem} editSystem The edit system
 * @type {import('@rapideditor/rapid/modules').EditSystem} EditSystem
 */
function updateDisableState(setDisable, editSystem) {
  if (thereAreChanges(editSystem.changes())) {
    setDisable(true);
  } else {
    setDisable(false);
  }
}

const RapidEditor = ({
  setDisable,
  locale,
  token,
  task,
  mapBounds,
  comment
}) => {
  const router = UseRouter()
  const dispatch = useDispatch();
  const [rapidLoaded, setRapidLoaded] = useState(window.Rapid !== undefined);
  const { context, dom } = useSelector((state) => state.rapidEditor.rapidContext);
  const windowInit = typeof window !== 'undefined';

  useEffect(() => {
    if (!rapidLoaded && !context) {
      // Add the style element
      const style = document.createElement('link');
      style.setAttribute('type', 'text/css');
      style.setAttribute('rel', 'stylesheet');
      style.setAttribute('href', baseCdnUrl + 'rapid.css');
      document.head.appendChild(style);
      // Now add the editor
      const script = document.createElement('script');
      script.src = baseCdnUrl + 'rapid.js';
      script.async = true;
      script.onload = () => setRapidLoaded(true);
      document.body.appendChild(script);
    } else if (context && !rapidLoaded) {
      setRapidLoaded(true);
    }
  }, [rapidLoaded, setRapidLoaded, context]);

  useEffect(() => {
    return () => {
      dispatch({ type: 'SET_VISIBILITY', isVisible: true });
    };
  });

  useEffect(() => {
    if (windowInit && context === null && rapidLoaded) {
      /* This is used to avoid needing to re-initialize Rapid on every page load -- this can lead to jerky movements in the UI */
      const dom = document.createElement('div');
      dom.className = 'w-100 vh-minus-69-ns';
      dom.style = { height: "100%" }
      // we need to keep Rapid context on redux store because Rapid works better if
      // the context is not restarted while running in the same browser session
      // Unfortunately, we need to recreate the context every time we recreate the rapid-container dom node.
      const context = new window.Rapid.Context();
      context.embed(true);
      context.containerNode = dom;
      context.assetPath = baseCdnUrl;
      context.apiConnections = [
        {
          url: process.env.REACT_APP_OSM_SERVER,
          apiUrl: 'https://api.openstreetmap.org',
          access_token: token,
        },
      ];
      dispatch({ type: 'SET_RAPIDEDITOR', context: { context, dom } });
    }
  }, [windowInit, rapidLoaded, context, dispatch]);

  useEffect(() => {
    if (context) {
      context.locale = locale;
    }
  }, [context, locale]);

  useEffect(() => {
    resizeRapid(context);
    return () => resizeRapid(context);
  }, [context]);

  useEffect(() => {
    const containerRoot = document.getElementById('rapid-container-root');
    const editListener = () => updateDisableState(setDisable, context.systems.edits);
    if (context && dom) {

      containerRoot.appendChild(dom);
      let promise;
      if (context?.systems?.ui !== undefined) {
        resizeRapid(context);
        promise = Promise.resolve();
      } else {
        promise = context.initAsync();
      }

      promise.then(() => {
        const editSystem = context.systems.editor;

        editSystem.on('change', editListener);
        editSystem.on('reset', editListener);
      });
    }
    return () => {
      if (containerRoot?.childNodes && dom in containerRoot.childNodes) {
        document.getElementById('rapid-container-root')?.removeChild(dom);
      }
      if (context?.systems?.edits) {
        const editSystem = context.systems.edits;
        editSystem.off('change', editListener);
        editSystem.off('reset', editListener);
      }
    };
  }, [dom, context, setDisable]);

  useEffect(() => {
    if (context && task?.id) {
      if (mapBounds && task?.id) {
        if (!mapBounds.zoom) {
          mapBounds.zoom = _get(task, "parent.defaultZoom", DEFAULT_ZOOM)
        }

        let replacedComment = comment

        const asMappableTask = task ? AsMappableTask(task) : null
        if (context && comment) {
          if(asMappableTask) {
            const taskFeatureProperties = asMappableTask.allFeatureProperties()
            if(taskFeatureProperties && Object.keys(taskFeatureProperties).length) {
              replacedComment = replacePropertyTags(comment, taskFeatureProperties, false)
            } 
          }
        }

        const rapidUrl = constructRapidURI(task, mapBounds, {}, replacedComment)
        const rapidParams = rapidUrl.split('#')[1]
        const updatedSearch = window.location.search.split('#')[0] + '#' + rapidParams
        router.replace({ search: updatedSearch })
      }
    }
  }, [task?.id, context]);

  useEffect(() => {
    if (context && token) {
      context.preauth = {
        url: process.env.REACT_APP_OSM_SERVER,
        apiUrl: 'https://api.openstreetmap.org',
        access_token: token,
      };
      context.apiConnections = [context.preauth];
    }
  }, [context, token]);

  return <div className="w-100" style={{ height: "100%" }} id="rapid-container-root"></div>;
}

export default WithSearch(RapidEditor);

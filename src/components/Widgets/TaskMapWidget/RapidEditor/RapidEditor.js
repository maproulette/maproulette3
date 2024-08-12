//credit https://github.com/hotosm/tasking-manager/blob/develop/frontend/src/components/rapidEditor.js for implementation guidance

import React, { useEffect, useState } from 'react';
import _get from 'lodash/get'
import { constructRapidURI } from '../../../../services/Editor/Editor.js';
import { replacePropertyTags } from '../../../../hooks/UsePropertyReplacement/UsePropertyReplacement.js';
import AsMappableTask from '../../../../interactions/Task/AsMappableTask.js';
import { DEFAULT_ZOOM } from '../../../../services/Challenge/ChallengeZoom/ChallengeZoom.js';
import { useDispatch, useSelector } from 'react-redux';
import rapidPackage from '@rapideditor/rapid/package.json';
import WithSearch from '../../../HOCs/WithSearch/WithSearch.js';

const { version: rapidVersion, name: rapidName } = rapidPackage;
const baseCdnUrl = `https://cdn.jsdelivr.net/npm/${rapidName}@~${rapidVersion}/dist/`;

/**
 * Check if two URL search parameters are semantically equal
 * @param {URLSearchParams} first
 * @param {URLSearchParams} second
 * @return {boolean} true if they are semantically equal
 */
function equalsUrlParameters(first, second) {
  if (first.size === second.size) {
    for (const [key, value] of first) {
      if (!second.has(key) || second.get(key) !== value) {
        return false;
      }
    }
    return true;
  }
  return false;
}

/**
 * Update the URL (this also fires a hashchange event)
 * @param {URLSearchParams} hashParams the URL hash parameters
 */
function updateUrl(hashParams) {
  const oldUrl = window.location.href;
  const newUrl = window.location.pathname + window.location.search + '#' + hashParams.toString();
  window.history.pushState(null, '', newUrl);
  window.dispatchEvent(
    new HashChangeEvent('hashchange', {
      newUrl: newUrl,
      oldUrl: oldUrl,
    }),
  );
}

/**
 * Generate the starting hash for the project
 * @param {string | undefined} comment The comment to use
 * @param {Array.<String> | undefined} presets The presets
 * @param {string | undefined} gpxUrl The task boundaries
 * @param {boolean | undefined} powerUser if the user should be shown advanced options
 * @param {string | undefined} imagery The imagery to use for the task
 * @return {module:url.URLSearchParams | boolean} the new URL search params or {@code false} if no parameters changed
 */
function generateStartingHash({ mapBounds, task, comment }) {
  let replacedComment = comment
  const asMappableTask = task ? AsMappableTask(task) : null

  if (asMappableTask) {
    const taskFeatureProperties = asMappableTask.allFeatureProperties()
    if(taskFeatureProperties && Object.keys(taskFeatureProperties).length) {
      replacedComment = replacePropertyTags(comment, taskFeatureProperties, false)
    }

    if (!mapBounds) {
      mapBounds = {
        ...asMappableTask.calculateCenterPoint()
      }
    }

    if (!mapBounds.zoom) {
      mapBounds.zoom = _get(task, "parent.defaultZoom", DEFAULT_ZOOM)
    }
  }

  const rapidUrl = constructRapidURI(task, mapBounds, {}, replacedComment)
  const rapidParams = rapidUrl.split('#')[1]

  if (equalsUrlParameters(new URLSearchParams(rapidParams), new URLSearchParams(window.location.hash.substring(1)))) {
    return false;
  }

  return rapidParams
}

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
  comment,
  showSidebar,
  presets,
  gpxUrl,
  powerUser,
  imagery
}) => {
  const dispatch = useDispatch();
  const [rapidLoaded, setRapidLoaded] = useState(window.Rapid !== undefined);
  const { context, dom } = useSelector((state) => state.rapidEditor);
  const windowInit = typeof window !== 'undefined';

  // This significantly reduces build time _and_ means different TM instances can share the same download of Rapid.
  // Unfortunately, Rapid doesn't use a public CDN itself, so we cannot reuse that.
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
      // setup the context
      context.locale = locale;
    }
  }, [context, locale]);

  // This ensures that Rapid has the correct map size
  useEffect(() => {
    // This might be a _slight_ efficiency improvement by making certain that Rapid isn't painting unneeded items
    resizeRapid(context);
    // This is the only bit that is *really* needed -- it prevents black bars when hiding the sidebar.
    return () => resizeRapid(context);
  }, [showSidebar, context]);

  useEffect(() => {
    if (task?.id) {
      const newParams = generateStartingHash({ mapBounds, task, comment });
      if (newParams) {
        updateUrl(newParams);
      }
    }
  }, [comment, presets, gpxUrl, powerUser, imagery]);

  useEffect(() => {
    if (task?.id) {
      const newParams = generateStartingHash({ task, comment });
      if (newParams) {
        updateUrl(newParams);
      }
    }
  }, [task?.id]);

  useEffect(() => {
    const containerRoot = document.getElementById('rapid-container-root');
    const editListener = () => updateDisableState(setDisable, context.systems.edits);
    if (context && dom) {
      containerRoot.appendChild(dom);
      // init the ui or restart if it was loaded previously
      let promise;
      if (context?.systems?.ui !== undefined) {
        // Currently commented out in Rapid source code (2023-07-20)
        // RapidContext.systems.ui.restart();
        resizeRapid(context);
        promise = Promise.resolve();
      } else {
        promise = context.initAsync();
      }

      /* Perform tasks after Rapid has started up */
      promise.then(() => {
        /* Keep track of edits */
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
    if (context?.save) {
      return () => context.save();
    }
  }, [context]);

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

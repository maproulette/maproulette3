import React, { useEffect, useState } from 'react';
import _get from 'lodash/get'
import * as RapiD from '../../../../../node_modules/RapiD/dist/rapid.legacy.min.js';
import '../../../../../node_modules/RapiD/dist/rapid.css';
import { UseRouter } from '../../../../hooks/UseRouter/UseRouter.js';
import { constructRapidURI } from '../../../../services/Editor/Editor.js';
import { replacePropertyTags } from '../../../../hooks/UsePropertyReplacement/UsePropertyReplacement.js';
import AsMappableTask from '../../../../interactions/Task/AsMappableTask.js';
import WithSearch from '../../../HOCs/WithSearch/WithSearch.js';
import { DEFAULT_ZOOM } from '../../../../services/Challenge/ChallengeZoom/ChallengeZoom.js';

const RapidEditor = ({
  comment,
  imagery,
  powerUser = false,
  presets,
  setDisable,
  locale,
  token,
  mapBounds,
  task
}) => {
  const [customImageryIsSet, setCustomImageryIsSet] = useState(false);
  const [RapiDContext, setRapiDContext] = useState(null);
  const customSource =
    RapiDContext && RapiDContext.background() && RapiDContext.background().findSource('custom');
  const router = UseRouter()

  const asMappableTask = task ? AsMappableTask(task) : null

  useEffect(() => {
    if (!customImageryIsSet && imagery && customSource) {
      if (imagery.startsWith('http')) {
        RapiDContext.background().baseLayerSource(customSource.template(imagery));
        setCustomImageryIsSet(true);
        // this line is needed to update the value on the custom background dialog
        window.iD.prefs('background-custom-template', imagery);
      } else {
        const imagerySource = RapiDContext.background().findSource(imagery);
        if (imagerySource) {
          RapiDContext.background().baseLayerSource(imagerySource);
        }
      }
    }
  }, [customImageryIsSet, imagery, RapiDContext, customSource]);

  useEffect(() => {
    if (RapiDContext === null) {
      setRapiDContext(window.iD.coreContext())
    }
  }, [RapiDContext]);

  useEffect(() => {
    if (RapiDContext && comment) {
      if(asMappableTask) {
        const taskFeatureProperties = asMappableTask.allFeatureProperties()
        if(taskFeatureProperties && Object.keys(taskFeatureProperties).length) {
          const replacedComment = replacePropertyTags(comment, taskFeatureProperties, false)
          RapiDContext.defaultChangesetComment(replacedComment);
        } else {
          RapiDContext.defaultChangesetComment(comment);
        } 
      } else {
        RapiDContext.defaultChangesetComment(comment);
      } 
    }
  }, [comment, RapiDContext, asMappableTask]);

  useEffect(() => {
    if (token && locale && RapiD && RapiDContext && task?.id) {
      if (mapBounds && task?.id) {
        if (!mapBounds.zoom) {
          mapBounds.zoom = _get(task, "parent.defaultZoom", DEFAULT_ZOOM)
        }
        const rapidUrl = constructRapidURI(task, mapBounds, {})
        const rapidParams = rapidUrl.split('#')[1]
        const updatedSearch = window.location.search.split('#')[0] + '#' + rapidParams
        router.replace({ search: updatedSearch })
      }

      // if presets is not a populated list we need to set it as null
      try {
        if (presets.length) {
          window.iD.presetManager.addablePresetIDs(presets);
        } else {
          window.iD.presetManager.addablePresetIDs(null);
        }
      } catch (e) {
        window.iD.presetManager.addablePresetIDs(null);
      }

      // setup the context
      RapiDContext.embed(true)
        .assetPath('/static/rapid/')
        .locale(locale)
        .containerNode(document.getElementById('rapid-container'));
      // init the ui or restart if it was loaded previously
      if (RapiDContext.ui() !== undefined) {
        RapiDContext.reset();
        RapiDContext.ui().restart();
      } else {
        RapiDContext.init();
      }

      RapiDContext.rapidContext().showPowerUser = powerUser;

      let osm = RapiDContext.connection();
      const auth = {
        url: process.env.REACT_APP_OSM_SERVER,
        access_token: token,
      };
      osm.switch(auth);

      const thereAreChanges = (changes) =>
        changes.modified.length || changes.created.length || changes.deleted.length;

      RapiDContext.history().on('change', () => {
        if (thereAreChanges(RapiDContext.history().changes())) {
          setDisable(true);
        } else {
          setDisable(false);
        }
      });
    }
  }, [RapiDContext, task?.id]);

  return <div className="w-100 vh-minus-69-ns" id="rapid-container"></div>;
}

export default WithSearch(RapidEditor)

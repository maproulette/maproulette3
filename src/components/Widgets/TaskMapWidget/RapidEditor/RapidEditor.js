import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import _get from 'lodash/get'
import * as RapiD from '../../../../../node_modules/RapiD/dist/rapid.legacy.min.js';
import '../../../../../node_modules/RapiD/dist/rapid.css';
import { UseRouter } from '../../../../hooks/UseRouter/UseRouter.js';
import { constructRapidURI } from '../../../../services/Editor/Editor.js';
import WithSearch from '../../../HOCs/WithSearch/WithSearch.js';
import { DEFAULT_ZOOM } from '../../../../services/Challenge/ChallengeZoom/ChallengeZoom.js';

const RapidEditor = ({
  comment,
  imagery,
  gpxUrl,
  powerUser = false,
  presets,
  setDisable,
  locale,
  token,
  mapBounds,
  task
}) => {
  const dispatch = useDispatch();
  const [customImageryIsSet, setCustomImageryIsSet] = useState(false);
  const [RapiDContext, setRapiDContext] = useState(null);
  const customSource =
    RapiDContext && RapiDContext.background() && RapiDContext.background().findSource('custom');
  const router = UseRouter()

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
  }, [RapiDContext, dispatch]);

  useEffect(() => {
    if (mapBounds) {
      if (!mapBounds.zoom) {
        mapBounds.zoom = _get(task, "parent.defaultZoom", DEFAULT_ZOOM)
      }
      const rapidUrl = constructRapidURI(task, mapBounds, {})
      const rapidParams = rapidUrl.split('#')[1]
      const updatedSearch = window.location.search.split('#')[0] + '#' + rapidParams
      router.replace({ search: updatedSearch })
    }
  }, [mapBounds])

  useEffect(() => {
    if (RapiDContext && comment) {
      RapiDContext.defaultChangesetComment(comment);
    }
  }, [comment, RapiDContext]);

  useEffect(() => {
    console.log(token, locale, RapiD, RapiDContext)
    if (token && locale && RapiD && RapiDContext) {
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
      if (gpxUrl) {
        //RapiDContext.layers().layer('data').url(gpxUrl, '.gpx');
        RapiDContext.rapidContext().setTaskExtentByGpxData(gpxUrl);
      }

      RapiDContext.rapidContext().showPowerUser = powerUser;

      let osm = RapiDContext.connection();
      const auth = {
        url: 'https://master.apis.dev.openstreetmap.org/',
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
  }, [RapiDContext]);

  return <div className="w-100 vh-minus-69-ns" id="rapid-container"></div>;
}

export default WithSearch(RapidEditor)

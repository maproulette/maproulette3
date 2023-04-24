import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as RapiD from '../../../../node_modules/RapiD/dist/iD.legacy.js';
import '../../../../node_modules/RapiD/dist/RapiD.css';

const OSM_CLIENT_ID = process.env.REACT_APP_OSM_CLIENT_ID
const OSM_CLIENT_SECRET = process.env.REACT_APP_OSM_CLIENT_SECRET
const OSM_REDIRECT_URI = process.env.REACT_APP_URL
const OSM_SERVER_URL = process.env.REACT_APP_OSM_SERVER

export default function RapidEditor({
  comment,
  imagery,
  gpxUrl,
  powerUser = false,
  presets,
  setDisable,
  locale,
  token
}) {
  const dispatch = useDispatch();
  const [customImageryIsSet, setCustomImageryIsSet] = useState(false);
  const [RapiDContext, setRapiDContext] = useState(null);
  const customSource =
    RapiDContext && RapiDContext.background() && RapiDContext.background().findSource('custom');

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
      //dispatch({ type: 'SET_RAPIDEDITOR', context: window.iD.coreContext() });
    }
  }, [RapiDContext, dispatch]);

  useEffect(() => {
    if (RapiDContext && comment) {
      RapiDContext.defaultChangesetComment(comment);
    }
  }, [comment, RapiDContext]);

  useEffect(() => {
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
        .setsDocumentTitle(false)
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
        url: 'https://www.openstreetmap.org',
        client_id: 'nmqRe5oIVOMNqvagH11iTB-mCC9M9nKkpjukP-RBdi8',
        client_secret: 'nt0ha1Qr4qHiMq3MnLVlmgN6qBgP5UZyEhZD63edCV0',
        redirect_uri: OSM_REDIRECT_URI,
        access_token: token,
      };
      console.log(auth)
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

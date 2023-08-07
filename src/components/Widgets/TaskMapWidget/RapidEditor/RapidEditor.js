import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as RapiD from '../../../../../node_modules/RapiD/dist/rapid.legacy.js';
// import '../../../../../node_modules/RapiD/dist/rapid.css';

// const OSM_CLIENT_ID = process.env.REACT_APP_OSM_CLIENT_ID
// const OSM_CLIENT_SECRET = process.env.REACT_APP_OSM_CLIENT_SECRET
const OSM_REDIRECT_URI = process.env.REACT_APP_URL
// const OSM_SERVER_URL = process.env.REACT_APP_OSM_SERVER

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
  // const dispatch = useDispatch();
  // const [customImageryIsSet, setCustomImageryIsSet] = useState(false);
  // const [RapiDContext, setRapiDContext] = useState(null);
  // const customSource =
  //   RapiDContext && RapiDContext.background() && RapiDContext.background().findSource('custom');

  // useEffect(() => {
  //   if (!customImageryIsSet && imagery && customSource) {
  //     if (imagery.startsWith('http')) {
  //       RapiDContext.background().baseLayerSource(customSource.template(imagery));
  //       setCustomImageryIsSet(true);
  //       // this line is needed to update the value on the custom background dialog
  //       window.iD.prefs('background-custom-template', imagery);
  //     } else {
  //       const imagerySource = RapiDContext.background().findSource(imagery);
  //       if (imagerySource) {
  //         RapiDContext.background().baseLayerSource(imagerySource);
  //       }
  //     }
  //   }
  // }, [customImageryIsSet, imagery, RapiDContext, customSource]);

  // useEffect(() => {
  //   if (RapiDContext === null) {
  //     setRapiDContext(window.iD.coreContext())
  //     //dispatch({ type: 'SET_RAPIDEDITOR', context: window.iD.coreContext() });
  //   }
  // }, [RapiDContext, dispatch]);

  // useEffect(() => {
  //   if (RapiDContext && comment) {
  //     RapiDContext.defaultChangesetComment(comment);
  //   }
  // }, [comment, RapiDContext]);

  // useEffect(() => {
  //   console.log(token, locale, RapiD, RapiDContext)
  //   if (token && locale && RapiD && RapiDContext) {
  //     // if presets is not a populated list we need to set it as null
  //     try {
  //       if (presets.length) {
  //         window.iD.presetManager.addablePresetIDs(presets);
  //       } else {
  //         window.iD.presetManager.addablePresetIDs(null);
  //       }
  //     } catch (e) {
  //       window.iD.presetManager.addablePresetIDs(null);
  //     }

  //     // setup the context
  //     debugger;
  //     RapiDContext.embed(true)
  //       .assetPath('/static/rapid/')
  //       .locale(locale)
  //       .setsDocumentTitle(false)
  //       .containerNode(document.getElementById('rapid-container'));
  //     // init the ui or restart if it was loaded previously
  //     if (RapiDContext.ui() !== undefined) {
  //       RapiDContext.reset();
  //       RapiDContext.ui().restart();
  //     } else {
  //       RapiDContext.init();
  //     }
  //     if (gpxUrl) {
  //       //RapiDContext.layers().layer('data').url(gpxUrl, '.gpx');
  //       RapiDContext.rapidContext().setTaskExtentByGpxData(gpxUrl);
  //     }

  //     RapiDContext.rapidContext().showPowerUser = powerUser;

  //     let osm = RapiDContext.connection();
  //     const auth = {
  //       url: 'https://master.apis.dev.openstreetmap.org/',
  //       client_id: 'RflKMjhJsuY5ktIYzuaVJ5JMOasjwRDtV0mq2OLPaxk',
  //       client_secret: 'MtLDgWWn-KvdWCFbmVf54EVP2KRP_B8RWEzNbJwghys',
  //       redirect_uri: OSM_REDIRECT_URI,
  //       access_token: token,
  //     };
  //     console.log(auth)
  //     osm.switch(auth);

  //     const thereAreChanges = (changes) =>
  //       changes.modified.length || changes.created.length || changes.deleted.length;

  //     RapiDContext.history().on('change', () => {
  //       if (thereAreChanges(RapiDContext.history().changes())) {
  //         setDisable(true);
  //       } else {
  //         setDisable(false);
  //       }
  //     });
  //   }
  // }, [RapiDContext]);

  return <div className="w-100 vh-minus-69-ns" id="rapid-container"></div>;
}
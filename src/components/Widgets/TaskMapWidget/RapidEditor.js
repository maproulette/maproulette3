import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as RapiD from '../../../../node_modules/RapiD/dist/iD.legacy.js';
import '../../../../node_modules/RapiD/dist/iD.css';

const OSM_CLIENT_ID = 'rab7bN3lXn09oWycy5PJvcdX2hkeavh2nFh2ySIP'
const OSM_CLIENT_SECRET = 'ZAGZhF9BJRzgAup6asjyIskz7M0oayc1PWJYoDKu'
const OSM_REDIRECT_URI = 'http://127.0.0.1:3000'
const OSM_SERVER_URL = 'https://master.apis.dev.openstreetmap.org'

export default function RapidEditor({
  setDisable,
  comment,
  presets,
  imagery,
  gpxUrl,
  powerUser = false,
}) {
  const currentUserId = useSelector((state) => state.currentUser.userId);
  const osmOauthToken = useSelector((state) => state.entities.users[currentUserId].osmProfile.requestToken.token);
  const locale = 'en';
  const [customImageryIsSet, setCustomImageryIsSet] = useState(false);
  const windowInit = typeof window !== undefined;
  const customSource =
    RapiDContext && RapiDContext.background() && RapiDContext.background().findSource('custom');

  const [isVisible, setIsVisible] = useState(false);
  const [RapiDContext, setRapiDContext] = useState(null);

  console.log(isVisible);

  console.log("RapiDContext", RapiDContext)

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
    return () => {
      setIsVisible(true)
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (windowInit) {
      setIsVisible(false)
      if (RapiDContext === null) {
        // we need to keep iD context on redux store because iD works better if
        // the context is not restarted while running in the same browser session
        setRapiDContext(window.iD.coreContext())
      }
    }
  }, [windowInit, RapiDContext]);

  useEffect(() => {
    if (RapiDContext && comment) {
      RapiDContext.defaultChangesetComment(comment);
    }
  }, [comment, RapiDContext]);

  useEffect(() => {
    if (osmOauthToken && locale && RapiD && RapiDContext) {
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
        RapiDContext.layers().layer('data').url(gpxUrl, '.gpx');
      }

      RapiDContext.rapidContext().showPowerUser = powerUser;

      let osm = RapiDContext.connection();
      const auth = {
        url: OSM_SERVER_URL,
        client_id: OSM_CLIENT_ID,
        client_secret: OSM_CLIENT_SECRET,
        redirect_uri: OSM_REDIRECT_URI,
        access_token: osmOauthToken,
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
  }, [osmOauthToken, RapiDContext, setDisable, presets, locale, gpxUrl, powerUser]);

  return <div className="w-100 vh-minus-69-ns" id="rapid-container"></div>;
}

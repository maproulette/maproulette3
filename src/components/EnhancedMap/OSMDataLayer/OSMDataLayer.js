import React, { useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import _isEqual from 'lodash/isEqual'
import _get from 'lodash/get'
import _omit from 'lodash/omit'
import AsStylableLayer from '../../../interactions/LeafletLayer/AsStyleableLayer'
import PropertyList from '../PropertyList/PropertyList'
import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../../../tailwind.config.js'
import layerMessages from '../LayerToggle/Messages'
import { useIntl } from 'react-intl'
import './OSMDataLayer.css'

const colors = resolveConfig(tailwindConfig).theme.colors
const HIGHLIGHT_STYLE = {
  color: colors.gold,
  fillColor: colors.gold,
  weight: 7,
}

const OSMDataLayer = (props) => {
  const map = useMap()
  const intl = useIntl()
  const layerGroupRef = useRef(null)
  const lastZoomRef = useRef(props.zoom)

  const popupContent = (layer, onBack) => {
    const properties = layer.feature.properties
    const header = (
      <a target="_blank"
         rel="noopener noreferrer"
         href={`https://www.openstreetmap.org/${properties.type}/${properties.id}`}
      >
        {properties.type} {properties.id}
      </a>
    )

    const contentElement = document.createElement('div')
   
    ReactDOM.render(
      <PropertyList
        header={header}
        featureProperties={_omit(layer.feature.properties, ['id', 'type'])}
        onBack={onBack}
      />,
      contentElement
    )
    contentElement.classList.add('osm-popup-content')
    return contentElement
  }

  const generateElementStyles = (props) => {
    const globalStyleOptions = {
      weight: props.zoom >= 18 ? 3 : (props.zoom > 15 ? 2 : 1),
    }

    return {
      way: Object.assign({}, globalStyleOptions, { color: colors['orange-jaffa'] }),
      area: Object.assign({}, globalStyleOptions, { color: colors['pink-light'] }),
      node: Object.assign({}, globalStyleOptions, {
        color: '#C20534',
        radius: props.zoom >= 18 ? 10 : 5,
      }),
      changeset: Object.assign({}, globalStyleOptions, { color: colors.red }),
    }
  }

  const generateLayer = (props) => {
    const layerGroup = new L.OSM.DataLayer(props.xmlData, {
      styles: generateElementStyles(props),
      showNodes: props.showOSMElements.nodes,
      showWays: props.showOSMElements.ways,
      showAreas: props.showOSMElements.areas,
      pane: _get(props, 'leaflet.pane'),
    })

    layerGroup.eachLayer(layer => {
      layer.options.mrLayerLabel = props.mrLayerLabel
      layer.options.fill = false
      layer.options.pane = layerGroup.options.pane
      layer.originalToGeoJSON = layer.toGeoJSON
      layer.toGeoJSON = precision => {
        const geojson = layer.originalToGeoJSON(precision)
        return {
          ...geojson.geometry,
          properties: layer.feature.properties,
        }
      }

      if (props.externalInteractive) {
        const styleableLayer = AsStylableLayer(layer)
        layer.on('mr-external-interaction', ({map, latlng, onBack}) => {
          styleableLayer.popStyle('mr-external-interaction:start-preview')
          const popup = L.popup({}, layer).setLatLng(latlng).setContent(popupContent(layer, onBack))
          styleableLayer.pushStyle(Object.assign({}, HIGHLIGHT_STYLE))
          popup.on('remove', () => styleableLayer.popStyle())
          popup.openOn(map)
        })
        layer.on('mr-external-interaction:start-preview', () => {
          styleableLayer.pushStyle(
            Object.assign({}, HIGHLIGHT_STYLE),
            'mr-external-interaction:start-preview'
          )
        })
        layer.on('mr-external-interaction:end-preview', () => {
          styleableLayer.popStyle('mr-external-interaction:start-preview')
        })
      }
    })

    if (!props.externalInteractive) {
      layerGroup.bindPopup(popupContent)
    }

    return layerGroup
  }

  useEffect(() => {
    const layerGroup = generateLayer({
      mrLayerLabel: intl.formatMessage(layerMessages.showOSMDataLabel),
      ...props,
    })
    layerGroupRef.current = layerGroup
    layerGroup.addTo(map)

    return () => {
      map.removeLayer(layerGroup)
    }
  }, [])

  useEffect(() => {
    if (props.zoom !== lastZoomRef.current ||
        !_isEqual(props.showOSMElements, props.showOSMElements)) {
      layerGroupRef.current.clearLayers()
      const newLayers = generateLayer(props)
      newLayers.eachLayer(layer => layerGroupRef.current.addLayer(layer))
      lastZoomRef.current = props.zoom
    }
  }, [props.zoom, props.showOSMElements])

  return null
}

export default OSMDataLayer

// The below code (with a couple minor linter fixes) comes from the
// [leaflet-osm](https://github.com/openstreetmap/leaflet-osm) project's
// `leaflet-osm.js` file. Because that project's npm package hasn't been
// updated in ages despite ongoing improvements to the codebase, and given that
// the package is just one file, it's simpler to just pull the code in here
// than fight with all the yarn errors resulting from the old npm
// configuration. Todo: create a separate react-leaflet npm package for
// leaflet-osm
L.OSM = {};
L.OSM.DataLayer = L.FeatureGroup.extend({
  options: {
    showNodes: true,
    showWays: true,
    showAreas: true,
    showChangesets: true,
    areaTags: ['area', 'building', 'leisure', 'tourism', 'ruins', 'historic', 'landuse', 'military', 'natural', 'sport'],
    uninterestingTags: ['source', 'source_ref', 'source:ref', 'history', 'attribution', 'created_by', 'tiger:county', 'tiger:tlid', 'tiger:upload_uuid'],
    styles: {}
  },

  initialize: function (xml, options) {
    L.Util.setOptions(this, options);

    L.FeatureGroup.prototype.initialize.call(this);

    if (xml) {
      this.addData(xml);
    }
  },

  addData: function (features) {
    if (!(features instanceof Array)) {
      features = this.buildFeatures(features);
    }

    for (var i = 0; i < features.length; i++) {
      var feature = features[i], layer;

      if (feature.type === "changeset") {
        if (this.options.showChangesets) {
          layer = L.rectangle(feature.latLngBounds, this.options.styles.changeset);
        }
      } else if (feature.type === "node") {
        if (this.options.showNodes) {
          layer = L.circleMarker(feature.latLng, this.options.styles.node);
        }
      } else {
        var latLngs = new Array(feature.nodes.length);

        for (var j = 0; j < feature.nodes.length; j++) {
          latLngs[j] = feature.nodes[j].latLng;
        }

        if (this.isWayArea(feature)) {
          if (this.options.showAreas) {
            latLngs.pop(); // Remove last == first.
            layer = L.polygon(latLngs, this.options.styles.area);
          }
        } else {
          if (this.options.showWays) {
            layer = L.polyline(latLngs, this.options.styles.way);
          }
        }
      }

      if (layer) {
        layer.addTo(this);
        layer.feature = {
          properties: {
            id: feature.id,
            type: feature.type,
            ...feature.tags,
          }
        }
      }
    }
  },

  buildFeatures: function (xml) {
    var features = L.OSM.getChangesets(xml),
      nodes = L.OSM.getNodes(xml),
      ways = L.OSM.getWays(xml, nodes),
      relations = L.OSM.getRelations(xml, nodes, ways);

    for (var node_id in nodes) {
      var node = nodes[node_id];
      if (this.interestingNode(node, ways, relations)) {
        features.push(node);
      }
    }

    for (var i = 0; i < ways.length; i++) {
      var way = ways[i];
      features.push(way);
    }

    return features;
  },

  isWayArea: function (way) {
    if (way.nodes[0] !== way.nodes[way.nodes.length - 1]) {
      return false;
    }

    for (var key in way.tags) {
      if (~this.options.areaTags.indexOf(key)) {
        return true;
      }
    }

    return false;
  },

  interestingNode: function (node, ways, relations) {
    var used = false;
    var i = 0;

    for (i = 0; i < ways.length; i++) {
      if (ways[i].nodes.indexOf(node) >= 0) {
        used = true;
        break;
      }
    }

    if (!used) {
      return true;
    }

    for (i = 0; i < relations.length; i++) {
      if (relations[i].members.indexOf(node) >= 0)
        return true;
    }

    for (var key in node.tags) {
      if (this.options.uninterestingTags.indexOf(key) < 0) {
        return true;
      }
    }

    return false;
  }
});

L.Util.extend(L.OSM, {
  getChangesets: function (xml) {
    var result = [];

    var nodes = xml.getElementsByTagName("changeset");
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i], id = node.getAttribute("id");
      result.push({
        id: id,
        type: "changeset",
        latLngBounds: L.latLngBounds(
          [node.getAttribute("min_lat"), node.getAttribute("min_lon")],
          [node.getAttribute("max_lat"), node.getAttribute("max_lon")]),
        tags: this.getTags(node)
      });
    }

    return result;
  },

  getNodes: function (xml) {
    var result = {};

    var nodes = xml.getElementsByTagName("node");
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i], id = node.getAttribute("id");
      result[id] = {
        id: id,
        type: "node",
        latLng: L.latLng(node.getAttribute("lat"),
                         node.getAttribute("lon"),
                         true),
        tags: this.getTags(node)
      };
    }

    return result;
  },

  getWays: function (xml, nodes) {
    var result = [];

    var ways = xml.getElementsByTagName("way");
    for (var i = 0; i < ways.length; i++) {
      var way = ways[i], nds = way.getElementsByTagName("nd");

      var way_object = {
        id: way.getAttribute("id"),
        type: "way",
        nodes: new Array(nds.length),
        tags: this.getTags(way)
      };

      for (var j = 0; j < nds.length; j++) {
        way_object.nodes[j] = nodes[nds[j].getAttribute("ref")];
      }

      result.push(way_object);
    }

    return result;
  },

  getRelations: function (xml, nodes) {
    var result = [];

    var rels = xml.getElementsByTagName("relation");
    for (var i = 0; i < rels.length; i++) {
      var rel = rels[i], members = rel.getElementsByTagName("member");

      var rel_object = {
        id: rel.getAttribute("id"),
        type: "relation",
        members: new Array(members.length),
        tags: this.getTags(rel)
      };

      for (var j = 0; j < members.length; j++) {
        if (members[j].getAttribute("type") === "node")
          rel_object.members[j] = nodes[members[j].getAttribute("ref")];
        else // relation-way and relation-relation membership not implemented
          rel_object.members[j] = null;
      }

      result.push(rel_object);
    }

    return result;
  },

  getTags: function (xml) {
    var result = {};

    var tags = xml.getElementsByTagName("tag");
    for (var j = 0; j < tags.length; j++) {
      result[tags[j].getAttribute("k")] = tags[j].getAttribute("v");
    }

    return result;
  }
});
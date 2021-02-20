import L from 'leaflet'

L.AreaSelect = L.Class.extend({
    includes: L.Evented.prototype,

    options: {
        width: 200,
        height: 300,
        keepAspectRatio: false,
    },

    determineWidthHeight: function() {
      if (this._bounds) {
        const northEast = this.map.latLngToLayerPoint(this.options.bounds.getNorthEast())
        const southWest = this.map.latLngToLayerPoint(this.options.bounds.getSouthWest())

        this._width = northEast.x - southWest.x
        this._height = northEast.y - southWest.y
        this._bounds = null
      }
    },

    getWidth: function() {
      if (this._bounds) {
        this.determineWidthHeight()
      }

      return this._width
    },

    getHeight: function() {
      if (this._bounds) {
        this.determineWidthHeight()
      }

      return this._height
    },

    initialize: function(options) {
        L.Util.setOptions(this, options);

        this._width = this.options.width;
        this._height = this.options.height;
        this._bounds = this.options.bounds;
    },

    addTo: function(map) {
        this.map = map;
        this._createElements();
        this._render();
        return this;
    },

    getBounds: function() {
        var size = this.map.getSize();
        var topRight = new L.Point();
        var bottomLeft = new L.Point();

        bottomLeft.x = Math.round((size.x - this.getWidth()) / 2);
        topRight.y = Math.round((size.y - this.getHeight()) / 2);
        topRight.x = size.x - bottomLeft.x;
        bottomLeft.y = size.y - topRight.y;

        var sw = this.map.containerPointToLatLng(bottomLeft);
        var ne = this.map.containerPointToLatLng(topRight);

        return new L.LatLngBounds(sw, ne);
    },

    getBBoxCoordinates: function() {
        var size = this.map.getSize();

        var topRight = new L.Point();
        var bottomLeft = new L.Point();
        var topLeft = new L.Point();
        var bottomRight = new L.Point();

        bottomLeft.x = Math.round((size.x - this.getWidth()) / 2);
        topRight.y = Math.round((size.y - this.getHeight()) / 2);
        topRight.x = size.x - bottomLeft.x;
        bottomLeft.y = size.y - topRight.y;

        topLeft.x = bottomLeft.x;
        topLeft.y = topRight.y;
        bottomRight.x = topRight.x;
        bottomRight.y = bottomLeft.y;

        var coordinates =
            [
                {"sw": this.map.containerPointToLatLng(bottomLeft)},
                {"nw": this.map.containerPointToLatLng(topLeft)},
                {"ne": this.map.containerPointToLatLng(topRight)},
                {"se": this.map.containerPointToLatLng(bottomRight)}
            ]

        return coordinates
    },

    remove: function() {
        this.map.off("moveend", this._onMapChange);
        this.map.off("zoomend", this._onMapChange);
        this.map.off("resize", this._onMapResize);

        this._container.parentNode.removeChild(this._container);
    },


    setDimensions: function(dimensions) {
        if (!dimensions)
            return;

        this._height = parseInt(dimensions.height) || this.getHeight();
        this._width = parseInt(dimensions.width) || this.getWidth();
        this._render();
        this.fire("change");
    },


    _createElements: function() {
        if (!!this._container)
            return;

        this._container = L.DomUtil.create("div", "leaflet-areaselect-container", this.map._controlContainer)

        this._nwHandle = L.DomUtil.create("div", "leaflet-areaselect-handle leaflet-control", this._container);
        this._swHandle = L.DomUtil.create("div", "leaflet-areaselect-handle leaflet-control", this._container);
        this._neHandle = L.DomUtil.create("div", "leaflet-areaselect-handle leaflet-control", this._container);
        this._seHandle = L.DomUtil.create("div", "leaflet-areaselect-handle leaflet-control", this._container);

        this._setUpHandlerEvents(this._nwHandle);
        this._setUpHandlerEvents(this._neHandle, -1, 1);
        this._setUpHandlerEvents(this._swHandle, 1, -1);
        this._setUpHandlerEvents(this._seHandle, -1, -1);

        this.map.on("moveend", this._onMapChange, this);
        this.map.on("zoomend", this._onMapChange, this);
        this.map.on("resize", this._onMapResize, this);

        this._rectangle = L.rectangle(this.getBounds(), {color:"blue"}).addTo(this.map)

        this.fire("change");
    },

    _setUpHandlerEvents: function(handle, xMod, yMod) {
        xMod = xMod || 1;
        yMod = yMod || 1;

        var self = this;
        function onMouseDown(event) {
            event.stopPropagation();
            self.map.dragging.disable();
            L.DomEvent.removeListener(this, "mousedown", onMouseDown);
            var curX = event.pageX;
            var curY = event.pageY;
            var ratio = self.getWidth() / self.getHeight();
            var size = self.map.getSize();

            function onMouseMove(event) {
                if (self.options.keepAspectRatio) {
                    var maxHeight = (self._height >= self.getWidth() ? size.y : size.y * (1/ratio) ) - 30;
                    self._height += (curY - event.originalEvent.pageY) * 2 * yMod;
                    self._height = Math.max(30, self.getHeight());
                    self._height = Math.min(maxHeight, self.getHeight());
                    self._width = self.getHeight() * ratio;
                } else {
                    self._width += (curX - event.originalEvent.pageX) * 2 * xMod;
                    self._height += (curY - event.originalEvent.pageY) * 2 * yMod;
                    self._width = Math.max(30, self.getWidth());
                    self._height = Math.max(30, self.getHeight());
                    self._width = Math.min(size.x-30, self.getWidth());
                    self._height = Math.min(size.y-30, self.getHeight());

                }

                curX = event.originalEvent.pageX;
                curY = event.originalEvent.pageY;
                self._render();
            }
            function onMouseUp(event) {
                self.map.dragging.enable();
                L.DomEvent.removeListener(self.map, "mouseup", onMouseUp);
                L.DomEvent.removeListener(self.map, "mousemove", onMouseMove);
                L.DomEvent.addListener(handle, "mousedown", onMouseDown);
                self.fire("change");
            }

            L.DomEvent.addListener(self.map, "mousemove", onMouseMove);
            L.DomEvent.addListener(self.map, "mouseup", onMouseUp);
        }
        L.DomEvent.addListener(handle, "mousedown", onMouseDown);
    },

    _onMapResize: function() {
        this._render();
    },

    _onMapChange: function() {
        this._rectangle.setBounds(this.getBounds())
        this.fire("change");
    },

    _render: function() {
        var size = this.map.getSize();
        var handleOffset = Math.round(this._nwHandle.offsetWidth/2);

        var topBottomHeight = Math.round((size.y-this.getHeight())/2);
        var leftRightWidth = Math.round((size.x-this.getWidth())/2);

        function setDimensions(element, dimension) {
            element.style.width = dimension.width + "px";
            element.style.height = dimension.height + "px";
            element.style.top = dimension.top + "px";
            element.style.left = dimension.left + "px";
            element.style.bottom = dimension.bottom + "px";
            element.style.right = dimension.right + "px";
        }

        setDimensions(this._nwHandle, {left:leftRightWidth-handleOffset, top:topBottomHeight-7});
        setDimensions(this._neHandle, {right:leftRightWidth-handleOffset, top:topBottomHeight-7});
        setDimensions(this._swHandle, {left:leftRightWidth-handleOffset, bottom:topBottomHeight-7});
        setDimensions(this._seHandle, {right:leftRightWidth-handleOffset, bottom:topBottomHeight-7});

        this._rectangle.setBounds(this.getBounds())
    }
});

L.areaSelect = function(options) {
    return new L.AreaSelect(options);
}

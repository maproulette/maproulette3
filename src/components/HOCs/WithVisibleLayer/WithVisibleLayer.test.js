import { describe, expect, vi } from "vitest";
import { ChallengeBasemap } from "../../../services/Challenge/ChallengeBasemap/ChallengeBasemap";
import {
  BING,
  OPEN_STREET_MAP,
  basemapLayerSource,
  defaultLayerSource,
  layerSourceWithId,
} from "../../../services/VisibleLayer/LayerSources";
import { changeVisibleLayer } from "../../../services/VisibleLayer/VisibleLayer";
import { mapDispatchToProps, mapStateToProps } from "./WithVisibleLayer";

vi.mock("../../../services/VisibleLayer/LayerSources");
vi.mock("../../../services/VisibleLayer/VisibleLayer");

let basicState = null;
let challenge = null;
let user = null;
let defaultLayerInstance = null;
let globalLayer = null;
let fooLayer = null;
let barLayer = null;
let alphaLayer = null;

beforeEach(() => {
  defaultLayerInstance = {
    id: "DefaultLayer",
  };

  fooLayer = {
    id: "FooLayer",
  };

  barLayer = {
    id: "BarLayer",
  };

  globalLayer = {
    id: "GlobalLayer",
  };

  alphaLayer = {
    id: "AlphaLayer",
  };

  challenge = {
    id: 123,
    defaultBasemap: ChallengeBasemap.bing,
  };

  user = {
    id: 987,
    settings: {
      defaultBasemap: ChallengeBasemap.openStreetMap,
    },
  };

  basicState = {
    visibleLayer: globalLayer,
  };

  layerSourceWithId.mockImplementation((layerId) => ({ id: layerId }));
  defaultLayerSource.mockImplementation(() => defaultLayerInstance);
});

describe("mapStateToProps", () => {
  test("maps the challenge visible layer when a challenge is given", () => {
    const mappedProps = mapStateToProps(basicState, {
      user,
      challenge,
      visibleMapLayer: "FooLayer",
      defaultLayer: "BarLayer",
    });
    expect(mappedProps.source).toEqual(fooLayer);
  });

  test("maps the challenge default basemap if no challenge layer set", () => {
    basemapLayerSource.mockReturnValueOnce({ id: BING });
    const mappedProps = mapStateToProps(basicState, { user, challenge });
    expect(mappedProps.source).toEqual({ id: BING });
  });

  test("maps the user's default basemap if no challenge layers available", () => {
    delete challenge.defaultBasemap;
    basemapLayerSource.mockReturnValueOnce({ id: OPEN_STREET_MAP });

    const mappedProps = mapStateToProps(basicState, { user, challenge, defaultLayer: "BarLayer" });
    expect(mappedProps.source).toEqual({ id: OPEN_STREET_MAP });
  });

  test("ignores challenge basemap set to none", () => {
    challenge.defaultBasemap = ChallengeBasemap.none;
    basemapLayerSource.mockReturnValueOnce({ id: OPEN_STREET_MAP });

    const mappedProps = mapStateToProps(basicState, { user, challenge, defaultLayer: "BarLayer" });
    expect(mappedProps.source).toEqual({ id: OPEN_STREET_MAP });
  });

  test("uses a given defaultLayer if no user or challenge default", () => {
    delete challenge.defaultBasemap;
    delete user.settings.defaultBasemap;

    const mappedProps = mapStateToProps(basicState, { user, challenge, defaultLayer: "BarLayer" });

    expect(mappedProps.source).toEqual(barLayer);
  });

  test("a given defaultLayer can be an object as well", () => {
    delete challenge.defaultBasemap;
    delete user.settings.defaultBasemap;

    const mappedProps = mapStateToProps(basicState, { user, challenge, defaultLayer: barLayer });

    expect(mappedProps.source).toEqual(barLayer);
  });

  test("maps the LayerSources default layer when no other layers available", () => {
    delete challenge.defaultBasemap;
    delete user.settings.defaultBasemap;

    const mappedProps = mapStateToProps(basicState, { user, challenge });

    expect(mappedProps.source).toEqual(defaultLayerInstance);
  });

  test("maps LayerSources default layer if provided layer doesn't exist", () => {
    delete challenge.defaultBasemap;
    delete user.settings.defaultBasemap;
    layerSourceWithId.mockReturnValueOnce(undefined);

    const mappedProps = mapStateToProps(basicState, { user, challenge, defaultLayer: "BarLayer" });

    expect(mappedProps.source).toEqual(defaultLayerInstance);
  });

  test("ignores user basemap set to none", () => {
    delete challenge.defaultBasemap;
    user.settings.defaultBasemap = ChallengeBasemap.none;

    const mappedProps = mapStateToProps(basicState, { user, challenge });

    expect(mappedProps.source).toEqual(defaultLayerInstance);
  });

  test("maps the global visible layer when no challenge given", () => {
    const mappedProps = mapStateToProps(basicState, { user });
    expect(mappedProps.source).toEqual(globalLayer);
  });

  test("maps the user basemap if no global layer when no challenge given", () => {
    delete basicState.visibleLayer;
    basemapLayerSource.mockReturnValueOnce({ id: OPEN_STREET_MAP });

    const mappedProps = mapStateToProps(basicState, { user });
    expect(mappedProps.source).toEqual({ id: OPEN_STREET_MAP });
  });

  test("maps the LayerSources default layer if nothing else available", () => {
    delete basicState.visibleLayer;
    delete user.settings.defaultBasemap;

    const mappedProps = mapStateToProps(basicState, { user });
    expect(mappedProps.source).toEqual(defaultLayerInstance);
  });
});

describe("mapDispatchToProps", () => {
  let dispatch = null;
  let setVisibleMapLayer = null;

  beforeEach(() => {
    dispatch = vi.fn();
    setVisibleMapLayer = vi.fn();
  });

  test("changeLayer sets the challenge visible layer if a challenge is given", () => {
    const mappedProps = mapDispatchToProps(dispatch, { challenge, setVisibleMapLayer });
    mappedProps.changeLayer("FooLayer");

    expect(setVisibleMapLayer).toBeCalledWith(challenge.id, false, "FooLayer");
  });

  test("changeLayer sets the global visible layer no challenge is given", () => {
    const mappedProps = mapDispatchToProps(dispatch, { setVisibleMapLayer });

    mappedProps.changeLayer("FooLayer");
    expect(dispatch).toBeCalled();
    expect(changeVisibleLayer).toBeCalledWith("FooLayer", null);
  });

  test("maps the challenge visible layer to a mapType if it has one", () => {
    const mapState = {
      visibleLayer: { myMap: { id: "AlphaLayer" } },
    };
    const mappedProps = mapStateToProps(mapState, {
      user,
      mapType: "myMap",
      visibleMapLayer: "FooLayer",
      defaultLayer: "BarLayer",
    });
    expect(mappedProps.source).toEqual(alphaLayer);
  });

  test("maps the challenge visible layer to default if given a mapType and a layer setup but not for mapType", () => {
    const mapState = {
      visibleLayer: { id: "AlphaLayer" },
    };
    const mappedProps = mapStateToProps(mapState, {
      user,
      mapType: "myMap",
      visibleMapLayer: "FooLayer",
      defaultLayer: "BarLayer",
    });
    expect(mappedProps.source).toEqual(barLayer);
  });

  test("changeLayer sets the visible layer with map type no challenge is given", () => {
    const mappedProps = mapDispatchToProps(dispatch, { setVisibleMapLayer });

    mappedProps.changeLayer("FooLayer", "myMap");
    expect(dispatch).toBeCalled();
    expect(changeVisibleLayer).toBeCalledWith("FooLayer", "myMap");
  });
});

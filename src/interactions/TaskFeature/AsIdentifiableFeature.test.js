import { describe, expect } from "vitest";
import AsIdentifiableFeature from "./AsIdentifiableFeature";

let basicFeature = null;

beforeEach(() => {
  basicFeature = {
    properties: {
      foo: "bar",
    },
  };
});

describe("rawFeatureId", () => {
  test("returns the raw id from the `osmid` field if it exists", () => {
    basicFeature.osmid = "123";

    expect(AsIdentifiableFeature(basicFeature).rawFeatureId()).toEqual("123");
  });

  test("returns the raw id from the `@id` field if it exists", () => {
    basicFeature["@id"] = "node/1042007773";

    expect(AsIdentifiableFeature(basicFeature).rawFeatureId()).toEqual("node/1042007773");
  });

  test("also looks for `osmid` property if no fields match", () => {
    basicFeature.properties.osmid = "123";

    expect(AsIdentifiableFeature(basicFeature).rawFeatureId()).toEqual("123");
  });

  test("also looks for `@id` property if no fields match", () => {
    basicFeature.properties["@id"] = "node/1042007773";

    expect(AsIdentifiableFeature(basicFeature).rawFeatureId()).toEqual("node/1042007773");
  });

  test("favors @id over osmid if both are present", () => {
    basicFeature.properties["@id"] = "way/456";
    basicFeature.properties.osmid = "123";

    expect(AsIdentifiableFeature(basicFeature).rawFeatureId()).toEqual("way/456");
  });
});

describe("osmId", () => {
  test("returns the numerical id from the `osmid` field if it exists", () => {
    basicFeature.osmid = "123";

    expect(AsIdentifiableFeature(basicFeature).osmId()).toEqual("123");
  });

  test("returns the numerical id from the `@id` field if it exists", () => {
    basicFeature["@id"] = "node/1042007773";

    expect(AsIdentifiableFeature(basicFeature).osmId()).toEqual("1042007773");
  });
});

describe("osmType", () => {
  test("returns the OSM element type from the `osmid` field if it exists", () => {
    basicFeature.osmid = "node/123";
    expect(AsIdentifiableFeature(basicFeature).osmType()).toEqual("node");

    basicFeature.osmid = "way/123";
    expect(AsIdentifiableFeature(basicFeature).osmType()).toEqual("way");

    basicFeature.osmid = "relation/123";
    expect(AsIdentifiableFeature(basicFeature).osmType()).toEqual("relation");
  });

  test("normalizes the OSM element type", () => {
    basicFeature.osmid = "n/123";
    expect(AsIdentifiableFeature(basicFeature).osmType()).toEqual("node");

    basicFeature.osmid = "w/123";
    expect(AsIdentifiableFeature(basicFeature).osmType()).toEqual("way");

    basicFeature.osmid = "r/123";
    expect(AsIdentifiableFeature(basicFeature).osmType()).toEqual("relation");
  });

  test("falls back to the `type` field if no type in the id", () => {
    basicFeature.osmid = "123";

    basicFeature.properties = { type: "node" };
    expect(AsIdentifiableFeature(basicFeature).osmType()).toEqual("node");

    basicFeature.properties.type = "way";
    expect(AsIdentifiableFeature(basicFeature).osmType()).toEqual("way");

    basicFeature.properties.type = "relation";
    expect(AsIdentifiableFeature(basicFeature).osmType()).toEqual("relation");
  });

  test("returns null if no element type can be found", () => {
    basicFeature.osmid = "123";
    expect(AsIdentifiableFeature(basicFeature).osmType()).toBeNull();
  });
});

describe("normalizedTypeAndId", () => {
  test("returns the type and id as a string", () => {
    basicFeature.osmid = "node/123";
    expect(AsIdentifiableFeature(basicFeature).normalizedTypeAndId()).toEqual("node 123");

    basicFeature.osmid = "way/123";
    expect(AsIdentifiableFeature(basicFeature).normalizedTypeAndId()).toEqual("way 123");

    basicFeature.osmid = "relation/123";
    expect(AsIdentifiableFeature(basicFeature).normalizedTypeAndId()).toEqual("relation 123");
  });

  test("allows the separator to be specified", () => {
    basicFeature.osmid = "node/123";
    expect(AsIdentifiableFeature(basicFeature).normalizedTypeAndId(false, "/")).toEqual("node/123");

    basicFeature.osmid = "way/123";
    expect(AsIdentifiableFeature(basicFeature).normalizedTypeAndId(false, "/")).toEqual("way/123");

    basicFeature.osmid = "relation/123";
    expect(AsIdentifiableFeature(basicFeature).normalizedTypeAndId(false, "/")).toEqual(
      "relation/123",
    );
  });

  test("normalizes the OSM element type", () => {
    basicFeature.osmid = "n/123";
    expect(AsIdentifiableFeature(basicFeature).normalizedTypeAndId()).toEqual("node 123");

    basicFeature.osmid = "w/123";
    expect(AsIdentifiableFeature(basicFeature).normalizedTypeAndId()).toEqual("way 123");

    basicFeature.osmid = "r/123";
    expect(AsIdentifiableFeature(basicFeature).normalizedTypeAndId()).toEqual("relation 123");
  });

  test("falls back to the `type` field if no type in the id", () => {
    basicFeature.osmid = "123";

    basicFeature.properties = { type: "node" };
    expect(AsIdentifiableFeature(basicFeature).normalizedTypeAndId()).toEqual("node 123");

    basicFeature.properties.type = "way";
    expect(AsIdentifiableFeature(basicFeature).normalizedTypeAndId()).toEqual("way 123");

    basicFeature.properties.type = "relation";
    expect(AsIdentifiableFeature(basicFeature).normalizedTypeAndId()).toEqual("relation 123");
  });

  test("returns just the id if no type is detected", () => {
    basicFeature.osmid = "123";
    expect(AsIdentifiableFeature(basicFeature).normalizedTypeAndId()).toEqual("123");
  });

  test("returns null if type is required and no type detected", () => {
    basicFeature.osmid = "123";
    expect(AsIdentifiableFeature(basicFeature).normalizedTypeAndId(true)).toBeNull();
  });

  test("returns null if no id is found", () => {
    basicFeature.osmid = "xyz";
    expect(AsIdentifiableFeature(basicFeature).normalizedTypeAndId()).toBeNull();
  });
});

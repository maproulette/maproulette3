import AsFilterableFeature from "./AsFilterableFeature";

let basicFeature = null;
let stringRule = null;
let numberRule = null;
let compoundRule = null;

beforeEach(() => {
  basicFeature = {
    properties: {
      foo: "bar",
      age: 50,
    },
  };

  stringRule = {
    valueType: "string",
    key: "foo",
    searchType: "equals",
    value: "bar",
  };

  numberRule = {
    valueType: "number",
    key: "age",
    searchType: "equals",
    value: "50",
  };

  compoundRule = {
    operationType: "and",
    left: stringRule,
    right: numberRule,
  };
});

describe("matchesStringFilter", () => {
  test("returns false if the rule value is not a string", () => {
    stringRule.value = 123;

    expect(AsFilterableFeature(basicFeature).matchesStringFilter(stringRule)).toBe(false);
  });

  test("throws an error if search type is not supported", () => {
    stringRule.searchType = "unsupported_comparison";

    expect(() => AsFilterableFeature(basicFeature).matchesStringFilter(stringRule)).toThrow();
  });

  describe("equals", () => {
    test("returns true if values are equal", () => {
      expect(AsFilterableFeature(basicFeature).matchesStringFilter(stringRule)).toBe(true);
    });

    test("returns false if values are not equal", () => {
      basicFeature.properties.foo = "baz";

      expect(AsFilterableFeature(basicFeature).matchesStringFilter(stringRule)).toBe(false);
    });

    test("returns false if the property doesn't exist", () => {
      delete basicFeature.properties.foo;

      expect(AsFilterableFeature(basicFeature).matchesStringFilter(stringRule)).toBe(false);
    });
  });

  describe("not_equal", () => {
    beforeEach(() => {
      stringRule.searchType = "not_equal";
    });

    test("returns false if values are equal", () => {
      expect(AsFilterableFeature(basicFeature).matchesStringFilter(stringRule)).toBe(false);
    });

    test("returns true if values are not equal", () => {
      basicFeature.properties.foo = "baz";

      expect(AsFilterableFeature(basicFeature).matchesStringFilter(stringRule)).toBe(true);
    });

    test("returns true if the property doesn't exist", () => {
      delete basicFeature.properties.foo;

      expect(AsFilterableFeature(basicFeature).matchesStringFilter(stringRule)).toBe(true);
    });

    test("returns true if the property is null", () => {
      basicFeature.properties.foo = null;

      expect(AsFilterableFeature(basicFeature).matchesStringFilter(stringRule)).toBe(true);
    });
  });

  describe("contains", () => {
    beforeEach(() => {
      stringRule.searchType = "contains";
    });

    test("returns true if values are equal", () => {
      expect(AsFilterableFeature(basicFeature).matchesStringFilter(stringRule)).toBe(true);
    });

    test("returns true if property contains rule value", () => {
      basicFeature.properties.foo = "hello world";
      stringRule.value = "world";

      expect(AsFilterableFeature(basicFeature).matchesStringFilter(stringRule)).toBe(true);
    });

    test("returns false if property does not contain rule value", () => {
      basicFeature.properties.foo = "hello world";
      stringRule.value = "bar";

      expect(AsFilterableFeature(basicFeature).matchesStringFilter(stringRule)).toBe(false);
    });

    test("returns false if the rule value is an empty string", () => {
      stringRule.value = "";

      expect(AsFilterableFeature(basicFeature).matchesStringFilter(stringRule)).toBe(false);
    });

    test("returns false if the property doesn't exist", () => {
      delete basicFeature.properties.foo;

      expect(AsFilterableFeature(basicFeature).matchesStringFilter(stringRule)).toBe(false);
    });

    test("returns false if the property is null", () => {
      basicFeature.properties.foo = null;

      expect(AsFilterableFeature(basicFeature).matchesStringFilter(stringRule)).toBe(false);
    });
  });
});

describe("matchesNumberFilter", () => {
  test("returns false if the rule value is null", () => {
    numberRule.value = null;

    expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(false);
  });

  test("returns false if the rule value is empty", () => {
    numberRule.value = "";

    expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(false);
  });

  test("returns false if the rule value is not numeric", () => {
    numberRule.value = "abc";

    expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(false);
  });

  test("throws an error if search type is not supported", () => {
    numberRule.searchType = "unsupported_comparison";

    expect(() => AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toThrow();
  });

  describe("equals", () => {
    test("returns true if values are equal", () => {
      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(true);
    });

    test("allows property to be a string if data is numeric", () => {
      basicFeature.properties.age = "50";

      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(true);
    });

    test("returns false if values are not equal", () => {
      basicFeature.properties.age = 10;

      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(false);
    });

    test("returns false if the property doesn't exist", () => {
      delete basicFeature.properties.age;

      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(false);
    });
  });

  describe("not_equal", () => {
    beforeEach(() => {
      numberRule.searchType = "not_equal";
    });

    test("returns false if values are equal", () => {
      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(false);
    });

    test("returns true if values are not equal", () => {
      basicFeature.properties.age = 10;

      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(true);
    });

    test("returns true if the property doesn't exist", () => {
      delete basicFeature.properties.age;

      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(true);
    });

    test("returns true if the property is null", () => {
      basicFeature.properties.age = null;

      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(true);
    });
  });

  describe("greater_than", () => {
    beforeEach(() => {
      numberRule.searchType = "greater_than";
    });

    test("returns true if property is greater than value", () => {
      basicFeature.properties.age = 60;
      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(true);
    });

    test("allows property to be a string if data is numeric", () => {
      basicFeature.properties.age = "60";

      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(true);
    });

    test("returns false property is less than value", () => {
      basicFeature.properties.age = 40;

      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(false);
    });

    test("returns false property is equal to value", () => {
      basicFeature.properties.age = 50;

      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(false);
    });

    test("returns false if the property doesn't exist", () => {
      delete basicFeature.properties.age;

      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(false);
    });
  });

  describe("less_than", () => {
    beforeEach(() => {
      numberRule.searchType = "less_than";
    });

    test("returns true if property is less than value", () => {
      basicFeature.properties.age = 40;
      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(true);
    });

    test("allows property to be a string if data is numeric", () => {
      basicFeature.properties.age = "40";

      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(true);
    });

    test("returns false property is greater than value", () => {
      basicFeature.properties.age = 60;

      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(false);
    });

    test("returns false property is equal to value", () => {
      basicFeature.properties.age = 50;

      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(false);
    });

    test("returns false if the property doesn't exist", () => {
      delete basicFeature.properties.age;

      expect(AsFilterableFeature(basicFeature).matchesNumberFilter(numberRule)).toBe(false);
    });
  });
});

describe("matchesPropertyFilter", () => {
  test("throws an error if operation type is not supported", () => {
    compoundRule.operationType = "unsupported_operator";

    expect(() => AsFilterableFeature(basicFeature).matchesPropertyFilter(compoundRule)).toThrow();
  });

  describe("AND'ed compound rules", () => {
    test("returns true if both sides of AND'ed compound rule are true", () => {
      expect(AsFilterableFeature(basicFeature).matchesPropertyFilter(compoundRule)).toBe(true);
    });

    test("returns false if left side of AND'ed compound rule is false", () => {
      compoundRule.left.value = "baz";
      expect(AsFilterableFeature(basicFeature).matchesPropertyFilter(compoundRule)).toBe(false);
    });

    test("returns false if right side of AND'ed compound rule is false", () => {
      compoundRule.right.value = "100";
      expect(AsFilterableFeature(basicFeature).matchesPropertyFilter(compoundRule)).toBe(false);
    });

    test("returns false if both sides of AND'ed compound rule is false", () => {
      compoundRule.left.value = "baz";
      compoundRule.right.value = "100";
      expect(AsFilterableFeature(basicFeature).matchesPropertyFilter(compoundRule)).toBe(false);
    });
  });

  describe("AND'ed compound rules", () => {
    beforeEach(() => {
      compoundRule.operationType = "or";
    });

    test("returns true if both sides of OR'ed compound rule are true", () => {
      expect(AsFilterableFeature(basicFeature).matchesPropertyFilter(compoundRule)).toBe(true);
    });

    test("returns true if left side of OR'ed compound rule is false", () => {
      compoundRule.left.value = "baz";
      expect(AsFilterableFeature(basicFeature).matchesPropertyFilter(compoundRule)).toBe(true);
    });

    test("returns true if right side of OR'ed compound rule is false", () => {
      compoundRule.right.value = "100";
      expect(AsFilterableFeature(basicFeature).matchesPropertyFilter(compoundRule)).toBe(true);
    });

    test("returns false if both sides of OR'ed compound rule is false", () => {
      compoundRule.left.value = "baz";
      compoundRule.right.value = "100";
      expect(AsFilterableFeature(basicFeature).matchesPropertyFilter(compoundRule)).toBe(false);
    });
  });
});

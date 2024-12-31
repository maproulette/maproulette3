import _values from "lodash/values";
import { CooperativeType, isCooperative } from "./CooperativeType";

describe("isCooperative", () => {
  test("returns false if given an invalid cooperative type", () => {
    expect(isCooperative(-1)).toBe(false);
  });

  test("returns false if NONE type is given", () => {
    expect(isCooperative(CooperativeType.none)).toBe(false);
  });

  test("returns true for valid, active types", () => {
    _values(CooperativeType).forEach((cooperativeType) => {
      if (cooperativeType !== CooperativeType.none) {
        expect(isCooperative(cooperativeType)).toBe(true);
      }
    });
  });
});

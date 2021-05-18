import { constructChangesetUrl } from "./constructChangesetUrl";

describe("constructChangesetUrl", () => {
  const cachedEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...cachedEnv, REACT_APP_CHANGESET_URL: "enabled" };
  });

  afterAll(() => {
    process.env = cachedEnv;
  });

  it("returns empty string if no task is provided", () => {
    expect(constructChangesetUrl()).toBe("");
  });

  it("returns empty string if env variabled is disabled", () => {
    process.env.REACT_APP_CHANGESET_URL = "disabled";
    const task = { parent: { changesetUrl: true, id: 1 } };
    expect(constructChangesetUrl(task)).toBe("");
  });

  it("returns empty string changesetUrl is false", () => {
    const task = { parent: { changesetUrl: false, id: 1 } };
    expect(constructChangesetUrl(task)).toBe("");
  });

  it("returns correct url if changesetUrl is true", () => {
    const task = { parent: { changesetUrl: true, id: 1 } };
    expect(constructChangesetUrl(task)).toBe(
      " http://localhost/browse/challenges/1"
    );
  });
});

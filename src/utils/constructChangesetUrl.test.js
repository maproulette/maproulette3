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

  it("returns empty string if env variable is disabled", () => {
    process.env.REACT_APP_CHANGESET_URL = "disabled";
    const task = { parent: { enabled: true, id: 1 } };
    expect(constructChangesetUrl(task)).toBe("");
  });

  it("returns empty string if challenge is not enabled", () => {
    const task = { parent: { enabled: false, id: 1 } };
    expect(constructChangesetUrl(task)).toBe("");
  });

  it("returns empty string if project is not enabled", () => {
    const task = { parent: { parent: { enabled: false }, id: 1 } };
    expect(constructChangesetUrl(task)).toBe("");
  });

  it("returns correct url if challenge and project are enabled", () => {
    const task = { parent: { enabled: true, parent: { enabled: true }, id: 1 } };
    expect(constructChangesetUrl(task)).toBe(
      " http://localhost/browse/challenges/1"
    );
  });
});

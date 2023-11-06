import { constructChangesetUrl } from "./constructChangesetUrl";

describe("constructChangesetUrl", () => {
  const cachedEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...cachedEnv, REACT_APP_CHANGESET_URL: "enabled", REACT_APP_SHORT_URL: '', REACT_APP_SHORT_PATH: 'disabled' };
  });

  afterAll(() => {
    process.env = cachedEnv;
  });

  it("returns empty string if no task is provided", () => {
    expect(constructChangesetUrl()).toBe("");
  });

  it("returns empty string if env variable is disabled", () => {
    process.env.REACT_APP_CHANGESET_URL = "disabled";
    const task = { parent: { enabled: true, id: 1 }, id: 2 };
    expect(constructChangesetUrl(task)).toBe("");
  });

  it("returns empty string if challenge is not enabled", () => {
    const task = { parent: { enabled: false, id: 1 }, id: 2 };
    expect(constructChangesetUrl(task)).toBe("");
  });

  it("returns empty string if project is not enabled", () => {
    const task = { parent: { parent: { enabled: false }, id: 1 }, id: 2 };
    expect(constructChangesetUrl(task)).toBe("");
  });

  it("returns long url if challenge and project are enabled", () => {
    const task = { parent: { enabled: true, parent: { enabled: true }, id: 1 }, id: 2 };
    expect(constructChangesetUrl(task)).toBe(
      " http://localhost/challenge/1/task/2"
    );
  });

  it("returns short root url if REACT_APP_SHORT_URL is provided", () => {
    process.env.REACT_APP_SHORT_URL = "mpr.lt";
    process.env.REACT_APP_SHORT_PATH = "disabled";
    const task = { parent: { enabled: true, parent: { enabled: true }, id: 1 }, id: 2 };
    expect(constructChangesetUrl(task)).toBe(
      " mpr.lt/challenge/1/task/2"
    );
  });

  it("returns short root url and short path if REACT_APP_SHORT_URL is provided and REACT_APP_SHORT_PATH is enabled", () => {
    process.env.REACT_APP_SHORT_URL = "mpr.lt";
    process.env.REACT_APP_SHORT_PATH = "enabled";
    const task = { parent: { enabled: true, parent: { enabled: true }, id: 1 }, id: 2 };
    expect(constructChangesetUrl(task)).toBe(
      " mpr.lt/c/1/t/2"
    );
  });
});

import { constructChangesetUrl } from "./constructChangesetUrl";

describe("constructChangesetUrl", () => {
  const cachedEnv = import.meta.env;

  beforeEach(() => {
    jest.resetModules();
    import.meta.env = { ...cachedEnv, VITE_CHANGESET_URL: "enabled", VITE_SHORT_URL: '', VITE_SHORT_PATH: 'disabled' };
  });

  afterAll(() => {
    import.meta.env = cachedEnv;
  });

  it("returns empty string if no task is provided", () => {
    expect(constructChangesetUrl()).toBe("");
  });

  it("returns empty string if env variable is disabled", () => {
    import.meta.env.VITE_CHANGESET_URL = "disabled";
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

  it("returns short root url if VITE_SHORT_URL is provided", () => {
    import.meta.env.VITE_SHORT_URL = "mpr.lt";
    import.meta.env.VITE_SHORT_PATH = "disabled";
    const task = { parent: { enabled: true, parent: { enabled: true }, id: 1 }, id: 2 };
    expect(constructChangesetUrl(task)).toBe(
      " mpr.lt/challenge/1/task/2"
    );
  });

  it("returns short root url and short path if VITE_SHORT_URL is provided and VITE_SHORT_PATH is enabled", () => {
    import.meta.env.VITE_SHORT_URL = "mpr.lt";
    import.meta.env.VITE_SHORT_PATH = "enabled";
    const task = { parent: { enabled: true, parent: { enabled: true }, id: 1 }, id: 2 };
    expect(constructChangesetUrl(task)).toBe(
      " mpr.lt/c/1/t/2"
    );
  });
});

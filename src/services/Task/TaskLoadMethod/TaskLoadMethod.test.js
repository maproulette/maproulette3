import { messagesByLoadMethod } from "./TaskLoadMethod";

describe("messagesByLoadMethod", () => {
  it("returns specific object when ran", () => {
    const value = messagesByLoadMethod;

    expect(value).toStrictEqual({
      proximity: {
        defaultMessage: "Nearby",
        id: "Task.loadByMethod.proximity",
      },
      random: { defaultMessage: "Random", id: "Task.loadByMethod.random" },
    });
  });

  it("returns undefined if index of 0 is ran", () => {
    const value = messagesByLoadMethod;

    expect(value[0]).toBe(undefined);
  });
});

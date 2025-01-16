import { describe, expect, it } from "vitest";
import { messagesByPropertyOperationType } from "./TaskProperty";

describe("messagesByPropertyOperationType", () => {
  it("returns specific object when ran", () => {
    const value = messagesByPropertyOperationType;

    expect(value).toStrictEqual({
      and: { defaultMessage: "and", id: "Task.property.operationType.and" },
      or: { defaultMessage: "or", id: "Task.property.operationType.or" },
    });
  });
});

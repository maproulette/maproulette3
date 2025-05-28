import { renderHook } from '@testing-library/react-hooks';
import { describe, expect, it } from "vitest";
import usePropertyReplacement from "./UsePropertyReplacement";

describe("usePropertyReplacement additional tests", () => {
  const properties = {
    name: "Test Name",
    id: "123",
    nested: {
      property: "nested value",
      deep: {
        key: "deep value"
      }
    },
    special: "value with special characters: !@#$%^&*()"
  };

  it("url encodes markdown link replacements", () => {
    const content = "[link](https://example.com/{{nested.deep.key}})";
    const { result } = renderHook(() => usePropertyReplacement(content, properties));
    expect(result.current).toBe("[link](https://example.com/deep%20value)");
  });

  it("performs basic url encoded replacement in markdown link", () => {
    const content = "[link](https://example.com/{{name}})";
    const expected = "[link](https://example.com/Test%20Name)";
    const { result } = renderHook(() => usePropertyReplacement(content, properties));
    expect(result.current).toBe(expected);
  });

  it("ignores whitespace between link text and URL in markdown link", () => {
    const content = "[link]    (https://example.com/{{name}})";
    const expected = "[link](https://example.com/Test%20Name)";
    const { result } = renderHook(() => usePropertyReplacement(content, properties));
    expect(result.current).toBe(expected);
  });

  it("falls through to preexisting replacement behavior for invalid link format", () => {
    const content = "[link] hello there (https://example.com/{{name}})";
    const expected = "[link] hello there (https://example.com/Test Name)";
    const { result } = renderHook(() => usePropertyReplacement(content, properties));
    expect(result.current).toBe(expected);
  });

  it("does not url encode standalone replacements outside markdown links", () => {
    const content = "[link](https://example.com/) blab blah {{name}} blah [another link](https://example.com/)";
    const expected = "[link](https://example.com/) blab blah Test Name blah [another link](https://example.com/)";
    const { result } = renderHook(() => usePropertyReplacement(content, properties));
    expect(result.current).toBe(expected);
  });

  it("does not url encode standalone replacements when no markdown links are present", () => {
    const content = "hello there (foo {{name}})";
    const expected = "hello there (foo Test Name)";
    const { result } = renderHook(() => usePropertyReplacement(content, properties));
    expect(result.current).toBe(expected);
  });

  it("only url encodes replacements in markdown links", () => {
    const content = "{{nested.deep.key}} [link](https://example.com/{{nested.deep.key}})";
    const { result } = renderHook(() => usePropertyReplacement(content, properties, true, false));
    expect(result.current).toBe("deep value [link](https://example.com/deep%20value)");
  });

  it("handles empty properties object", () => {
    const content = "Hello, {{name}}!";
    const { result } = renderHook(() => usePropertyReplacement(content, {}));
    expect(result.current).toBe("Hello, !");
  });

  it("honors allowPropertyReplacement = false when data missing", () => {
    const content = "Hello, {{name}}!";
    const { result } = renderHook(() => usePropertyReplacement(content, {}, false));
    expect(result.current).toBe("Hello, {{name}}!");
  });

  it("honors allowPropertyReplacement = false when data present", () => {
    const content = "Hello, {{name}}!";
    const { result } = renderHook(() => usePropertyReplacement(content, properties, false));
    expect(result.current).toBe("Hello, {{name}}!");
  });

  it("processes content with multiple nested properties", () => {
    const content = "Nested: {{nested.property}}, Deep: {{nested.deep.key}}";
    const { result } = renderHook(() => usePropertyReplacement(content, properties));
    expect(result.current).toBe("Nested: nested value, Deep: deep value");
  });

  it("handles content with no mustache tags", () => {
    const content = "This is plain text.";
    const { result } = renderHook(() => usePropertyReplacement(content, properties));
    expect(result.current).toBe(content);
  });

  it("handles content with special characters in property values", () => {
    const content = "Special: {{special}}";
    const { result } = renderHook(() => usePropertyReplacement(content, properties));
    expect(result.current).toBe("Special: value with special characters: !@#$%^&*()");
  });
});
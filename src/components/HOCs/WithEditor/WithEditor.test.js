import { vi } from "vitest";
import { JOSM, closeEditor, editTask } from "../../../services/Editor/Editor";
import { mapDispatchToProps, mapStateToProps } from "./WithEditor";

vi.mock("../../../services/Editor/Editor");

let basicState = null;

beforeEach(() => {
  basicState = {
    openEditor: JOSM,
  };
});

test("mapStateToProps provides an editor prop with the current open editor", () => {
  const mappedProps = mapStateToProps(basicState);

  expect(mappedProps.editor).toEqual(basicState.openEditor);

  expect(mappedProps).toMatchSnapshot();
});

test("mapDispatchToProps makes the closeEditor() function available", () => {
  const dispatch = vi.fn();
  const mappedProps = mapDispatchToProps(dispatch);

  mappedProps.closeEditor();
  expect(dispatch).toBeCalled();
  expect(closeEditor).toBeCalled();
});

test("mapDispatchToProps makes the editTask() function available", () => {
  const dispatch = vi.fn();
  const mappedProps = mapDispatchToProps(dispatch);

  const editor = JOSM;
  const task = { id: 12345 };
  const mapBounds = { task: { bounds: [0, 0, 0, 0] } };

  mappedProps.editTask(editor, task, mapBounds);
  expect(dispatch).toBeCalled();
  expect(editTask).toBeCalledWith(editor, task, mapBounds);
});

import { denormalize } from "normalizr";
import { vi } from "vitest";
import { fetchChallenge, fetchChallengeActions } from "../../../services/Challenge/Challenge";
import { CHALLENGE_STATUS_READY } from "../../../services/Challenge/ChallengeStatus/ChallengeStatus";
import {
  addTaskComment,
  completeTask,
  loadRandomTaskFromChallenge,
  loadRandomTaskFromVirtualChallenge,
} from "../../../services/Task/Task";
import { TaskLoadMethod } from "../../../services/Task/TaskLoadMethod/TaskLoadMethod";
import { mapDispatchToProps, mapStateToProps } from "./WithCurrentTask";

vi.mock("normalizr");
vi.mock("../../../services/Task/Task");
vi.mock("../../../services/Challenge/Challenge");

denormalize.mockImplementation((challenge) => challenge);

let task = null;
let challenge = null;
let virtualChallenge = null;
let completionStatus = null;
let basicState = null;

beforeEach(() => {
  challenge = {
    id: 123,
    name: "challenge123",
    difficulty: "hard",
    actions: { available: 3 },
    enabled: true,
  };

  virtualChallenge = {
    id: 246,
    name: "virtualChallenge246",
  };

  task = {
    id: 987,
    name: "task987",
    parent: challenge.id,
  };

  completionStatus = 1;

  basicState = {
    entities: {
      tasks: {
        [task.id]: task,
      },
      challenges: {
        [challenge.id]: challenge,
      },
    },
  };

  loadRandomTaskFromChallenge.mockReset();
  loadRandomTaskFromVirtualChallenge.mockReset();
  vi.useFakeTimers();
});

test("mapStateToProps maps task from the taskId in the route", () => {
  const routeMatchProps = {
    match: {
      params: { taskId: task.id },
    },
  };

  const mappedProps = mapStateToProps(basicState, routeMatchProps);
  expect(mappedProps.task.id).toEqual(task.id);
  expect(denormalize).toHaveBeenCalled();
});

test("mapDispatchToProps maps some functions", () => {
  const dispatch = vi.fn(() => Promise.resolve());
  mapDispatchToProps(dispatch, {});
});

test("mapDispatchToProps completeTask calls completeTask", () => {
  const dispatch = vi.fn(() => Promise.resolve());
  const history = {
    push: vi.fn(),
  };

  const mappedProps = mapDispatchToProps(dispatch, { history });

  mappedProps.completeTask(task, challenge.id, completionStatus);
  expect(dispatch).toBeCalled();
  expect(completeTask).toBeCalled();
});

test("completeTask calls addComment if comment present", async () => {
  const comment = "A Comment";
  const dispatch = vi.fn(() => Promise.resolve());
  const history = {
    push: vi.fn(),
  };

  const mappedProps = mapDispatchToProps(dispatch, { history });

  await mappedProps.completeTask(task, challenge.id, completionStatus, comment);
  expect(addTaskComment).toHaveBeenLastCalledWith(task.id, comment, completionStatus);
});

test("completeTask does not call addComment if no comment", async () => {
  addTaskComment.mockClear();

  const dispatch = vi.fn(() => Promise.resolve());
  const history = {
    push: vi.fn(),
  };

  const mappedProps = mapDispatchToProps(dispatch, { history });

  await mappedProps.completeTask(task, challenge.id, completionStatus);
  expect(addTaskComment).not.toHaveBeenCalled();
});

test("completeTask calls loadRandomTaskFromChallenge without proximate task by default", async () => {
  const dispatch = vi.fn(() => Promise.resolve());
  const history = {
    push: vi.fn(),
  };

  const mappedProps = mapDispatchToProps(dispatch, { history, challengeId: challenge.id });

  await mappedProps.completeTask(
    task,
    challenge.id,
    completionStatus,
    null,
    null,
    TaskLoadMethod.random,
  );
  expect(loadRandomTaskFromChallenge).toBeCalledWith(challenge.id, undefined);
});

test("completeTask calls loadRandomTaskFromChallenge with task if proximate load method", async () => {
  const dispatch = vi.fn(() => Promise.resolve());
  const history = {
    push: vi.fn(),
  };

  const mappedProps = mapDispatchToProps(dispatch, { history, challengeId: challenge.id });

  await mappedProps.completeTask(
    task,
    challenge.id,
    completionStatus,
    null,
    null,
    TaskLoadMethod.proximity,
  );
  expect(loadRandomTaskFromChallenge).toBeCalledWith(challenge.id, task.id);
});

test("completeTask calls fetchChallengeActions", () => {
  const dispatch = vi.fn(() => Promise.resolve());
  const history = {
    push: vi.fn(),
  };

  const mappedProps = mapDispatchToProps(dispatch, { history });
  mappedProps.completeTask(task, challenge.id, completionStatus, null, null, TaskLoadMethod.random);
  vi.runOnlyPendingTimers();

  expect(fetchChallengeActions).toBeCalledWith(challenge.id);
});

test("completeTask routes the user to the new task if there is one", async () => {
  const nextTask = { id: 654 };

  completeTask.mockReturnValueOnce(Promise.resolve());
  loadRandomTaskFromChallenge.mockReturnValueOnce(Promise.resolve(nextTask));
  const dispatch = vi.fn((value) => value);
  const history = {
    push: vi.fn(),
  };

  const mappedProps = mapDispatchToProps(dispatch, { history, challengeId: challenge.id });

  await mappedProps.completeTask(
    task,
    challenge.id,
    completionStatus,
    null,
    null,
    TaskLoadMethod.random,
  );
  expect(history.push).toBeCalledWith(`/challenge/${challenge.id}/task/${nextTask.id}`);
});

test("completeTask routes the user to the new task in a virtual challenge", async () => {
  const nextTask = { id: 654 };

  completeTask.mockReturnValueOnce(Promise.resolve());
  loadRandomTaskFromVirtualChallenge.mockReturnValueOnce(Promise.resolve(nextTask));
  const dispatch = vi.fn((value) => value);
  const history = {
    push: vi.fn(),
  };

  const mappedProps = mapDispatchToProps(dispatch, {
    history,
    virtualChallengeId: virtualChallenge.id,
  });

  await mappedProps.completeTask(
    task,
    challenge.id,
    completionStatus,
    null,
    null,
    TaskLoadMethod.random,
  );
  expect(history.push).toBeCalledWith(`/virtual/${virtualChallenge.id}/task/${nextTask.id}`);
});

test("completeTask routes the user to challenge page if the next task isn't new", async () => {
  const nextTask = { id: task.id }; // same as our current task

  completeTask.mockReturnValueOnce(Promise.resolve());
  loadRandomTaskFromChallenge.mockReturnValueOnce(Promise.resolve(nextTask));
  fetchChallenge.mockReturnValueOnce(
    Promise.resolve({
      entities: {
        challenges: {
          123: {
            id: 123,
            status: CHALLENGE_STATUS_READY,
          },
        },
      },
      result: "123",
    }),
  );
  const dispatch = vi.fn((value) => value);
  const history = {
    push: vi.fn(),
  };

  const mappedProps = mapDispatchToProps(dispatch, { history });

  await mappedProps.completeTask(
    task,
    challenge.id,
    completionStatus,
    null,
    null,
    TaskLoadMethod.random,
  );
  expect(history.push).toHaveBeenCalledWith("/browse/challenges", {
    warn: true,
    congratulate: false,
  });
});

test("completeTask routes the user to challenge page if there is no next task", async () => {
  completeTask.mockReturnValueOnce(Promise.resolve());
  loadRandomTaskFromChallenge.mockReturnValueOnce(Promise.resolve(null));
  fetchChallenge.mockReturnValueOnce(
    Promise.resolve({
      entities: {
        challenges: {
          123: {
            id: 123,
            status: CHALLENGE_STATUS_READY,
          },
        },
      },
      result: "123",
    }),
  );
  const dispatch = vi.fn((value) => value);
  const history = {
    push: vi.fn(),
  };

  const mappedProps = mapDispatchToProps(dispatch, { history });

  await mappedProps.completeTask(
    task,
    challenge.id,
    completionStatus,
    null,
    null,
    TaskLoadMethod.random,
  );
  expect(history.push).toHaveBeenCalledWith("/browse/challenges", {
    warn: true,
    congratulate: false,
  });
});

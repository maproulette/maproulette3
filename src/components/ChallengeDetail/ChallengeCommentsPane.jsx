import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormattedDate, FormattedTime } from "react-intl";
import { Link } from "react-router-dom";
import defaultPic from "../../../images/user_no_image.png";
import { UseRouter } from "../../hooks/UseRouter/UseRouter";
import {
  fetchChallengeComments,
  postChallengeComment,
} from "../../services/Challenge/ChallengeComments";
import MarkdownContent from "../MarkdownContent/MarkdownContent";
import TaskCommentInput from "../TaskCommentInput/TaskCommentInput";

const calcHeight = (offset) => {
  const variableHeight = window.innerHeight - offset;
  const minHeight = 300;
  return variableHeight < minHeight ? minHeight : variableHeight;
};

const renderCommentList = ({ osmId, comments, tasksOn, owner }) => {
  return comments.map((comment) => {
    const isUser = comment.osm_id === osmId;
    const isOwner = comment.osm_id === owner;

    if (comment.taskId && !tasksOn) {
      return null;
    }

    return (
      <div
        key={comment.id}
        className={classNames("mr-flex mr-my-3", isUser ? "mr-justify-end" : "")}
      >
        <div
          className={classNames("mr-flex", isUser ? "mr-flex-row-reverse" : "")}
          style={{ maxWidth: "100%" }}
        >
          <div className="mr-px-2 mr-flex-0">
            <div className="mr-w-9">
              <img
                className="mr-block mr-w-9 mr-h-9 mr-rounded-full"
                src={comment.avatarUrl.includes("user_no_image") ? defaultPic : comment.avatarUrl}
                alt=""
              />
            </div>
          </div>
          <div
            className={classNames(
              "mr-p-1 mr-rounded mr-p-2 mr-flex-1 mr-w-full",
              isUser ? "mr-bg-blue-light" : "mr-bg-green-dark",
            )}
            style={{ maxWidth: "80%" }}
          >
            <div>
              <div className="mr-text-sm">
                <Link className="mr-text-yellow" to={`/user/metrics/${comment.osm_username}`}>
                  {comment.osm_username}
                </Link>
                {isOwner && " (Owner)"}
              </div>
              {comment.taskId && (
                <div className="mr-text-sm">
                  <span>Re: </span>
                  <Link to={`/task/${comment.taskId}`}>Task {comment.taskId}</Link>
                </div>
              )}
            </div>
            <div>
              <MarkdownContent className="mr-text-lg" allowShortCodes markdown={comment.comment} />
            </div>
            <div className="mr-text-sm">
              <FormattedTime value={comment.created} hour="2-digit" minute="2-digit" />,{" "}
              <FormattedDate value={comment.created} year="numeric" month="long" day="2-digit" />
            </div>
          </div>
          <div className="mr-flex-0">
            <div className="mr-w-12"></div>
          </div>
        </div>
      </div>
    );
  });
};

const updateScroll = () => {
  const element = document.getElementById("challenge-comments-container");
  if (element) {
    element.scrollTop = element.scrollHeight;
  }
};

const DATA_STATUSES = {
  LOADING: "LOADING",
  DONE: "",
  ERROR: "ERROR",
};

export const ChallengeCommentsPane = (props) => {
  const {
    query: { challengeId },
  } = UseRouter();
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState(DATA_STATUSES.LOADING);
  const [tasksOn, setTasksOn] = useState(false);
  const inputRef = useRef(null);
  const offset = props.offset || 570;

  const submitComment = async () => {
    await postChallengeComment(challengeId, input);
    setInput("");
    getChallengeComments();
  };

  const getChallengeComments = useCallback(async () => {
    const results = await fetchChallengeComments(challengeId);

    if (Array.isArray(results)) {
      setComments(results);
      setStatus(DATA_STATUSES.DONE);
      return setTimeout(updateScroll, 10);
    }

    setStatus(DATA_STATUSES.ERROR);
  }, [challengeId]);

  useEffect(() => {
    getChallengeComments();
  }, [getChallengeComments]);

  return (
    <div id="challengeCommentsPaneRoot">
      <div className="mr-flex mr-justify-end">
        <input
          type="checkbox"
          className="mr-checkbox-toggle mr-ml-4 mr-mr-1"
          checked={tasksOn}
          onChange={() => {
            setTasksOn(!tasksOn);
            setTimeout(updateScroll, 10);
          }}
        />
        <div className="mr-text-sm mr-mx-1">Task Comments</div>
      </div>
      <div
        className="mr-bg-black-15 mr-mt-4"
        id="challengeCommentsPaneHeightContainer"
        style={{ height: calcHeight(offset) }}
      >
        <div id="challenge-comments-container" className="mr-p-3 mr-h-full mr-overflow-scroll">
          {status === DATA_STATUSES.LOADING
            ? "Loading..."
            : renderCommentList({
                osmId: props.osmId,
                comments,
                tasksOn,
                owner: props.owner,
              })}
        </div>
      </div>
      <TaskCommentInput
        value={input}
        commentChanged={setInput}
        submitComment={submitComment}
        maxCharacterCount={5000}
        dropdownPlacement="top-start"
        disableResize
        rows={3}
        inputRef={inputRef}
      />
    </div>
  );
};

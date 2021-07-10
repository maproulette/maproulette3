import React, { useEffect, useState } from "react";
import { FormattedDate, FormattedTime } from "react-intl";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { ChallengeCommentInput } from "./ChallengeCommentInput/ChallengeCommentInput";
import MarkdownContent from "../MarkdownContent/MarkdownContent";
import {
  fetchChallengeComments,
  postChallengeComment,
} from "../../services/Challenge/ChallengeComments";
import { UseRouter } from "../../hooks/UseRouter/UseRouter";

const calcHeight = (offset) => {
  return window.innerHeight - offset;
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
        className={classNames(
          "mr-flex mr-my-3",
          isUser ? "mr-justify-end" : ""
        )}
      >
        <div
          className={classNames("mr-flex", isUser ? "mr-flex-row-reverse" : "")}
        >
          <div className="mr-p-1">{isUser ? "ME" : "AV"}</div>
          <div
            className={classNames(
              "mr-p-1 mr-rounded mr-p-2",
              isUser ? "mr-bg-blue-light" : "mr-bg-green-dark"
            )}
          >
            <div>
              <div className="mr-text-sm">
                <Link
                  className="mr-text-yellow"
                  to={`/user/metrics/${comment.osm_username}`}
                >
                  {comment.osm_username}
                </Link>
                {isOwner && " (Owner)"}
              </div>
              {comment.taskId && (
                <div className="mr-text-sm">
                  <span>Re: </span>
                  <Link to={`/task/${comment.taskId}`}>
                    Task {comment.taskId}
                  </Link>
                </div>
              )}
            </div>
            <div>
              <MarkdownContent
                className="mr-text-lg"
                allowShortCodes
                markdown={comment.comment}
              />
            </div>
            <div className="mr-text-sm">
              <FormattedTime
                value={comment.created}
                hour="2-digit"
                minute="2-digit"
              />
              ,{" "}
              <FormattedDate
                value={comment.created}
                year="numeric"
                month="long"
                day="2-digit"
              />
            </div>
          </div>
          <div style={{ width: 160 }} />
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
  const offset = props.offset || 570;

  const submitComment = async () => {
    await postChallengeComment(challengeId, input);
    setInput("");
    getChallengeComments();
  };

  const getChallengeComments = async () => {
    const results = await fetchChallengeComments(challengeId);

    if (Array.isArray(results)) {
      setComments(results);
      setStatus(DATA_STATUSES.DONE);
      return setTimeout(updateScroll, 10);
    }

    setStatus(DATA_STATUSES.ERROR);
  };

  useEffect(() => {
    getChallengeComments();
  }, [challengeId]);

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
        <div
          id="challenge-comments-container"
          className="mr-p-3 mr-h-full mr-overflow-scroll"
        >
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
      <ChallengeCommentInput
        onSubmit={submitComment}
        submitComment={true}
        maxCharacterCount={1500}
        value={input}
        onChange={setInput}
      />
    </div>
  );
};

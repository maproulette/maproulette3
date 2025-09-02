import _isEmpty from "lodash/isEmpty";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { fetchTopTags } from "../../services/Challenge/TopTags";
import messages from "./Messages";

/**
 * TopTagSuggestions displays the most popular tags for a challenge
 * and allows users to quickly add them to their task
 *
 * @param {Object} props - Component props
 * @param {number} props.challengeId - The id of the challenge to fetch top tags for
 * @param {string} props.currentTags - Comma-separated string of current tags
 * @param {Function} props.onAddTag - Callback function when a tag is clicked
 */
const TopTagSuggestions = (props) => {
  const [loading, setLoading] = useState(true);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (props.challengeId) {
      setLoading(true);
      fetchTopTags(props.challengeId)
        .then((topTags) => {
          if (topTags) {
            setTags(topTags);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [props.challengeId]);

  // Don't render if there are no tags
  if (!loading && _isEmpty(tags)) {
    return null;
  }

  // Parse current tags to avoid duplicates (supports string or array)
  const currentTagsArray = Array.isArray(props.currentTags)
    ? props.currentTags
    : typeof props.currentTags === "string" && props.currentTags.length > 0
      ? props.currentTags.split(/,\s*/)
      : [];

  return (
    <div className="mr-mt-4">
      {loading ? (
        <span className="mr-text-sm mr-text-grey-light">
          <FormattedMessage {...messages.loading} />
        </span>
      ) : (
        <>
          <div className="mr-text-sm mr-text-grey-light mr-mb-1">
            <FormattedMessage {...messages.topTagsLabel} />
          </div>
          <div className="mr-flex mr-flex-wrap">
            {tags.map((tag) => {
              const isAlreadyAdded = currentTagsArray.includes(tag.name);

              return (
                <button
                  key={tag.id}
                  className={`mr-button mr-button--small mr-py-1 mr-text-xs mr-mr-2 mr-mb-2 ${
                    isAlreadyAdded ? "mr-button--disabled" : ""
                  }`}
                  onClick={() => !isAlreadyAdded && props.onAddTag(tag.name)}
                  disabled={isAlreadyAdded}
                  title={isAlreadyAdded ? "Already added" : `Add tag: ${tag.name}`}
                >
                  <span>{tag.name}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default TopTagSuggestions;

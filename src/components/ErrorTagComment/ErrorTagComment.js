import useErrorTagOptions from "../../hooks/UseErrorTagOptions";
import { formatErrorTags } from "../../utils/errorTagUtils";

const ErrorTagComment = ({ errorTags }) => {
  const options = useErrorTagOptions();

  if (options.data) {
    const formattedErrorTags = formatErrorTags(errorTags, options);

    if (formattedErrorTags) {
      const str =
        formattedErrorTags.length > 1 ? formattedErrorTags.join(", ") : formattedErrorTags[0];

      return str || null;
    }
  }

  return null;
};

export default ErrorTagComment;

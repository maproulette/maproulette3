import classNames from "classnames";
import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import usePropertyReplacement from "../../hooks/UsePropertyReplacement/UsePropertyReplacement";
import { processTextContent } from "../../services/Templating/Templating";

/**
 * MarkdownContent normalizes and renders the content of the given markdown
 * string as formatted Markdown.
 *
 * @author [Neil Rotstan](https://github.com/nrotstan)
 */
const MarkdownContent = ({
  markdown,
  properties = {},
  allowPropertyReplacement = false,
  allowShortCodes = false,
  compact = false,
  className,
  ...props
}) => {
  const replacedMarkdown = usePropertyReplacement(markdown, properties, allowPropertyReplacement);

  if (!replacedMarkdown) {
    return null;
  }

  // Process text content and expand short codes if enabled
  const processText = (content) => {
    if (!allowShortCodes) {
      return content;
    }
    return processTextContent(content, { ...props, properties });
  };

  // Simple renderer that processes short codes when needed
  const createRenderer =
    (Component) =>
    ({ children, ...componentProps }) => {
      if (!allowShortCodes) {
        return <Component {...componentProps}>{children}</Component>;
      }

      const processedChildren = Array.isArray(children)
        ? children.map((child) => (typeof child === "string" ? processText(child) : child)).flat()
        : processText(children);

      return <Component {...componentProps}>{processedChildren}</Component>;
    };

  return (
    <div className={classNames("mr-markdown", { "mr-markdown--compact": compact }, className)}>
      <ReactMarkdown
        components={{
          a: ({ _node, ...linkProps }) => (
            <a {...linkProps} target="_blank" rel="nofollow noreferrer" />
          ),
          p: createRenderer("p"),
          h1: createRenderer("h1"),
          h2: createRenderer("h2"),
          h3: createRenderer("h3"),
          h4: createRenderer("h4"),
          h5: createRenderer("h5"),
          h6: createRenderer("h6"),
          li: createRenderer("li"),
          blockquote: createRenderer("blockquote"),
          strong: createRenderer("strong"),
          em: createRenderer("em"),
        }}
      >
        {replacedMarkdown}
      </ReactMarkdown>
    </div>
  );
};

MarkdownContent.propTypes = {
  className: PropTypes.string,
  markdown: PropTypes.string,
  properties: PropTypes.object,
  allowShortCodes: PropTypes.bool,
  allowPropertyReplacement: PropTypes.bool,
  compact: PropTypes.bool,
};

export default MarkdownContent;

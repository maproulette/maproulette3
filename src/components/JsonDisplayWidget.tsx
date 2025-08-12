import { useState } from 'react';

interface JsonDisplayWidgetProps {
  title: string;
  data: unknown;
}

export const JsonDisplayWidget = ({ title, data }: JsonDisplayWidgetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);
  const lines = jsonString.split('\n');
  const displayLines = isExpanded ? lines : lines.slice(0, 5);
  const displayText = displayLines.join('\n');

  return (
    <div className="mt-8 text-left bg-gray-100 p-4 rounded w-full max-w-full">
      <h2 className="text-xl font-semibold mb-2">{title}:</h2>
      <div className="w-full">
        <pre className="text-sm overflow-auto whitespace-pre-wrap break-words w-full">
          {displayText}
          {!isExpanded && lines.length > 5 && <span className="text-gray-500">...</span>}
        </pre>
      </div>
      {lines.length > 5 && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </button>
      )}
    </div>
  );
};

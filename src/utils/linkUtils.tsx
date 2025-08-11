/**
 * Converts linkable field values to external links, otherwise returns plain text
 */
export function valueOrExternalLink(key, value) {
  const linkableFields = ["contact:website", "website", "url"];

  // If the key is one of the known linkable fields and valid, inject a link rather than the raw value
  if (linkableFields.includes(key) && isValidUrl(value)) {
    return (
      <a target="_blank" rel="noopener noreferrer" href={value}>
        {value}
      </a>
    );
  }

  // Otherwise, return the value as plain text
  return <>{value}</>;
}

// Parse and test for usable urls
function isValidUrl(urlText) {
  try {
    // Validate that the url is well-formed
    const url = new URL(urlText);
    // Only allow http and https protocols
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    // If URL is invalid, just return false
  }
  return false;
}

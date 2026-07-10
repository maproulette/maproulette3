import reactResponsive from "react-responsive";

// react-responsive ships a UMD bundle whose MediaQuery component lives on the
// module's `default` export. Vite's browser dependency optimizer hands back the
// whole module namespace for a default import (component on `.default`), while
// vitest unwraps to the component itself. Normalize to the component here so a
// single `import MediaQuery from ".../MediaQuery"` renders in both environments.
const MediaQuery = reactResponsive.default ?? reactResponsive;

export default MediaQuery;

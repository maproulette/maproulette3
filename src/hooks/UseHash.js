import { useState, useCallback, useEffect } from 'react';

/*
 * React hook to observe and change the hash component of the browser window's URL.
 *
 * Returns [hash, setHash], where hash is a string and setHash is a function (string) -> void.
 */
const useHash = () => {
  const [hash, setHash] = useState(() => window.location.hash);

  const onHashChange = useCallback(() => {
    setHash(window.location.hash);
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const updateHash = useCallback(
    (newHash) => {
      if (newHash !== hash) {
        window.location.hash = newHash;
      }
    },
    [hash],
  );

  return [hash, updateHash];
};

export default useHash;

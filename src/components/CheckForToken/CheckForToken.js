import React, { useEffect } from "react";
import { useDispatch } from 'react-redux'
import { UseRouter } from "../../hooks/UseRouter/UseRouter";
import { callback } from "../../services/User/User";

export const CheckForToken = ({ children }) => {
  const {
    query: { code },
  } = UseRouter();
  const dispatch = useDispatch()
  const router = UseRouter();
  const authCode = code;

  useEffect(() => {
    if (authCode) {
      callback(authCode, dispatch).then(() => {
        const queryParams = new URLSearchParams(router.location.search)

        if (queryParams.has('code')) {
          queryParams.delete('code')
          queryParams.delete('state')
          router.history.replace({
            search: queryParams.toString(),
          })

          const redirectUrl = localStorage.getItem('redirect');
          if (redirectUrl) {
            router.push(redirectUrl)
          }
        }
      });

      return;
    }
  }, [authCode]);

  if (!authCode) {
    return children;
  }

  return <div>Verifying session...</div>
};

export default CheckForToken

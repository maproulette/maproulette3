import React, { useEffect, useState } from "react";
import { useDispatch } from 'react-redux'
import { UseRouter } from "../../hooks/UseRouter/UseRouter";
import { callback } from "../../services/User/User";

export const CheckForToken = ({ children }) => {
  const {
    query: { code, state },
    location,
    history,
    push
  } = UseRouter();
  const [verifying, setVerifying] = useState(false)
  const dispatch = useDispatch()
  const authCode = code;

  useEffect(() => {
    if (authCode) {
      const storedState = localStorage.getItem('state')

      if (storedState === state || process.env.NODE_ENV === 'development') {
        setVerifying(true)
        callback(authCode, dispatch).then(() => {
          const queryParams = new URLSearchParams(location.search)
  
          if (queryParams.has('code')) {
            queryParams.delete('code')
            queryParams.delete('state')
            history.replace({
              search: queryParams.toString(),
            })
  
            const redirectUrl = localStorage.getItem('redirect');
  
            setVerifying(false)
            localStorage.removeItem('state');

            if (redirectUrl) {
              push(redirectUrl)
            }
          }
        }).catch(() => {
          setVerifying(false)
          localStorage.removeItem('state');
        });
      } else {
        localStorage.removeItem('state');
      }

      return;
    } else {
      localStorage.removeItem('state');
    }
  }, [authCode]);

  if (verifying) {
    return <div>Verifying session...</div>
  }

  if (!authCode) {
    return children;
  }

  return null;
};

export default CheckForToken

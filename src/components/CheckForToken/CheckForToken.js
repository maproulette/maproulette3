import React, { useEffect, useState } from "react";
import { useDispatch } from 'react-redux'
import { useHistory, useLocation } from 'react-router-dom'
import { UseRouter } from "../../hooks/UseRouter/UseRouter";
import { callback } from "../../services/User/User";

export const CheckForToken = ({ children }) => {
  const {
    query: { code },
  } = UseRouter();
  const dispatch = useDispatch()
  const location = useLocation()
  const history = useHistory()

  const authCode = code;
  // const state = params.state;
  // const username = searchParams.get("username");
  // const sessionToken = searchParams.get("session_token");
  // const [isReadyToRedirect, setIsReadyToRedirect] = useState(false);

  useEffect(() => {
    console.log(authCode);

    if (authCode) {
      callback(authCode, dispatch).then((res) => {
        const queryParams = new URLSearchParams(location.search)

        if (queryParams.has('code')) {
          queryParams.delete('code')
          queryParams.delete('state')
          history.replace({
            search: queryParams.toString(),
          })
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

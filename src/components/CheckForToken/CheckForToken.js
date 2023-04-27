import { useEffect, useState } from "react";
import { UseRouter } from "../../hooks/UseRouter/UseRouter";
import { callback } from "../../services/User/User";

export const CheckForToken = () => {
  const {
    query: { code },
  } = UseRouter();
  const authCode = code;
  // const state = params.state;
  // const username = searchParams.get("username");
  // const sessionToken = searchParams.get("session_token");
  // const [isReadyToRedirect, setIsReadyToRedirect] = useState(false);

  useEffect(() => {
    console.log(authCode);

    if (authCode) {
      callback(authCode).then((res) => {
        console.log(res);
        debugger;
      });

      debugger;

      return;
    }
  }, [authCode]);

  return null;
};

export default CheckForToken

import { useEffect, useState } from "react";
import Endpoint from "../../services/Server/Endpoint";
import { defaultRoutes as api } from "../../services/Server/Server";
import WithCurrentUser from "../HOCs/WithCurrentUser/WithCurrentUser";

const SuperUserToggle = (props) => {
  const [selection, setSelection] = useState(props.initialValue ? "super" : "basic");

  useEffect(() => {
    const localState = props.userChanges[props.userId];
    setSelection(localState || props.initialValue ? "super" : "basic");
  }, [props.userId]);

  const updateValue = async (e) => {
    const value = e.target.value;

    try {
      if (e.target.value === "super") {
        await new Endpoint(api.superUser.addSuperUserGrant, {
          variables: { userId: props.userId },
        }).execute();
      } else {
        await new Endpoint(api.superUser.deleteSuperUserGrant, {
          variables: { userId: props.userId },
        }).execute();
      }

      props.setUserChanges({
        ...props.userChanges,
        [props.userId]: value,
      });
      setSelection(value);
    } catch (e) {
      console.log(e);
    }
  };

  if (props.user?.id !== props.userId) {
    return (
      <div>
        <select
          className={selection === "super" ? "mr-bg-green" : "mr-bg-blue"}
          value={selection}
          onChange={updateValue}
        >
          <option id="basic" key="basic" value="basic">
            Basic User
          </option>
          <option id="super" key="super" value="super">
            Super User
          </option>
        </select>
      </div>
    );
  }

  return <div>Super User</div>;
};

export default WithCurrentUser(SuperUserToggle);

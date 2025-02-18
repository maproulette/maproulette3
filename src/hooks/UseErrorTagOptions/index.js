import { useQuery } from "react-query";
import Endpoint from "../../services/Server/Endpoint";
import { defaultRoutes as api } from "../../services/Server/Server";

const useErrorTagOptions = () => {
  const query = useQuery("errorTags", () =>
    new Endpoint(api.keywords.find, { params: { tagType: "error", limit: 1000 } }).execute(),
  );

  return query;
};

export default useErrorTagOptions;

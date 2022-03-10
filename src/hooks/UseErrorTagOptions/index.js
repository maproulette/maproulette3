import { useQuery } from 'react-query';
import { defaultRoutes as api } from "../../services/Server/Server";
import Endpoint from "../../services/Server/Endpoint";

const useErrorTagOptions = () => {
  const query = useQuery('errorTags', () =>
    new Endpoint(api.keywords.find, { params: { tagType: "error", limit: 1000 } }).execute()
  )

  return query;
}

export default useErrorTagOptions;

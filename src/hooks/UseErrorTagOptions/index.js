import { useQuery } from 'react-query';
import { defaultRoutes as api } from "../../services/Server/Server";
import Endpoint from "../../services/Server/Endpoint";

const useErrorTagOptions = () => {
  const query = useQuery('errorTags', async () => {
    try {
      return await new Endpoint(api.keywords.find, { params: { tagType: "error", limit: 1000 } }).execute();
    } catch (error) {
      console.error('Error fetching error tags:', error)
    }
  })

  return query;
}

export default useErrorTagOptions;

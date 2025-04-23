import { useQuery, useQueryClient } from "react-query";
import Endpoint from "../../services/Server/Endpoint";
import { defaultRoutes as api } from "../../services/Server/Server";

const useErrorTagOptions = () => {
  const queryClient = useQueryClient();
  const query = useQuery("errorTags", () =>
    new Endpoint(api.keywords.find, { params: { tagType: "error", limit: 1000 } }).execute(),
  );

  const toggleKeywordStatus = async (keywordId) => {
    const response = await new Endpoint(api.keywords.toggleStatus, {
      variables: { id: keywordId },
    }).execute();

    if (response) {
      queryClient.setQueryData("errorTags", (oldData) => {
        return oldData.map((tag) => (tag.id === keywordId ? response : tag));
      });
    }

    return response;
  };

  const addKeyword = async (data) => {
    const response = await new Endpoint(api.keywords.add, {
      json: { ...data, tagType: "error", active: true },
    }).execute();

    if (response) {
      queryClient.setQueryData("errorTags", (oldData) => {
        return [...oldData, response];
      });
    }

    return response;
  };

  return {
    ...query,
    toggleKeywordStatus,
    addKeyword,
  };
};

export default useErrorTagOptions;

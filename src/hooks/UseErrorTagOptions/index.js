import { useState, useEffect } from "react";
import Endpoint from "../../services/Server/Endpoint";
import { defaultRoutes as api } from "../../services/Server/Server";

const useErrorTagOptions = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchErrorTags = async () => {
      try {
        setIsLoading(true);
        const response = await new Endpoint(api.keywords.find, {
          params: { tagType: "error", limit: 1000 },
        }).execute();
        setData(response);
        setIsLoading(false);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };

    fetchErrorTags();
  }, []);

  return { data, isLoading, error };
};

export default useErrorTagOptions;

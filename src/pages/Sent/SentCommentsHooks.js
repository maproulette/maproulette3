import { useState } from "react";
import { useDispatch } from "react-redux";
import { fetchUserComments } from "../../services/User/User";

export const useSentComments = (commentType) => {
  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [count, setCount] = useState(0);

  const fetch = async (
    userId,
    sort = { id: "created", desc: true },
    pagination = { page: 0, pageSize: 25 },
  ) => {
    if (userId) {
      setError("");
      setLoading(true);

      const apiFilters = {
        sort: sort.id,
        order: sort.desc ? "DESC" : "ASC",
        page: pagination.page,
        limit: pagination.pageSize,
      };

      const result = await dispatch(fetchUserComments(userId, commentType, apiFilters));

      if (!Array.isArray(result)) {
        setError("An error occurred while fetching data");
        setData([]);
        setCount(0);
      } else {
        setData(result);
        setCount(result?.[0]?.fullCount || 0);
      }

      setLoading(false);
    }
  };

  return { data, fetch, loading, error, count };
};

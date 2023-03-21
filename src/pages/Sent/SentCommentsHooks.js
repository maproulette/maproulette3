import { useState } from 'react';
import { fetchUserTaskComments } from "../../services/User/User"

export const useSentComments = () => {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState("");

  const fetchComments = async () => {
    const taskComments = await fetchUserTaskComments();

    if (taskComments) {
      return setComments(taskComments)
    }

    setError("There was an error")
  }

  return { comments, fetchComments }
}
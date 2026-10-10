import Endpoint from "../../services/Server/Endpoint";
import { defaultRoutes as api } from "../../services/Server/Server";

export const USER = "followData";

export const fetchFollowData = async (userId) => {
  const [following, followers] = await Promise.all([
    new Endpoint(api.user.following, { variables: { userId } }).execute(),
    new Endpoint(api.user.followers, { variables: { userId } }).execute(),
  ]);

  return { user: { id: userId, following, followers } };
};

export const followUser = ({ userId }) =>
  new Endpoint(api.user.follow, { variables: { userId } }).execute();

export const unfollowUser = ({ userId }) =>
  new Endpoint(api.user.unfollow, { variables: { userId } }).execute();

export const blockUser = ({ userId }) =>
  new Endpoint(api.user.block, { variables: { userId } }).execute();

export const unblockUser = ({ userId }) =>
  new Endpoint(api.user.unblock, { variables: { userId } }).execute();

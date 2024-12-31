import { gql } from "@apollo/client";

const USER_IDENTITY = gql`
  fragment UserIdentity on User {
    id
    osmProfile {
      id
      displayName
      avatarURL
    }
  }
`;
const USER_WITH_FOLLOW_DATA = gql`
  fragment UserWithFollowData on User {
    ...UserIdentity

    following { ...UserIdentity }
    followers {
      id
      user {
        ...UserIdentity
      }
      status
    }
  }

  ${USER_IDENTITY}
`;

export const USER = gql`
  query User($id: Long!) {
    user(id: $id) { ...UserWithFollowData }
  }

  ${USER_WITH_FOLLOW_DATA}
`;

export const FOLLOW_USER = gql`
  mutation FollowUser($userId: Long!) {
    follow(id: $userId) { ...UserWithFollowData }
  }

  ${USER_WITH_FOLLOW_DATA}
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userId: Long!) {
    stopFollowing(id: $userId) { ...UserWithFollowData }
  }

  ${USER_WITH_FOLLOW_DATA}
`;

export const BLOCK_USER = gql`
  mutation BlockUser($userId: Long!) {
    blockFollower(id: $userId) { ...UserWithFollowData }
  }

  ${USER_WITH_FOLLOW_DATA}
`;

export const UNBLOCK_USER = gql`
  mutation unblockUser($userId: Long!) {
    unblockFollower(id: $userId) { ...UserWithFollowData }
  }

  ${USER_WITH_FOLLOW_DATA}
`;

export const RECENT_ACTIVITY = gql`
  query Activity($osmIds: [Long!], $limit: Int, $page: Int) {
    recentActions(osmIds: $osmIds, limit: $limit, offset: $page) {
      id
      created
      typeId
      parentId
      parentName
      itemId
      action
      status
      user { ...UserIdentity }
      task {
        id
        location
      }
      challenge {
        id
        name
        general {
          parent {
            id
            displayName
            name
          }
        }
      }
    }
  }

  ${USER_IDENTITY}
`;

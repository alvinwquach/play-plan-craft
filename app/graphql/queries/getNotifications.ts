import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
  query Notifications($filter: String) {
    notifications(filter: $filter) {
      userId
      notifications {
        id
        senderId
        message
        status
        type
        createdAt
        user {
          email
          name
          image
        }
      }
    }
  }
`;
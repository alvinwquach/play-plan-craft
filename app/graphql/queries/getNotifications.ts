import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
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

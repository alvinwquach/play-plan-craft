import { gql } from "@apollo/client";

export const APPROVE_USER = gql`
  mutation ApproveUser($input: ApproveUserInput!) {
    approveUser(input: $input) {
      success
      user {
        id
        email
        name
        organizationId
        pendingApproval
      }
      notification {
        id
        userId
        senderId
        type
        message
        organizationId
        status
        createdAt
        user {
          id
          email
          name
          image
        }
      }
      error {
        message
        code
      }
    }
  }
`;

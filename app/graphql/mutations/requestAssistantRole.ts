import { gql } from "@apollo/client";

export const REQUEST_ASSISTANT_ROLE = gql`
  mutation RequestAssistantRole($input: RequestAssistantRoleInput!) {
    requestAssistantRole(input: $input) {
      success
      error {
        message
        code
      }
    }
  }
`;

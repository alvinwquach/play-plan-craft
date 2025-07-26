import { gql } from "@apollo/client";

export const CREATE_EDUCATOR_ORGANIZATION = gql`
  mutation CreateEducatorOrganization(
    $input: CreateEducatorOrganizationInput!
  ) {
    createEducatorOrganization(input: $input) {
      success
      joined
      organization {
        id
        name
      }
      error {
        message
        code
      }
    }
  }
`;

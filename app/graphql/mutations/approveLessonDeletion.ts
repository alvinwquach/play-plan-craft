import { gql } from "@apollo/client";

export const APPROVE_LESSON_DELETION = gql`
  mutation ApproveLessonDeletion($input: ApproveLessonDeletionInput!) {
    approveLessonDeletion(input: $input) {
      success
      error {
        message
        code
      }
    }
  }
`;

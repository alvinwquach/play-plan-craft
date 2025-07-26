import { gql } from "@apollo/client";

export const DELETE_LESSON_PLAN = gql`
  mutation DeleteLessonPlan($input: DeleteLessonPlanInput!) {
    deleteLessonPlan(input: $input) {
      success
      error {
        message
        code
      }
    }
  }
`;

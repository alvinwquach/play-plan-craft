import { gql } from "@apollo/client";

export const CREATE_LESSON_PLAN = gql`
  mutation CreateLessonPlan($input: CreateLessonPlanInput!) {
    createLessonPlan(input: $input) {
      success
      lessonPlan {
        id
        title
        gradeLevel
        ageGroup
        subject
        theme
        status
        createdAt
        curriculum
        duration
        classroomSize
        learningIntention
        successCriteria
        createdByName
        scheduledDate
      }
      error {
        message
        code
      }
    }
  }
`;

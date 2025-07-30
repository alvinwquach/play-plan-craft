import { gql } from "@apollo/client";

export const APPROVE_LESSON_RESCHEDULE = gql`
  mutation ApproveLessonReschedule($input: ApproveLessonRescheduleInput!) {
    approveLessonReschedule(input: $input) {
      success
      lessonPlan {
        id
        title
        scheduledDate
        gradeLevel
        subject
        theme
        status
        duration
        classroomSize
        curriculum
        learningIntention
        successCriteria
        activities {
          id
          title
          description
          activityType
          durationMins
          engagementScore
          alignmentScore
          feasibilityScore
        }
        alternateActivities {
          activityType
          activities {
            id
            title
            description
            activityType
            durationMins
            engagementScore
            alignmentScore
            feasibilityScore
          }
        }
        supplies {
          name
          quantity
          unit
          note
        }
        tags
        drdpDomains {
          code
          name
          description
          strategies
        }
        standards {
          code
          description
        }
        sourceMetadata {
          name
          url
          description
        }
        citationScore
        created_by_id
        createdAt
        createdByName
      }
      error {
        message
        code
      }
    }
  }
`;

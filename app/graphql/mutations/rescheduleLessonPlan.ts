import { gql } from "@apollo/client";

export const RESCHEDULE_LESSON_PLAN = gql`
  mutation RescheduleLessonPlan($input: RescheduleLessonPlanInput!) {
    rescheduleLessonPlan(input: $input) {
      success
      lessonPlan {
        id
        title
        scheduledDate
        created_by_id
        createdByName
        duration
        gradeLevel
        subject
        theme
        status
        classroomSize
        curriculum
        learningIntention
        successCriteria
        activities {
          id
          title
          activityType
          durationMins
          description
          engagementScore
          alignmentScore
          feasibilityScore
        }
        alternateActivities {
          activityType
          activities {
            id
            title
            activityType
            durationMins
            description
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
        developmentGoals {
          name
          description
        }
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
        tags
      }
      error {
        message
        code
      }
      requestSent
    }
  }
`;

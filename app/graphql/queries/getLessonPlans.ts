import { gql } from "@apollo/client";

export const GET_LESSON_PLANS = gql`
  query GetLessonPlans {
    lessonPlans {
      lessonPlans {
        id
        title
        gradeLevel
        subject
        theme
        status
        duration
        classroomSize
        curriculum
        learningIntention
        successCriteria
        supplies {
          name
          quantity
          unit
          note
        }
        tags
        citationScore
        drdpDomains {
          code
          name
          description
          strategies
        }
        standards {
          code
          description
          source {
            name
            url
            description
          }
        }
        sourceMetadata {
          name
          url
          description
        }
        alternateActivities {
          activities {
            id
            title
            description
            activityType
            durationMins
            engagementScore
            alignmentScore
            feasibilityScore
            source {
              name
              url
              description
            }
          }
        }
        created_by_id
        createdByName
        scheduledDate
      }
      userRole
      isOrganizationOwner
    }
  }
`;

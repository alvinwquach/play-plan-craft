import { getLessonPlans } from "@/app/actions/getLessonPlans";
import { getNotifications } from "@/app/actions/getNotifications";
import { createSchema, createYoga } from "graphql-yoga";

interface NextContext {
  params: Promise<Record<string, string>>;
}

const CustomResponse = Response as typeof Response & {
  json: (data: unknown, init?: ResponseInit) => Response;
};

const { handleRequest } = createYoga<NextContext>({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      enum AgeGroup {
        INFANT
        TODDLER
        PRESCHOOL
        KINDERGARTEN
        GRADE_1
        GRADE_2
        GRADE_3
        GRADE_4
        GRADE_5
        GRADE_6
        GRADE_7
        GRADE_8
        GRADE_9
        GRADE_10
        GRADE_11
        GRADE_12
      }

      enum Subject {
        LITERACY
        MATH
        SCIENCE
        ART
        MUSIC
        PHYSICAL_EDUCATION
        SOCIAL_EMOTIONAL
        HISTORY
        GEOGRAPHY
        STEM
        FOREIGN_LANGUAGE
        COMPUTER_SCIENCE
        CIVICS
        ENGLISH
        MATHEMATICS
        THE_ARTS
        HEALTH_PE
        HUMANITIES_SOCIAL_SCIENCES
        TECHNOLOGIES
        LANGUAGES
        CIVICS_CITIZENSHIP
        SENSORY_DEVELOPMENT
        FINE_MOTOR_SKILLS
        LANGUAGE_DEVELOPMENT
        SOCIAL_STUDIES
        DRAMA
        DANCE
        HEALTH_AND_WELLNESS
        CHARACTER_EDUCATION
        COMMUNITY_SERVICE
        ENGINEERING
        BUSINESS
        ECONOMICS
        PHILOSOPHY
      }

      enum Theme {
        SEASONS
        NATURE
        HOLIDAYS
        EMOTIONS
        COMMUNITY
        ANIMALS
        TRANSPORTATION
        COLORS
        SHAPES
        NUMBERS
        CULTURE
        HISTORY
        SCIENCE_FICTION
        GLOBAL_ISSUES
        LITERATURE
        INDIGENOUS_CULTURE
        AUSTRALIAN_HISTORY
        SUSTAINABILITY
        COLOURS
        TRANSPORT
        SPACE
        OCEANS
        WEATHER
        FAMILY
        CULTURES
        HEROES
        IMAGINATION
        FRIENDSHIP
        HEALTH
        SAFETY
        SCIENCE
        GEOGRAPHY
        ENVIRONMENT
        TECHNOLOGY
        INNOVATION
        CITIZENSHIP
        DIVERSITY
        HERITAGE
        EXPLORATION
        PHYSICS
        BIOLOGY
        CHEMISTRY
        ECONOMICS
        GOVERNMENT
        SOCIALJUSTICE
        GLOBALISSUES
        PHILOSOPHY
        ETHICS
        RESEARCH
        ENTREPRENEURSHIP
        GLOBALCITIZENSHIP
        CAREERDEVELOPMENT
        LEADERSHIP
        CRITICALTHINKING
      }

      enum ActivityType {
        UNKNOWN
        STORYTELLING
        CRAFT
        MOVEMENT
        MUSIC
        EXPERIMENT
        FREE_PLAY
        OUTDOOR
        GROUP_DISCUSSION
        PROJECT
        PRESENTATION
        WRITING
        RESEARCH
        DEBATE
        CODING
        INDIGENOUS_STORY
        QUIZ
        PROJECT_BASED
        HANDS_ON
        DEMONSTRATION
        ROLE_PLAY
        CASE_STUDY
        TEST
        REVIEW_GAME
        FLASHCARDS
        SELF_ASSESSMENT
        PEER_REVIEW
        CLASS_DISCUSSION
        ONLINE_RESEARCH
        DIGITAL_PROJECT
        INTERACTIVE_SIMULATION
        VIRTUAL_FIELD_TRIP
        PROGRAMMING_EXERCISE
        MULTIMEDIA_PRESENTATION
        SCIENCE_FAIR
        ART_PORTFOLIO
        MUSIC_PERFORMANCE
        THEATER_PRODUCTION
        SPORTS_COMPETITION
        SCIENCE_COMPETITION
        RESEARCH_PROJECT
        SERVICE_LEARNING
        ENTREPRENEURSHIP
        ART_EXHIBITION
        MUSIC_RECRITAL
        STUDY_GROUP
        PRACTICE_EXERCISES
        REVIEW_SESSION
        QUIZ_GAME
        SCAVENGER_HUNT
        ESCAPE_ROOM
      }

      enum LessonStatus {
        DRAFT
        PUBLISHED
        ARCHIVED
      }

      enum UserRole {
        EDUCATOR
        ADMIN
        ASSISTANT
      }

      enum Curriculum {
        US
        AUS
      }

      enum NotificationStatus {
        PENDING
        APPROVED
        REJECTED
      }

      enum NotificationType {
        MESSAGE
        ALERT
        REMINDER
        ASSISTANT_REQUEST
        LESSON_DELETION_REQUEST
        EDUCATOR_REQUEST
      }

      type User {
        id: ID!
        email: String!
        name: String!
        role: UserRole!
        createdAt: String!
        image: String
        organizationId: Int
        pendingApproval: Boolean!
        lessonPlans: [LessonPlan!]!
        schedules: [Schedule!]!
        lessonNotes: [LessonNote!]!
        organization: Organization
      }

      type Organization {
        id: ID!
        name: String!
        users: [User!]!
      }

      type Supply {
        name: String!
        quantity: Int!
        unit: String!
        note: String
      }

      type LessonPlan {
        id: ID!
        title: String!
        gradeLevel: String!
        ageGroup: AgeGroup!
        subject: Subject!
        theme: Theme
        status: LessonStatus!
        createdAt: String!
        createdBy: User!
        curriculum: Curriculum!
        duration: Int!
        classroomSize: Int!
        learningIntention: String
        successCriteria: [String!]!
        activities: [Activity!]!
        alternateActivities: [AlternateActivityGroup!]!
        supplies: [Supply!]!
        developmentGoals: [DevelopmentGoal!]!
        lessonNotes: [LessonNote!]!
        standards: [Standard!]!
        drdpDomains: [DrdpDomain!]!
        sourceMetadata: [Source!]!
        citationScore: Int!
        tags: [String!]!
        created_by_id: String!
        createdByName: String!
        scheduledDate: String
      }

      type Activity {
        id: ID!
        title: String!
        description: String!
        activityType: ActivityType!
        durationMins: Int!
        lessonPlan: LessonPlan!
        source: Source!
        engagementScore: Int!
        alignmentScore: Int!
        feasibilityScore: Int!
      }

      type AlternateActivityGroup {
        activityType: ActivityType!
        activities: [Activity!]!
      }

      type Schedule {
        id: ID!
        user: User!
        lessonPlan: LessonPlan!
        date: String!
        startTime: String!
        endTime: String!
      }

      type LessonNote {
        id: ID!
        user: User!
        lessonPlan: LessonPlan!
        note: String!
        createdAt: String!
      }

      type DevelopmentGoal {
        id: ID!
        name: String!
        description: String!
        ageGroup: AgeGroup!
        lessonPlans: [LessonPlan!]!
      }

      type Standard {
        code: String!
        description: String!
        source: Source!
      }

      type DrdpDomain {
        code: String!
        name: String!
        description: String!
        strategies: [String!]!
      }

      type Source {
        name: String!
        url: String!
        description: String!
      }

      type AuthResponse {
        accessToken: String!
        user: User!
      }

      type LessonPlansResponse {
        lessonPlans: [LessonPlan!]!
        userRole: UserRole
        isOrganizationOwner: Boolean!
      }

      type Notification {
        id: ID!
        senderId: String!
        message: String!
        status: NotificationStatus!
        type: NotificationType!
        createdAt: String!
        user: User!
      }

      type NotificationsResponse {
        userId: String
        notifications: [Notification!]!
      }

      type Query {
        greetings: String
        lessonPlans: LessonPlansResponse!
        notifications(filter: String): NotificationsResponse!
      }
    `,
    resolvers: {
      Query: {
        lessonPlans: async () => {

          try {
            const result = await getLessonPlans();

            const {
              success,
              lessonPlans,
              userRole,
              isOrganizationOwner,
              error,
            } = result;

            if (!success || !lessonPlans) {
              console.error("Lesson plans error:", error);
              throw new Error(error || "Failed to fetch lesson plans");
            }

            return {
              lessonPlans,
              userRole,
              isOrganizationOwner,
            };
          } catch (err) {
            console.error("lessonPlans resolver failed:", err);
            throw err;
          }
        },
        notifications: async (_, { filter }) => {
          try {
            const { userId, notifications } = await getNotifications(filter);
            if (!userId || !notifications) {
              throw new Error(
                "Failed to fetch notifications or user not authenticated"
              );
            }

            return {
              userId,
              notifications,
            };
          } catch (err) {
            console.error("Notifications resolver failed:", err);
            throw err;
          }
        },
      },
    },
  }),

  // While using Next.js file convention for routing, we need to configure Yoga to use the correct endpoint
  graphqlEndpoint: "/api/graphql",

  fetchAPI: {
    Response: CustomResponse,
  },
});

export {
  handleRequest as GET,
  handleRequest as POST,
  handleRequest as OPTIONS,
};

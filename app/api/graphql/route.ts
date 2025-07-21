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
      }

      enum Subject {
        LITERACY
        MATH
        SCIENCE
        ART
        MUSIC
        PHYSICAL_EDUCATION
        SOCIAL_EMOTIONAL
      }

      enum ActivityType {
        STORYTELLING
        CRAFT
        MOVEMENT
        MUSIC
        EXPERIMENT
        FREE_PLAY
        OUTDOOR
      }

      enum SupplyStatus {
        AVAILABLE
        LOW
        OUT_OF_STOCK
      }

      enum UserRole {
        EDUCATOR
        ADMIN
        ASSISTANT
      }

      enum LessonStatus {
        DRAFT
        PUBLISHED
        ARCHIVED
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
      }

      type User {
        id: ID!
        email: String!
        name: String!
        role: UserRole!
        createdAt: String!
        lessonPlans: [LessonPlan!]!
        schedules: [Schedule!]!
        suppliesOwned: [UserSupply!]!
        reminders: [Reminder!]!
        lessonNotes: [LessonNote!]!
        organization: Organization
      }

      type Organization {
        id: ID!
        name: String!
        users: [User!]!
      }

      type Supply {
        id: ID!
        name: String!
        unit: String!
        status: SupplyStatus!
        createdAt: String!
        lessonLinks: [LessonPlanSupply!]!
        users: [UserSupply!]!
        reminders: [Reminder!]!
      }

      type UserSupply {
        id: ID!
        user: User!
        supply: Supply!
        quantity: Int!
      }

      type LessonPlan {
        id: ID!
        title: String!
        ageGroup: AgeGroup!
        subject: Subject!
        theme: Theme
        status: LessonStatus!
        createdAt: String!
        createdBy: User!
        activities: [Activity!]!
        supplies: [LessonPlanSupply!]!
        schedules: [Schedule!]!
        tags: [LessonPlanTag!]!
        developmentGoals: [DevelopmentGoal!]!
        lessonNotes: [LessonNote!]!
        reminders: [Reminder!]!
      }

      type Activity {
        id: ID!
        title: String!
        description: String!
        activityType: ActivityType!
        durationMins: Int!
        lessonPlan: LessonPlan!
      }

      type LessonPlanSupply {
        id: ID!
        lessonPlan: LessonPlan!
        supply: Supply!
        quantity: Int!
        note: String
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

      type Reminder {
        id: ID!
        user: User!
        title: String!
        description: String
        dueDate: String!
        completed: Boolean!
        lessonPlan: LessonPlan
        supply: Supply
        createdAt: String!
      }

      type Tag {
        id: ID!
        name: String!
        description: String
        lessonPlans: [LessonPlanTag!]!
      }

      type LessonPlanTag {
        id: ID!
        lessonPlan: LessonPlan!
        tag: Tag!
      }

      type DevelopmentGoal {
        id: ID!
        name: String!
        description: String!
        ageGroup: AgeGroup!
        lessonPlans: [LessonPlan!]!
      }

      type AuthResponse {
        accessToken: String!
        user: User!
      }
      type Query {
        greetings: String
      }
    `,
    resolvers: {
      Query: {
        greetings: () =>
          "This is the `greetings` field of the root `Query` type",
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

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
      # Enums - Strict type-safe values used throughout models
      enum AgeGroup {
        INFANT # 0–12 months
        TODDLER # 1–3 years
        PRESCHOOL # 3–5 years
        KINDERGARTEN # 5–6 years
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
        AVAILABLE # Fully stocked and ready to use
        LOW # Supply is running low
        OUT_OF_STOCK # Supply exhausted and needs restocking
      }

      enum UserRole {
        EDUCATOR # Default user role for educators
        ADMIN # Application administrators
        ASSISTANT # Assistants or helpers with limited rights
      }

      enum LessonStatus {
        DRAFT # Being edited or developed
        PUBLISHED # Ready for use and sharing
        ARCHIVED # No longer active or in use
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

      # User - Represents educators, admins, or assistants
      type User {
        id: ID! # Unique identifier
        email: String! # User's email address
        name: String! # User's display name
        role: UserRole # Nullable until onboarding completes
        isOnboarded: Boolean! # Tracks onboarding completion
        createdAt: String! # Creation timestamp
        updatedAt: String! # Last update timestamp
        lessonPlans: [LessonPlan!]! # Lesson plans created by the user
        schedules: [Schedule!]! # Scheduled lessons for the user
        suppliesOwned: [UserSupply!]! # Supplies owned by the user
        reminders: [Reminder!]! # Reminders created by the user
        lessonNotes: [LessonNote!]! # Notes authored by the user
        organization: Organization # Optional organization the user belongs to
      }

      # Organization - Represents a school, childcare center, or workspace
      type Organization {
        id: ID! # Unique identifier
        name: String! # Organization name
        users: [User!]! # Users associated with the organization
      }

      # Supply - Represents reusable materials or items for lessons
      type Supply {
        id: ID! # Unique identifier
        name: String! # Supply name
        unit: String! # Unit of measurement (e.g., count, liters)
        status: SupplyStatus! # Inventory status
        createdAt: String! # Creation timestamp
        lessonLinks: [LessonPlanSupply!]! # Supplies linked to lesson plans
        users: [UserSupply!]! # Users tracking this supply
        reminders: [Reminder!]! # Reminders associated with this supply
      }

      # UserSupply - Tracks quantities of supplies owned by each user
      type UserSupply {
        id: ID! # Unique identifier
        user: User! # User owning the supply
        supply: Supply! # Supply being tracked
        quantity: Int! # Quantity owned
      }

      # LessonPlan - Represents a lesson plan with details and related entities
      type LessonPlan {
        id: ID! # Unique identifier
        title: String! # Lesson plan title
        ageGroup: AgeGroup! # Target age group
        subject: Subject! # Subject focus
        theme: Theme # Optional theme
        status: LessonStatus! # Life cycle status
        createdAt: String! # Creation timestamp
        createdBy: User! # User who created the lesson plan
        activities: [Activity!]! # Activities within the lesson plan
        supplies: [LessonPlanSupply!]! # Supplies required
        schedules: [Schedule!]! # Scheduled instances
        tags: [LessonPlanTag!]! # Associated tags
        developmentGoals: [DevelopmentGoal!]! # Linked developmental goals
        lessonNotes: [LessonNote!]! # Post-lesson reflections
        reminders: [Reminder!]! # Associated reminders
      }

      # Activity - Represents a single activity within a lesson
      type Activity {
        id: ID! # Unique identifier
        title: String! # Activity title
        description: String! # Activity description
        activityType: ActivityType! # Type of activity
        durationMins: Int! # Duration in minutes
        lessonPlan: LessonPlan! # Parent lesson plan
      }

      # LessonPlanSupply - Links supplies to lessons with quantity and optional notes
      type LessonPlanSupply {
        id: ID! # Unique identifier
        lessonPlan: LessonPlan! # Parent lesson plan
        supply: Supply! # Linked supply
        quantity: Int! # Quantity required
        note: String # Optional notes
      }

      # Schedule - Represents scheduled lessons for users
      type Schedule {
        id: ID! # Unique identifier
        user: User! # User scheduling the lesson
        lessonPlan: LessonPlan! # Scheduled lesson plan
        date: String! # Date of the lesson
        startTime: String! # Start time
        endTime: String! # End time
      }

      # LessonNote - Post-lesson reflections or notes by educators
      type LessonNote {
        id: ID! # Unique identifier
        user: User! # Author of the note
        lessonPlan: LessonPlan! # Parent lesson plan
        note: String! # Note content
        createdAt: String! # Creation timestamp
      }

      # Reminder - User-created task reminders with optional context
      type Reminder {
        id: ID! # Unique identifier
        user: User! # User who created the reminder
        title: String! # Reminder title
        description: String # Optional description
        dueDate: String! # Due date
        completed: Boolean! # Completion status
        lessonPlan: LessonPlan # Optional linked lesson plan
        supply: Supply # Optional linked supply
        createdAt: String! # Creation timestamp
      }

      # Tag - Tags for smart tagging and filtering of lesson plans
      type Tag {
        id: ID! # Unique identifier
        name: String! # Tag name
        description: String # Optional description
        lessonPlans: [LessonPlanTag!]! # Linked lesson plans
      }

      # LessonPlanTag - Links lesson plans to tags
      type LessonPlanTag {
        id: ID! # Unique identifier
        lessonPlan: LessonPlan! # Parent lesson plan
        tag: Tag! # Linked tag
      }

      # DevelopmentGoal - Represents developmental milestones or goals
      type DevelopmentGoal {
        id: ID! # Unique identifier
        name: String! # Goal name
        description: String! # Goal description
        ageGroup: AgeGroup! # Target age group
        lessonPlans: [LessonPlan!]! # Linked lesson plans
      }

      # AuthResponse - Response type for authentication operations
      type AuthResponse {
        user: User # Authenticated user
        accessToken: String # Access token (optional)
        url: String # Redirect URL for OAuth
        error: String # Error message if authentication fails
      }

      # UpdateUserRoleInput - Input for updating user role during onboarding
      input UpdateUserRoleInput {
        role: String! # Role to set (EDUCATOR or ASSISTANT)
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

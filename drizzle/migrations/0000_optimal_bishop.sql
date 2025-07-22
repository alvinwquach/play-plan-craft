CREATE TYPE "public"."ActivityType" AS ENUM('STORYTELLING', 'CRAFT', 'MOVEMENT', 'MUSIC', 'EXPERIMENT', 'FREE_PLAY', 'OUTDOOR', 'GROUP_DISCUSSION', 'PROJECT', 'PRESENTATION', 'WRITING', 'RESEARCH', 'DEBATE', 'CODING', 'INDIGENOUS_STORY', 'QUIZ', 'PROJECT_BASED', 'HANDS_ON', 'DEMONSTRATION', 'ROLE_PLAY', 'CASE_STUDY', 'TEST', 'REVIEW_GAME', 'FLASHCARDS', 'SELF_ASSESSMENT', 'PEER_REVIEW', 'CLASS_DISCUSSION', 'ONLINE_RESEARCH', 'DIGITAL_PROJECT', 'INTERACTIVE_SIMULATION', 'VIRTUAL_FIELD_TRIP', 'PROGRAMMING_EXERCISE', 'MULTIMEDIA_PRESENTATION', 'SCIENCE_FAIR', 'ART_PORTFOLIO', 'MUSIC_PERFORMANCE', 'THEATER_PRODUCTION', 'SPORTS_COMPETITION', 'SCIENCE_COMPETITION', 'RESEARCH_PROJECT', 'SERVICE_LEARNING', 'ENTREPRENEURSHIP', 'ART_EXHIBITION', 'MUSIC_RECRITAL', 'STUDY_GROUP', 'PRACTICE_EXERCISES', 'REVIEW_SESSION', 'QUIZ_GAME', 'SCAVENGER_HUNT', 'ESCAPE_ROOM');--> statement-breakpoint
CREATE TYPE "public"."AgeGroup" AS ENUM('INFANT', 'TODDLER', 'PRESCHOOL', 'KINDERGARTEN', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12');--> statement-breakpoint
CREATE TYPE "public"."Curriculum" AS ENUM('US', 'AUS');--> statement-breakpoint
CREATE TYPE "public"."DrdpDomainCode" AS ENUM('ATL-REG', 'SED', 'LLD', 'COG', 'PD-HLTH');--> statement-breakpoint
CREATE TYPE "public"."LessonStatus" AS ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."Subject" AS ENUM('LITERACY', 'MATH', 'SCIENCE', 'ART', 'MUSIC', 'PHYSICAL_EDUCATION', 'SOCIAL_EMOTIONAL', 'HISTORY', 'GEOGRAPHY', 'STEM', 'FOREIGN_LANGUAGE', 'COMPUTER_SCIENCE', 'CIVICS', 'ENGLISH', 'MATHEMATICS', 'THE_ARTS', 'HEALTH_PE', 'HUMANITIES_SOCIAL_SCIENCES', 'TECHNOLOGIES', 'LANGUAGES', 'CIVICS_CITIZENSHIP', 'SENSORY_DEVELOPMENT', 'FINE_MOTOR_SKILLS', 'LANGUAGE_DEVELOPMENT', 'SOCIAL_STUDIES', 'DRAMA', 'DANCE', 'HEALTH_AND_WELLNESS', 'CHARACTER_EDUCATION', 'COMMUNITY_SERVICE', 'ENGINEERING', 'BUSINESS', 'ECONOMICS', 'PHILOSOPHY');--> statement-breakpoint
CREATE TYPE "public"."SupplyStatus" AS ENUM('AVAILABLE', 'LOW', 'OUT_OF_STOCK');--> statement-breakpoint
CREATE TYPE "public"."Theme" AS ENUM('SEASONS', 'NATURE', 'HOLIDAYS', 'EMOTIONS', 'COMMUNITY', 'ANIMALS', 'TRANSPORTATION', 'COLORS', 'SHAPES', 'NUMBERS', 'CULTURE', 'HISTORY', 'SCIENCE_FICTION', 'GLOBAL_ISSUES', 'LITERATURE', 'INDIGENOUS_CULTURE', 'AUSTRALIAN_HISTORY', 'SUSTAINABILITY', 'COLOURS', 'TRANSPORT', 'SPACE', 'OCEANS', 'WEATHER', 'FAMILY', 'CULTURES', 'HEROES', 'IMAGINATION', 'FRIENDSHIP', 'HEALTH', 'SAFETY', 'SCIENCE', 'GEOGRAPHY', 'ENVIRONMENT', 'TECHNOLOGY', 'INNOVATION', 'CITIZENSHIP', 'DIVERSITY', 'HERITAGE', 'EXPLORATION', 'PHYSICS', 'BIOLOGY', 'CHEMISTRY', 'ECONOMICS', 'GOVERNMENT', 'SOCIALJUSTICE', 'GLOBALISSUES', 'PHILOSOPHY', 'ETHICS', 'RESEARCH', 'ENTREPRENEURSHIP', 'GLOBALCITIZENSHIP', 'CAREERDEVELOPMENT', 'LEADERSHIP', 'CRITICALTHINKING');--> statement-breakpoint
CREATE TYPE "public"."UserRole" AS ENUM('EDUCATOR', 'ADMIN', 'ASSISTANT');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"activity_type" "ActivityType" NOT NULL,
	"duration_mins" integer NOT NULL,
	"lesson_plan_id" integer NOT NULL,
	"source" jsonb NOT NULL,
	"engagement_score" integer NOT NULL,
	"alignment_score" integer NOT NULL,
	"feasibility_score" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "DevelopmentGoal" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"ageGroup" "AgeGroup" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "LessonNote" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"lessonPlanId" integer NOT NULL,
	"note" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"age_group" "AgeGroup" NOT NULL,
	"subject" "Subject" NOT NULL,
	"theme" "Theme",
	"status" "LessonStatus" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by_id" integer NOT NULL,
	"curriculum" "Curriculum" NOT NULL,
	"duration" integer NOT NULL,
	"classroom_size" integer NOT NULL,
	"learning_intention" text,
	"success_criteria" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"standards" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"drdp_domains" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_metadata" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"citation_score" integer NOT NULL,
	"alternate_activities" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"supplies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "LessonPlanDevelopmentGoal" (
	"lessonPlanId" integer NOT NULL,
	"developmentGoalId" integer NOT NULL,
	CONSTRAINT "LessonPlanDevelopmentGoal_lessonPlanId_developmentGoalId_pk" PRIMARY KEY("lessonPlanId","developmentGoalId")
);
--> statement-breakpoint
CREATE TABLE "LessonPlanSupply" (
	"id" serial PRIMARY KEY NOT NULL,
	"lessonPlanId" integer NOT NULL,
	"supplyId" integer NOT NULL,
	"quantity" integer NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "LessonPlanTag" (
	"id" serial PRIMARY KEY NOT NULL,
	"lessonPlanId" integer NOT NULL,
	"tagId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Organization" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Reminder" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"dueDate" timestamp NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"lessonPlanId" integer,
	"supplyId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Schedule" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"lessonPlanId" integer NOT NULL,
	"date" timestamp NOT NULL,
	"startTime" timestamp NOT NULL,
	"endTime" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Supply" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"unit" varchar(50) NOT NULL,
	"status" "SupplyStatus" DEFAULT 'AVAILABLE' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Tag" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" text,
	CONSTRAINT "Tag_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(254) NOT NULL,
	"password" text,
	"name" varchar(100) NOT NULL,
	"role" "UserRole" DEFAULT 'EDUCATOR' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"organizationId" integer,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "UserSupply" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"supplyId" integer NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_lesson_plan_id_lesson_plans_id_fk" FOREIGN KEY ("lesson_plan_id") REFERENCES "public"."lesson_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LessonNote" ADD CONSTRAINT "LessonNote_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LessonNote" ADD CONSTRAINT "LessonNote_lessonPlanId_lesson_plans_id_fk" FOREIGN KEY ("lessonPlanId") REFERENCES "public"."lesson_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LessonPlanDevelopmentGoal" ADD CONSTRAINT "LessonPlanDevelopmentGoal_lessonPlanId_lesson_plans_id_fk" FOREIGN KEY ("lessonPlanId") REFERENCES "public"."lesson_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LessonPlanDevelopmentGoal" ADD CONSTRAINT "LessonPlanDevelopmentGoal_developmentGoalId_DevelopmentGoal_id_fk" FOREIGN KEY ("developmentGoalId") REFERENCES "public"."DevelopmentGoal"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LessonPlanSupply" ADD CONSTRAINT "LessonPlanSupply_lessonPlanId_lesson_plans_id_fk" FOREIGN KEY ("lessonPlanId") REFERENCES "public"."lesson_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LessonPlanSupply" ADD CONSTRAINT "LessonPlanSupply_supplyId_Supply_id_fk" FOREIGN KEY ("supplyId") REFERENCES "public"."Supply"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LessonPlanTag" ADD CONSTRAINT "LessonPlanTag_lessonPlanId_lesson_plans_id_fk" FOREIGN KEY ("lessonPlanId") REFERENCES "public"."lesson_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "LessonPlanTag" ADD CONSTRAINT "LessonPlanTag_tagId_Tag_id_fk" FOREIGN KEY ("tagId") REFERENCES "public"."Tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_lessonPlanId_lesson_plans_id_fk" FOREIGN KEY ("lessonPlanId") REFERENCES "public"."lesson_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_supplyId_Supply_id_fk" FOREIGN KEY ("supplyId") REFERENCES "public"."Supply"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_lessonPlanId_lesson_plans_id_fk" FOREIGN KEY ("lessonPlanId") REFERENCES "public"."lesson_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserSupply" ADD CONSTRAINT "UserSupply_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserSupply" ADD CONSTRAINT "UserSupply_supplyId_Supply_id_fk" FOREIGN KEY ("supplyId") REFERENCES "public"."Supply"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_lesson_plan_idx" ON "activities" USING btree ("lesson_plan_id");--> statement-breakpoint
CREATE INDEX "lesson_note_idx" ON "LessonNote" USING btree ("userId","lessonPlanId");--> statement-breakpoint
CREATE INDEX "lesson_plan_created_by_idx" ON "lesson_plans" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "lesson_plan_development_goal_idx" ON "LessonPlanDevelopmentGoal" USING btree ("lessonPlanId","developmentGoalId");--> statement-breakpoint
CREATE INDEX "lesson_plan_supply_idx" ON "LessonPlanSupply" USING btree ("lessonPlanId","supplyId");--> statement-breakpoint
CREATE INDEX "lesson_plan_tag_idx" ON "LessonPlanTag" USING btree ("lessonPlanId","tagId");--> statement-breakpoint
CREATE INDEX "reminder_idx" ON "Reminder" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "schedule_idx" ON "Schedule" USING btree ("userId","lessonPlanId");--> statement-breakpoint
CREATE INDEX "user_organization_idx" ON "users" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "user_supply_idx" ON "UserSupply" USING btree ("userId","supplyId");
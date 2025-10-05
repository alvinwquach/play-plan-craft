-- Enable pgvector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint

ALTER TYPE "public"."LessonStatus" ADD VALUE 'PENDING_DELETION';--> statement-breakpoint
ALTER TABLE "lesson_plans" ADD COLUMN "embedding" vector(1536);--> statement-breakpoint
CREATE INDEX "lesson_plan_embedding_idx" ON "lesson_plans" USING ivfflat ("embedding" vector_cosine_ops);
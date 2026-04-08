ALTER TABLE "rosters" ALTER COLUMN "date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "rosters" ALTER COLUMN "date" SET DEFAULT now();
CREATE TABLE "rosters" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"name" varchar(100) NOT NULL,
	"service" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

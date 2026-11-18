CREATE TABLE "airports" (
	"iata" varchar(3) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"state" varchar(3),
	"country" varchar(2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"origin_iata" varchar(3) NOT NULL,
	"destination_iata" varchar(3) NOT NULL,
	"departure_date" date NOT NULL,
	"return_date" date,
	"airline_name" text NOT NULL,
	"airline_iata" varchar(3),
	"stops" integer NOT NULL,
	"duration_minutes" integer,
	"total_amount" numeric(12, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"provider" varchar(20) NOT NULL,
	"provider_offer_id" text,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "price_snapshots" ADD CONSTRAINT "price_snapshots_origin_iata_airports_iata_fk" FOREIGN KEY ("origin_iata") REFERENCES "public"."airports"("iata") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "price_snapshots" ADD CONSTRAINT "price_snapshots_destination_iata_airports_iata_fk" FOREIGN KEY ("destination_iata") REFERENCES "public"."airports"("iata") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "airports_country_state_idx" ON "airports" USING btree ("country","state");--> statement-breakpoint
CREATE INDEX "price_snapshots_route_idx" ON "price_snapshots" USING btree ("origin_iata","destination_iata","departure_date");--> statement-breakpoint
CREATE INDEX "price_snapshots_departure_idx" ON "price_snapshots" USING btree ("departure_date");--> statement-breakpoint
CREATE INDEX "price_snapshots_amount_idx" ON "price_snapshots" USING btree ("total_amount");
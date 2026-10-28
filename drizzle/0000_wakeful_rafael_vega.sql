CREATE TABLE `tabs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`position` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `urls` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`visit_count` integer DEFAULT 0 NOT NULL,
	`last_visit_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `urls_url_unique` ON `urls` (`url`);--> statement-breakpoint
CREATE INDEX `urls_last_visit_at_idx` ON `urls` ("last_visit_at" desc);--> statement-breakpoint
CREATE TABLE `visits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url_id` integer NOT NULL,
	`visited_at` integer NOT NULL,
	FOREIGN KEY (`url_id`) REFERENCES `urls`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `visits_url_id_visited_at_idx` ON `visits` (`url_id`,`visited_at`);
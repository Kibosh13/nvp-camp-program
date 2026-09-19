CREATE TABLE `media_assets` (
	`id` text PRIMARY KEY NOT NULL,
	`object_key` text NOT NULL,
	`original_name` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`uploaded_at` integer NOT NULL,
	`uploaded_by` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_object_key_unique` ON `media_assets` (`object_key`);--> statement-breakpoint
CREATE TABLE `site_configs` (
	`id` integer PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`updated_at` integer NOT NULL,
	`updated_by` text NOT NULL
);

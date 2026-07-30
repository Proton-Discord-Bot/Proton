CREATE TABLE `cMessages` (
	`guildId` text PRIMARY KEY NOT NULL,
	`welcomeMessage` text,
	`goodbyeMessage` text,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE TABLE `guilds` (
	`guildId` text PRIMARY KEY NOT NULL,
	`onlineChannelId` text,
	`allChannelId` text,
	`botChannelId` text,
	`welcomeChannelId` text,
	`goodbyeChannelId` text,
	`join2CreateChannelId` text,
	`logChannelId` text,
	`joinRoleId` text,
	`createdAt` integer,
	`updatedAt` integer
);
--> statement-breakpoint
CREATE TABLE `warns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`guildId` text NOT NULL,
	`userId` text NOT NULL,
	`reason` text NOT NULL,
	`createdAt` integer,
	`updatedAt` integer
);

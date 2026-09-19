import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const siteConfigs = sqliteTable("site_configs", {
  id: integer("id").primaryKey(),
  payload: text("payload").notNull(),
  updatedAt: integer("updated_at").notNull(),
  updatedBy: text("updated_by").notNull(),
});

export const mediaAssets = sqliteTable("media_assets", {
  id: text("id").primaryKey(),
  objectKey: text("object_key").notNull().unique(),
  originalName: text("original_name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  uploadedAt: integer("uploaded_at").notNull(),
  uploadedBy: text("uploaded_by").notNull(),
});

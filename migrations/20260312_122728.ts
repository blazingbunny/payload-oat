import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "tenants"
      ADD COLUMN IF NOT EXISTS "theme_tokens" jsonb,
      ADD COLUMN IF NOT EXISTS "custom_css" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "tenants"
      DROP COLUMN IF EXISTS "theme_tokens",
      DROP COLUMN IF EXISTS "custom_css";
  `)
}

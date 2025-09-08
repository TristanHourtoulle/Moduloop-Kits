-- Fix drift: Make surfaceM2 and quantite nullable to match current database state
-- This migration aligns the migration history with the actual database state

-- Make surfaceM2 nullable (this reflects the actual state of the database)
ALTER TABLE "public"."products" ALTER COLUMN "surfaceM2" DROP NOT NULL;

-- Make quantite nullable (this reflects the actual state of the database)  
ALTER TABLE "public"."products" ALTER COLUMN "quantite" DROP NOT NULL;
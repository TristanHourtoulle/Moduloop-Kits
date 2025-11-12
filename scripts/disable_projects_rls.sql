-- Désactiver RLS pour les tables projects
-- Ce script désactive Row Level Security (RLS) sur les tables liées aux projets
-- car l'application utilise Better Auth (pas Supabase Auth) et gère l'autorisation au niveau de l'API

ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "project_kits" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "project_history" DISABLE ROW LEVEL SECURITY;

-- Vérification que RLS est bien désactivé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('projects', 'project_kits', 'project_history');

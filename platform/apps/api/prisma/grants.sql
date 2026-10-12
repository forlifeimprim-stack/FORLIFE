-- Droits du rôle d'exécution « forlife_app » (production) : lecture/écriture des données, rien d'autre.
-- Les migrations sont appliquées par le propriétaire des tables (rôle « forlife ») dans un job séparé ;
-- l'application ne peut ni modifier le schéma, ni réécrire ou vider les journaux en ajout seul.
-- Rejoué à chaque déploiement (idempotent) ; sans effet si le rôle n'existe pas (développement, tests).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'forlife_app') THEN
    GRANT USAGE ON SCHEMA public TO forlife_app;
    GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO forlife_app;
    GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO forlife_app;
    REVOKE UPDATE, DELETE, TRUNCATE ON "AuditLog", "CreditTransaction", "AIUsageEvent" FROM forlife_app;
    REVOKE ALL ON "_prisma_migrations" FROM forlife_app;
  END IF;
END $$;

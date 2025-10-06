-- Vérifier les produits de Paul Levy et leurs prix
SELECT
  p.id,
  p.nom,
  p.reference,
  u.name as created_by,
  u.email,
  -- Anciens champs legacy
  p."prixAchat1An" as legacy_achat_1an,
  p."prixUnitaire1An" as legacy_unitaire_1an,
  p."prixVente1An" as legacy_vente_1an,
  -- Nouveaux champs achat
  p."prixAchatAchat" as new_achat,
  p."prixUnitaireAchat" as new_unitaire,
  p."prixVenteAchat" as new_vente,
  -- Anciens champs avec périodes (deprecated)
  p."prixAchatAchat1An" as deprecated_achat_1an,
  p."prixVenteAchat1An" as deprecated_vente_1an
FROM products p
JOIN users u ON p."createdById" = u.id
WHERE u.name = 'Paul Levy' OR u.email LIKE '%paul%'
ORDER BY p."createdAt" DESC
LIMIT 10;

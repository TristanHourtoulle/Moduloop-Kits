-- Migration des prix d'achat vers les nouveaux champs simplifiés (sans périodes)
-- Ce script copie les données de prixAchatAchat1An vers prixAchatAchat
-- SANS SUPPRIMER les anciennes colonnes (pour sécurité)

-- Mise à jour des prix d'achat
UPDATE products
SET
  "prixAchatAchat" = "prixAchatAchat1An",
  "prixUnitaireAchat" = "prixUnitaireAchat1An",
  "prixVenteAchat" = "prixVenteAchat1An"
WHERE
  "prixAchatAchat1An" IS NOT NULL
  OR "prixUnitaireAchat1An" IS NOT NULL
  OR "prixVenteAchat1An" IS NOT NULL;

-- Vérification du nombre de lignes mises à jour
SELECT
  COUNT(*) as total_products,
  COUNT("prixAchatAchat") as products_with_prix_achat,
  COUNT("prixUnitaireAchat") as products_with_prix_unitaire,
  COUNT("prixVenteAchat") as products_with_prix_vente
FROM products;

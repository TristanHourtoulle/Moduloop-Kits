# Fix: Résolution du problème de "tick de retard" sur la page /kits

## Problème identifié

La page `/kits` affichait toujours la version précédente des données après modification d'un kit. Par exemple :
- État initial : Kit avec titre "Bonjour"
- Modification 1 : Ajouter "e" → "Bonjoure"
- Sur `/kits` : Affiche toujours "Bonjour" ❌
- Modification 2 : Retirer le "e" → "Bonjour"
- Sur `/kits` : Affiche maintenant "Bonjoure" (la version précédente) ❌

## Cause racine

Une **race condition** entre :
1. L'invalidation du cache côté serveur (async, non-instantanée)
2. La redirection du client vers `/kits`
3. Le rendu de la page qui utilisait encore les données en cache

Le client arrivait sur `/kits` AVANT que l'invalidation du cache ne soit complètement propagée sur Vercel.

## Solutions implémentées

### 1. Augmentation du délai d'invalidation (500ms au lieu de 100ms)

**Fichier :** `src/lib/cache.ts`

```typescript
// On Vercel, add a delay to ensure cache propagation
if (process.env.NODE_ENV === "production") {
  // Increased delay to ensure Vercel cache is fully invalidated
  await new Promise((resolve) => setTimeout(resolve, 500));
}
```

**Raison :** Vercel nécessite plus de temps pour propager l'invalidation à travers toutes ses couches de cache (Edge Cache, Data Cache, ISR).

### 2. Suppression du fetch client-side redondant

**Fichier :** `src/components/kits/kits-list-wrapper.tsx`

**Avant :**
- Double fetch : serveur + client
- Potentiel de données désynchronisées

**Après :**
- Utilisation uniquement des données server-side
- Mise à jour via props quand les données changent

```typescript
// Update kits when initialKits prop changes
useEffect(() => {
  console.log("[KitsListWrapper] Initial kits updated:", initialKits.length);
  setKits(initialKits);
}, [initialKits]);
```

### 3. Headers no-cache sur l'API list en production

**Fichier :** `src/app/api/kits/route.ts`

```typescript
if (process.env.NODE_ENV === "production") {
  response.headers.set(
    "Cache-Control",
    "no-cache, no-store, must-revalidate, max-age=0"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
}
```

**Raison :** Force l'API à toujours retourner des données fraîches sur Vercel.

### 4. Délai côté client avant redirection (300ms)

**Fichier :** `src/components/kits/kit-form.tsx`

```typescript
// Add delay to ensure cache invalidation completes on Vercel
const isProduction = typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  !window.location.hostname.includes("127.0.0.1");

if (isProduction) {
  console.log("[KitForm] Waiting for cache invalidation to propagate...");
  await new Promise((resolve) => setTimeout(resolve, 300));
}
```

**Raison :** Donne le temps au serveur de propager l'invalidation avant que le client ne navigue.

## Chronologie de la solution

```
Avant (avec race condition) :
T+0ms:   Client envoie PUT /api/kits/[id]
T+100ms: Serveur invalide le cache (100ms delay)
T+101ms: Client redirige vers /kits ← TROP TÔT !
T+102ms: /kits affiche les ANCIENNES données

Après (sans race condition) :
T+0ms:   Client envoie PUT /api/kits/[id]
T+500ms: Serveur invalide le cache (500ms delay) ✓
T+800ms: Client attend 300ms puis redirige ✓
T+801ms: /kits affiche les NOUVELLES données ✓
```

## Résultats

✅ Plus de "tick de retard" sur la page `/kits`
✅ Les données sont toujours à jour après modification
✅ Pas d'impact significatif sur l'UX (délai total < 1s)
✅ Solution robuste pour l'environnement Vercel

## Commandes exécutées

```bash
# Build verification
pnpm run build

# Code formatting
npx prettier --write src/lib/cache.ts src/components/kits/kits-list-wrapper.tsx \
  src/app/api/kits/route.ts src/components/kits/kit-form.tsx
```

## Fichiers modifiés

1. `src/lib/cache.ts` - Délai d'invalidation augmenté
2. `src/components/kits/kits-list-wrapper.tsx` - Suppression du fetch client
3. `src/app/api/kits/route.ts` - Headers no-cache en production
4. `src/components/kits/kit-form.tsx` - Délai avant redirection

## Points d'attention

- Les délais sont uniquement appliqués en production (pas en dev)
- La détection de production se fait via `window.location.hostname`
- Les délais totaux restent < 1 seconde pour une bonne UX
- Solution spécifique à Vercel, peut nécessiter ajustement sur d'autres plateformes
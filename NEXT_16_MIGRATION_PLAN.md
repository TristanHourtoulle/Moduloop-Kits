# Plan de Migration Next.js 16 - Moduloop Kits

## 📋 Vue d'ensemble

Ce document détaille le plan de migration complet de Next.js 14.2.31 vers Next.js 16 pour le projet Moduloop-Kits.

**Date de création**: 2025-01-17
**Version actuelle**: Next.js 14.2.31
**Version cible**: Next.js 16
**Niveau de difficulté**: ⚠️ **MOYEN** (Breaking changes majeurs)

---

## ✅ Corrections Préalables (Déjà effectuées)

### 1. Cache Complètement Désactivé
- ✅ Ajouté `unstable_noStore()` dans toutes les fonctions DB (`db.ts`)
- ✅ Ajouté `export const revalidate = 0` dans toutes les pages dynamiques
- ✅ Supprimé React `cache()` (incompatible avec l'invalidation Next.js)
- ✅ Supprimé les délais artificiels (500ms)

### 2. Formulaires d'Édition Corrigés
- ✅ Ajout de clés dynamiques basées sur `updatedAt` timestamp
- ✅ Forçage du remontage des composants lors de changements de données
- ✅ Pages concernées : products/[id]/modifier, kits/[id]/modifier, projects/[id]/modifier

---

## 🚨 Breaking Changes Critiques

### 1. ⚠️ Async Params & SearchParams (CRITIQUE)

**Impact**: Toutes les pages et API routes avec `params` ou `searchParams`

#### Changement Requis
```typescript
// ❌ Next.js 14 - Ne fonctionne plus
export default function Page({ params, searchParams }: {
  params: { id: string };
  searchParams: { t?: string };
}) {
  const productId = params.id;
  const timestamp = searchParams.t;
}

// ✅ Next.js 16 - OBLIGATOIRE
export default async function Page({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id: productId } = await params;
  const { t: timestamp } = await searchParams;
}
```

#### Fichiers à Modifier (5 fichiers)

**Pages :**
1. `/src/app/(dashboard)/products/[id]/modifier/page.tsx` (ligne 71-74)
2. `/src/app/(dashboard)/kits/[id]/modifier/page.tsx` (ligne 47-52)
3. `/src/app/(dashboard)/projects/[id]/modifier/page.tsx` (ligne 47-52)

**API Routes :**
4. `/src/app/api/projects/[id]/kits/[kitId]/route.ts`
5. `/src/app/api/admin/users/[id]/role/route.ts`

#### Exemple de Migration pour Products Edit Page

**Avant :**
```typescript
export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { t?: string };
}) {
  const productId = params.id;
  const timestamp = searchParams.t;

  const productData = await getProduct(productId);
  // ...
}
```

**Après :**
```typescript
export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id: productId } = await params;
  const { t: timestamp } = await searchParams;

  const productData = await getProduct(productId);
  // ...
}
```

---

### 2. ⚠️ revalidateTag() - Nouveau Paramètre Obligatoire

**Impact**: Fichier `src/lib/cache.ts` (ligne 27, 59)

#### Changement Requis
```typescript
// ❌ Next.js 14 - Deprecated
revalidateTag(CACHE_TAGS.KITS);
revalidateTag(CACHE_TAGS.PRODUCTS);

// ✅ Next.js 16 - OBLIGATOIRE ajouter cacheLife profile
revalidateTag(CACHE_TAGS.KITS, 'max');
revalidateTag(CACHE_TAGS.PRODUCTS, 'max');
```

#### Profils cacheLife Disponibles
- `'max'` - Cache maximal (recommandé pour SWR behavior)
- `'hours'` - Cache pour quelques heures
- `'minutes'` - Cache pour quelques minutes
- `{ revalidate: 3600 }` - Cache personnalisé (3600 secondes = 1h)

#### Fichier à Modifier
`/src/lib/cache.ts` - Fonctions :
- `invalidateKits()` (ligne 12-21)
- `invalidateKit()` (ligne 23-41)
- `invalidateProducts()` (ligne 43-52)
- `invalidateProduct()` (ligne 54-73)
- `invalidateUsers()` (ligne 75-77)

---

### 3. ⚠️ Async cookies(), headers(), draftMode()

**Impact**: Fichier `src/lib/auth-helpers.ts`

#### Changement Requis
```typescript
// ❌ Next.js 14
const cookieStore = cookies();
const headersList = headers();

// ✅ Next.js 16
const cookieStore = await cookies();
const headersList = await headers();
```

#### Fichier à Modifier
`/src/lib/auth-helpers.ts` - Fonction `getCurrentUserId()` :
```typescript
// Ligne à modifier
const cookieStore = cookies(); // ← Ajouter await
```

---

## 📦 Prérequis Système

### Versions Minimales Requises

| Composant | Version Min | Version Actuelle | Action |
|-----------|-------------|------------------|--------|
| **Node.js** | 20.9+ | À vérifier | `node -v` |
| **TypeScript** | 5.1.0+ | 5.9.2 | ✅ OK |
| **React** | 19.x | 18.x | ⬆️ Upgrade requis |
| **Chrome** | 111+ | - | ✅ OK |

### Vérification Node.js
```bash
node -v
# Si < 20.9, installer Node.js 20 LTS depuis https://nodejs.org/
```

---

## 🚀 Plan de Migration Étape par Étape

### Phase 1 : Préparation (15 min)

#### 1.1 Backup du Code
```bash
git add .
git commit -m "chore: backup before Next.js 16 migration"
git branch backup-next14
```

#### 1.2 Vérifier Node.js
```bash
node -v
# Doit afficher >= 20.9
```

#### 1.3 Installer Next.js Codemod
```bash
npm install -g @next/codemod@latest
```

---

### Phase 2 : Upgrade des Dépendances (10 min)

#### 2.1 Upgrade Automatique
```bash
npx @next/codemod@canary upgrade latest
```

Cela va upgrader automatiquement :
- next@latest
- react@latest (19.x)
- react-dom@latest (19.x)
- typescript@latest (si configuré)

#### 2.2 Vérification package.json
```json
{
  "dependencies": {
    "next": "^16.0.0",  // ← Doit être 16.x
    "react": "^19.0.0",  // ← Doit être 19.x
    "react-dom": "^19.0.0"  // ← Doit être 19.x
  }
}
```

#### 2.3 Réinstallation
```bash
rm -rf node_modules package-lock.json pnpm-lock.yaml
pnpm install
```

---

### Phase 3 : Modifications du Code (30 min)

#### 3.1 Modifier les Pages avec Params

**Fichier 1: products/[id]/modifier/page.tsx**
```typescript
// Ligne 69-74
// AVANT
export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { t?: string };
}) {
  const productId = params.id;
  const timestamp = searchParams.t;

// APRÈS
export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id: productId } = await params;
  const { t: timestamp } = await searchParams;
```

**Fichier 2: kits/[id]/modifier/page.tsx**
```typescript
// Ligne 45-52
// AVANT
export default async function EditKitPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { t?: string };
}) {
  const kitId = params.id;
  const timestamp = searchParams.t;

// APRÈS
export default async function EditKitPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id: kitId } = await params;
  const { t: timestamp } = await searchParams;
```

**Fichier 3: projects/[id]/modifier/page.tsx**
```typescript
// Ligne 45-52
// AVANT
export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { t?: string };
}) {
  const projectId = params.id;
  const timestamp = searchParams.t;

// APRÈS
export default async function EditProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id: projectId } = await params;
  const { t: timestamp } = await searchParams;
```

#### 3.2 Modifier les API Routes

**⚠️ Important**: Dans les API routes, `params` est **déjà une Promise** dans Next.js 14+, donc le changement est minimal.

**Fichier 1: api/projects/[id]/kits/[kitId]/route.ts**
```typescript
// Vérifier que vous utilisez déjà :
const { id, kitId } = await params; // ✅ Déjà correct

// Si ce n'est pas le cas, ajouter await
```

**Fichier 2: api/admin/users/[id]/role/route.ts**
```typescript
// Vérifier que vous utilisez déjà :
const { id } = await params; // ✅ Déjà correct

// Si ce n'est pas le cas, ajouter await
```

#### 3.3 Modifier revalidateTag() dans cache.ts

**Fichier: src/lib/cache.ts**

```typescript
// Ligne 13
// AVANT
revalidateTag(CACHE_TAGS.KITS);

// APRÈS
revalidateTag(CACHE_TAGS.KITS, 'max');

// ---

// Ligne 27
// AVANT
revalidateTag(CACHE_TAGS.KITS);

// APRÈS
revalidateTag(CACHE_TAGS.KITS, 'max');

// ---

// Ligne 45
// AVANT
revalidateTag(CACHE_TAGS.PRODUCTS);

// APRÈS
revalidateTag(CACHE_TAGS.PRODUCTS, 'max');

// ---

// Ligne 59
// AVANT
revalidateTag(CACHE_TAGS.PRODUCTS);

// APRÈS
revalidateTag(CACHE_TAGS.PRODUCTS, 'max');

// ---

// Ligne 76
// AVANT
revalidateTag(CACHE_TAGS.USERS);

// APRÈS
revalidateTag(CACHE_TAGS.USERS, 'max');
```

#### 3.4 Modifier auth-helpers.ts

**Fichier: src/lib/auth-helpers.ts**

```typescript
// Dans getCurrentUserId()
// AVANT
const cookieStore = cookies();

// APRÈS
const cookieStore = await cookies();
```

---

### Phase 4 : Test et Validation (20 min)

#### 4.1 Build Test
```bash
pnpm build
```

**Attendu**: ✅ Build réussi sans erreurs

**Si erreurs**:
- Vérifier que tous les `params` sont awaités
- Vérifier que tous les `cookies()` sont awaités
- Vérifier que tous les `revalidateTag()` ont 2 paramètres

#### 4.2 Dev Test
```bash
pnpm dev
```

#### 4.3 Tests Fonctionnels

**Test 1: Édition de Produit**
1. Aller sur `/products`
2. Cliquer sur "Modifier" un produit
3. Modifier le nom
4. Sauvegarder
5. Vérifier que la liste `/products` affiche le nouveau nom
6. Retourner sur l'édition
7. ✅ Vérifier que le formulaire affiche les nouvelles valeurs

**Test 2: Édition de Kit**
1. Aller sur `/kits`
2. Cliquer sur "Modifier" un kit
3. Modifier le nom et les produits
4. Sauvegarder
5. Vérifier que la liste `/kits` affiche le nouveau nom
6. Retourner sur l'édition
7. ✅ Vérifier que le formulaire affiche les nouvelles valeurs

**Test 3: Édition de Projet**
1. Aller sur `/projects`
2. Cliquer sur "Modifier" un projet
3. Modifier le nom et les kits
4. Sauvegarder
5. Vérifier que la liste `/projects` affiche le nouveau nom
6. Retourner sur l'édition
7. ✅ Vérifier que le formulaire affiche les nouvelles valeurs

#### 4.4 Test d'Invalidation de Cache
1. Créer un nouveau produit
2. ✅ Vérifier qu'il apparaît immédiatement dans la liste
3. Modifier ce produit
4. ✅ Vérifier que les changements apparaissent immédiatement

---

## 🎯 Nouvelles Fonctionnalités Next.js 16 (Optionnelles)

### 1. Cache Components (Nouveau système de cache opt-in)

Next.js 16 introduit un nouveau système de cache avec la directive `"use cache"`:

```typescript
// Exemple - À utiliser pour optimiser les performances
"use cache";

export async function ExpensiveComponent() {
  const data = await fetchExpensiveData();
  return <div>{data}</div>;
}
```

**Avantages**:
- Cache opt-in (plus de cache implicite)
- Génération automatique de clés de cache
- Meilleure prédictibilité

**Recommandation**:
- ⏰ **Ne pas implémenter immédiatement**
- ✅ Attendre que le système actuel fonctionne bien
- 📈 Utiliser pour optimiser les composants lents plus tard

### 2. proxy.ts (Remplacement de middleware.ts)

Next.js 16 introduit `proxy.ts` pour le Node.js runtime:

```typescript
// proxy.ts (nouveau)
export function proxy(request: NextRequest) {
  // Logique d'interception
  return NextResponse.next();
}
```

**Recommandation**:
- ⏰ **Ne pas migrer immédiatement**
- ✅ Garder `middleware.ts` existant (toujours supporté)
- 📈 Migrer vers `proxy.ts` plus tard si besoin

### 3. Amélioration des Logs

Next.js 16 affiche maintenant :
- Temps de compilation
- Temps de rendu pour chaque page
- Durée de chaque étape du build

✅ **Automatique - Aucune action requise**

---

## ⚠️ Risques et Mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| **Incompatibilité des dépendances** | Moyenne | Élevé | Tester chaque dépendance individuellement |
| **Erreurs de TypeScript** | Faible | Moyen | React 19 types sont stables |
| **Régression des formulaires** | Faible | Élevé | Tests manuels complets |
| **Problèmes de cache** | Faible | Moyen | Cache déjà désactivé |
| **Erreurs d'API routes** | Faible | Élevé | Vérifier tous les params awaités |

### Stratégie de Rollback

Si problèmes critiques après migration :

```bash
# Retour à Next.js 14
git checkout backup-next14
pnpm install
pnpm dev
```

---

## 📊 Checklist de Migration

### Préparation
- [ ] Backup du code (branch backup-next14)
- [ ] Node.js >= 20.9 vérifié
- [ ] Codemod CLI installé

### Upgrade
- [ ] `npx @next/codemod@canary upgrade latest` exécuté
- [ ] `pnpm install` exécuté
- [ ] package.json vérifié (next@16.x, react@19.x)

### Modifications du Code
- [ ] products/[id]/modifier/page.tsx - params async
- [ ] kits/[id]/modifier/page.tsx - params async
- [ ] projects/[id]/modifier/page.tsx - params async
- [ ] api/projects/[id]/kits/[kitId]/route.ts - params awaité
- [ ] api/admin/users/[id]/role/route.ts - params awaité
- [ ] src/lib/cache.ts - revalidateTag() avec cacheLife
- [ ] src/lib/auth-helpers.ts - await cookies()

### Tests
- [ ] `pnpm build` réussi
- [ ] `pnpm dev` démarre sans erreur
- [ ] Test édition produit OK
- [ ] Test édition kit OK
- [ ] Test édition projet OK
- [ ] Test invalidation cache OK
- [ ] Tests fonctionnels complets OK

### Déploiement
- [ ] Commit des changements
- [ ] Push vers remote
- [ ] Déploiement Vercel OK
- [ ] Tests en production OK

---

## 📝 Résumé des Changements

### Fichiers à Modifier (8 fichiers)

1. ✏️ `/src/app/(dashboard)/products/[id]/modifier/page.tsx`
2. ✏️ `/src/app/(dashboard)/kits/[id]/modifier/page.tsx`
3. ✏️ `/src/app/(dashboard)/projects/[id]/modifier/page.tsx`
4. ✏️ `/src/app/api/projects/[id]/kits/[kitId]/route.ts`
5. ✏️ `/src/app/api/admin/users/[id]/role/route.ts`
6. ✏️ `/src/lib/cache.ts`
7. ✏️ `/src/lib/auth-helpers.ts`
8. ✏️ `package.json` (via codemod)

### Lignes de Code Estimées : ~40 lignes

### Temps Estimé : 1h15 (hors tests)
- Préparation : 15 min
- Upgrade : 10 min
- Modifications : 30 min
- Tests : 20 min

---

## 🎉 Avantages de la Migration

### Performance
- ✅ Turbopack stable et rapide
- ✅ Meilleure gestion du cache (opt-in)
- ✅ Build times améliorés

### Développement
- ✅ Logs plus informatifs
- ✅ Debugging amélioré avec DevTools MCP
- ✅ Async Request APIs plus propres

### Maintenance
- ✅ Support de React 19
- ✅ Support à long terme de Next.js 16
- ✅ Moins de workarounds nécessaires

---

## 📞 Support

**En cas de problème**:
1. Consulter la doc officielle : https://nextjs.org/docs/app/guides/upgrading/version-16
2. Rollback vers backup-next14
3. Créer un issue GitHub avec logs d'erreur

---

**Document créé le**: 2025-01-17
**Dernière mise à jour**: 2025-01-17
**Version**: 1.0
**Auteur**: Claude Code

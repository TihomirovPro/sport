# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# powerProgress — Claude Reference

## Commands

```bash
npm run dev       # dev server (SPA, port 3000)
npm run build     # production build
npm run typecheck # TypeScript check (nuxi typecheck)
npm run lint      # alias for typecheck
npm run test      # Node built-in test runner (no test files yet)
```

## Stack
- **Nuxt 4.1.1** (Vue 3, SSR disabled = SPA), **TypeScript strict**, **Pinia 3**, **Tailwind CSS 4**
- **Firebase** (Auth + Realtime DB), **IndexedDB** (local cache via `pp-storage`), **PWA** (Workbox)
- Templates: **Pug syntax** (not HTML `<template>`)
- Chart.js + vue-chartjs, vuedraggable

## Directory Layout

**Feature-Sliced Design (FSD).** Migration is complete — no legacy `stores/`, `components/`, or `composables/` directories.

```
shared/
  api/     # firebaseInit.ts, offlineState.ts, firebase/, storage/, platform/
  config/  # enums.ts, storageKeys.ts
  lib/     # useDebounceFn.ts, useNotifications.ts
  model/   # useAppStore.ts, useCatalogStore.ts (global/shared stores)
  ui/      # Button, Toggle, InputRange, Icon, Modal, GlobalNotifications…
features/
  workout/ → model/, api/, lib/, ui/
  exercise/ → model/, api/, ui/
  measure/ → model/, api/
  user/    → model/, api/
  weight/  → model/, api/
widgets/
  header/ui/  # Header.vue
pages/      # nested routes under /exercise/[id]/
plugins/    # 4 client-only init plugins (numbered for order)
middleware/ # auth.global.ts
```

Component auto-import paths (nuxt.config.ts):
```typescript
{ path: '~/shared/ui', prefix: 'Ui', pathPrefix: false }
{ path: '~/widgets/header/ui', pathPrefix: false }
{ path: '~/features/exercise/ui', pathPrefix: false }
{ path: '~/features/workout/ui', pathPrefix: false }
```

## Key Types

**`shared/config/enums.ts`**
```typescript
const enum EnumEase {
  noWeight = 'Свой вес'   // bodyweight
  weight   = 'С весом'    // added weight
  rubber   = 'В резине'   // resistance band
}
```

**`features/exercise/model/types.ts`**
```typescript
interface TypeExercise {
  id: string; name: string; ease: EnumEase[]
  order: number; color?: string; icon?: string
  isComplex?: boolean; complexDesc?: string; complexItems?: string[]
}
```

**`features/workout/model/types.ts`**
```typescript
interface TypeWorkout {
  id: string; exercisesId: string; date: number
  interval: string        // rest minutes as string e.g. "2.5"
  ease: EnumEase; rpe?: number
  rubber?: string         // band name if ease === rubber
  desc?: string; complexExercises?: string[]; rounds?: number
  approach: number[]      // reps per set
  weight?: number[]       // weight per set
  res: number             // total reps (or seconds for complex)
  resWeigth: number       // Σ(weight[i] × approach[i])
}
```

## Pinia Stores

Feature stores: `features/{name}/model/store.ts`. Shared/global stores: `shared/model/`.

| Store | Location | State | Notes |
|-------|----------|-------|-------|
| `useWorkoutStore` | `features/workout/model/` | `workouts`, `filteredWorkouts`, `workoutsLoaded`, `selectUpdateWorkout`, `activeFilters {ease,interval,approach}`, `formDefaults` | `resolveFormDefaults(availableEases)` |
| `useExerciseStore` | `features/exercise/model/` | `allExercises`, `allExercisesLoaded`, `activeExercise`, `selectUpdateExercise` | `setActiveExercise()` persists to IDB |
| `useUserStore` | `features/user/model/` | `uid, name, email, photoURL, status ('user'\|'admin')` | — |
| `useWeightStore` | `features/weight/model/` | `entries: WeightEntry[]`, `lastWeight` (computed) | sorted by createdAt DESC |
| `useMeasureStore` | `features/measure/model/` | `measureTypes`, `measureEntries` (by type), `activeMeasure` | — |
| `useCatalogStore` | `shared/model/` | `rubbersColor: {name,color}[]`, `rubbers`, `icons[]`, `colors[]` | `saveRubbers()`, `resetRubbers()` |
| `useAppStore` | `shared/model/` | `headerTitle`, `hideFilterTitles` | `hideFilterTitles` persisted to IDB |

## Firebase DB Paths (all under `users/{uid}/`)
```
user                                     # profile: name, email, photoURL, status, rubbersColor
user/weights/{autoKey}                   # { value: number, createdAt: number }
exercises/{exerciseId}                   # shared across all users — NOT under user/
workout/{exerciseId}/{id}                # TypeWorkout
progression/appliedSuggestions/{autoKey} # logged suggestions
progression/settings/{exerciseId}        # { repMin, repMax }
.info/connected                          # Firebase connection state
```

### CRUD Functions (`shared/api/firebaseInit.ts`)
```typescript
createData<T>(path, data)            // → auto key (offline-safe)
createDataWithoutKey<T>(path, data)  // direct set
updateData<T>(path, data)            // merge update
removeData(path)                     // delete
onData(path, callback)               // live subscription → returns unsubscribe
// All paths relative to users/{uid}/
```

## IndexedDB Keys (`shared/config/storageKeys.ts`)
`IDB_KEYS`: `LAST_AUTH_UID`, `OFFLINE_QUEUE`, `OFFLINE_CACHE`, `NEW_WORKOUT` (draft form), `APPROACHES` (draft), `HIDE_FILTER_TITLES`, `BASE_COLOR`, `PROGRESSION_SETTINGS`

## Key Composables / APIs

| File | Responsibility |
|------|----------------|
| `features/workout/api/useWorkoutForm.ts` | Form state, `validateWorkout()`, `reset()`, `clearDraftStorage()` |
| `features/workout/api/useWorkoutPersistence.ts` | `add()`, `updateSelectWorkout()`, `removeSelectWorkout()` — optimistic updates |
| `features/workout/api/useWorkoutProgressionUI.ts` | Progression suggestions, `canManageProgression` (admin-only), `applyProgressionSuggestion()` |
| `features/workout/api/useWorkoutProgressionSettings.ts` | Per-exercise `progressionRepMin`/`progressionRepMax`; syncs Firebase ↔ IDB |
| `features/workout/lib/useProgressionTest.ts` | Pure algorithm: `computeProgressionSuggestion()`, confidence 0–1 |
| `features/workout/lib/helpers.ts` | `safeParseJson`, `normalizeWorkoutDate`, `parseDurationToSeconds`, `normalizeRpe` |
| `shared/api/firebase/offlineQueue.ts` | `enqueueOperation()`, `flushOfflineQueue()`, backoff 1.5s→30s |
| `shared/api/firebase/offlineCache.ts` | `readCachedPath()`, `updateCachedPath()`, `emitCachedSnapshot()` |
| `shared/api/offlineState.ts` | `{ isOnline, pendingOperations, retryDelay }` — global reactive state |
| `features/user/api/useUser.ts` | `initUser()` — auth lifecycle, user doc creation, `prepareLogout()` |

## Offline-First Architecture
1. **`onData`** emits cached snapshot immediately, then live FB updates
2. **Writes**: try Firebase → on failure → `enqueueOperation` + `updateCachedPath`
3. **Flush**: on reconnect (`.info/connected`) → `flushOfflineQueue()` with backoff
4. **Cold start**: cached UID from IDB allows offline session without auth round-trip
5. **iOS**: `navigator.onLine` unreliable → always `true`; real state via FB `.info/connected`

## Auth & Routing
- `plugins/init-auth.client.ts` → calls `initUser()`; on login also calls `getAllExercises()`; on logout clears all store data (exercises, workouts, weights)
- `middleware/auth.global.ts` — public routes: `['login']`; auth timeout 2.5s; falls back to cached UID
- Plugin init order: `0.init-storage` → `init-auth` → `offline-sync` → `global-error-handler`

## Pages & Routes
| Route | Purpose |
|-------|---------|
| `/` | Exercise list, draggable sort |
| `/exercise/new` | Create exercise |
| `/exercise/[id]` | Workout list for exercise |
| `/exercise/[id]/edit` | Edit exercise |
| `/exercise/[id]/workout` | Create/edit workout form |
| `/weight` | Weight tracking + chart |
| `/settings` | App settings |
| `/measure` | Measurements |
| `/measure-item` | Measurement detail |
| `/login` | Google OAuth |

## Important Business Rules
- **Admin-only**: Progression suggestions only visible to `status === 'admin'`
- **Complex workouts**: `res` = seconds, no weight/rubber/rpe/interval fields
- **`resWeigth`**: `Σ(weight[i] × approach[i])` — total volume (typo is intentional, matches DB)
- **`interval`**: stored as string (e.g. `"2.5"`), not number
- **RPE**: 1–10, one value per session (last/hardest set); omitted from DB if undefined
- **Rubber**: only when `ease === 'В резине'`; value is name from `catalogStore.rubbers`
- **Progression profile key**: `sets:N|interval:M` — different sets/interval = separate profile
- **Exercises**: shared across all users (`exercises/` path, not under `user/`)

## Progression / Recommendation System

**Files:** `useProgressionTest.ts` (pure algorithm) · `useWorkoutProgressionUI.ts` (Vue composable) · `useWorkoutProgressionSettings.ts` (admin repMin/repMax)

**Visibility** (all must be true): `status === 'admin'`, not editing, not complex, ease ≠ rubber, ≥1 valid session.

**Profile key**: `sets:N|interval:M` — sessions grouped by this key, analyzed independently.

### Algorithm: `computeProgressionSuggestion()` (`ease === 'С весом'`)

**Validation:** drops sessions with invalid timestamp, NaN reps/weights, mismatched array lengths, reps > 300, weight > 2000 kg. RPE defaults to 8 if missing.

**Auto-detected:** `autoBaseIncrementKg` = median weight deltas [0.5–5.0 kg]; `autoRepRange` = median min/max reps, fallback [6,8].

**RPE adjustment:** `adjustedRpe = rpe + penalty` where penalty = 0.45/0.35/0.2/0.1/0 for ≤0/≤1/≤1.5/<2/≥2 min rest.

**Classification:** `success` = `minReps >= repMax AND adjustedRpe <= 8`; `overload` = `minReps < repMin OR adjustedRpe >= 9.5`

**Adaptive increment:** `conservative` −50% (overloadRate ≥ 35% OR avgRpe ≥ 9); `aggressive` +150% (successRate ≥ 55% AND overloadRate ≤ 15% AND avgRpe ≤ 8.2); else `neutral`

**Decision tree:**
```
< 2 sessions          → bootstrap (repeat last weight/reps)
stagnation/overload   → decrease (weight -= stepKg, reps = repMin)
minReps >= repMax AND adjustedRpe <= 8 AND successRate >= 40%:
  highVariability + ascending  → increase
  highVariability + descending → hold (stableHoldReps)
  no variability               → increase
default               → hold (stableHoldReps)
```
`highVariability`: spread ≥ 3 reps OR (max−min)/avg ≥ 35% (requires ≥3 sets).  
`stableHoldReps`: median of last session's reps, all sets.

### Algorithm: `computeBodyweightRepsSuggestion()` (`ease === 'Свой вес'`)
Same structure. Success uses `maxReps >= repMax AND adjustedRpe <= 8.5`. Overload adds `overloadRate >= 45%`. Decrease = median clamped to `[repMin, repMax-1]`. Increase = reps +1 per set.

### RPE zones: ≤8 allows increase · 8.1–9.4 hold · ≥9.5 immediate decrease

### Confidence score
```
0.45 base + min(sessions,8)×0.05 − (dropped/total)×0.25 − intervalPenalty×0.15 − 0.10 if rpe≥9.5
clamped [0.2, 0.98]; bootstrap capped 0.55
```
Levels: `low` < 0.5 · `medium` < 0.75 · `high` ≥ 0.75

## Critical Timeouts
| | Value |
|--|-------|
| Firebase write | 4.5s (→1.5s after failures) |
| Auth resolve | 2.5s |
| Offline queue backoff | 1.5s → 30s |
| Queue TTL | 30 days |
| Toast dismiss | 5s |
| User doc creation | 3s |

## Nuxt Config
```typescript
ssr: false
modules: ['@pinia/nuxt', '@vite-pwa/nuxt', '@nuxtjs/color-mode']
colorMode: { preference: 'system', fallback: 'light' }
// Firebase config via runtimeConfig.public.*
// CSP allows: *.firebaseio.com, *.firebasedatabase.app, apis.google.com
```

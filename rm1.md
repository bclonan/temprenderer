Got it. Below is the **full approach summary** (what we added + how it’s architected), plus the **exact Vue additions** updated so the route uses **`:encId` always**, and a **shared PageLoader component** you can drop into `packages/shared` and use on every screen.

---

# 1) The approach (end-to-end, how it’s architected)

## What you’re building

A **screen-first** architecture where each Vue page is a thin wrapper around:

* a **Screen DTO** (what the page needs)
* a reusable **Screen Controller composable** (`useScreenController`)
* a reusable **PageLoader** component
* a **convention-based backend**: `/api/{ScreenName}/{ActionName}`

This replaces your legacy pattern of:

* per-screen “data classes”
* per-screen custom controllers in Vue
* repeated load/save logic

…and keeps the mental model close to your VB.NET structure:

* `Controller` → `Helper` → `Model/DTO`

---

## Why it’s clean

### Shared package (`packages/shared`) owns all “plumbing”

* HTTP normalization (envelope + legacy support)
* endpoint building
* a screen-aware API wrapper
* a generic controller composable (CRUD + custom actions)
* a shared PageLoader component

### Each module (`packages/participant`, `packages/employer`) owns “features”

* DTO files
* pages (screens)
* routes

### Shell (if used) owns global routing/auth/navigation

* shells mount module routes
* modules don’t own history/auth decisions

---

## The golden contract

### Frontend conventions

* Page route includes `:encId` and passes it to server calls
* Every screen calls `GetPageLoadInfo` (required)
* Screen loads “detail” based on `encId` (custom method like `GetDetail`)
* Save uses `Update` (or `Save` if you decide)

### Backend conventions

For screen name `ParticipantDetail`:

* `/api/ParticipantDetail/GetPageLoadInfo`
* `/api/ParticipantDetail/GetDetail`
* `/api/ParticipantDetail/Update`
* `/api/ParticipantDetail/Deactivate` (optional)

Return shape ideally:

```json
{ "ok": true, "data": {...}, "message": "" }
```

…but we also support legacy shapes via `http.ts` normalization.

---

# 2) What we added (inventory)

## Shared additions (`packages/shared`)

* `src/services/http.ts`
  Fetch wrapper + response normalization (envelope + legacy + raw DTO)
* `src/services/endpoints.ts`
  Builds `/api/{screen}/{action}`
* `src/services/screenApi.ts`
  Calls screen actions
* `src/composables/useScreenController.ts`
  Reusable controller: `dto`, `error`, `isBusy`, `validationErrors`, `crud`, `action()`
* `src/components/PageLoader.vue` ✅ (added below)

## Participant additions (`packages/participant`)

* `src/dto/ParticipantDetail/ParticipantDetailDTO.ts`
* `src/pages/ParticipantDetail/ParticipantDetailScreen.vue`
* `src/router/routes.ts` entry using `:encId`

---

# 3) The `:encId` rule (always present)

**Rule:** Every detail screen route includes `:encId`, and the page uses it for:

* `GetPageLoadInfo({ encId })` (optional but recommended)
* `GetDetail({ encId })` (required)
* `Update(dto)` (dto contains encId)

This keeps your screens uniform and reduces “special cases”.

---

# 4) Shared PageLoader component (required by your request)

## ✅ Add: `packages/shared/src/components/PageLoader.vue`

```vue
<!-- packages/shared/src/components/PageLoader.vue

Purpose:
- Standardize loading + error UI on every screen.
- Keeps pages consistent and avoids repeating "Loading..." / error blocks.

How to use:
<PageLoader :busy="ctrl.isBusy" :error="ctrl.error" :validationErrors="ctrl.validationErrors">
  ...your page content...
</PageLoader>

Notes:
- validationErrors is an optional dictionary returned by backend envelope
- busy can be a boolean (ctrl.isBusy)
-->

<script setup lang="ts">
type ValidationErrors = Record<string, string[]> | null

const props = defineProps<{
  busy: boolean
  error: string | null
  validationErrors?: ValidationErrors
  loadingText?: string
}>()
</script>

<template>
  <div class="page-loader">
    <!-- Errors (server or client) -->
    <div v-if="props.error" class="error">
      {{ props.error }}
    </div>

    <!-- Validation errors (field-based) -->
    <div v-if="props.validationErrors && Object.keys(props.validationErrors).length" class="validation">
      <div class="validation-title">Please fix the following:</div>
      <ul>
        <li v-for="(msgs, key) in props.validationErrors" :key="key">
          <strong>{{ key }}:</strong> {{ msgs.join(', ') }}
        </li>
      </ul>
    </div>

    <!-- Loading overlay (simple, consistent) -->
    <div v-if="props.busy" class="loading">
      {{ props.loadingText ?? 'Loading...' }}
    </div>

    <!-- Page content -->
    <div class="content" :aria-busy="props.busy ? 'true' : 'false'">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.page-loader { display: grid; gap: 10px; }
.content { min-height: 120px; }

.error {
  padding: 10px;
  border: 1px solid #c00;
}

.validation {
  padding: 10px;
  border: 1px solid #c90;
}

.validation-title {
  font-weight: 600;
  margin-bottom: 6px;
}

.loading {
  padding: 10px;
  border: 1px dashed #999;
}
</style>
```

> If you already have a global loader component style, swap styling to match. This is intentionally minimal.

---

# 5) Update shared composable to include `validationErrors` + use PageLoader

You already have `validationErrors` in the shared `useScreenController` I gave you. If you haven’t added it yet, ensure yours includes it (the version below is correct).

## ✅ Shared: `packages/shared/src/composables/useScreenController.ts` (key behaviors)

* `validationErrors` is set when `env.ok === false`
* `crud.pageLoad()` calls `GetPageLoadInfo`
* `action(name)` calls any endpoint

(If you want, I can paste the full file again, but you already have it in the prior message.)

---

# 6) ParticipantDetail screen updated for `:encId` always + PageLoader usage

## ✅ Add: `packages/participant/src/dto/ParticipantDetail/ParticipantDetailDTO.ts`

(Updated to use `encId` as first-class)

```ts
// packages/participant/src/dto/ParticipantDetail/ParticipantDetailDTO.ts

export type OptionVM = { value: string; label: string }

export type ParticipantVM = {
  id: string
  firstName: string
  lastName: string
  email?: string
  status?: string
}

export default class ParticipantDetailDTO {
  screenTitle = 'Participant Detail'

  // Always present (route param)
  encId: string | null = null

  participant: ParticipantVM | null = null

  canEdit = false
  canDeactivate = false

  statusOptions: OptionVM[] = []
}
```

---

## ✅ Add: `packages/participant/src/pages/ParticipantDetail/ParticipantDetailScreen.vue`

(Uses PageLoader + `encId`)

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ParticipantDetailDTO from '@/dto/ParticipantDetail/ParticipantDetailDTO'

// shared
import { useScreenController } from '@shared/composables/useScreenController'
import PageLoader from '@shared/components/PageLoader.vue'

const route = useRoute()
const router = useRouter()

// Screen/controller name must match backend controller
const ctrl = useScreenController('ParticipantDetail', () => new ParticipantDetailDTO())

// Custom endpoints
const getDetail = ctrl.action<{ encId: string }, any>('GetDetail')
const deactivate = ctrl.action<{ encId: string }, any>('Deactivate')

function getEncId(): string {
  // :encId is always passed per your requirement
  return String(route.params.encId ?? '')
}

onMounted(async () => {
  const encId = getEncId()
  if (!encId) {
    // If route is misconfigured, show a clear error
    // (We set ctrl.error indirectly by throwing)
    throw new Error('Missing route param encId')
  }

  // Set encId into dto early for consistency
  ctrl.applyIncoming({ encId } as any)

  // Page scaffolding – pass encId if your backend wants it
  // (recommended: backend can return permissions based on encId)
  await ctrl.crud.pageLoad({ encId })

  // Load record data
  const detail = await getDetail({ encId })
  ctrl.applyIncoming(detail as any)
})

async function save() {
  // Convention save: POST /api/ParticipantDetail/Update
  // Payload defaults to dto, which includes encId
  await ctrl.crud.update()
}

async function doDeactivate() {
  const encId = ctrl.dto.value.encId
  if (!encId) return

  await deactivate({ encId })

  // Adjust to your app: maybe return to list
  router.push({ name: 'ParticipantDashboard' })
}
</script>

<template>
  <ThePageContainer :pageHeading="ctrl.dto.screenTitle">
    <PageLoader :busy="ctrl.isBusy" :error="ctrl.error" :validationErrors="ctrl.validationErrors">
      <div v-if="!ctrl.dto.participant">
        Loading participant...
      </div>

      <div v-else class="form">
        <div class="field">
          <label>First Name</label>
          <input v-model="ctrl.dto.participant.firstName" :disabled="!ctrl.dto.canEdit" />
        </div>

        <div class="field">
          <label>Last Name</label>
          <input v-model="ctrl.dto.participant.lastName" :disabled="!ctrl.dto.canEdit" />
        </div>

        <div class="field">
          <label>Email</label>
          <input v-model="ctrl.dto.participant.email" :disabled="!ctrl.dto.canEdit" />
        </div>

        <div class="field">
          <label>Status</label>
          <select v-model="ctrl.dto.participant.status" :disabled="!ctrl.dto.canEdit">
            <option v-for="opt in ctrl.dto.statusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <div class="actions">
          <button :disabled="ctrl.isBusy || !ctrl.dto.canEdit" @click="save">Save</button>
          <button :disabled="ctrl.isBusy || !ctrl.dto.canDeactivate" @click="doDeactivate">
            Deactivate
          </button>
        </div>
      </div>
    </PageLoader>
  </ThePageContainer>
</template>

<style scoped>
.form { display: grid; gap: 12px; max-width: 560px; }
.field { display: grid; gap: 6px; }
.actions { display: flex; gap: 10px; margin-top: 10px; }
</style>
```

---

# 7) Route update (uses `:encId`)

## ✅ Update: `packages/participant/src/router/routes.ts`

Add:

```ts
{
  // encId ALWAYS passed
  path: 'participants/:encId',
  name: 'ParticipantDetail',
  component: () => import('@/pages/ParticipantDetail/ParticipantDetailScreen.vue'),
  meta: {
    title: 'Participant Detail',
    requiresAuth: true,
  },
  componentPath: './pages/ParticipantDetail/ParticipantDetailScreen',
},
```

---

# 8) Minimal docs for devs (what to add and why)

## ✅ Add: `docs/SCREEN_PATTERN.md` (append/replace with this section)

````md
## Detail screens always use :encId

All "detail" pages use a route param named `encId`:

- `/participant/participants/:encId`

Pages must:
1) set `dto.encId = route.params.encId`
2) call `GetPageLoadInfo({ encId })`
3) call `GetDetail({ encId })`

This ensures consistent loading + permissions + record retrieval across screens.

## Shared PageLoader
Use `PageLoader` on every page for consistent loading & error surfaces:

```vue
<PageLoader :busy="ctrl.isBusy" :error="ctrl.error" :validationErrors="ctrl.validationErrors">
  <!-- your form -->
</PageLoader>
````

## Shared Screen Controller

`useScreenController(screenName, dtoFactory)` handles:

* state (`dto`)
* busy/error flags
* validation errors
* `crud.pageLoad()` -> GetPageLoadInfo
* `crud.update()` -> Update
* `action('X')` -> any custom endpoint

```

---

# 9) Backend expectation (quick)

For this screen, backend should support:

- `POST /api/ParticipantDetail/GetPageLoadInfo` body `{ encId }`
- `POST /api/ParticipantDetail/GetDetail` body `{ encId }`
- `POST /api/ParticipantDetail/Update` body `{ ...dto including encId... }`
- `POST /api/ParticipantDetail/Deactivate` body `{ encId }`

---

If you want, paste your existing `routes.ts` block style (you have some extra fields like `componentPath`) and your preferred folder names, and I’ll format the new route + imports to match your exact code conventions (zero friction PR).
```

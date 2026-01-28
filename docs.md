# Screen System Dev Docs (Vue + VB.NET)

## What this system is

A **screen-first** architecture where each Vue page is a thin wrapper around a standard controller composable. Every screen:

* has a **DTO contract**
* loads data through a standard endpoint `GetPageLoadInfo`
* optionally calls more endpoints (`GetDetail`, `Search`, etc.)
* saves via a standard endpoint (`Update`)
* is wrapped in a shared **PageLoader** UI

The backend mirrors this with a controller per screen:

* `/api/{ScreenName}/{ActionName}` (controller/action routing)

This replaces older per-screen boilerplate and makes CRUD + wizard flows repeatable.

---

# Architecture Overview

## Packages

### `packages/shared` (platform / plumbing)

Owns everything reusable:

* Fetch + response normalization
* Convention endpoint builder
* Screen API client
* `useScreenController` composable (CRUD + custom actions)
* `PageLoader` shared component

### `packages/participant` (feature module)

Owns feature code:

* DTOs
* pages (screens)
* routes

### Shell (if present)

Owns global concerns:

* global routing history
* auth guards/session
* main navigation
* mounts participant module routes

---

# What’s new (what we created)

## Shared additions (`packages/shared`)

1. `src/services/http.ts`
   **Fetch wrapper** + JSON parsing + **normalizes responses** into a standard envelope

2. `src/services/envelopes.ts` (if you keep it as a separate file)
   Defines:

   * `ApiEnvelope<T>`
   * `normalizeEnvelope()`
   * `unwrap()`

3. `src/services/endpoints.ts`
   Builds URLs like: `/api/{screen}/{action}`

4. `src/services/screenApi.ts`
   `createScreenApi(screen)` → `.post(actionName, payload)`

5. `src/composables/useScreenController.ts`
   The reusable screen controller that provides:

   * `dto`
   * `error`
   * `validationErrors`
   * `isBusy`
   * `crud.pageLoad()`, `crud.update()`, etc.
   * `action(name)` for custom endpoints

6. `src/components/PageLoader.vue`
   Standard loading + error + validation UI wrapper for every screen

## Participant additions (`packages/participant`)

1. `src/dto/ParticipantDetail/ParticipantDetailDTO.ts`
   Screen DTO includes:

   * `screenTitle`
   * `encId` (always passed)
   * `participant` record
   * flags/lookup lists

2. `src/pages/ParticipantDetail/ParticipantDetailScreen.vue`
   Example screen using:

   * `useScreenController('ParticipantDetail', dtoFactory)`
   * `PageLoader`
   * route param `:encId`

3. `src/router/routes.ts` entry
   Adds route: `participants/:encId`

## VB.NET additions

1. `Models/ApiEnvelope.vb`
2. `Helpers/ApiResponse.vb`
3. `Helpers/ControllerExec.vb` (optional)
4. `Models/ParticipantDetail/*` DTOs + request models (`EncIdRequest`)
5. `HelperInterfaces/IParticipantDetailHelper.vb`
6. `Helpers/ParticipantDetailHelper.vb`
7. `Controllers/ParticipantDetailController.vb`

---

# Key Conventions (the “rules”)

## Route param: `:encId` is always passed

All detail screens must use:

* `.../:encId`

The DTO must store it as:

* `dto.encId`

## API routes are convention based

Frontend builds:

* `/api/{ScreenName}/{ActionName}`

Example for `ParticipantDetail`:

* `/api/ParticipantDetail/GetPageLoadInfo`
* `/api/ParticipantDetail/GetDetail`
* `/api/ParticipantDetail/Update`

## `GetPageLoadInfo` is required on every modern screen

It returns:

* `screenTitle`
* role flags / permissions
* lookup options
* defaults

This makes screens consistent and reduces branching.

## Responses use a single envelope (recommended)

Preferred backend response:

```json
{ "ok": true, "data": { ... }, "message": "" }
```

Legacy responses still work because `http.ts` normalizes:

* `{ Success, Result }`
* raw DTOs

---

# How the System Works (data flow)

## Screen load (ParticipantDetail example)

1. User navigates to:

   * `/participant/participants/:encId`

2. `ParticipantDetailScreen.vue` mounts:

   * reads `encId` from route params
   * sets `dto.encId`

3. Calls:

   * `ctrl.crud.pageLoad({ encId })`
     which hits:
   * `POST /api/ParticipantDetail/GetPageLoadInfo`

4. Calls:

   * `getDetail({ encId })` (custom action)
     which hits:
   * `POST /api/ParticipantDetail/GetDetail`

5. Merges returned payload into DTO:

   * participant record appears
   * permissions and lookups may update

6. User edits fields and clicks Save:

   * `ctrl.crud.update()` → `POST /api/ParticipantDetail/Update`

7. Any error:

   * `ctrl.error` is set
   * `PageLoader` shows it
   * validation errors show in a standard list

---

# Step-by-Step: Adding a New Screen

## Step 1: Add DTO

Create:
`packages/<module>/src/dto/<Screen>/<Screen>DTO.ts`

Required fields:

* `screenTitle: string`
* `encId: string | null` (for detail screens)

Optional:

* record data
* flags
* lookups

## Step 2: Add Page

Create:
`packages/<module>/src/pages/<Screen>/<Screen>Screen.vue`

Pattern:

* read `encId` from route
* `ctrl.applyIncoming({ encId })`
* call `pageLoad({ encId })`
* call any custom load (`GetDetail({ encId })`)
* wrap content in `<PageLoader ...>`

## Step 3: Add Route

Update:
`packages/<module>/src/router/routes.ts`

Add:

```ts
{
  path: '<resource>/:encId',
  name: '<ScreenName>',
  component: () => import('@/pages/<Screen>/<Screen>Screen.vue'),
  meta: { requiresAuth: true },
}
```

## Step 4: Backend Controller

Create:
`Participant/Controllers/<ScreenName>Controller.vb`

Must include:

* `GetPageLoadInfo(req As EncIdRequest)`
* `Update(dto As ScreenDTO)` (if saving)

Usually includes:

* `GetDetail(req As EncIdRequest)`
* other custom actions

## Step 5: Backend Helper + DTOs

Add:

* `HelperInterfaces/I<ScreenName>Helper.vb`
* `Helpers/<ScreenName>Helper.vb`
* `Models/<ScreenName>/*DTO.vb`
* `Models/Common/EncIdRequest.vb` (or screen folder)

---

# Where Files Go (our repo structure)

## Vue (participant module)

```
packages/participant/src/
  dto/
    ParticipantDetail/ParticipantDetailDTO.ts
  pages/
    ParticipantDetail/ParticipantDetailScreen.vue
  router/
    routes.ts
```

## Shared

```
packages/shared/src/
  services/
    http.ts
    endpoints.ts
    screenApi.ts
    (optional) envelopes.ts
  composables/
    useScreenController.ts
  components/
    PageLoader.vue
```

## VB.NET (Participant project)

```
Participant/
  Controllers/
    ParticipantDetailController.vb
  HelperInterfaces/
    IParticipantDetailHelper.vb
  Helpers/
    ApiResponse.vb
    ControllerExec.vb
    ParticipantDetailHelper.vb
  Models/
    ApiEnvelope.vb
    ParticipantDetail/
      ParticipantDetailModels.vb
```

---

# Developer Notes / FAQ

## Do I update ApiEnvelope for new screens?

No. `ApiEnvelope` is stable infrastructure.
New screens add new DTOs; the envelope stays the same.

## How do extra endpoints work on a screen?

Use:

```ts
const doThing = ctrl.action<{ encId: string }, Result>('DoThing')
await doThing({ encId })
```

Backend must implement:
`Public Function DoThing(req As EncIdRequest) As ApiEnvelope(Of Result)`

## What if backend returns legacy shapes?

`http.ts` normalizes them into the standard envelope.

---

# “Minimum viable” screen template (copy/paste)

1. Read `encId`
2. `pageLoad({ encId })`
3. `getDetail({ encId })`
4. Save via `update()`
5. Wrap with `PageLoader`

---

## How to Access DTO Data in Vue (TypeScript)

In this system, **all screen data lives in a DTO** managed by
`useScreenController`.

You do **not** create individual refs for each field.
The DTO *is* the reactive state.

---

## Where the DTO comes from

```ts
const ctrl = useScreenController(
  'ParticipantDetail',
  () => new ParticipantDetailDTO()
)
```

This gives you:

```ts
ctrl.dto  // Ref<ParticipantDetailDTO>
```

Important:

* `ctrl.dto` is a Vue **ref**
* The actual object is `ctrl.dto.value`
* Vue templates automatically unwrap `.value`

---

## Rules (memorize these)

| Location         | How to access              |
| ---------------- | -------------------------- |
| `<script setup>` | `ctrl.dto.value.field`     |
| `<template>`     | `ctrl.dto.field`           |
| Server merge     | `ctrl.applyIncoming(data)` |
| Save             | `ctrl.crud.update()`       |

---

## Small, complete Vue example

### DTO

```ts
// ParticipantDetailDTO.ts
export default class ParticipantDetailDTO {
  screenTitle = 'Participant Detail'
  encId: string | null = null

  participant = {
    firstName: '',
    lastName: '',
  }

  canEdit = false
}
```

---

### Page Component

```vue
<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import ParticipantDetailDTO from '@/dto/ParticipantDetail/ParticipantDetailDTO'
import { useScreenController } from '@shared/composables/useScreenController'

const route = useRoute()

const ctrl = useScreenController(
  'ParticipantDetail',
  () => new ParticipantDetailDTO()
)

// Example: computed value derived from DTO
const fullName = computed(() => {
  const p = ctrl.dto.value.participant
  return `${p.firstName} ${p.lastName}`
})

onMounted(async () => {
  const encId = String(route.params.encId)

  // Always set encId into DTO
  ctrl.applyIncoming({ encId })

  // Load page scaffolding
  await ctrl.crud.pageLoad({ encId })

  // Load record data
  const detail = await ctrl.action('GetDetail')({ encId })
  ctrl.applyIncoming(detail)
})

function save() {
  // Sends ctrl.dto.value to POST /Update
  ctrl.crud.update()
}
</script>

<template>
  <div>
    <h2>{{ ctrl.dto.screenTitle }}</h2>

    <div>
      <label>First Name</label>
      <input
        v-model="ctrl.dto.participant.firstName"
        :disabled="!ctrl.dto.canEdit"
      />
    </div>

    <div>
      <label>Last Name</label>
      <input
        v-model="ctrl.dto.participant.lastName"
        :disabled="!ctrl.dto.canEdit"
      />
    </div>

    <div>
      Full Name: {{ fullName }}
    </div>

    <button
      :disabled="!ctrl.dto.canEdit || ctrl.isBusy"
      @click="save"
    >
      Save
    </button>

    <div v-if="ctrl.error">
      {{ ctrl.error }}
    </div>
  </div>
</template>
```

---

## Access patterns you will use most

### Read a value (script)

```ts
const canEdit = ctrl.dto.value.canEdit
```

### Read a value (template)

```vue
{{ ctrl.dto.canEdit }}
```

---

### Update a single field (UI-driven)

```ts
ctrl.dto.value.participant.firstName = 'Brad'
```

---

### Merge server data (recommended)

```ts
ctrl.applyIncoming({
  participant: serverParticipant,
  canEdit: true,
})
```

This prevents accidentally replacing the DTO instance.

---

## Validation errors tied to DTO fields

Backend returns:

```json
{
  "ok": false,
  "validationErrors": {
    "participant.firstName": ["Required"]
  }
}
```

Frontend access:

```vue
<div v-if="ctrl.validationErrors?.['participant.firstName']">
  {{ ctrl.validationErrors['participant.firstName'][0] }}
</div>
```

---

## Common mistakes (avoid these)

### Forgetting `.value` in script

```ts
ctrl.dto.encId  // wrong
```

Correct:

```ts
ctrl.dto.value.encId
```

---

### Using `.value` in template

```vue
{{ ctrl.dto.value.encId }}  <!-- wrong -->
```

Correct:

```vue
{{ ctrl.dto.encId }}
```

---

### Replacing the DTO object

```ts
ctrl.dto.value = new ParticipantDetailDTO() // wrong
```

Correct:

```ts
ctrl.applyIncoming(newData)
```

---

## Mental model

* The DTO is the **single source of truth**
* The server defines its shape
* Vue reacts automatically
* You edit fields directly
* Saves and loads are standardized

## Bonus: Cleaner `<script setup>` with destructuring
You can destructure props to avoid using `props.` in the template.
Compare this snippet from `RM2.md`:

```vue
<script setup lang="ts">
type ValidationErrors = Record<string, string[]> | null
const { busy, error, validationErrors, loadingText } = defineProps<{
  busy: boolean
  error: string | null
  validationErrors?: ValidationErrors
  loadingText?: string
}>()
</script>
<template>
  <div v-if="error">{{ error }}</div>
  <div v-if="busy">{{ loadingText ?? 'Loading...' }}</div>
</template>
```
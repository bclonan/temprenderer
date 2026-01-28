Here’s the full “working system” overview + step-by-step dev docs, written as something you can drop into `docs/SCREEN_SYSTEM.md`.

---

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

# Where Files Go (your repo structure)

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
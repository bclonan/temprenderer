```ts
// packages/shared/src/services/http.ts
// Fetch wrapper + response normalization:
// - Supports NEW envelope: { ok, data, message, validationErrors }
// - Supports LEGACY envelope: { Success, Result, Message, ValidationErrors }
// - Supports RAW DTO: treat as ok=true, data=raw
//
// Usage:
//   const env = await httpJson<MyDto>('/api/Foo/Bar', { method:'POST', body: JSON.stringify({}) })
//   if (!env.ok) ...
//   env.data ...

export type ApiEnvelope<T> = {
  ok: boolean
  message?: string
  data?: T
  validationErrors?: Record<string, string[]>
}

function normalizeResponse<T>(raw: any): ApiEnvelope<T> {
  // New standard envelope
  if (raw && typeof raw.ok === 'boolean') return raw as ApiEnvelope<T>

  // Legacy envelope style (adjust keys if your backend differs)
  if (raw && typeof raw.Success === 'boolean') {
    return {
      ok: !!raw.Success,
      message: raw.Message,
      data: raw.Result as T,
      validationErrors: raw.ValidationErrors as any,
    }
  }

  // Raw DTO fallback
  return { ok: true, data: raw as T }
}

export async function httpJson<T>(url: string, options: RequestInit = {}): Promise<ApiEnvelope<T>> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    credentials: 'include', // common for cookie-based auth in legacy .NET
    ...options,
  })

  const text = await res.text().catch(() => '')
  const json = text ? JSON.parse(text) : null

  // If the HTTP call failed, throw. (Network/500/401/etc.)
  if (!res.ok) {
    const msg =
      json?.message ??
      json?.Message ??
      `HTTP ${res.status} ${res.statusText}`
    throw new Error(msg)
  }

  return normalizeResponse<T>(json)
}
```

```ts
// packages/shared/src/services/endpoints.ts
// Builds: /api/{screen}/{action}
//
// Example:
//   const ep = buildScreenEndpoints('ParticipantDetail')
//   ep.action('GetPageLoadInfo') -> "/api/ParticipantDetail/GetPageLoadInfo"

export function buildScreenEndpoints(screen: string) {
  const base = `/api/${encodeURIComponent(screen)}`
  return {
    base,
    action: (actionName: string) => `${base}/${actionName}`,
  }
}
```

```ts
// packages/shared/src/services/screenApi.ts
// Tiny API client for convention-based screen endpoints:
//   POST /api/{screen}/{action}
//
// Returns ApiEnvelope<T> (normalized in http.ts)

import { httpJson, type ApiEnvelope } from './http'
import { buildScreenEndpoints } from './endpoints'

export function createScreenApi(screen: string) {
  const ep = buildScreenEndpoints(screen)

  return {
    endpoints: ep,

    post<T>(actionName: string, payload?: any): Promise<ApiEnvelope<T>> {
      return httpJson<T>(ep.action(actionName), {
        method: 'POST',
        body: JSON.stringify(payload ?? {}),
      })
    },

    // Optional convenience if you have some GET endpoints
    get<T>(absUrl: string): Promise<ApiEnvelope<T>> {
      return httpJson<T>(absUrl, { method: 'GET' })
    },
  }
}
```

```ts
// packages/shared/src/composables/useScreenController.ts
// Reusable "screen controller" composable.
//
// Provides:
// - dto: reactive DTO state
// - error: string|null
// - validationErrors: Record<string, string[]>|null
// - isBusy: boolean
// - crud.pageLoad() -> calls GetPageLoadInfo, merges into dto
// - crud.update()   -> calls Update (payload defaults to dto)
// - action(name)    -> calls any custom endpoint, returns unwrapped data
//
// Contract:
// - Backend returns ApiEnvelope<T> (or legacy/raw; http.ts normalizes)
// - Endpoints are /api/{screen}/{action}

import { computed, ref } from 'vue'
import { createScreenApi } from '../services/screenApi'
import type { ApiEnvelope } from '../services/http'

type MergeFn<T> = (current: T, incoming: Partial<T>) => T

export function useScreenController<TDto extends object>(
  screen: string,
  dtoFactory: () => TDto,
  mergeDto?: MergeFn<TDto>
) {
  const api = createScreenApi(screen)

  const dto = ref<TDto>(dtoFactory())
  const error = ref<string | null>(null)
  const validationErrors = ref<Record<string, string[]> | null>(null)

  // count-based busy so multiple async calls are safe
  const busyCount = ref(0)
  const isBusy = computed(() => busyCount.value > 0)

  const merge: MergeFn<TDto> = mergeDto ?? ((cur, inc) => Object.assign({}, cur, inc))

  function applyIncoming(incoming: Partial<TDto>) {
    dto.value = merge(dto.value, incoming)
  }

  function unwrap<T>(env: ApiEnvelope<T>): T {
    validationErrors.value = null
    if (!env.ok) {
      validationErrors.value = env.validationErrors ?? null
      throw new Error(env.message ?? 'Request failed')
    }
    return env.data as T
  }

  async function run<T>(fn: () => Promise<T>): Promise<T> {
    error.value = null
    busyCount.value++
    try {
      return await fn()
    } catch (e: any) {
      error.value = e?.message ?? String(e)
      throw e
    } finally {
      busyCount.value--
    }
  }

  const crud = {
    // Required endpoint for consistent screens:
    // POST /api/{screen}/GetPageLoadInfo
    pageLoad: (payload?: any) =>
      run(async () => {
        const env = await api.post<Partial<TDto>>('GetPageLoadInfo', payload ?? {})
        const incoming = unwrap(env)
        applyIncoming(incoming)
        return incoming
      }),

    // Convention save:
    // POST /api/{screen}/Update
    update: (payload?: any) =>
      run(async () => unwrap(await api.post<any>('Update', payload ?? dto.value))),

    // Optional conventions (implement server-side only if you want them)
    create: (payload?: any) =>
      run(async () => unwrap(await api.post<any>('Create', payload ?? dto.value))),

    remove: (payload?: any) =>
      run(async () => unwrap(await api.post<any>('Delete', payload ?? {}))),
  }

  // Custom endpoint helper:
  // const getDetail = ctrl.action<{encId:string}, SomeRes>('GetDetail')
  // const res = await getDetail({ encId })
  function action<TReq = any, TRes = any>(actionName: string) {
    return (payload?: TReq) =>
      run(async () => unwrap(await api.post<TRes>(actionName, payload ?? {})))
  }

  return {
    screen,
    dto,
    error,
    validationErrors,
    isBusy,
    applyIncoming,
    crud,
    action,
  }
}
```

```vue
<!-- packages/shared/src/components/PageLoader.vue
     Standard loading + error wrapper for screens.

     Usage:
       <PageLoader :busy="ctrl.isBusy" :error="ctrl.error" :validationErrors="ctrl.validationErrors">
         ...page content...
       </PageLoader>
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
    <div v-if="props.error" class="error">
      {{ props.error }}
    </div>

    <div v-if="props.validationErrors && Object.keys(props.validationErrors).length" class="validation">
      <div class="validation-title">Please fix the following:</div>
      <ul>
        <li v-for="(msgs, key) in props.validationErrors" :key="key">
          <strong>{{ key }}:</strong> {{ msgs.join(', ') }}
        </li>
      </ul>
    </div>

    <div v-if="props.busy" class="loading">
      {{ props.loadingText ?? 'Loading...' }}
    </div>

    <div class="content" :aria-busy="props.busy ? 'true' : 'false'">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.page-loader { display: grid; gap: 10px; }
.content { min-height: 120px; }

.error { padding: 10px; border: 1px solid #c00; }
.validation { padding: 10px; border: 1px solid #c90; }
.validation-title { font-weight: 600; margin-bottom: 6px; }
.loading { padding: 10px; border: 1px dashed #999; }
</style>
```

```ts
// packages/participant/src/dto/ParticipantDetail/ParticipantDetailDTO.ts
// Screen DTO for ParticipantDetailScreen.
// :encId is ALWAYS passed (route param) and stored here.

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

  // Always present route param
  encId: string | null = null

  // Record
  participant: ParticipantVM | null = null

  // Server-driven flags
  canEdit = false
  canDeactivate = false

  // Lookups
  statusOptions: OptionVM[] = []
}
```

```vue
<!-- packages/participant/src/pages/ParticipantDetail/ParticipantDetailScreen.vue
     Detail screen example using:
       - useScreenController (shared)
       - PageLoader (shared)
       - :encId always passed

     Backend endpoints expected:
       POST /api/ParticipantDetail/GetPageLoadInfo   body: { encId }
       POST /api/ParticipantDetail/GetDetail        body: { encId }
       POST /api/ParticipantDetail/Update           body: dto (includes encId)
       POST /api/ParticipantDetail/Deactivate       body: { encId }
-->

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ParticipantDetailDTO from '@/dto/ParticipantDetail/ParticipantDetailDTO'
import { useScreenController } from '@shared/composables/useScreenController'
import PageLoader from '@shared/components/PageLoader.vue'

const route = useRoute()
const router = useRouter()

const ctrl = useScreenController('ParticipantDetail', () => new ParticipantDetailDTO())

// Custom actions (match VB.NET method names)
const getDetail = ctrl.action<{ encId: string }, any>('GetDetail')
const deactivate = ctrl.action<{ encId: string }, any>('Deactivate')

function encIdFromRoute(): string {
  return String(route.params.encId ?? '')
}

onMounted(async () => {
  const encId = encIdFromRoute()
  if (!encId) throw new Error('Missing route param encId')

  // Set encId early so dto always has it
  ctrl.applyIncoming({ encId } as any)

  // Load page scaffolding (title, flags, lookups). Pass encId if backend needs it.
  await ctrl.crud.pageLoad({ encId })

  // Load record
  const detail = await getDetail({ encId })
  ctrl.applyIncoming(detail as any)
})

async function save() {
  await ctrl.crud.update() // sends dto (includes encId)
}

async function doDeactivate() {
  const encId = ctrl.dto.value.encId
  if (!encId) return

  await deactivate({ encId })

  // adjust to your real route
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

```ts
// packages/participant/src/router/routes.ts
// Add this route entry to your existing exported routes array.
// NOTE: :encId is ALWAYS passed (per your requirement).
// NOTE: If this is mounted under /participant, final URL becomes:
//   /participant/participants/:encId

{
  path: 'participants/:encId',
  name: 'ParticipantDetail',
  component: () => import('@/pages/ParticipantDetail/ParticipantDetailScreen.vue'),
  meta: {
    title: 'Participant Detail',
    requiresAuth: true,
  },
  // keep if your codebase uses it
  componentPath: './pages/ParticipantDetail/ParticipantDetailScreen',
},
```

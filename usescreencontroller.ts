import {
    computed,
    shallowRef,
    ref,
    type ShallowRef,
    type ComputedRef,
    type Ref,
} from 'vue'
import { createScreenApi } from '../services/screenApi'
import type { ApiEnvelope } from '../services/envelopes'

type MergeFn<T> = (current: T, incoming: Partial<T>) => T
export type ScreenValidationErrors = Record<string, string[]> | null

export type ScreenController<TDto extends object> = {
    screen: string

    // ✅ Use ShallowRef for DTO class instances / objects
    dto: ShallowRef<TDto>

    error: Ref<string | null>
    validationErrors: Ref<ScreenValidationErrors>
    isBusy: ComputedRef<boolean>

    applyIncoming: (incoming: Partial<TDto>) => void

    crud: {
        pageLoad: (payload?: any) => Promise<Partial<TDto>>
        update: (payload?: any) => Promise<any>
        create: (payload?: any) => Promise<any>
        remove: (payload?: any) => Promise<any>
    }

    action: <TReq = any, TRes = any>(actionName: string) => (payload?: TReq) => Promise<TRes>
}

export function useScreenController<TDto extends object>(
    screen: string,
    dtoFactory: () => TDto,
    mergeDto?: MergeFn<TDto>
): ScreenController<TDto> {
    const api = createScreenApi(screen)

    // ✅ shallowRef fixes "not assignable to Ref<TDto>" issues
    const dto = shallowRef<TDto>(dtoFactory())

    const error = ref<string | null>(null)
    const validationErrors = ref<ScreenValidationErrors>(null)

    const busyCount = ref(0)
    const isBusy = computed(() => busyCount.value > 0)

    const merge: MergeFn<TDto> =
        mergeDto ?? ((cur, inc) => Object.assign({}, cur, inc))

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
        pageLoad: (payload?: any) =>
            run(async () => {
                const env = await api.post<Partial<TDto>>('GetPageLoadInfo', payload ?? {})
                const incoming = unwrap(env)
                applyIncoming(incoming)
                return incoming
            }),

        update: (payload?: any) =>
            run(async () => unwrap(await api.post<any>('Update', payload ?? dto.value))),

        create: (payload?: any) =>
            run(async () => unwrap(await api.post<any>('Create', payload ?? dto.value))),

        remove: (payload?: any) =>
            run(async () => unwrap(await api.post<any>('Delete', payload ?? {}))),
    }

    function action<TReq = any, TRes = any>(actionName: string) {
        return (payload?: TReq) =>
            run(async () => unwrap(await api.post<TRes>(actionName, payload ?? {})))
    }

    return { screen, dto, error, validationErrors, isBusy, applyIncoming, crud, action }
}

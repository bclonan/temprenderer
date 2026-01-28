// packages/shared/src/composables/useWizardController.ts
//
// Purpose:
// - Manage wizard step navigation (index, next, back)
// - Run per-step validation
// - Run enter/exit hooks (optional async)
// - Surface step-level errors
//
// IMPORTANT:
// - This composable DOES NOT own data.
// - The screen DTO remains the single source of truth.
// - Wizard only controls flow + validation.

import { computed, ref, type Ref } from 'vue'

/* -------------------------
   Types
-------------------------- */

// A single wizard step definition
export type WizardStep = {
    key: string                 // stable identifier ("Basic", "Contact", etc.)
    title?: string              // optional display label

    // Validation before leaving the step
    // - return true if valid
    // - return string for error message
    // - or throw Error
    validate?: () => true | string | Promise<true | string>

    // Called when entering the step (optional)
    onEnter?: () => void | Promise<void>

    // Called when leaving the step (optional)
    onExit?: () => void | Promise<void>
}

// Public API returned by the composable
export type WizardController = {
    index: Ref<number>
    steps: WizardStep[]

    current: Ref<WizardStep | null>

    isFirst: Ref<boolean>
    isLast: Ref<boolean>

    stepError: Ref<string | null>

    next: () => Promise<boolean>
    back: () => Promise<boolean>
    goTo: (index: number) => Promise<boolean>
}

/* -------------------------
   Composable
-------------------------- */

export function useWizardController(
    steps: WizardStep[],
    initialIndex = 0
): WizardController {
    if (!steps.length) {
        throw new Error('Wizard must have at least one step')
    }

    const index = ref(initialIndex)
    const stepError = ref<string | null>(null)

    const current = computed(() => steps[index.value] ?? null)

    const isFirst = computed(() => index.value === 0)
    const isLast = computed(() => index.value === steps.length - 1)

    /* -------------------------
       Internal helpers
    -------------------------- */

    async function runValidate(step: WizardStep): Promise<boolean> {
        if (!step.validate) return true

        const result = await step.validate()

        if (result === true) return true
        if (typeof result === 'string') {
            stepError.value = result
            return false
        }

        return true
    }

    async function enterStep(step: WizardStep) {
        stepError.value = null
        if (step.onEnter) {
            await step.onEnter()
        }
    }

    async function exitStep(step: WizardStep) {
        if (step.onExit) {
            await step.onExit()
        }
    }

    /* -------------------------
       Navigation API
    -------------------------- */

    async function next(): Promise<boolean> {
        const step = current.value
        if (!step || isLast.value) return false

        stepError.value = null

        const valid = await runValidate(step)
        if (!valid) return false

        await exitStep(step)

        index.value++

        await enterStep(current.value!)

        return true
    }

    async function back(): Promise<boolean> {
        const step = current.value
        if (!step || isFirst.value) return false

        stepError.value = null

        await exitStep(step)

        index.value--

        await enterStep(current.value!)

        return true
    }

    async function goTo(targetIndex: number): Promise<boolean> {
        if (targetIndex < 0 || targetIndex >= steps.length) return false
        if (targetIndex === index.value) return true

        const step = current.value
        stepError.value = null

        if (step) {
            const valid = await runValidate(step)
            if (!valid) return false
            await exitStep(step)
        }

        index.value = targetIndex

        await enterStep(current.value!)

        return true
    }

    // Call onEnter for the initial step
    enterStep(steps[index.value])

    return {
        index,
        steps,
        current,
        isFirst,
        isLast,
        stepError,
        next,
        back,
        goTo,
    }
}


// ------------------------------------------
// example usage:
// ------------------------------------------

// <script setup lang = "ts" >
// import { computed } from 'vue'
// import { useWizardController } from '@shared/composables'
// import { useScreenController } from '@shared/composables'
// import ExampleWizardDTO from '@/dto/ExampleWizardDTO'

// const ctrl = useScreenController(
//     'ExampleWizard',
//     () => new ExampleWizardDTO()
// )

// // Define wizard steps
// const wizard = useWizardController([
//     {
//         key: 'Basic',
//         validate: () => {
//             const b = ctrl.dto.value.basic
//             if (!b.firstName) return 'First name is required'
//             if (!b.lastName) return 'Last name is required'
//             return true
//         },
//         onExit: async () => {
//             // optional step save
//             await ctrl.action('SaveStep')({
//                 stepKey: 'Basic',
//                 dto: ctrl.dto.value,
//             })
//         },
//     },
//     {
//         key: 'Contact',
//         validate: () => {
//             const c = ctrl.dto.value.contact
//             if (!c.email) return 'Email is required'
//             return true
//         },
//     },
//     {
//         key: 'Review',
//     },
// ])

// const currentKey = computed(() => wizard.current.value?.key)
//     </script>

//     < template >
//     <div>
//     <div v -if= "wizard.stepError" >
//         {{ wizard.stepError }}
// </div>

//     < BasicStep v -if= "currentKey === 'Basic'" : dto = "ctrl.dto" />
//         <ContactStep v -if= "currentKey === 'Contact'" : dto = "ctrl.dto" />
//             <ReviewStep v -if= "currentKey === 'Review'" : dto = "ctrl.dto" />

//                 <div style="margin-top: 12px;" >
//                     <button @click="wizard.back" : disabled = "wizard.isFirst" > Back </button>
//                         < button v -if= "!wizard.isLast" @click="wizard.next" > Next </>
//                             < button v -else @click="ctrl.crud.update()" > Finish </>
//                                 </div>
//                                 </div>
//                                 </template>
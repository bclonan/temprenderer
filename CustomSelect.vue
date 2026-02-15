<template>
  <div
    class="cs-wrapper"
    ref="wrapperRef"
    @keydown="handleWrapperKeydown"
  >
    <!--
      Hidden label anchor — callers should pass a `label` prop for screen readers.
      It's visually hidden but linked via aria-labelledby.
    -->
    <span :id="labelId" class="visually-hidden">{{ label }}</span>

    <!-- ─── Trigger Button (combobox) ─────────────────────────────────────── -->
    <button
      :id="triggerId"
      ref="triggerRef"
      type="button"
      class="cs-trigger"
      :class="{
        'cs-trigger--open'     : isOpen,
        'cs-trigger--selected' : modelValue !== null && modelValue !== undefined,
        'cs-trigger--invalid'  : invalid,
      }"
      role="combobox"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :aria-labelledby="`${labelId} ${triggerId}-display`"
      :aria-controls="listboxId"
      :aria-activedescendant="activeDescendantId || undefined"
      :aria-required="required || undefined"
      :aria-invalid="invalid || undefined"
      :disabled="disabled"
      @click="toggleDropdown"
    >
      <!-- Display area -->
      <span class="cs-trigger__body" :id="`${triggerId}-display`" aria-hidden="true">
        <template v-if="selectedOption">
          <span class="cs-trigger__label">{{ selectedOption.label }}</span>
          <!--
            Subtext slot: use slot `option-subtext-{value}` for per-option custom content,
            falls back to the `subtext` property on the option object.
          -->
          <span
            v-if="selectedOption.subtext || $slots[`option-subtext-${selectedOption.value}`]"
            class="cs-trigger__subtext"
          >
            <slot :name="`option-subtext-${selectedOption.value}`" :option="selectedOption">
              {{ selectedOption.subtext }}
            </slot>
          </span>
        </template>
        <span v-else class="cs-trigger__placeholder">{{ placeholder }}</span>
      </span>

      <!-- Chevron -->
      <span class="cs-trigger__chevron" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="cs-chevron-icon"
          :class="{ 'cs-chevron-icon--open': isOpen }"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
    </button>

    <!-- ─── Listbox ─────────────────────────────────────────────────────────── -->
    <Transition name="cs-drop">
      <ul
        v-show="isOpen"
        :id="listboxId"
        ref="listboxRef"
        role="listbox"
        :aria-labelledby="labelId"
        class="cs-listbox"
        tabindex="-1"
        @mousedown.prevent
      >
        <!--
          Optional empty / placeholder option.
          Rendered only when `allowEmpty` is true.
        -->
        <li
          v-if="allowEmpty"
          :id="`${listboxId}-opt-empty`"
          role="option"
          :aria-selected="modelValue === null || modelValue === undefined"
          class="cs-option cs-option--empty"
          :class="{ 'cs-option--focused': focusedIndex === -1 }"
          @click="selectOption(null)"
          @mouseenter="focusedIndex = -1"
        >
          <span class="cs-option__label">{{ placeholder }}</span>
        </li>

        <li
          v-for="(option, index) in options"
          :key="option.value"
          :id="`${listboxId}-opt-${index}`"
          role="option"
          :aria-selected="modelValue === option.value"
          :aria-disabled="option.disabled || undefined"
          class="cs-option"
          :class="{
            'cs-option--selected' : modelValue === option.value,
            'cs-option--focused'  : focusedIndex === index,
            'cs-option--disabled' : option.disabled,
          }"
          @click="!option.disabled && selectOption(option)"
          @mouseenter="!option.disabled && (focusedIndex = index)"
        >
          <!-- Check mark for selected -->
          <span class="cs-option__check" aria-hidden="true">
            <svg
              v-if="modelValue === option.value"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>

          <span class="cs-option__content">
            <span class="cs-option__label">{{ option.label }}</span>

            <!--
              Subtext slot per option.
              Named slot: `option-subtext-{value}`
              The slot receives the full `option` object as scope.
              Falls back to the `subtext` string property on the option.
            -->
            <span
              v-if="option.subtext || $slots[`option-subtext-${option.value}`]"
              class="cs-option__subtext"
            >
              <slot :name="`option-subtext-${option.value}`" :option="option">
                {{ option.subtext }}
              </slot>
            </span>
          </span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from 'vue'

// ─── Props ──────────────────────────────────────────────────────────────────

const props = defineProps({
  /** v-model bound value — must match `option.value` */
  modelValue: {
    type: [String, Number, Boolean, Object],
    default: null,
  },
  /**
   * Array of option objects.
   * Shape: { value, label, subtext?, disabled? }
   */
  options: {
    type: Array,
    default: () => [],
  },
  /** Accessible label for screen readers */
  label: {
    type: String,
    default: 'Select an option',
  },
  /** Placeholder shown when nothing is selected */
  placeholder: {
    type: String,
    default: '- Select -',
  },
  /** Allow clearing the selection (renders a placeholder option in the list) */
  allowEmpty: {
    type: Boolean,
    default: false,
  },
  /** HTML id prefix — auto-generated if not provided */
  id: {
    type: String,
    default: null,
  },
  required: {
    type: Boolean,
    default: false,
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

// ─── Emits ──────────────────────────────────────────────────────────────────

const emit = defineEmits(['update:modelValue', 'change', 'open', 'close'])

// ─── Internal State ──────────────────────────────────────────────────────────

const uid         = Math.random().toString(36).slice(2, 8)
const labelId     = computed(() => `${props.id || uid}-label`)
const triggerId   = computed(() => `${props.id || uid}-trigger`)
const listboxId   = computed(() => `${props.id || uid}-listbox`)

const wrapperRef  = ref(null)
const triggerRef  = ref(null)
const listboxRef  = ref(null)

const isOpen      = ref(false)
/** -1 = empty option, 0+ = option index */
const focusedIndex = ref(-2)

// ─── Derived ─────────────────────────────────────────────────────────────────

const selectedOption = computed(() =>
  props.options.find(o => o.value === props.modelValue) ?? null
)

const activeDescendantId = computed(() => {
  if (!isOpen.value) return null
  if (focusedIndex.value === -1) return `${listboxId.value}-opt-empty`
  if (focusedIndex.value >= 0)   return `${listboxId.value}-opt-${focusedIndex.value}`
  return null
})

const firstEnabledIndex = computed(() =>
  props.options.findIndex(o => !o.disabled)
)

const lastEnabledIndex = computed(() => {
  for (let i = props.options.length - 1; i >= 0; i--) {
    if (!props.options[i].disabled) return i
  }
  return -1
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function nextEnabled(from, direction = 1) {
  const len = props.options.length
  let idx = from + direction
  while (idx >= 0 && idx < len) {
    if (!props.options[idx].disabled) return idx
    idx += direction
  }
  return from
}

function syncFocusedToValue() {
  const idx = props.options.findIndex(o => o.value === props.modelValue)
  focusedIndex.value = idx >= 0 ? idx : (props.allowEmpty ? -1 : firstEnabledIndex.value)
}

// ─── Open / Close ────────────────────────────────────────────────────────────

async function openDropdown() {
  if (isOpen.value || props.disabled) return
  syncFocusedToValue()
  isOpen.value = true
  emit('open')
  await nextTick()
  // Scroll focused option into view
  scrollFocusedIntoView()
}

function closeDropdown(returnFocus = true) {
  if (!isOpen.value) return
  isOpen.value = false
  emit('close')
  if (returnFocus) triggerRef.value?.focus()
}

function toggleDropdown() {
  isOpen.value ? closeDropdown() : openDropdown()
}

// ─── Selection ────────────────────────────────────────────────────────────────

function selectOption(option) {
  const val = option ? option.value : null
  emit('update:modelValue', val)
  emit('change', val)
  closeDropdown()
}

// ─── Keyboard Navigation ─────────────────────────────────────────────────────

/**
 * On the trigger button itself (closed state).
 */
function handleWrapperKeydown(e) {
  // If listbox is open, delegate to listbox handler
  if (isOpen.value) {
    handleListboxKeydown(e)
    return
  }

  // Closed trigger keys
  switch (e.key) {
    case 'Enter':
    case ' ':
    case 'ArrowDown':
    case 'ArrowUp':
      e.preventDefault()
      openDropdown()
      break
    case 'Home':
    case 'End':
      e.preventDefault()
      openDropdown()
      break
  }
}

function handleListboxKeydown(e) {
  const len = props.options.length

  switch (e.key) {
    case 'ArrowDown': {
      e.preventDefault()
      if (focusedIndex.value === -1) {
        focusedIndex.value = firstEnabledIndex.value
      } else {
        focusedIndex.value = nextEnabled(focusedIndex.value, 1)
      }
      scrollFocusedIntoView()
      break
    }
    case 'ArrowUp': {
      e.preventDefault()
      if (focusedIndex.value <= 0) {
        focusedIndex.value = props.allowEmpty ? -1 : firstEnabledIndex.value
      } else {
        focusedIndex.value = nextEnabled(focusedIndex.value, -1)
      }
      scrollFocusedIntoView()
      break
    }
    case 'Home': {
      e.preventDefault()
      focusedIndex.value = props.allowEmpty ? -1 : firstEnabledIndex.value
      scrollFocusedIntoView()
      break
    }
    case 'End': {
      e.preventDefault()
      focusedIndex.value = lastEnabledIndex.value
      scrollFocusedIntoView()
      break
    }
    case 'Enter':
    case ' ': {
      e.preventDefault()
      if (focusedIndex.value === -1) {
        selectOption(null)
      } else if (focusedIndex.value >= 0 && focusedIndex.value < len) {
        const opt = props.options[focusedIndex.value]
        if (!opt.disabled) selectOption(opt)
      }
      break
    }
    case 'Escape':
    case 'Tab': {
      e.key === 'Escape' && e.preventDefault()
      closeDropdown()
      break
    }
    default: {
      // Type-ahead: jump to first option starting with typed char
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        const char = e.key.toLowerCase()
        const start = focusedIndex.value + 1
        const matches = props.options
          .map((o, i) => ({ o, i }))
          .filter(({ o }) => !o.disabled && o.label.toLowerCase().startsWith(char))
        if (matches.length) {
          const after = matches.find(({ i }) => i >= start) ?? matches[0]
          focusedIndex.value = after.i
          scrollFocusedIntoView()
        }
      }
    }
  }
}

function scrollFocusedIntoView() {
  nextTick(() => {
    const id = activeDescendantId.value
    if (!id) return
    const el = document.getElementById(id)
    el?.scrollIntoView({ block: 'nearest' })
  })
}

// ─── Click Outside ────────────────────────────────────────────────────────────

function handleClickOutside(e) {
  if (isOpen.value && !wrapperRef.value?.contains(e.target)) {
    closeDropdown(false)
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))

// ─── Expose (optional) ───────────────────────────────────────────────────────

defineExpose({ open: openDropdown, close: closeDropdown, focus: () => triggerRef.value?.focus() })
</script>

<style scoped>
/* ─── CSS Custom Properties ──────────────────────────────────────────────── */
.cs-wrapper {
  --cs-border       : #ced4da;
  --cs-border-focus : #0a66c2;   /* LinkedIn-style blue */
  --cs-border-invalid: #dc3545;
  --cs-bg           : #ffffff;
  --cs-radius       : 8px;
  --cs-label-color  : #1a1a2e;
  --cs-sub-color    : #4a5568;
  --cs-placeholder  : #6c757d;
  --cs-chevron      : #333d4b;
  --cs-opt-hover-bg : #f0f4ff;
  --cs-opt-sel-bg   : #eaf2fb;
  --cs-opt-sel-color: #0a66c2;
  --cs-check-color  : #0a66c2;
  --cs-shadow       : 0 4px 20px rgba(0, 0, 0, 0.10);
  --cs-transition   : 200ms ease;

  position: relative;
  display: block;
  font-family: inherit;
}

/* ─── Trigger Button ─────────────────────────────────────────────────────── */
.cs-trigger {
  display       : flex;
  align-items   : center;
  width         : 100%;
  padding       : 14px 16px;
  background    : var(--cs-bg);
  border        : 1.5px solid var(--cs-border);
  border-radius : var(--cs-radius);
  cursor        : pointer;
  text-align    : left;
  transition    : border-color var(--cs-transition), box-shadow var(--cs-transition);
  gap           : 8px;
  appearance    : none;
  -webkit-appearance: none;
}

.cs-trigger:hover:not(:disabled) {
  border-color: #b0bec5;
}

.cs-trigger:focus-visible {
  outline      : none;
  border-color : var(--cs-border-focus);
  box-shadow   : 0 0 0 3px rgba(10, 102, 194, 0.18);
}

.cs-trigger--open {
  border-color : var(--cs-border-focus);
  box-shadow   : 0 0 0 3px rgba(10, 102, 194, 0.18);
}

.cs-trigger--invalid {
  border-color : var(--cs-border-invalid);
}

.cs-trigger--invalid:focus-visible,
.cs-trigger--invalid.cs-trigger--open {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.18);
}

.cs-trigger:disabled {
  opacity: 0.55;
  cursor : not-allowed;
  background: #f8f9fa;
}

/* ─── Trigger body ───────────────────────────────────────────────────────── */
.cs-trigger__body {
  flex    : 1;
  min-width: 0;
  display : flex;
  flex-direction: column;
  gap     : 2px;
}

.cs-trigger__label {
  display     : block;
  font-size   : 1rem;
  font-weight : 600;
  color       : var(--cs-label-color);
  line-height : 1.3;
  white-space : nowrap;
  overflow    : hidden;
  text-overflow: ellipsis;
}

.cs-trigger__subtext {
  display     : block;
  font-size   : 0.875rem;
  font-weight : 400;
  color       : var(--cs-sub-color);
  line-height : 1.3;
  white-space : nowrap;
  overflow    : hidden;
  text-overflow: ellipsis;
}

.cs-trigger__placeholder {
  display     : block;
  font-size   : 1rem;
  font-weight : 400;
  color       : var(--cs-placeholder);
  line-height : 1.3;
}

/* ─── Chevron ────────────────────────────────────────────────────────────── */
.cs-trigger__chevron {
  flex-shrink : 0;
  display     : flex;
  align-items : center;
  color       : var(--cs-chevron);
  margin-left : auto;
  padding-left: 8px;
}

.cs-chevron-icon {
  transition: transform var(--cs-transition);
}

.cs-chevron-icon--open {
  transform: rotate(180deg);
}

/* ─── Listbox ────────────────────────────────────────────────────────────── */
.cs-listbox {
  position     : absolute;
  top          : calc(100% + 6px);
  left         : 0;
  right        : 0;
  z-index      : 1050;
  list-style   : none;
  margin       : 0;
  padding      : 6px 0;
  background   : var(--cs-bg);
  border       : 1.5px solid var(--cs-border-focus);
  border-radius: var(--cs-radius);
  box-shadow   : var(--cs-shadow);
  max-height   : 280px;
  overflow-y   : auto;
  overscroll-behavior: contain;

  /* Scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #ced4da transparent;
}

.cs-listbox::-webkit-scrollbar       { width: 6px; }
.cs-listbox::-webkit-scrollbar-track { background: transparent; }
.cs-listbox::-webkit-scrollbar-thumb { background: #ced4da; border-radius: 3px; }

/* ─── Option ─────────────────────────────────────────────────────────────── */
.cs-option {
  display    : flex;
  align-items: flex-start;
  padding    : 10px 14px;
  cursor     : pointer;
  transition : background var(--cs-transition);
  gap        : 10px;
}

.cs-option:hover,
.cs-option--focused {
  background: var(--cs-opt-hover-bg);
}

.cs-option--selected {
  background: var(--cs-opt-sel-bg);
}

.cs-option--disabled {
  opacity: 0.45;
  cursor : not-allowed;
  pointer-events: none;
}

.cs-option--empty {
  color: var(--cs-placeholder);
}

/* Check column — always reserves space so labels stay aligned */
.cs-option__check {
  flex-shrink : 0;
  width       : 18px;
  height      : 20px;
  display     : flex;
  align-items : center;
  color       : var(--cs-check-color);
  margin-top  : 1px;
}

.cs-option__content {
  flex    : 1;
  min-width: 0;
  display : flex;
  flex-direction: column;
  gap     : 2px;
}

.cs-option__label {
  display     : block;
  font-size   : 0.9375rem;
  font-weight : 500;
  color       : var(--cs-label-color);
  line-height : 1.3;
}

.cs-option--selected .cs-option__label {
  color      : var(--cs-opt-sel-color);
  font-weight: 600;
}

.cs-option__subtext {
  display    : block;
  font-size  : 0.8125rem;
  font-weight: 400;
  color      : var(--cs-sub-color);
  line-height: 1.35;
}

/* ─── Enter / Leave Transition ───────────────────────────────────────────── */
.cs-drop-enter-active,
.cs-drop-leave-active {
  transition: opacity var(--cs-transition), transform var(--cs-transition);
}

.cs-drop-enter-from,
.cs-drop-leave-to {
  opacity  : 0;
  transform: translateY(-6px) scale(0.98);
}
</style>

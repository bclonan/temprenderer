<template>
  <WFormGroup>
    <!-- Plaintext / readonly path stays native -->
    <BFormInput
      v-if="isPlaintextComputed"
      :id="id"
      :name="fieldName"
      plaintext
      readonly
      :model-value="refDataValue"
    />

    <!-- ===== RICH MODE (single + multi) ===== -->
    <div v-else-if="useRich" class="w-rich-select-wrap">
      <div
        :id="id"
        class="w-rich-select"
        :class="{
          'is-invalid': shouldShowValidation,
          'w-rich-disabled': disabled,
        }"
        role="combobox"
        aria-haspopup="listbox"
        :aria-expanded="isOpen ? 'true' : 'false'"
        :aria-disabled="disabled ? 'true' : 'false'"
        :aria-controls="listboxId"
        :aria-describedby="computedAriaDescribedby"
        :aria-label="computedAriaLabel"
        tabindex="0"
        @click="toggleOpen"
        @keydown="onKeydown"
        @blur="onBlurRich"
        ref="richTriggerRef"
      >
        <!-- “Selected face” -->
        <div class="w-rich-select__content">
          <!-- Single selection face -->
          <template v-if="!multiple">
            <div class="w-rich-select__title">
              <slot
                name="selected"
                :value="inputValue"
                :option="selectedOption"
              >
                {{ selectedLabel }}
              </slot>
            </div>

            <!-- Subtext INSIDE the box (mockup) -->
            <div v-if="hasSubtextSlot" class="w-rich-select__sub">
              <slot
                name="subtext"
                :value="inputValue"
                :option="selectedOption"
              />
            </div>
          </template>

          <!-- Multi selection face -->
          <template v-else>
            <div class="w-rich-select__title">
              <slot
                name="selected"
                :value="inputValue"
                :options="selectedOptions"
              >
                {{ multiSummary }}
              </slot>
            </div>

            <div v-if="hasSubtextSlot" class="w-rich-select__sub">
              <slot
                name="subtext"
                :value="inputValue"
                :options="selectedOptions"
              />
            </div>

            <!-- Optional: pills preview (enterprise nicety, can remove if you want) -->
            <div v-if="selectedOptions.length" class="w-rich-select__pills">
              <button
                v-for="opt in selectedOptions"
                :key="String(opt[selectValueField])"
                type="button"
                class="w-rich-pill"
                :disabled="disabled"
                @click.stop="removeSelected(opt[selectValueField])"
              >
                {{ opt[selectTextField] }}
                <span class="w-rich-pill__x">×</span>
              </button>
            </div>
          </template>
        </div>

        <div class="w-rich-select__caret" aria-hidden="true">▾</div>
      </div>

      <!-- Dropdown panel -->
      <div
        v-show="isOpen"
        class="w-rich-panel"
        role="listbox"
        :id="listboxId"
        :aria-multiselectable="multiple ? 'true' : 'false'"
        @mousedown.prevent
      >
        <!-- Optional search -->
        <div v-if="searchable" class="w-rich-panel__search">
          <input
            ref="searchRef"
            v-model="searchText"
            type="text"
            class="form-control"
            :placeholder="searchPlaceholder"
            @keydown.stop="onSearchKeydown"
          />
        </div>

        <!-- Placeholder / first option -->
        <div
          v-if="showRichPlaceholder"
          class="w-rich-option"
          :class="{ 'is-active': activeIndex === -1 }"
          role="option"
          aria-selected="false"
          @mouseenter="activeIndex = -1"
          @click="selectPlaceholder"
        >
          <div class="w-rich-option__title">
            {{ richPlaceholderLabel }}
          </div>
        </div>

        <!-- Options -->
        <div
          v-for="(opt, idx) in filteredOptions"
          :key="String(opt[selectValueField])"
          class="w-rich-option"
          :class="{
            'is-selected': isSelected(opt[selectValueField]),
            'is-active': activeIndex === idx,
          }"
          role="option"
          :aria-selected="isSelected(opt[selectValueField]) ? 'true' : 'false'"
          @mouseenter="activeIndex = idx"
          @click="selectOption(opt)"
        >
          <slot
            name="option"
            :option="opt"
            :selected="isSelected(opt[selectValueField])"
          >
            <div class="w-rich-option__title">
              {{ opt[selectTextField] }}
            </div>

            <!-- Optional per-option subtext (2-line menu rows) -->
            <div v-if="hasOptionSubtextSlot" class="w-rich-option__sub">
              <slot name="optionSubtext" :option="opt" />
            </div>
          </slot>

          <div v-if="multiple" class="w-rich-option__check" aria-hidden="true">
            <span v-if="isSelected(opt[selectValueField])">✓</span>
          </div>
        </div>

        <div v-if="!filteredOptions.length" class="w-rich-empty">
          No results
        </div>
      </div>
    </div>

    <!-- ===== NATIVE MODE ===== -->
    <BFormSelect
      v-else
      ref="inputRef"
      :id="id"
      :name="fieldName"
      :aria-label="computedAriaLabel"
      :aria-invalid="shouldShowValidation ? 'true' : undefined"
      :aria-describedby="computedAriaDescribedby"
      :class="{ 'is-invalid': shouldShowValidation }"
      :modelValue="inputValue"
      :options="options"
      :multiple="multiple"
      :required="isRequired"
      :text-field="selectTextField"
      :value-field="selectValueField"
      :autofocus="autoFocus"
      :disabled="disabled"
      :disabled-field="disabledField"
      :state="shouldShowValidation ? false : null"
      :select-size="selectSize"
      :plain="plain"
      @update:modelValue="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @update="handleUpdate"
    >
      <template #first>
        <option
          v-if="!multiple && displayFirstSlot"
          :value="customFirstSlotValue ?? ''"
        >
          {{ localeBasedPlaceHolderText }}
        </option>
      </template>
    </BFormSelect>
  </WFormGroup>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useSlots } from "vue";
import { BFormSelect, BFormInput } from "bootstrap-vue-next";

// ===== your existing imports/composables stay =====
// useFormValidation, useFormControl, useFormControlAccessibility, etc.

const slots = useSlots();

// --- Rich mode triggers (slot-driven + optional prop) ---
const hasSubtextSlot = computed(() => !!slots.subtext);
const hasOptionSubtextSlot = computed(() => !!slots.optionSubtext);
const hasAnyRichSlot = computed(
  () =>
    hasSubtextSlot.value ||
    hasOptionSubtextSlot.value ||
    !!slots.option ||
    !!slots.selected,
);

const useRich = computed(() => {
  // Only makes sense when editable and not plaintext
  if (isPlaintextComputed.value) return false;
  // Multi-select is supported in rich mode
  return props.rich || hasAnyRichSlot.value;
});

// --- Rich state ---
const isOpen = ref(false);
const activeIndex = ref<number>(-1);
const searchText = ref("");
const richTriggerRef = ref<HTMLElement | null>(null);
const searchRef = ref<HTMLInputElement | null>(null);
const listboxId = computed(() => `${props.id}__listbox`);

const richPlaceholderLabel = computed(
  () => props.placeholder || localeBasedPlaceHolderText.value,
);
const searchPlaceholder = computed(() => "Search...");

// Keep your placeholder behavior: show placeholder item when not multiple
const showRichPlaceholder = computed(
  () => !props.multiple && props.displayFirstSlot,
);

// Options helpers
const filteredOptions = computed(() => {
  const opts = props.options ?? [];
  if (!props.searchable) return opts;
  const q = searchText.value.trim().toLowerCase();
  if (!q) return opts;
  return opts.filter((o: any) =>
    String(o?.[props.selectTextField] ?? "")
      .toLowerCase()
      .includes(q),
  );
});

const selectedOption = computed(() => {
  if (props.multiple) return null;
  const v = inputValue.value;
  return (
    (props.options ?? []).find((o: any) => o?.[props.selectValueField] === v) ??
    null
  );
});

const selectedOptions = computed(() => {
  if (!props.multiple) return [];
  const vals = Array.isArray(inputValue.value) ? inputValue.value : [];
  const set = new Set(vals.map(String));
  return (props.options ?? []).filter((o: any) =>
    set.has(String(o?.[props.selectValueField])),
  );
});

const selectedLabel = computed(() => {
  const v = inputValue.value;
  if (v === "" || v === null || v === undefined)
    return richPlaceholderLabel.value;
  return (
    selectedOption.value?.[props.selectTextField] ?? richPlaceholderLabel.value
  );
});

const multiSummary = computed(() => {
  const count = selectedOptions.value.length;
  if (!count) return richPlaceholderLabel.value;
  if (count === 1)
    return String(selectedOptions.value[0][props.selectTextField] ?? "");
  return `${count} selected`;
});

function isSelected(val: any) {
  if (!props.multiple) return String(inputValue.value) === String(val);
  const arr = Array.isArray(inputValue.value) ? inputValue.value : [];
  return arr.some((v) => String(v) === String(val));
}

// --- Open/close ---
function open() {
  if (props.disabled) return;
  isOpen.value = true;
  nextTick(() => {
    // focus search if enabled
    if (props.searchable) searchRef.value?.focus();
  });
  // initialize active index
  activeIndex.value = filteredOptions.value.length ? 0 : -1;
}

function close() {
  isOpen.value = false;
  searchText.value = "";
  activeIndex.value = -1;
}

function toggleOpen() {
  if (props.disabled) return;
  isOpen.value ? close() : open();
}

// blur handling: close + validate
function onBlurRich() {
  // Allow click inside panel without closing immediately (mousedown.prevent on panel)
  // Defer close so click selection can run
  setTimeout(() => {
    if (!isOpen.value) return;
    close();
    handleBlur();
  }, 0);
}

// --- Selection logic ---
function selectPlaceholder() {
  // Equivalent to choosing first-slot empty
  if (props.disabled) return;
  handleInput(props.customFirstSlotValue ?? "");
  handleChange(props.customFirstSlotValue ?? "");
  if (props.closeOnSelect) {
    close();
    // mimic blur after selection for validation flow
    nextTick(() => handleBlur());
  }
}

function selectOption(opt: any) {
  if (props.disabled) return;
  const val = opt?.[props.selectValueField];

  if (!props.multiple) {
    handleInput(val);
    handleChange(val);
    if (props.closeOnSelect) {
      close();
      nextTick(() => handleBlur());
    }
    return;
  }

  // multiple toggle
  const current = Array.isArray(inputValue.value) ? [...inputValue.value] : [];
  const sVal = String(val);
  const idx = current.findIndex((v) => String(v) === sVal);
  if (idx >= 0) current.splice(idx, 1);
  else current.push(val);

  handleInput(current as any);
  handleChange(current as any);

  // Keep open by default for multi-select unless explicitly requested
  if (props.closeOnSelect) {
    close();
    nextTick(() => handleBlur());
  }
}

function removeSelected(val: any) {
  if (!props.multiple || props.disabled) return;
  const current = Array.isArray(inputValue.value) ? [...inputValue.value] : [];
  const sVal = String(val);
  const idx = current.findIndex((v) => String(v) === sVal);
  if (idx >= 0) {
    current.splice(idx, 1);
    handleInput(current as any);
    handleChange(current as any);
  }
}

// --- Keyboard support (enterprise must-have) ---
function onKeydown(e: KeyboardEvent) {
  if (props.disabled) return;

  if (!isOpen.value) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
    return;
  }

  if (e.key === "Escape") {
    e.preventDefault();
    close();
    nextTick(() => handleBlur());
    return;
  }

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!filteredOptions.value.length) return;
    activeIndex.value = Math.min(
      activeIndex.value + 1,
      filteredOptions.value.length - 1,
    );
    return;
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (!filteredOptions.value.length) return;
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
    return;
  }

  if (e.key === "Enter") {
    e.preventDefault();
    const opt = filteredOptions.value[activeIndex.value];
    if (opt) selectOption(opt);
    return;
  }
}

function onSearchKeydown(e: KeyboardEvent) {
  // allow arrows/enter to navigate options even while search focused
  if (
    e.key === "ArrowDown" ||
    e.key === "ArrowUp" ||
    e.key === "Enter" ||
    e.key === "Escape"
  ) {
    onKeydown(e);
  }
}

// keep your existing onMounted required toggle logic
onMounted(() => {
  nextTick(() => {
    if (props.isRequired && inputRef.value) {
      // your existing "remove browser required on mount" logic here if needed
    }
  });
});
</script>

<style>
.w-rich-select-wrap {
  position: relative;
}

.w-rich-select {
  width: 100%;
  min-height: 58px;
  border: 1px solid var(--bs-border-color);
  background: var(--bs-body-bg);
  border-radius: 0 !important;
  padding: 0.5rem 0.75rem;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  cursor: pointer;
}

.w-rich-select:focus {
  outline: 0;
  border-color: rgba(var(--bs-primary-rgb), 0.6);
  box-shadow: 0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.25);
}

.w-rich-disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.w-rich-select__content {
  flex: 1;
  min-width: 0;
}

.w-rich-select__title {
  font-weight: 600;
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.w-rich-select__sub {
  margin-top: 0.125rem;
  font-size: 0.875rem;
  color: var(--bs-secondary-color);
  line-height: 1.15;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.w-rich-select__caret {
  color: var(--bs-secondary-color);
  line-height: 1;
  padding-top: 0.15rem;
}

.w-rich-panel {
  position: absolute;
  z-index: 1060;
  width: 100%;
  margin-top: 0.25rem;
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
  border-radius: 0;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  max-height: 280px;
  overflow: auto;
}

.w-rich-panel__search {
  padding: 0.5rem;
  border-bottom: 1px solid var(--bs-border-color);
}

.w-rich-option {
  padding: 0.5rem 0.75rem;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  cursor: pointer;
}

.w-rich-option.is-active {
  background: rgba(var(--bs-primary-rgb), 0.08);
}

.w-rich-option.is-selected {
  background: rgba(var(--bs-primary-rgb), 0.12);
}

.w-rich-option__title {
  font-weight: 600;
  line-height: 1.15;
}

.w-rich-option__sub {
  font-size: 0.875rem;
  color: var(--bs-secondary-color);
  margin-top: 0.125rem;
  line-height: 1.15;
}

.w-rich-option__check {
  min-width: 1.25rem;
  text-align: right;
  color: var(--bs-primary);
}

.w-rich-empty {
  padding: 0.75rem;
  color: var(--bs-secondary-color);
}

.w-rich-select__pills {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.w-rich-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--bs-border-color);
  background: var(--bs-body-bg);
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
}

.w-rich-pill__x {
  opacity: 0.7;
}
</style>

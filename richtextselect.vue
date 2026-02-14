
<WFormGroup>
  <!-- Plaintext/readonly path stays exactly how you do it today -->
  <template v-if="isPlaintextComputed">
    <BFormInput
      :id="id"
      :name="fieldName"
      plaintext
      readonly
      :model-value="refDataValue"
    />
  </template>

  <!-- ✅ Rich select (2 lines INSIDE the box) -->
  <template v-else-if="useRichSelect">
    <BDropdown
      class="w-100"
      variant="light"
      :disabled="disabled"
      :toggle-class="[
        'w-rich-select-toggle',
        { 'is-invalid': shouldShowValidation }
      ]"
      menu-class="w-100"
      no-caret
      @hidden="handleBlur"
    >
      <!-- “Select box face” -->
      <template #button-content>
        <div class="d-flex justify-content-between align-items-start w-100">
          <div class="text-start">
            <div class="fw-semibold">{{ selectedLabel }}</div>

            <!-- 👇 Subtext INSIDE the box -->
            <div class="small text-muted">
              <slot name="subtext" :value="inputValue" />
            </div>
          </div>

          <span class="ms-2 text-muted">▾</span>
        </div>
      </template>

      <!-- Options list (simple 1-line items; can be expanded later) -->
      <BDropdownItem
        v-for="opt in options"
        :key="String(opt[selectValueField])"
        @click="() => { handleInput(opt[selectValueField]); handleChange(opt[selectValueField]) }"
      >
        {{ opt[selectTextField] }}
      </BDropdownItem>
    </BDropdown>
  </template>

  <!-- ✅ Normal native select path (your existing code) -->
  <template v-else>
    <BFormSelect
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
  </template>
</WFormGroup>

<script lang=ts">
import { useSlots } from 'vue'
import { BDropdown, BDropdownItem } from 'bootstrap-vue-next'



const slots = useSlots()

// Only enable rich select when the using component provides the slot AND it's not multiple
const hasSubtextSlot = computed(() => !!slots.subtext)
const useRichSelect = computed(() => hasSubtextSlot.value && !props.multiple && !isPlaintextComputed.value)

// Selected label for rich mode
const selectedLabel = computed(() => {
  // Placeholder when empty
  const current = inputValue.value
  if (current === '' || current === null || current === undefined) return localeBasedPlaceHolderText.value

  const selected = (props.options ?? []).find(
    (o: any) => o?.[props.selectValueField] === current
  )

  return selected?.[props.selectTextField] ?? localeBasedPlaceHolderText.value
})

</script>


<style>
.w-rich-select-toggle {
  width: 100%;
  min-height: 58px;                  // room for 2 lines
  border: 1px solid var(--bs-border-color);
  background: var(--bs-body-bg);
  border-radius: 0 !important;       // boxy
  padding: .5rem .75rem;
  text-align: left;
  box-shadow: none !important;
}


</style>
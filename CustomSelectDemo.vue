<template>
  <div class="container py-5" style="max-width: 640px">
    <h1 class="h3 fw-bold mb-1">Create Job Posting</h1>
    <p class="text-muted small text-uppercase fw-semibold mb-4">Basic Information</p>
    <hr class="mb-4" />

    <h2 class="h5 fw-bold mb-3">Job Site Location</h2>

    <!-- ── Location Type ──────────────────────────────────────────────────── -->
    <div class="mb-4">
      <label class="fw-semibold text-primary mb-1 d-block">
        What is the location type for this role?
        <span class="text-danger small fw-normal ms-1">(required)</span>
      </label>
      <p class="text-muted small mb-2">
        Sharing this detail ensures we suggest your posting to candidates near the job site.
      </p>

      <CustomSelect
        v-model="locationType"
        label="Location type"
        placeholder="- Select -"
        id="location-type"
        :options="locationOptions"
        :required="true"
        :invalid="submitted && !locationType"
        allow-empty
      >
        <!--
          Per-option subtext slot. Named `option-subtext-{value}`.
          The slot scope gives you access to the full option object.
        -->
        <template #option-subtext-remote="{ option }">
          {{ option.subtext }} — <strong>No commute required</strong>
        </template>
      </CustomSelect>

      <div v-if="submitted && !locationType" class="text-danger small mt-1" role="alert">
        Please select a location type.
      </div>
    </div>

    <!-- ── Operating Radius ───────────────────────────────────────────────── -->
    <div class="mb-4">
      <label class="fw-semibold mb-1 d-block">
        Operating Radius
        <span class="text-danger small fw-normal ms-1">(required)</span>
      </label>

      <CustomSelect
        v-model="radius"
        label="Operating radius"
        placeholder="- Select -"
        id="operating-radius"
        :options="radiusOptions"
        :required="true"
      />
    </div>

    <!-- ── Submit ─────────────────────────────────────────────────────────── -->
    <button class="btn btn-primary px-4" @click="submitted = true">
      Continue
    </button>

    <!-- ── Debug output ───────────────────────────────────────────────────── -->
    <div class="mt-4 p-3 bg-light rounded small font-monospace">
      <strong>v-model values:</strong><br />
      locationType: {{ locationType ?? 'null' }}<br />
      radius: {{ radius ?? 'null' }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CustomSelect from './CustomSelect.vue'

const submitted    = ref(false)
const locationType = ref(null)
const radius       = ref(null)

const locationOptions = [
  {
    value  : 'onsite',
    label  : 'On-site',
    subtext: 'Employees come in to work full-time',
  },
  {
    value  : 'hybrid',
    label  : 'Hybrid',
    subtext: 'Mix of remote and in-office work',
  },
  {
    value  : 'remote',
    label  : 'Remote',
    subtext: 'Work from anywhere',
    // ^ subtext for trigger display; slot overrides list item subtext
  },
  {
    value  : 'travel',
    label  : 'Travel',
    subtext: 'Travel for assignments',
  },
  {
    value   : 'contract',
    label   : 'Contract / Freelance',
    subtext : 'Project-based engagement',
    disabled: true,   // shows how disabled options work
  },
]

const radiusOptions = [
  { value: 10,  label: '10 miles',  subtext: 'Local area' },
  { value: 25,  label: '25 miles',  subtext: 'Regional' },
  { value: 50,  label: '50 miles',  subtext: 'Metro area' },
  { value: 100, label: '100 miles', subtext: 'Extended region' },
  { value: 0,   label: 'Nationwide', subtext: 'No radius restriction' },
]
</script>

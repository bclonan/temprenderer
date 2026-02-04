<template>
  <div class="min-vh-100 bg-light">
    <!-- Stepper -->
    <div class="bg-white border-bottom py-3">
      <div class="container">
        <div class="d-grid gap-2" style="grid-template-columns: repeat(3, 1fr)">
          <div
            v-for="step in stepper"
            :key="step.id"
            class="text-center rounded-pill border py-2 small"
            :class="stepClass(step.id)"
          >
            {{ step.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- Page Content -->
    <div class="container py-4">
      <div class="d-flex justify-content-center">
        <div class="w-100" style="max-width: 420px">
          <div
            class="bg-white border rounded-4 p-4 shadow-sm position-relative"
          >
            <h2 class="fs-4 mb-1">Preferences</h2>

            <h3 class="fs-5 mt-3 mb-1">Job Details</h3>
            <p class="text-muted small">
              Let us know your preferred schedule, job type, and location so we
              can recommend opportunities that fit your lifestyle and where you
              want to work.
            </p>

            <div v-if="state.error" class="alert alert-danger">
              {{ state.error }}
            </div>

            <div
              v-if="state.isBusy"
              class="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center rounded-4 fw-semibold"
            >
              Loading…
            </div>

            <template v-if="state.dto">
              <!-- Preferred Shift -->
              <div class="mt-3">
                <div class="fw-semibold mb-2">
                  What’s your preferred shift?
                  <span class="text-muted small">(required)</span>
                </div>

                <div class="d-flex flex-wrap gap-2">
                  <button
                    v-for="opt in shiftOptions"
                    :key="opt"
                    class="btn btn-sm rounded-pill"
                    :class="chipClass(state.dto.preferredShifts.includes(opt))"
                    @click="actions.toggleShift(opt)"
                  >
                    {{ opt }}
                  </button>
                </div>
              </div>

              <!-- Job Type -->
              <div class="mt-3">
                <div class="fw-semibold mb-2">
                  What job type do you prefer?
                  <span class="text-muted small">(required)</span>
                </div>

                <div class="d-flex flex-wrap gap-2">
                  <button
                    v-for="opt in jobTypeOptions"
                    :key="opt"
                    class="btn btn-sm rounded-pill"
                    :class="chipClass(state.dto.jobTypes.includes(opt))"
                    @click="actions.toggleJobType(opt)"
                  >
                    {{ formatJobType(opt) }}
                  </button>
                </div>
              </div>

              <!-- Work Mode -->
              <div class="mt-3">
                <div class="fw-semibold mb-2">
                  How do you prefer to work?
                  <span class="text-muted small">(required)</span>
                </div>

                <div class="d-flex flex-wrap gap-2">
                  <button
                    v-for="opt in workModeOptions"
                    :key="opt"
                    class="btn btn-sm rounded-pill"
                    :class="chipClass(state.dto.workModes.includes(opt))"
                    @click="actions.toggleWorkMode(opt)"
                  >
                    {{ formatWorkMode(opt) }}
                  </button>
                </div>
              </div>

              <!-- Location -->
              <div class="mt-3">
                <div class="fw-semibold">
                  Where are you interested in working?
                  <span class="text-muted small">(required)</span>
                </div>

                <p class="text-muted small mb-2">
                  We’ll use your location to recommend jobs in your area.
                </p>

                <div class="row g-2">
                  <div class="col-6">
                    <label class="form-label small">Zip Code</label>
                    <input
                      type="text"
                      class="form-control"
                      v-model="state.dto.zipCode"
                      maxlength="10"
                    />
                  </div>

                  <div class="col-6">
                    <label class="form-label small">Radius</label>
                    <select class="form-select" v-model="state.dto.radiusMiles">
                      <option :value="null">- Select -</option>
                      <option
                        v-for="r in state.radiusOptions"
                        :key="r"
                        :value="r"
                      >
                        {{ r }} miles
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Relocate -->
              <div class="mt-3">
                <div class="fw-semibold mb-2">
                  Are you willing to relocate?
                  <span class="text-muted small">(required)</span>
                </div>

                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    :value="true"
                    v-model="state.dto.willingToRelocate"
                  />
                  <label class="form-check-label">Yes</label>
                </div>

                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    :value="false"
                    v-model="state.dto.willingToRelocate"
                  />
                  <label class="form-check-label">No</label>
                </div>
              </div>

              <!-- Footer -->
              <div
                class="d-flex justify-content-between align-items-center mt-4"
              >
                <button class="btn btn-outline-secondary" @click="actions.back">
                  Back
                </button>

                <div class="d-flex gap-2">
                  <button class="btn btn-outline-primary" @click="actions.save">
                    Save
                  </button>

                  <button
                    class="btn btn-primary"
                    :disabled="!canContinue"
                    @click="actions.continueNext"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from "vue";
import type {
  JobPreferencesDto,
  ShiftOption,
  JobTypeOption,
  WorkModeOption,
} from "@/dtos/jobPreferencesDto";
import {
  getJobPreferencesPageLoad,
  saveJobPreferences,
} from "@/api/jobPreferencesApi";

const afToken = "stub-af-token";

const state = reactive({
  dto: null as JobPreferencesDto | null,
  radiusOptions: [] as number[],
  isBusy: false,
  error: null as string | null,
});

const stepper = [
  { id: 1, label: "PROFILE" },
  { id: 2, label: "JOB DETAILS" },
  { id: 3, label: "VISIBILITY" },
];

const shiftOptions: ShiftOption[] = [
  "Day",
  "Evening",
  "Night",
  "Rotation",
  "Weekend",
];
const jobTypeOptions: JobTypeOption[] = [
  "FullTime",
  "PartTime",
  "Internship",
  "TemporarySeasonal",
];
const workModeOptions: WorkModeOption[] = [
  "InPerson",
  "Hybrid",
  "Remote",
  "Travel",
];

const canContinue = computed(() => {
  if (!state.dto) return false;
  return (
    state.dto.zipCode.length >= 5 &&
    state.dto.radiusMiles !== null &&
    state.dto.willingToRelocate !== null
  );
});

const actions = {
  async load() {
    state.isBusy = true;
    const resp = await getJobPreferencesPageLoad(afToken);
    state.dto = resp.dto;
    state.radiusOptions = resp.radiusOptions;
    state.isBusy = false;
  },

  async save() {
    if (!state.dto) return;
    await saveJobPreferences(afToken, { dto: state.dto });
  },

  toggleShift(v: ShiftOption) {
    toggleArray(state.dto!.preferredShifts, v);
  },

  toggleJobType(v: JobTypeOption) {
    toggleArray(state.dto!.jobTypes, v);
  },

  toggleWorkMode(v: WorkModeOption) {
    toggleArray(state.dto!.workModes, v);
  },

  back() {
    history.back();
  },

  async continueNext() {
    await actions.save();
    console.log("Next step DTO:", state.dto);
  },
};

function toggleArray<T>(arr: T[], v: T) {
  const idx = arr.indexOf(v);
  idx >= 0 ? arr.splice(idx, 1) : arr.push(v);
}

function chipClass(active: boolean) {
  return active ? "btn-primary" : "btn-outline-secondary";
}

function stepClass(id: number) {
  return id === state.dto?.currentStep
    ? "bg-primary bg-opacity-10 border-primary fw-semibold"
    : "text-muted";
}

function formatJobType(v: JobTypeOption) {
  return v === "TemporarySeasonal"
    ? "Temporary / Seasonal"
    : v.replace(/([A-Z])/g, " $1").trim();
}

function formatWorkMode(v: WorkModeOption) {
  return v === "InPerson" ? "In-person" : v;
}

onMounted(() => actions.load());
</script>

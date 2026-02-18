<template>
  <div class="container my-4">
    <!-- HEADER -->
    <div class="mb-4">
      <h2 class="h4 mb-1">Create Job Posting</h2>
      <div class="text-muted small">
        BASIC INFORMATION • LOCATION • <span class="fw-semibold text-dark">SALARY DETAILS</span>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-body p-4">
        <h3 class="h5 mb-2">Salary Details</h3>
        <p class="text-muted mb-4" style="max-width: 860px;">
          Compensation entered must comply with applicable federal, state, and local wage laws based on the job location and pay rate.
          All job postings are subject to review, and postings with incorrect or non-compliant compensation information may be rejected.
        </p>

        <!-- Job Type -->
        <div class="mb-3" style="max-width: 520px;">
          <label class="form-label fw-semibold">
            What is the job type for this role? <span class="text-danger">*</span>
          </label>
          <div class="text-muted small mb-2">
            Sharing this detail ensures we suggest your posting to candidates interested in this work arrangement.
          </div>

          <select class="form-select" :value="form.jobType" @change="onJobTypeChange">
            <option disabled value="">- Select -</option>
            <option v-for="opt in JOB_TYPE_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Internship Paid/Unpaid (only when Internship selected) -->
        <div v-if="showInternshipPaidToggle" class="mb-4">
          <label class="form-label fw-semibold">
            Is this internship paid or unpaid? <span class="text-danger">*</span>
          </label>

          <div class="d-flex gap-4">
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                :id="ids.internPaid"
                :checked="form.internshipIsPaid === true"
                @change="setInternshipPaid(true)"
              />
              <label class="form-check-label" :for="ids.internPaid">Paid</label>
            </div>

            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                :id="ids.internUnpaid"
                :checked="form.internshipIsPaid === false"
                @change="setInternshipPaid(false)"
              />
              <label class="form-check-label" :for="ids.internUnpaid">Unpaid</label>
            </div>
          </div>
        </div>

        <!-- Salary Range block (Full-time/Part-time/Temp/Seasonal + Paid Internship) -->
        <div v-if="showSalaryRangeBlock" class="mb-4">
          <div class="mb-2">
            <label class="form-label fw-semibold">
              What is the salary range? <span class="text-danger">*</span>
            </label>
            <div class="text-muted small">
              Minimum wage requirements vary by job location and pay rate.
            </div>
          </div>

          <!-- Quick Tip box -->
          <div class="border border-primary-subtle bg-primary-subtle rounded p-3 mb-3" style="max-width: 860px;">
            <div class="d-flex gap-2">
              <div class="fw-bold text-primary">★</div>
              <div>
                <div class="fw-semibold">Quick Tip</div>
                <div class="small text-muted">
                  Wage information is necessary to meet statistical and federal reporting requirements. Extensive data shows that job seekers
                  are more likely to apply to jobs with accurate salary displayed. Please reference Career One Stop for wage information.
                </div>
              </div>
            </div>
          </div>

          <!-- Min/Max/Pay Period -->
          <div class="row g-3 align-items-end" style="max-width: 860px;">
            <div class="col-md-4">
              <label class="form-label fw-semibold">Minimum rate</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input
                  type="number"
                  class="form-control"
                  min="0"
                  step="0.01"
                  v-model.number="form.minRate"
                />
              </div>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Maximum rate</label>
              <div class="input-group">
                <span class="input-group-text">$</span>
                <input
                  type="number"
                  class="form-control"
                  min="0"
                  step="0.01"
                  v-model.number="form.maxRate"
                />
              </div>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold">Per time period</label>
              <select class="form-select" v-model="form.payPeriod">
                <option disabled value="">- Select -</option>
                <option v-for="p in PAY_PERIOD_OPTIONS" :key="p.value" :value="p.value">
                  {{ p.label }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Hours per week (always required in mockups; unpaid internship shows this without salary block) -->
        <div class="mb-4" style="max-width: 520px;">
          <label class="form-label fw-semibold">
            How many hours per week does this job require? <span class="text-danger">*</span>
          </label>

          <input
            type="number"
            class="form-control"
            min="0"
            step="1"
            :disabled="form.hoursMayVary"
            v-model.number="form.hoursPerWeek"
            style="max-width: 180px;"
          />

          <div class="form-check mt-2">
            <input
              class="form-check-input"
              type="checkbox"
              :id="ids.hoursMayVary"
              :checked="form.hoursMayVary"
              @change="setHoursMayVary(!form.hoursMayVary)"
            />
            <label class="form-check-label text-muted" :for="ids.hoursMayVary">
              Hours may vary
            </label>
          </div>
        </div>

        <!-- Commission / Incentive Pay -->
        <div class="mb-4" style="max-width: 520px;">
          <label class="form-label fw-semibold">Will this position offer commission or incentive pay?</label>
          <div class="text-muted small mb-2">
            If this position is marked as commission-only, please confirm that the total compensation provided to employees meets or exceeds
            all applicable minimum wage requirements.
          </div>

          <select class="form-select" v-model="form.incentivePayType">
            <option disabled value="">- Select -</option>
            <option v-for="c in INCENTIVE_PAY_OPTIONS" :key="c.value" :value="c.value">
              {{ c.label }}
            </option>
          </select>
        </div>

        <!-- Display salary to individuals -->
        <div class="mb-3">
          <label class="form-label fw-semibold">
            Display salary to individuals? <span class="text-danger">*</span>
          </label>

          <!-- Quick Tip box -->
          <div class="border border-primary-subtle bg-primary-subtle rounded p-3 mb-2" style="max-width: 860px;">
            <div class="d-flex gap-2">
              <div class="fw-bold text-primary">★</div>
              <div>
                <div class="fw-semibold">Quick Tip</div>
                <div class="small text-muted">
                  Some states require salary ranges in job postings. Including this information up front not only helps you meet legal requirements,
                  but also attracts great candidates and builds trust. If you choose not to enter salary details, we’ll display
                  “Competitive Salary” where needed.
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex gap-4">
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                :id="ids.displayYes"
                :checked="form.displaySalary === true"
                @change="setDisplaySalary(true)"
              />
              <label class="form-check-label" :for="ids.displayYes">Yes</label>
            </div>

            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                :id="ids.displayNo"
                :checked="form.displaySalary === false"
                @change="setDisplaySalary(false)"
              />
              <label class="form-check-label" :for="ids.displayNo">No</label>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="card-footer bg-white d-flex justify-content-between p-3">
        <button type="button" class="btn btn-outline-secondary px-4" @click="onBack">Back</button>
        <button type="button" class="btn btn-primary px-4" @click="onSubmitClicked">Continue</button>
      </div>
    </div>

    <!-- MIN WAGE MODAL -->
    <div
      v-if="minWageModalOpen"
      class="modal fade show"
      tabindex="-1"
      style="display: block;"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-dialog modal-dialog-centered" role="document" style="max-width: 760px;">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Minimum Wage Requirement</h5>
            <button type="button" class="btn-close btn-close-white" aria-label="Close" @click="closeMinWageModal" />
          </div>

          <div class="modal-body">
            <h6 class="fw-semibold mb-2">The salary range does not meet the minimum wage requirements.</h6>
            <p class="text-muted mb-0">
              Change the Minimum and Maximum rates or continue to display this job posting with the minimum wage of
              <span class="fw-semibold">${{ MIN_WAGE_HOURLY.toFixed(2) }}</span> per hour.
            </p>
          </div>

          <div class="modal-footer d-flex justify-content-between">
            <button type="button" class="btn btn-outline-secondary px-4" @click="closeMinWageModal">Cancel</button>
            <button type="button" class="btn btn-primary px-4" @click="continueWithMinWage">Continue</button>
          </div>
        </div>
      </div>

      <!-- modal backdrop -->
      <div class="modal-backdrop fade show"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";

/**
 * Constants (you can later move to /data file like the Step2 pattern)
 */
type JobType = "Full-time" | "Part-time" | "Internship" | "Temporary/Seasonal";
type PayPeriod = "Hour" | "Week" | "Month" | "Year";
type IncentivePayType = "Commission Only" | "None" | "Salary Plus Commission";

const MIN_WAGE_HOURLY = 7.25;

const JOB_TYPE_OPTIONS: ReadonlyArray<{ value: JobType; label: string }> = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Internship", label: "Internship" },
  { value: "Temporary/Seasonal", label: "Temporary/Seasonal" },
];

const PAY_PERIOD_OPTIONS: ReadonlyArray<{ value: PayPeriod; label: string }> = [
  { value: "Hour", label: "Hour" },
  { value: "Week", label: "Week" },
  { value: "Month", label: "Month" },
  { value: "Year", label: "Year" },
];

const INCENTIVE_PAY_OPTIONS: ReadonlyArray<{ value: IncentivePayType; label: string }> = [
  { value: "Commission Only", label: "Commission Only" },
  { value: "None", label: "None" },
  { value: "Salary Plus Commission", label: "Salary Plus Commission" },
];

const ids = {
  internPaid: "internPaid",
  internUnpaid: "internUnpaid",
  hoursMayVary: "hoursMayVary",
  displayYes: "displaySalaryYes",
  displayNo: "displaySalaryNo",
};

/**
 * Form model (screen DTO)
 */
const form = reactive({
  // Job type selection
  jobType: "" as JobType | "",
  internshipIsPaid: null as boolean | null, // only meaningful when jobType==="Internship"

  // Salary range fields (not shown for unpaid internship)
  minRate: null as number | null,
  maxRate: null as number | null,
  payPeriod: "" as PayPeriod | "",

  // Hours
  hoursPerWeek: null as number | null,
  hoursMayVary: false,

  // Incentive pay
  incentivePayType: "" as IncentivePayType | "",

  // Display salary
  displaySalary: null as boolean | null,

  // Internal: user accepted min-wage override
  allowMinWageOverride: false,
});

/**
 * Computed display flags (NO watchers)
 */
const isInternship = computed(() => form.jobType === "Internship");
const showInternshipPaidToggle = computed(() => isInternship.value);

const isUnpaidInternship = computed(() => isInternship.value && form.internshipIsPaid === false);
const isPaidInternship = computed(() => isInternship.value && form.internshipIsPaid === true);

const showSalaryRangeBlock = computed(() => {
  // Salary block shows for:
  // - Full-time / Part-time / Temporary/Seasonal
  // - Internship ONLY when paid
  if (!form.jobType) return false;
  if (isInternship.value) return isPaidInternship.value;
  return true;
});

/**
 * Converting min rate to hourly to evaluate minimum wage.
 * Assumptions:
 * - Week: divide by hoursPerWeek (if provided, else assume 40)
 * - Month: approximate to (52 weeks / 12 months) * hoursPerWeek
 * - Year: 52 * hoursPerWeek
 * - Hour: direct
 */
const hourlyEquivalentMinRate = computed((): number | null => {
  if (!showSalaryRangeBlock.value) return null;
  if (form.minRate == null || form.minRate <= 0) return null;
  if (!form.payPeriod) return null;

  const hours = (form.hoursMayVary ? (form.hoursPerWeek ?? 40) : (form.hoursPerWeek ?? 40));
  const safeHours = hours > 0 ? hours : 40;

  switch (form.payPeriod) {
    case "Hour":
      return form.minRate;
    case "Week":
      return form.minRate / safeHours;
    case "Month":
      // ~ 4.333 weeks/month
      return form.minRate / (safeHours * (52 / 12));
    case "Year":
      return form.minRate / (safeHours * 52);
    default:
      return null;
  }
});

const isBelowMinWage = computed(() => {
  const hr = hourlyEquivalentMinRate.value;
  return hr != null && hr < MIN_WAGE_HOURLY;
});

/**
 * Method-driven state transitions (clearing sub-fields explicitly)
 */
function onJobTypeChange(e: Event) {
  const next = (e.target as HTMLSelectElement).value as JobType | "";
  setJobType(next);
}

function setJobType(next: JobType | "") {
  form.jobType = next;

  // Clear internship paid/unpaid when leaving internship
  if (next !== "Internship") {
    form.internshipIsPaid = null;
  } else {
    // default to null until user selects paid/unpaid
    if (form.internshipIsPaid === null) form.internshipIsPaid = true; // optional default: paid
  }

  // If unpaid internship -> clear salary range
  if (next === "Internship" && form.internshipIsPaid === false) {
    clearSalaryRangeFields();
  }

  // Reset min wage override any time job type changes
  form.allowMinWageOverride = false;
}

function setInternshipPaid(value: boolean) {
  form.internshipIsPaid = value;
  form.allowMinWageOverride = false;

  if (!value) {
    // Unpaid internship: no salary range
    clearSalaryRangeFields();
  }
}

function clearSalaryRangeFields() {
  form.minRate = null;
  form.maxRate = null;
  form.payPeriod = "";
}

function setHoursMayVary(value: boolean) {
  form.hoursMayVary = value;

  // If hours may vary, you might keep hoursPerWeek or clear it.
  // Mockups show input still present; we’ll keep it but disable when checked.
  // If you want cleared instead:
  // if (value) form.hoursPerWeek = null;
}

function setDisplaySalary(value: boolean) {
  form.displaySalary = value;
}

/**
 * Submit flow + min wage modal behavior
 */
const minWageModalOpen = ref(false);

function onSubmitClicked() {
  const errors = validate();
  if (errors.length) {
    alert(errors.join("\n"));
    return;
  }

  // Low Pay Variation: show modal on submit (only for salary range screens)
  if (showSalaryRangeBlock.value && isBelowMinWage.value && !form.allowMinWageOverride) {
    openMinWageModal();
    return;
  }

  // Proceed with save
  doSave();
}

function openMinWageModal() {
  minWageModalOpen.value = true;
}

function closeMinWageModal() {
  minWageModalOpen.value = false;
}

function continueWithMinWage() {
  // Per modal message: continue with minimum wage of $7.25/hour.
  // Enterprise-safe behavior: clamp min rate to min wage (in chosen pay period).
  clampMinRateToMinWage();
  form.allowMinWageOverride = true;
  closeMinWageModal();
  doSave();
}

function clampMinRateToMinWage() {
  if (!form.payPeriod) return;

  const hours = (form.hoursPerWeek ?? 40);
  const safeHours = hours > 0 ? hours : 40;

  switch (form.payPeriod) {
    case "Hour":
      form.minRate = MIN_WAGE_HOURLY;
      break;
    case "Week":
      form.minRate = round2(MIN_WAGE_HOURLY * safeHours);
      break;
    case "Month":
      form.minRate = round2(MIN_WAGE_HOURLY * safeHours * (52 / 12));
      break;
    case "Year":
      form.minRate = round2(MIN_WAGE_HOURLY * safeHours * 52);
      break;
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Validation rules based on mockups
 */
function validate(): string[] {
  const errors: string[] = [];

  if (!form.jobType) errors.push("Job type is required.");

  // Internship requires paid/unpaid selection
  if (isInternship.value && form.internshipIsPaid === null) {
    errors.push("Internship paid/unpaid selection is required.");
  }

  // Salary range required when block is shown
  if (showSalaryRangeBlock.value) {
    if (form.minRate == null) errors.push("Minimum rate is required.");
    if (form.maxRate == null) errors.push("Maximum rate is required.");
    if (!form.payPeriod) errors.push("Pay period is required.");

    if (form.minRate != null && form.maxRate != null && form.minRate > form.maxRate) {
      errors.push("Minimum rate cannot be greater than Maximum rate.");
    }
  }

  // Hours per week required (even if may vary, screenshots still show it as required)
  if (!form.hoursMayVary) {
    if (form.hoursPerWeek == null) errors.push("Hours per week is required.");
  } else {
    // If your business says it can be empty when 'hours may vary', remove this.
    if (form.hoursPerWeek == null) errors.push("Hours per week is required (or uncheck 'Hours may vary').");
  }

  // Incentive pay selection (mockup doesn’t mark required, so optional)
  // Display salary required
  if (form.displaySalary === null) errors.push("Display salary selection is required.");

  return errors;
}

function doSave() {
  // Replace with your API call
  // - map to DTO
  // - POST to /step3/salarydetails/Save
  console.log("Saving payload:", JSON.parse(JSON.stringify(form)));
  alert("Saved (stub).");
}

/**
 * Nav stubs
 */
function onBack() {
  console.log("Back");
}
</script>

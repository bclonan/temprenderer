<template>
  <div class="container my-4">
    <!-- HEADER -->
    <div class="mb-4">
      <h2 class="h4 mb-1">Create Job Posting</h2>
      <div class="text-muted small">
        BASIC INFORMATION •
        <span class="fw-semibold text-dark">LOCATION</span> • SALARY DETAILS
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-body p-4">
        <!-- ========================= -->
        <!-- JOB SITE LOCATION -->
        <!-- ========================= -->
        <h3 class="h5 mb-3">Job Site Location</h3>

        <div class="mb-3">
          <label class="form-label fw-semibold">
            What is the location type for this role?
            <span class="text-danger">*</span>
          </label>

          <div class="text-muted small mb-2">
            Sharing this detail ensures we suggest your posting to candidates
            interested in this work arrangement.
          </div>

          <select
            class="form-select"
            :value="form.locationType"
            @change="onLocationTypeChange"
          >
            <option disabled value="">- Select -</option>
            <option value="IN_PERSON">In-Person</option>
            <option value="REMOTE">Remote</option>
            <option value="TRAVEL">Travel</option>
          </select>
        </div>

        <!-- IN PERSON -->
        <div v-if="isInPerson" class="border rounded p-3 mb-4">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold"
                >Address Line 1 <span class="text-danger">*</span></label
              >
              <input class="form-control" v-model="form.address1" />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">Address Line 2</label>
              <input class="form-control" v-model="form.address2" />
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold"
                >City <span class="text-danger">*</span></label
              >
              <input class="form-control" v-model="form.city" />
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold"
                >State <span class="text-danger">*</span></label
              >
              <select class="form-select" v-model="form.state">
                <option disabled value="">- Select -</option>
                <option v-for="s in states" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold"
                >Zip Code <span class="text-danger">*</span></label
              >
              <input class="form-control" v-model="form.zip" />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold"
                >County <span class="text-danger">*</span></label
              >
              <input class="form-control" v-model="form.county" />
            </div>
          </div>
        </div>

        <!-- TRAVEL -->
        <div v-if="isTravel" class="border rounded p-3 mb-4">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label fw-semibold"
                >City <span class="text-danger">*</span></label
              >
              <input class="form-control" v-model="form.city" />
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold"
                >State <span class="text-danger">*</span></label
              >
              <select class="form-select" v-model="form.state">
                <option disabled value="">- Select -</option>
                <option v-for="s in states" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label fw-semibold"
                >Zip <span class="text-danger">*</span></label
              >
              <input class="form-control" v-model="form.zip" />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold"
                >Operating Radius <span class="text-danger">*</span></label
              >
              <select class="form-select" v-model="form.operatingRadiusMiles">
                <option disabled :value="null">- Select -</option>
                <option v-for="r in radiusOptions" :key="r" :value="r">
                  {{ r }} miles
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- REMOTE: no extra fields -->

        <hr class="my-4" />

        <!-- ========================= -->
        <!-- ADDITIONAL JOB DETAILS -->
        <!-- ========================= -->
        <h3 class="h5 mb-3">Additional Job Details</h3>

        <!-- Shifts -->
        <div class="mb-3">
          <label class="form-label fw-semibold">
            What is the work shift for this role?
            <span class="text-danger">*</span>
          </label>

          <div class="text-muted small mb-2">
            Select the shifts the candidate may be required to work.
          </div>

          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="shift in shiftOptions"
              :key="shift"
              type="button"
              class="btn btn-sm rounded-pill"
              :class="
                form.shifts.includes(shift)
                  ? 'btn-primary'
                  : 'btn-outline-secondary'
              "
              @click="toggleShift(shift)"
            >
              {{ shift }}
            </button>
          </div>

          <div class="form-check mt-2">
            <input
              class="form-check-input"
              type="checkbox"
              id="allSelected"
              v-model="form.requiresAllSelectedShifts"
            />
            <label class="form-check-label text-muted" for="allSelected">
              This position requires the candidate to work all of the selected
              shifts
            </label>
          </div>
        </div>

        <!-- Openings -->
        <div class="mb-3" style="max-width: 260px">
          <label class="form-label fw-semibold">
            How many openings are available? <span class="text-danger">*</span>
          </label>
          <input
            type="number"
            min="0"
            class="form-control"
            v-model.number="form.openings"
          />
        </div>

        <!-- Applicants to review + Quick Tip -->
        <div class="mb-3">
          <label class="form-label fw-semibold">
            How many applicants do you want to review?
          </label>

          <div
            class="border border-primary-subtle bg-primary-subtle rounded p-3 mb-2"
          >
            <div class="d-flex gap-2">
              <div class="fw-bold text-primary">★</div>
              <div>
                <div class="fw-semibold">Quick Tip</div>
                <div class="small text-muted">
                  Let us know the maximum number of candidate applications you'd
                  like to receive for your job posting. Once that number is
                  reached, the system will mark your job as fully referred. Just
                  a heads-up: this referral limit doesn't apply to H2A or H2B
                  applications.
                </div>
              </div>
            </div>
          </div>

          <div style="max-width: 260px">
            <input
              type="number"
              min="0"
              class="form-control"
              v-model.number="form.applicantReviewLimit"
            />
          </div>
        </div>

        <!-- ========================= -->
        <!-- DRIVER LICENSE (METHOD-DRIVEN) -->
        <!-- ========================= -->
        <div class="mb-3">
          <label class="form-label fw-semibold"
            >Does this job require a Driver’s License?</label
          >

          <div class="d-flex gap-4">
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                :checked="form.requiresDriversLicense === true"
                @change="setRequiresDriversLicense(true)"
                :id="ids.dlYes"
              />
              <label class="form-check-label" :for="ids.dlYes">Yes</label>
            </div>

            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                :checked="form.requiresDriversLicense === false"
                @change="setRequiresDriversLicense(false)"
                :id="ids.dlNo"
              />
              <label class="form-check-label" :for="ids.dlNo">No</label>
            </div>
          </div>
        </div>

        <div v-if="form.requiresDriversLicense" class="border rounded p-3 mb-4">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">License Type</label>
              <select class="form-select" v-model="form.licenseType">
                <option disabled value="">- Select -</option>
                <option v-for="lt in licenseTypeOptions" :key="lt" :value="lt">
                  {{ lt }}
                </option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">State</label>
              <select class="form-select" v-model="form.licenseState">
                <option disabled value="">- Select -</option>
                <option v-for="s in states" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>

            <div class="col-12">
              <label class="form-label fw-semibold">Endorsements</label>
              <div class="d-flex flex-wrap gap-2">
                <button
                  v-for="e in endorsementOptions"
                  :key="e.value"
                  type="button"
                  class="btn btn-sm rounded-pill"
                  :class="
                    form.endorsements.includes(e.value)
                      ? 'btn-primary'
                      : 'btn-outline-secondary'
                  "
                  @click="toggleEndorsement(e.value)"
                >
                  {{ e.label }}
                </button>
              </div>

              <div class="form-text mt-2" v-if="form.endorsements.length">
                Combination of {{ endorsementComboLabel }}
              </div>
            </div>
          </div>
        </div>

        <!-- ========================= -->
        <!-- FOREIGN LABOR (METHOD-DRIVEN) -->
        <!-- ========================= -->
        <div class="mb-3">
          <label class="form-label fw-semibold"
            >Is this job posting for a Foreign Labor Certification?</label
          >

          <div class="d-flex gap-4">
            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                :checked="form.isForeignLabor === true"
                @change="setIsForeignLabor(true)"
                :id="ids.flcYes"
              />
              <label class="form-check-label" :for="ids.flcYes">Yes</label>
            </div>

            <div class="form-check">
              <input
                class="form-check-input"
                type="radio"
                :checked="form.isForeignLabor === false"
                @change="setIsForeignLabor(false)"
                :id="ids.flcNo"
              />
              <label class="form-check-label" :for="ids.flcNo">No</label>
            </div>
          </div>
        </div>

        <div v-if="form.isForeignLabor" class="border rounded p-3 mb-2">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-semibold">
                Foreign Labor Certification Type
                <span class="text-danger">*</span>
              </label>

              <select
                class="form-select"
                :value="form.foreignLaborType"
                @change="onForeignLaborTypeChange"
              >
                <option disabled value="">- Select -</option>
                <option
                  v-for="t in foreignLaborTypeOptions"
                  :key="t"
                  :value="t"
                >
                  {{ t }}
                </option>
              </select>
            </div>

            <div class="col-md-6"></div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">
                Foreign Labor Start Date <span class="text-danger">*</span>
              </label>
              <input
                type="date"
                class="form-control"
                v-model="form.foreignLaborStartDate"
              />
            </div>

            <div class="col-md-6">
              <label class="form-label fw-semibold">
                Foreign Labor End Date <span class="text-danger">*</span>
              </label>
              <input
                type="date"
                class="form-control"
                v-model="form.foreignLaborEndDate"
              />
            </div>

            <div class="col-md-6" v-if="isH2AorH2B">
              <label class="form-label fw-semibold">
                H2A/H2B Closing Date <span class="text-danger">*</span>
              </label>
              <div class="form-text mb-1">
                This date may impact the Job Posting Closing date
              </div>
              <input
                type="date"
                class="form-control"
                v-model="form.h2ClosingDate"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="card-footer bg-white d-flex justify-content-between p-3">
        <button
          type="button"
          class="btn btn-outline-secondary px-4"
          @click="onBack"
        >
          Back
        </button>
        <button type="button" class="btn btn-primary px-4" @click="onContinue">
          Continue
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from "vue";

/**
 * OPTIONS (replace with lookup lists later)
 */
const states = ["Pennsylvania", "Maryland", "New Jersey", "Delaware"];
const radiusOptions = [5, 10, 25, 50, 100];
const shiftOptions = ["Day", "Evening", "Night", "Rotation", "Weekend"];

const licenseTypeOptions = [
  "Class A - Commercial",
  "Class B - Commercial",
  "Class C - Commercial",
  "Class C - Standard Driver's License",
  "Class M - Motorcycle",
  "None",
];

const endorsementOptions = [
  { value: "P", label: "P - Passenger" },
  { value: "T", label: "T - Double/Triples" },
  { value: "H", label: "H - Hazardous Materials" },
  { value: "N", label: "N - Tanker" },
];

const foreignLaborTypeOptions = ["H2A", "H2B", "Permanent"];

const ids = {
  dlYes: "dlYes",
  dlNo: "dlNo",
  flcYes: "flcYes",
  flcNo: "flcNo",
};

/**
 * FORM MODEL (screen DTO)
 */
const form = reactive({
  // Location
  locationType: "", // IN_PERSON | REMOTE | TRAVEL
  address1: "",
  address2: "",
  city: "",
  state: "Pennsylvania",
  zip: "",
  county: "",
  operatingRadiusMiles: null,

  // Additional details
  shifts: [],
  requiresAllSelectedShifts: false,
  openings: null,
  applicantReviewLimit: null,

  // Driver's license
  requiresDriversLicense: false,
  licenseType: "",
  licenseState: "Pennsylvania",
  endorsements: [],

  // Foreign labor
  isForeignLabor: false,
  foreignLaborType: "",
  foreignLaborStartDate: "",
  foreignLaborEndDate: "",
  h2ClosingDate: "",
});

/**
 * VIEW FLAGS
 */
const isInPerson = computed(() => form.locationType === "IN_PERSON");
const isTravel = computed(() => form.locationType === "TRAVEL");
const isRemote = computed(() => form.locationType === "REMOTE");

const isH2AorH2B = computed(
  () => form.foreignLaborType === "H2A" || form.foreignLaborType === "H2B",
);

const endorsementComboLabel = computed(() => {
  if (!form.endorsements.length) return "";
  const sorted = [...form.endorsements].sort(); // H, N, P, T...
  return sorted.join(" and ");
});

/**
 * ENTERPRISE: METHOD-DRIVEN MUTATIONS
 */
function onLocationTypeChange(e) {
  const next = e.target.value;
  setLocationType(next);
}

function setLocationType(next) {
  form.locationType = next;

  // Clear irrelevant location fields for consistency
  if (next === "REMOTE") {
    clearInPersonFields();
    clearTravelFields();
  } else if (next === "IN_PERSON") {
    clearTravelFields();
    // keep in-person fields
  } else if (next === "TRAVEL") {
    clearInPersonFields(true); // keep City/State/Zip if you want
    // travel needs operating radius
  }
}

function clearInPersonFields(keepCityStateZip = false) {
  form.address1 = "";
  form.address2 = "";
  form.county = "";

  if (!keepCityStateZip) {
    form.city = "";
    form.zip = "";
    // leave state default or clear if you prefer
    // form.state = "";
  }
}

function clearTravelFields() {
  form.operatingRadiusMiles = null;
  // Travel shares city/state/zip with in-person in your UI,
  // so we do NOT clear those here by default.
}

function toggleShift(shift) {
  const idx = form.shifts.indexOf(shift);
  if (idx >= 0) form.shifts.splice(idx, 1);
  else form.shifts.push(shift);
}

function setRequiresDriversLicense(value) {
  form.requiresDriversLicense = value;
  if (!value) clearDriversLicenseFields();
}

function clearDriversLicenseFields() {
  form.licenseType = "";
  // keep default state or clear:
  form.licenseState = "Pennsylvania";
  form.endorsements = [];
}

function toggleEndorsement(value) {
  const idx = form.endorsements.indexOf(value);
  if (idx >= 0) form.endorsements.splice(idx, 1);
  else form.endorsements.push(value);
}

function setIsForeignLabor(value) {
  form.isForeignLabor = value;
  if (!value) clearForeignLaborFields();
}

function onForeignLaborTypeChange(e) {
  const next = e.target.value;
  setForeignLaborType(next);
}

function setForeignLaborType(next) {
  form.foreignLaborType = next;

  // If not H2A/H2B, clear closing date because it shouldn't be sent
  if (next !== "H2A" && next !== "H2B") {
    form.h2ClosingDate = "";
  }
}

function clearForeignLaborFields() {
  form.foreignLaborType = "";
  form.foreignLaborStartDate = "";
  form.foreignLaborEndDate = "";
  form.h2ClosingDate = "";
}

/**
 * NAV / SAVE
 */
function onBack() {
  console.log("Back");
}

function onContinue() {
  const errors = validate();
  if (errors.length) {
    alert(errors.join("\n"));
    return;
  }

  // send DTO to API / next step
  console.log("Continue payload:", JSON.parse(JSON.stringify(form)));
}

/**
 * VALIDATION (keep simple, replace with your standard validator later)
 */
function validate() {
  const errors = [];

  if (!form.locationType) errors.push("Location type is required.");

  if (isInPerson.value) {
    if (!form.address1) errors.push("Address Line 1 is required.");
    if (!form.city) errors.push("City is required.");
    if (!form.state) errors.push("State is required.");
    if (!form.zip) errors.push("Zip Code is required.");
    if (!form.county) errors.push("County is required.");
  }

  if (isTravel.value) {
    if (!form.city) errors.push("City is required.");
    if (!form.state) errors.push("State is required.");
    if (!form.zip) errors.push("Zip Code is required.");
    if (form.operatingRadiusMiles == null)
      errors.push("Operating Radius is required.");
  }

  if (!form.shifts.length) errors.push("At least one shift is required.");
  if (form.openings == null) errors.push("Openings is required.");

  if (form.requiresDriversLicense) {
    if (!form.licenseType) errors.push("License Type is required.");
    if (!form.licenseState) errors.push("License State is required.");
  }

  if (form.isForeignLabor) {
    if (!form.foreignLaborType) errors.push("Foreign Labor Type is required.");
    if (!form.foreignLaborStartDate)
      errors.push("Foreign Labor Start Date is required.");
    if (!form.foreignLaborEndDate)
      errors.push("Foreign Labor End Date is required.");
    if (isH2AorH2B.value && !form.h2ClosingDate)
      errors.push("H2A/H2B Closing Date is required.");
  }

  return errors;
}
</script>

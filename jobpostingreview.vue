<!-- screen -->
<!-- src/pages/job-postings/job-posting-review/JobPostingReview.vue -->
<template>
  <div class="container-fluid py-3">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10 col-xl-8">

        <!-- Header -->
        <div class="d-flex align-items-center justify-content-between mb-3">
          <h1 class="h4 m-0">{{ pageTitle }}</h1>
        </div>

        <!-- Blocking validation issues (red) -->
        <BAlert
          v-if="hasBlockingIssues"
          variant="danger"
          show
          class="mb-3"
        >
          <div class="fw-semibold mb-1">
            Required information has not yet been provided. Your job posting cannot be submitted until the following sections are completed:
          </div>

          <ul class="mb-0 ps-3">
            <li
              v-for="issue in blockingIssues"
              :key="issue.sectionKey"
            >
              <a
                class="link-danger text-decoration-underline"
                href="#"
                @click.prevent="scrollToSection(issue.sectionKey)"
              >
                {{ sectionTitle(issue.sectionKey) }}
              </a>
              <span v-if="issue.message?.trim()"> — {{ issue.message }}</span>
            </li>
          </ul>
        </BAlert>

        <!-- Info banner (blue) -->
        <BAlert variant="info" show class="mb-3">
          <div class="d-flex gap-2">
            <div class="flex-grow-1">
              {{ review.banner.message }}
            </div>
          </div>
        </BAlert>

        <!-- Status Card -->
        <BCard class="mb-4">
          <BCardBody>
            <div class="d-flex flex-column flex-md-row gap-3">
              <div class="flex-grow-1">
                <div class="fw-semibold mb-2">Job Posting Status</div>

                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <div class="text-muted small">Approval Status</div>
                    <div class="fw-semibold">{{ review.status.approvalStatus }}</div>
                  </div>

                  <div class="col-12 col-md-6">
                    <div class="text-muted small">Job Posting Status</div>
                    <div class="fw-semibold">{{ review.status.completionStatus }}</div>
                  </div>
                </div>

                <div class="mt-3">
                  <BButton
                    :disabled="submitDisabled"
                    variant="dark"
                    class="px-4"
                    @click="onSubmitForApproval"
                  >
                    {{ submitButtonText }}
                  </BButton>
                </div>

                <div class="mt-3 text-muted small">
                  <div class="fw-semibold">Compare with Similar Roles</div>
                  <div>
                    Reviewing similar jobs helps you ensure your posting is competitive and stands out.
                    <span v-if="review.status.similarRolesCount != null">
                      There are <a href="#" @click.prevent="onViewSimilarRoles">{{ review.status.similarRolesCount }} job postings</a> in PA CareerLink&reg; that are similar to your posting.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </BCardBody>
        </BCard>

        <!-- Inline alerts (e.g., close date changed, foreign labor note) -->
        <div v-if="inlineAlerts.length" class="mb-4">
          <BAlert
            v-for="(a, idx) in inlineAlerts"
            :key="idx"
            :variant="alertVariant(a.tone)"
            show
            class="mb-2"
          >
            {{ a.message }}
          </BAlert>
        </div>

        <!-- Job Posting Dates -->
        <section :id="anchors.jobPostingDates" class="mb-4">
          <SectionCard
            title="Job Posting Dates"
            :can-edit="canEditSection('jobPostingDates')"
            @edit="onEditSection('jobPostingDates')"
          >
            <div class="text-muted mb-3">
              The system will close the job posting on the specified date. If left blank, the system will automatically calculate the closing date upon approval by a staff member. If staff assistance is requested, job postings will remain open for 180 days as compared to 60 days for unassisted job postings.
            </div>

            <BAlert
              v-if="review.jobPostingDates.closeDateAdjustedWarning"
              variant="warning"
              show
              class="mb-3"
            >
              {{ review.jobPostingDates.closeDateAdjustedWarning }}
            </BAlert>

            <BAlert
              v-if="review.jobPostingDates.hasForeignLaborCertification && review.jobPostingDates.foreignLaborNote"
              variant="info"
              show
              class="mb-3"
            >
              {{ review.jobPostingDates.foreignLaborNote }}
            </BAlert>

            <div class="row g-3">
              <div class="col-12 col-md-6">
                <div class="text-muted small">Job Posting Number</div>
                <div class="fw-semibold">{{ review.jobPostingDates.postingNumber || '—' }}</div>
              </div>
              <div class="col-12 col-md-6">
                <div class="text-muted small">Job Posting Date</div>
                <div class="fw-semibold">{{ review.jobPostingDates.postingDate || '—' }}</div>
              </div>
              <div class="col-12 col-md-6">
                <div class="text-muted small">Job Posting Close Date</div>
                <div class="fw-semibold">{{ review.jobPostingDates.closeDate || '—' }}</div>
              </div>
            </div>
          </SectionCard>
        </section>

        <!-- Basic Information -->
        <section :id="anchors.basicInformation" class="mb-4">
          <SectionCard
            title="Basic Information"
            :can-edit="canEditSection('basicInformation')"
            @edit="onEditSection('basicInformation')"
          >
            <div class="text-muted mb-3">
              Review the details below to ensure your job posting is accurate and complete. This foundational information sets the tone for your posting and helps attract the right candidates.
            </div>

            <div class="mb-3">
              <div class="text-muted small">Job Title</div>
              <div class="fw-semibold">{{ review.basicInformation.jobTitle || '—' }}</div>
            </div>

            <div class="mb-4">
              <div class="text-muted small">Job Summary</div>
              <div class="whitespace-prewrap">{{ review.basicInformation.jobSummary || '—' }}</div>
            </div>

            <div class="row g-3">
              <div class="col-12 col-md-6">
                <div class="text-muted small">Minimum Experience</div>
                <div class="fw-semibold">{{ review.basicInformation.minimumExperienceText || '—' }}</div>
              </div>
              <div class="col-12 col-md-6">
                <div class="text-muted small">Minimum Education Level</div>
                <div class="fw-semibold">{{ review.basicInformation.minimumEducationText || '—' }}</div>
              </div>
            </div>
          </SectionCard>
        </section>

        <!-- Job Site Location + Additional Job Details -->
        <section :id="anchors.jobSiteLocation" class="mb-4">
          <SectionCard
            title="Job Site Location"
            :can-edit="canEditSection('jobSiteLocation')"
            @edit="onEditSection('jobSiteLocation')"
          >
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <div class="text-muted small">What is the location type for this role?</div>
                <div class="fw-semibold">{{ review.jobSiteLocation.locationTypeText || '—' }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-muted small">Job Site Address</div>
                <div class="fw-semibold whitespace-prewrap">{{ jobSiteAddressText }}</div>
              </div>
            </div>
          </SectionCard>
        </section>

        <section :id="anchors.additionalJobDetails" class="mb-4">
          <SectionCard
            title="Additional Job Details"
            :can-edit="canEditSection('additionalJobDetails')"
            @edit="onEditSection('additionalJobDetails')"
          >
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <div class="text-muted small">Work Shift</div>
                <div class="fw-semibold">{{ review.additionalJobDetails.workShiftsText || '—' }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-muted small">This position requires the candidate to work all of the selected shifts</div>
                <div class="fw-semibold">{{ review.additionalJobDetails.requiresAllSelectedShiftsText || '—' }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-muted small">How many openings are available?</div>
                <div class="fw-semibold">{{ numberOrDash(review.additionalJobDetails.openingsAvailable) }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-muted small">How many applicants do you want to review?</div>
                <div class="fw-semibold">{{ numberOrDash(review.additionalJobDetails.applicantsToReview) }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-muted small">Does this job require a Driver’s License?</div>
                <div class="fw-semibold">{{ yesNo(review.additionalJobDetails.requiresDriversLicense) }}</div>

                <div v-if="review.additionalJobDetails.requiresDriversLicense" class="mt-2">
                  <div class="text-muted small">Type</div>
                  <div class="fw-semibold">{{ review.additionalJobDetails.driversLicenseTypeText || '—' }}</div>

                  <div class="text-muted small mt-2">State</div>
                  <div class="fw-semibold">{{ review.additionalJobDetails.driversLicenseStateText || '—' }}</div>

                  <div class="text-muted small mt-2">Endorsements</div>
                  <div class="fw-semibold">{{ review.additionalJobDetails.driversLicenseEndorsementsText || '—' }}</div>
                </div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-muted small">Is this job posting for a Foreign Labor Certification?</div>
                <div class="fw-semibold">{{ yesNo(review.additionalJobDetails.isForeignLaborPosting) }}</div>

                <div v-if="review.additionalJobDetails.isForeignLaborPosting" class="mt-2">
                  <div class="text-muted small">Foreign Labor Certification Type</div>
                  <div class="fw-semibold">{{ review.additionalJobDetails.foreignLaborTypeText || '—' }}</div>

                  <div class="text-muted small mt-2">Start Date</div>
                  <div class="fw-semibold">{{ review.additionalJobDetails.foreignLaborStartDate || '—' }}</div>

                  <div class="text-muted small mt-2">End Date</div>
                  <div class="fw-semibold">{{ review.additionalJobDetails.foreignLaborEndDate || '—' }}</div>

                  <div class="text-muted small mt-2">H2A/H2B Closing Date</div>
                  <div class="fw-semibold">{{ review.additionalJobDetails.h2aH2bClosingDate || '—' }}</div>
                </div>
              </div>
            </div>
          </SectionCard>
        </section>

        <!-- Salary Details -->
        <section :id="anchors.salaryDetails" class="mb-4">
          <SectionCard
            title="Salary Details"
            :can-edit="canEditSection('salaryDetails')"
            @edit="onEditSection('salaryDetails')"
          >
            <BAlert variant="info" show class="mb-3">
              Wage information is necessary to meet statistical and federal reporting requirements.
            </BAlert>

            <div class="row g-3">
              <div class="col-12 col-md-6">
                <div class="text-muted small">What is the job type for this role?</div>
                <div class="fw-semibold">{{ review.salaryDetails.jobTypeText || '—' }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-muted small">What is the salary range?</div>
                <div class="fw-semibold">{{ review.salaryDetails.salaryRangeText || '—' }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-muted small">How many hours per week does this job require?</div>
                <div class="fw-semibold">{{ numberOrDash(review.salaryDetails.hoursPerWeek) }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-muted small">Will this position offer commission or incentive pay?</div>
                <div class="fw-semibold">{{ review.salaryDetails.incentivePayText || '—' }}</div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-muted small">Display salary to individuals?</div>
                <div class="fw-semibold">{{ review.salaryDetails.displaySalaryToIndividualsText || '—' }}</div>
              </div>
            </div>
          </SectionCard>
        </section>

        <!-- Settings -->
        <section :id="anchors.settings" class="mb-4">
          <SectionCard
            title="Settings"
            :can-edit="canEditSection('settings')"
            @edit="onEditSection('settings')"
          >
            <div class="text-muted small mb-2">Who is the point of contact for this job posting?</div>

            <div class="fw-semibold">{{ pointOfContactLine || '—' }}</div>
            <div class="fw-semibold">{{ review.settings.phone || '' }}</div>
            <div class="whitespace-prewrap">{{ primaryContactAddressText }}</div>
          </SectionCard>
        </section>

        <!-- Level of Service -->
        <section :id="anchors.levelOfService" class="mb-4">
          <SectionCard
            title="Level of Service"
            :can-edit="canEditSection('levelOfService')"
            @edit="onEditSection('levelOfService')"
          >
            <div class="row g-3">
              <div class="col-12 col-md-6">
                <div class="text-muted small">Would you like to receive PA CareerLink&reg; staff assistance?</div>
                <div class="fw-semibold">{{ review.levelOfService.wantsStaffAssistanceText || '—' }}</div>
              </div>
              <div class="col-12 col-md-6">
                <div class="text-muted small">Do you require applications to be submitted using your website?</div>
                <div class="fw-semibold">{{ review.levelOfService.requiresWebsiteApplicationsText || '—' }}</div>
              </div>
            </div>
          </SectionCard>
        </section>

        <!-- Follow-Up Instructions Preview -->
        <section :id="anchors.followUpInstructions" class="mb-4">
          <SectionCard
            title="Follow-Up Instructions Preview"
            :can-edit="canEditSection('followUpInstructions')"
            @edit="onEditSection('followUpInstructions')"
          >
            <BCard class="bg-light border-0">
              <BCardBody>
                <div class="mb-2">
                  <div class="text-muted small">Employer Name</div>
                  <div class="fw-semibold">{{ review.followUpInstructions.employerName || '—' }}</div>
                </div>

                <div class="mb-3">
                  <div class="text-muted small">Note</div>
                  <div class="whitespace-prewrap">{{ review.followUpInstructions.note || '—' }}</div>
                </div>

                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <div class="text-muted small">Email</div>
                    <div class="fw-semibold">
                      <a
                        v-if="review.followUpInstructions.email"
                        :href="`mailto:${review.followUpInstructions.email}`"
                      >
                        {{ review.followUpInstructions.email }}
                      </a>
                      <span v-else>—</span>
                    </div>

                    <div class="text-muted small mt-3">Primary Contact Address</div>
                    <div class="fw-semibold whitespace-prewrap">{{ followUpPrimaryAddressText }}</div>
                  </div>

                  <div class="col-12 col-md-6">
                    <div class="text-muted small">Fax</div>
                    <div class="fw-semibold">{{ review.followUpInstructions.fax || '—' }}</div>

                    <div class="text-muted small mt-3">Job Site Address</div>
                    <div class="fw-semibold whitespace-prewrap">{{ followUpJobSiteAddressText }}</div>
                  </div>
                </div>
              </BCardBody>
            </BCard>
          </SectionCard>
        </section>

        <!-- Occupation Matching -->
        <section :id="anchors.occupationMatching" class="mb-4">
          <SectionCard
            title="Occupation Matching"
            :can-edit="canEditSection('occupationMatching')"
            @edit="onEditSection('occupationMatching')"
          >
            <div class="text-muted mb-3">
              Based on the job title provided, we’ve matched it to the following occupation. You can change and add additional occupations by clicking edit.
            </div>

            <div class="text-muted small">Primary Occupation</div>
            <div class="fw-semibold">{{ review.occupationMatching.primaryOccupationText || '—' }}</div>
          </SectionCard>
        </section>

        <!-- Footer buttons -->
        <div class="d-flex justify-content-between align-items-center py-3 border-top mt-4">
          <BButton variant="outline-dark" class="px-4" @click="onBack">
            {{ backButtonText }}
          </BButton>

          <div class="d-flex gap-2">
            <BButton variant="outline-dark" class="px-4" @click="onPreview">
              {{ previewButtonText }}
            </BButton>
          </div>
        </div>

        <!-- Created/Updated strip (optional; you can wire actual audit fields) -->
        <div class="d-flex justify-content-between small text-muted mt-3">
          <div>CREATED DATE<br /><span class="fw-semibold">{{ audit.createdDate || '—' }}</span></div>
          <div>CREATED BY<br /><span class="fw-semibold">{{ audit.createdBy || '—' }}</span></div>
          <div>UPDATED DATE<br /><span class="fw-semibold">{{ audit.updatedDate || '—' }}</span></div>
          <div>UPDATED BY<br /><span class="fw-semibold">{{ audit.updatedBy || '—' }}</span></div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue';
import { useRouter } from 'vue-router';
import { BAlert, BButton, BCard, BCardBody } from 'bootstrap-vue-next';

import type {
  JobPostingReviewDto,
  ReviewInlineAlertDto,
  ReviewSectionKey,
  ReviewValidationIssue,
} from './dto/JobPostingReviewDto';

import { REVIEW_PAGE, SECTION_ANCHORS, formatYesNo, joinAddressLines } from './data/job-posting-review-data';

/**
 * NOTE:
 * Replace the mocked `review` object with your normal:
 *  - page load API call
 *  - Pinia store getter
 *  - route param jobPostingId
 *
 * This file is intentionally “computed-first” (no watchers).
 */

const router = useRouter();

/** Mocked audit strip (wire to your DTO if you already have Audit in payload) */
const audit = ref({
  createdDate: '05/02/2022 01:39:07 PM',
  createdBy: 'SMITH_JOHN',
  updatedDate: '05/02/2022 01:39:07 PM',
  updatedBy: 'DOE_JANE',
});

/** Mocked DTO; swap with real API result */
const review = ref<JobPostingReviewDto>({
  role: 'employer',
  jobPostingId: 12345,

  banner: {
    message:
      "Your Job Posting is currently in an Incomplete status. Please review and submit to complete this job posting. If the Job Posting is not sent for approval within 30 days, it will be removed from the system. Please note that once this job posting is approved, it can only be edited by Local PA CareerLink® Office staff.",
  },

  status: {
    approvalStatus: 'Pending',
    completionStatus: 'Incomplete',
    similarRolesCount: 129,
  },

  sections: [
    { key: 'jobPostingDates', title: 'Job Posting Dates', isComplete: true, editRouteName: 'jobPostingDates' },
    { key: 'basicInformation', title: 'Basic Information', isComplete: true, editRouteName: 'jobPostingBasicInformation' },
    { key: 'jobSiteLocation', title: 'Job Site Location', isComplete: false, editRouteName: 'jobPostingLocation' },
    { key: 'additionalJobDetails', title: 'Additional Job Details', isComplete: true, editRouteName: 'jobPostingAdditionalDetails' },
    { key: 'salaryDetails', title: 'Salary Details', isComplete: true, editRouteName: 'jobPostingSalaryDetails' },
    { key: 'settings', title: 'Settings', isComplete: true, editRouteName: 'jobPostingSettings' },
    { key: 'levelOfService', title: 'Level of Service', isComplete: true, editRouteName: 'jobPostingService' },
    { key: 'followUpInstructions', title: 'Follow-Up Instructions Preview', isComplete: true, editRouteName: 'jobPostingFollowUp' },
    { key: 'occupationMatching', title: 'Occupation Matching', isComplete: true, editRouteName: 'jobPostingOccupation' },
  ],

  validationIssues: [
    // Example from your red “required info missing” screenshot
    { sectionKey: 'jobSiteLocation', message: '' },
  ],

  inlineAlerts: [
    // Example “close date changed” warning
    // { tone: 'warning', message: 'The Job Posting Close Date has been changed to meet guidelines.' },
  ],

  jobPostingDates: {
    postingNumber: '00000000',
    postingDate: '09/01/2025',
    closeDate: '01/15/2026',
    hasForeignLaborCertification: true,
    foreignLaborNote:
      'For Foreign Labor Certification: The job posting closing date is automatically calculated by the system and can only be modified by staff.',
    closeDateAdjustedWarning:
      'The Job Posting Close Date has been changed to meet guidelines.\n• For H2A or H2B jobs, this date must not fall after the H2A/H2B closing date.\nIf this change is not acceptable, please edit the Job Posting Close Date or change the job posting conditions to comply with regulatory guidelines.',
  },

  basicInformation: {
    jobTitle: 'Software Quality Assurance Analyst',
    jobSummary:
      'Develop and execute software tests to identify software problems and their causes.\nTest system modifications to prepare for implementation.\nDocument software and application defects using a bug tracking system and report defects to software or web developers.',
    minimumExperienceText: '1 Year(s)',
    minimumEducationText: "Bachelor's degree",
  },

  jobSiteLocation: {
    locationTypeText: 'In-Person',
    siteAddressLines: ['200 Sterling Pkwy', 'Mechanicsburg, PA 17050', 'Cumberland County'],
  },

  additionalJobDetails: {
    workShiftsText: 'Day, Evening, Night',
    requiresAllSelectedShiftsText: 'No',
    openingsAvailable: 5,
    applicantsToReview: 100,

    requiresDriversLicense: true,
    driversLicenseTypeText: 'Class C - Standard Drivers License',
    driversLicenseStateText: 'Pennsylvania',
    driversLicenseEndorsementsText: '—',

    isForeignLaborPosting: true,
    foreignLaborTypeText: 'H2A',
    foreignLaborStartDate: '09/01/2025',
    foreignLaborEndDate: '06/01/2026',
    h2aH2bClosingDate: '09/01/2026',
  },

  salaryDetails: {
    jobTypeText: 'Full-time',
    salaryRangeText: '$16 - $25 per Hour',
    hoursPerWeek: 40,
    incentivePayText: 'None',
    displaySalaryToIndividualsText: 'Yes',
  },

  settings: {
    pointOfContactName: 'Maria Benigno',
    pointOfContactTitle: 'eQuest Compliance Processing Manager',
    phone: '(925) 275-2409',
    primaryContactAddressLines: ['4000 Executive Pkwy', 'San Ramon CA 94583'],
  },

  levelOfService: {
    wantsStaffAssistanceText: 'No',
    requiresWebsiteApplicationsText: 'No',
  },

  followUpInstructions: {
    employerName: 'Maria Benigno',
    note:
      'Commonwealth of Pennsylvania has requested that you contact them using one of the following methods:',
    email: 'cwds.test@gmail.com',
    fax: '(215) 490-6798',
    primaryContactAddressLines: ['4000 Executive Pkwy', 'San Ramon, CA 94583'],
    jobSiteAddressLines: ['200 Sterling Pkwway', 'Mechanicsburg, PA 7050'],
  },

  occupationMatching: {
    primaryOccupationText: 'Software Quality Assurance Analysts and Testers',
  },
});

const pageTitle = computed(() => REVIEW_PAGE.title);
const submitButtonText = computed(() => REVIEW_PAGE.submitButtonText);
const backButtonText = computed(() => REVIEW_PAGE.backButtonText);
const previewButtonText = computed(() => REVIEW_PAGE.previewButtonText);

const anchors = SECTION_ANCHORS;

const blockingIssues = computed<ReviewValidationIssue[]>(() => review.value.validationIssues ?? []);
const hasBlockingIssues = computed(() => blockingIssues.value.length > 0);

const submitDisabled = computed(() => hasBlockingIssues.value);

/** Inline alerts composed from both DTO.inlineAlerts and specific sub-fields (keeps template clean) */
const inlineAlerts = computed<ReviewInlineAlertDto[]>(() => {
  const out: ReviewInlineAlertDto[] = [];

  const dtoAlerts = review.value.inlineAlerts ?? [];
  out.push(...dtoAlerts);

  return out;
});

const jobSiteAddressText = computed(() => joinAddressLines(review.value.jobSiteLocation.siteAddressLines) || '—');

const pointOfContactLine = computed(() => {
  const name = (review.value.settings.pointOfContactName ?? '').trim();
  const title = (review.value.settings.pointOfContactTitle ?? '').trim();
  if (!name && !title) return '';
  if (name && title) return `${name}, ${title}`;
  return name || title;
});

const primaryContactAddressText = computed(() => joinAddressLines(review.value.settings.primaryContactAddressLines));

const followUpPrimaryAddressText = computed(() => joinAddressLines(review.value.followUpInstructions.primaryContactAddressLines) || '—');
const followUpJobSiteAddressText = computed(() => joinAddressLines(review.value.followUpInstructions.jobSiteAddressLines) || '—');

function yesNo(value: boolean | undefined | null): string {
  return formatYesNo(value);
}

function numberOrDash(value: number | undefined | null): string {
  return value == null ? '—' : String(value);
}

function alertVariant(tone: ReviewInlineAlertDto['tone']): string {
  switch (tone) {
    case 'danger': return 'danger';
    case 'warning': return 'warning';
    case 'success': return 'success';
    default: return 'info';
  }
}

/** Role/edit permissions */
const isStaff = computed(() => review.value.role === 'staff');

function sectionMeta(key: ReviewSectionKey) {
  return (review.value.sections ?? []).find(s => s.key === key);
}

function sectionTitle(key: ReviewSectionKey): string {
  return sectionMeta(key)?.title ?? key;
}

function canEditSection(key: ReviewSectionKey): boolean {
  // In your screenshots, employer can still “EDIT” sections before approval,
  // but you may want staff-only edits post-approval.
  // Keep this logic centralized.
  const meta = sectionMeta(key);
  if (!meta?.editRouteName) return false;

  // Example rule: staff always can, employers can if not Approved
  if (isStaff.value) return true;
  return review.value.status.approvalStatus !== 'Approved';
}

function scrollToSection(key: ReviewSectionKey) {
  const id = anchors[key];
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Actions */
function onEditSection(key: ReviewSectionKey) {
  const meta = sectionMeta(key);
  if (!meta?.editRouteName) return;

  // Route params can include jobPostingId to keep consistent with your flows
  router.push({
    name: meta.editRouteName,
    params: { jobPostingId: review.value.jobPostingId },
  });
}

function onViewSimilarRoles() {
  // wire to your route / external link
  // router.push({ name: 'similarRoles', params: { jobPostingId: review.value.jobPostingId } });
}

function onSubmitForApproval() {
  // Enterprise behavior:
  // - if blocking issues exist, scroll to first missing section
  // - else call API to submit
  if (hasBlockingIssues.value) {
    const first = blockingIssues.value[0];
    if (first) scrollToSection(first.sectionKey);
    return;
  }

  // TODO: call submit API
  // await api.submitJobPostingForApproval(review.value.jobPostingId)
}

function onBack() {
  router.back();
}

function onPreview() {
  // TODO: route to preview page
  // router.push({ name: 'jobPostingPreview', params: { jobPostingId: review.value.jobPostingId } });
}

/**
 * Small internal component: consistent section card with "EDIT" button on right
 * (keeps page template readable)
 */
const SectionCard = defineComponent({
  name: 'SectionCard',
  props: {
    title: { type: String, required: true },
    canEdit: { type: Boolean, default: false },
  },
  emits: ['edit'],
  setup(props, { slots, emit }) {
    return () =>
      h(
        BCard,
        { class: 'section-card' },
        {
          default: () =>
            h(BCardBody, {}, () => [
              h('div', { class: 'd-flex justify-content-between align-items-start mb-3' }, [
                h('div', { class: 'fw-semibold' }, props.title),
                props.canEdit
                  ? h(
                      BButton,
                      {
                        variant: 'outline-dark',
                        size: 'sm',
                        class: 'px-3',
                        onClick: () => emit('edit'),
                      },
                      () => 'EDIT',
                    )
                  : null,
              ]),
              slots.default?.(),
            ]),
        },
      );
  },
});
</script>

<style scoped>
.whitespace-prewrap {
  white-space: pre-wrap;
}

.section-card {
  border-radius: 0.25rem;
}
</style>




 <!-- data   -->
// src/pages/job-postings/job-posting-review/data/job-posting-review-data.ts

import type { ReviewSectionKey } from '../dto/JobPostingReviewDto';

export const REVIEW_PAGE = {
  title: 'Job Posting Review',
  submitButtonText: 'SUBMIT FOR APPROVAL',
  previewButtonText: 'PREVIEW',
  backButtonText: 'BACK',
};

export const SECTION_ANCHORS: Record<ReviewSectionKey, string> = {
  basicInformation: 'basic-information',
  jobPostingDates: 'job-posting-dates',
  jobSiteLocation: 'job-site-location',
  additionalJobDetails: 'additional-job-details',
  salaryDetails: 'salary-details',
  settings: 'settings',
  levelOfService: 'level-of-service',
  followUpInstructions: 'follow-up-instructions',
  occupationMatching: 'occupation-matching',
};

export function formatYesNo(value: boolean | undefined | null): string {
  if (value === true) return 'Yes';
  if (value === false) return 'No';
  return '';
}

export function joinAddressLines(lines?: string[]): string {
  return (lines ?? []).filter(Boolean).join('\n');
}

export function safeText(value?: string | null): string {
  return (value ?? '').trim();
}




 <!-- dto  -->
  // src/pages/job-postings/job-posting-review/dto/JobPostingReviewDto.ts

export type ReviewUserRole = 'employer' | 'staff';

export type JobPostingApprovalStatus =
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Draft'
  | 'Unknown';

export type JobPostingCompletionStatus =
  | 'Complete'
  | 'Incomplete'
  | 'In Review'
  | 'Unknown';

export type ReviewSectionKey =
  | 'basicInformation'
  | 'jobPostingDates'
  | 'jobSiteLocation'
  | 'additionalJobDetails'
  | 'salaryDetails'
  | 'settings'
  | 'levelOfService'
  | 'followUpInstructions'
  | 'occupationMatching';

export interface ReviewSectionMeta {
  key: ReviewSectionKey;
  title: string;
  isComplete: boolean;
  editRouteName?: string; // route name to go edit this section
}

export interface ReviewValidationIssue {
  sectionKey: ReviewSectionKey;
  message: string;
}

export interface ReviewBannerDto {
  // Top informational banner (blue)
  message: string;
}

export type ReviewAlertTone = 'info' | 'warning' | 'danger' | 'success';

export interface ReviewInlineAlertDto {
  tone: ReviewAlertTone;
  message: string;
}

export interface JobPostingStatusDto {
  approvalStatus: JobPostingApprovalStatus;
  completionStatus: JobPostingCompletionStatus;
  similarRolesCount?: number; // e.g. 129
}

export interface JobPostingDatesDto {
  postingNumber?: string; // "00000000"
  postingDate?: string; // "09/01/2025"
  closeDate?: string; // "11/01/2025" etc
  // For foreign labor cert flows, closing date may be system controlled
  hasForeignLaborCertification?: boolean;
  foreignLaborNote?: string; // "For Foreign Labor Certification: ... closing date ... can only be modified by staff"
  // “Close date changed to meet guidelines…” warning variant
  closeDateAdjustedWarning?: string;
}

export interface BasicInformationDto {
  jobTitle?: string;
  jobSummary?: string;
  minimumExperienceText?: string; // "1 Year(s)"
  minimumEducationText?: string; // "Bachelor's degree"
}

export interface JobSiteLocationDto {
  locationTypeText?: string; // "In-Person"
  siteAddressLines?: string[]; // ["200 Sterling Pkwy", "Mechanicsburg, PA 17050", "Cumberland County"]
}

export interface AdditionalJobDetailsDto {
  workShiftsText?: string; // "Day, Evening, Night"
  requiresAllSelectedShiftsText?: string; // "Yes/No"
  openingsAvailable?: number;
  applicantsToReview?: number;

  requiresDriversLicense?: boolean;
  driversLicenseTypeText?: string;
  driversLicenseStateText?: string;
  driversLicenseEndorsementsText?: string; // "P, T, H, N" etc

  isForeignLaborPosting?: boolean;
  foreignLaborTypeText?: string; // "H2A"
  foreignLaborStartDate?: string;
  foreignLaborEndDate?: string;
  h2aH2bClosingDate?: string;
}

export interface SalaryDetailsDto {
  jobTypeText?: string; // "Full-time"
  salaryRangeText?: string; // "$16 - $25 per Hour"
  hoursPerWeek?: number;
  incentivePayText?: string; // "None"
  displaySalaryToIndividualsText?: string; // "Yes/No"
}

export interface SettingsDto {
  pointOfContactName?: string;
  pointOfContactTitle?: string;
  phone?: string;
  primaryContactAddressLines?: string[];
}

export interface LevelOfServiceDto {
  wantsStaffAssistanceText?: string; // "Yes/No"
  requiresWebsiteApplicationsText?: string; // "Yes/No"
}

export interface FollowUpInstructionsDto {
  employerName?: string;
  note?: string;

  email?: string;
  fax?: string;

  primaryContactAddressLines?: string[];
  jobSiteAddressLines?: string[];
}

export interface OccupationMatchingDto {
  primaryOccupationText?: string; // "Software Quality Assurance Analysts and Testers"
}

export interface JobPostingReviewDto {
  role: ReviewUserRole;

  // Header/meta
  jobPostingId: number | string;

  banner: ReviewBannerDto;

  status: JobPostingStatusDto;

  // Sections + completeness
  sections: ReviewSectionMeta[];

  // Top-of-page blocking issues (danger alert list)
  validationIssues?: ReviewValidationIssue[];

  // Page-level informational/warning alerts
  inlineAlerts?: ReviewInlineAlertDto[];

  // Section payloads
  jobPostingDates: JobPostingDatesDto;
  basicInformation: BasicInformationDto;
  jobSiteLocation: JobSiteLocationDto;
  additionalJobDetails: AdditionalJobDetailsDto;
  salaryDetails: SalaryDetailsDto;
  settings: SettingsDto;
  levelOfService: LevelOfServiceDto;
  followUpInstructions: FollowUpInstructionsDto;
  occupationMatching: OccupationMatchingDto;
}
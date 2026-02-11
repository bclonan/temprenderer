<template>
  <div class="container my-5">
    <!-- SUCCESS HEADER -->
    <div class="text-center mb-4">
      <!-- Star Icon -->
      <div
        class="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary text-white mb-3"
        style="width: 64px; height: 64px"
      >
        <i class="fa fa-star fa-lg"></i>
      </div>

      <h3 class="fw-semibold">Success!</h3>
      <p class="text-muted mt-2">
        Congratulations Jamie! You've successfully set your job preferences.
      </p>
      <p class="text-muted">
        Your preferences are now saved, and you've created your first
        personalized Saved Job Search. Head to your dashboard to explore roles
        tailored to your interests.
      </p>
    </div>

    <!-- SUMMARY CARD -->
    <div class="card shadow-sm">
      <div class="card-body">
        <!-- PROFILE -->
        <section class="mb-4">
          <h6 class="text-uppercase fw-bold text-muted mb-3">Profile</h6>

          <div class="row mb-2">
            <div class="col-md-6">
              <div class="fw-semibold">What is your preferred job title?</div>
              <div class="text-muted">Software Quality Assurance Analyst</div>
            </div>

            <div class="col-md-6">
              <div class="fw-semibold">
                What is your preferred education level?
              </div>
              <div class="text-muted">Bachelor’s degree</div>
            </div>
          </div>
        </section>

        <!-- JOB DETAILS -->
        <section class="mb-4">
          <h6 class="text-uppercase fw-bold text-muted mb-3">Job Details</h6>

          <div class="row mb-3">
            <div class="col-md-6">
              <div class="fw-semibold">What’s your preferred shift?</div>
              <div class="text-muted">Day, Evening, Night</div>
            </div>

            <div class="col-md-6">
              <div class="fw-semibold">What job type do you prefer?</div>
              <div class="text-muted">Full-time, Part-time</div>
            </div>
          </div>

          <div class="row mb-3">
            <div class="col-md-6">
              <div class="fw-semibold">How do you prefer to work?</div>
              <div class="text-muted">Hybrid, Remote</div>
            </div>

            <div class="col-md-6">
              <div class="fw-semibold">
                Where are you interested in working?
              </div>
              <div class="text-muted">19044, 10 miles radius</div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="fw-semibold">Are you willing to relocate?</div>
              <div class="text-muted">No</div>
            </div>
          </div>
        </section>

        <!-- VISIBILITY -->
        <section>
          <h6 class="text-uppercase fw-bold text-muted mb-3">Visibility</h6>

          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="fw-semibold">
                Do you want employers to find your profile?
              </div>
              <div class="text-muted">Yes</div>
            </div>

            <div class="col-md-6 mb-3">
              <div class="fw-semibold">
                Would you like to keep your name hidden from employers?
              </div>
              <div class="text-muted">No</div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- DASHBOARD BUTTON -->
    <div class="text-end mt-4">
      <button class="btn btn-primary px-4">Go to My Dashboard</button>
    </div>
  </div>
</template>

<script setup>
// Later: accept a DTO prop and replace hardcoded values JobPreferencesSummaryDto
</script>

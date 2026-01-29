<template>
  <b-card no-body class="mt-3">
    <b-card-header class="bg-white">
      <button
        type="button"
        class="w-100 d-flex align-items-center justify-content-between btn btn-link p-0 text-decoration-none"
        @click="open = !open"
      >
        <span class="fw-bold text-dark">Employer Details</span>

        <!-- right chevron -->
        <span class="text-muted chevron" :class="{ open }">▾</span>
      </button>
    </b-card-header>

    <b-collapse v-model:visible="open">
      <b-card-body>
        <b-row class="g-3">
          <b-col cols="12" md="6" lg="4">
            <div class="text-muted small">Name</div>
            <div class="fw-semibold">{{ employer.name }}</div>
          </b-col>

          <b-col cols="12" md="6" lg="2">
            <div class="text-muted small">ID</div>
            <div class="fw-semibold">{{ employer.id }}</div>
          </b-col>

          <b-col cols="12" md="6" lg="4">
            <div class="text-muted small">Branch/Location</div>
            <div class="fw-semibold">{{ employer.branch }}</div>
          </b-col>

          <b-col cols="12" md="6" lg="2">
            <div class="text-muted small">Phone</div>
            <div class="fw-semibold">{{ employer.phone }}</div>
          </b-col>
        </b-row>
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<script setup lang="ts">
import { ref } from "vue";

const open = ref(true); // set to false if you want it collapsed by default

const employer = ref({
  name: "United Natural Foods Inc-02908",
  id: "49603",
  branch: "United Natural Foods Inc-02908",
  phone: "(401) 213-2189",
});
</script>

<style scoped>
.chevron {
  display: inline-block;
  transition: transform 0.15s ease-in-out;
}
.chevron.open {
  transform: rotate(180deg);
}
</style>

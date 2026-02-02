<script setup lang="ts">
import { ChevronDown, ChevronUp } from "lucide-vue-next";
import { ref } from "vue";

export interface EmployerInfo {
  name: string;
  id: string | number;
  branchLocation?: string;
  phone?: string;
  email?: string;
  [key: string]: any;
}

const props = defineProps<{
  employer: EmployerInfo;
  collapsible?: boolean;
  initiallyExpanded?: boolean;
}>();

const isExpanded = ref(props.initiallyExpanded ?? true);

const toggleExpanded = () => {
  if (props.collapsible) {
    isExpanded.value = !isExpanded.value;
  }
};
</script>

<template>
  <div class="cl-employer-details">
    <div class="cl-employer-details__header" @click="toggleExpanded">
      <span class="cl-employer-details__title">Employer Details</span>
      <button
        v-if="collapsible"
        class="cl-employer-details__toggle"
        :aria-expanded="isExpanded"
        aria-label="Toggle details"
      >
        <component :is="isExpanded ? ChevronUp : ChevronDown" :size="20" />
      </button>
    </div>

    <Transition name="expand">
      <div v-show="isExpanded" class="cl-employer-details__content">
        <div class="cl-employer-details__field">
          <span class="cl-employer-details__label">Name:</span>
          <span class="cl-employer-details__value">{{ employer.name }}</span>
        </div>

        <div class="cl-employer-details__field">
          <span class="cl-employer-details__label">ID:</span>
          <span class="cl-employer-details__value">{{ employer.id }}</span>
        </div>

        <div v-if="employer.branchLocation" class="cl-employer-details__field">
          <span class="cl-employer-details__label">Branch/Location:</span>
          <span class="cl-employer-details__value">{{
            employer.branchLocation
          }}</span>
        </div>

        <div v-if="employer.phone" class="cl-employer-details__field">
          <span class="cl-employer-details__label">Phone:</span>
          <span class="cl-employer-details__value">{{ employer.phone }}</span>
        </div>

        <div v-if="employer.email" class="cl-employer-details__field">
          <span class="cl-employer-details__label">Email:</span>
          <span class="cl-employer-details__value">{{ employer.email }}</span>
        </div>

        <slot name="extra-fields" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cl-employer-details {
  background-color: #ffffff;
  border-bottom: 1px solid var(--gray-200);
}

.cl-employer-details__header {
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-900);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.cl-employer-details__header:hover {
  background-color: var(--gray-50);
}

.cl-employer-details__title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cl-employer-details__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  color: var(--gray-500);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.cl-employer-details__toggle:hover {
  background-color: var(--gray-100);
  color: var(--gray-700);
}

.cl-employer-details__content {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 0 24px 16px;
}

.cl-employer-details__field {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.cl-employer-details__label {
  font-size: 0.875rem;
  color: var(--gray-600);
  font-weight: 500;
}

.cl-employer-details__value {
  font-size: 0.9375rem;
  color: var(--gray-900);
}

/* Transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
}

@media (max-width: 768px) {
  .cl-employer-details__content {
    flex-direction: column;
    gap: 8px;
  }
}
</style>

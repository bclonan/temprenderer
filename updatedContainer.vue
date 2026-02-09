<template>
  <!-- clickable target -->
  <button
    :id="targetId"
    type="button"
    class="btn btn-link p-0 fw-semibold text-decoration-underline"
    @click="handleClick"
  >
    {{ label }}
  </button>

  <!-- popover -->
  <BPopover
    :target="targetId"
    triggers="click blur"
    placement="bottom"
    custom-class="user-popover"
  >
    <div class="p-2" style="min-width: 320px;">
      <template v-if="loading">
        <div class="d-flex align-items-center gap-2">
          <div class="spinner-border spinner-border-sm" role="status" />
          <div class="small text-muted">Loading…</div>
        </div>
      </template>

      <template v-else-if="!details">
        <div class="small text-muted">No details available.</div>
      </template>

      <template v-else>
        <div class="row g-2 small">
          <div class="col-4 fw-semibold">User Type:</div><div class="col-8">{{ details.userType }}</div>
          <div class="col-4 fw-semibold">Login ID:</div><div class="col-8">{{ details.loginId }}</div>
          <div class="col-4 fw-semibold">Job Title:</div><div class="col-8">{{ details.jobTitle }}</div>
          <div class="col-4 fw-semibold">Email:</div><div class="col-8">{{ details.email }}</div>
          <div class="col-4 fw-semibold">Phone:</div><div class="col-8">{{ details.phone }}</div>
          <div class="col-4 fw-semibold">Office:</div><div class="col-8">{{ details.office }}</div>
          <div class="col-4 fw-semibold">Agency:</div><div class="col-8">{{ details.agency }}</div>
        </div>
      </template>
    </div>
  </BPopover>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { BPopover } from 'bootstrap-vue-next'

type UserInfoDetails = {
  userType?: string
  loginId?: string
  jobTitle?: string
  email?: string
  phone?: string
  office?: string
  agency?: string
}

const props = defineProps<{
  /** must be unique on the page */
  id: string
  /** the text you show (ex: SMITH_JOHN) */
  label: string
  /** card details to display */
  details: UserInfoDetails | null
  /** show loading UI */
  loading?: boolean
  /** optional: click handler to lazily fetch details */
  onOpen?: () => void | Promise<void>
}>()

const targetId = computed(() => `user-popover-target-${props.id}`)
const loading = computed(() => !!props.loading)

async function handleClick() {
  // triggers popover + lets you lazy-load the data
  if (props.onOpen) await props.onOpen()
}
</script>

<style scoped>
.btn-link {
  color: inherit;
}
.btn-link:hover {
  opacity: 0.85;
}

/* Popover padding handled by our internal wrapper */
:global(.user-popover .popover-body) {
  padding: 0;
}
</style>

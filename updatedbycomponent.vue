<template>
  <WCard class="employer-details__card bg-white" id="updated-by-container-card">
    <div class="row g-3 p-3">

      <!-- Created Date -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="text-muted small text-uppercase">Created Date</div>
        <div class="fw-semibold">{{ storeData.createdDate }}</div>
      </div>

      <!-- Created By (click) -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="text-muted small text-uppercase">Created By</div>

        <!-- target must be a real element with an id -->
        <button
          :id="createdByTargetId"
          type="button"
          class="btn btn-link p-0 fw-semibold text-decoration-underline"
          @click="onCreatedByClick"
        >
          {{ storeData.createdBy }}
        </button>

        <!-- Popover -->
        <BPopover
          :target="createdByTargetId"
          triggers="click blur"
          placement="bottom"
          custom-class="user-popover"
        >
          <template #default>
            <UserMiniCard
              :loading="storeData.createdByDetailsLoading"
              :details="storeData.createdByDetails"
            />
          </template>
        </BPopover>
      </div>

      <!-- Updated Date -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="text-muted small text-uppercase">Updated Date</div>
        <div class="fw-semibold">{{ storeData.updatedDate }}</div>
      </div>

      <!-- Updated By (click) -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="text-muted small text-uppercase">Updated By</div>

        <button
          :id="updatedByTargetId"
          type="button"
          class="btn btn-link p-0 fw-semibold text-decoration-underline"
          @click="onUpdatedByClick"
        >
          {{ storeData.updatedBy }}
        </button>

        <BPopover
          :target="updatedByTargetId"
          triggers="click blur"
          placement="bottom"
          custom-class="user-popover"
        >
          <template #default>
            <UserMiniCard
              :loading="storeData.updatedByDetailsLoading"
              :details="storeData.updatedByDetails"
            />
          </template>
        </BPopover>
      </div>
    </div>
  </WCard>
</template>



<script setup lang="ts">
import { onMounted } from 'vue'
import { BPopover } from 'bootstrap-vue-next'
import { useUpdatedByContainerStore } from '../../stores/updated-by-store'
import WCard from '../WCard.vue'

/**
 * Small inline component for the popover body.
 * (No new file needed — it can live here.)
 */
const UserMiniCard = defineComponent({
  props: {
    loading: { type: Boolean, default: false },
    details: { type: Object as () => any, default: null },
  },
  setup(props) {
    return () => {
      if (props.loading) {
        return (
          <div class="d-flex align-items-center gap-2">
            <div class="spinner-border spinner-border-sm" role="status" />
            <div class="small text-muted">Loading…</div>
          </div>
        )
      }

      if (!props.details) {
        return <div class="small text-muted">No details available.</div>
      }

      const d = props.details
      return (
        <div class="p-2" style="min-width: 320px;">
          <div class="row g-2 small">
            <div class="col-4 fw-semibold">User Type:</div><div class="col-8">{d.userType}</div>
            <div class="col-4 fw-semibold">Login ID:</div><div class="col-8">{d.loginId}</div>
            <div class="col-4 fw-semibold">Job Title:</div><div class="col-8">{d.jobTitle}</div>
            <div class="col-4 fw-semibold">Email:</div><div class="col-8">{d.email}</div>
            <div class="col-4 fw-semibold">Phone:</div><div class="col-8">{d.phone}</div>
            <div class="col-4 fw-semibold">Office:</div><div class="col-8">{d.office}</div>
            <div class="col-4 fw-semibold">Agency:</div><div class="col-8">{d.agency}</div>
          </div>
        </div>
      )
    }
  },
})

const storeData = useUpdatedByContainerStore()

// Stable ids (important for popover targeting)
const createdByTargetId = 'created-by-target'
const updatedByTargetId = 'updated-by-target'

// Your existing afToken approach (keep as-is)
function readAfToken(): string | null {
  try {
    const el = document.getElementById('__afToken') as HTMLInputElement | null
    if (el?.value) return el.value

    const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null
    if (meta?.content) return meta.content

    return null
  } catch {
    return null
  }
}

async function bootstrap() {
  const token = readAfToken()
  if (token) (window as any).AfToken = token
  await storeData.load(token ?? '')
}

async function onCreatedByClick() {
  // Optional: load only when clicked (prevents extra calls)
  if (!storeData.createdByDetails && !storeData.createdByDetailsLoading) {
    await storeData.loadUserDetails('createdBy') // implement in store (see below)
  }
}

async function onUpdatedByClick() {
  if (!storeData.updatedByDetails && !storeData.updatedByDetailsLoading) {
    await storeData.loadUserDetails('updatedBy')
  }
}

onMounted(() => {
  bootstrap()
})
</script>



<style scoped>
  /* Keep link button looking like the UI spec */
  .btn-link {
    color: inherit;
  }

  .btn-link:hover {
    opacity: 0.85;
  }

  /* Make the popover feel like that “info card” */
  :global(.user-popover .popover-body) {
    padding: 0;
    /* our inner card handles padding */
  }
</style>





// updated by store 

// updated-by-store.ts (sketch)
state: () => ({
createdDate: '',
createdBy: '',
updatedDate: '',
updatedBy: '',
createdByDetails: null as any,
updatedByDetails: null as any,
createdByDetailsLoading: false,
updatedByDetailsLoading: false,
}),
actions: {
async loadUserDetails(which: 'createdBy' | 'updatedBy') {
const token = (window as any).AfToken ?? ''
const isCreated = which === 'createdBy'
try {
if (isCreated) this.createdByDetailsLoading = true
else this.updatedByDetailsLoading = true

const loginOrName = isCreated ? this.createdBy : this.updatedBy

// TODO: call your API here:
// const res = await api.getUserCard({ loginOrName }, token)
// const details = res.data

const details = {
userType: 'Staff',
loginId: 'B-JDOE',
jobTitle: 'Career Assessment and Remediation Specialist',
email: 'jdoe@gmail.com',
phone: '(215) 999-9999',
office: 'PA CAREERLINK LEHIGH VALLEY AT ALLENTOWN',
agency: 'WORKFORCE',
}

if (isCreated) this.createdByDetails = details
else this.updatedByDetails = details
} finally {
if (isCreated) this.createdByDetailsLoading = false
else this.updatedByDetailsLoading = false
}
},
}
<template>
  <WCard class="employer-details__card bg-white" id="updated-by-container-card">
    <div class="row g-3 p-3">

      <div class="col-12 col-md-6 col-lg-3">
        <div class="text-muted small text-uppercase">Created Date</div>
        <div class="fw-semibold">{{ storeData.createdDate }}</div>
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <div class="text-muted small text-uppercase">Created By</div>
        <WUserInfoPopover
          id="created-by"
          :label="storeData.createdBy"
          :details="storeData.createdByDetails"
          :loading="storeData.createdByDetailsLoading"
          :onOpen="onCreatedByOpen"
        />
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <div class="text-muted small text-uppercase">Updated Date</div>
        <div class="fw-semibold">{{ storeData.updatedDate }}</div>
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <div class="text-muted small text-uppercase">Updated By</div>
        <WUserInfoPopover
          id="updated-by"
          :label="storeData.updatedBy"
          :details="storeData.updatedByDetails"
          :loading="storeData.updatedByDetailsLoading"
          :onOpen="onUpdatedByOpen"
        />
      </div>

    </div>
  </WCard>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUpdatedByContainerStore } from '../../stores/updated-by-store'
import WCard from '../WCard.vue'
import WUserInfoPopover from './WUserInfoPopover.vue' // adjust path if needed

const storeData = useUpdatedByContainerStore()

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

/** lazy-load details only when user clicks */
async function onCreatedByOpen() {
  if (!storeData.createdByDetails && !storeData.createdByDetailsLoading) {
    await storeData.loadUserDetails('createdBy')
  }
}

async function onUpdatedByOpen() {
  if (!storeData.updatedByDetails && !storeData.updatedByDetailsLoading) {
    await storeData.loadUserDetails('updatedBy')
  }
}

onMounted(() => {
  bootstrap()
})
</script>

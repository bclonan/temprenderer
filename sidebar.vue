<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BOffcanvas, BCollapse } from 'bootstrap-vue-next'

import { useAppStore } from '@cwds/shared/stores'
import { useUserInformationsStore } from '../../stores/user-information-store'

/* -------------------------------------------------------
   Types
------------------------------------------------------- */
type SidebarMenuItem = {
  id: string
  title: string
  icon?: string
  url?: string
  children?: SidebarMenuItem[]
}

/* -------------------------------------------------------
   Stores / Router
------------------------------------------------------- */
const appStore = useAppStore()
const userStore = useUserInformationsStore()
const router = useRouter()
const route = useRoute()

/* -------------------------------------------------------
   State
------------------------------------------------------- */
const sidebarMenuItems = computed<SidebarMenuItem[]>(
  () => userStore.sidebarMenuItems ?? []
)

const openMap = reactive<Record<string, boolean>>({})

const show = computed({
  get: () => appStore.sidebarCollapsed,
  set: (v: boolean) => appStore.toggleSidebar(v)
})

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */
function toggle(id: string) {
  openMap[id] = !openMap[id]
}

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url)
}

function isActive(url?: string): boolean {
  if (!url || isAbsoluteUrl(url)) return false
  const clean = url.split('?')[0].split('#')[0]
  return route.path.startsWith(clean)
}

function navigate(item: SidebarMenuItem) {
  if (item.children?.length) {
    toggle(item.id)
    return
  }

  if (!item.url) return

  if (isAbsoluteUrl(item.url)) {
    window.location.href = item.url
    return
  }

  router.push(item.url)

  // optional: auto-close on mobile
  if (window.innerWidth < 768) {
    appStore.toggleSidebar(false)
  }
}
</script>

<template>
  <BOffcanvas
    v-model="show"
    placement="end"
    class="app-sidebar"
    title="Menu"
    :backdrop="false"
    :body-scrolling="true"
  >
    <nav class="sidebar-nav">
      <template v-for="item in sidebarMenuItems" :key="item.id">
        <!-- Parent row -->
        <div
          class="sidebar-row"
          :class="{ active: isActive(item.url) }"
          role="button"
          tabindex="0"
          @click="navigate(item)"
          @keydown.enter="navigate(item)"
        >
          <div class="sidebar-row__left">
            <i
              v-if="item.icon"
              class="fa"
              :class="item.icon"
              aria-hidden="true"
            />
            <span class="text-truncate">{{ item.title }}</span>
          </div>

          <i
            v-if="item.children?.length"
            class="fa sidebar-row__chev"
            :class="openMap[item.id] ? 'fa-chevron-down' : 'fa-chevron-right'"
            aria-hidden="true"
          />
        </div>

        <!-- Children -->
        <BCollapse
          v-if="item.children?.length"
          v-model="openMap[item.id]"
          class="sidebar-children"
        >
          <div
            v-for="child in item.children"
            :key="child.id"
            class="sidebar-child"
            :class="{ active: isActive(child.url) }"
            role="button"
            tabindex="0"
            @click="navigate(child)"
            @keydown.enter="navigate(child)"
          >
            <i
              v-if="child.icon"
              class="fa"
              :class="child.icon"
              aria-hidden="true"
            />
            <span class="text-truncate">{{ child.title }}</span>
          </div>
        </BCollapse>
      </template>
    </nav>
  </BOffcanvas>
</template>

<style lang="scss" scoped>
/* -------------------------------------------------------
   Offcanvas Overrides
------------------------------------------------------- */
:deep(.offcanvas.app-sidebar) {
  /* kill Bootstrap padding */
  --bs-offcanvas-padding-x: 0;
  --bs-offcanvas-padding-y: 0;

  /* layout */
  top: var(--app-header-height) !important;
  height: calc(100vh - var(--app-header-height)) !important;
  --bs-offcanvas-width: 320px;

  /* visuals */
  box-shadow: none !important;
  border-top: 1px solid #d9d9d9;
  border-left: 1px solid #d9d9d9;
  border-right: 0;
  border-radius: 0;
}

:deep(.offcanvas.app-sidebar .offcanvas-body) {
  padding: 0 !important;
  overflow-y: auto;
}

:deep(.offcanvas.app-sidebar .offcanvas-header) {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #d9d9d9;
}

/* -------------------------------------------------------
   Sidebar Menu
------------------------------------------------------- */
.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.sidebar-row,
.sidebar-child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  cursor: pointer;
  user-select: none;
}

.sidebar-row:hover,
.sidebar-child:hover {
  background: #f5f5f5;
}

.sidebar-row.active,
.sidebar-child.active {
  background: #e9ecef;
  font-weight: 600;
}

.sidebar-row__left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.sidebar-row__chev {
  font-size: 0.8rem;
}

.sidebar-children {
  background: #f3f3f3;
}

.sidebar-child {
  padding-left: 2rem;
  border-top: 1px solid #e2e2e2;
}

/* -------------------------------------------------------
   Mobile: Full Width
------------------------------------------------------- */
@media (max-width: 768px) {
  :deep(.offcanvas.app-sidebar) {
    --bs-offcanvas-width: 100vw;
    left: 0 !important;
    right: 0 !important;
  }
}
</style>

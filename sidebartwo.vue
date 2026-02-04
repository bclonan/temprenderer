<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BOffcanvas, BCollapse } from 'bootstrap-vue-next'
import { useAppStore } from '@/stores/app-store' // adjust if yours differs
import { useUserInformationStore } from '@/stores/user-information-store' // adjust
import type { SidebarMenuItem } from '@/dto/userInformationDto' // adjust path

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const userInfoStore = useUserInformationStore()

/**
 * Offcanvas open/close (your store already drives this)
 */
const show = computed({
  get: () => appStore.sidebarOpen,
  set: (v: boolean) => appStore.setSidebarOpen(v),
})

/**
 * openMap controls which collapses are open.
 * We store expansion state for BOTH level-1 and level-2 items.
 */
const openMap = reactive<Record<string, boolean>>({})

function toggle(id: string) {
  openMap[id] = !openMap[id]
}

/**
 * Absolute URL check (http/https)
 * - Using URL() is the most robust way
 * - It will throw for relative paths like "/Employer/ReportNewHires"
 */
function isAbsoluteUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Mark active only for internal (router) routes.
 * External absolute URLs should NOT be treated as active.
 */
function isActive(url?: string): boolean {
  if (!url) return false
  if (isAbsoluteUrl(url)) return false
  const clean = url.split('?')[0].split('#')[0]
  return route.path.startsWith(clean)
}

/**
 * Navigate behavior:
 * - If the item has children, we EXPAND/COLLAPSE (do not navigate)
 * - Otherwise navigate:
 *   - absolute http/https => window.location
 *   - relative => router.push
 */
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

  // Auto-close on mobile (optional)
  if (window.innerWidth < 768) {
    appStore.setSidebarOpen(false)
  }
}

/**
 * Menu items from the store
 */
const sidebarMenuItems = computed(() => userInfoStore.sidebarMenuItems)
</script>

<template>
  <BOffcanvas
    v-model="show"
    placement="end"
    class="offcanvas app-sidebar"
    no-header
    :backdrop="true"
    :body-scrolling="true"
  >
    <nav class="sidebar-nav">
      <!-- LEVEL 1 -->
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
            <i v-if="item.icon" class="fa" :class="item.icon" aria-hidden="true" />
            <span class="text-truncate">{{ item.title }}</span>
          </div>

          <!-- Chevron for expandable parents -->
          <i
            v-if="item.children?.length"
            class="fa sidebar-row__chev"
            :class="openMap[item.id] ? 'fa-chevron-down' : 'fa-chevron-right'"
            aria-hidden="true"
          />
        </div>

        <!-- LEVEL 2 container -->
        <BCollapse v-if="item.children?.length" v-model="openMap[item.id]" class="sidebar-children">
          <!-- LEVEL 2 rows -->
          <template v-for="child in item.children" :key="child.id">
            <div
              class="sidebar-child"
              :class="{ active: isActive(child.url) }"
              role="button"
              tabindex="0"
              @click="navigate(child)"
              @keydown.enter="navigate(child)"
            >
              <div class="sidebar-row__left">
                <i v-if="child.icon" class="fa" :class="child.icon" aria-hidden="true" />
                <span class="text-truncate">{{ child.title }}</span>
              </div>

              <!-- Chevron for expandable children (this is the missing piece) -->
              <i
                v-if="child.children?.length"
                class="fa sidebar-row__chev"
                :class="openMap[child.id] ? 'fa-chevron-down' : 'fa-chevron-right'"
                aria-hidden="true"
              />
            </div>

            <!-- LEVEL 3 container -->
            <BCollapse
              v-if="child.children?.length"
              v-model="openMap[child.id]"
              class="sidebar-grandchildren"
            >
              <!-- LEVEL 3 rows -->
              <div
                v-for="grand in child.children"
                :key="grand.id"
                class="sidebar-grandchild"
                :class="{ active: isActive(grand.url) }"
                role="button"
                tabindex="0"
                @click="navigate(grand)"
                @keydown.enter="navigate(grand)"
              >
                <div class="sidebar-row__left">
                  <i v-if="grand.icon" class="fa" :class="grand.icon" aria-hidden="true" />
                  <span class="text-truncate">{{ grand.title }}</span>
                </div>
              </div>
            </BCollapse>
          </template>
        </BCollapse>
      </template>
    </nav>
  </BOffcanvas>
</template>

<style scoped lang="scss">
/* Sidebar Menu */
.sidebar-nav {
  display: flex;
  flex-direction: column;
}

/* shared row layout */
.sidebar-row,
.sidebar-child,
.sidebar-grandchild {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  cursor: pointer;
  user-select: none;
}

.sidebar-row__left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.sidebar-row__chev {
  font-size: 0.85rem;
}

/* hover + active */
.sidebar-row:hover,
.sidebar-child:hover,
.sidebar-grandchild:hover {
  background: #f5f5f5;
}

.sidebar-row.active,
.sidebar-child.active,
.sidebar-grandchild.active {
  background: #e9ecef;
  font-weight: 600;
}

/* LEVEL 2 background + indent */
.sidebar-children {
  /* ✅ line you asked for: child menu slightly gray */
  background: #f5f5f5;
}

.sidebar-child {
  padding-left: 2rem;
  border-top: 1px solid #e2e2e2;
  background: #f5f5f5;
}

/* LEVEL 3 background + indent (slightly different so it reads as deeper) */
.sidebar-grandchildren {
  background: #efefef;
}

.sidebar-grandchild {
  padding-left: 3.25rem;
  border-top: 1px solid #e2e2e2;
  background: #efefef;
}

/* Offcanvas overrides (keep yours / merge as needed) */
:global(.offcanvas.app-sidebar) {
  --bs-offcanvas-padding-x: 0;
  --bs-offcanvas-padding-y: 0;
  --bs-offcanvas-width: 320px;

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

/* Mobile: full width */
@media (max-width: 768px) {
  :global(.offcanvas.app-sidebar) {
    --bs-offcanvas-width: 100vw;
    left: 0 !important;
    right: 0 !important;
  }
}
</style>

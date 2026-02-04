<script setup lang="ts">
import { computed, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";

import { useAppStore } from "@cwds/shared/stores";
import { useUserInformationStore } from "../../stores/user-information-store";

// BootstrapVueNext
import { BOffcanvas, BCollapse } from "bootstrap-vue-next";

/**
 * IMPORTANT:
 * Your SidebarMenuItem type should have:
 *   - url?: string
 *   - children?: SidebarMenuItem[]
 * (NOT path)
 */
type SidebarMenuItem = {
  id: string;
  title: string;
  url?: string;
  icon?: string;
  children?: SidebarMenuItem[];
};

const appStore = useAppStore();
const userStore = useUserInformationStore();

const router = useRouter();
const route = useRoute();

/** show/hide offcanvas via your app store */
const show = computed({
  get: () => !appStore.sidebarCollapsed, // adjust if your store uses opposite meaning
  set: (v: boolean) => appStore.toggleSidebar(v),
});

/** menu items from store (already normalized recursively) */
const sidebarMenuItems = computed<SidebarMenuItem[]>(
  () => userStore.sidebarMenuItems as any,
);

/**
 * openMap controls all collapses by id (works for BOTH 2nd and 3rd level)
 * Record<string, boolean> avoids TS "boolean not comparable to string" issues.
 */
const openMap = reactive<Record<string, boolean>>({});

function getOpen(id: string) {
  return openMap[id] ?? false;
}
function setOpen(id: string, v: boolean) {
  openMap[id] = v;
}
function toggle(id: string) {
  openMap[id] = !getOpen(id);
}

/** Treat absolute URLs as http/https */
function isAbsoluteUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Active route highlight for relative URLs only */
function isActive(url?: string): boolean {
  if (!url) return false;
  if (isAbsoluteUrl(url)) return false;

  // normalize (strip query/hash)
  const clean = url.split("?")[0].split("#")[0];
  return route.path.startsWith(clean);
}

/** Navigate: if it has children => toggle; else route or full redirect */
function navigate(item: SidebarMenuItem) {
  if (item.children?.length) {
    toggle(item.id);
    return;
  }

  const url = item.url?.trim();
  if (!url) return;

  if (isAbsoluteUrl(url)) {
    window.location.href = url;
    return;
  }

  router.push(url);

  // optional: auto-close on mobile after navigation
  if (window.innerWidth < 768) {
    show.value = false;
  }
}
</script>

<template>
  <BOffcanvas
    v-model="show"
    placement="end"
    class="offcanvas app-sidebar"
    title=""
    :body-scrolling="true"
    :backdrop="true"
    no-header
    @hidden="appStore.toggleSidebar(false)"
  >
    <nav class="sidebar-nav">
      <template v-for="item in sidebarMenuItems" :key="item.id">
        <!-- Level 1 row -->
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
            :class="getOpen(item.id) ? 'fa-chevron-down' : 'fa-chevron-right'"
            aria-hidden="true"
          />
        </div>

        <!-- Level 2: children collapse -->
        <BCollapse
          v-if="item.children?.length"
          class="sidebar-children"
          :model-value="getOpen(item.id)"
          @update:modelValue="(v: boolean) => setOpen(item.id, v)"
        >
          <template v-for="child in item.children" :key="child.id">
            <!-- Level 2 row -->
            <div
              class="sidebar-child"
              :class="{ active: isActive(child.url) }"
              role="button"
              tabindex="0"
              @click="navigate(child)"
              @keydown.enter="navigate(child)"
            >
              <div class="sidebar-row__left">
                <i
                  v-if="child.icon"
                  class="fa"
                  :class="child.icon"
                  aria-hidden="true"
                />
                <span class="text-truncate">{{ child.title }}</span>
              </div>

              <i
                v-if="child.children?.length"
                class="fa sidebar-row__chev"
                :class="
                  getOpen(child.id) ? 'fa-chevron-down' : 'fa-chevron-right'
                "
                aria-hidden="true"
              />
            </div>

            <!-- Level 3: grandchildren collapse -->
            <BCollapse
              v-if="child.children?.length"
              class="sidebar-grandchildren"
              :model-value="getOpen(child.id)"
              @update:modelValue="(v: boolean) => setOpen(child.id, v)"
            >
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
                  <i
                    v-if="grand.icon"
                    class="fa"
                    :class="grand.icon"
                    aria-hidden="true"
                  />
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

<style lang="scss" scoped>
/* ================================
   Offcanvas overrides (IMPORTANT)
   ================================ */

/**
 * Keep the backdrop element so "click outside" closes the offcanvas,
 * but make it visually invisible.
 * (Opacity 0 still captures clicks => perfect for your ask.)
 */
:global(.offcanvas-backdrop) {
  opacity: 0 !important;
}

/**
 * Move offcanvas down under the fixed header.
 * This requires --app-header-height to exist globally.
 */
:deep(.offcanvas) {
  top: var(--app-header-height) !important;
  height: calc(100vh - var(--app-header-height)) !important;
}

/** Target your offcanvas instance (class is on the root offcanvas) */
:global(.offcanvas.app-sidebar) {
  /* remove Bootstrap padding so your menu lines up */
  --bs-offcanvas-padding-x: 0;
  --bs-offcanvas-padding-y: 0;

  /* set width */
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

/* ================================
   Sidebar menu styling
   ================================ */

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

/* Shared row styling */
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
  font-size: 0.8rem;
}

/* Hover */
.sidebar-row:hover,
.sidebar-child:hover,
.sidebar-grandchild:hover {
  background: #f5f5f5;
}

/* Active */
.sidebar-row.active,
.sidebar-child.active,
.sidebar-grandchild.active {
  background: #e9ecef;
  font-weight: 600;
}

/* Level 2 container (slightly gray background) */
.sidebar-children {
  background: #f7f7f7; /* <-- this is the “slightly gray” child background */
  border-top: 1px solid #e2e2e2;
}

/* Level 2 items indent */
.sidebar-child {
  padding-left: 2rem;
  border-top: 1px solid #eaeaea;
}

/* Level 3 container + deeper indent */
.sidebar-grandchildren {
  background: #f3f3f3;
}

.sidebar-grandchild {
  padding-left: 3.25rem;
  border-top: 1px solid #eaeaea;
}

/* Mobile: full width offcanvas */
@media (max-width: 768px) {
  :global(.offcanvas.app-sidebar) {
    --bs-offcanvas-width: 100vw;
    left: 0 !important;
    right: 0 !important;
  }
}
</style>

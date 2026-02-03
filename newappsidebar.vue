<script setup lang="ts">
import { computed, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/appStore"; // whatever yours is

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

// NOTE: use a name that reflects reality.
// If appStore.sidebarCollapsed means "open" / "visible", you may want to rename later.
// For now, keep your wiring and just bind it.
const show = computed({
  get: () => appStore.sidebarCollapsed,
  set: (v) => appStore.toggleSidebar(v),
});

// Example: open state per parent id
const openMap = reactive<Record<string, boolean>>({});

function isActive(path: string) {
  return route.path.startsWith(path);
}

function toggleGroup(id: string) {
  openMap[id] = !openMap[id];
}

function navigate(item: any) {
  if (item?.path) router.push(item.path);
  // optional: close after navigation (mobile feel)
  // show.value = false
}
</script>

<template>
  <BOffcanvas
    v-model="show"
    placement="end"
    class="app-sidebar"
    title="Menu"
    backdrop
    :body-scrolling="true"
  >
    <nav class="sidebar-nav">
      <template v-for="item in sidebarMenuItems" :key="item.id">
        <!-- parent row -->
        <div
          class="sidebar-row"
          :class="{ active: isActive(item.path) }"
          role="button"
          tabindex="0"
          @click="item.children?.length ? toggleGroup(item.id) : navigate(item)"
          @keydown.enter="
            item.children?.length ? toggleGroup(item.id) : navigate(item)
          "
        >
          <div class="sidebar-row__left">
            <i
              v-if="item.icon"
              class="fa"
              :class="item.icon"
              aria-hidden="true"
            />
            <span class="sidebar-row__text text-truncate">{{
              item.title
            }}</span>
          </div>

          <i
            v-if="item.children?.length"
            class="fa sidebar-row__chev"
            :class="openMap[item.id] ? 'fa-chevron-down' : 'fa-chevron-right'"
            aria-hidden="true"
          />
        </div>

        <!-- children block -->
        <div
          v-if="item.children?.length"
          v-show="openMap[item.id]"
          class="sidebar-children"
        >
          <div
            v-for="child in item.children"
            :key="child.id"
            class="sidebar-child"
            :class="{ active: isActive(child.path) }"
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
        </div>
      </template>
    </nav>
  </BOffcanvas>
</template>

<style lang="scss" scoped>
/* IMPORTANT: Offcanvas DOM is inside the component, so we must style it with :deep */
:deep(.offcanvas.app-sidebar) {
  /* Put it UNDER your header stack */
  top: var(--app-header-height) !important;
  height: calc(100vh - var(--app-header-height)) !important;

  /* Match the Figma feel */
  border-top: 1px solid #d9d9d9;
  border-left: 1px solid #d9d9d9; /* if placement=end */
  border-right: 0;
  border-radius: 0;

  /* Remove default Bootstrap shadow */
  box-shadow: none !important;

  /* Width similar to screenshot */
  --bs-offcanvas-width: 320px;
}

:deep(.offcanvas.app-sidebar .offcanvas-header) {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #d9d9d9;
}

:deep(.offcanvas.app-sidebar .offcanvas-body) {
  padding: 0;
}

/* ---- Menu styles ---- */
.sidebar-nav {
  display: block;
}

.sidebar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0.85rem 1rem;
  border-bottom: 1px solid #d9d9d9;
  background: #fff;
  cursor: pointer;

  &:hover {
    background: #f7f7f7;
  }

  &.active {
    background: #efefef;
    font-weight: 600;
  }
}

.sidebar-row__left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0; /* allow truncate */
}

.sidebar-row__text {
  min-width: 0;
}

.sidebar-row__chev {
  opacity: 0.7;
}

/* Children block – gray with a left rule line */
.sidebar-children {
  background: #f3f3f3;
  border-bottom: 1px solid #d9d9d9;
  border-left: 4px solid #d0d0d0;
}

.sidebar-child {
  display: flex;
  align-items: center;
  gap: 0.6rem;

  padding: 0.75rem 1rem 0.75rem 1.25rem;
  border-top: 1px solid #e2e2e2;
  cursor: pointer;

  &:hover {
    background: #eaeaea;
  }

  &.active {
    background: #e3e3e3;
    font-weight: 600;
  }
}

/* tighten icons */
.sidebar-row i.fa,
.sidebar-child i.fa {
  width: 18px;
  text-align: center;
}
</style>

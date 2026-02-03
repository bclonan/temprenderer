<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import AppHeader from "./AppHeader.vue";
import AppSidebar from "./AppSidebar.vue";
import AppFooter from "./AppFooter.vue";
import PageErrors from "@/components/PageErrors.vue";
import TopHat from "@/core/layout/TopHat.vue";
import EmployerDetails from "@/components/EmployerDetails.vue";

const mainClasses = computed(() => ({
  "app-layout__main": true,
}));

const headerEl = ref<HTMLElement | null>(null);
const headerHeightPx = ref(0);

let ro: ResizeObserver | null = null;

function updateHeaderHeight() {
  headerHeightPx.value = headerEl.value?.getBoundingClientRect().height ?? 0;
}

onMounted(() => {
  updateHeaderHeight();
  ro = new ResizeObserver(() => updateHeaderHeight());
  if (headerEl.value) ro.observe(headerEl.value);
  window.addEventListener("resize", updateHeaderHeight);
});

onBeforeUnmount(() => {
  ro?.disconnect();
  window.removeEventListener("resize", updateHeaderHeight);
});
</script>

<template>
  <!-- expose header height as a CSS variable the sidebar can use -->
  <div
    class="app-layout"
    :style="{ '--app-header-height': `${headerHeightPx}px` }"
  >
    <div ref="headerEl" class="app-layout__header">
      <TopHat />
      <AppHeader />
      <EmployerDetails />
    </div>

    <div class="app-layout__container">
      <AppSidebar />

      <main :class="mainClasses">
        <PageErrors />
        <slot />
      </main>
    </div>

    <AppFooter />
  </div>
</template>

<style lang="scss" scoped>
/* IMPORTANT: Offcanvas is rendered with Bootstrap classes */
:deep(.offcanvas.app-sidebar) {
  top: var(--app-header-height) !important;
  height: calc(100vh - var(--app-header-height)) !important;

  /* desktop width like your screenshot */
  --bs-offcanvas-width: 320px;

  /* remove default shadow */
  box-shadow: none !important;

  /* panel lines like legacy UI */
  border-top: 1px solid #d9d9d9;
  border-left: 1px solid #d9d9d9; /* right-side menu (placement=end) */
  border-right: 0;
  border-radius: 0;
}

:deep(.offcanvas.app-sidebar .offcanvas-header) {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #d9d9d9;
}

:deep(.offcanvas.app-sidebar .offcanvas-body) {
  padding: 0;
}

/* ✅ mobile = full width */
@media (max-width: 768px) {
  :deep(.offcanvas.app-sidebar) {
    --bs-offcanvas-width: 100vw;
    left: 0 !important;
    right: 0 !important;
  }
}
</style>

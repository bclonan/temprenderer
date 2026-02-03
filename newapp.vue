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
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  &__header {
    /* keep it normal flow; sidebar will position under this */
  }

  &__container {
    display: flex;
    flex: 1;
  }

  &__main {
    flex: 1;
    padding: 1.5rem;
    background-color: #f9fafb;
  }
}

@media (max-width: 768px) {
  .app-layout__main {
    padding: 1rem;
  }
}
</style>

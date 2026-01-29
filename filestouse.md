// store 

// src/stores/user-information-store.ts
import { defineStore } from "pinia";
import { getUserInformation } from "@/api/userInformationApi";
import type { UserInformationDto } from "@/dtos/userInformationDto";

type LoadState = "idle" | "loading" | "loaded" | "error";

export const useUserInformationStore = defineStore("userInformation", {
  state: () => ({
    status: "idle" as LoadState,
    error: null as string | null,

    // Entire payload returned by the API (includes FullName now)
    model: null as UserInformationDto | null,

    // Prevent duplicate concurrent loads
    _loadPromise: null as Promise<void> | null,
  }),

  getters: {
    // lifecycle
    isBusy: (s) => s.status === "loading",
    isLoaded: (s) => s.status === "loaded" && !!s.model,

    // --- user identity ---
    fullName: (s) => s.model?.FullName ?? "",
    firstName: (s) => s.model?.FirstName ?? "",
    lastName: (s) => s.model?.LastName ?? "",
    userType: (s) => s.model?.UserType ?? "",

    // --- urls / navigation ---
    logoutUrl: (s) => s.model?.LogOutUrl ?? "",
    dashboardUrl: (s) => s.model?.DashboardUrl ?? "",
    noAccessDashboardUrl: (s) => s.model?.NoAccessDashboardUrl ?? "",
    profileChangeACUrl: (s) => s.model?.ProfileChangeACUrl ?? "",

    // --- account flows / pages ---
    changePasswordUrl: (s) => s.model?.ChangePassword ?? "",
    updatePasswordUrl: (s) => s.model?.UpdatePAssword ?? "",
    changeHintUrl: (s) => s.model?.ChangeHint ?? "",
    qnaUrl: (s) => s.model?.QnA ?? "",
    accessibilityStatementUrl: (s) => s.model?.AccessibilityStatement ?? "",

    // --- timeouts / flags ---
    sessionTimeout: (s) => s.model?.SessionTimeout ?? 0,
    warnTimeout: (s) => s.model?.WarnTimeout ?? 0,
    overrideUserTypeFlag: (s) => !!s.model?.OverrideUserTypeFlag,

    // --- misc ---
    language: (s) => s.model?.Language ?? "en",
    showSolr: (s) => !!s.model?.ShowSolr,
    buildInformation: (s) => s.model?.BuildInformation ?? "",
    employerPhoneNum: (s) => s.model?.EmployerPhoneNum ?? "",

    // --- data blobs ---
    personalInformation: (s) => s.model?.PersonalInformation ?? null,
    myPreferences: (s) => s.model?.MyPreferences ?? null,
    siteMap: (s) => s.model?.SiteMap ?? [],
    menu: (s) => s.model?.menu ?? [],
  },

  actions: {
    async load(force = false) {
      if (!force && this._loadPromise) return this._loadPromise;

      this.status = "loading";
      this.error = null;

      this._loadPromise = (async () => {
        try {
          this.model = await getUserInformation();
          this.status = "loaded";
        } catch (e: any) {
          this.model = null;
          this.status = "error";
          this.error = e?.message ?? "Unknown error";
        } finally {
          this._loadPromise = null;
        }
      })();

      return this._loadPromise;
    },

    clear() {
      this.model = null;
      this.status = "idle";
      this.error = null;
      this._loadPromise = null;
    },

    // handy helper if you want to re-fetch after preference changes, etc.
    async reload() {
      await this.load(true);
    },
  },
});


// from main.ts so we don't have to do from app.vue

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

import { useUserInformationStore } from "@/stores/user-information-store";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Start loading immediately
useUserInformationStore(pinia).load().catch(() => {});

app.mount("#app");



// 🚧 TEMP STUB — REMOVE WHEN REAL API IS READY
// Simulates an async API call with realistic payload + delay

import type { UserInformationDto } from "@/dtos/userInformationDto";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getUserInformation(): Promise<UserInformationDto> {
  // simulate network latency
  await sleep(600);

  return {
    // identity
    FirstName: "Brad",
    LastName: "Clonan",
    FullName: "Brad Clonan",
    UserType: "Admin",

    // urls
    LogOutUrl: "/logout",
    DashboardUrl: "/dashboard",
    NoAccessDashboardUrl: "/no-access",
    ProfileChangeACUrl: "/profile/change-access",

    // account flows
    ChangePassword: "/account/change-password",
    UpdatePAssword: "/account/update-password",
    ChangeHint: "/account/change-hint",
    QnA: "/account/qna",
    AccessibilityStatement: "/accessibility",

    // timeouts (seconds)
    SessionTimeout: 1800,
    WarnTimeout: 1500,

    // flags / config
    OverrideUserTypeFlag: true,
    Language: "en",
    ShowSolr: true,

    // metadata
    BuildInformation: "local-dev | build 2026.01.29",
    EmployerPhoneNum: "1-800-555-0199",

    // blobs (leave loose for now)
    PersonalInformation: {
      email: "brad@example.com",
      branch: "HQ",
      location: "Remote",
    },

    MyPreferences: {
      theme: "dark",
      compactMode: false,
    },

    // navigation
    SiteMap: [
      { id: "home", label: "Home", url: "/dashboard" },
      { id: "reports", label: "Reports", url: "/reports" },
    ],

    menu: [
      {
        id: "dashboard",
        label: "Dashboard",
        to: "/dashboard",
      },
      {
        id: "admin",
        label: "Admin",
        children: [
          { id: "users", label: "Users", to: "/admin/users" },
          { id: "settings", label: "Settings", to: "/admin/settings" },
        ],
      },
      {
        id: "help",
        label: "Help",
        href: "https://help.example.com",
      },
    ],
  };
}

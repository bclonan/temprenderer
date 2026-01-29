Here’s a clean, scalable way to organize **all API calls** across the app, with:

* **Base URL** from `.env`
* **Endpoint paths** (like `/UserInformation/GetUserInformation`) from `.env` too (optional)
* A single place to change routing/versioning/auth
* Per-domain API modules for many endpoints

---

## 1) `.env` setup (base URL + endpoint paths)

### `.env.development`

```env
VITE_API_BASE_URL=http://localhost:5000

# Optional: keep endpoints in env too (useful if legacy app routes differ per env)
VITE_ENDPOINT_GET_USER_INFORMATION=/UserInformation/GetUserInformation
```

### `.env.production`

```env
VITE_API_BASE_URL=https://your-prod-server.com
VITE_ENDPOINT_GET_USER_INFORMATION=/UserInformation/GetUserInformation
```

> You can keep endpoints in code if they don’t change per env.
> Keep them in env only if they **vary by environment** (legacy paths, reverse proxy differences, etc.).

---

## 2) Central config: `src/config/apiRoutes.ts`

This gives you one typed place to read env vars and provide fallback defaults.

```ts
// src/config/apiRoutes.ts
function requiredEnv(name: string): string {
  const v = (import.meta.env[name] as string | undefined)?.trim();
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function optionalEnv(name: string, fallback: string): string {
  const v = (import.meta.env[name] as string | undefined)?.trim();
  return v || fallback;
}

export const apiConfig = {
  baseUrl: optionalEnv("VITE_API_BASE_URL", ""), // allow empty for same-origin proxy

  routes: {
    getUserInformation: optionalEnv(
      "VITE_ENDPOINT_GET_USER_INFORMATION",
      "/UserInformation/GetUserInformation"
    ),
    // Add more as you go:
    // getOrders: optionalEnv("VITE_ENDPOINT_GET_ORDERS", "/Orders/GetOrders"),
  },
};
```

---

## 3) Shared HTTP client that uses base URL: `src/api/http/client.ts`

```ts
import { apiConfig } from "@/config/apiRoutes";

export class ApiError extends Error {
  constructor(public status: number, public url: string, public bodyText?: string) {
    super(bodyText || `Request failed (${status})`);
  }
}

function joinUrl(base: string, path: string) {
  if (!base) return path; // same-origin
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${b}${p}`;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = joinUrl(apiConfig.baseUrl, path);

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.body ? { "Content-Type": "application/json" } : {}),
    ...(opts.headers || {}),
  };

  const res = await fetch(url, {
    method: opts.method || "GET",
    credentials: "include", // keep if using cookie/session auth
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, url, text);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const apiGet = <T>(path: string, signal?: AbortSignal) =>
  apiRequest<T>(path, { method: "GET", signal });

export const apiPost = <T>(path: string, body?: any) =>
  apiRequest<T>(path, { method: "POST", body });
```

---

## 4) API module per domain: `src/api/modules/userInformation.api.ts`

This module references the endpoint from env-backed config.

```ts
// src/api/modules/userInformation.api.ts
import { apiGet } from "@/api/http/client";
import { apiConfig } from "@/config/apiRoutes";
import type { UserInformationDto } from "@/dtos/userInformationDto";

export const userInformationApi = {
  getUserInformation(): Promise<UserInformationDto> {
    return apiGet<UserInformationDto>(apiConfig.routes.getUserInformation);
  },
};
```

---

## 5) Store calls the API module (clean orchestration)

```ts
// src/stores/user-information-store.ts
import { defineStore } from "pinia";
import { userInformationApi } from "@/api/modules/userInformation.api";
import type { UserInformationDto } from "@/dtos/userInformationDto";

type LoadState = "idle" | "loading" | "loaded" | "error";

export const useUserInformationStore = defineStore("userInformation", {
  state: () => ({
    status: "idle" as LoadState,
    error: null as string | null,
    model: null as UserInformationDto | null,
    _loadPromise: null as Promise<void> | null,
  }),

  actions: {
    async load(force = false) {
      if (!force && this._loadPromise) return this._loadPromise;

      this.status = "loading";
      this.error = null;

      this._loadPromise = (async () => {
        try {
          this.model = await userInformationApi.getUserInformation();
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
  },
});
```

---

## 6) Folder structure for a big app (recommended)

```
src/
  config/
    apiRoutes.ts               # env-backed route config
  api/
    http/
      client.ts                # base URL + fetch wrapper
    modules/
      userInformation.api.ts
      dashboard.api.ts
      reports.api.ts
      orders.api.ts
  dtos/
    userInformationDto.ts
    dashboardDto.ts
  stores/
    user-information-store.ts
    dashboard-store.ts
  pages/
    DashboardPage.vue
```

This scales to 200+ endpoints without turning into spaghetti.

---

## 7) How to add a new endpoint (repeatable pattern)

1. Add env var (optional):

```env
VITE_ENDPOINT_GET_REPORTS=/Reports/GetReports
```

2. Add route in `apiRoutes.ts`:

```ts
getReports: optionalEnv("VITE_ENDPOINT_GET_REPORTS", "/Reports/GetReports"),
```

3. Add api module method:

```ts
reportsApi.getReports = () => apiGet<ReportsDto[]>(apiConfig.routes.getReports);
```

4. Store calls it.

---

## Recommendation (practical)

* Keep **base URL** in env **always**
* Keep **endpoint paths** in **code** unless you *know they vary* by environment
  (legacy apps sometimes do; modern APIs usually don’t)

If you want, I can show a slightly more advanced setup that supports:

* `/api/v1` prefixing automatically
* multiple backends (e.g., `VITE_AUTH_BASE_URL`, `VITE_CORE_BASE_URL`)
* automatic 401 redirect to `LogOutUrl` from the user store

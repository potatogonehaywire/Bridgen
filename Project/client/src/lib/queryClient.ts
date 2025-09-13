import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Toggle this to true for verbose logging
const DEBUG = false;

function log(...args: any[]) {
  if (DEBUG) console.log("[queryClient]", ...args);
}

async function throwIfResNotOk(res: Response): Promise<void> {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown,
): Promise<T> {
  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");
  const fullUrl = new URL(url.replace(/^\/+/, ""), baseUrl).toString();

  log("API Request:", method, fullUrl, data);

  try {
    const res = await fetch(fullUrl, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return await res.json();
  } catch (err) {
    console.error("API fetch error:", err);
    throw err;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn =
  <T>(options: { on401: UnauthorizedBehavior }): QueryFunction<T> =>
  async ({ queryKey }) => {
    const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

    const path = Array.isArray(queryKey)
      ? queryKey
          .filter(Boolean)
          .map((segment) => String(segment).replace(/^\/+/, "").replace(/\/+$/, ""))
          .join("/")
      : String(queryKey);

    const fullUrl = new URL(path, baseUrl).toString();
    log("Query Fetch:", fullUrl);

    try {
      const res = await fetch(fullUrl, {
        credentials: "include",
      });

      if (options.on401 === "returnNull" && res.status === 401) {
        log("401 Unauthorized — returning null");
        return null as unknown as T;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (err) {
      console.error("Query fetch error:", err);
      throw err;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Zoom Meeting Sync Helper
export async function syncZoomMeetings(): Promise<{ synced: any[] }> {
  log("Syncing Zoom meetings...");
  return await apiRequest<{ synced: any[] }>("POST", "/api/sync-zoom");
}

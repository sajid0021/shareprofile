export function getApiBaseUrl() {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    if (!["localhost", "127.0.0.1"].includes(hostname)) {
      return "/api/v1";
    }
  }

  return process.env.NEXT_PUBLIC_API_URL?.trim() || "/api/v1";
}

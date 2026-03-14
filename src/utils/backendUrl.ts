const DEFAULT_DEV_BACKEND_PORT = "3001";

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

export function resolveBackendOrigin(): string {
  const configuredOrigin = import.meta.env.VITE_BACKEND_URL;

  if (typeof configuredOrigin === "string" && configuredOrigin.length > 0) {
    return trimTrailingSlash(configuredOrigin);
  }

  if (typeof window === "undefined") {
    return `http://localhost:${DEFAULT_DEV_BACKEND_PORT}`;
  }

  if (import.meta.env.DEV) {
    const backendPort = import.meta.env.VITE_BACKEND_PORT ?? DEFAULT_DEV_BACKEND_PORT;
    const url = new URL(window.location.origin);
    url.port = backendPort;
    return trimTrailingSlash(url.origin);
  }

  return trimTrailingSlash(window.location.origin);
}

export function buildBackendUrl(pathname: string): string {
  return new URL(pathname, `${resolveBackendOrigin()}/`).toString();
}

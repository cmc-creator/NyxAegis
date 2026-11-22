// Store shell detection.
//
// The App Store and Google Play shells (Capacitor, the Feed the Bear
// pattern) load the live site with ?shell=store appended to server.url.
// Subscriptions are sold only on the web, so inside a store shell the app
// hides every purchase entry point: subscribe buttons, the manage billing
// portal button, and the plan upgrade cards on the billing page. Signed-in
// customers keep full use of everything else, including view-only pages
// such as invoices.
//
// How it works: the root layout runs a small inline script before first
// paint. When it sees ?shell=store it persists the flag to localStorage
// under "nyxaegis-store-shell", so in-app navigation and later loads keep
// it, and it sets data-store-shell="store" on <html>. globals.css hides
// .nyx-store-hide elements whenever that attribute is present and shows
// .nyx-store-note elements instead. Client components that need the flag
// in code can call isStoreShell() below.

export const STORE_SHELL_PARAM = "shell";
export const STORE_SHELL_VALUE = "store";
export const STORE_SHELL_STORAGE_KEY = "nyxaegis-store-shell";

export function isStoreShell(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (new URLSearchParams(window.location.search).get(STORE_SHELL_PARAM) === STORE_SHELL_VALUE) return true;
    if (document.documentElement.getAttribute("data-store-shell") === STORE_SHELL_VALUE) return true;
    return window.localStorage.getItem(STORE_SHELL_STORAGE_KEY) === STORE_SHELL_VALUE;
  } catch {
    return false;
  }
}

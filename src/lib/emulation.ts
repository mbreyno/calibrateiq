/**
 * Client-side utility for reading and writing emulation state.
 *
 * The server sets an `iq_emulate` cookie (readable by API routes via `cookies()`),
 * but Chrome does not always expose fetch-set cookies to `document.cookie`.
 * We therefore also persist the emulated advisor ID in localStorage, which is
 * always reliably readable by client components.
 */

const LS_KEY = 'iq_emulate'

/** Call this after /api/emulate-user succeeds to register the emulated advisor client-side. */
export function setEmulatedAdvisorId(advisorId: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(LS_KEY, advisorId)
}

/** Call this when emulation ends (revert) to clear the client-side state. */
export function clearEmulatedAdvisorId(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(LS_KEY)
}

/** Returns the advisor_id currently being emulated, or null if not emulating. */
export function getEmulatedAdvisorId(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(LS_KEY)
}

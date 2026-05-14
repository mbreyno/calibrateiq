/**
 * Client-side utility for reading the emulation cookie.
 * The `iq_emulate` cookie is set by /api/emulate-user and cleared by /api/revert-emulation.
 * It stores the advisor_id of the sub-user being emulated by an admin.
 */

export function getEmulatedAdvisorId(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)iq_emulate=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

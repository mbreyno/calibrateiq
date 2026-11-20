export type WriteResult<T> = {
  data: T[] | null
  error: { message: string; code?: string } | null
}

export const SAVE_FAILED_MESSAGE =
  "Your changes weren't saved. Check your internet connection and try again."

export const SAVE_REJECTED_MESSAGE =
  "Your changes weren't saved. Your login may have expired: copy anything you've typed, refresh the page, and try again."

// insufficient_privilege (RLS rejected an insert) and expired/invalid JWT
const REJECTED_CODES = new Set(['42501', 'PGRST301', 'PGRST303'])

/**
 * Awaits a browser-side Supabase write and throws a user-facing Error unless
 * at least one row changed. The query must end in `.select(...)` so the
 * changed rows come back: row-level security rejects an update or delete the
 * user isn't allowed to make (including after their login expires) by
 * changing zero rows, not by returning an error.
 */
export async function requireWrite<T>(query: PromiseLike<WriteResult<T>>): Promise<T[]> {
  let result: WriteResult<T>
  try {
    result = await query
  } catch (err) {
    console.error('Save failed:', err)
    throw new Error(SAVE_FAILED_MESSAGE)
  }

  if (result.error) {
    console.error('Save failed:', result.error)
    throw new Error(REJECTED_CODES.has(result.error.code ?? '') ? SAVE_REJECTED_MESSAGE : SAVE_FAILED_MESSAGE)
  }
  if (!result.data || result.data.length === 0) {
    console.error('Save changed no rows: not permitted or session expired.')
    throw new Error(SAVE_REJECTED_MESSAGE)
  }
  return result.data
}

export function saveErrorMessage(err: unknown): string {
  return err instanceof Error && err.message ? err.message : SAVE_FAILED_MESSAGE
}

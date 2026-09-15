'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateEnquiry, type UpdateState } from './actions';

const STATUSES = ['NEW', 'CONTACTED', 'QUOTED', 'CLOSED', 'SPAM'] as const;

const initialState: UpdateState = { error: null, saved: false };

export function EnquiryDetailForm({
  id,
  status,
  internalNotes,
}: {
  id: string;
  status: string;
  internalNotes: string;
}) {
  const [state, formAction] = useFormState(updateEnquiry, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={id} />

      <div>
        <label htmlFor="status" className="block text-[0.875rem] font-semibold text-ink">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={status}
          className="mt-2 block w-full rounded-sm border border-line bg-surface px-4 py-3 text-[0.9375rem] text-ink transition-colors hover:border-brass"
        >
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="internalNotes" className="block text-[0.875rem] font-semibold text-ink">
          Internal notes
        </label>
        <p className="mt-1 text-[0.8125rem] text-body">
          Only the showroom sees this. The customer never does.
        </p>
        <textarea
          id="internalNotes"
          name="internalNotes"
          rows={5}
          defaultValue={internalNotes}
          placeholder="Quoted 1200x2400 Statuario on 12 Sep. Following up Monday."
          className="mt-2 block w-full rounded-sm border border-line bg-surface px-4 py-3 text-[0.9375rem] text-ink transition-colors hover:border-brass"
        />
      </div>

      {state.error ? (
        <p role="alert" className="rounded-sm bg-brass-tint px-4 py-3 text-[0.9375rem] text-ink">
          {state.error}
        </p>
      ) : null}

      {state.saved ? (
        <p role="status" className="rounded-sm bg-surface-alt px-4 py-3 text-[0.9375rem] text-ink">
          Saved.
        </p>
      ) : null}

      <SaveButton />
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center justify-center rounded-full bg-ink-soft px-7 text-[0.9375rem] font-semibold text-surface transition-colors hover:bg-ink disabled:opacity-60"
    >
      {pending ? 'Saving…' : 'Save Changes'}
    </button>
  );
}

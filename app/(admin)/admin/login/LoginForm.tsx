'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login, type LoginState } from './actions';

const initialState: LoginState = { error: null };

export function LoginForm({ from }: { from: string }) {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="from" value={from} />

      <div>
        <label htmlFor="email" className="block text-[0.875rem] font-semibold text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="mt-2 block w-full rounded-sm border border-line bg-surface px-4 py-3 text-[0.9375rem] text-ink transition-colors hover:border-brass"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-[0.875rem] font-semibold text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-2 block w-full rounded-sm border border-line bg-surface px-4 py-3 text-[0.9375rem] text-ink transition-colors hover:border-brass"
        />
      </div>

      {state.error ? (
        <p role="alert" className="rounded-sm bg-brass-tint px-4 py-3 text-[0.9375rem] text-ink">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-[3.25rem] w-full items-center justify-center rounded-full bg-ink-soft text-copy font-semibold text-surface transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Signing in…' : 'Sign In'}
    </button>
  );
}

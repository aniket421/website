'use client';

import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/utils';

/** Form controls shared by every admin editor. */

const control =
  'mt-2 block w-full rounded-sm border border-line bg-surface px-4 py-3 text-[0.9375rem] text-ink ' +
  'placeholder:text-body transition-colors hover:border-brass';

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[0.875rem] font-semibold text-ink">
        {label}
      </label>
      {hint ? <p className="mt-1 text-[0.8125rem] text-body">{hint}</p> : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[0.875rem] text-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  id,
  name,
  error,
  ...props
}: { id: string; name: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      id={id}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(control, error && 'border-brass bg-brass-tint')}
      {...props}
    />
  );
}

export function TextArea({
  id,
  name,
  error,
  ...props
}: { id: string; name: string; error?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      id={id}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(control, error && 'border-brass bg-brass-tint')}
      {...props}
    />
  );
}

export function Select({
  id,
  name,
  error,
  children,
  ...props
}: { id: string; name: string; error?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      id={id}
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={cn(control, error && 'border-brass bg-brass-tint')}
      {...props}
    >
      {children}
    </select>
  );
}

export function Checkbox({
  id,
  name,
  label,
  defaultChecked,
}: {
  id: string;
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 text-[0.9375rem] text-ink">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-5 w-5 rounded-[4px] border-line accent-brass"
      />
      {label}
    </label>
  );
}

export function SubmitButton({ children = 'Save Changes' }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 items-center justify-center rounded-full bg-ink-soft px-7 text-[0.9375rem] font-semibold text-surface transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Saving…' : children}
    </button>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-sm bg-brass-tint px-4 py-3 text-[0.9375rem] text-ink">
      {message}
    </p>
  );
}

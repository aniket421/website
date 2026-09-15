'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Checkbox, Field, FormError, Select, SubmitButton, TextArea, TextInput } from '@/components/admin/fields';
import { Card, EmptyState } from '@/components/admin/ui';
import type { ContentState } from '@/app/(admin)/admin/(protected)/content/actions';

export type FieldSpec = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'select' | 'url';
  hint?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
};

export type Row = { id: string; title: string; subtitle?: string; published: boolean } & Record<
  string,
  unknown
>;

const initial: ContentState = { error: null, fields: {}, saved: false };

/**
 * One editor for brands, categories, testimonials, FAQs and gallery images.
 *
 * They differ only in their fields, so they are described rather than
 * duplicated: five copies of the same list-and-form would be five places to fix
 * every future change.
 */
export function ContentEditor({
  heading,
  rows,
  fields,
  action,
  onToggle,
  onReorder,
  onDelete,
  publishLabel = 'Published',
}: {
  heading: string;
  rows: Row[];
  fields: FieldSpec[];
  action: (prev: ContentState, formData: FormData) => Promise<ContentState>;
  onToggle: (id: string, next: boolean) => Promise<void>;
  onReorder: (ids: string[]) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  publishLabel?: string;
}) {
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [order, setOrder] = useState<string[]>(rows.map((r) => r.id));

  const ordered = order
    .map((id) => rows.find((r) => r.id === id))
    .filter((r): r is Row => Boolean(r));

  const move = async (index: number, delta: number) => {
    const to = index + delta;
    if (to < 0 || to >= ordered.length) return;
    const next = ordered.map((r) => r.id);
    const [moved] = next.splice(index, 1);
    if (moved) next.splice(to, 0, moved);
    setOrder(next);
    await onReorder(next);
  };

  const showForm = creating || editing !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-card text-ink">{heading}</h2>
        {!showForm ? (
          <button
            type="button"
            onClick={() => { setCreating(true); setEditing(null); }}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-soft px-5 text-[0.9375rem] font-semibold text-surface transition-colors hover:bg-ink"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add
          </button>
        ) : null}
      </div>

      {showForm ? (
        <Card>
          <EditorForm
            key={editing?.id ?? 'new'}
            row={editing}
            fields={fields}
            action={action}
            publishLabel={publishLabel}
            onDone={() => { setCreating(false); setEditing(null); }}
          />
        </Card>
      ) : null}

      {ordered.length === 0 ? (
        <EmptyState title="Nothing here yet" description={`Add the first entry to see it on the site.`} />
      ) : (
        <ul className="space-y-3">
          {ordered.map((row, index) => (
            <li key={row.id}>
              <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-[200px] flex-1">
                  <p className="font-semibold text-ink">{row.title}</p>
                  {row.subtitle ? (
                    <p className="mt-0.5 text-[0.875rem] text-body">{row.subtitle}</p>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      row.published
                        ? 'rounded-full border border-line bg-surface-alt px-2.5 py-1 text-[0.75rem] font-semibold text-ink'
                        : 'rounded-full border border-line bg-surface px-2.5 py-1 text-[0.75rem] font-semibold text-body'
                    }
                  >
                    {row.published ? publishLabel : 'Hidden'}
                  </span>

                  <IconButton label={`Move ${row.title} up`} onClick={() => move(index, -1)} disabled={index === 0}>
                    <ArrowUp aria-hidden="true" className="h-4 w-4" />
                  </IconButton>
                  <IconButton label={`Move ${row.title} down`} onClick={() => move(index, 1)} disabled={index === ordered.length - 1}>
                    <ArrowDown aria-hidden="true" className="h-4 w-4" />
                  </IconButton>
                  <IconButton label={`Edit ${row.title}`} onClick={() => { setEditing(row); setCreating(false); }}>
                    <Pencil aria-hidden="true" className="h-4 w-4" />
                  </IconButton>
                  <button
                    type="button"
                    onClick={() => onToggle(row.id, !row.published)}
                    className="rounded-full border border-line px-4 py-2 text-[0.8125rem] font-semibold text-ink transition-colors hover:border-brass hover:bg-brass-tint"
                  >
                    {row.published ? 'Hide' : 'Show'}
                  </button>
                  {onDelete ? (
                    <IconButton label={`Delete ${row.title}`} onClick={() => onDelete(row.id)}>
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </IconButton>
                  ) : null}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EditorForm({
  row,
  fields,
  action,
  publishLabel,
  onDone,
}: {
  row: Row | null;
  fields: FieldSpec[];
  action: (prev: ContentState, formData: FormData) => Promise<ContentState>;
  publishLabel: string;
  onDone: () => void;
}) {
  const [state, formAction] = useFormState(action, initial);

  // The server confirms before the panel closes, so a failed save stays open
  // with its errors rather than silently discarding what was typed.
  if (state.saved) {
    queueMicrotask(onDone);
  }

  return (
    <form action={formAction} className="space-y-5">
      {row ? <input type="hidden" name="id" value={row.id} /> : null}

      <div className="flex items-center justify-between gap-4">
        <p className="text-[0.9375rem] font-semibold text-ink">
          {row ? `Editing ${row.title}` : 'New entry'}
        </p>
        <button
          type="button"
          onClick={onDone}
          aria-label="Close editor"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((spec) => {
          const id = `${row?.id ?? 'new'}-${spec.name}`;
          const error = state.fields[spec.name];
          const value = row?.[spec.name];

          if (spec.type === 'checkbox') {
            return (
              <div key={spec.name} className="sm:col-span-2">
                <Checkbox
                  id={id}
                  name={spec.name}
                  label={spec.label}
                  defaultChecked={value === undefined ? true : Boolean(value)}
                />
              </div>
            );
          }

          const control =
            spec.type === 'textarea' ? (
              <TextArea id={id} name={spec.name} rows={4} error={error} defaultValue={String(value ?? '')} placeholder={spec.placeholder} />
            ) : spec.type === 'select' ? (
              <Select id={id} name={spec.name} error={error} defaultValue={String(value ?? '')}>
                {(spec.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            ) : (
              <TextInput
                id={id}
                name={spec.name}
                type={spec.type === 'number' ? 'number' : spec.type === 'url' ? 'url' : 'text'}
                min={spec.type === 'number' ? 0 : undefined}
                error={error}
                defaultValue={String(value ?? '')}
                placeholder={spec.placeholder}
                required={spec.required}
              />
            );

          return (
            <div key={spec.name} className={spec.type === 'textarea' ? 'sm:col-span-2' : undefined}>
              <Field id={id} label={spec.label} hint={spec.hint} error={error}>
                {control}
              </Field>
            </div>
          );
        })}
      </div>

      <FormError message={state.error} />
      <p className="sr-only">{publishLabel}</p>
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-brass hover:bg-brass-tint disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

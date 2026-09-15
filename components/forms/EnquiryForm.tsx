'use client';

import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle2, Send } from 'lucide-react';
import { site, whatsappUrl } from '@/lib/data/site';
import type { Option } from '@/lib/queries/reference';
import { uploadReference } from '@/lib/upload';
import {
  ACCEPTED_UPLOAD_EXTENSIONS,
  emptyEnquiry,
  enquirySchema,
  validateUpload,
  type EnquiryValues,
} from '@/lib/validations/enquiry';
import { zodResolver } from '@/lib/validations/zodResolver';
import { cn } from '@/lib/utils';

export function EnquiryForm({
  brands,
  categories,
}: {
  brands: Option[];
  categories: Option[];
}) {
  const ids = useId();
  const [sent, setSent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryValues>({
    resolver: zodResolver(enquirySchema),
    defaultValues: emptyEnquiry,
    mode: 'onTouched',
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setFileError(null);

    // The file goes straight to Cloudinary; only the resulting URL is posted.
    let attachmentUrl = '';
    if (file) {
      const uploaded = await uploadReference(file);
      if ('error' in uploaded) {
        setFileError(uploaded.error);
        return;
      }
      attachmentUrl = uploaded.url;
    }

    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...values, attachmentUrl }),
      });

      const body = await response.json().catch(() => null);

      if (response.ok) {
        setSent(true);
        return;
      }

      // 422 carries per-field messages; surface them where the user is looking.
      const fields = body?.error?.fields as Record<string, string> | undefined;
      if (response.status === 422 && fields) {
        for (const [name, message] of Object.entries(fields)) {
          if (name in emptyEnquiry) {
            setError(name as keyof EnquiryValues, { type: 'server', message });
          }
        }
        setFormError(null);
        return;
      }

      setFormError(
        body?.error?.message ??
          `We could not send that just now. Please call ${site.phone.display} and we will take the details over the phone.`,
      );
    } catch {
      setFormError(
        `We could not send that just now. Please call ${site.phone.display} and we will take the details over the phone.`,
      );
    }
  });

  if (sent) {
    return (
      <div className="rounded-panel border border-line bg-surface p-8 shadow-panel lg:p-10">
        <CheckCircle2 aria-hidden="true" className="h-11 w-11 text-brass" strokeWidth={1.5} />
        <h3 className="mt-5 text-heading">Enquiry received</h3>
        <p className="mt-4 text-copy">
          A consultant will call you on the number you gave us, within 24 hours
          and during showroom hours. If you attached a plan, they will have
          looked at it before ringing.
        </p>
        <p className="mt-4 text-copy">
          Need an answer sooner? Message us on WhatsApp and someone on the floor
          will pick it up.
        </p>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-ink-soft px-6 text-[0.9375rem] font-semibold text-surface transition-colors hover:bg-ink"
        >
          WhatsApp {site.phone.display}
        </a>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="relative rounded-panel border border-line bg-surface p-7 shadow-panel lg:p-9"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id={`${ids}-name`}
          label="Full Name"
          required
          error={errors.fullName?.message}
        >
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="name"
              placeholder="Your name"
              {...register('fullName')}
            />
          )}
        </Field>

        <Field id={`${ids}-phone`} label="Phone Number" required error={errors.phone?.message}>
          {(props) => (
            <input
              {...props}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="98732 55836"
              {...register('phone')}
            />
          )}
        </Field>

        <Field id={`${ids}-email`} label="Email" error={errors.email?.message}>
          {(props) => (
            <input
              {...props}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
            />
          )}
        </Field>

        <Field id={`${ids}-city`} label="City" error={errors.city?.message}>
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="address-level2"
              placeholder="Ghaziabad"
              {...register('city')}
            />
          )}
        </Field>

        <Field id={`${ids}-brand`} label="Brand" error={errors.brandId?.message}>
          {(props) => (
            <select {...props} {...register('brandId')}>
              <option value="">No preference</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field id={`${ids}-category`} label="Product Category" error={errors.categoryId?.message}>
          {(props) => (
            <select {...props} {...register('categoryId')}>
              <option value="">Not sure yet</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      <div className="mt-5">
        <Field id={`${ids}-message`} label="Message" error={errors.message?.message}>
          {(props) => (
            <textarea
              {...props}
              rows={4}
              placeholder="Tell us about the space — rooms, rough area, and when you need delivery."
              {...register('message')}
            />
          )}
        </Field>
      </div>

      <div className="mt-5">
        <label
          htmlFor={`${ids}-reference`}
          className="block text-[0.875rem] font-semibold text-ink"
        >
          Reference image
        </label>
        <input
          id={`${ids}-reference`}
          type="file"
          accept={ACCEPTED_UPLOAD_EXTENSIONS}
          aria-describedby={fileError ? `${ids}-reference-error` : `${ids}-reference-hint`}
          aria-invalid={fileError ? true : undefined}
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            setFile(selected);
            setFileError(selected ? validateUpload(selected) : null);
          }}
          className="mt-2 block w-full cursor-pointer rounded-sm border border-line bg-surface text-[0.9375rem] text-body file:mr-4 file:cursor-pointer file:border-0 file:bg-surface-alt file:px-4 file:py-3 file:text-[0.875rem] file:font-semibold file:text-ink hover:border-brass"
        />
        {fileError ? (
          <p id={`${ids}-reference-error`} className="mt-2 text-[0.875rem] text-ink">
            {fileError}
          </p>
        ) : (
          <p id={`${ids}-reference-hint`} className="mt-2 text-[0.875rem]">
            A photo of the space or a plan helps. JPG, PNG or PDF, up to 8MB.
          </p>
        )}
      </div>

      {/*
        Honeypot. Positioned off-screen rather than display:none, since some
        bots skip fields they can tell are hidden. Out of the tab order and out
        of the accessibility tree, so nobody using the site ever meets it.
      */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={`${ids}-company-website`}>Company website</label>
        <input
          id={`${ids}-company-website`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('companyWebsite')}
        />
      </div>

      {formError ? (
        <p role="alert" className="mt-5 rounded-sm bg-brass-tint px-4 py-3 text-[0.9375rem] text-ink">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 inline-flex h-[3.25rem] w-full items-center justify-center gap-2.5 rounded-full bg-ink-soft text-copy font-semibold text-surface transition-colors duration-200 hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Sending…' : 'Submit Enquiry'}
        <Send aria-hidden="true" className="h-[1.125rem] w-[1.125rem]" />
      </button>

      <p className="mt-4 text-center text-[0.875rem]">{site.responsePromise}</p>
    </form>
  );
}

const controlClasses =
  'mt-2 block w-full rounded-sm border border-line bg-surface px-4 py-3 text-[0.9375rem] text-ink ' +
  'placeholder:text-body transition-colors duration-200 hover:border-brass';

/**
 * Renders the label, the control and its message. Errors sit under the field
 * in plain language and tint the border brass rather than shouting in red.
 */
function Field({
  id,
  label,
  required = false,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: (props: {
    id: string;
    className: string;
    'aria-invalid': true | undefined;
    'aria-describedby': string | undefined;
  }) => React.ReactNode;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-[0.875rem] font-semibold text-ink">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-0.5 text-brass">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </label>

      {children({
        id,
        className: cn(controlClasses, error && 'border-brass bg-brass-tint'),
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : undefined,
      })}

      {error ? (
        <p id={errorId} className="mt-2 text-[0.875rem] text-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}

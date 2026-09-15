'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Star, Trash2, Upload } from 'lucide-react';
import { uploadToCloudinary, type UploadPurpose } from '@/lib/upload';

export type ManagedImage = { url: string; altText: string };

/**
 * Upload, reorder and describe a product's images.
 *
 * The ordered list is serialised into a hidden input, so the whole thing posts
 * with the surrounding form as one server action rather than needing its own
 * endpoint and its own failure states.
 *
 * Reordering is driven by buttons as well as pointer drag: drag-and-drop alone
 * is unusable from a keyboard, and this is a screen staff use daily.
 */
export function ImageManager({
  name,
  purpose,
  initial,
}: {
  name: string;
  purpose: UploadPurpose;
  initial: ManagedImage[];
}) {
  const [images, setImages] = useState<ManagedImage[]>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    if (moved) next.splice(to, 0, moved);
    setImages(next);
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);

    const uploaded: ManagedImage[] = [];
    for (const file of Array.from(files)) {
      const result = await uploadToCloudinary(file, purpose);
      if ('error' in result) {
        setError(result.error);
        break;
      }
      uploaded.push({ url: result.url, altText: '' });
    }

    if (uploaded.length) setImages((current) => [...current, ...uploaded]);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={`${name}-file`}
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-surface px-5 text-[0.9375rem] font-semibold text-ink transition-colors hover:border-brass hover:bg-brass-tint"
        >
          <Upload aria-hidden="true" className="h-4 w-4" />
          {busy ? 'Uploading…' : 'Add images'}
        </label>
        <input
          id={`${name}-file`}
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy}
          onChange={(e) => onFiles(e.target.files)}
          className="sr-only"
        />
        <p className="text-[0.875rem] text-body">
          The first image is the one shown in listings.
        </p>
      </div>

      {error ? (
        <p role="alert" className="mt-3 rounded-sm bg-brass-tint px-4 py-3 text-[0.9375rem] text-ink">
          {error}
        </p>
      ) : null}

      {images.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {images.map((image, index) => (
            <li
              key={`${image.url}-${index}`}
              className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-surface p-3"
            >
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-sm bg-surface-alt">
                <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
              </div>

              <div className="min-w-[200px] flex-1">
                <label
                  htmlFor={`${name}-alt-${index}`}
                  className="block text-[0.8125rem] font-semibold text-ink"
                >
                  Alt text
                  {index === 0 ? (
                    <span className="ml-2 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-brass-deep">
                      <Star aria-hidden="true" className="h-3 w-3 fill-brass text-brass" />
                      Primary
                    </span>
                  ) : null}
                </label>
                <input
                  id={`${name}-alt-${index}`}
                  type="text"
                  value={image.altText}
                  placeholder="Describe the image for screen readers"
                  onChange={(e) =>
                    setImages((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, altText: e.target.value } : item,
                      ),
                    )
                  }
                  className="mt-1.5 block w-full rounded-sm border border-line bg-surface px-3 py-2 text-[0.875rem] text-ink"
                />
              </div>

              <div className="flex items-center gap-2">
                <IconButton label={`Move image ${index + 1} earlier`} onClick={() => move(index, index - 1)} disabled={index === 0}>
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                </IconButton>
                <IconButton label={`Move image ${index + 1} later`} onClick={() => move(index, index + 1)} disabled={index === images.length - 1}>
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label={`Remove image ${index + 1}`}
                  onClick={() => setImages((c) => c.filter((_, i) => i !== index))}
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-card border border-dashed border-line px-4 py-6 text-center text-[0.9375rem] text-body">
          No images yet.
        </p>
      )}
    </div>
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

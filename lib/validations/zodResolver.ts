import type { FieldError, FieldErrors, FieldValues, Resolver } from 'react-hook-form';
import type { ZodType } from 'zod';

/**
 * A minimal zod resolver for react-hook-form.
 *
 * @hookform/resolvers is not on this project's approved dependency list, and
 * the adapter is small enough to own: map zod issues onto field paths and keep
 * the first message for each field.
 */
export function zodResolver<TValues extends FieldValues>(
  schema: ZodType<TValues>,
): Resolver<TValues> {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: Record<string, FieldError> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (path && !errors[path]) {
        errors[path] = { type: issue.code, message: issue.message };
      }
    }

    return { values: {}, errors: errors as FieldErrors<TValues> };
  };
}

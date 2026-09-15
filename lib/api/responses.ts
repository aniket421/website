import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/**
 * One response shape for every route handler: { data } on success,
 * { error: { message, fields? } } on failure.
 *
 * Clients get a generic sentence. Detail goes to the server log and nowhere
 * else — Prisma errors in particular name tables and constraints, which is
 * free reconnaissance for anyone probing the API.
 */

export type ApiError = { message: string; fields?: Record<string, string> };

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, { status: 200, ...init });
}

export function created<T>(data: T) {
  return NextResponse.json({ data }, { status: 201 });
}

export function fail(status: number, message: string, fields?: Record<string, string>) {
  const error: ApiError = fields ? { message, fields } : { message };
  return NextResponse.json({ error }, { status });
}

export const badRequest = (message = 'That request could not be read.') => fail(400, message);
export const unauthorized = (message = 'Please sign in to continue.') => fail(401, message);
export const forbidden = (message = 'You do not have access to that.') => fail(403, message);
export const notFound = (message = 'We could not find that.') => fail(404, message);

export const tooManyRequests = (message: string, retryAfterSeconds?: number) => {
  const response = fail(429, message);
  if (retryAfterSeconds) response.headers.set('Retry-After', String(retryAfterSeconds));
  return response;
};

/** Turns a ZodError into per-field messages the form can render inline. */
export function validationFailed(error: ZodError, message = 'Some details need a second look.') {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (path && !fields[path]) fields[path] = issue.message;
  }
  return fail(422, message, fields);
}

/**
 * Last line of defence. Logs the real error server-side and returns a sentence
 * that tells the client nothing about the stack.
 */
export function serverError(context: string, error: unknown) {
  console.error(`[${context}]`, error);
  return fail(500, 'Something went wrong at our end. Please try again shortly.');
}

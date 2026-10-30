import "server-only";

// Object layout inside the bucket (the bucket itself is dedicated to this app):
//
//   {userId}-{name}/{fileId}/{filename}      one top-level folder per registered user
//   temp/{anonymousSessionId}/{fileId}/{filename}   files opened without an account (auto-deleted)
//
// {userId} is the user's UUID, so folders never collide and ownership checks only need the UUID.
// {name} is a readable slug (the part of the email before the "@"), which doesn't change, so a
// user's files always stay together and are easy to recognise in the Cloudflare dashboard.

const ANONYMOUS_ROOT = "temp";

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function sanitizeSlug(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "user";
}

/** e.g. 3f2b8c1e-…-9a7d-john-doe/{fileId}/{filename} */
export function userFileKey(userId: string, userEmail: string, fileId: string, filename: string) {
  return `${userPrefix(userId, userEmail)}${fileId}/${sanitizeFilename(filename)}`;
}

/** e.g. temp/{anonymousSessionId}/{fileId}/{filename} */
export function anonymousFileKey(anonymousSessionId: string, fileId: string, filename: string) {
  return `${anonymousPrefix(anonymousSessionId)}${fileId}/${sanitizeFilename(filename)}`;
}

/** e.g. 3f2b8c1e-…-9a7d-john-doe/  (trailing slash included) */
export function userPrefix(userId: string, userEmail: string) {
  const name = sanitizeSlug(userEmail.split("@")[0] ?? "user");
  return `${userId}-${name}/`;
}

export function anonymousPrefix(anonymousSessionId: string) {
  return `${ANONYMOUS_ROOT}/${anonymousSessionId}/`;
}

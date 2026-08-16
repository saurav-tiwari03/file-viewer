import "server-only";

const ROOT_PREFIX = "File-Viewer";

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function sanitizeSlug(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "user";
}

/** e.g. File-Viewer/Temp/{anonymousSessionId}/{fileId}/{filename} */
export function anonymousFileKey(anonymousSessionId: string, fileId: string, filename: string) {
  return `${ROOT_PREFIX}/Temp/${anonymousSessionId}/${fileId}/${sanitizeFilename(filename)}`;
}

/** e.g. File-Viewer/Perm/{userName}-{userId}/{fileId}/{filename} */
export function userFileKey(userId: string, userEmail: string, fileId: string, filename: string) {
  const userName = sanitizeSlug(userEmail.split("@")[0] ?? "user");
  return `${ROOT_PREFIX}/Perm/${userName}-${userId}/${fileId}/${sanitizeFilename(filename)}`;
}

export function userPrefix(userId: string, userEmail: string) {
  const userName = sanitizeSlug(userEmail.split("@")[0] ?? "user");
  return `${ROOT_PREFIX}/Perm/${userName}-${userId}/`;
}

export function anonymousPrefix(anonymousSessionId: string) {
  return `${ROOT_PREFIX}/Temp/${anonymousSessionId}/`;
}

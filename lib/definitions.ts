import * as z from "zod";

export const SUPPORTED_MIME_TYPES = ["application/pdf", "text/markdown"] as const;
export const SUPPORTED_EXTENSIONS = [".pdf", ".md"] as const;

export const ANONYMOUS_MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const DEFAULT_STORAGE_QUOTA = 100 * 1024 * 1024; // 100MB
export const ANONYMOUS_FILE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
export const OTP_TTL_SECONDS = 10 * 60; // 10 minutes

export const PresignRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  mimetype: z.enum(SUPPORTED_MIME_TYPES),
  size: z.number().int().positive(),
});

export type PresignRequest = z.infer<typeof PresignRequestSchema>;

export const EmailSchema = z.email({ error: "Please enter a valid email." }).trim().toLowerCase();

export const RequestOtpSchema = z.object({
  email: EmailSchema,
});

export const VerifyOtpSchema = z.object({
  email: EmailSchema,
  code: z.string().length(6).regex(/^\d{6}$/, { error: "Code must be 6 digits." }),
});

export const UpdateNameSchema = z.object({
  name: z.string().trim().min(1, { error: "Please enter your name." }).max(100),
});

export function hasSupportedExtension(filename: string) {
  return SUPPORTED_EXTENSIONS.some((ext) => filename.toLowerCase().endsWith(ext));
}

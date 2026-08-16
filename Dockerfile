# syntax=docker/dockerfile:1

##### deps: install all dependencies (build needs devDependencies too) #####
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
# Skip lifecycle scripts here — postinstall copies the pdf.js worker into
# public/, which hasn't been copied into the build context yet at this point.
RUN npm ci --ignore-scripts


##### builder: generate the Prisma client and build the Next.js app #####
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Now that public/ exists, run the postinstall step (copies the pdf.js worker).
RUN npm run postinstall
# Generates lib/generated/prisma from prisma/schema.prisma — required before `next build`.
RUN npx prisma generate
RUN npm run build


##### runner: production image #####
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production

# public/ already has the pdf.js worker baked in from the builder's postinstall step.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY package.json package-lock.json ./

# Production-only install. `prisma` is a real dependency (not a devDependency)
# specifically so its CLI — and the correct schema-engine binary for this
# image's OS — is available here for `prisma migrate deploy` at container start.
RUN npm ci --omit=dev

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000
ENV PORT=3000

ENTRYPOINT ["./docker-entrypoint.sh"]

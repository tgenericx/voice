# ---- Build stage ----
FROM node:24 AS builder

WORKDIR /app

# Copy lockfiles first (better cache)
COPY package*.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm install --frozen-lockfile

# Copy prisma schema & generate client
COPY prisma ./prisma
RUN pnpm run db:generate

# Copy the rest of the project
COPY . .

# Build app
RUN pnpm run build


# ---- Production stage ----
FROM node:lts-alpine AS runner

WORKDIR /app
RUN npm i -g pnpm

# Copy runtime essentials
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated

# Install only production deps
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000
CMD ["pnpm", "run", "start:prod"]

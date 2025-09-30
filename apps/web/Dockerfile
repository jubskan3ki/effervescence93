# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.15.1 --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including dev for build)
RUN pnpm install --frozen-lockfile || pnpm install

# Copy application code
COPY . .

# Generate SvelteKit files before build
RUN pnpm exec svelte-kit sync

# Build the application with API URL from env
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=${VITE_API_URL}

# Build the application - Remove the || true to see actual errors
RUN pnpm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm in production
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package.json and install production dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# Copy built application from builder
# SvelteKit outputs to .svelte-kit by default with adapter-node
COPY --from=builder /app/.svelte-kit ./.svelte-kit
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json .
COPY --from=builder /app/static ./static

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV ORIGIN=http://localhost:3000

EXPOSE 3000

CMD ["node", "build"]

# Production-Ready Dockerfile for Video Streaming Backend
# Casey - Senior DevOps Engineer
# Optimized for Smart TV and enterprise video delivery

# Use Node.js 18 LTS Alpine for minimal attack surface and efficient size
FROM node:18-alpine AS base

# Install security updates and required system dependencies
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S streaming -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies in production mode
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY --chown=streaming:nodejs . .

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /app/tmp && \
    chown -R streaming:nodejs /app

# Security: Remove unnecessary files
RUN rm -rf \
    /app/coverage \
    /app/*.test.js \
    /app/jest.config.js \
    /app/test-endpoints.sh \
    /app/DEPLOYMENT_REPORT.md

# Switch to non-root user
USER streaming

# Expose port (configurable via environment)
EXPOSE 3001

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]

# Multi-stage build for development
FROM base AS development

# Switch back to root for dev dependencies installation
USER root

# Install development dependencies
RUN npm ci --include=dev

# Install additional development tools
RUN apk add --no-cache \
    git \
    bash \
    vim

# Switch back to streaming user
USER streaming

# Override CMD for development with hot reload
CMD ["npm", "run", "dev"]

# Production stage (default)
FROM base AS production

# Additional production optimizations
ENV NODE_ENV=production
ENV NPM_CONFIG_LOGLEVEL=warn

# Final security scan and cleanup
USER root
RUN npm audit --audit-level=high --omit=dev || true
USER streaming

# Production command
CMD ["node", "server.js"]
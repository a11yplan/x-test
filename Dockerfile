# Runtime stage
FROM mcr.microsoft.com/playwright:v1.49.1

USER root

RUN npm install -g bun@1.1.29

WORKDIR /app

COPY . ./

RUN bun install --production --no-frozen-lockfile
RUN bunx playwright install chromium

ENV NODE_ENV=production

# Start command
CMD ["bun", "x.js"]
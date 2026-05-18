FROM node:22-alpine AS base

WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.14.4 --activate

FROM base AS build

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base AS runtime

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts
COPY --from=build /app/.output ./.output
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/db ./db

USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]

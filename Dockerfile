FROM node:24-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS build-base

ARG app
RUN test -n "$app"

# Prevent husky from failing when .git is absent in the Docker build context
ENV HUSKY=0

RUN corepack enable

WORKDIR /build

COPY package.json pnpm-* ./
COPY apps/${app}/package.json apps/${app}/package.json
COPY libs/ libs/

RUN pnpm install --frozen-lockfile

COPY apps/${app}/ apps/${app}/

# Re-run lifecycle/prepare scripts now that full app source (e.g. nuxt.config.ts) is present
RUN pnpm --filter @europeana/${app} run --if-present postinstall && \
    pnpm --filter @europeana/${app} run --if-present prepare


FROM build-base AS build-app

ARG app

RUN pnpm --filter @europeana/${app} run build


FROM build-base AS build-storybook

ARG app

RUN pnpm --filter @europeana/${app} run build-storybook


FROM nginx:stable@sha256:a7675fcee220f59b4a99f7098c06a0d5d999c2c0ee37c0211efb780536e5cb20 AS run-storybook
ARG app

COPY --from=build-storybook /build/apps/${app}/storybook-static /usr/share/nginx/html
RUN ls /usr/share/nginx/html/


FROM gcr.io/distroless/nodejs24-debian13@sha256:24bc0fe0225c7518f202a822587dad74fe143b96326b81fe5cc08c1df8bed03e AS run-app
ARG app

ENV PORT=8080

EXPOSE ${PORT}

WORKDIR /app

COPY --from=build-app /build/apps/${app}/.output .

USER 1000

CMD ["./server/index.mjs"]

###
# Stage: Build base
#

FROM node:24-alpine@sha256:116b800c3754b440ee0aa3ed2f20f5bf3d99a554bfd9adeea09ea8017f6e85f5 AS build-base

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

#
###


###
# Stage: Build storybook
#

FROM build-base AS build-storybook

ARG app

RUN pnpm --filter @europeana/${app} run build-storybook

#
###


###
# Stage: Run storybook
#

FROM nginx:stable@sha256:755983e0e0e568e4c86297cc91485d7a6f9fb73e42d8a19cdba3eac9e8b8cfc9 AS run-storybook

ARG app

COPY --from=build-storybook /build/apps/${app}/storybook-static /usr/share/nginx/html

#
###



###
# Stage: Build app
#

FROM build-base AS build-app

ARG app

RUN pnpm --filter @europeana/${app} run build

#
###



###
# Stage: Run app
#

FROM gcr.io/distroless/nodejs24-debian13@sha256:235cae47d37e0ba4ab70a723ed0bfd4f619c04d16d4226371d5d0c71a52f9211 AS run-app
ARG app

ENV PORT=8080

EXPOSE ${PORT}

WORKDIR /app

COPY --from=build-app /build/apps/${app}/.output .

USER 1000

CMD ["./server/index.mjs"]

#
###
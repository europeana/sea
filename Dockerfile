FROM node:24-alpine@sha256:156b55f92e98ccd5ef49578a8cea0df4679826564bad1c9d4ef04462b9f0ded6 AS build-base

ARG app
# TODO: read this from package.json
ARG pnpm_version=10.7.1

RUN wget -qO /bin/pnpm "https://github.com/pnpm/pnpm/releases/download/v${pnpm_version}/pnpm-linuxstatic-x64"
RUN chmod +x /bin/pnpm

RUN test -n "$app"

WORKDIR /build

RUN mkdir -p packages/apps/${app}

COPY package.json pnpm-* ./
COPY packages/apps/${app}/package.json ./packages/apps/${app}/
COPY packages/directives packages/layers packages/plugins packages/

RUN pnpm install

COPY packages/apps/${app}/ packages/apps/${app}/


FROM build-base AS build-app

ARG app

RUN pnpm --filter @europeana/${app} run build


FROM build-base AS build-storybook

ARG app

RUN pnpm --filter @europeana/${app} run build-storybook


FROM nginx:stable@sha256:07fc471b4aa8dc03f312fbd506381b7b84aeb99e48d040aa0593e8c37cdcb154 AS run-storybook
ARG app

COPY --from=build-storybook /build/packages/apps/${app}/storybook-static /usr/share/nginx/html
RUN ls /usr/share/nginx/html/


FROM gcr.io/distroless/nodejs24-debian12 AS run-app
ARG app

ENV PORT=8080

EXPOSE ${PORT}

WORKDIR /app

COPY --from=build-app /build/packages/apps/${app}/.output .

USER 1000

CMD ["./server/index.mjs"]

ARG node_version=22

FROM node:${node_version}-alpine AS build-base

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
COPY packages/directives/ packages/
COPY packages/plugins/ packages/

RUN pnpm install

COPY packages/apps/${app}/ packages/apps/${app}/


FROM build-base AS build-app

ARG app

RUN pnpm --filter @europeana/${app} run build


FROM build-base AS build-storybook

ARG app

RUN pnpm --filter @europeana/${app} run build-storybook


FROM nginx:stable AS run-storybook
ARG app

COPY --from=build-storybook /build/packages/apps/${app}/storybook-static /usr/share/nginx/html
RUN ls /usr/share/nginx/html/


FROM gcr.io/distroless/nodejs${node_version}-debian12 AS run-app
ARG app

ENV PORT=8080

EXPOSE ${PORT}

WORKDIR /app

COPY --from=build-app /build/packages/apps/${app}/.output .

USER 1000

CMD ["./server/index.mjs"]

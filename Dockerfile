ARG node_version=22

FROM node:${node_version}-alpine AS build

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

RUN pnpm --filter @europeana/${app} install

COPY packages/apps/${app}/ packages/apps/${app}/

RUN pnpm --filter @europeana/${app} run build


FROM gcr.io/distroless/nodejs${node_version}-debian12
ARG app

ENV PORT=8080

EXPOSE ${PORT}

WORKDIR /app

COPY --from=build /build/packages/apps/${app}/.output .

USER 1000

CMD ["./server/index.mjs"]

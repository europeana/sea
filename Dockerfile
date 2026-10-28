FROM node:24-alpine@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53 AS build-base

ARG app

# TODO: use the official installer script instead
#       @see https://pnpm.io/installation#in-a-docker-container
RUN wget -q "https://github.com/pnpm/pnpm/releases/download/v11.8.0/pnpm-linux-x64-musl.tar.gz"
RUN tar -xf pnpm-linux-x64-musl.tar.gz
RUN mv pnpm dist /bin/

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


FROM nginx:stable@sha256:a7675fcee220f59b4a99f7098c06a0d5d999c2c0ee37c0211efb780536e5cb20 AS run-storybook
ARG app

COPY --from=build-storybook /build/packages/apps/${app}/storybook-static /usr/share/nginx/html
RUN ls /usr/share/nginx/html/


FROM gcr.io/distroless/nodejs24-debian13@sha256:51eee69b25037942014428da85f5b436a4d88f283e545981d03f25b7db72469a AS run-app
ARG app

ENV PORT=8080

EXPOSE ${PORT}

WORKDIR /app

COPY --from=build-app /build/packages/apps/${app}/.output .

USER 1000

CMD ["./server/index.mjs"]

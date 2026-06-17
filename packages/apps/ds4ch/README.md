# Data space for cultural heritage website

## Requirements

1. Node.js version 22, and pnpm
2. [Contentful](https://www.contentful.com/) CMS account

## Configuration

Configuration options can be set in a .env file (see [.env.example](./.env.example))
or via ENV variables on your machine.

Some core features such as editorial content require the
relevant configuration options to be specified. In particular, pay attention to the Contentful sections in the example .env file.

## Usage

To run from this directory.

```shell

# install package dependencies
pnpm install

# serve with hot reload at localhost:3000
pnpm dev

# build for production and launch preview server
pnpm build
pnpm nuxt preview
```

### Docker

To run the app via docker, refer to the [README](../../../README.md) in the base of this repo.

## Testing

Refer to the [README](../../../README.md) in the base of this repo.

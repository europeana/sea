# Europeana Service Experience Architecture (SEA)

[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=europeana_sea&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=europeana_sea)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=europeana_sea&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=europeana_sea)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=europeana_sea&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=europeana_sea)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=europeana_sea&metric=coverage)](https://sonarcloud.io/summary/new_code?id=europeana_sea)

## Docker

A multi-purpose [Dockerfile](./Dockerfile) is included to build any of the
[apps](./packages/apps/).

Usage:

```sh
app=ds4ch
docker build --build-arg app=${app} -t europeana/${app} .
docker run -i --rm --name europeana_${app} -p 8080:8080 europeana/${app}
```

The app will now be available at http://localhost:8080/

## License

Licensed under the [EUPL v1.2](./LICENSE.md).

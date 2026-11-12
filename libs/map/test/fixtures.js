const features = [
  {
    type: "Feature",
    id: "http://data.europeana.eu/organization/1",
    geometry: {
      type: "Point",
      coordinates: [18.2924425, 57.6396512],
    },
  },
  {
    type: "Feature",
    id: "http://data.europeana.eu/organization/2",
    geometry: {
      type: "Point",
      coordinates: [18.0653779, 59.329777],
    },
  },
  {
    type: "Feature",
    id: "http://data.europeana.eu/organization/3",
    geometry: {
      type: "Point",
      coordinates: [18.065378, 59.32978],
    },
  },
];

export const fixtures = {
  onePointFeatureCollection: {
    type: "FeatureCollection",
    features: [features[0]],
  },
  twoPointsFeatureCollection: {
    type: "FeatureCollection",
    features: [features[0], features[1]],
  },
  multiplePointsFeatureCollection: {
    type: "FeatureCollection",
    features,
  },
  url: "https://example.org/geo.json",
};

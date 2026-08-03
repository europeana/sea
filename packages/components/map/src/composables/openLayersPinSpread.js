import { toRef } from "vue";

import Feature from "ol/Feature.js";
import Point from "ol/geom/Point.js";
import LineString from "ol/geom/LineString.js";
import Stroke from "ol/style/Stroke.js";
import Style from "ol/style/Style.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

export const useOpenLayersPinSpread = ({
  getSingleFeatureStyleMinDimension,
  map,
  styleSingleFeature,
} = {}) => {
  const mapRef = toRef(map);

  let spreadLayer;
  let spreadSource;

  const initSpreadLayer = () => {
    spreadSource = new VectorSource();
    spreadLayer = new VectorLayer({
      source: spreadSource,
      style: styleSingleFeature,
      zIndex: 2, // TODO: is this needed?
    });
    mapRef.value.addLayer(spreadLayer);
  };

  const degreesToRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };

  const getNewCoordinates = (geometry, distance, angle) => {
    const originalCoordinates = geometry.getCoordinates();
    const originalPixel =
      mapRef.value.getPixelFromCoordinate(originalCoordinates);

    const displacementX = distance * Math.sin(angle);
    const displacementY = distance * Math.cos(angle);

    const newPixel = [
      originalPixel[0] + displacementX,
      originalPixel[1] + displacementY,
    ];
    return mapRef.value.getCoordinateFromPixel(newPixel);
  };

  const moveGeometry = (geometry, distance, angle) => {
    const newCoordinates = getNewCoordinates(geometry, distance, angle);

    geometry.setCoordinates(newCoordinates);
  };

  // add cloned features for multiple features at the same co-ordinates as spokes coming from
  // a dot at the centre point (the original co-ordinates) to a marker for
  // each of the features moved away from the centre in a different direction
  const spreadCluster = async (originalFeatures) => {
    if (!spreadLayer) {
      initSpreadLayer();
    }
    // clear features from the vector source
    spreadSource.clear();
    // reset listener to preven duplicate addition
    mapRef.value.un("moveend", () => resetSpreadCluster(originalFeatures));

    // calculate new coordinates and add cloned features
    const distance = getSingleFeatureStyleMinDimension() * 1.5; // in pixels
    const unitAngle = degreesToRadians(360) / originalFeatures.length;

    originalFeatures.forEach((feature, index) => {
      const angle = unitAngle * index;
      const pointGeometry = feature.getGeometry().clone();
      const originalCoordinates = pointGeometry.getCoordinates();
      moveGeometry(pointGeometry, distance, angle);
      const newCoordinates = pointGeometry.getCoordinates();

      const featureClone = new Feature({
        geometry: new Point(newCoordinates),
        name: feature.get("name"),
      });

      const line = new Feature(
        new LineString([originalCoordinates, newCoordinates]),
      );

      line.setStyle(
        new Style({
          stroke: new Stroke({
            color: "#000",
            width: 1,
          }),
        }),
      );

      spreadSource.addFeature(line);
      spreadSource.addFeature(featureClone);

      // Set custom expanded prop so the spread features can be recognised and styles appropriately
      feature.set("expanded", true);
    });

    mapRef.value.on("moveend", () => resetSpreadCluster(originalFeatures));
  };

  // Recalculate or re-cluster the spread cluster
  // FIXME: on subsequent spread pin clicks new spread clusters are create per pin
  const resetSpreadCluster = (originalExpandedFeatures) => {
    const zoom = mapRef.value.getView().getZoom();

    if (zoom >= 19) {
      spreadCluster(originalExpandedFeatures);
    } else {
      originalExpandedFeatures.forEach((originalFeature) =>
        originalFeature.unset("expanded"),
      );
      spreadSource.clear();
    }
  };

  return { spreadCluster };
};

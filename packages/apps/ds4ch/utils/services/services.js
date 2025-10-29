// TODO review all provider schemes
import twoD from "./definitions/2D.json";
import threeD from "./definitions/3D.json";
import audio from "./definitions/audio.json";
import ds4ch from "./definitions/ds4ch.json";
import socialMedia from "./definitions/socialMedia.json";
import video from "./definitions/video.json";
import * as callbacks from "./callbacks/index.js";

const definitions = {
  "2D": twoD,
  "3D": threeD,
  audio,
  ds4ch,
  socialMedia,
  video,
};

const parseDefinitions = (purpose) =>
  definitions[purpose].map((service) => {
    if (!service.purposes) {
      service.purposes = [purpose];
    }
    if (service.cookies) {
      service.cookies = []
        .concat(service.cookies)
        .map((cookie) => new RegExp(cookie));
    }
    return service;
  });

const mediaViewingServices = [
  ...parseDefinitions("2D"),
  ...parseDefinitions("3D"),
  ...parseDefinitions("audio"),
  ...parseDefinitions("video"),
].map((service) => ({
  ...service,
  purposes: ["mediaViewing", ...service.purposes],
}));

const thirdPartyServices = [
  ...parseDefinitions("socialMedia"),
  ...mediaViewingServices,
].map((service) => ({
  ...service,
  purposes: ["thirdPartyContent", ...service.purposes],
}));

// TODO comment out thirdPartyServices before merge
// TODO add ...thirdPartyServices when embed gateway is in place
const services = [...parseDefinitions("ds4ch"), ...thirdPartyServices];

const essentialServicesNames = services
  .filter((s) => s.required)
  .map((s) => s.name);

const allServicesNames = services.map((s) => s.name);

const handleCallbacks = (acceptedServices) => {
  for (const service in callbacks) {
    callbacks[service](acceptedServices.includes(service));
  }
};

export { services, essentialServicesNames, allServicesNames, handleCallbacks };

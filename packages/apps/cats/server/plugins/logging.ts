import morgan from "morgan";

export default defineNitroPlugin((nitroApp) => {
  // Use morgan for request logging
  const logger = morgan("combined");

  nitroApp.hooks.hook("beforeResponse", (event) =>
    logger(event.node.req, event.node.res),
  );
});

const { Issuer } = require("openid-client");
const { generators } = require("openid-client");

var client,
  sapIssuer,
  initialized = false;

async function initClient() {
  try {
    checkConfigParams();
    sapIssuer = await Issuer.discover(process.env.issuer);
    console.log("Discovered issuer %s %O", sapIssuer.issuer, sapIssuer.metadata);

    client = new sapIssuer.Client({
      client_id: process.env.client_id,
      client_secret: process.env.client_secret,
      redirect_uris: [process.env.redirect_uris],
      response_types: ["code"]
    });

    initialized = true;
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

function isReady() {
  return initialized;
}

function checkConfigParams() {
  if (
    process.env.issuer === undefined ||
    process.env.client_id === undefined ||
    process.env.client_secret === undefined ||
    process.env.redirect_uris === undefined
  ) {
    const message =
      "The OIDC configuration is missing one of the following parameters: issuer, client_id, client_secret, or redirect_uris";
    console.log(message);
    throw new Error(message);
  }
}

function getLogoutUrl() {
  return sapIssuer.end_session_endpoint;
}

function isAuthenticated(req, res, next) {
  const d = new Date();
  const now = (d.getTime() - d.getMilliseconds()) / 1000;
  var isAuthRequired = true;

  if (req.session.tokenSet && req.session.tokenSet.id_token) {
    isAuthRequired = req.session.tokenSet.expires_at < now;
  } else {
    isAuthRequired = true;
  }

  if (isAuthRequired) {
    const state = generators.random();
    const authUrl = client.authorizationUrl({ state });

    req.session.state = state;
    console.log("Calling authUrl: ", authUrl);
    req.session.returnTo = "/";
    res.redirect(authUrl);
  } else {
    next();
  }
}

function oAuthCallback(req, res, next) {
  const params = client.callbackParams(req);
  const state = req.session.state;
  client.callback(process.env.redirect_uris, params, { state }).then(
    function(tokenSet) {
      req.session.tokenSet = tokenSet;
      req.session.tokenSet.claims = tokenSet.claims();
      console.log(req.session.tokenSet);
      res.redirect(req.session.returnTo || "/");
      delete req.session.returnTo;
    },
    function(err) {
      console.log("An error occured: ", err);
      next(err);
    }
  );
}

module.exports = {
  initClient,
  getLogoutUrl,
  isAuthenticated,
  oAuthCallback,
  isReady
};

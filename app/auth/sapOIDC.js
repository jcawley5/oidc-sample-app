const {Issuer} = require("openid-client");
const {generators} = require("openid-client");

var client,
  sapIssuer,
  initialized = false;

async function initClient() {
  try {
    checkConfigParams();
    const issuerUrl = process.env.idp_url;
    sapIssuer = await Issuer.discover(issuerUrl);
    console.log("Discovered issuer %s %O", sapIssuer.issuer, sapIssuer.metadata);

    //token_endpoint_auth_method: client_secret_basic - may cause an issue due to the encoding of the client_secret
    //if special characters exist
    //xsuaa: client_secret_post
    //sapias:client_secret_basic
    //https://tools.ietf.org/html/rfc6749#section-2.3.1
    client = new sapIssuer.Client({
      client_id: process.env.idp_clientid,
      client_secret: process.env.idp_clientsecret,
      redirect_uris: [process.env.redirect_uri],
      response_types: ["code"],
      token_endpoint_auth_method: process.env.token_endpoint_auth_method || "client_secret_basic",
    });

    initialized = true;

    console.log(client);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

function isReady() {
  return initialized;
}

function checkConfigParams() {
  console.log(process.env.idp_url);
  console.log(process.env.idp_clientid);
  console.log(process.env.idp_clientsecret);
  console.log(process.env.redirect_uri);
  if (
    process.env.idp_url === undefined ||
    process.env.idp_clientid === undefined ||
    process.env.idp_clientsecret === undefined ||
    process.env.redirect_uri === undefined
  ) {
    const message =
      "The OIDC configuration is missing one of the following parameters: idp_url, idp_clientid, idp_clientsecret, or redirect_uri";
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
    const authUrl = client.authorizationUrl({});

    console.log("Calling authUrl: ", authUrl);
    req.session.returnTo = "/";
    res.redirect(authUrl);
  } else {
    next();
  }
}

function oAuthCallback(req, res, next) {
  const params = client.callbackParams(req);

  client
    .callback(
      process.env.redirect_uri,
      params,
      {},
      {
        exchangeBody: {
          client_id: process.env.client_id,
          client_secret: process.env.client_secret,
          scope: "openid",
        },
      }
    )
    .then(
      function (tokenSet) {
        req.session.tokenSet = tokenSet;
        req.session.tokenSet.claims = tokenSet.claims();
        console.log(req.session.tokenSet);
        res.redirect(req.session.returnTo || "/");
        delete req.session.returnTo;
      },
      function (err) {
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
  isReady,
};

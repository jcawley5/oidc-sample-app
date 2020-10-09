## Blog

https://blogs.sap.com/2020/04/22/sap-cloud-platform-extension-factory-kyma-runtime-open-id-connect-authentication/

## Setup

Clone the repository

### Setup SAP IAS application

Configure a SAP IAS application using open id connect.

### Setup XSUAA

Provision ***Authorization & Trust Management*** service as plan type ***application*** with parameter value:

```yaml
{
  "oauth2-configuration": {
    "redirect-uris": [
      "https://oidc-sample-app.<cluster url>/oauth/callback"
    ],
    "token-validity": 900
  },
  "xsappname": "oidc-sample-app"
}
```
binding service instance to app with prefix: ***idp_***

### Setup Kyma funtion

Within the `kyma` directory

Deploy `orders-api.yaml` to Kyma cluster in your desired namespace. This will create a lambda function which is exposed externally with an unsecured API. The API url will be in the format of

`https://orders-list-api.<cluster name>`

### Setup Nodejs app

Within the `app` directory

Run `npm install`

Rename `.env_sample` to `.env` and define values for the parameters.

### Scenario 1: Run secured app locally with unsecured API

Within the `kyma` directory

Run `npm start` which will expose the app at `http://localhost:3000`

### Scenario 2: Run secured app locally with secured API

Open the namespace where the Kyma deployment was applied and choose the API Rules menu option. Choose the `orders-list-api` and choose the edit option. Change the access strategies to use JWT, choose the default option and provide the following values and save the changes.

- Issuers: `<SAP IAS Issuer>`
- JWKS URI: `<SAP IAS Issuer>/oauth2/certs`

Verify that the change has taken place by using an incognito browser window or another browser. Once the change has been applied you should receive the error `Origin authentication failed.` in the browser.

....

### Scenario 3: Run secured app within Kyma

Modify the .env to

- **redirect_uri:** `https://oidc-sample-app.<cluster-name>/oauth/callback`
- **api_endpoint:** `http://orders-list-api.<namespace>.svc.cluster.local`

Create a config map from the .env file - if using a service binding remove all but **redirect_uri**, **api_endpoint** and **token_endpoint_auth_method**
`kubectl create configmap oidc-sample-app-config -n <namespace> --from-env-file=.env`

Deploy the sample app using only values from config map
`kubectl apply -f deployment-cm.yaml -n <namespace>`

Deploy the sample app using config map and servicebinding
`kubectl apply -f deployment-servicebinding.yaml -n <namespace>`

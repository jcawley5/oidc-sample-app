## Setup

Clone the repository

### Setup SAP IAS application

Configure a SAP IAS application using open id connect.

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

Open the namespace where the Kyma deployment was applied and choose the APIs menu option. Choose the `orders-list-api` and check the box the enable the `Secure API` option. Provide the following values and save the changes.

- Issuers: `<SAP IAS Issuer>`
- JWKS URI: `<SAP IAS Issuer>/oauth2/certs`

Verify that the change has taken place by using an incognito browser window or another browser. Once the change has been applied you should receive the error `Origin authentication failed.` in the browser.

....

### Scenario 3: Run secured app within Kyma

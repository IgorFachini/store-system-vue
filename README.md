# store-system (store-system-vue)

A Quasar Framework app, made for simple stores.

Database: Firestore Database Only
## User to testing in live preview (fake)

Email: staging@staging.com

Password: staging

## Example dev  firebase variables, .env file

```
FIREBASE_API_KEY=variable
FIREBASE_PROJECT_ID=variable
FIREBASE_DATABASE_URL=variable
```
### Optional
```
FIREBASE_AUTH_DOMAIN=variable
FIREBASE_STORAGE_BUCKET=variable
FIREBASE_MESSAGING_SENDER_ID=variable
FIREBASE_APP_ID=variable
FIREBASE_MEASUREMENT_ID=variable
```

# Firebase Query Search

In home, have a search by date, to it works, need configure a [index](https://console.cloud.google.com/firestore/indexes/composite), for sales and expenses, fields createdAt and date
## Install the dependencies
```bash
yarn
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Lint the files
```bash
yarn run lint
```

### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://v2.quasar.dev/quasar-cli/quasar-conf-js).

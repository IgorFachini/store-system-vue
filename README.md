# store-system (store-system-vue)

A Quasar Framework app, made for simple stores.

Focused on salespeople who sell products to customers.

Database: Firestore Database Only

## Functionalities

+ All pages protected
+ Authentication by email registered in firebase, multi users support
+ PWA support
+ All data is saved offline when pwa is installed, and updated in real time when connected to the “internet”

+ Language support (i18n)
    + English
    + Portuguese

<br>

+ Home Dashboard
+ CRUD (Create, Read, Update, Delete)
    + Customers
    + Products
    + Categories
    + Expenses Products
    + Expenses

<br>

+ Stock history
    + Expense Products
    + Products

<br>

+ Cash Flow (Fast Sales, Purchases, Payments, Quick Exit)
    + All Cash Flow
    + Customer cash flow

<br>

+ Shopping cart (List products)
    + Discounts in % porcentage and $ value
    + Custom Sale Value
    + Option to reduce product stock

<br>

+ Recipe for product (Materials from the expense product list that make up the product.)
    + Option for when product inventory increases, decrease inventory of expense products used in the product.


## User to testing in live preview (fake)

Email: staging@staging.com

Password: staging

## Example dev  firebase variables, .env file

```
FIREBASE_API_KEY=variable
FIREBASE_PROJECT_ID=variable
```
### Optional
```
FIREBASE_DATABASE_URL=variable
FIREBASE_AUTH_DOMAIN=variable
FIREBASE_STORAGE_BUCKET=variable
FIREBASE_MESSAGING_SENDER_ID=variable
FIREBASE_APP_ID=variable
FIREBASE_MEASUREMENT_ID=variable
```

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


### Backup model JSON file example to import
- backup.json

### Database model example
- database.model.json

## Utils Firebase commands
### Exporting data from Firestore

1. Open the [Firebase Console](https://console.firebase.google.com/u/0/).
2. Navigate to your project and click the gear icon next to the “Project Overview” heading.
3. Click the “Project Settings” button.
4. In the “Service accounts” tab, click the “Generate new private key” button. This will download a JSON file with your Firebase project’s configuration.
5. Rename the downloaded file to appConfig.json.
6. Open a terminal and navigate to the directory where you want to save the exported JSON file. Make sure the above file you just renamed exists in the same directory as well.
7. Run the following command to export data from your Firestore database:

### Delete all data from Firestore
1. [Firebase CLI](https://firebase.google.com/docs/cli?hl=pt-br)
2. Login on CLI
3. Run command
```bash
firebase firestore:delete --all-collections --project [PROJECT_ID]
```

### Import data from JSON file to Firestore
1. Run command
```bash
 npx -p node-firestore-import-export firestore-import -a appConfig.json -b backup.json
```

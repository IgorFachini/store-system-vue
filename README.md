# store-system (store-system-vue)

A Quasar Framework app, made for simple stores.

Focused on sales people who sell products to customers.

Database: Firestore Database Only

## User to testing in live preview (fake)

- Link: [https://store-system-vue-stage.vercel.app/](https://store-system-vue-stage.vercel.app/)
- Email: staging@staging.com
- Password: staging

## Functionalities

+ All pages protected
+ Authentication by email registered in firebase, multi users support
+ PWA support
+ All data is saved offline when pwa is installed, and updated in real time when connected to the “internet” (Not working)

+ Language support (i18n)
    + English
    + Portuguese

<br>

### Pages

+ Home Dashboard: Total Resume of all cash flow
    + Paid purchases: Total of all purchases paid by the customer
    + Unpaid purchases: Total of all purchases unpaid by the customer
    + Payments: Total of all payments by the customer
    + Expenses: Total of all expenses

+ CRUD (Create, Read, Update, Delete)
    + Customers
    + Products
    + Expenses: Products purchased for resale are considered expenses
      - (It is necessary to register products and suppliers to register expenses)
    + Suppliers: Restock products for resale

<br>

+ Stock history: Hisotry of all stock changes
    + Products

<br>

+ Cash Flow (Fast Sales, Purchases, Payments, Quick Exit):
    + All Cash Flow: All entries and exits of money

<br>

+ Shopping cart (List products)
    + Discounts in % porcentage and $ value
    + Custom Sale Value
    + Option to reduce product stock

<br>

## Example dev  firebase variables, .env file

```
FIREBASE_API_KEY=variable
FIREBASE_PROJECT_ID=variable
```
### Optional
```
<!-- Necessary if you want to use firebase storage -->
FIREBASE_STORAGE_BUCKET=variable

--------------------------------------------
FIREBASE_DATABASE_URL=variable
FIREBASE_AUTH_DOMAIN=variable
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

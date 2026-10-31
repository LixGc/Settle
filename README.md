# Settle

Settle is a mobile app for renting rooms and homes in Sydney. Guests search by suburb, book dates and pay by card. Hosts list their places, confirm stays and see what they've earned.

The project has two parts:

- **`server`**: the REST API (Node.js, Express, Sequelize, PostgreSQL)
- **`client`**: the mobile app (React Native with Expo, Redux)

## Features

**Guests**
- Sign up, then log in with a password and a 4-digit code sent by email
- Browse places by category, see what's trending, and search by suburb and dates
- Place pages with a photo gallery, description, amenities, reviews and a map of the area
- Book dates (a place can't be double booked) and pay by card with Stripe; an invoice is emailed after paying
- The exact street address only shows once the stay is paid
- Chat with hosts
- Leave a review after a completed stay
- Profile with a photo and ID

**Hosts**
- List a place with photos, a suburb from a list of 688 Sydney suburbs, a street address, a description and amenities
- Edit or remove listings
- See bookings at their places and mark stays as completed
- See their earnings and the reviews of their places

## Tech stack

| Part | Built with |
| --- | --- |
| Mobile app | Expo SDK 58, React Native 0.88, React Navigation, Redux with redux-thunk, Axios, react-native-maps |
| API | Node.js, Express, Sequelize, PostgreSQL, JSON Web Tokens, bcrypt, Multer |
| Services | Cloudinary (photos), Stripe Checkout (payments), Stream (chat), Gmail with Nodemailer (emails), OpenStreetMap Nominatim (map locations) |
| Testing | Jest, Supertest, Jenkins |

## What to download

- [Node.js](https://nodejs.org) 20.19 or newer (built with Node 24)
- [PostgreSQL](https://www.postgresql.org/download/) (built with version 18). Remember the password you set for the `postgres` user.
- [Git](https://git-scm.com)
- **Expo Go** on your phone, from the App Store or Google Play
- Optional: [ngrok](https://ngrok.com), for when your phone and computer can't be on the same Wi-Fi

You also need these free accounts for the API keys:

| Service | Used for | What you need from it |
| --- | --- | --- |
| Gmail | Sending login codes and invoices | An **app password**: Google Account → Security → 2-Step Verification → App passwords |
| [Cloudinary](https://cloudinary.com) | Storing photos | Cloud name, API key and API secret from the dashboard |
| [Stripe](https://stripe.com) | Card payments | The **test mode** secret key (starts with `sk_test_`) from Developers → API keys |
| [Stream](https://getstream.io) | Chat | Create a Chat app, then copy its API key and secret |

## Getting the code

```bash
git clone https://github.com/LixGc/Settle.git
cd Settle
```

## Setting up the server

1. Install the packages:
   ```bash
   cd server
   npm install
   ```
2. Copy the example env file and fill it in:
   ```bash
   cp .env-example .env
   ```

   | Variable | What to put |
   | --- | --- |
   | `PORT` | `3000` |
   | `JWT_SECRET` | Any long random text, used to sign login tokens |
   | `DB_USERNAME` | Your Postgres user, usually `postgres` |
   | `DB_PASSWORD` | Your Postgres password |
   | `DB_HOST` | `127.0.0.1` |
   | `DB_PORT` | `5432` |
   | `DB_NAME` | `settle_dev` |
   | `DB_NAME_TEST` | `settle_test` (used by the tests) |
   | `EMAIL_USER` | The Gmail address that sends the emails |
   | `EMAIL_PASS` | That Gmail account's **app password**, not its normal password |
   | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | From your Cloudinary dashboard |
   | `STRIPE_SECRET_KEY` | Your Stripe test secret key |
   | `STREAM_API_KEY`, `STREAM_API_SECRET` | From your Stream app |

3. Create the databases (`settle_dev` and `settle_test`) and their tables:
   ```bash
   npm run db:create
   npm run db:migrate
   ```
4. Add the sample data:
   ```bash
   npm run db:seed
   ```
   This adds 688 Sydney suburbs, 5 categories, 20 users, 40 places with photos, 97 past stays and 84 reviews.
5. Start the API:
   ```bash
   npm run dev
   ```
   You should see `Settle API listening on port 3000`.

To reset the sample data (this also deletes any accounts you made):

```bash
npx sequelize-cli db:seed:undo:all
npm run db:seed
```

## Setting up the app

1. Install the packages:
   ```bash
   cd client
   npm install
   ```
2. Copy the example env file:
   ```bash
   cp .env-example .env
   ```
   Set `EXPO_PUBLIC_API_URL` to your computer's address on the Wi-Fi, for example `http://192.168.1.111:3000`.
   - On Windows, run `ipconfig` and use the **IPv4 Address** of your Wi-Fi adapter. A `192.168.56.x` address belongs to VirtualBox, and your phone can't reach it.
   - Don't use `localhost`: on the phone, that means the phone itself.
3. Start Expo:
   ```bash
   npx expo start
   ```
   After changing `.env`, restart with `npx expo start -c` so the new address is used.
4. Open the app on your phone. On iPhone, scan the QR code with the Camera app. On Android, scan it from Expo Go.

Your phone and computer need to be on the same Wi-Fi. If the network blocks this (school or campus Wi-Fi often does):

- Start the app with `npx expo start --tunnel`.
- Share the API with `ngrok http 3000`, then put the `https://...` address ngrok gives you in `client/.env`.

The first time Node runs, Windows may ask whether to allow it on the network. Allow it on private networks.

## Trying it out

- **Make your own account** with a real email address, because the login code is emailed to you. Passwords need at least 8 characters, a capital letter, a number and a special character.
- **Sample accounts** (`sam@mail.com`, `alex@mail.com`, ...) all use the password `password123`. Their emails are made up, so the code never arrives. To log in as one, tap Log In, then read the code from the database:
  ```sql
  SELECT otp FROM "Users" WHERE email = 'sam@mail.com';
  ```
- **Test card for payments:** `4242 4242 4242 4242`, any future expiry date, any CVC.
- **A full booking:** book a place as a guest and pay. The host then sees it under Guest bookings and marks it as completed, and the amount is added to the host's earnings. After that, the guest can leave a review.

## Running the tests

```bash
cd server
npm test
```

- 111 tests in `server/__test__` (Jest and Supertest) cover accounts, places, bookings and payments, reviews and chat.
- The tests use the test database (`DB_NAME_TEST`), so run `npm run db:migrate` first.
- Email, Cloudinary, Stripe, Stream and the map lookups are mocked, so the tests only need the `DB_` settings and `JWT_SECRET` in `.env`.
- The coverage report is saved to `server/coverage/lcov-report/index.html`.

## Continuous integration (Jenkins)

The `Jenkinsfile` in the project root runs the server tests on every new commit to the `server` branch. Jenkins checks GitHub every 5 minutes.

| Stage | What it does |
| --- | --- |
| Install | `npm ci` in the `server` folder |
| Test database | Creates `settle_test_jenkins` if it doesn't exist yet, then runs the migrations |
| Unit tests | Runs all the tests and saves a JUnit report |

After every build, Jenkins shows each test's result on the build page and keeps the coverage report.

**Setting up Jenkins**

1. Install Java 21 and Jenkins LTS. Make sure these plugins are installed: Pipeline, Git, JUnit, Credentials Binding and Pipeline: Stage View.
2. Node.js and PostgreSQL must be installed on the same computer, with `node` and `npm` on the PATH.
3. Add the database password: **Manage Jenkins → Credentials → System → Global credentials → Add Credentials**. Choose **Secret text**, put your Postgres password in **Secret**, and set **ID** to `settle-db-password`.
4. Tell Jenkins where Postgres is: **Manage Jenkins → System → Global properties → Environment variables**. Add `DB_HOST` = `127.0.0.1`, `DB_PORT` = `5432` and `DB_USERNAME` = `postgres`.
5. Create the job: **New Item** → name it `settle-backend` → **Pipeline**. Under Pipeline, choose **Pipeline script from SCM**, then:
   - SCM: **Git**
   - Repository URL: `https://github.com/LixGc/Settle.git`
   - Branch: `*/server`
   - Script Path: `Jenkinsfile`
6. Click **Build Now** once. This first build also turns on the 5-minute check.

On the development PC, Jenkins runs from `C:\Jenkins\start-jenkins.cmd` at http://localhost:8080.

## API

Routes marked 🔒 need the login token in an `access_token` header.

**Accounts**

| Method | Route | What it does |
| --- | --- | --- |
| POST | `/register` | Create an account |
| POST | `/otp` | Check the email and password, then email a login code |
| POST | `/login` | Email, password and code → `access_token` |
| GET | `/profiles` 🔒 | My account, profile, bookings and earnings |
| POST | `/profiles` 🔒 | Add a profile photo and ID (form data) |
| PUT | `/profiles` 🔒 | Replace the profile photo and ID |
| DELETE | `/profiles` 🔒 | Delete my account |

**Places**

| Method | Route | What it does |
| --- | --- | --- |
| GET | `/properties` | All places, or search with `?location=&startdate=&enddate=` |
| GET | `/properties/locations` | Suburbs with places, for Explore |
| GET | `/properties/my-properties` 🔒 | My listings |
| GET | `/properties/:id` | One place |
| POST | `/properties` 🔒 | List a place (form data with `image` and `images`) |
| PUT | `/properties/:id` 🔒 | Edit my place |
| DELETE | `/properties/:id` 🔒 | Remove my place |
| GET | `/categories` | Place categories |
| GET | `/suburbs?search=` | Suburb suggestions for the listing form |
| GET | `/trending` | Most booked places |

**Bookings and payments**

| Method | Route | What it does |
| --- | --- | --- |
| GET | `/bookings` 🔒 | My bookings |
| GET | `/bookings/owner` 🔒 | Bookings at my places |
| GET | `/bookings/property/:propertyId` | Booked dates of a place |
| GET | `/bookings/:id` 🔒 | One booking |
| POST | `/bookings/:PropertyId` 🔒 | Book a place |
| PATCH | `/bookings/:id` 🔒 | Host updates a booking's status |
| POST | `/payments/:bookingId` 🔒 | Start a Stripe payment, returns the payment page link |
| GET | `/payments/success` | Stripe returns here; the booking is marked as paid and the invoice is emailed |
| GET | `/payments/cancel` | Stripe returns here when payment is cancelled |

A booking starts as `pending`, becomes `ongoing` once paid, and the host marks it `completed` after the stay.

**Reviews and chat**

| Method | Route | What it does |
| --- | --- | --- |
| GET | `/reviews` 🔒 | My reviews |
| GET | `/reviews/my-properties` 🔒 | Reviews of my places |
| GET | `/reviews/:PropertyId` | Reviews of a place |
| POST | `/reviews/:PropertyId` 🔒 | Review a place after a completed stay |
| GET | `/chat/token` 🔒 | Stream chat token |
| POST | `/chat/users/:id` 🔒 | Add a host to chat before messaging them |

## Project structure

```
Settle/
├── Jenkinsfile          Jenkins pipeline for the server tests
├── server/
│   ├── bin/www          Starts the API
│   ├── app.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middlewares/     Login check, photo upload, error handler
│   ├── helpers/         Email, tokens, passwords, Cloudinary, Stream, map lookup, distance
│   ├── migrations/
│   ├── seeders/
│   ├── data/            Sample data
│   └── __test__/        Jest tests and their own test data
└── client/
    ├── App.js           Navigation
    ├── store/           Redux actions and reducers
    └── src/
        ├── screens/
        ├── components/
        ├── helpers/
        └── services/    Stream chat
```

## Branches

- `server`: API work
- `client`: app work
- `development`: both merged together
- `main`: finished versions

## Troubleshooting

| Problem | Fix |
| --- | --- |
| The app can't reach the server | Check that the phone and computer are on the same Wi-Fi, that `EXPO_PUBLIC_API_URL` has the right IPv4 address, and that the server is running. Restart Expo with `-c` after changing `.env`. |
| No login code email | Check `EMAIL_USER` and `EMAIL_PASS` (it must be an app password) and look in the spam folder. |
| `database "settle_dev" does not exist` | Run `npm run db:create`, then `npm run db:migrate`. |
| `password authentication failed for user` | `DB_USERNAME` or `DB_PASSWORD` in `server/.env` doesn't match Postgres. |
| Payment page doesn't go back to the app | The phone must be able to reach the server's address. Use ngrok if you're on a different network. |
| Expo Go says the project is incompatible | Update Expo Go. This project uses Expo SDK 58. |
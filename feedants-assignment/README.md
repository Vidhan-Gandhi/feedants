# Feedants — Competition Details Screen (Full Stack Technical Assignment)

A functional, database-backed implementation of the Competition Details screen from the
provided design, built for the Feedants Full Stack Development Internship assignment.

- **Frontend:** React Native (Expo)
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)

Nothing on the screen is hardcoded — every value (prize pool, spots left, dates, rewards,
judge, previous winners, registration/submission state) is served from MongoDB through the
API and re-derived on each request.

---

## Project structure

```
feedants-assignment/
├── backend/          Express + MongoDB API
│   └── src/
│       ├── models/        Competition, User, Registration, Submission
│       ├── utils/lifecycle.js   the competition state machine (see below)
│       ├── controllers/   business logic (registration, submission, etc.)
│       ├── routes/
│       └── seed.js        seeds one competition matching the design
└── mobile/           React Native (Expo) app
    └── src/
        ├── api/client.js
        ├── hooks/useCompetition.js
        ├── components/     one component per section of the screen
        └── screens/CompetitionDetailsScreen.js
```

---

## Running it

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # edit MONGO_URI / JWT_SECRET if needed
# requires a local MongoDB running at the URI in .env (mongodb://127.0.0.1:27017/feedants
# by default — `mongod` with default settings works, no replica set required)
npm run seed                 # creates one competition + prints its _id
npm run dev                  # or `npm start`
```

The server starts on `http://localhost:5000`. `npm run seed` prints the competition's
`_id` — copy it.

### 2. Mobile app

```bash
cd mobile
npm install
```

Edit `src/constants/config.js`:
- `API_BASE_URL` — if testing on a physical device or Android emulator, replace
  `localhost` with your machine's LAN IP (e.g. `http://192.168.1.23:5000/api`).
  The iOS simulator can keep `localhost`.
- `DEMO_COMPETITION_ID` — paste the `_id` printed by `npm run seed`.

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `i` / `a` for a simulator/emulator.

### Environment variables (backend/.env)

| Variable         | Purpose                                   |
|------------------|--------------------------------------------|
| `PORT`           | API port (default 5000)                    |
| `MONGO_URI`      | MongoDB connection string                   |
| `JWT_SECRET`     | Secret used to sign demo-login JWTs         |
| `CLIENT_ORIGIN`  | CORS origin (default `*`)                   |

---

## API

| Method | Path                                  | Auth | Purpose |
|--------|----------------------------------------|------|---------|
| POST   | `/api/auth/demo-login`                 | —    | Creates/reuses a user by name, returns a JWT (see "Assumptions") |
| GET    | `/api/competitions/:id`                | optional | Full screen payload: competition data + computed lifecycle `state` + viewer-specific `isRegistered`/`hasSubmitted` if a token is sent |
| POST   | `/api/competitions/:id/register`       | required | Atomically books one spot (see "Concurrency" below) |
| POST   | `/api/competitions/:id/submissions`    | required | Submits (or updates) the caller's entry, only while submissions are open and the caller is registered |
| GET    | `/api/competitions/:id/winners`        | —    | Previous winners list |

---

## How the dynamic states are handled

### Competition lifecycle (`backend/src/utils/lifecycle.js`)

Instead of a hand-set `status` field that a cron job would need to flip, the competition's
state is a **pure function of its dates + spot count**, evaluated fresh on every request:

```
registration_open → registration_full → awaiting_submission → submission_open → judging → results_declared
```

The API returns this `state`, plus `countdown.label` / `countdown.targetAt` pointing at
whatever the *next relevant deadline* is for that state — the frontend's countdown timer
and the "Upload Submission" button both just read this instead of re-implementing the
date math client-side. This also means the countdown and button text update correctly
without a rebuild if the assignment's rules change (e.g. adding a "late submission" window)
— you only touch `lifecycle.js`.

### Registration state per viewer

`GET /competitions/:id` accepts an optional JWT. If present, the response also includes
`viewer.isRegistered` / `viewer.hasSubmitted`, computed from that user's `Registration` /
`Submission` documents. This is how the button changes from "Register · ₹99" to
"Upload Submission" to "Registered" / disabled states, purely driven by the API response
(`actions.canRegister`, `actions.canSubmit`) — the mobile app doesn't re-derive business
rules, it just renders what the backend decided.

### Concurrency: spots left under load

This was the trickiest requirement ("thousands of concurrent users", "consistency ... when
multiple users interact with the system"). A naive implementation —

```js
const comp = await Competition.findById(id);
if (comp.spotsLeft > 0) {
  comp.spotsLeft -= 1;
  await comp.save();
}
```

— is a classic check-then-act race: two requests can both read `spotsLeft = 1`, both see
it's `> 0`, and both decrement, overbooking the competition.

The implementation instead uses **one atomic MongoDB update** whose *filter* re-checks the
invariant at the database level:

```js
Competition.findOneAndUpdate(
  { _id: id, spotsLeft: { $gt: 0 }, registrationCloseAt: { $gt: now } },
  { $inc: { spotsLeft: -1 } },
  { new: true }
);
```

MongoDB guarantees this find-and-modify is atomic per document, so under any amount of
concurrency, at most `spotsLeft` requests can ever succeed — the rest simply get back
`null` (mapped to a `409 SPOTS_FULL` response) instead of racing.

A user registering twice is prevented two ways: an application-level check before touching
the spot counter (cheap, gives a friendly `409 ALREADY_REGISTERED`), *and* a unique
compound index on `Registration { competition, user }` as the real guarantee — if two
requests from the same user still race past the first check, the second `Registration.create`
throws a duplicate-key error, and the code compensates by incrementing `spotsLeft` back up
so no spot is silently lost.

---

## Assumptions

- **Auth is a demo login**, not real auth. `POST /api/auth/demo-login` takes a `name`
  (+optional `email`) and creates/reuses a `User`, returning a JWT. This exists purely
  to make register/submit testable as different users; production would swap in real
  OTP/OAuth without changing anything downstream (`req.userId` is all the rest of the
  code depends on).
- **File upload is out of scope.** `POST /.../submissions` accepts a `fileUrl` as if a
  client-side upload to S3/Cloudinary/etc. already happened; the mobile app simulates this
  with a placeholder URL rather than integrating a real picker/uploader, to keep the
  assignment focused on the state machine and API design it's actually being evaluated on.
- **Previous winners** are stored as a simple embedded array on the competition document
  (name/position/photo/video) rather than derived from a full competition-history relation,
  since no other competition data is required by the design.
- **Payments** (Razorpay, in the design) are shown as UI-only; entry-fee collection isn't
  wired to a payment gateway, consistent with the assignment scope.

## Trade-offs / what I'd change for production

- **Real transactions.** The registration flow is safe today without Mongo transactions
  (see "Concurrency" above), which also avoids requiring a replica set for local dev. In
  production — where Mongo already runs as a replica set for HA — I'd wrap the spot
  decrement + registration insert in a `session.withTransaction` for a stronger consistency
  guarantee, and add the same for the submission upsert.
- **Rate limiting / idempotency keys** on `POST /register` and `POST /submissions`, so a
  flaky network retry from the client can't be misread as a second attempt.
- **Real file uploads** via pre-signed S3 URLs, with the backend only ever storing the
  resulting object key/URL (as it already assumes).
- **Caching** the competition read behind a short TTL (Redis) once traffic is high enough
  that "thousands of concurrent users" means thousands of *reads* per second, not just
  writes — reads don't need the same strict consistency as spot booking.
- **Pagination / a competitions list endpoint** — this assignment only needed one detail
  screen, so there's no `GET /competitions` list yet.

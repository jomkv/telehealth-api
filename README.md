# Medra API

Backend for Medra — a telehealth platform connecting patients with doctors for virtual consultations. Built for the WC Launchpad Builder round.

## Author

[Jom Karlo Verzosa](https://github.com/jomkv)

---

## Tech Stack

- **Framework:** NestJS
- **Database:** Prisma ORM + PostgreSQL (DigitalOcean, pgBouncer pooling)
- **Auth:** JWT (HTTP-only cookie)
- **AI:** Hugging Face Inference API (symptom-to-specialist matching)
- **File Uploads:** Cloudinary SDK + Multer
- **Real-time:** Socket.IO
- **Scheduling:** @nestjs/schedule
- **Rate Limiting:** @nestjs/throttler

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account
- Hugging Face API key

### Installation

```bash
git clone <repo-url>
cd telehealth-api
npm install
```

### Environment Variables

Create a `.env` file in the root. See [Environment Variables](#environment-variables) below for all required fields.

### Database Setup

```bash
# Run migrations
npx prisma migrate deploy

# Seed the database
npm run seed
```

### Running the Server

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## Environment Variables

```dotenv
NODE_ENV="development"          # or "production"
JWT_SECRET=[your-jwt-secret]
ENCRYPTION_SECRET=[your-encryption-secret]
HF_KEY=[your-huggingface-api-key]

BASE_URL=[url-this-api-is-running-on]   # e.g. http://localhost:3001
CLIENT_URL=[frontend-url]               # e.g. http://localhost:3000
PROD_DOMAIN=".yourdomain.com"           # used for cookie domain in production

# Cloudinary
CLOUDINARY_CLOUD_NAME=[your-cloud-name]
CLOUDINARY_API_KEY=[your-api-key]
CLOUDINARY_API_SECRET=[your-api-secret]

# PostgreSQL — DigitalOcean (1GB RAM, 1vCPU, 10GB Disk, 22 connection pool)
DIRECT_URL=[direct-postgres-connection-url]       # straight connection, used by Prisma migrations
DATABASE_URL=[pgbouncer-pooler-connection-url]    # pooled connection, used at runtime
```

---

## Scripts

| Command               | Description                       |
| --------------------- | --------------------------------- |
| `npm run start:dev`   | Start with watch mode             |
| `npm run start:debug` | Start with debugger               |
| `npm run start:prod`  | Start compiled production build   |
| `npm run build`       | Compile to `dist/`                |
| `npm run seed`        | Seed the database                 |
| `npm run format`      | Format source files with Prettier |
| `npm run lint`        | Lint and auto-fix with ESLint     |
| `npm run test`        | Run unit tests                    |
| `npm run test:cov`    | Run tests with coverage report    |
| `npm run test:e2e`    | Run end-to-end tests              |

---

## Deployment

- **Server:** Render (free tier)
- **Database:** DigitalOcean Managed PostgreSQL

---

## API Reference

> All endpoints are prefixed with `/api`

---

### Auth

#### Login

```http
POST /api/auth/login
```

| Body Field | Type     | Description                   |
| :--------- | :------- | :---------------------------- |
| `email`    | `string` | **Required.** User's email    |
| `password` | `string` | **Required.** User's password |

Sets an `access_token` HTTP-only cookie. Returns the authenticated user (`MeUser`).

#### Logout

```http
POST /api/auth/logout
```

Clears the `access_token` cookie.

---

### User

#### Get current user

```http
GET /api/user/me
```

Returns the authenticated user's profile (`MeUser`). Accessible regardless of onboarding status.

#### Create user

```http
POST /api/user
```

| Body Field       | Type     | Description                  |
| :--------------- | :------- | :--------------------------- |
| `email`          | `string` | **Required.** Must be unique |
| `password`       | `string` | **Required.**                |
| _(other fields)_ |          | Per `CreateUserDto`          |

#### Onboard user

```http
POST /api/user/onboard
```

Only accessible to unonboarded users. Body follows `OnboardUserDto`. Returns `MeUser`.

#### Update current user

```http
PATCH /api/user/me
```

Accepts `multipart/form-data`. Supports an optional `profilePic` image upload (max 5 MB). Body fields follow `UpdateUserDto`. Returns `MeUser`.

---

### Doctor

#### Get all doctors / search

```http
GET /api/doctor
```

Accessible by patients only.

| Query Param | Type     | Description            |
| :---------- | :------- | :--------------------- |
| `q`         | `string` | Optional search string |

#### Search doctors by symptoms

```http
GET /api/doctor/symptoms
```

Accessible by patients only.

| Query Param | Type       | Description                    |
| :---------- | :--------- | :----------------------------- |
| `symptoms`  | `string[]` | **Required.** List of symptoms |

#### Get all specializations

```http
GET /api/doctor/specializations
```

Accessible at any onboarding stage.

#### Get doctor by ID

```http
GET /api/doctor/:id
```

Accessible by patients only. Optionally returns booked slots for a date range.

| Param | Type     | Description             |
| :---- | :------- | :---------------------- |
| `id`  | `string` | **Required.** Doctor ID |

| Query Param | Type     | Description                                        |
| :---------- | :------- | :------------------------------------------------- |
| `from`      | `string` | Start of date range (required if `to` is provided) |
| `to`        | `string` | End of date range (required if `from` is provided) |

#### Update doctor profile

```http
PATCH /api/doctor/me
```

Accessible by doctors only. Body follows `UpdateDoctorDto`. Returns `MeUser`.

---

### Patient

#### Update patient profile

```http
PATCH /api/patient/me
```

Accessible by patients only. Body follows `UpdatePatientDto`. Returns `MeUser`.

#### Get patient by ID

```http
GET /api/patient/:id
```

Accessible by doctors only.

| Param | Type     | Description              |
| :---- | :------- | :----------------------- |
| `id`  | `string` | **Required.** Patient ID |

---

### Consultation

#### Create consultation

```http
POST /api/consultation
```

Accessible by patients only. Body follows `CreateConsultationDto`.

#### Get all consultations

```http
GET /api/consultation
```

Returns consultations for the authenticated user. Doctors get their own; patients get theirs.

#### Get consultation by ID

```http
GET /api/consultation/:id
```

| Param | Type     | Description                   |
| :---- | :------- | :---------------------------- |
| `id`  | `string` | **Required.** Consultation ID |

#### Add doctor notes

```http
PATCH /api/consultation/:id/doctor-notes
```

Accessible by doctors only.

| Param | Type     | Description                   |
| :---- | :------- | :---------------------------- |
| `id`  | `string` | **Required.** Consultation ID |

| Body Field    | Type     | Description                |
| :------------ | :------- | :------------------------- |
| `doctorNotes` | `string` | **Required.** Notes to add |

#### Reschedule consultation

```http
PATCH /api/consultation/:id/reschedule
```

Only allowed when consultation status is `PENDING`.

| Param | Type     | Description                   |
| :---- | :------- | :---------------------------- |
| `id`  | `string` | **Required.** Consultation ID |

| Body Field    | Type     | Description                           |
| :------------ | :------- | :------------------------------------ |
| `scheduledAt` | `string` | **Required.** New datetime (ISO 8601) |

#### Cancel consultation

```http
PATCH /api/consultation/:id/cancel
```

Not allowed when consultation status is `DONE`.

| Param | Type     | Description                   |
| :---- | :------- | :---------------------------- |
| `id`  | `string` | **Required.** Consultation ID |

---

### Availability

#### Get availability by doctor

```http
GET /api/availability/:doctorId
```

| Param      | Type     | Description             |
| :--------- | :------- | :---------------------- |
| `doctorId` | `string` | **Required.** Doctor ID |

#### Upsert availability template

```http
PUT /api/availability
```

Accessible by doctors only. Body follows `UpsertAvailabilityDto`. Creates or updates the authenticated doctor's weekly availability template.

---

### Notification

#### Get latest notifications

```http
GET /api/notification/latest
```

Returns the most recent notifications for the authenticated user.

#### Get all notifications

```http
GET /api/notification
```

Returns all notifications for the authenticated user.

#### Mark all as read

```http
POST /api/notification/mark-all-read
```

Returns `{ updated: number }` — the count of notifications marked as read.

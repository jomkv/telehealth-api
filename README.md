
# Medra

A telehealth web app for patients and doctors to connect easily. Built for WC Launchpad Builder round.


## Authors

- [Jom Karlo Verzosa](https://www.github.com/jomkv)


## Tech Stack

**Framework:** NestJS

**Database:** PrismaORM + PostgreSQL

**Others:** HF Inference API, Cloudinary SDK, socket.io, JWT



## Deployment

- Server is deployed on Render free tier.
- DB is deployed on DigitalOcean.



## API Reference

> All endpoints are prefixed with `/api`

---

## Auth

#### Login

```http
POST /api/auth/login
```

| Body Field | Type | Description |
| :--------- | :--- | :---------- |
| `email` | `string` | **Required.** User's email |
| `password` | `string` | **Required.** User's password |

Sets an `access_token` HTTP-only cookie. Returns the authenticated user (`MeUser`).

#### Logout

```http
POST /api/auth/logout
```

Clears the `access_token` cookie.

---

## User

#### Get current user

```http
GET /api/user/me
```

Returns the authenticated user's profile (`MeUser`). Accessible regardless of onboarding status.

#### Create user

```http
POST /api/user
```

| Body Field | Type | Description |
| :--------- | :--- | :---------- |
| `email` | `string` | **Required.** Must be unique |
| `password` | `string` | **Required.** |
| *(other fields)* | | Per `CreateUserDto` |

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

## Doctor

#### Get all doctors / search

```http
GET /api/doctor
```

Accessible by patients only.

| Query Param | Type | Description |
| :---------- | :--- | :---------- |
| `q` | `string` | Optional search string |

#### Search doctors by symptoms

```http
GET /api/doctor/symptoms
```

Accessible by patients only.

| Query Param | Type | Description |
| :---------- | :--- | :---------- |
| `symptoms` | `string[]` | **Required.** List of symptoms |

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

| Param | Type | Description |
| :---- | :--- | :---------- |
| `id` | `string` | **Required.** Doctor ID |

| Query Param | Type | Description |
| :---------- | :--- | :---------- |
| `from` | `string` | Start of date range (required if `to` is provided) |
| `to` | `string` | End of date range (required if `from` is provided) |

#### Update doctor profile

```http
PATCH /api/doctor/me
```

Accessible by doctors only. Body follows `UpdateDoctorDto`. Returns `MeUser`.

---

## Patient

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

| Param | Type | Description |
| :---- | :--- | :---------- |
| `id` | `string` | **Required.** Patient ID |

---

## Consultation

#### Create consultation

```http
POST /api/consultation
```

Accessible by patients only. Body follows `CreateConsultationDto`.

#### Get all consultations

```http
GET /api/consultation
```

Returns consultations for the authenticated user. Doctors get their own consultations; patients get theirs.

#### Get consultation by ID

```http
GET /api/consultation/:id
```

| Param | Type | Description |
| :---- | :--- | :---------- |
| `id` | `string` | **Required.** Consultation ID |

#### Add doctor notes

```http
PATCH /api/consultation/:id/doctor-notes
```

Accessible by doctors only.

| Param | Type | Description |
| :---- | :--- | :---------- |
| `id` | `string` | **Required.** Consultation ID |

| Body Field | Type | Description |
| :--------- | :--- | :---------- |
| `doctorNotes` | `string` | **Required.** Notes to add |

#### Reschedule consultation

```http
PATCH /api/consultation/:id/reschedule
```

Only allowed when consultation status is `PENDING` and not `DONE`.

| Param | Type | Description |
| :---- | :--- | :---------- |
| `id` | `string` | **Required.** Consultation ID |

| Body Field | Type | Description |
| :--------- | :--- | :---------- |
| `scheduledAt` | `string` | **Required.** New datetime (ISO 8601) |

#### Cancel consultation

```http
PATCH /api/consultation/:id/cancel
```

Not allowed when consultation is `DONE`.

| Param | Type | Description |
| :---- | :--- | :---------- |
| `id` | `string` | **Required.** Consultation ID |

---

## Availability

#### Get availability by doctor

```http
GET /api/availability/:doctorId
```

| Param | Type | Description |
| :---- | :--- | :---------- |
| `doctorId` | `string` | **Required.** Doctor ID |

#### Upsert availability template

```http
PUT /api/availability
```

Accessible by doctors only. Body follows `UpsertAvailabilityDto`. Creates or updates the authenticated doctor's availability template.

---

## Notification

#### Get latest notification

```http
GET /api/notification/latest
```

Returns the most recent notification for the authenticated user.

#### Get all notifications

```http
GET /api/notification
```

Returns all notifications for the authenticated user.

#### Mark all notifications as read

```http
POST /api/notification/mark-all-read
```

Returns `{ updated: number }` — the count of notifications marked as read.
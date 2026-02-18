# 🚀 Space API (Express + PostgreSQL)

A simple RESTful API built with **Node.js**, **Express**, and
**PostgreSQL** for managing data about:

-   🌍 Planets
-   🌕 Moons
-   🚀 Missions
-   🗂 Categories

The API connects to a PostgreSQL database hosted on Railway.

------------------------------------------------------------------------

## 🛠 Tech Stack

-   Node.js
-   Express
-   PostgreSQL

# 📡 API Endpoints

------------------------------------------------------------------------

## 🌕 Moons

### `GET /moons`

Returns all moons.

------------------------------------------------------------------------

### `GET /moons/:name`

Returns a single moon by name (case-insensitive).

-   Validates input length\
-   Uses parameterized queries to prevent SQL injection\
-   Returns:
    -   `400` if invalid name\
    -   `404` if not found

Example:

    GET /moons/europa

------------------------------------------------------------------------

### `POST /moons`

Creates a new moon.

**Body:**

``` json
{
  "planet_id": 3,
  "name": "NewMoon",
  "discovered_at": "2025-01-01"
}
```

Returns `201 Created`.

------------------------------------------------------------------------

## 🌍 Planets

### `GET /planets`

Returns all planets.

------------------------------------------------------------------------

### `GET /planets/:id`

Returns a specific planet by ID.

-   Returns `400` if ID is invalid.

------------------------------------------------------------------------

### `GET /planets/:id/moons`

Returns all moons belonging to a specific planet.

Uses a SQL `JOIN` between `planets` and `moons`.

Example response:

``` json
[
  {
    "moon": "Europa",
    "planet": "Jupiter"
  }
]
```

------------------------------------------------------------------------

### `POST /planets`

Creates a new planet.

**Body:**

``` json
{
  "name": "Planet X",
  "discovered_at": "2025-02-01"
}
```

Returns `201 Created`.

------------------------------------------------------------------------

## 🚀 Missions

### `GET /missions`

Returns all missions.

------------------------------------------------------------------------

### `POST /missions`

Creates a new mission.

**Body:**

``` json
{
  "name": "Voyager III",
  "launch_date": "2030-01-01"
}
```

Returns `201 Created`.

------------------------------------------------------------------------

## 🗂 Categories

### `GET /categories`

Returns all categories.

------------------------------------------------------------------------

### `POST /categories`

Creates a new category.

**Body:**

``` json
{
  "category": "Gas Giant"
}
```

Returns `201 Created`.

------------------------------------------------------------------------

## 👋 Greeting Endpoint

### `GET /greet?name=yourname`

Simple test route.

Example:

    GET /greet?name=amro

Response:

    Hello, amro


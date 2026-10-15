# Real-time Notifications System

A real-time notification application built with Node.js, TypeScript, Express, MongoDB, JWT, and Socket.IO.

## Features

- User login with JWT authentication
- Create notifications
- Receive notifications instantly using Socket.IO
- Store notification history in MongoDB
- View all notifications or unread notifications only
- Mark notifications as read
- Live unread notification counter
- Simple browser interface

## Tech Stack

- Node.js
- TypeScript
- Express.js
- MongoDB and Mongoose
- Socket.IO
- JSON Web Tokens (JWT)
- HTML, CSS, and JavaScript

## Installation

1. Clone the repository.
2. Install dependencies:

   `npm install`

3. Create a `.env` file using `.env.example` and configure your MongoDB connection and JWT secret.

4. Start the development server:

   `npm run dev`

5. Open `http://localhost:3000` in your browser.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login or create a user |
| GET | `/api/health` | Check server health |
| POST | `/api/notifications` | Create a notification |
| GET | `/api/notifications` | Get notification history |
| PATCH | `/api/notifications/:id/read` | Mark a notification as read |

Notification endpoints require a JWT Bearer token.

## Socket.IO Events

- `notification:new` — receive a new notification
- `notification:count` — receive the unread count
- `notification:ping` — test the socket connection
- `notification:pong` — receive the ping response

## Testing

The application was manually tested for:

- Successful login
- Creating and receiving notifications
- Updating unread notification counts
- Marking notifications as read
- Preserving notification history after refreshing the browser

## Author

Alina Mamaeva
# My Basecamp 2

## Description

My Basecamp 2 is a Node.js, Express, SQLite, bcrypt, express-session, multer, and plain HTML/CSS/JavaScript project collaboration app. It preserves the My Basecamp 1 workflow and adds visible Basecamp 2 features for project attachments, project threads, and threaded messages.

The backend is refactored into MVC and uses Sequelize ORM with SQLite. The app is designed to run locally with `node server.js`.

## Cloud Hosted Link

Cloud link: TODO

For cloud deployment, the app should use `process.env.PORT || 8080`.

## MVC Structure

```text
server.js
config/
  database.js
models/
  User.js
  Project.js
  ProjectMember.js
  Discussion.js
  Task.js
  Attachment.js
  Thread.js
  Message.js
  index.js
controllers/
routes/
middleware/
utils/
public/
```

`server.js` initializes Express, configures middleware, serves static files, mounts routes, syncs Sequelize, and starts the server.

## ORM

This project uses Sequelize with SQLite. Data is stored in `basecamp.db`.

Models include `User`, `Project`, `ProjectMember`, `Discussion`, `Task`, `Attachment`, `Thread`, and `Message`, with associations for project ownership, memberships, discussions, tasks, attachments, threads, and messages.

## Inherited Basecamp 1 Features

- Register
- First registered user becomes a global admin if no global admin exists yet
- Login with email
- Login with username
- Logout
- Dashboard
- Global admins can manage users from `/admin`
- Create, view, edit, and delete projects
- Add project members by username
- Remove project members
- Change project member role between admin and viewer
- Project discussions
- Project tasks and task completion
- Profile edit
- Profile picture upload
- User profile page

## New Basecamp 2 Features

- Attachments inside projects
- Attachment#create and Attachment#destroy
- Multiple attachments per project
- Project members can upload attachments
- Attachment format/type is stored and displayed
- Allowed attachment formats: PNG, JPG/JPEG, PDF, TXT
- Threads inside projects
- Thread#new, Thread#edit, and Thread#destroy
- Messages inside threads
- Message#new, Message#edit, and Message#destroy
- Dashboard shows thread and message counts
- Project page makes Threads & Messages a prominent workflow section

## Role And Permission Rules

- Global admin: can open `/admin`, list users, make users global admin, remove global admin access, and delete non-admin users.
- Global user role and project member role are separate. Global `user.role` is only `user` or `admin`; project membership remains `admin` or `viewer`.
- Project owner: can edit/delete the project, manage members, create/edit/delete threads, create messages, edit/delete any thread message, upload attachments, and delete attachments.
- Project admin: can manage members, create/edit/delete threads, create messages, edit/delete any thread message, upload attachments, and delete attachments.
- Project viewer/member: can view project content, create discussions, update tasks, create messages, and upload attachments.
- Message author: can edit/delete their own messages.
- Attachment deletion follows the existing project design: only the project owner or project admins can delete project attachments.
- The last global admin cannot be demoted or deleted.

## Admin Routes

- `GET /admin/users`
- `PATCH /users/:id/admin`
- `DELETE /users/:id/admin`
- `DELETE /users/:id`
- `GET /api/me`

## Security Protections

- Passwords are hashed with bcrypt.
- Passwords are not trimmed before hashing or comparison.
- Sessions use HTTP-only cookies, sameSite lax, and secure cookies in production.
- Protected routes require login.
- Sequelize ORM is used instead of raw sqlite3 route logic.
- Upload size limit is 5MB.
- Attachment uploads allow only PNG, JPG/JPEG, PDF, and TXT.
- Avatar uploads allow only PNG, JPEG/JPG, and WebP.
- Uploaded files use random safe stored filenames.
- Original filenames are cleaned before being stored for display.
- File deletion is restricted to `public/uploads/`.
- Project, task, attachment, thread, message, and member routes enforce project access to reduce IDOR risk.
- Dynamic thread, message, and attachment UI uses DOM methods and `textContent` where practical.

## Runtime Files

The following files/folders are generated locally and should not be committed:

- `basecamp.db`
- `public/uploads/`
- `node_modules/`
- `.env`

Project data is stored in the SQLite database file `basecamp.db`. Uploaded files are stored in `public/uploads/`. The database stores attachment metadata and file paths.

## Installation

```bash
npm install
```

## Usage

```bash
node server.js
```

Then open:

```text
http://localhost:8080
```

Cloud platforms should provide `PORT`; the app falls back to `8080` locally.

## Core Team

- Farid Narimanov

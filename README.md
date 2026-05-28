# My Basecamp 2

My Basecamp 2 is an extended Basecamp-style collaboration platform built as part of the Qwasar curriculum.

The project continues the My Basecamp 1 workflow and adds Basecamp 2 features such as project attachments, project threads, threaded messages, stronger permission checks, MVC architecture, and Sequelize ORM.

## Tech Stack

- Node.js
- Express.js
- SQLite
- Sequelize ORM
- bcrypt
- express-session
- multer
- HTML
- CSS
- JavaScript

## Description

My Basecamp 2 is a project collaboration application where users can create projects, manage project members, upload attachments, create discussion threads, and post messages inside threads.

The backend is refactored into an MVC-style structure. Database operations are handled through Sequelize ORM with SQLite instead of raw `sqlite3` route logic.

## Inherited Basecamp 1 Features

- User registration
- Login with email or username
- Logout
- Dashboard
- Global admin system
- Admin panel
- User create, show, and destroy
- Create, show, edit, and delete projects
- Add project members by username
- Remove project members
- Change project member role between admin and viewer
- Project discussions
- Project tasks and task completion
- Profile edit
- Profile picture upload
- User profile page
- Secure file upload handling

## New Basecamp 2 Features

- Attachments inside projects
- Create and delete attachments
- Multiple attachments per project
- Attachment format/type storage
- Attachment format/type display on the project page
- Allowed attachment formats: PNG, JPG/JPEG, PDF, TXT
- Project threads
- Create, edit, and delete project threads
- Threaded messages
- Create, edit, and delete messages inside threads
- Project members can post messages inside threads
- Dashboard shows thread and message counts
- Project page highlights the Threads & Messages workflow

## Admin System

- The first registered user automatically becomes the first global admin if no global admin exists yet.
- Later users are created as normal users by default.
- Global admins can manage users from `/admin`.
- Global admins can make users admin.
- Global admins can remove admin access.
- Global admins can delete non-admin users.
- Normal users cannot access admin pages or admin API actions.
- The last remaining global admin cannot be deleted or demoted.

## Role And Permission Rules

- Global admin role and project member role are separate.
- Global `user.role` is either `user` or `admin`.
- Project membership role is either `admin` or `viewer`.

Project permissions:

- Project owner can edit/delete the project, manage members, create/edit/delete threads, create messages, edit/delete any message, upload attachments, and delete attachments.
- Project admin can manage members, create/edit/delete threads, create messages, edit/delete any message, upload attachments, and delete attachments.
- Project viewer/member can view project content, create discussions, update tasks, create messages, and upload attachments.
- Message author can edit/delete their own messages.
- Attachment deletion follows the project permission design: only project owner or project admins can delete project attachments.

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
  authController.js
  userController.js
  profileController.js
  projectController.js
  memberController.js
  discussionController.js
  taskController.js
  attachmentController.js
  threadController.js
  messageController.js
routes/
  authRoutes.js
  userRoutes.js
  profileRoutes.js
  projectRoutes.js
  threadRoutes.js
  messageRoutes.js
  taskRoutes.js
middleware/
  auth.js
  admin.js
  projectAccess.js
  upload.js
utils/
  projectCleanup.js
  validation.js
public/
  admin.html
  create_project.html
  dashboard.html
  edit_profile.html
  edit_project.html
  login.html
  project.html
  register.html
  style.css
  user_profile.html
```

`server.js` initializes Express, configures middleware, serves static files, mounts routes, syncs Sequelize, and starts the server.

## ORM

The app uses Sequelize with SQLite.

Models:

- User
- Project
- ProjectMember
- Discussion
- Task
- Attachment
- Thread
- Message

Associations include:

- User has many Projects
- Project belongs to User as owner
- Project belongs to many Users through ProjectMember
- User belongs to many Projects through ProjectMember
- Project has many Discussions
- Project has many Tasks
- Project has many Attachments
- Project has many Threads
- Thread has many Messages
- Message belongs to Thread
- Message belongs to User as author
- Attachment belongs to User as uploader

## Main Routes

User and auth routes:

- `POST /users`
- `GET /users/:id`
- `GET /api/users/:username`
- `DELETE /users/:id`
- `POST /sessions`
- `DELETE /sessions`
- `GET /api/me`

Admin routes:

- `GET /admin/users`
- `PATCH /users/:id/admin`
- `DELETE /users/:id/admin`

Project routes:

- `GET /projects`
- `POST /projects`
- `GET /projects/:id`
- `PUT /projects/:id`
- `DELETE /projects/:id`

Thread routes:

- `GET /projects/:id/threads`
- `POST /projects/:id/threads`
- `PUT /threads/:threadId`
- `DELETE /threads/:threadId`

Message routes:

- `GET /threads/:threadId/messages`
- `POST /threads/:threadId/messages`
- `PUT /messages/:messageId`
- `DELETE /messages/:messageId`

## Security

- Passwords are hashed with bcrypt.
- Passwords are not trimmed before hashing or comparison.
- Sessions use HTTP-only cookies.
- Sequelize ORM is used instead of raw SQL route logic.
- Protected routes require login.
- Admin routes require global admin permission.
- Project, task, attachment, thread, message, and member routes enforce project access checks.
- Upload size is limited to 5MB.
- Attachment uploads allow only PNG, JPG/JPEG, PDF, and TXT.
- Avatar uploads allow PNG, JPEG/JPG, and WebP.
- Uploaded files use random safe stored filenames.
- Original filenames are cleaned before display.
- File deletion is restricted to `public/uploads`.
- Dynamic thread, message, and attachment UI uses DOM methods and `textContent` where practical.

## Runtime Files

The following files and folders are generated locally and should not be committed:

- `basecamp.db`
- `public/uploads/`
- `node_modules/`
- `.env`

Project data is stored in the SQLite database file `basecamp.db`.

Uploaded files are stored in `public/uploads/`.

The database stores attachment metadata and file paths.

## Installation

```bash
npm install
```

## Usage

```bash
node server.js
```

Open locally:

```text
http://localhost:8080
```

## Core Team

- Farid Narimanov

## Note

Educational project built as part of the Qwasar My Basecamp curriculum.

# My Basecamp 2

## Task Description

My Basecamp 2 extends the completed My Basecamp 1 project with project attachments, project threads, and threaded messages while keeping the existing Node.js, Express, SQLite, bcrypt, express-session, multer, and plain HTML/CSS/JavaScript stack.

## Cloud Hosted Link

Cloud link: TODO

## What The App Does

The app lets users register, log in with email or username, create projects, manage project members, track tasks, post project discussions, upload files, edit profiles, upload profile pictures, and view user profiles.

## Basecamp 2 Features

- Attachments: project members can upload multiple files per project. Supported project formats are PNG, JPG/JPEG, PDF, and TXT.
- Attachment metadata: each attachment stores the cleaned display filename, safe stored path, uploader, MIME type, and creation timestamp.
- Threads: project owners and project admins can create, edit, and delete project threads.
- Messages: project members can post messages inside threads.
- Message moderation: message authors, project owners, and project admins can edit or delete messages.

## Role Permissions

- Project owner: can edit/delete the project, manage members, create/edit/delete threads, create messages, edit/delete any thread message, upload attachments, and delete attachments.
- Project admin: can manage members, create/edit/delete threads, create messages, edit/delete any thread message, upload attachments, and delete attachments.
- Project viewer/member: can view project content, create discussions, update tasks, create messages, and upload attachments.
- Attachment deletion follows the existing project design: only the project owner or project admins can delete project attachments.

## Security Protections

- Passwords are hashed with bcrypt.
- Passwords are not trimmed before hashing or comparison.
- Sessions use HTTP-only cookies, sameSite lax, and secure cookies in production.
- Protected routes require login.
- Project routes verify owner/member access on the backend.
- Thread, message, task, and attachment routes check project access to prevent IDOR.
- Thread create/edit/delete is enforced on the backend for owner/admin only.
- Message edit/delete is enforced on the backend for message author or owner/admin only.
- SQL queries use parameterized statements.
- Project attachment uploads use multer with a 5MB limit, random stored filenames, cleaned original display names, extension and MIME validation, and safe deletion inside `public/uploads`.
- Dynamic project page content is rendered with DOM methods and `textContent` where practical to reduce XSS risk.

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

## Project Structure

```text
server.js                 Express app, routes, SQLite setup, auth, uploads
basecamp.db               SQLite database
public/
  dashboard.html          Project dashboard
  project.html            Project details, discussions, threads, messages, tasks, members, attachments
  edit_project.html       Project/member management
  edit_profile.html       Profile editor
  user_profile.html       Public user profile
  login.html              Login page
  register.html           Registration page
  create_project.html     Project creation page
  style.css               Shared styling
  uploads/                Uploaded files
```

## Database Tables

- `users`: account, login, role, profile, and avatar data.
- `projects`: project name, description, and owner.
- `project_members`: project membership and project role.
- `discussions`: Basecamp 1 project discussion posts.
- `tasks`: project tasks and completion state.
- `attachments`: project files with display name, safe file path, uploader, MIME type, and created timestamp.
- `threads`: Basecamp 2 project threads with title, project, creator, created timestamp, and updated timestamp.
- `messages`: Basecamp 2 thread messages with thread, author, content, created timestamp, and updated timestamp.

## Core Team

- TODO

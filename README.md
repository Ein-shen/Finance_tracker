# ExpenseKontrol

A personal finance tracker for keeping income, expenses, scheduled payments, and spending patterns in one place.

## Deploymnet 

**https://expensekontrol.onrender.com/**

---

## About

ExpenseKontrol is a full-stack personal finance application I built to make tracking everyday finances more organized.

The idea was to go beyond a simple CRUD expense tracker. Instead of only storing transactions, ExpenseKontrol combines transaction management, scheduled payments, financial analytics, category-based spending, authentication, and an admin dashboard into one application.

The frontend is built with React, while the backend is a separate Node.js and Express API connected to PostgreSQL. Firebase handles authentication, and the application is deployed using Render.

I also added Docker and GitHub Actions so the project could be developed and checked in a more consistent environment.

## Why I Built It

I wanted to build a project that felt closer to a real application rather than another basic inventory or CRUD project.

Personal finance was a good fit because there are several different problems to solve:

* How should financial records be stored?
* How should users access only their own data?
* How should recurring payments be represented?
* How can raw transaction data become useful analytics?
* How should authentication work between a frontend and backend?
* How can the application be containerized?
* How can builds be automatically checked with CI?

That led me to build ExpenseKontrol as a separate React frontend and Express backend instead of putting everything into one application.

---

## Screenshots

### Dashboard

The main dashboard gives users an overview of their financial activity and provides quick access to their transactions and other finance features.

### Transactions

The transaction page is where users manage their income and expenses.

Users can create, edit, and delete transactions while organizing them into categories.

### Schedule

The schedule section is designed for planned and recurring payments.

A scheduled payment can be configured as:

* Once
* Daily
* Weekly
* Monthly
* Yearly

This makes it useful for things such as bills, subscriptions, and other recurring expenses.

### Analytics

The analytics page turns transaction data into visual information.

It includes financial summaries and charts for understanding income, expenses, monthly spending, and category-based spending.

### Admin Dashboard

The application also includes a separate administrative section for managing users and their account access.

---

## Authentication

Firebase Authentication handles the user authentication layer.

When a user signs in, Firebase provides an ID token that can be sent to the backend.

The Express server verifies the token before allowing access to protected endpoints.

The general flow looks like this:

```text
User
  ↓
Firebase Authentication
  ↓
Firebase ID Token
  ↓
Express Authentication Middleware
  ↓
Protected API Route
  ↓
PostgreSQL
```

This keeps authentication separate from the application's financial data while still allowing the backend to identify the authenticated user.

---

## Transactions

Transactions are tied to the authenticated user's Firebase UID.

This means the backend can retrieve the financial records belonging to the current user instead of simply returning every transaction in the database.

The transaction system supports:

* Income
* Expenses
* Categories
* Dates
* Editing
* Deleting
* User-specific records

Transactions are returned in descending date order so newer financial activity appears first.

---

## Scheduled Payments

The schedule system was added because recurring expenses are different from transactions that have already happened.

A scheduled payment contains information such as:

* Description
* Amount
* Category
* Due date
* Repeat type

The available repeat types are:

```text
Once
Daily
Weekly
Monthly
Yearly
```

This provides a way to keep track of upcoming financial obligations rather than only looking at past transactions.

---

## Analytics

One of the main reasons I wanted to build ExpenseKontrol was to turn transaction data into something more useful.

The analytics section provides different views of financial activity, including:

* Income vs. expenses
* Expense categories
* Monthly expenses
* Top spending categories
* Spending charts

The charts are built with Recharts.

Instead of manually calculating everything inside each component, the application processes the transaction data and uses it to generate the values required by the charts.

---

## Admin

ExpenseKontrol has a separate admin area.

Administrators can access user-management functionality that regular users do not have access to.

The admin section includes functionality for managing account access, including banning and restoring users.

The backend also checks the authenticated user's role before allowing access to protected administrative functionality.

---

## Image Uploads

The backend supports image uploads using Multer.

Supported formats include:

```text
.jpg
.png
.webp
```

Uploaded files are limited to 5 MB.

This allows the application to support image-based financial records without allowing unnecessarily large files to be uploaded.

---

## Why PostgreSQL

I chose PostgreSQL because the application's data has clear relationships.

A user's financial data can be connected to that user through their Firebase UID, while transactions and scheduled payments contain their own structured fields.

The relational structure also makes it easier to query and organize financial records compared with trying to represent everything as nested documents.

The backend uses the `pg` package and a PostgreSQL connection pool to communicate with the database.

---

## Frontend

The frontend is built with React and Vite.

React Router handles navigation between the different sections of the application, while Tailwind CSS is used for the interface.

The application is organized around separate pages and components for areas such as:

```text
Dashboard
Transactions
Schedule
Analytics
Account
Admin
```

Recharts is used for the financial visualizations and Lucide React provides icons throughout the interface.

---

## Backend

The backend is a separate Node.js and Express application.

It provides REST API endpoints for the application's main functionality.

Some of the API areas include:

```text
Users
Roles
Salary
Transactions
Schedule
File Uploads
```

Authentication middleware verifies Firebase ID tokens before protected routes can access user data.

The backend then uses PostgreSQL to store and retrieve the application's data.

---

## API Structure

The frontend communicates with the backend through REST endpoints.

The basic architecture is:

```text
React Client
     │
     │ HTTP Requests
     ▼
Express REST API
     │
     ├── Firebase Authentication
     │
     └── PostgreSQL
```

This separation means the frontend is responsible for the user interface while the backend handles authentication verification, business logic, and database operations.

---

## Tech Stack

| Layer                   | Technology              |
| ----------------------- | ----------------------- |
| Frontend                | React                   |
| Build Tool              | Vite                    |
| Styling                 | Tailwind CSS            |
| Routing                 | React Router            |
| Charts                  | Recharts                |
| Icons                   | Lucide React            |
| Backend                 | Node.js                 |
| API                     | Express.js              |
| Database                | PostgreSQL              |
| Authentication          | Firebase Authentication |
| Backend Authentication  | Firebase Admin SDK      |
| File Uploads            | Multer                  |
| Containerization        | Docker                  |
| Container Orchestration | Docker Compose          |
| CI/CD                   | GitHub Actions          |
| Deployment              | Render                  |
| Database Hosting        | Neon PostgreSQL         |

---

## Docker

The application is separated into frontend and backend services and can be run using Docker Compose.

The structure is:

```text
Docker Compose
│
├── Client
│   └── React / Vite
│
└── Server
    └── Node.js / Express
```

The purpose of containerizing the application was to make the development environment more consistent and to get more practical experience working with Docker.

---

## CI/CD

GitHub Actions is used to automatically run project checks when changes are pushed to the repository.

The workflow helps catch build problems before changes are considered ready.

The project therefore has a development flow that looks roughly like:

```text
Code
  ↓
Git Push
  ↓
GitHub
  ↓
GitHub Actions
  ↓
Build / Checks
```

---

## Deployment

The application is currently deployed on Render.

The live application is:

**https://expensekontrol.onrender.com/**

The project uses a separate frontend and backend architecture, with PostgreSQL providing the database layer.

```text
                    ┌──────────────────┐
                    │      Render      │
                    │                  │
                    │  ExpenseKontrol  │
                    │    Frontend      │
                    └────────┬─────────┘
                             │
                             │ REST API
                             ▼
                    ┌──────────────────┐
                    │      Render      │
                    │                  │
                    │ Node / Express   │
                    │     Backend      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │      Neon        │
                    │    PostgreSQL    │
                    └──────────────────┘
```

---

## Project Structure

```text
Finance_tracker/
│
├── .github/
│   └── workflows/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
│
├── server/
│   ├── uploads/
│   ├── db.js
│   ├── firebaseAdmin.js
│   ├── index.js
│   ├── Dockerfile
│   ├── package.json
│   └── ...
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

The project is intentionally split into `client` and `server` so the frontend and backend can be developed and deployed independently.

---

## What I Learned

Building ExpenseKontrol gave me practical experience with several parts of full-stack development that I wanted to understand better.

Some of the main things I worked with were:

* Building a React application from the ground up
* Creating REST APIs with Express
* Connecting Node.js to PostgreSQL
* Designing user-specific database queries
* Working with Firebase Authentication
* Verifying authentication tokens on the backend
* Implementing role-based access
* Building financial data visualizations
* Handling file uploads with Multer
* Separating frontend and backend applications
* Containerizing applications with Docker
* Using Docker Compose
* Creating GitHub Actions workflows
* Deploying a full-stack application with Render
* Working with environment variables between development and production

---

## Future Improvements

There are still several things I would like to improve as the project develops.

Some of them include:

* Budget management
* More detailed financial reports
* Transaction export
* Improved recurring payment automation
* Notifications for upcoming payments
* More advanced admin controls
* Additional analytics
* Improved mobile experience

---

## Repository

GitHub:

https://github.com/Ein-shen/Finance_tracker

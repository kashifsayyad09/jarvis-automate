# Problem Solving Platform - End-to-End Implementation Guide

## 1) Project File Structure (Frontend and Backend Separate)

```text
/vercel/sandbox
├── package.json
├── .env.example
├── schema.sql
├── PROJECT_STRUCTURE_AND_DEPLOYMENT.md
├── backend
│   ├── server.js
│   ├── config
│   │   ├── database.js
│   │   └── categories.js
│   ├── controllers
│   │   ├── authController.js
│   │   ├── problemController.js
│   │   └── adminController.js
│   ├── middleware
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models
│   │   ├── User.js
│   │   ├── Problem.js
│   │   └── Comment.js
│   ├── routes
│   │   ├── auth.js
│   │   ├── problems.js
│   │   ├── categories.js
│   │   └── admin.js
│   └── utils
│       └── initDatabase.js
└── frontend
    ├── css
    │   └── main.css
    ├── js
    │   ├── api.js
    │   ├── auth.js
    │   ├── theme.js
    │   └── utils.js
    └── pages
        ├── index.html
        ├── login.html
        ├── signup.html
        ├── category.html
        ├── post-problem.html
        ├── problem-detail.html
        └── admin.html
```

## 2) Features Delivered

- User authentication (signup/login/logout/JWT profile)
- Role-based authorization (`user`, `admin`)
- Problem posting and sharing with category and tags
- Searchbox to find same/similar issues and posted solutions
- Home menu categories:
  - DevOps Issue
  - Developer Issue
  - Cybersecurity Issue
  - Data Science Issue
  - SAP Issue
  - Data Analyst Issue
  - System Administrator Issue
- Dynamic UI rendering from APIs
- Theme change (light/dark, localStorage persistence)
- Admin panel APIs for moderation and platform stats
- AWS MySQL-ready environment config

## 3) Local Setup and Run

### Step A: Install dependencies
```bash
npm install
```

### Step B: Configure environment
```bash
cp .env.example .env
```
Update `.env` with your AWS RDS MySQL credentials:
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`

### Step C: Initialize database schema
Run `schema.sql` on your MySQL/AWS RDS instance (using MySQL client, Workbench, or AWS query tool).

### Step D: Start backend server
```bash
npm run dev
```
or
```bash
npm start
```

### Step E: Access platform
- Home: `http://localhost:3000/`
- Login: `http://localhost:3000/login`
- Signup: `http://localhost:3000/signup`
- Admin: `http://localhost:3000/admin`

## 4) Backend API Design (Core)

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Problems
- `GET /api/problems`
- `GET /api/problems/search?q=...&category=...`
- `GET /api/problems/trending`
- `GET /api/problems/category/:category`
- `GET /api/problems/:id`
- `POST /api/problems` (auth)
- `PUT /api/problems/:id` (owner/admin)
- `DELETE /api/problems/:id` (owner/admin)
- `POST /api/problems/:id/comments` (auth)

### Categories
- `GET /api/categories`

### Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PUT /api/admin/users/:userId/role`
- `DELETE /api/admin/users/:userId`
- `DELETE /api/admin/problems/:problemId`
- `GET /api/admin/stats/categories`

## 5) End-to-End Flow

1. User signs up or logs in.
2. JWT token stored client-side and sent in Authorization header.
3. User posts issue with title, category, problem description, and solution.
4. Other users search by keyword/category and view matched issues.
5. Problem detail can include discussion/comments.
6. Admin monitors dashboard, manages users and moderates content.

## 6) AWS Three-Tier Architecture Deployment Plan

### Tier 1: Presentation Layer (Web)
- Amazon CloudFront + ALB (optional CloudFront for global caching)
- Frontend static pages served from Node app or S3 + CloudFront

### Tier 2: Application Layer (Business Logic)
- Node.js Express app on EC2 Auto Scaling Group or ECS service
- Private subnets recommended
- Security Group allows inbound only from ALB on app port

### Tier 3: Data Layer
- Amazon RDS MySQL in private subnet
- Security Group only allows inbound from app-tier SG on `3306`
- Enable automated backups, monitoring, and Multi-AZ for HA

### Networking and Security
- VPC across 2+ AZs
- Public subnets: ALB/NAT gateway
- Private subnets: App servers + RDS
- Store secrets in AWS Secrets Manager or SSM Parameter Store
- Use IAM role for app instances/services

### CI/CD Recommendation
- GitHub Actions / CodePipeline
- Steps: install -> test -> build image/artifact -> deploy to ECS/EC2
- Blue/green or rolling deployments via ALB target groups

## 7) Production Checklist

- Change default JWT secret and admin credentials
- Use HTTPS via ACM certificate on ALB/CloudFront
- Enable DB backups + alarms (CloudWatch)
- Add centralized logs (CloudWatch Logs)
- Set CORS allowed origins to your real domain
- Add rate limiting and request size limits


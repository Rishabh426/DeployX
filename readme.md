# ⚡ React App Deployment Platform

A full-stack platform to deploy React applications on-demand — similar to Vercel or Netlify. Users submit a GitHub repository URL from the frontend and receive a live hosted URL once deployment is complete.

---

## 🏗️ Architecture Overview

```
FE (React)
  │
  ├──── Repo_url ────────────────────────────────────────────────────►  Upload Service
  │                                                                          │
  │                                                                          │  Push to Redis Queue
  │                                                                          ▼
  │                                                                     Redis Queue (id1, id2 ... idN)
  │                                                                          │
  │                                                                          │  Pops from Queue
  │                                                                          ▼
  │                                                               Deployment Service
  │                                                                     │         │
  │                                                          Downloads  │         │  Builds & uploads
  │                                                          React Code │         │  (.html, .css, .js)
  │                                                                     ▼         ▼
  │                                                              Cloudflare R2 Bucket
  │                                                                          │
  │                                                               Redis Store (status tracking)
  │                                                               ↑         │  uploaded / deployed
  │                                                               │         ▼
  ◄─── http://id.rishabh.dev.com:3000/index.html ─────── Request Handler
```

The system consists of three independent backend services that communicate via a **Redis Queue**, with deployment status tracked in a **Redis Store**, and build artifacts stored in **Cloudflare R2**.

---

## 🧩 Services

### 1. Frontend (React JS)
- Provides a UI for users to submit a GitHub repository URL
- Polls the backend for deployment status
- Displays the final hosted URL once deployment is complete

### 2. Upload Service (Express + TypeScript)
- Receives the `repo_url` from the frontend
- Clones the React repository
- Uploads the raw source to Cloudflare R2
- Pushes a unique deployment ID onto the Redis Queue
- Updates Redis Store with status: `uploaded`

### 3. Deployment Service (Express + TypeScript)
- Continuously pops deployment IDs from the Redis Queue
- Downloads the React source from Cloudflare R2
- Runs the build process (`npm install && npm run build`)
- Uploads the resulting build artifacts (`.html`, `.css`, `.js`) back to Cloudflare R2
- Updates Redis Store with status: `deployed`

### 4. Request Handler (Express + TypeScript)
- Serves the deployed build files from Cloudflare R2 based on deployment ID
- Handles status queries — reads from Redis Store to return `uploaded` or `deployed`
- Final URL format: `http://<id>.rishabh.dev.com:3000/index.html`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React JS |
| Backend Services | Express JS + TypeScript |
| Queue | Redis (List-based queue) |
| Status Store | Redis (Key-Value store) |
| File Storage | Cloudflare R2 (S3-compatible) |

---

## 📁 Project Structure

```
root/
├── frontend/               # React JS app
│   ├── src/
│   └── package.json
│
├── upload-service/         # Handles repo upload & queuing
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── deployment-service/     # Builds and deploys from queue
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
└── request-handler/        # Serves files & status checks
    ├── src/
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- Redis (local or cloud instance)
- Cloudflare R2 bucket + API credentials
- Git

### Environment Variables

Create a `.env` file in each service directory.

**upload-service/.env**
```env
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
```

**deployment-service/.env**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
```

**request-handler/.env**
```env
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
```

### Installation & Running

```bash
# Clone the repo
git clone https://github.com/Rishabh426/DeployX.git
cd your-repo

# Install and start each service
cd upload-service && npm install && npm run dev
cd ../deployment-service && npm install && npm run dev
cd ../request-handler && npm install && npm run dev

# Start the frontend
cd ../frontend && npm install && npm start
```

---

## 🔄 Deployment Flow

1. User submits a GitHub repo URL via the frontend
2. **Upload Service** clones the repo, uploads source to R2, and pushes an ID to the Redis Queue → status: `uploaded`
3. **Deployment Service** picks up the ID, builds the project, uploads build files to R2 → status: `deployed`
4. **Request Handler** serves the build files at `http://<id>.rishabh.dev.com:3000/index.html`
5. Frontend polls for status and displays the live URL once `deployed`

---

## 📝 Notes

- Cloudflare R2 is used as the object storage layer (S3-compatible API). The architecture diagram uses an S3 bucket icon for illustration purposes only.
- The Redis Queue decouples the upload and build steps, allowing the deployment service to scale independently.
- Each deployment is identified by a unique ID which maps to the subdomain and the R2 storage path.

# Pametni Paketnik – Smart Locker System

This project contains a React frontend and a Node.js backend (API), with MongoDB for storage. It also communicates with a private ORV-API service.

## 📁 Project Structure

```
project-root/
├── frontend/             # React app
│   └── .env              # Frontend dev env
├── backend/              # Express.js API
│   └── .env              # Backend dev env
├── nginx/                # NGINX reverse proxy config
├── .env.prod             # Production env vars (used by Docker)
├── docker-compose.yml    # Compose file for production
└── deploy.sh             # Deployment script
```

## 🔧 Local Development Setup

Each service (frontend, backend) can run independently for development.

### 🧩 Prerequisites

- Node.js v18+
- npm
- MongoDB (local or Atlas)
- Docker (optional, for production)

---

### ⚙️ Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB credentials
npm install
npm run dev
```

The backend will run on:  
`http://localhost:3001`

---

### ⚙️ Frontend Setup

```bash
cd frontend
cp .env.example .env
# Set REACT_APP_API_URL to http://localhost:3001
npm install
npm start
```

The frontend will run on:  
`http://localhost:3000`

---

## 🚀 Docker Production Deployment

For production, a Docker Compose setup is provided.

### 🛠 Create `.env.prod` in the root:

```env
# Backend
MONGO_USER=your_user
MONGO_PASS=your_password
MONGO_DB=PametniPaketnik
MONGO_URI_TEMPLATE=mongodb+srv://{user}:{password}@your-cluster.mongodb.net/?retryWrites=true&w=majority
ORV_API_LINK=https://your-orv-api

# Frontend
REACT_APP_API_URL=/api
```

### ▶️ Deploy with:

```bash
./deploy.sh
```

App will be served at:  
`http://localhost`  
API routes are accessible at:  
`http://localhost/api/...`

---

## 🧪 Useful Commands

- View logs:  
  `docker-compose logs -f`

- Rebuild and restart:

  ```bash
  docker-compose down
  docker-compose build
  docker-compose up -d
  ```

- Stop containers:  
  `docker-compose down`

# 🏡 Neighborly

A hyperlocal social network that connects neighbors to help each other in real-time. Whether you need help with a flat tire, a cup of sugar, or just want to meet the people living around you — Neighborly makes it easy.

![Next.js](https://img.shields.io/badge/Next.js-16.x-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwind-css)

## ✨ Features

### 🗺️ Real-time Map

- Interactive map powered by **Leaflet** showing neighbors and help requests
- Color-coded markers: Blue for neighbors, Red for open requests, Orange for in-progress
- Click on neighbors to view profiles and start conversations

### 💬 Real-time Chat

- **WebSocket-powered** instant messaging between neighbors
- Persistent message history
- Real-time notifications when messages arrive

### 🆘 Help Request System

- Post help requests that appear on the map for nearby neighbors
- Accept requests from neighbors who need help
- Resolve requests with a **star rating and review** system

### 👤 User Profiles

- Profile image upload
- Role-based system (Neighbor / Professional)
- Verification badges
- Review history with star ratings

### 📍 Location-Based Discovery

- **Haversine formula** for accurate distance calculations
- Find neighbors within a configurable radius (default: 10km)
- Auto-fill location from browser geolocation on registration

## 🏗️ Tech Stack

### Backend

| Technology                               | Purpose                              |
| ---------------------------------------- | ------------------------------------ |
| **FastAPI**                              | High-performance async API framework |
| **SQLModel**                             | ORM combining SQLAlchemy + Pydantic  |
| **SQLite** (dev) / **PostgreSQL** (prod) | Database                             |
| **JWT (python-jose)**                    | Authentication tokens                |
| **Passlib + bcrypt**                     | Password hashing                     |
| **WebSockets**                           | Real-time messaging                  |
| **Uvicorn**                              | ASGI server                          |

### Frontend

| Technology                  | Purpose                         |
| --------------------------- | ------------------------------- |
| **Next.js 16**              | React framework with App Router |
| **React 19**                | UI library                      |
| **TypeScript**              | Type safety                     |
| **Tailwind CSS 4**          | Utility-first styling           |
| **Shadcn/ui**               | Component library               |
| **Leaflet + react-leaflet** | Interactive maps                |
| **Zod**                     | Form validation                 |

## 📁 Project Structure

```
neighborly/
├── backend/
│   ├── main.py              # FastAPI app + all routes
│   ├── models.py            # SQLModel database models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── database.py          # Database connection setup
│   ├── requirements.txt     # Python dependencies
│   └── auth/
│       ├── security.py      # Password hashing + JWT creation
│       └── deps.py          # Authentication dependencies
│
└── frontend/neighborly-app/
    ├── app/
    │   ├── page.tsx         # Landing page
    │   ├── layout.tsx       # Root layout
    │   ├── dashboard/       # Main authenticated view
    │   ├── (auth)/          # Login & Register routes
    │   └── actions/         # Server Actions (auth, chat, requests)
    │
    ├── components/
    │   ├── DashboardShell.tsx  # Main dashboard client component
    │   ├── Map.tsx + MapCore.tsx  # Map components
    │   ├── CreateRequest.tsx   # Help request form dialog
    │   └── ui/                 # Shadcn UI components
    │
    └── lib/
        └── utils.ts         # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **npm** or **pnpm**

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend/neighborly-app

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 🔑 API Endpoints

### Authentication

| Method | Endpoint    | Description                 |
| ------ | ----------- | --------------------------- |
| POST   | `/register` | Create new user account     |
| POST   | `/login`    | Login and receive JWT token |
| GET    | `/users/me` | Get current user profile    |

### Users

| Method | Endpoint              | Description                  |
| ------ | --------------------- | ---------------------------- |
| GET    | `/users/nearby`       | Find neighbors within radius |
| POST   | `/users/image`        | Upload profile image         |
| GET    | `/users/{id}/reviews` | Get user's reviews           |

### Help Requests

| Method | Endpoint                             | Description              |
| ------ | ------------------------------------ | ------------------------ |
| POST   | `/requests`                          | Create new help request  |
| GET    | `/requests/me`                       | Get my requests          |
| GET    | `/requests/nearby`                   | Get nearby open requests |
| PATCH  | `/requests/{id}/accept`              | Accept a help request    |
| PATCH  | `/requests/{id}/resolve`             | Mark request as resolved |
| POST   | `/requests/{id}/resolve_with_review` | Resolve with review      |

### Messaging

| Method | Endpoint              | Description                      |
| ------ | --------------------- | -------------------------------- |
| POST   | `/messages`           | Send a message                   |
| GET    | `/messages/all`       | Get all my messages              |
| GET    | `/messages/{user_id}` | Get conversation with user       |
| WS     | `/ws/{user_id}`       | WebSocket for real-time messages |

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Overview

- **Backend**: Deployed on [Render](https://render.com) as a Web Service
- **Frontend**: Deployed on [Vercel](https://vercel.com) with automatic builds
- **Database**: PostgreSQL (Render managed or external)

## 🔧 Environment Variables

### Backend (Render)

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=your-super-secret-key-here
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)

```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

---

Built with ❤️ for communities everywhere.

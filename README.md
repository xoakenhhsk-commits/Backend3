# Fullstack Web Chat Application

Built with Next.js (Client) and Node.js + Socket.IO (Server).

## Technologies
- **Frontend**: Next.js 14, Tailwind CSS, Lucide React
- **Backend**: Express, Socket.IO
- **Design**: Premium Dark Mode, Glassmorphism
- **Features**: Real-time Chat, Image/File Upload, Room Support

## Local Setup

### 1. Server
```bash
cd server
npm install
npm start
```
Server runs on `http://localhost:3001`

### 2. Client
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:3000`

## Deployment

### Backend (Render)
1. Push to a generic Git repository.
2. Sign up/Log in to [Render](https://render.com).
3. Create a **New Web Service**.
4. Connect the repository.
5. Settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Deploy.
7. Note the URL (e.g., `https://my-chat.onrender.com`).

### Frontend (Vercel)
1. Install Vercel CLI: `npm i -g vercel`
2. `cd client`
3. Run `vercel`.
   - Follow prompts to link project.
4. Add Environment Variable:
   - Go to Vercel Dashboard -> Settings -> Environment Variables.
   - Add `NEXT_PUBLIC_SERVER_URL` = `https://your-render-url.onrender.com`.
5. Redeploy if needed.

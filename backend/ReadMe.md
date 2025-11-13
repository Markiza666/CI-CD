# 🚀 MeetUp App – Backend (Node.js + Express + PostgreSQL)

Detta är backend-delen av MeetUp-projektet. Den hanterar autentisering, användarprofiler och meetups via ett REST API.
---


## 🛠️ Teknisk stack
Server: Node.js + Express

* **Databas:** PostgreSQL

* **Autentisering:** JWT + bcrypt

* **Säkerhet:** Helmet + CORS

* **Miljöhantering:** dotenv

* **Databasaccess:** pg (node-postgres)

* **Deployment:** Docker + Render

---

## ⚙️ Kom igång lokalt

### 1. Klona projektet

```bash
git clone https://github.com/dittnamn/meetup-backend.git
cd meetup-backend
```

### 2. Installera beroenden

```bash
npm install
```
### 3. Skapa .env-fil
```env
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/meetup
JWT_SECRET=din-lokala-hemlighet
→ Lägg till .env i .gitignore → Skapa en .env.example för att visa vilka variabler som krävs
```

### 4. Starta servern
```bash
npm run dev
→ Backend körs på http://localhost:5000
```

## 📦 API-struktur
Route	Metod	Beskrivning
/api/auth/register	POST	Skapa ny användare
/api/auth/login	POST	Logga in och få JWT-token
/api/profile	GET	Hämta användarprofil (skyddad)
/api/meetups	GET	Lista alla meetups
🔐 Autentisering
Skyddade routes kräver en Authorization-header:
```Kod
Authorization: Bearer <din-token>
```

## 🐳 Docker & Deployment
Lokalt med Docker (valfritt)
```bash
docker build -t meetup-backend .
docker run -p 5000:5000 --env-file .env meetup-backend
→ Endast om du vill testa containermiljön lokalt
```

## ☁️ Deployment på Render
Render använder automatiskt din Dockerfile för att bygga och köra backend i molnet.

Render-inställningar:
Environment: Docker

Build Command: (lämnas tom)

Start Command: (hanteras av Dockerfile)

Environment Variables:

DATABASE_URL

JWT_SECRET

PORT (Render sätter ofta denna automatiskt)

→ Sätts direkt i Render eller via en Environment Group

## Dockerfile
```Dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
```
→ Byt till start om du vill köra produktion

## 📄 .env.example
```env
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/meetup
JWT_SECRET=din-lokala-hemlighet
```
→ Kopiera till .env och fyll i dina egna värden.
Mer info kommer snart kanske förhoppningsvis 1234

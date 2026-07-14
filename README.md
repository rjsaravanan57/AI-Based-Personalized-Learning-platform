# AI-Based Personalized Learning Platform

## Local development

1. Copy [server/.env.example](server/.env.example) to `server/.env` and fill in the values.
2. Copy [client/.env.example](client/.env.example) to `client/.env` if you want to override the API URL.
3. Install dependencies:
   - `npm install`
   - `cd server && npm install`
   - `cd client && npm install`
4. Start the app:
   - `npm run dev`

## Production notes

- The backend expects `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.
- The frontend uses `VITE_API_URL` for the API base URL.
- For MongoDB Atlas, make sure your cluster allows your deployment IP address.
- For Vercel deployment, configure the frontend build and set the production API URL in your environment variables.

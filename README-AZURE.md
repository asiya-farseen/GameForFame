# Azure Deployment for Figmma

## Overview
This project is a Vite + React app with an Azure Function endpoint under `api/notify`.
When a user selects an item, the frontend sends a POST to `/api/notify`.

## What you need
- GitHub repo with this project
- Azure subscription
- Azure Static Web Apps resource
- Notification credentials (SendGrid or webhook)

## Project structure
- `src/` — frontend React app
- `api/notify/index.cjs` — Azure function endpoint

## Azure Static Web App setup
1. Push repo to GitHub.
2. In Azure Portal, create a new **Static Web App**.
3. Connect to your GitHub repo and branch.
4. Set the build config:
   - App location: `/`
   - Api location: `api`
   - Output location: `dist`
5. Deploy.

## Local build check
Run:
```bash
npm install
npm run build
```

## Azure function environment variables
In the deployed Static Web App, add these settings:
- `WEBHOOK_URL` - optional webhook endpoint for notifications
- `SENDGRID_API_KEY` - optional SendGrid API key
- `SENDGRID_FROM` - from email address
- `SENDGRID_TO` - destination email address

## Notification behavior
- If `WEBHOOK_URL` is set, the function sends JSON to that URL.
- If SendGrid settings are set, it sends an email.

## Example HTTP request body from frontend
```json
{
  "id": 2,
  "title": "Golden hush",
  "text": "A little warmth, a little wonder",
  "mediaType": "image",
  "selectedAt": "2026-07-28T...Z"
}
```

## Troubleshooting
- If deployment fails, verify `api/notify/index.cjs` is included in repo.
- If notification fails, check Azure configuration values.

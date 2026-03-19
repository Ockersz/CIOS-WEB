
  # Create responsive website layout

  This is a code bundle for Create responsive website layout. The original project is available at https://www.figma.com/design/4CHy2uoOSUSaS40J6M9ZOP/Create-responsive-website-layout.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Production deploy

  This repo can now be deployed as a single Node app that serves both the frontend and the API.

  1. `git pull`
  2. `npm i`
  3. `npm run build`
  4. `npm start`

  In production:

  - The frontend is built into `dist/`
  - `server/index.js` serves the built frontend
  - API requests continue to use `/api`
  - Uploaded files are served from `/uploads`

  ## PM2 deploy

  If you want one command that builds the frontend and starts or reloads the combined app in PM2:

  1. `git pull`
  2. `npm i`
  3. `npm run build:pm2`

  Helpful PM2 commands:

  - `npm run pm2:stop` to stop and remove the app from PM2
  - `PM2_HOME=.pm2 npx pm2 logs cios-app` to view logs
  - `PM2_HOME=.pm2 npx pm2 status` to check the process list

  This setup stores PM2 state in a local `.pm2/` folder inside the repo, so it does not depend on a global home directory layout.
  

# ABCD-LFP


# File distribution


## Server side

- `config` contains important constant

- `src` folder contain all the source materials for building the project

- `src/core` contain all business logic and domain model directly related to the simulation
    - `domain` contains the domain model (conceptual model represents the entities, attributes, behaviors, and relationship within a problem domain) such as investment type
    - `simulation` the model logic (monte carol simulation)
    - `tax` contain  tax calculation logic (e.g. TaxBrackets Class)

- `src/db` contains database connectivity, model definition and manipulation
    - `models` contains the database layer model (schemas)
    - `connections` connect/disconnect mongodb
    - `respositories` contains module that responsible for interacting with data store

- `src/services` externel service call (e.g. web scraping)
    - `scraping` contain the web scraping logic for federal tax

-  `src/utils` pure tool function (no business logic, no state)
    - `validation.ts` validate data
    - `logger/logging.ts` contain our logger
    - `math/` contain math model for sampling data
    - `date.ts` format date

# Project Setup

## Environment Variables

To run this project, you need to set up environment variables for both the server and client. Follow the instructions below to create the necessary `.env` files.


### Running our code setup
1. run npm install for both `client` and `server` directory
2. to run our frontend, run `npm start dev`
3. to run our backend, run `npm start dev`
4. to run our backend test case run `npm test`

### Authentication Setup

1. **Create a `.env` file in the `server` directory:**

   Navigate to the `server` directory and create a file named `.env`.

   ```bash
   cd ABCD-LFP/server
   touch .env
   ```

2. **create google oauth key**

```
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
SESSION_SECRET=<your-session-secret>
CLIENT_URL=<url> (e.g.http://localhost:5173)
```

### Client Setup

1. **Create a `.env` file in the `client` directory:**

   Navigate to the `client` directory and create a file named `.env`.

   ```bash
   cd ABCD-LFP/client
   touch .env
   ```

2. **Add the following content to the `.env` file:**

   ```plaintext
   VITE_API_URL=http://localhost:3000
   ```

## Running the Project

1. **Start the Server:**

   ```bash
   cd ABCD-LFP/server
   npm install
   npm run dev 
   ```

2. **Start the Client:**

   ```bash
   cd ABCD-LFP/client
   npm install
   npm run dev
   ```
⚠️ Note:
- Run the **frontend** (Vite) on port `5173` (default).
- Run the **backend** on either **port `3000` or `3346`** to match the Google OAuth **Authorized Redirect URIs**.


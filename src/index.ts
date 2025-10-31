process.loadEnvFile()
import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import {
  errorMiddleWare,
  middlewareLogResponse,
  middlewareMetricsInc,
} from "./api/middleware.js";
import { handlerCreateChirps, handlerGetChirps, handlerGetChirp } from "./api/chirps.js";
import { config } from "./config.js";
import { createUserHandler } from "./api/createUser.js";
import { checkLogin } from "./api/login.js";
import { revokeRefresh } from "./api/revoke.js";
import { checkRefresh } from "./api/refresh.js";


const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express(); 

app.use(middlewareLogResponse);
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", (req, res, next) => {
  Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.get("/admin/metrics", (req, res, next) => {
  Promise.resolve(handlerMetrics(req, res)).catch(next);
});

app.get("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerGetChirps(req, res)).catch(next)
} )

app.get(`/api/chirps/:chirpID`, (req, res, next) => {
  Promise.resolve(handlerGetChirp(req, res)).catch(next);
})

app.post("/admin/reset", (req, res, next) => {
  Promise.resolve(handlerReset(req, res, next)).catch(next);
});

app.post("/api/chirps", (req, res, next) => {
  Promise.resolve(handlerCreateChirps(req, res)).catch(next);
});

app.post("/api/users", (req, res, next)=> {
  Promise.resolve(createUserHandler(req, res)).catch(next)
})
app.post("/api/login", (req, res, next) => {
  Promise.resolve(checkLogin(req, res)).catch(next)
})

app.post("/api/refresh", (req, res, next) => {
  Promise.resolve(checkRefresh(req, res)).catch(next)
})
app.post("/api/revoke", (req, res, next) => {
  Promise.resolve(revokeRefresh(req, res)).catch(next)
})

app.use(errorMiddleWare);

app.listen(config.api.port, () => {
  console.log(`Server is running at http://localhost:${config.api.port}`);
});

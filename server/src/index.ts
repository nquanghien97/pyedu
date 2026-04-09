import 'dotenv/config';
import * as express from 'express';
import * as compression from 'compression';
import helmet from 'helmet';
import * as cors from 'cors';
import * as cookieParser from "cookie-parser";
import { livezRequestHandler } from './translation/probes/livez';
import { readyzRequestHandler } from './translation/probes/readyz';
import { setupNodeProcess } from './execution/lifecycle/process';
import { lifecycle } from './execution/lifecycle/lifecycle';
import { logger } from './lib/logger';
import { jwtRouter } from './translation/routes/jwtRoute';

const allowedOrigins = [
  "http://localhost:3000",
  "https://pyedu.vercel.app/"
];

export const initialiseServer = async () => {
  setupNodeProcess();

  const app = express();
  const PORT = process.env.PORT || 8080;

  app.use(compression());
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // mobile app / postman

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  }));
  app.get('/livez', livezRequestHandler);
  app.get('/readyz', readyzRequestHandler);

  app.use('/api/v1', jwtRouter);

  const server = app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
  });

  lifecycle.on('closing', () => {
    if (server) {
      server.close();
    }
  });
};

async function startApp() {
  await initialiseServer();
}

startApp();

/* External Dependencies */
import cors from 'cors';
import express from 'express';
import { json, urlencoded } from 'body-parser';
import helmet from 'helmet';

/* Internal dependencies */
import DB from './DB/config';
import { Routes } from './interfaces/routes.interface';
import errorMiddleware from './middlewares/error.middleware';
import { LoggerService } from './utils/logger';

export default class App {
  public app: express.Application;
  public port: string | number;
  public logger: LoggerService;

  constructor(routes: Routes[]) {
    this.app = express();
    this.port = 8000;

    this.logger = new LoggerService();
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      this.logger.info(`=================================`);
      this.logger.info(`🚀 App listening on the port ${this.port}`);
      this.logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    DB.connectionDB
      .sync()
      .then(() => {
        this.logger.info('Database connection is established successfully');
      })
      .catch((err) => {
        this.logger.error('There was an error with DB: ', err);
      });
  }

  private initializeMiddlewares() {
    this.app.use(cors({ origin: '*', credentials: true }));
    this.app.use(helmet());
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use('/', route.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

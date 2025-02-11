import * as express from "express";
import * as bodyParser from "body-parser";
import { Routes } from "./routes/routes";
import * as mongoose from "mongoose";

import * as fs from 'fs';
import * as cron from "node-cron"; // Import the cron library
import * as childProcess from "child_process"; // Import child_process module

class App {

    public app: express.Application;
    public routePrv: Routes = new Routes();
    public mongoUrl: string = 'mongodb://localhost/Events';

    constructor() {
        this.app = express();
        this.config();
        this.routePrv.routes(this.app);
        this.mongoSetup();
        this.scheduleCronJob();
    }

    private config(): void {
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
    }

    private mongoSetup(): void {
        (<any>mongoose).Promise = global.Promise;
        mongoose.connect(this.mongoUrl)
            .then(() => {
                console.log("MongoDB connected successfully");
            })
            .catch((error) => {
                console.error("MongoDB connection error:", error);
            });
    }
    private scheduleCronJob(): void {
        cron.schedule('29 21  * * *', () => {
            const lockFilePath = './EventDates.lock';

            // Check if lock file exists
            if (fs.existsSync(lockFilePath)) {
                console.log('Scraper already running. Skipping execution.');
                return;
            }

            // Create lock file
            fs.writeFileSync(lockFilePath, '');

            console.log('Running EventDates.js script...');
            // Execute the results_basketball.js script using child_process.spawn
            const scraperProcess = childProcess.spawn('node', ['./lib/cron/EventDates.js']);

            // Log stdout and stderr from the results_basketball.js script
            scraperProcess.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });

            scraperProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            // Handle script exit
            scraperProcess.on('close', (code) => {
                console.log(`EventDates.js script exited with code ${code}`);
                // Remove lock file
                fs.unlinkSync(lockFilePath);
            });
        });
        cron.schedule('00 22  * * *', () => {
            const lockFilePath = './EventLinks.lock';

            // Check if lock file exists
            if (fs.existsSync(lockFilePath)) {
                console.log('Scraper already running. Skipping execution.');
                return;
            }

            // Create lock file
            fs.writeFileSync(lockFilePath, '');

            console.log('Running EventLinks.js script...');
            // Execute the results_basketball.js script using child_process.spawn
            const scraperProcess = childProcess.spawn('node', ['./lib/cron/EventLinks.js']);

            // Log stdout and stderr from the results_basketball.js script
            scraperProcess.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });

            scraperProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            // Handle script exit
            scraperProcess.on('close', (code) => {
                console.log(`EventLinks.js script exited with code ${code}`);
                // Remove lock file
                fs.unlinkSync(lockFilePath);
            });
        });

        cron.schedule('30 22 * * *', () => {
            const lockFilePath = './EventData.lock';

            // Check if lock file exists
            if (fs.existsSync(lockFilePath)) {
                console.log('Scraper already running. Skipping execution.');
                return;
            }

            // Create lock file
            fs.writeFileSync(lockFilePath, '');

            console.log('Running EventData.js script...');
            // Execute the results_basketball.js script using child_process.spawn
            const scraperProcess = childProcess.spawn('node', ['./lib/cron/EventData.js']);

            // Log stdout and stderr from the results_basketball.js script
            scraperProcess.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });

            scraperProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            // Handle script exit
            scraperProcess.on('close', (code) => {
                console.log(`EventData.js script exited with code ${code}`);
                // Remove lock file
                fs.unlinkSync(lockFilePath);
            });
        });

        cron.schedule('0 21 * * *', () => {
            const lockFilePath = './deleteData.lock';

            // Check if lock file exists
            if (fs.existsSync(lockFilePath)) {
                console.log('Scraper already running. Skipping execution.');
                return;
            }

            // Create lock file
            fs.writeFileSync(lockFilePath, '');

            console.log('Running deleteData.js script...');
            // Execute the results_basketball.js script using child_process.spawn
            const scraperProcess = childProcess.spawn('node', ['./lib/cron/deleteData.js']);

            // Log stdout and stderr from the results_basketball.js script
            scraperProcess.stdout.on('data', (data) => {
                console.log(`stdout: ${data}`);
            });

            scraperProcess.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });

            // Handle script exit
            scraperProcess.on('close', (code) => {
                console.log(`deleteData.js script exited with code ${code}`);
                // Remove lock file
                fs.unlinkSync(lockFilePath);
            });
        });
    }

}

export default new App().app;
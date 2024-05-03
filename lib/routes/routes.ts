import {NextFunction, Request, Response} from "express";
import { MongoClient } from "mongodb";
import { EventsAPIController } from "../controllers/EventsAPIController";

export class Routes {
    private readonly mongoUrl = "mongodb://localhost"; // Update with your MongoDB connection URL
    private readonly dbName = "Events"; // Update with your database name

    public EventsAPIController: EventsAPIController = new EventsAPIController();

    public routes(app): void {
       
        // Initial Route
        app.route('/api/v1/')
        .get((req: Request, res: Response) => {
            res.status(200).send({
                message: 'Welcome to Version 1.0.0 of Flashscore API!'
            })
        })

        // Authentication test route
        app.route('/api/v1/authenticate')
            .get(async (req: Request, res: Response) => {
                const authKey = req.header('Auth-Key');

                // Connect to MongoDB
                const client = new MongoClient(this.mongoUrl);
                try {
                    await client.connect();
                    const db = client.db(this.dbName);

                    // Search for the subscriber with the given authKey
                    const subscribersCollection = db.collection('subscribers');
                    const subscriber = await subscribersCollection.findOne({ authKey: authKey });

                    if (!subscriber) {
                        res.status(402).send({
                            message: 'This Auth-Key does not exist in our records. Go to https://exampleurl.com/subscribe to see our subscription plans.'
                        });
                    } else if (subscriber.status === 'Inactive') {
                        res.status(401).send({
                            message: 'Unauthorized'
                        });
                    } else {
                        res.status(200).send({
                            message: 'Authentication successful'
                        });
                    }
                } catch (error) {
                    console.error('Error:', error);
                    res.status(500).send({
                        message: 'Internal Server Error'
                    });
                } finally {
                    client.close();
                }
            });

            app.route('/api/v1/')
            .get((req: Request, res: Response, next: NextFunction) => {
                next();
            }, this.EventsAPIController.getAllEventsDates)
        }}
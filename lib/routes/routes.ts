import { NextFunction, Request, Response } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { EventsAPIController } from '../controllers/EventsAPIController';
import { exec } from 'child_process';
const dotenv = require('dotenv');

dotenv.config();

export class Routes {
    private readonly mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017';
    private readonly dbName = 'Events'; // Update with your database name

    public EventsAPIController: EventsAPIController = new EventsAPIController();

    private client: MongoClient;
    private eventsdatas;
    private eventsdataexpedias ;

    constructor() {
        this.client = new MongoClient(this.mongoUrl);
        this.client.connect().then(() => {
            const db = this.client.db(this.dbName);
            this.eventsdatas = db.collection('eventsdatas');
            this.eventsdataexpedias  = db.collection('eventsdataexpedias');
            console.log('Connected to MongoDB');
        }).catch(err => {
            console.error('Failed to connect to MongoDB', err);
        });
    }

    public routes(app): void {
        // Initial Route
        app.route('/api/v1/')
            .get((req: Request, res: Response) => {
                res.status(200).send({
                    message: 'Welcome to Version 1.0.0 of Flashscore API!'
                });
            });

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

        // app.route('/api/v1/')
        //     .get((req: Request, res: Response, next: NextFunction) => {
        //         next();
        //     }, this.EventsAPIController.getAllEventsDates);

        // GET /eventsdatas: Retrieves event data
        app.route('/api/v1/eventsdatas')
            .get(async (req: Request, res: Response) => {
                try {
                    const players = await this.eventsdatas.find({}).toArray();
                    const players_encoded = players.map(player => {
                        const player_id = player._id.toString(); // Convert ObjectId to string
                        delete player._id;
                        return { ...player, _id: player_id };
                    });
                    res.json(players_encoded);
                } catch (err) {
                    res.status(500).send(err.toString());
                }
            });

            app.route('/api/v2/eventsdatas')
            .get(async (req: Request, res: Response) => {
                try {
                    const players = await this.eventsdataexpedias .find({}).toArray();
                    const players_encoded = players.map(player => {
                        const player_id = player._id.toString(); // Convert ObjectId to string
                        delete player._id;
                        return { ...player, _id: player_id };
                    });
                    res.json(players_encoded);
                } catch (err) {
                    res.status(500).send(err.toString());
                }
            });

        // POST /run_script2: Runs specified Node.js scripts and returns their output
        app.route('/api/v1/run_script2')
            .post((req: Request, res: Response) => {
                const scriptPath = './lib/cron/EventData2.js'; // Adjust the path as necessary

                const runScript = (scriptName) => {
                    return new Promise((resolve, reject) => {
                        exec(`node ${scriptName}`, (error, stdout, stderr) => {
                            if (error) {
                                reject(stderr);
                            } else {
                                resolve(stdout);
                            }
                        });
                    });
                };

                runScript(scriptPath)
                    .then(output => res.json({ output }))
                    .catch(error => res.status(500).json({ error }));
            });

            app.route('/api/v2/run_script2')
            .post((req: Request, res: Response) => {
                const scriptPath = './lib/cron/ExpediaArbitrageCheck.js'; // Adjust the path as necessary

                const runScript = (scriptName) => {
                    return new Promise((resolve, reject) => {
                        exec(`node ${scriptName}`, (error, stdout, stderr) => {
                            if (error) {
                                reject(stderr);
                            } else {
                                resolve(stdout);
                            }
                        });
                    });
                };

                runScript(scriptPath)
                    .then(output => res.json({ output }))
                    .catch(error => res.status(500).json({ error }));
            });
    }
}

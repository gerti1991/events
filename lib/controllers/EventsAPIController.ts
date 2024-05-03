import * as mongoose from 'mongoose';
const fs = require('fs');
import { Request, Response } from "express";
import EventsDates from '../models/EventsDates';
import Subscriber from '../models/Subscriber'; // Adjust the path as needed

export class EventsAPIController {
    public async getAllEventsDates(req: Request, res: Response) {
        const authKey = req.header('Auth-Key');
        try {
            const subscriber = await Subscriber.findOne({ authKey: authKey }).exec();

            if (!subscriber) {
                return res.status(402).send('This key is not in our records.');
            } else if (subscriber.status === 'Inactive') {
                return res.status(401).send('This key is no longer active.');
            }
            // If subscriber is found and the status == 'Active', continue with the code below
            let database_events = await EventsDates.find({}).exec();
            var formated_events = [];
            database_events.forEach(event => {
                formated_events.push({
                    "EventDate": event.EventDate,
                    "EventDateId": event.EventDateId,
                    "Proccessed": event.Proccessed,
                    "UPDATED_AT": event.UPDATED_AT
                })
            })
            res.send(formated_events);

        } catch (error) {
            res.status(500).send(error);
        }
    }

}
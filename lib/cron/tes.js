const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const mongoose = require('mongoose');
const EventsDataXpedia = require('../models/ExpediaMatches'); // Corrected model name
require('../config/database'); // Ensure this file correctly connects to MongoDB

puppeteer.use(StealthPlugin());


(async () => {



    const dates = [];
    const customUA = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/120.0";
    const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox', '--start-maximized'] }); //CHANGE THIS BEFORE PUSHING
    const page = await browser.newPage();
    await page.setUserAgent(customUA);
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto("https://oddspedia.com" , { waitUntil: 'load' });
    await waitOneSecond();


    async function waitOneSecond() {
        return new Promise(async (resolve) => {
            setTimeout(function () {
                resolve();
            }, 500);
        })
    }



})();

async function upsertEventDates(eventsDataArray) {
    try {
        // Create an array to store the bulk operations
        const bulkOps = eventsDataArray.map((eventsData) => {
            const filter = {
                EventDateId: eventsData.EventDateId,
            };

            const update = { $set: eventsData };

            return {
                updateOne: {
                    filter,
                    update,
                    upsert: true,
                },
            };
        });

        // Use the bulkWrite method to perform the bulk upsert operations
        const result = await EventsDates.bulkWrite(bulkOps); // Corrected model name to "EventsDates"
        console.log(`Upserted ${result.upsertedCount} document(s)`);

        return result;
    } catch (error) {
        console.error('Error upserting basketball spreads:', error);
        throw error;
    }
}
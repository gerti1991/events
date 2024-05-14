const puppeteer = require('puppeteer');
var axios = require('axios');
const fs = require('fs');
const mongoose = require('mongoose');
require('../config/database');
const EventsLinks = require('../models/EventsLinks');
const EventsDates = require('../models/EventsDates');






(async () => {
    const events = await EventsDates.find({ Proccessed: false });
    const dates = [];
    const customUA = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/120.0";
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--start-maximized'] }); //CHANGE THIS BEFORE PUSHING
    const page = await browser.newPage();
    await page.setUserAgent(customUA);
    await page.setViewport({ width: 1920, height: 1080 });
    var all_events = [];
    // console.log(events);
    for (const link of events) {

        await page.goto(link.EventDate, { waitUntil: 'load' });

        for (i = 0; i < 8; i++) {
            await autoScroll(page);
            console.log("autoScroll Iteration: " + i);
            await waitOneSecond();
        }
        async function waitOneSecond() {
            return new Promise(async (resolve) => {
                setTimeout(function () {
                    resolve();
                }, 500);
            })
        }
        const event_links = await page.evaluate((link) => {
            var outputEvents = [];
            var league_id = window.location.href.split("/")[4] + "-" + window.location.href.split("/")[5]
            var eventRows = document.querySelectorAll(".eventRow a.ml-2");
            console.log(eventRows.length);
            eventRows.forEach(eventRow => {
                var temp = {
                    EventLink: eventRow.href + "#over-under;2",
                    EventLinkId: eventRow.href.match(/[^-]+$/)[0].replace('/', ''),
                    Proccessed: false,
                    Date: link.Date
                }

                outputEvents.push(temp);
            })
            return outputEvents;
        }, link);


        console.log("Total events: " + event_links.length);



        await EventsDates.updateOne(
            { EventDate: link.EventDate },
            { $set: { Proccessed: true } }
        );
        if (event_links.length > 0) {
            await upsertEventLinkId(event_links);
        }
    }

    await browser.close();

    async function autoScroll(page) {
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                var totalHeight = 0;
                var distance = 600;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight - window.innerHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 200);
            });
        });
    }
    setTimeout(() => {
        process.exit(0);
    }, "5000");
})();




async function upsertEventLinkId(eventsDataArray) {
    try {
        // Create an array to store the bulk operations
        const bulkOps = eventsDataArray.map((eventsData) => {
            const filter = {
                EventLinkId: eventsData.EventLinkId,
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
        const result = await EventsLinks.bulkWrite(bulkOps); // Corrected model name to "EventsDates"
        console.log(`Upserted ${result.upsertedCount} document(s)`);

        return result;
    } catch (error) {
        console.error('Error upserting basketball spreads:', error);
        throw error;
    }
}



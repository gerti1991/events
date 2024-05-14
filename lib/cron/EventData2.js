const puppeteer = require('puppeteer');
var axios = require('axios');
const fs = require('fs');
const mongoose = require('mongoose');
require('../config/database');
const EventsLinks = require('../models/EventsLinks');
const EventsData = require('../models/EventsData');


(async () => {
    const events = await EventsLinks.find({});
    (async () => {
        try {
            // Delete all documents in the EventsLinks collection
            await EventsData.deleteMany({});
            console.log('All documents deleted successfully.');
        } catch (error) {
            console.error('Error deleting documents:', error);
        }
    })();
    const dates = [];

    const customUA = "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--start-maximized'] }); //CHANGE THIS BEFORE PUSHING
    const page = await browser.newPage();
    await page.setUserAgent(customUA);
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto("https://www.betexplorer.com/", { waitUntil: 'load' });

    // console.log(events)
    var all_events = [];

    await Promise.all(events.map(async (event) => {
        // console.log(event.EventLinkId)
        try {
            const event__totals_data = await page.evaluate(async (event) => {
                // 1x2
                var a = await fetch("https://www.betexplorer.com/match-odds/" + event.EventLinkId + "/0/ou/bestOdds/", {
                    "headers": {
                        "x-requested-with": "XMLHttpRequest"
                    },
                    "method": "GET"
                }).then(response => response.json());
                // console.log(a);
                // await waitOneSecond();
                var b = []
                var inputString = a.odds.match(/<tbody id="best-odds-ou">(.*?)<\/tbody>/s)[0];
                for (var i = 0; i < inputString.split(/<\/tr>/g).length; i++) {

                    try {

                        if ((/td class="table-main__detail-odds table-main__detail-odds--first inactive/).test(inputString.split(/<\/tr>/g)[i]) == false) {
                            var temp = {}
                            temp.bookmaker = inputString.split(/<\/tr>/g)[i].match(/data-bookie="[^"]+/g)[0].replace('data-bookie="', '')
                            temp.under = inputString.split(/<\/tr>/g)[i].match(/data-odd="[^"]+/g)[1].replace('data-odd="', '')
                            temp.over = inputString.split(/<\/tr>/g)[i].match(/data-odd="[^"]+/g)[0].replace('data-odd="', '')
                            b.push(temp)
                        }
                        else {
                            continue
                        }
                    }

                    catch {
                        continue
                    }



                }

                return b;

                async function waitOneSecond() {
                    return new Promise(async (resolve) => {
                        setTimeout(function () {
                            resolve();
                        }, 500);
                    })
                }
            }, event);


            resultArray = []
            for (let i = 0; i < event__totals_data.length; i++) {
                for (let j = i + 1; j < event__totals_data.length; j++) {
                    const bookmaker1 = event__totals_data[i].bookmaker;
                    const over1 = parseFloat(event__totals_data[i].over);
                    const under1 = parseFloat(event__totals_data[i].under);

                    const bookmaker2 = event__totals_data[j].bookmaker;
                    const over2 = parseFloat(event__totals_data[j].over);
                    const under2 = parseFloat(event__totals_data[j].under);

                    const ratio1 = 1 / over1 + 1 / under2;
                    const ratio2 = 1 / under1 + 1 / over2;

                    if (ratio1 < 1) {
                        resultArray.push({
                            Link: event.EventLink,
                            Bookmaker_1: bookmaker1,
                            over1: event__totals_data[i].over,
                            Bookmaker_2: bookmaker2,
                            under2: event__totals_data[j].under,
                            ratio: ratio1,
                            event_id: bookmaker1 + "-" + bookmaker2 + "-" + event.EventLinkId,
                            Date: event.Date
                        });
                    }

                    if (ratio2 < 1) {
                        resultArray.push({
                            Link: event.EventLink,
                            Bookmaker_1: bookmaker2,
                            over1: event__totals_data[j].over,
                            Bookmaker_2: bookmaker1,
                            under2: event__totals_data[i].under,
                            ratio: ratio2,
                            event_id: bookmaker1 + "-" + bookmaker2 + "-" + event.EventLinkId,
                            Date: event.Date
                        });
                    }
                }
            }
            await EventsLinks.updateOne(
                { EventLinkId: event.EventLinkId },
                { $set: { Proccessed: true } }
            );
            if (resultArray.length > 0) {
                await upsertEventData(resultArray);
            }
            console.log(event.EventLinkId + " done");
        } catch (error) {
            console.log("error on " + event.EventLink);
            console.log(error);
        }



    }));






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

    await browser.close();
})();



async function upsertEventData(eventsDataArray) {
    try {
        // Create an array to store the bulk operations
        const bulkOps = eventsDataArray.map((eventsData) => {
            const filter = {
                event_id: eventsData.event_id,
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
        const result = await EventsData.bulkWrite(bulkOps); // Corrected model name to "EventsDates"
        console.log(`Upserted ${result.upsertedCount} document(s)`);

        return result;
    } catch (error) {
        console.error('Error upserting basketball spreads:', error);
        throw error;
    }
}



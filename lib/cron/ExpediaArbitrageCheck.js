const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');
const fs = require('fs');
const mongoose = require('mongoose');
const EventsDataXpedia = require('../models/ExpediaMatches'); // Corrected model name
const EventsDataExpediaAr = require('../models/EventsDataExpedia');
require('../config/database'); // Ensure this file correctly connects to MongoDB

puppeteer.use(StealthPlugin());

(async () => {
    try {
        var events = await EventsDataXpedia.find({});

        try {
            await EventsDataExpediaAr.deleteMany({});
            console.log('All documents deleted successfully.');
        } catch (error) {
            console.error('Error deleting documents:', error);
        }

        const customUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--start-maximized'] });
        const page = await browser.newPage();
        await page.setUserAgent(customUA);
        await page.setViewport({ width: 1920, height: 1080 });

        await page.goto("https://oddspedia.com", { waitUntil: 'load' });
        await waitOneSecond();

        async function waitOneSecond() {
            return new Promise((resolve) => {
                setTimeout(resolve, 500);
            });
        }

        const trace = await page.evaluate(async () => {
            return {
                trace_id: __SENTRY__.hub._stack[0].scope._propagationContext.traceId,
                spanId: __SENTRY__.hub._stack[0].scope._propagationContext.spanId,
                public_key: __SENTRY__.hub._stack[0].client._dsn.publicKey
            };
        });

        console.log(trace);

        await Promise.all(events.map(async (event) => {
            try {
                const event__totals_data = await page.evaluate(async (trace, event) => {
                    let apiUrl = `https://oddspedia.com/api/v1/getMatchOdds?wettsteuer=0&geoCode=AL&bookmakerGeoCode=AL&bookmakerGeoState=&r=si&matchKey=${event.event_id}&oddGroupId=4&inplay=0&language=en`;

                    var data = await fetch(apiUrl, {
                        headers: {
                            "accept": "application/json, text/plain, */*",
                            "accept-language": "en-US,en;q=0.9,it;q=0.8,sq;q=0.7"
                        },
                        referrer: "https://oddspedia.com/football",
                        method: "GET"
                    }).then(response => response.json());

                    try {
                        let temp = []

                        Object.keys(data.data.prematch[1].periods[0].odds.alternative).forEach(key => {
                            let type = data.data.prematch[1].periods[0].odds.alternative[key];
                            if (type.name == '2.5') {
                                Object.keys(type.odds).forEach(key => {
                                    let odd = type.odds[key];
                                    temp.push({
                                        bookmaker: odd.bookie_name,
                                        over: odd.o1,
                                        under: odd.o2,
                                        linkBet: odd.o1_link
                                    });
                                });
                            }
                        });

                        return temp
                    } catch (error) {
                        console.log(error)
                    }
                }, trace, event);

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
                                Link: event.link,
                                Bookmaker_1: bookmaker1,
                                linkBetB1: event__totals_data[i].o1_link,
                                over1: event__totals_data[i].over,
                                Bookmaker_2: bookmaker2,
                                linkBetB2: event__totals_data[j].o1_link,
                                under2: event__totals_data[j].under,
                                ratio: ratio1,
                                event_id: event.event_id,
                                Date: event.dat
                            });
                        }

                        if (ratio2 < 1) {
                            resultArray.push({
                                Link: event.link,
                                Bookmaker_1: bookmaker2,
                                linkBetB1: event__totals_data[j].o1_link,
                                over1: event__totals_data[j].over,
                                Bookmaker_2: bookmaker1,
                                under2: event__totals_data[i].under,
                                linkBetB2: event__totals_data[i].o1_link,
                                ratio: ratio2,
                                event_id: event.event_id,
                                Date: event.dat
                            });
                        }
                    }
                }

                if (resultArray.length > 0) {
                    await upsertEventData(resultArray);
                }
                console.log(event.link + " done");
            } catch (error) {
                console.log("error on " + event.link);
                console.log(error);
            }
        }));

        await browser.close();
        console.log('Browser closed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('An error occurred:', error);
        process.exit(1); // Ensure the process exits with a failure code
    }
})();

async function upsertEventData(eventsDataArray) {
    try {
        const bulkOps = eventsDataArray.map((eventsData) => {
            const filter = { event_id: eventsData.event_id };
            const update = { $set: eventsData };

            return {
                updateOne: {
                    filter,
                    update,
                    upsert: true
                }
            };
        });

        const result = await EventsDataExpediaAr.bulkWrite(bulkOps);
        console.log(`Upserted ${result.upsertedCount} document(s)`);

        return result;
    } catch (error) {
        console.error('Error upserting events data:', error);
        throw error;
    }
}

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1); // Exit with a failure code
});

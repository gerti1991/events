const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const mongoose = require('mongoose');
const EventsDataXpedia = require('../models/ExpediaMatches'); // Corrected model name
require('../config/database'); // Ensure this file correctly connects to MongoDB

puppeteer.use(StealthPlugin());
// const firefoxPath = 'C:\\Program Files\\Mozilla Firefox\\firefox.exe'; // Update this path if necessary

(async () => {
    // Delete all documents in the EventsDataXpedia collection
    try {
        await EventsDataXpedia.deleteMany({});
        console.log('All documents deleted successfully.');
    } catch (error) {
        console.error('Error deleting documents:', error);
    }

    const customUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--start-maximized'] });
    

    // const browser = await puppeteer.launch({
    //     executablePath: firefoxPath, // Use the installed Firefox
    //     product: 'firefox',
    //     headless: false, // Set to true if you want to run headless
    //     args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized']
    // });

    const page = await browser.newPage();
    await page.setUserAgent(customUA);
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto("https://oddspedia.com", { waitUntil: 'networkidle2' });
    const trace = await page.evaluate(async () => {
        return {
            trace_id: __SENTRY__.hub._stack[0].scope._propagationContext.traceId,
            spanId: __SENTRY__.hub._stack[0].scope._propagationContext.spanId,
            public_key: __SENTRY__.hub._stack[0].client._dsn.publicKey
        };
    });

    console.log(trace);

    const event_totals_data = await page.evaluate(async (trace) => {
        function formatDateToISO(date) {
            return date.toISOString().replace(/:/g, '%3A');
        }

        function addDays(date, days) {
            let result = new Date(date);
            result.setDate(result.getDate() + days);
            return result;
        }

        async function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async function fetchMatchesForDays(currentDate, numberOfDays) {
            const allMatches = [];

            for (let i = 0; i < numberOfDays; i++) {
                let currentStartDate = addDays(currentDate, i);
                let currentEndDate = addDays(currentDate, i + 1);
                let formattedStartDate = formatDateToISO(currentStartDate);
                let formattedEndDate = formatDateToISO(currentEndDate);
                let apiUrl = `https://oddspedia.com/api/v1/getMatchList?excludeSpecialStatus=0&sortBy=default&perPageDefault=50&startDate=${formattedStartDate}&endDate=${formattedEndDate}&geoCode=AL&status=all&sport=football&popularLeaguesOnly=0&page=1&perPage=1000&language=en`;

                try {
                    console.log(`Fetching data for ${currentStartDate.toISOString().substring(0, 10)}`);
                    console.log('Fetching URL:', apiUrl);
                    let response = await fetch(apiUrl, {
                        headers: {
                            "accept": "application/json, text/plain, */*",
                            "accept-language": "en-US,en;q=0.9,it;q=0.8,sq;q=0.7",
                            "baggage": `sentry-environment=production,sentry-release=1.248.0,sentry-public_key=${trace.public_key},sentry-trace_id=${trace.trace_id}`,
                            "priority": "u=1, i",
                            "sec-ch-ua": "\"Google Chrome\";v=\"125\", \"Chromium\";v=\"125\", \"Not-A.Brand\";v=\"99\"",
                            "sec-ch-ua-mobile": "?0",
                            "sec-ch-ua-platform": "\"Windows\"",
                            "sec-fetch-dest": "empty",
                            "sec-fetch-mode": "cors",
                            "sec-fetch-site": "same-origin",
                            "sentry-trace": `${trace.trace_id}-${trace.spanId}-0`
                        },
                        referrer: "https://oddspedia.com/football",
                        referrerPolicy: "strict-origin-when-cross-origin",
                        method: "GET",
                        mode: "cors",
                        credentials: "include"
                    });

                    console.log(`Response status: ${response.status}`);
                    if (!response.ok) {
                        console.error('Fetch failed:', response.status, response.statusText);
                        continue;
                    }

                    let data = await response.json();
                    // console.log(`Data fetched for ${currentStartDate.toISOString().substring(0, 10)}`, data);

                    let formattedData = data.data.matchList ? data.data.matchList.map(match => ({
                        dat: match.md,
                        home_team: match.ht,
                        away_team: match.at,
                        country: data.data.categoryList[match.category_id].name,
                        championship: data.data.leagueList[match.league_id].name,
                        link: "https://oddspedia.com" + match.uri,
                        event_id: match.uri.split('-').pop()
                    })) : [];

                    allMatches.push(...formattedData);
                    // console.log(`Matches for ${currentStartDate.toISOString().substring(0, 10)}`, formattedData);

                } catch (error) {
                    console.error(`Error fetching data for ${currentStartDate.toISOString().substring(0, 10)}:`, error);
                }

                // Wait for 5 seconds before moving to the next date
                await delay(5000);
            }
            return allMatches;
        }

        let numberOfDays = 10;
        let currentDate = new Date();
        let dataSet = await fetchMatchesForDays(currentDate, numberOfDays);
        return dataSet;
    }, trace);

    console.log(event_totals_data.length);
    await upsertEventData(event_totals_data);

    //  console.log("Process complete. Browser will remain open for inspection.");
    setTimeout(() => {
        process.exit(0);
    }, "5000");

    await browser.close();
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

        const result = await EventsDataXpedia.bulkWrite(bulkOps);
        console.log(`Upserted ${result.upsertedCount} document(s)`);

        return result;
    } catch (error) {
        console.error('Error upserting events data:', error);
        throw error;
    }
}

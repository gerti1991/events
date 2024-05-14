const puppeteer = require('puppeteer');
var axios = require('axios');
const fs = require('fs');
const mongoose = require('mongoose');
require('../config/database');
const EventsDates = require('../models/EventsDates');

const links = [
    "https://www.oddsportal.com/matches/football/"
];

(async () => {
    const dates = [];
    const customUA = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/120.0";
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--start-maximized'] }); //CHANGE THIS BEFORE PUSHING
    const page = await browser.newPage();
    await page.setUserAgent(customUA);
    await page.setViewport({ width: 1920, height: 1080 });

    for (let i = 1; i <= 11; i++) {
        var currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + i);
        var year = currentDate.getFullYear();
        var month = String(currentDate.getMonth() + 1).padStart(2, '0');
        var day = String(currentDate.getDate()).padStart(2, '0');
        var formattedDate = `${year}${month}${day}`;
        console.log(formattedDate);

        for (const link of links) {
            try {
                await page.goto(link + formattedDate, { waitUntil: 'load' });
                await waitOneSecond();
                var temp = {
                    EventDate: link + formattedDate + "",
                    EventDateId: formattedDate,
                    Proccessed: false,
                    Date: day + "/" + month + "/" + year,
                }
                dates.push(temp);
            } catch {
                continue;
            }
        }
    }
    if (dates.length > 0) {
        await upsertEventDates(dates);
    }
    await browser.close();
    var time_end_process = Date.now();
    var time_diff = (time_end_process - time_end_process) / 1000 / 60;
    // console.log("The process lasted " + time_diff + " minutes.");
    // console.log(moneyline_data);
    setTimeout(() => {
        process.exit(0);
    }, "5000");

    async function waitOneSecond() {
        return new Promise(async (resolve) => {
            setTimeout(function () {
                resolve();
            }, 500);
        })
    }

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
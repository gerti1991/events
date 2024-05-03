const puppeteer = require('puppeteer');
var axios = require('axios');
const fs = require('fs');
const mongoose = require('mongoose');
require('../config/database');
const EventsLinks = require('../models/EventsLinks');
const EventsData = require('../models/EventsData');


(async () => {
    const events = await EventsLinks.find({ Proccessed: false });
    const dates = [];

    const customUA = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/120.0";
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--start-maximized'] }); //CHANGE THIS BEFORE PUSHING
    const page = await browser.newPage();
    await page.setUserAgent(customUA);
    await page.setViewport({ width: 1920, height: 1080 });

    await page.goto("https://www.oddsportal.com/login", { waitUntil: 'load' });

    // await page.reload({ waitUntil: 'load' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.type('#login-username-sign', "GSCorp");
    await page.type('#login-password-sign', "Itreg123!");
    await Promise.all([
        page.click('[name="login-submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
    ]);
    var all_events = [];

    for (const event of events) {
        await page.goto(event.EventLink, { waitUntil: 'load' });
        try {
            const event__totals_data = await page.evaluate(async () => {

                document.querySelectorAll(".group button")[0].click()
                await waitOneSecond();
                document.querySelector(".group .dropdown-content li a").click()
                await waitOneSecond();

                document.querySelectorAll(".border-black-borders.flex.h-9.cursor-pointer.border-b.border-l.border-r.text-xs").forEach(row => {
                    if (row.querySelector(".flex.w-full.items-center.justify-start.pl-3.font-bold").innerText.includes("2.5")) {
                        row.click();
                    }
                })
                
                await waitOneSecond();
                var all_totals = [];
                var bookmakers = document.querySelectorAll(".border-black-borders.flex.h-9.border-b.text-xs.bg-gray-med_light.border-black-borders.border-b:not(:has(p.height-content.line-through))");
                for (bookmaker of bookmakers) {
                    var overElement = bookmaker.querySelectorAll("div.border-black-borders.relative.flex-col.items-center.justify-center.gap-1.border-l.border-black-borders")[0];
                    var underElement = bookmaker.querySelectorAll("div.border-black-borders.relative.flex-col.items-center.justify-center.gap-1.border-l.border-black-borders")[1];
                    var bookmakerImg = bookmaker.querySelector("a img");
                
                    var over = overElement ? overElement.innerText.trim() : 1;
                    var under = underElement ? underElement.innerText.trim() : 1;
                    var bookmaker_name = bookmakerImg ? bookmakerImg.title : "None";
                
                    var total = {
                        "over": ((over == "-") ? 1 : over),
                        "under": ((under == "-") ? 1 : under),
                        "bookmaker_name": bookmaker_name,
                    };
                    all_totals.push(total);
                }



                async function waitOneSecond() {
                    return new Promise(async (resolve) => {
                        setTimeout(function () {
                            resolve();
                        }, 500);
                    })
                }

                return all_totals;
            });


            resultArray = []
            for (let i = 0; i < event__totals_data.length; i++) {
                for (let j = i + 1; j < event__totals_data.length; j++) {
                    const bookmaker1 = event__totals_data[i].bookmaker_name;
                    const over1 = parseFloat(event__totals_data[i].over);
                    const under1 = parseFloat(event__totals_data[i].under);

                    const bookmaker2 = event__totals_data[j].bookmaker_name;
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
                            event_id:bookmaker1+"-"+bookmaker2+"-"+event.EventLinkId
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
                            event_id:bookmaker1+"-"+bookmaker2+"-"+event.EventLinkId
                        });
                    }
                }
            }
            await EventsLinks.updateOne(
                { EventLinkId: event.EventLinkId },
                { $set: { Proccessed: true } }
            );
            if (resultArray.length > 0){
            await upsertEventData(resultArray);
            }

        } catch (error) {
            console.log("error on " + event.EventLink);
            console.log(error);
        }



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



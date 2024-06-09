
// https://oddspedia.com/
// Getting match status

var a = await fetch("https://oddspedia.com/api/v1/getMatchOdds?wettsteuer=0&geoCode=AL&bookmakerGeoCode=AL&bookmakerGeoState=&r=si&matchKey=127025&oddGroupId=4&inplay=0&language=en", {
    "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",

    },
    "referrer": "https://oddspedia.com/football",

    "method": "GET",

}).then(response => response.json())

// Getting all matches

var b = await fetch("https://oddspedia.com/api/v1/getMatchList?excludeSpecialStatus=0&sortBy=default&perPageDefault=50&startDate=2024-05-20T22%3A00%3A00Z&endDate=2024-05-21T21%3A59%3A59Z&geoCode=AL&status=all&sport=football&popularLeaguesOnly=0&page=1&perPage=50&language=en", {
    "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "baggage": "sentry-environment=production,sentry-release=1.248.0,sentry-public_key=5ee11cd5558a468388340fbac8cfe782,sentry-trace_id=01646663f567445e9672f82dbf5822ec",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sentry-trace": "01646663f567445e9672f82dbf5822ec-a8b82a8572cae6a7-0"
    },
    "referrer": "https://oddspedia.com/football",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": null,
    "method": "GET",
    "mode": "cors",
    "credentials": "include"
}).then(response => response.json())


// Helper function to format date in the desired format
function formatDateToISO(date) {
    return date.toISOString().replace(/:/g, '%3A');
}

// Helper function to add days to a date
function addDays(date, days) {
    let result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// Helper function to format current date and time
function getCurrentFormattedDateTime() {
    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

// Define the number of days
let numberOfDays = 20;

// Get the current date and time in UTC
let currentDate = new Date();

async function fetchMatchesForDays(currentDate, numberOfDays) {
    const allMatches = [];

    for (let i = 0; i < numberOfDays; i++) {
        // Calculate start and end date for the current iteration
        let currentStartDate = addDays(currentDate, i);
        let currentEndDate = addDays(currentDate, i + 1);
        
        // Format dates to the desired format
        let formattedStartDate = formatDateToISO(currentStartDate);
        let formattedEndDate = formatDateToISO(currentEndDate);

        // Construct the API URL
        let apiUrl = `https://oddspedia.com/api/v1/getMatchList?excludeSpecialStatus=0&sortBy=default&perPageDefault=50&startDate=${formattedStartDate}&endDate=${formattedEndDate}&geoCode=AL&status=all&sport=football&popularLeaguesOnly=0&page=1&perPage=1000&language=en`;

        try {
            // Fetch the data
            let response = await fetch(apiUrl, {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "en-US,en;q=0.9",
                    "baggage": "sentry-environment=production,sentry-release=1.248.0,sentry-public_key=5ee11cd5558a468388340fbac8cfe782,sentry-trace_id=01646663f567445e9672f82dbf5822ec",
                    "priority": "u=1, i",
                    "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "sentry-trace": "01646663f567445e9672f82dbf5822ec-a8b82a8572cae6a7-0"
                },
                "referrer": "https://oddspedia.com/football",
                "referrerPolicy": "strict-origin-when-cross-origin",
                "body": null,
                "method": "GET",
                "mode": "cors",
                "credentials": "include"
            });

            let data = await response.json();

            // Extract match data and format it
            let formattedData = {
                    matchList: data.data.matchList ? data.data.matchList.map(match => ({
                        dat: match.md,
                        home_team: match.ht,
                        away_team: match.at,
                        country:data.data.categoryList[match.category_id].name,
                        championship:data.data.leagueList[match.league_id].name,
                        link: "https://oddspedia.com"+match.uri,
                        id: match.uri.split('-').pop()
                    })) : []
                }

            // Add the formatted data to allMatches array
            allMatches.push(formattedData);

           return formattedData

        } catch (error) {
            console.error(`Error fetching data for ${currentStartDate.toISOString().substring(0, 10)}:`, error);
        }
    }


}

fetchMatchesForDays(currentDate, numberOfDays);

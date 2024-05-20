
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
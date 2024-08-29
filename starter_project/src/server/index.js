var path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

const cors = require("cors");

app.use(cors());
app.use(bodyParser.json());

// Variables for url and api key
const meaningCloudURL = "https://api.meaningcloud.com/sentiment-2.1";
const apiKey = process.env.meaning_cloud_API_KEY;

app.use(express.static("dist"));

app.get("/", function (req, res) {
    res.sendFile("dist/index.html");
});

// POST Route
app.post("/api", function (req, res) {
    fetch(meaningCloudURL, {
        method: "POST",
        body: new URLSearchParams({
            key: apiKey,
            url: req.body.URL,
            lang: "en",
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            res.json(data);
        })
        .catch((error) => {
            console.error("Error:", error);
            res.status(500).send("An error occurred");
        });
});

// Designates what port the app will listen to for incoming requests
app.listen(8000, function () {
    console.log("Example app listening on port 8000!");
});

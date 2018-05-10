const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

mongoose.connect("mongodb://localhost/urlshortenerDB");

app.use(bodyParser.json());

const urlSchema = new mongoose.Schema({
    url: String,
    shortened: Number,
});
const urlModel = mongoose.model('urlModel', urlSchema);


app.get("/", function (req, res) {
    res.send("For instructions on how to use, look at the github repo");
});

app.get("/new/:url(*)", function (req, res) {
    let url = req.params.url;
    let number = randomInt(1, 10000);
    while (ifNumExists(number) === true) {
        number = randomInt(1, 10000);
    }
    if (urlValidation(url) === false) { //check if url format is valid
        res.json({
            original: "error",
            shortened: "error"
        });
    } else {
        let newurl = {
            url: url,
            shortened: number
        }
        urlModel.create(newurl, function (err, newlyCreatedURL) {
            if (err) {
                console.log(err);
            } else {
                res.json({
                    original: newlyCreatedURL.url,
                    shortened: newlyCreatedURL.shortened
                });
            }
        })
    }
});

app.get("/r/:shortenedurl", function (req, res) {
    const su = req.params.shortenedurl;
    urlModel.findOne({
        shortened: su
    }, (err, doc) => {
        if (err) {
            res.json({
                error: "something went wrong"
            });
        } else if (doc) {
            res.redirect(doc.url);
        } else {
            res.json({
                error: "doesn't exist"
            });
        }
    });
});

app.get("*", function (req, res) {
    res.send("hit route that dont exist");
});

app.listen(3000, function () {
    console.log("server is online");
});

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function urlValidation(url) {
    if (/^(http|https):\/\/www.\w+.com/.test(url) || /^(http|https):\/\/.\w+.com/.test(url) === true) {
        return true;
    } else {
        return false;
    }
}

function ifNumExists(num) {
    urlModel.find({
        shortened: num
    }, function (err, docs) {
        if (docs.length) {
            return true;
        } else {
            return false;
        }
    });
}
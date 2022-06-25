require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const MY_PHONE_NUMBER = process.env.MY_PHONE_NUMBER;
const twilioClient = require("twilio")(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

// url for amazon product
const URL =
  "https://www.amazon.in/Portronics-Adapto-Adapter-Charger-Charging/dp/B08VS3YLRK/ref=sr_1_1_sspa?keywords=apple+c+type+adapter&qid=1656145844&sprefix=apple+c+typ%2Caps%2C219&sr=8-1-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUExQjg3WTIzRFpZU1Q1JmVuY3J5cHRlZElkPUEwNDM4MDU2QUExTEZVQkFZSEJXJmVuY3J5cHRlZEFkSWQ9QTAxOTQ2ODUzU0ZRTEZHVU5UM1E0JndpZGdldE5hbWU9c3BfYXRmJmFjdGlvbj1jbGlja1JlZGlyZWN0JmRvTm90TG9nQ2xpY2s9dHJ1ZQ==";

// product object
const product = { name: "", price: 0, link: "" };
let counter = 1;

// scapper method
const scrap = async () => {
  console.log("Scrapper counter = ", counter);
  counter++;
  const { data } = await axios.get(URL);

  const $ = cheerio.load(data);

  const itemOnAmazon = $("div#dp-container");
  product.name = $(itemOnAmazon).find("h1 span#productTitle").text().trim();
  const price = $(itemOnAmazon)
    .find("span .a-price-whole")
    .first()
    .text()
    .replace(/[,.]/g, "");
  product.price = parseInt(price);
  product.link = URL;

  if (product.price < 500) {
    twilioClient.messages
      .create({
        body: `The price of ${product.name} has went lower as Rs. ${price}. Purchase it at ${product.link}`,
        from: TWILIO_PHONE_NUMBER,
        to: MY_PHONE_NUMBER,
      })
      .then((message) => {
        clearInterval(scrapRunner);
        counter = 0;
      });
  }
};

const scrapRunner = setInterval(scrap, 30000);
scrap();

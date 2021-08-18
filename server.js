const express = require("express");
const axios = require("axios");
const cron = require("node-cron");
const cheerio = require("cheerio");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Puxar Soybeans CBOT

cron.schedule(
  "00 17 * * *",
  () => {
    //
  },
  {
    scheduled: true,
    timezone: "America/Sao_Paulo",
  }
);

const getPriceFeed = async () => {
  try {
    const siteUrl = "https://coinmarketcap.com";

    const { data } = await axios({
      method: "GET",
      url: siteUrl,
    });

    const $ = cheerio.load(data);
    const elemSelector =
      "#__next > div > div.main-content > div.sc-57oli2-0.dEqHl.cmc-body-wrapper > div > div > div.h7vnx2-1.bFzXgL > table > tbody > tr";

    const keys = [
      "rank",
      "name",
      "price",
      "24h",
      "7d",
      "marketCap",
      "volume",
      "circulatingSupply",
    ];

    const coinArr = [];

    $(elemSelector).each((parentIdx, parentElem) => {
      let keyIdx = 0;
      const coinObj = {};

      if (parentIdx <= 9) {
        $(parentElem)
          .children()
          .each((childIdx, childElem) => {
            let tdValue = $(childElem).text();

            if (keyIdx === 1 || keyIdx === 6) {
              tdValue = $("p:first-child", $(childElem).html()).text();
            }

            if (tdValue) {
              coinObj[keys[keyIdx]] = tdValue;

              keyIdx++;
            }
          });

        coinArr.push(coinObj);
      }
    });
    return coinArr
  } catch (e) {
    console.error(e);
  }
};

app.get("/api/price-feed", async (req, res) => {
  try {
    const priceFeed = await getPriceFeed();
    
    return res.status(200).json({
        result: priceFeed
    })
  } catch (e) {
      return res.status(500).json({
          error: e.toString()
      })
  }
});

const porta = 3003;
app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
});

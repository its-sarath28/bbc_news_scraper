const axios = require("axios");
const cheerio = require("cheerio");
const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bbc_scraper",
});

connection.connect((err) => {
  if (err) {
    console.log(`Error connecting DB: ${err}`);
    return;
  } else {
    console.log(`Connected to DB`);
  }
});

const scrapeBBCNewsHeadlines = async () => {
  try {
    const response = await axios.get("https://www.bbc.com/news");

    const $ = cheerio.load(response.data);

    const newsHeadlines = [];
    $("h2.sc-4fedabc7-3.zTZri").each((index, element) => {
      const headline = $(element).text().trim();
      newsHeadlines.push(headline);
    });

    return newsHeadlines;
  } catch (err) {
    console.log(`Error scraping BBC news headlines: ${err}`);
    return [];
  }
};

const saveToDB = (news) => {
  const query = "INSERT INTO news (headline) VALUES ?";
  const values = news.map((headline) => [headline]);

  connection.query(query, [values], (err, results) => {
    if (err) {
      console.error("Error saving to database:", err);
      return;
    }
    console.log("News saved to database.");
  });
};

const main = async () => {
  const news = await scrapeBBCNewsHeadlines();
  saveToDB(news);
};

main();

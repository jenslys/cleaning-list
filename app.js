const express = require("express");
const cron = require("node-cron");
const fs = require("fs");
const fetch = require("node-fetch");
const app = express();
const port = process.env.PORT || 3000;
const seedrandom = require("seedrandom");

const { createGraph, edmondsKarp } = require("./edmondsKarp");

// Function to get the current week number
function getCurrentWeekNumber() {
  // Get the current date and time in Norway/Oslo timezone
  const now = new Date().toLocaleString("en-US", { timeZone: "Europe/Oslo" });
  const onejan = new Date(new Date().getFullYear(), 0, 1).toLocaleString(
    "en-US",
    { timeZone: "Europe/Oslo" }
  );

  // Convert the date strings to Date objects
  const nowDate = new Date(now);
  const onejanDate = new Date(onejan);

  // Calculate the week number
  const weekNumber = Math.ceil(
    ((nowDate - onejanDate) / 86400000 + onejanDate.getDay() + 1) / 7
  );

  return weekNumber;
}

// Rooms and people
const rooms = [
  "Toppetasjen",
  "Toppetasjen Bad",
  "Stua",
  "Kjøkkenet",
  "Hovedetasjen Bad",
  "Inngangsparti",
];
const people = [
  "Jens",
  "Martin",
  "Lars",
  "Håkon",
  "Aslak",
  "Aksel",
  "Odd Fredrik",
];

// Map of people to their respective restrictions
const restrictions = {
  Martin: ["Hovedetasjen Bad"],
  Lars: ["Hovedetasjen Bad"],
  Håkon: ["Hovedetasjen Bad"],
  Aslak: ["Toppetasjen", "Toppetasjen Bad"],
  Aksel: ["Toppetasjen", "Toppetasjen Bad"],
  "Odd Fredrik": ["Toppetasjen", "Toppetasjen Bad"],
};

// Function to generate the cleaning list based on a given seed
function generateCleaningList(seed) {
  const rng = seedrandom(seed); // Use the seedrandom function

  // If people are not shuffled, one person will always get nothing
  // and if rooms are not shuffled, every person will get the same room every week
  const peopleShuffled = people.slice().sort(() => rng() - 0.5);
  const roomsShuffled = rooms.slice().sort(() => rng() - 0.5);

  const graph = createGraph(peopleShuffled, roomsShuffled, restrictions);
  const sink = roomsShuffled.length + peopleShuffled.length + 1;
  const flowTable = edmondsKarp(graph, 0, sink);

  const cleaningList = {};
  // Loop over people instead of peopleShuffled to get the original order shown on the website
  for (let person of people) {
    cleaningList[person] = [];
    flowTable[peopleShuffled.indexOf(person) + 1].forEach((flow, index) => {
      if (flow > 0) {
        cleaningList[person].push(
          roomsShuffled[index - peopleShuffled.length - 1]
        );
      }
    });

    // If the person has no rooms, add "Ingenting" to the list
    if (cleaningList[person].length === 0) {
      cleaningList[person].push("Ingenting");
    }
  }

  return cleaningList;
}

// Route to display the cleaning list as an HTML list
app.get("/", (req, res) => {
  const weekNumber = getCurrentWeekNumber();
  const seed = `Week${weekNumber}`; // Use the week number as the seed
  const cleaningList = generateCleaningList(seed);

  // Render the page with the cleaning list
  res.render("index", { cleaningList, weekNumber });
});

// Set the view engine to EJS
app.set("view engine", "ejs");
app.use(express.static("public"));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

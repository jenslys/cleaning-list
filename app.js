const express = require("express");
const cron = require("node-cron");
const fs = require("fs");
const fetch = require("node-fetch");
const app = express();
const port = 3000;
const seedrandom = require("seedrandom");

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
const people = ["Jens", "Martin", "Lars", "Håkon", "Aslak", "Aksel"];

// Map of people to their respective restrictions
const restrictions = {
  Martin: ["Hovedetasjen Bad"],
  Lars: ["Hovedetasjen Bad"],
  Håkon: ["Hovedetasjen Bad"],
  Aslak: ["Toppetasjen", "Toppetasjen Bad"],
  Aksel: ["Toppetasjen", "Toppetasjen Bad"],
};

// Function to generate the cleaning list based on a given seed
function generateCleaningList(seed) {
  const rng = seedrandom(seed); // Use the seedrandom function
  const shuffledRooms = rooms.slice().sort(() => rng() - 0.5);

  const cleaningList = {};
  for (const person of people) {
    const personRestrictions = restrictions[person] || [];
    const availableRooms = shuffledRooms.filter((room) => {
      const isRestricted = personRestrictions.includes(room);
      //console.log(`${person} - ${room} - Restricted: ${isRestricted}`);
      return !isRestricted;
    });

    cleaningList[person] = availableRooms.length
      ? availableRooms[0]
      : "Ingenting";
    if (availableRooms.length) {
      shuffledRooms.splice(shuffledRooms.indexOf(availableRooms[0]), 1);
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

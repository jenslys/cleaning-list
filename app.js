const express = require("express");
const cron = require("node-cron");
const fs = require("fs");
const fetch = require("node-fetch");
const app = express();
const port = 3000;

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
  "Badet i hovedetasjen",
  "Inngangsparti",
];
const people = ["Jens", "Martin", "Lars", "Håkon", "Aslak", "Aksel"];

// Map of people to their respective restrictions
const restrictions = {
  Jens: ["Badet i hovedetasjen"],
  Martin: ["Badet i hovedetasjen"],
  Lars: ["Badet i hovedetasjen"],
  Håkon: ["Badet i hovedetasjen"],
  Aslak: ["Toppetasjen", "Toppetasjen Bad"],
  Aksel: ["Toppetasjen", "Toppetasjen Bad"],
};

// Function to generate the cleaning list
function generateCleaningList() {
  // Shuffle the rooms to randomize the assignment
  const shuffledRooms = rooms.sort(() => 0.5 - Math.random());

  // Assign rooms to people based on restrictions
  const cleaningList = {};
  for (const person of people) {
    const availableRooms = shuffledRooms.filter((room) => {
      const personRestrictions = restrictions[person] || [];
      return !personRestrictions.includes(room);
    });

    cleaningList[person] = availableRooms.length
      ? availableRooms[0]
      : "Ingenting";
    if (availableRooms.length) {
      shuffledRooms.splice(shuffledRooms.indexOf(availableRooms[0]), 1);
    }
  }

  // Save the cleaning list to a file (cleaning-list.json)
  fs.writeFile(
    "cleaning-list.json",
    JSON.stringify(cleaningList, null, 2),
    (err) => {
      if (err) {
        console.error("Error saving cleaning list:", err);
      } else {
        console.log("Cleaning list has been saved to cleaning-list.json");
      }
    }
  );

  return cleaningList;
}

// Function to ping itself to keep the website alive on Render (https://render.com/docs/free#free-web-services)
async function pingCleaningList() {
  try {
    const response = await fetch("https://cleaning-list.onrender.com/");
    const data = await response.text();
    console.log("Ping successful. Response:", data);
  } catch (error) {
    console.error("Error pinging cleaning list:", error);
  }
}

// Route to display the cleaning list as an HTML list
app.get("/", (req, res) => {
  fs.readFile("cleaning-list.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading cleaning list:", err);
      // If there was an error reading the file, generate a new cleaning list
      const cleaningList = generateCleaningList();
      const weekNumber = getCurrentWeekNumber();
      res.render("index", { cleaningList, weekNumber });
    } else {
      try {
        // Attempt to parse the JSON data from the file
        const cleaningList = JSON.parse(data);
        const weekNumber = getCurrentWeekNumber();
        res.render("index", { cleaningList, weekNumber });
      } catch (parseError) {
        // If there was an error parsing the JSON data, generate a new cleaning list
        console.error("Error parsing cleaning list:", parseError);
        const cleaningList = generateCleaningList();
        const weekNumber = getCurrentWeekNumber();
        res.render("index", { cleaningList, weekNumber });
      }
    }
  });
});

// Set the view engine to EJS
app.set("view engine", "ejs");
app.use(express.static("public"));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port:${port}`);
  generateCleaningList(); // Generate the cleaning list when the server starts

  // Schedule the list generation to run every Monday at 12:00 AM
  cron.schedule(
    "0 0 * * 1",
    () => {
      console.log("Generating the cleaning list...");
      generateCleaningList();
    },
    { timezone: "Europe/Oslo" }
  );

  // Schedule the ping to run every 10 minutes
  cron.schedule(
    "*/10 * * * *",
    () => {
      console.log("Pinging Website");
      pingCleaningList();
    },
    { timezone: "Europe/Oslo" }
  );
});

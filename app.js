const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("node:path");

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
  "Gang + Trapp",
  "Ingenting",
];
const people = [
  "Jens",
  "Martin",
  "Lars",
  "Haakon",
  "Aslak",
  "Aksel",
  "Odd_Fredrik",
];

// Map of people to their respective restrictions
const restrictions = {
  Martin: ["Hovedetasjen Bad"],
  Lars: ["Hovedetasjen Bad"],
  Haakon: ["Hovedetasjen Bad"],
  Aslak: ["Toppetasjen Bad"],
  Aksel: ["Toppetasjen Bad"],
  Odd_Fredrik: ["Toppetasjen Bad"],
  Jens: [],
};

function simulateWeeks(numWeeks) {
  const currentWeek = getCurrentWeekNumber();
  for (let i = 0; i < numWeeks; i++) {
    const weekNumber = currentWeek + i;
    const cleaningList = generateCleaningList(weekNumber);
    console.log(`Week ${weekNumber}:`, cleaningList);
  }
}

simulateWeeks(10); // Simulate the next 10 weeks

// Function to generate the cleaning list based on the current week number
function generateCleaningList(weekNumber) {
  const cleaningList = {};
  const assignedRooms = new Set();

  // Calculate the rotation index based on the current week number
  const rotationIndex = weekNumber % people.length;

  // Create two lists: one for people with restrictions and one for people without
  const peopleWithRestrictions = people.filter(
    (person) => restrictions[person]
  );
  const peopleWithoutRestrictions = people.filter(
    (person) => !restrictions[person]
  );

  // Function to assign rooms to a list of people
  const assignRooms = (peopleList, startIndex) => {
    for (let i = 0; i < peopleList.length; i++) {
      const person = peopleList[i];
      let roomIndex = (startIndex + i) % rooms.length;
      let counter = 0;

      // Keep rotating until we find a room without a restriction and not already assigned
      while (
        (assignedRooms.has(rooms[roomIndex]) ||
          (restrictions[person] &&
            restrictions[person].includes(rooms[roomIndex]))) &&
        counter < rooms.length
      ) {
        roomIndex = (roomIndex + 1) % rooms.length;
        counter++;
      }

      // If we couldn't find a room, assign null
      if (counter === rooms.length) {
        cleaningList[person] = null;
      } else {
        cleaningList[person] = rooms[roomIndex];
        assignedRooms.add(rooms[roomIndex]);
      }
    }
  };

  // Assign rooms to people without restrictions first, then to people with restrictions
  assignRooms(peopleWithoutRestrictions, rotationIndex);
  assignRooms(
    peopleWithRestrictions,
    rotationIndex + peopleWithoutRestrictions.length
  );

  return cleaningList;
}

// Route to display the cleaning list as an HTML list
app.get("/", (req, res) => {
  const weekNumber = getCurrentWeekNumber();
  const cleaningList = generateCleaningList(weekNumber);

  // Render the page with the cleaning list
  res.render("index", { cleaningList, weekNumber });
});

// Set the view engine to EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

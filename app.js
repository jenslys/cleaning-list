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

// Function to assign rooms to a list of people
const assignRooms = (
  peopleList,
  startIndex,
  weekNumber,
  lastAssigned,
  assignedRooms,
  cleaningList
) => {
  let localIndex = startIndex;
  for (let person of peopleList) {
    let assignedRoom = null;
    let attempts = 0;

    while (!assignedRoom && attempts < rooms.length) {
      let tryRoomIndex = (localIndex + attempts) % rooms.length;
      let room = rooms[tryRoomIndex];

      if (
        !assignedRooms.has(room) &&
        (!restrictions[person] || !restrictions[person].includes(room)) &&
        room !== lastAssigned[person]
      ) {
        assignedRoom = room;
        assignedRooms.add(room);
        lastAssigned[person] = room; // Update the last assigned room for the person
        localIndex = (tryRoomIndex + 1) % rooms.length; // Update localIndex for the next person
      }
      attempts++;
    }

    // If no room is found after all attempts, check if any room is actually available
    if (!assignedRoom) {
      for (let room of rooms) {
        if (
          !assignedRooms.has(room) &&
          (!restrictions[person] || !restrictions[person].includes(room))
        ) {
          assignedRoom = room;
          assignedRooms.add(room);
          lastAssigned[person] = room;
          break;
        }
      }
    }

    // Assign 'Ingenting' only if all rooms are taken or restricted
    cleaningList[person] = assignedRoom || "Ingenting";
  }
};

// Adjust the generateCleaningList function to pass the cleaningList object to assignRooms
function generateCleaningList(weekNumber, lastAssigned) {
  const cleaningList = {};
  const assignedRooms = new Set(); // This set keeps track of rooms already assigned

  // Calculate the rotation index based on the current week number
  const rotationIndex = weekNumber % people.length;

  // Create two lists: one for people with restrictions and one for people without
  const peopleWithRestrictions = people.filter(
    (person) => restrictions[person]
  );
  const peopleWithoutRestrictions = people.filter(
    (person) => !restrictions[person]
  );

  // Assign rooms to people without restrictions first, then to people with restrictions
  assignRooms(
    peopleWithoutRestrictions,
    rotationIndex,
    weekNumber,
    lastAssigned,
    assignedRooms,
    cleaningList
  );
  assignRooms(
    peopleWithRestrictions,
    rotationIndex + peopleWithoutRestrictions.length,
    weekNumber,
    lastAssigned,
    assignedRooms,
    cleaningList
  );

  return cleaningList;
}

// Initialize a map to keep track of the last room assigned to each person
const lastAssigned = people.reduce((acc, person) => {
  acc[person] = null;
  return acc;
}, {});

// Simulate the weeks, passing the lastAssigned map to generateCleaningList
function simulateWeeks(numWeeks) {
  const currentWeek = getCurrentWeekNumber();
  for (let i = 0; i < numWeeks; i++) {
    const weekNumber = currentWeek + i;
    const cleaningList = generateCleaningList(weekNumber, lastAssigned);
    console.log(`Week ${weekNumber}:`, cleaningList);
  }
}

simulateWeeks(10); // Simulate the next 10 weeks

// Route to display the cleaning list as an HTML list
app.get("/", (req, res) => {
  const weekNumber = getCurrentWeekNumber();
  const cleaningList = generateCleaningList(weekNumber, lastAssigned);

  // Render the page with the cleaning list
  res.render("index", {
    cleaningList,
    weekNumber,
    generateCleaningList,
    lastAssigned,
  });
});

// Set the view engine to EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

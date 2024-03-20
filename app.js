const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("node:path");

// Function to calculate the current week number based on the current date and timezone
function getCurrentWeekNumber() {
  // Get current date in Europe/Oslo timezone
  const now = new Date().toLocaleString("en-US", { timeZone: "Europe/Oslo" });
  // Get January 1st of the current year in Europe/Oslo timezone
  const onejan = new Date(new Date().getFullYear(), 0, 1).toLocaleString(
    "en-US",
    { timeZone: "Europe/Oslo" }
  );

  // Convert strings to Date objects
  const nowDate = new Date(now);
  const onejanDate = new Date(onejan);

  // Calculate week number
  const weekNumber = Math.ceil(
    ((nowDate - onejanDate) / 86400000 + onejanDate.getDay() + 1) / 7
  );

  return weekNumber;
}

// Predefined list of rooms for cleaning assignments
const rooms = [
  "Toppetasjen",
  "Stua",
  "Kjøkkenet",
  "Hovedetasjen Bad",
  "Inngangsparti",
  "Gang + Trapp",
  "Toppetasjen Bad",
  "Ingenting",
];

// List of people responsible for cleaning
const people = [
  "Jens",
  "Martin",
  "Lars",
  "Håkon",
  "Aslak",
  "Aksel",
  "Odd Fredrik",
];

// Restrictions for certain people to not be assigned specific rooms
const restrictions = {
  Martin: ["Hovedetasjen Bad"],
  Lars: ["Hovedetasjen Bad"],
  Håkon: ["Hovedetasjen Bad"],
  Aslak: ["Toppetasjen Bad"],
  Aksel: ["Toppetasjen Bad"],
  "Odd Fredrik": ["Toppetasjen Bad"],
  Jens: [],
};

// Function to assign rooms to people based on restrictions, previous assignments, and a rotation system
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

    // Attempt to assign a room, excluding "Ingenting" from initial attempts
    while (!assignedRoom && attempts < rooms.length - 1) {
      let tryRoomIndex = (localIndex + attempts) % (rooms.length - 1);
      let room = rooms[tryRoomIndex];

      // Check if room is available, not restricted, and not the last assigned room
      if (
        !assignedRooms.has(room) &&
        (!restrictions[person] || !restrictions[person].includes(room)) &&
        room !== lastAssigned[person]
      ) {
        assignedRoom = room;
        assignedRooms.add(room);
        lastAssigned[person] = room;
        localIndex = (tryRoomIndex + 1) % (rooms.length - 1);
      }
      attempts++;
    }

    // If no room is assigned, assign "Ingenting" or any available room without restrictions
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

    // Update cleaning list with the assigned room or "Ingenting"
    cleaningList[person] = assignedRoom || "Ingenting";
  }
};

// Function to generate a cleaning list for a given week number
function generateCleaningList(weekNumber, lastAssigned) {
  const cleaningList = {};
  const assignedRooms = new Set();
  const specialTask = "NB! Vask og erstatt håndkler.";
  const roomsWithSpecialTask = [
    "Hovedetasjen Bad",
    "Toppetasjen Bad",
    "Kjøkkenet",
  ];

  // Calculate rotation index based on week number
  const rotationIndex = weekNumber % people.length;

  // Separate people with and without restrictions
  const peopleWithRestrictions = people.filter(
    (person) => restrictions[person]
  );
  const peopleWithoutRestrictions = people.filter(
    (person) => !restrictions[person]
  );

  // Assign rooms to people without restrictions
  assignRooms(
    peopleWithoutRestrictions,
    rotationIndex,
    weekNumber,
    lastAssigned,
    assignedRooms,
    cleaningList
  );
  // Assign rooms to people with restrictions
  assignRooms(
    peopleWithRestrictions,
    rotationIndex + peopleWithoutRestrictions.length,
    weekNumber,
    lastAssigned,
    assignedRooms,
    cleaningList
  );

  // Add special tasks to certain rooms every second week
  if (weekNumber % 2 === 0) {
    for (const room of roomsWithSpecialTask) {
      for (const person in cleaningList) {
        if (cleaningList[person] === room) {
          cleaningList[person] += ` ++ ${specialTask}`;
        }
      }
    }
  }

  // Add a custom task to "Hovedetasjen Bad" every second week
  const customTask = "Tøm dusjavløp";
  if (weekNumber % 2 === 0) {
    for (const person in cleaningList) {
      if (cleaningList[person].includes("Hovedetasjen Bad")) {
        cleaningList[person] += ` ++ ${customTask}`;
      }
    }
  }

  return cleaningList;
}

// Initialize lastAssigned with null for each person
const lastAssigned = people.reduce((acc, person) => {
  acc[person] = null;
  return acc;
}, {});

// Function to simulate cleaning list generation for a number of weeks
function simulateWeeks(numWeeks) {
  const currentWeek = getCurrentWeekNumber();
  for (let i = 0; i < numWeeks; i++) {
    const weekNumber = currentWeek + i;
    const cleaningList = generateCleaningList(weekNumber, lastAssigned);
    console.log(`Week ${weekNumber}:`, cleaningList);
  }
}

simulateWeeks(10);

// Setup express server routes, views, and static files
app.get("/", (req, res) => {
  const weekNumber = getCurrentWeekNumber();
  const cleaningList = generateCleaningList(weekNumber, lastAssigned);

  res.render("index", {
    cleaningList,
    weekNumber,
    generateCleaningList,
    lastAssigned,
  });
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Start the server on the specified port
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

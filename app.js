// app.js

const express = require('express');
const cron = require('node-cron');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Sample data
const rooms = ['Top-floor', 'Upstairs bathroom', 'Living room', 'Kitchen', 'Downstairs Bathroom', 'Entrance'];
const people = ['Jens', 'Martin', 'Lars', 'Håkon', 'Aslak', 'Aksel', 'Ola'];

// Map of people to their respective restrictions
const restrictions = {
  Jens: ['Downstairs Bathroom'],
  Martin: ['Downstairs Bathroom'],
  Lars: ['Downstairs Bathroom'],
  Håkon: ['Downstairs Bathroom'],
  Aslak: ['Top-floor', 'Upstairs bathroom'],
  Aksel: ['Top-floor', 'Upstairs bathroom'],
  Ola: ['Top-floor', 'Upstairs bathroom'],
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

    cleaningList[person] = availableRooms.length ? availableRooms[0] : 'No room assigned';
    if (availableRooms.length) {
      shuffledRooms.splice(shuffledRooms.indexOf(availableRooms[0]), 1);
    }
  }

  // Save the cleaning list to a file (cleaning-list.json)
  fs.writeFile('cleaning-list.json', JSON.stringify(cleaningList, null, 2), (err) => {
    if (err) {
      console.error('Error saving cleaning list:', err);
    } else {
      console.log('Cleaning list has been saved to cleaning-list.json');
    }
  });

  return cleaningList;
}

// Route to display the cleaning list as an HTML list
app.get('/', (req, res) => {
  fs.readFile('cleaning-list.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading cleaning list:', err);
      // If there was an error reading the file, generate a new cleaning list
      const cleaningList = generateCleaningList();
      res.render('index', { cleaningList });
    } else {
      try {
        // Attempt to parse the JSON data from the file
        const cleaningList = JSON.parse(data);
        res.render('index', { cleaningList });
      } catch (parseError) {
        // If there was an error parsing the JSON data, generate a new cleaning list
        console.error('Error parsing cleaning list:', parseError);
        const cleaningList = generateCleaningList();
        res.render('index', { cleaningList });
      }
    }
  });
});

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  generateCleaningList(); // Generate the cleaning list when the server starts

  // Schedule the list generation to run every Monday at 12:00 AM
  cron.schedule('0 0 * * 1', () => {
    console.log('Generating the cleaning list...');
    generateCleaningList();
  });
});

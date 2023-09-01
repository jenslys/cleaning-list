# Dorm Cleaning Scheduler

This app utilizes the power of the [Edmonds-Karp Algorithm](https://en.wikipedia.org/wiki/Edmonds%E2%80%93Karp_algorithm) to create a weekly cleaning list that assigns specific cleaning duties to residents in your dorm. This scheduler ensures an equitable distribution of cleaning tasks every Monday.

## Features

- **Efficient Algorithm**: The Edmonds-Karp Algorithm optimizes the assignment of cleaning tasks, making sure that each resident gets a fair share of different chores over time.

- **Customizable Restrictions**: Tailor the cleaning assignments to your dorm's layout and preferences. You can set up restrictions to avoid assigning certain rooms to specific residents. For instance, if someone lives downstairs, you can make sure they won't be assigned to clean an upstairs room.

## How It Works

1. Residents' information and room restrictions are entered into the system.
2. The Edmonds-Karp Algorithm intelligently distributes cleaning tasks while considering the set restrictions.
3. The generated cleaning list is made available every Monday for residents to view.

## Tech Stack

- **Backend**: Built with NodeJS and Express, providing a robust and responsive server infrastructure.
- **Frontend**: Utilizes [EJS](https://ejs.co/) to dynamically render the cleaning lists, ensuring a seamless user experience.
- **Hosting**: Deployed on Render.com, guaranteeing high availability and optimal performance.

## Getting Started

To set up the Dorm Cleaning Scheduler locally or on your preferred hosting platform:

1. Clone this repository.
2. Install the required dependencies using `npm install`.
3. Customize the residents' information and room restrictions.
4. Run the server using `npm start`.

![pika-1692709699321-1x](https://github.com/jenslys/cleaning-list/assets/69081683/a4401e92-5fa5-4b06-8bab-5d1931628c4b)


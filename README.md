# Cleaning list

Generates a weekly cleaning list for the college dorm i live in.
It randomly assigns people to a rom that they need to clean each monday and displays it in a list.

It has customizable restrictions for rooms certain people should not clean, for example the people living downstairs should not clean the upstairs bathroom etc.

Stack:

- NodeJS + Express (for the backend)
- [EJS](https://ejs.co/) for rendering the HTML
- Render.com (for hosting)
- cron-job.org [(Pinging the server so it doesn't sleep)](https://render.com/docs/free#free-web-services)

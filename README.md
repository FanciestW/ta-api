# ta-api

An RESTful API Service that powered a website that I created as a Graduate Teaching Assistant for the Computer Science department at the University of New Haven.

The API has 2 GET endpoints, `/events` and `/announcements`.

The events endpoint pulls calendar events for the year and returns it in a formatted JSON list.

The announcements endpoint queries a MongoDB database for any announcements and returns current announcements and their corresponding data.

The TA React App I created queries this Serverless API hosted in AWS behind API Gateway to populate the TA Website with up-to-date information.

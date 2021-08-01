# CSE2020

## Digital Album for VRSEC CSE 2016-2020 Batch

- App URL : https://cse2020.herokuapp.com/
- Hosted on [Heroku](https://dashboard.heroku.com/apps/cse2020)
- Uses [MongoDB](https://www.mongodb.com/)

## Local usage details:
- Replace `"start": "node server.js"` in *package.json* to `"start" : "concurrently \"npm run server\" \"npm run client\""` to run both server and client locally in one go.
- Do the vice versa or simply discard changes when pushing the changes to GIT.
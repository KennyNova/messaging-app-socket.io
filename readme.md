# Chat App

This chat app uses NodeJS, Socket.io, and a Postgres database to allow users to message each other in chatrooms.

## Prerequisites
To run the app locally you must first have these installed

* If using Docker
    * [NodeJS](https://nodejs.org/en/download/)
    * [Docker](https://docs.docker.com/get-docker/)
* If not using Docker
    * [NodeJS](https://nodejs.org/en/download/)
    * [Postgres](https://www.postgresql.org/download/)


## Starting the App(with docker)

Navigate to the root directory and run ```docker-compose up``` in the terminal. Once the app is running simply open your browser and to access [http://localhost:8000](http://localhost:8000) and enter a username. Then select what room you would like to enter and chat away!

## Local Setup(without docker)

### Creating The Database
To initialize the database you must first save [socketchat.sql](https://github.com/KennyNova/messaging-app-socket.io/blob/master/scripts/socketchat.sql) then run the command ```psql chat < socketchat.sql``` to create the postgres database 

### Starting The App

To start the app run the command ```npm run local-start``` in the root directory. This will download all the required dependencies and start the app. Once the app is running simply open your browser and to access [http://localhost:8000](http://localhost:8000) and enter a username. Then select what room you would like to enter and chat away!






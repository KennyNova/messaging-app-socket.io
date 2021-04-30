# Chat App

This chat app uses socket.io and allows for people to message each other in chatrooms

## Local Initialization

### Database
To initialize the database you must first save [socketchat.sql](https://github.com/KennyNova/messaging-app-socket.io/blob/master/socketchat.sql) then run the command shown below to create the database
```bash
 psql chat < socketchat.sql
```

### App

To initialize use the command ```npm install``` in the backend and frontend directories as shown

```bash
cd backend
npm install
cd ../frontend
npm install
```

## Starting the app

Navigate to the home directory and run ```npm start``` in the terminal.
Once the app is running simply open your browser and to access [http://localhost:8000](http://localhost:8000) and enter a username. Then select what room you would like to enter and chat away!


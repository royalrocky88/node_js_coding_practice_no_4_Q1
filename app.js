const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json()); //--request .json for [create and update] new Book its necessary

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running At http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//-------------------Object---------
const convertDBObjectToResponseObj = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//---Get --list of all player in team------------------
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT * FROM cricket_team;`;

  const playersArray = await db.all(getPlayerQuery);
  response.send(
    playersArray.map((eachPlayer) => convertDBObjectToResponseObj(eachPlayer))
  );
  //playersArray);
});

//---Post --Add new Player Details in team---------------
app.post("/players/", async (request, response) => {
  const playerDetail = request.body;

  const { playerName, jerseyNumber, role } = playerDetail;

  const addPlayerDetail = `
    INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES(
        '${playerName}',
        '${jerseyNumber}',
        '${role}'
    );
    `;

  const dbResponse = await db.run(addPlayerDetail);

  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});

//---Get-- Single player show by player ID-----------
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  const getPlayerQuery = `
    SELECT * FROM cricket_team
    WHERE player_id = ${playerId};
    `;

  let player = await db.get(getPlayerQuery);
  response.send(convertDBObjectToResponseObj(player));
});

//---Put-- Update player detail by player ID---------
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const playerDetail = request.body;

  const { playerName, jerseyNumber, role } = playerDetail;

  const updatePlayerQuery = `
    UPDATE cricket_team
    SET player_name='${playerName}',
    jersey_number='${jerseyNumber}',
    role='${role}'
    WHERE player_id = ${playerId};
    `;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//---Delete-- Delete Player Details in team------------
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;

  const deletePlayerQuery = `
  DELETE FROM cricket_team
    WHERE player_id = ${playerId};
    `;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;

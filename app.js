const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
let db = null
const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => console.log('Server is Running'))
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBandServer()

app.get('/players/', async (req, res) => {
  let query = `SELECT player_id as playerId,player_name as playerName FROM player_details;`
  const playerArray = await db.all(query)
  res.send(playerArray)
})

app.get('/players/:playerId/', async (req, res) => {
  const {playerId} = req.params
  let query = `SELECT player_id as playerId,player_name as playerName FROM player_details WHERE player_id=${playerId};`
  const dbResponse = await db.get(query)
  res.send(dbResponse)
})

app.put('/players/:playerId/', async (req, res) => {
  const {playerId} = req.params
  const reqObj = req.body
  const {playerName} = reqObj
  let query = `UPDATE player_details SET player_name='${playerName}' WHERE player_id=${playerId};`
  await db.run(query)
  res.send('Player Details Updated')
})

app.get('/matches/:matchId/', async (req, res) => {
  const {matchId} = req.params
  let query = `SELECT match_id as matchId,match as match,year as year FROM match_details WHERE match_id=${matchId};`
  const dbres = await db.get(query)
  res.send(dbres)
})
//----
app.get('/players/:playerId/matches/', async (req, res) => {
  const {playerId} = req.params
  //let query = `SELECT match_id FROM player_match_score WHERE player_match_score.player_id=${playerId}`
  let query = `SELECT match_id as matchId,match,year FROM match_details WHERE match_details.match_id IN (SELECT match_id FROM player_match_score WHERE player_match_score.player_id=${playerId});`
  const dbresss = await db.all(query)
  res.send(dbresss)
})

app.get('/matches/:matchId/players/', async (req, res) => {
  const {matchId} = req.params
  let query = `SELECT player_id as playerId,player_name as playerName FROM player_match_score NATURAL JOIN player_details WHERE match_id=${matchId};`
  //let query = `SELECT player_id FROM player_match_score WHERE player_match_score.match_id=${matchId}`
  //let query = `SELECT player_id as playerId,player_name as playerName FROM player_details WHERE player_id IN (SELECT player_id FROM player_match_score WHERE player_match_score.match_id=${matchId});`
  const databaseres = await db.all(query)
  res.send(databaseres)
})

app.get('/players/:playerId/playerScores', async (req, res) => {
  const {playerId} = req.params
  let query = `SELECT player_details.player_id as playerId,
  player_details.player_name as playerName,
  SUM(player_match_score.score) as totalScore,SUM(fours) as totalFours,SUM(sixes) as totalSixes 
  FROM player_match_score INNER JOIN player_details ON player_details.player_id=player_match_score.player_id WHERE player_details.player_id=${playerId};`
  //let query = `SELECT * FROM player_match_score INNER JOIN player_details;`
  const ress = await db.get(query)
  res.send(ress)
})

app.get('/players/:playerId/playerScores', async (req, res) => {})

module.exports = app

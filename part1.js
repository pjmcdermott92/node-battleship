const rs = require('readline-sync')

const yAxis = ['A', 'B', 'C']
let grid = [], ships = [], playerStrikes = [], shipsRemaining


function startGame() {
  cleanBeforeStart()
  console.log('\x1b[32m','Welcome to Battle Ship Mini!','\x1b[0m')
  rs.keyIn(' Press any key to start game... ')
  generateShips()
  generateGrid()
  playerStrike()
}

function cleanBeforeStart() {
  console.clear()
  grid = []
  ships = []
  playerStrikes = []
  shipsRemaining = 0
}

function generateGrid() {
  yAxis.flatMap(coordinate => {
    for (i = 1; i < yAxis.length + 1; i++) {
      grid.push(coordinate + i)
    }
  })
}

function generateShips() {
  const index = () => Math.floor(Math.random() * yAxis.length)
  if (ships.length < 2) {
    const shipYAxis = yAxis[index()]
    const shipXAxis = index() + 1
    const shipLocation = shipYAxis + shipXAxis
    if (ships.includes(shipLocation)) generateShips()
    else ships.push(shipLocation)
    generateShips()
  }
  else shipsRemaining = 2
}

function playerStrike() {
  isGameOver()
  let strike = rs.question(' Enter a location to strike ie \'A2\'... ')
  strike = strike.toUpperCase()
  if (!grid.includes(strike)) {
    console.log('\x1b[33m','That is not a valid location. Please try again.','\x1b[0m')
    playerStrike()
  }
  checkPreviousStrikes(strike)
  playerStrikes.push(strike)
  checkForHit(strike)
  }

function checkPreviousStrikes(strike) {
  if (!playerStrikes.includes(strike)) return
  console.log('\x1b[33m','You have already picked this location. Miss!','\x1b[m')
  playerStrike()
}

function checkForHit(strike) {
  if (ships.includes(strike)) {
    shipsRemaining--
    if (shipsRemaining === 1) {
        console.log('\x1b[33m',`Hit! You have sunk a battleship. ${shipsRemaining} ship remaining.`,'\x1b[0m')
        playerStrike()
    }
  }
  console.log('\x1b[33m','You have missed!','\x1b[0m')
  playerStrike()
}

function isGameOver() {
  if (shipsRemaining === 0) {
    console.log('\x1b[33m', 'Hit! You have destroyed all battleships.','\x1b[0m')
    if (rs.keyInYN(' Would you like to play again? ')) startGame()
      console.log('Goodbye!')
      process.exit()
  }
}

startGame()
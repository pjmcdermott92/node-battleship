const rs = require('readline-sync')

const yAxis = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const battleShips = [
    { name: 'Destroyer', size: 2 },
    { name: 'Submarine', size: 3 },
    { name: 'Cruiser', size: 3 },
    { name: 'Battleship', size: 4 },
    { name: 'Carrier', size: 5 }
]

let grid, ships, shipsRemaining, playerStrikes, hits

startGame()

function startGame() {
    cleanBeforePlay()
    console.log('\x1b[32m', 'Welcome to Battleship!', '\x1b[0m')
    rs.keyIn(' Press any key to start the game... ')
    console.log('\x1b[33m','Type \'exit\' at any time to end game.','\x1b[0m',)
    generateGrid()
    placeShips()
    playerStrike()    
}

function cleanBeforePlay() {
    console.clear()
    grid = []
    ships = []
    shipsRemaining = 0
    playerStrikes = []
    hits = []
}

function generateGrid() {
    yAxis.flatMap(coordinate => {
        for (i = 1; i < yAxis.length + 1; i++) {
            grid.push({
                location: coordinate + i,
                mark: ' '
            })
        }
    })
}

function placeShips() {
    while (shipsRemaining < battleShips.length) {
        generateShip(shipsRemaining)
        shipsRemaining++
    }
    mapHits()
}

function mapHits() {
    battleShips.forEach(ship => {
        hits.push({ name: ship.name, size: ship.size, hits: 0, isSunk: false })
    })
}

function generateShip(ship) {
    const orientation = Math.floor(Math.random() * 2)
    // If orientation is 0, ship is vertical & 10 is added to start index
    // If orientation is 1, ship is horizontal & 1 is added to start index
    const direction = orientation === 0 ? 10 : 1
    const index = Math.abs(Math.floor(Math.random() * yAxis.length) * (yAxis.length - battleShips[ship].size))

    let offGrid = false, shipCoordinates = []

    // Make sure ship does not overflow grid
    if (direction === 1 && (index % yAxis.length) + (battleShips[ship].size * direction) >= yAxis.length) offGrid = true
    if (direction === 10 && index + (battleShips[ship].size * direction) >= (yAxis.length * direction)) offGrid = true

    if (offGrid) generateShip(ship)

    // Make sure ship doesn't overlap another ship
    else for (i = 0; i < battleShips[ship].size; i++) {
        if (ships.flat().includes(index + (direction * i))) generateShip(ship)
        else shipCoordinates.push(index + (direction * i))
    }

    //If ship is generated, add to ships array
    if (shipCoordinates.length === battleShips[ship].size) ships.push(shipCoordinates)
}

function playerStrike() {
    isGameOver()
    let strike = rs.question(' Enter a location to strike ie \'A2\'... ')
    strike = strike.toUpperCase()
    if(strike === 'EXIT') {
        console.log('\x1b[31m',' Goodbye!','\x1b[0m')
        process.exit()
    }
    if(!grid.some(coordinate => coordinate.location === strike)) {
        console.log('\x1b[33m', 'That is not a valid location. Please try again.', '\x1b[0m')
        playerStrike()
    }
    if(playerStrikes.includes(strike)) {
        console.log('\x1b[33m', 'You have already picked this location. Miss!', '\x1b[0m')
        playerStrike()
    }
    playerStrikes.push(strike)
    checkForHit(strike)
}

function checkForHit(strike) {
    const strikeIndex = grid.findIndex(coordinate => coordinate.location === strike)
    if (ships.flat().includes(strikeIndex)) {
        console.clear()
        grid[strikeIndex].mark = 'X'
        printUserGrid()
        console.log('\x1b[33m', `${strike} is a`, '\x1b[31m', 'Hit!', '\x1b[0m')
        countHit(strikeIndex)
        playerStrike()
    }
    else {
        console.clear()
        grid[strikeIndex].mark = 'O'
        printUserGrid()
        console.log('\x1b[33m', `${strike} is a`,'\x1b[36m','Miss!','\x1b[33m', 'Guess again!', '\x1b[0m')
        playerStrike()
    }
}

function countHit(strike) {
    ships.forEach(ship => {
        if(ship.includes(strike)) {
            const hitShip = ships.indexOf(ship)
            const currentHits = hits[hitShip].hits
            hits[hitShip].hits = currentHits + 1
            checkIfSunk()
        }
    })
}

function checkIfSunk() {
    hits.forEach(ship => {
        if(!ship.isSunk && ship.hits === ship.size) {
            ship.isSunk = true
            shipsRemaining--
            const word = shipsRemaining === 1 ? 'ship' : 'ships'
            console.log('\x1b[33m', `You sank the ${ship.name}! ${shipsRemaining} ${word} remaining.`, '\x1b[0m')
        }
    })
}

function isGameOver() {
    if(shipsRemaining === 0) {
        console.log('\x1b[33m', 'You have destroyed all battleships.', '\x1b[0m')
        if( rs.keyInYNStrict(' Would you like to play again? ')) startGame()
        console.log('\x1b[31m',' Goodbye!','\x1b[0m')
        process.exit()
    }
}

function printUserGrid() {
    //iterate and print the numbers for the number of columns
    let columnNum = []
    for (c = 0; c < yAxis.length; c++) columnNum.push(c + 1)
    columnNum = columnNum.toString().split(',').join('   ')
    console.log(`     ${columnNum}`)
    console.log(`    ${'-'.repeat(40)}`)
    // Iterate through each row and print the marks
    for (r = 0; r < yAxis.length; r++) {
        const row = grid.slice(r * yAxis.length, (r * yAxis.length) + yAxis.length)
        let marks = []

        for (m = 0; m < row.length; m++) marks.push(row[m].mark)

        marks = marks.toString().split(',').join(' | ')
        console.log(` ${yAxis[r]} | ${marks} |`)
        console.log(`    ${'-'.repeat(40)}`)
    }
}
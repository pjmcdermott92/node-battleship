const rs = require('readline-sync')

const yAxis = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const battleShips = [
    { name: 'Destroyer', size: 2 },
    { name: 'Submarine', size: 3 },
    { name: 'Cruiser', size: 3 },
    { name: 'Battleship', size: 4 },
    { name: 'Carrier', size: 5 }
]

let grid, shipsRemaining, shipLocations, hits, strikes, whosTurn

function startGame() {
    cleanBeforePlay()
    console.log('\x1b[32m', 'Welcome to Battleship!', '\x1b[0m')
    rs.keyIn(' Press any letter key to start the game... ')
    generateGrid()
    placeShips()
    printUserGrid()
    console.log('\x1b[33m','Type \'exit\' at any time to end game.','\x1b[0m',)
    takeTurn()
    
}

function cleanBeforePlay() {
    console.clear()
    grid = []
    shipsRemaining = { player: 0, computer: 0 }
    shipLocations = { player: [], computer: [] }
    strikes = { player: [], computer: [] }
    hits = { player: [], computer: [] }
    whosTurn = 'computer'
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
    while (shipsRemaining.player < battleShips.length) {
        generateShip('player', shipsRemaining.player)
        shipsRemaining['player']++
    }
    while (shipsRemaining.computer < battleShips.length) {
        generateShip('computer', shipsRemaining.computer)
        shipsRemaining['computer']++
    }
    mapHits()
}

function mapHits() {
    battleShips.forEach(ship => {
        hits.player.push({ name: ship.name, size: ship.size, hits: 0, isSunk: false })
        hits.computer.push({ name: ship.name, size: ship.size, hits: 0, isSunk: false })
    })
}

function generateShip(who, ship) {
    const orientation = Math.floor(Math.random() * 2)
    // If orientation is 0, ship is vertical & 10 is added to start index
    // If orientation is 1, ship is horizontal & 1 is added to start index
    const direction = orientation === 0 ? 10 : 1
    const index = Math.abs(Math.floor(Math.random() * yAxis.length) * (yAxis.length - battleShips[ship].size))

    let offGrid = false, shipCoordinates = []

    // Make sure ship does not overflow grid
    if (direction === 1 && (index % yAxis.length) + (battleShips[ship].size * direction) >= yAxis.length) offGrid = true
    if (direction === 10 && index + (battleShips[ship].size * direction) >= (yAxis.length * direction)) offGrid = true

    if (offGrid) generateShip(who, ship)

    // Make sure ship doesn't overlap another ship
    else for (i = 0; i < battleShips[ship].size; i++) {
        if (shipLocations[who].flat().includes(index + (direction * i))) generateShip(who, ship)
        else shipCoordinates.push(index + (direction * i))
    }

    //If ship is generated, add to ships array
    if (shipCoordinates.length === battleShips[ship].size) shipLocations[who].push(shipCoordinates)
}

function takeTurn() {
    isGameOver()
    whosTurn = whosTurn === 'player' ? 'computer' : 'player'
    if (whosTurn === 'player') playerStrike()
    if (whosTurn === 'computer') computerStrike()
}

function playerStrike() {
    let strike = rs.question(' Enter a location to strike ie \'A2\'... ')
    strike = strike.toUpperCase()
    if(strike === 'EXIT') {
        console.log('\x1b[31m',' Goodbye!','\x1b[0m')
        process.exit()
    }
    if(!grid.some(coordinate => coordinate.location === strike)) {
        printUserGrid()
        console.log('\x1b[33m', `${strike} is not a valid location. Please try again.`, '\x1b[0m')
        playerStrike()
    }
    if(strikes.player.includes(strike)) {
        printUserGrid()
        console.log('\x1b[33m',`You have already hit ${strike}. Please try again.`, '\x1b[0m')
        playerStrike()
    }
    strikes.player.push(strike)
    strikeIndex = grid.findIndex(coordinate => coordinate.location === strike)
    const ship = checkForHit('computer', strikeIndex)
    if (ship === undefined) {
        grid[strikeIndex].mark = 'O'
        printUserGrid()
        console.log('\x1b[33m',`${strike} is a`,'\x1b[36m','Miss!','\x1b[0m')
    } else {
        grid[strikeIndex].mark = 'X'
        const sunkShip = checkIfSunk('computer')
        if(sunkShip === ship) {
            printUserGrid()
            const word = shipsRemaining.computer === 1 ? 'ship' : 'ships'
            console.log('\x1b[33m',`${strike} is a`,'\x1b[31m','Hit!','\x1b[0m')
            console.log('\x1b[33m',`You sank the computer's ${ship}! Computer has ${shipsRemaining.computer} ${word} remaining.`,'\x1b[0m')
        } else {
            printUserGrid()
            console.log('\x1b[33m',`${strike} is a`,'\x1b[31m', 'Hit!', '\x1b[0m')
        }
    }
    takeTurn()
}

function computerStrike() {
    location = Math.floor(Math.random() * grid.length)
    if (strikes.computer.includes(location)) computerStrike()
    strikes.computer.push(location)
    const ship = checkForHit('player', location)
    if (ship === undefined) {
        console.log('\x1b[35m','The computer has missed.','\x1b[0m')
    } else {
        const sunkShip = checkIfSunk('player')
        if(sunkShip === ship) {
            const word = shipsRemaining.player === 1 ? 'ship' : 'ships'
            console.log('\x1b[41m',`The computer hit and sank your ${ship}! You have ${shipsRemaining.player} ${word} remaining.`,'\x1b[0m')
        } else {
            console.log('\x1b[45m',`The computer hit your ${ship}.`,'\x1b[0m')
        }
    }
    takeTurn()
}

function checkForHit(opponent, location) {
    let shipName
    shipLocations[opponent].forEach(ship => {
        if(ship.includes(location)) {
            const hitShip = shipLocations[opponent].indexOf(ship)
            const currentHits = hits[opponent][hitShip].hits
            hits[opponent][hitShip].hits = currentHits + 1
            shipName = hits[opponent][hitShip].name
        }
    })
    return shipName
}

function checkIfSunk(opponent) {
    let shipName
    hits[opponent].forEach(ship => {
        if(!ship.isSunk && ship.hits === ship.size) {
            ship.isSunk = true
            shipsRemaining[opponent]--
            shipName = ship.name
        }
    })
    return shipName
}

function isGameOver() {
    if(shipsRemaining.player === 0 || shipsRemaining.computer === 0) {
        console.log('\x1b[33m', 'Game Over!', '\x1b[0m')
        if( rs.keyInYNStrict(' Would you like to play again? ')) startGame()
        console.log('\x1b[31m',' Goodbye!','\x1b[0m')
        process.exit()
    }
}

function printUserGrid() {
    console.clear()
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

startGame()
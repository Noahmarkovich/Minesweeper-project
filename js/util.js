'use strict'



function countNeighbors(cellI, cellJ, mat) {
    var neighborsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            if (mat[i][j].isMine) neighborsCount++
        }
    }
    return neighborsCount
}


function renderCell(location) {
    const cellSelector = '.' + getClassName(location) // cell-i-j
    const elCell = document.querySelector(cellSelector)
    return elCell
    
}


function getClassName(location) {
    const cellClass = 'cell-' + location.i + '-' + location.j
    return cellClass
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function startTimer() {
    gStartTime = Date.now() 
    gInterval = setInterval(() => {
        const seconds = (Date.now() - gStartTime) / 60000
        var elTimer = document.querySelector('.timer')
        elTimer.innerText = seconds.toFixed(2)
    }, 1);
}

function resetTime() {
    var elTimer = document.querySelector('.timer')
    elTimer.innerText = '0.00'
}
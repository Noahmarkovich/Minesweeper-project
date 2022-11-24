'use strict'

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''

var gBoard 
var gGame 
var gLevel = {
    size: 4,
    mines: 2
   }
var gStartTime
var gInterval
var gLives
var gCellsIndexes
var gIsFlaged = false

function changeLevel(level){
    if (level === 'beginner' ) {
        gLevel = {
            size: 4,
            mines: 2
           }
        onInit()
    }if (level === 'medium' ) {
        gLevel = {
            size: 8,
            mines: 14
           }
        onInit()
    } if (level === 'expert' ) {
        gLevel = {
            size: 12,
            mines: 32
           }
        onInit()
    }
    
}

// console.log(changeLevel())

function onInit(){
    clearInterval(gInterval)
    resetTime()
    gLives = 3
    var elLives = document.querySelector('.lives span')
    elLives.innerText = gLives
    const emoji = document.querySelector('.restart')
    emoji.innerText = '😁'
    gCellsIndexes = []
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard = buildBoard(gLevel.size)
    renderBoard(gBoard)
    // setMinesNegsCount(gBoard)
}




function buildBoard(size){
    var board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size ; j++) {
            board[i][j] = {  minesAroundCount: 0,
                            isShown: false,
                            isMine: false,
                            isMarked: false,
                            isFlaged : false}
            gCellsIndexes.push({i:i,j:j})
        }
    }
    // setRandomMines(board, cellsIndexes, gLevel.mines)
    return board
}

function setRandomMines(board, cellsIndexes, mines){
    var minesIndexes = []
    var minePos
    for (var i = 0; i < mines; i++){
        var index = getRandomInt(0, cellsIndexes.length)
        minePos = cellsIndexes[index]
        console.log(minePos)
        board[minePos.i][minePos.j].isMine = true
        console.log(board[minePos.i][minePos.j])
        cellsIndexes.splice(index,1)  
    } 


}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            // const currCell = board[i][j]
            var cellClass = getClassName({ i: i, j: j })
            
            strHTML += `\t<td class= "cell ${cellClass}" onclick= "cellClicked(this, ${i}, ${j})" oncontextmenu= "cellMarked(this, ${i}, ${j})"  >\n`
            
            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
}

function setMinesNegsCount(board){
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = countNeighbors(i, j, board)
        }
    }
    renderBoard(board)
}


function cellClicked(elCell, i , j) {
    if(gGame.shownCount === 0) {
        setRandomMines(gBoard, gCellsIndexes, gLevel.mines)
        setMinesNegsCount(gBoard)
        startTimer()
        elCell.classList.add('clicked')
        gBoard[i][j].isMarked = true
        gBoard[i][j].isShown = true
        gGame.shownCount ++
        elCell.innerText = EMPTY
        expandShown(gBoard, i , j)
    }
    if (!gGame.isOn) return
    if (gBoard[i][j].isFlaged) return
    if (gBoard[i][j].isMarked) return
    if (gBoard[i][j].isMine) {
        elCell.innerText = MINE
        gLives -- 
        elCell.classList.add('clicked')
        elCell.classList.add('onMine')
        var elLives = document.querySelector('.lives span')
        elLives.innerText = gLives
    }else if (gBoard[i][j].minesAroundCount !==0 ) {
        gBoard[i][j].isMarked = true
        gBoard[i][j].isShown = true
        gGame.shownCount ++
        elCell.classList.add('clicked')
        elCell.innerText = gBoard[i][j].minesAroundCount
    } else if (gBoard[i][j].minesAroundCount ===0){
        elCell.classList.add('clicked')
        if (!gBoard[i][j].isShown) {
            gGame.shownCount ++
        }
        gBoard[i][j].isShown = true
        gBoard[i][j].isMarked
        elCell.innerText = EMPTY
        expandShown(gBoard, i , j)
    }
    if(gBoard[i][j].isMine && gLives === 0) gameOver(elCell) 
    
    checkGameOver()
    
}



function expandShown(board, cellI, cellJ) {
    var neighborsCount = 0
    var elCell
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isShown) continue
            if (board[i][j].isMine) continue
            if (board[i][j].minesAroundCount !== 0){
                elCell = renderCell({i,j})
                elCell.innerText = board[i][j].minesAroundCount
                board[i][j].isShown = true
                gGame.shownCount ++
                elCell.classList.add('clicked')
                console.log(gGame.shownCount)
            }else if(gBoard[i][j].minesAroundCount ===0) {
                elCell = renderCell({i,j})
                elCell.innerText = EMPTY
                board[i][j].isShown = true
                gGame.shownCount ++
                elCell.classList.add('clicked')
                console.log(gGame.shownCount)
                }
            } 
        }
    }


function cellMarked(elCell, i , j){
    if(gBoard[i][j].isFlaged){
        elCell.innerText = EMPTY
        gBoard[i][j].isFlaged =false
        gBoard[i][j].isMarked = false
        gGame.markedCount --
    }else if (!gBoard[i][j].isFlaged){
        elCell.innerText = FLAG
        gGame.markedCount ++
        gBoard[i][j].isFlaged =true  
        gBoard[i][j].isMarked = true
        checkGameOver()
    }
    
}

function checkGameOver() {
    if (gGame.markedCount === gLevel.mines && gGame.shownCount === (gLevel.size)**2 - gLevel.mines ){
        console.log(gInterval)
        clearInterval( gInterval)
        console.log ('you won')
        gGame.isOn = false
        const emoji = document.querySelector('.restart')
        emoji.innerText = '😎'
    }
}

function gameOver(){
    for (var i = 0; i < gBoard.length; i++) { 
        for (var j = 0; j < gBoard[0].length  ; j++) {
            if(gBoard[i][j].isMine){
                const elMineCell = renderCell({i,j})
                elMineCell.innerText = MINE
                elMineCell.classList.add('onMine')
            }
        }
    }
    clearInterval(gInterval)
    gGame.isOn = false
    const emoji = document.querySelector('.restart')
    emoji.innerText = '😵'
    console.log('YOU LOST')
}


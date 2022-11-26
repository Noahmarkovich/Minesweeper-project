'use strict'

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''


var gHintsLeft 
var gIsHintOn = false
var gHintsIntervalId
var gSafeClickIntervalId
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
var gIsUndo = false
var gSafeClick
var gCurrCells
var minesCounter
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
    clearInterval (gSafeClickIntervalId)
    clearInterval(gInterval)
    resetTime()
    gCurrCells = []
    gSafeClick = 3
    gLives = 3
    gHintsLeft = 3
    gIsFlaged = false
    gIsUndo = false
    var elSafeClick = document.querySelector('.safe')
    elSafeClick.innerText = '🔎'.repeat(gSafeClick)
    var elHint = document.querySelector('.hint')
    elHint.innerText = '💡'.repeat(gHintsLeft)
    var elLives = document.querySelector('.lives span')
    elLives.innerText = '❤️❤️❤️'
    const emoji = document.querySelector('.restart')
    emoji.innerText = '😁'
    minesCounter = ''+gLevel.mines
    var elCounter = document.querySelector('.counter')
    elCounter.innerText = minesCounter.padStart(2, '0')
    gCellsIndexes = []
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard = buildBoard(gLevel.size)
    renderBoard(gBoard)
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
    gCurrCells.push({i:i, j:j})
    if (gBoard[i][j].isMarked) return
    if(gGame.shownCount === 0) {
        var firstCellIdx =  gCellsIndexes.findIndex(object => {
            return object.i === i}) // making sure that the mine wont be at the first cell clicked.
        gCellsIndexes.splice(firstCellIdx, 1)
        setRandomMines(gBoard, gCellsIndexes, gLevel.mines)
        setMinesNegsCount(gBoard)
        startTimer()
        elCell.classList.add('clicked')
        gBoard[i][j].isMarked = true
        gBoard[i][j].isShown = true
        gGame.shownCount ++
        elCell.innerText = EMPTY
        expandShown(gBoard, i , j)
    }if(gIsHintOn) {
        expandShownOnHint(gBoard, i, j)
        gHintsIntervalId = setTimeout(()=> {
            cancelShown(gBoard, i, j)
            gIsHintOn =false
        }, 1000)   
        return
    }
    if (!gGame.isOn) return
    if (gBoard[i][j].isFlaged) return
    if (gBoard[i][j].isMine) {
        elCell.innerText = MINE
        gLives -- 
        elCell.classList.add('onMine')
        var elLives = document.querySelector('.lives span')
        elLives.innerText = '❤️'.repeat(gLives)
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
        gBoard[i][j].isMarked= true
        elCell.innerText = EMPTY
        expandShown(gBoard, i , j)
    }
    if(gBoard[i][j].isMine && gLives === 0) gameOver() 
    
    checkGameOver()
    
}



function expandShown(board, cellI, cellJ) {
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
        while(board[i][j].minesAroundCount === 0){
            expandShown(gBoard, i, j)
        } 
    }

    function expandShownOnHint(board, cellI, cellJ) {
        var elCell
        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= board.length) continue
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= board[i].length) continue
                if (board[i][j].isShown) continue
                if (board[i][j].isFlaged) continue
                if (board[i][j].minesAroundCount !== 0 && !board[i][j].isMine){
                    elCell = renderCell({i,j})
                    elCell.innerText = board[i][j].minesAroundCount
                    elCell.classList.add('clicked')
                }else if(gBoard[i][j].minesAroundCount ===0 && !board[i][j].isMine) {
                    elCell = renderCell({i,j})
                    elCell.innerText = EMPTY
                    elCell.classList.add('clicked')
                }else if(board[i][j].isMine) {
                    elCell = renderCell({i,j})
                    elCell.innerText = MINE
                    elCell.classList.add('clicked')
                }
                } 
            }
        }
    function cancelShown(board, cellI, cellJ) {
        var elCell
        for (var i = cellI - 1; i <= cellI + 1; i++) {
            if (i < 0 || i >= board.length) continue
            for (var j = cellJ - 1; j <= cellJ + 1; j++) {
                if (j < 0 || j >= board[i].length) continue
                if (board[i][j].isShown) continue
                if (board[i][j].isFlaged) continue
                elCell = renderCell({i,j})
                elCell.innerText = EMPTY
                elCell.classList.remove('clicked')
                if(board[i][j].isMine) elCell.classList.remove('onMine')
                if (gIsUndo) {
                    board[i][j].isShown = false
                    board[i][j].isMarked =false
                    gGame.markedCount --
                    gGame.shownCount --
                }
                } 
            }
        }


function cellMarked(elCell, i , j){
    var elCounter = document.querySelector('.counter')   
    if(gBoard[i][j].isFlaged){
        elCell.innerText = EMPTY
        gBoard[i][j].isFlaged =false
        gBoard[i][j].isMarked = false
        gGame.markedCount --
        minesCounter ++
    }else if (!gBoard[i][j].isFlaged){
        elCell.innerText = FLAG
        gGame.markedCount ++
        gBoard[i][j].isFlaged =true  
        gBoard[i][j].isMarked = true
        minesCounter --
        checkGameOver()
    }
    var strMinesCounter = minesCounter+''
    elCounter.innerText = strMinesCounter.padStart(2, '0')
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



function giveHint(elHint){
    clearInterval(gHintsIntervalId)
    gIsHintOn =true
    gHintsLeft--
    elHint.innerText = '💡'.repeat(gHintsLeft)
}

function onSafeClick(elSafeClick){
    clearInterval (gSafeClickIntervalId)
    var cellLocation
    var elCell
    if (gSafeClick === 0) return
    for (var i = 0 ; i <= gCellsIndexes.length ; i++) {
        var index = getRandomInt(0,gCellsIndexes.length)
        var freeSpaceIdx = gCellsIndexes[index]
        console.log(freeSpaceIdx.i)
        if(gBoard[freeSpaceIdx.i][freeSpaceIdx.j].isShown) continue
        else if (gBoard[freeSpaceIdx.i][freeSpaceIdx.j].minesAroundCount !== 0 ){
            elCell = renderCell(freeSpaceIdx)
            console.log(elCell)
            elCell.innerText = gBoard[freeSpaceIdx.i][freeSpaceIdx.j].minesAroundCount
            elCell.classList.add('safeClickCell')
            break
        }else  {
            elCell = renderCell(freeSpaceIdx)
            elCell.innerText = EMPTY
            elCell.classList.add('safeClickCell')
            break
        }
    }
    gSafeClickIntervalId = setTimeout(()=> {
        elCell.innerText = EMPTY
        elCell.classList.remove('safeClickCell')
        gSafeClick --
        elSafeClick.innerText = '🔎'.repeat(gSafeClick)

                    }, 2000) 
                    
}

//not working very well :(
// function undoStep(){ 
//     gIsUndo = true
//     console.log(gCurrCells)
//     var currCell =gCurrCells[gCurrCells.length-1]
//     console.log(currCell)
//     gCurrCells.splice(gCurrCells.length-1, 1)
//     var elCell = renderCell(currCell)
//     console.log(gCurrCells)
//     if (!gGame.isOn) return
//     if (gBoard[currCell.i][currCell.i].isMine) {
//         elCell.classList.remove('onMine')
//         elCell.innerText = EMPTY
//         gIsUndo = false
//     }if (gBoard[currCell.i][currCell.i].minesAroundCount !==0 ) {
//         elCell.classList.remove('clicked')
//         elCell.innerText = EMPTY
//         gBoard[currCell.i][currCell.i].isMarked = false
//         gBoard[currCell.i][currCell.i].isShown = false
//         gGame.shownCount --
//         gIsUndo = false
//     }if (gBoard[currCell.i][currCell.i].minesAroundCount ===0){
//         elCell.classList.remove('clicked')
//         cancelShown(gBoard, currCell.i, currCell.j) 
//         gIsUndo = false
//     } 
    
//         // if (!gBoard[currCell.i][currCell.i].isShown) {
//         //     gGame.shownCount --
//         // }
//         // gBoard[i][j].isShown = true
//         // gBoard[i][j].isMarked= true
//         // elCell.innerText = EMPTY
//         // expandShown(gBoard, i , j)
     

// }
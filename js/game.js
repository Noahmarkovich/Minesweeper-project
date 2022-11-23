'use strict'

const MINE = '💣'
const FLAG = '🚩'
const EMPTY = ''

var gBoard 

 var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
   }

var gLevel = {
    size: 4,
    mines: 2
   }
   
   

function onInit(){
    gBoard = buildBoard(gLevel.size)
    renderBoard(gBoard)
    setMinesNegsCount(gBoard)
}



function buildBoard(size){
    var board = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size ; j++) {
            board[i][j] = {  minesAroundCount: 0,
                            isShown: false,
                            isMine: false,
                            isMarked: false}
            // if (i === 0 || i === 9 || j === 0 || j === 11) {
            //     board[i][j] = ' '
            // }
        }
    }
    board[1][1].isMine = true
    board[3][2].isMine = true

    // console.table(board)
    return board
}


function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            
            // var cellClass = getClassName({ i: i, j: j })
            // console.log('cellClass:', cellClass)
            
            // if (currCell.isMine) cellClass += ' mine'
            // else if (currCell.type === WALL) cellClass += ' wall'
            
            strHTML += `\t<td class="cell" onclick= "cellClicked(this, ${i}, ${j})" oncontextmenu= "cellMarked(this)"  >\n`
            
            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
    // placeRandomBalls()
    // placeRandomGlue()
    
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
    // if (!gGame.isOn) return
    if (gBoard[i][j].isMarked) return
    else {
        gBoard[i][j].isMarked = true
        gBoard[i][j].isShown = true
    } 
    if (gBoard[i][j].isMine) {
        elCell.innerText = MINE
    } else if (gBoard[i][j].minesAroundCount !==0 ) {
        // console.log(currCell.minesAroundCount)
        elCell.innerText = gBoard[i][j].minesAroundCount
    } else{
        elCell.innerText = EMPTY
        // expandShown(gBoard, elCell, i , j)
    }
    
}



function expandShown(board, elCell, cellI, cellJ) {
    var neighborsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= board[i].length) continue
            if (!board[i][j].isMine){
                board[i][j].isShown = true
                board[i][j].isMarked = true
                if(gBoard[i][j].minesAroundCount !==0) {
                    console.log(board[i][j].minesAroundCount)
                    elCell.innerText = board[i][j].minesAroundCount
                }else elCell.innerText = EMPTY
            } 
        }
    }
    // renderBoard(board)
}


function cellMarked(elCell){
    elCell.innerText = FLAG
    gGame.markedCount ++
}

function checkGameOver() {
    
}
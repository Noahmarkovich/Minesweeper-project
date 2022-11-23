'use strict'

const MINE = '💣'
const FLAG = '🚩'

var gBoard 


function onInit(){
    gBoard = buildBoard()
    renderBoard(gBoard)

}



function buildBoard(){
    var board = []
    for (var i = 0; i < 4; i++) {
        board[i] = []
        for (var j = 0; j < 4; j++) {
            board[i][j] = {  minesAroundCount: 0,
                            isShown: true,
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
            
            strHTML += `\t<td class="cell">\n`

            if (currCell.isMine) {
                strHTML += MINE
            } else if (currCell.minesAroundCount !==0 ) {
                strHTML += currCell.minesAroundCount
            } else{
                strHTML += " "
            }

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
    for (var i = 0; i <= board.length; i++) {
        for (var j = 0; j <= board[0].length; j++) {
            var cellNegCount = board[i][j].minesAroundCount
            cellNegCount += +countNeighbors(i, j, board)
            }
        }
}
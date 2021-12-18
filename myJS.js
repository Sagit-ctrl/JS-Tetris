//Biến cân bằng game
var count = 0
var countIndex = new Array(7).fill(0)
var checkPause = 0
var checkStart = 0

//Tạo ra 1 class chứa những thuộc tính căn bản nhất của game
class Game {
    constructor() {
        //số điểm
        this.score = 0
        //kích thước bàn chơi
        this.boardWidth = 10
        this.boardHeight = 23
        //kích thước khu gợi ý
        this.hintWidth = 6
        this.hintHeight = 6
        //các biến trạng thái của game
        this.hintTetromino = [this.checkRandom(), this.checkRandom()]
        this.currentBoard = new Array(this.boardHeight).fill(0).map(() => new Array(this.boardWidth).fill(0))
        this.landedBoard = new Array(this.boardHeight).fill(0).map(() => new Array(this.boardWidth).fill(0))
        this.currentTetromino = this.randomTetromino(this.hintTetromino[1])
        this.hintBoard = new Array(this.hintHeight).fill(0).map(() => new Array(this.hintWidth).fill(0))
        //lấy context của phần tử canvas chính
        this.canvas = document.getElementById('tetris-canvas')
        this.ctx = this.canvas.getContext('2d')
        //lấy context của phần tử canvas hint
        this.canvashint = document.getElementById('hint')
        this.ctxhint = this.canvashint.getContext('2d')
        //vòng lặp game
        this.gameOver = false
        this.pauseGame = false
        this.startGame = false
    }

    //Tạo đồ họa cho game
    draw(blockSize = 24, padding = 4) {
        // vẽ khung game
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height) //Xóa toàn bộ khung hình mỗi khi khởi chạy lại draw
        this.ctx.lineWidth = 2
        this.ctx.rect(padding, padding, blockSize*this.boardWidth+padding*(this.boardWidth+1), blockSize*(this.boardHeight-3)+padding*(this.boardHeight-3+1))
        this.ctx.stroke()

        // vẽ vùng gợi ý
        this.ctxhint.clearRect(0, 0, this.canvashint.width, this.canvashint.height)
        this.ctxhint.lineWidth = 2
        this.ctxhint.rect(padding, padding, blockSize*this.hintWidth+padding*(this.hintWidth+1), blockSize*(this.hintHeight)+padding*(this.hintHeight+1))
        this.ctxhint.stroke()

        // vẽ lại các block tại đúng vị trí của nó
        for (let i = 3; i < this.boardHeight; i++) {
            for (let j = 0; j < this.boardWidth; j++) {
                if (this.currentBoard[i][j] > 0) {
                    this.ctx.fillStyle = 'rgb(0, 0, 0)'
                    this.ctx.fillStyle = this.getColor(this.currentBoard[i][j])
                } else {
                    this.ctx.fillStyle = 'rgb(248, 248, 248)'
                }
                this.ctx.fillRect(padding * 2 + j * (blockSize + padding), padding * 2 + (i - 3) * (blockSize + padding), blockSize, blockSize)
            }
        }

        // vẽ các tetromino gợi ý
        for (let i = 0; i < this.hintHeight; i++) {
            for (let j = 0; j < this.hintWidth; j++) {
                if (this.hintBoard[i][j] > 0) {
                    this.ctxhint.fillStyle = 'rgb(0, 0, 0)'
                    this.ctxhint.fillStyle = this.getColor(this.hintBoard[i][j])
                } else {
                    this.ctxhint.fillStyle = 'rgb(248, 248, 248)'
                }
                this.ctxhint.fillRect(padding * 2 + j * (blockSize + padding), padding * 2 + i * (blockSize + padding), blockSize, blockSize)
            }
        }

        // score
        document.getElementById("score").innerHTML = this.score
    }

    //Tạo random khối rơi xuống
    creatTetromino(ranNum) {
        switch (ranNum) {
            case 0:
                return new LShape(1, 2)
            case 1:
                return new JShape(1, 2)
            case 2:
                return new OShape(2, 2)
            case 3:
                return new TShape(2, 1)
            case 4:
                return new SShape(2, 1)
            case 5:
                return new ZShape(2, 1)
            case 6:
                return new IShape(1, 2)
        }
        document.getElementById("count").innerHTML = ranNum

    }
    randomTetromino(ranNum) {
        switch (ranNum) {
            case 0:
                return new LShape(0, 4)
            case 1:
                return new JShape(0, 4)
            case 2:
                return new OShape(0, 4)
            case 3:
                return new TShape(0, 4)
            case 4:
                return new SShape(0, 4)
            case 5:
                return new ZShape(0, 4)
            case 6:
                return new IShape(0, 4)
        }
    }
    getColor(cellNumber) {
        switch (cellNumber) {
            case 1:
                return LShape.color
            case 2:
                return JShape.color
            case 3:
                return OShape.color
            case 4:
                return TShape.color
            case 5:
                return SShape.color
            case 6:
                return ZShape.color
            case 7:
                return IShape.color
        }
    }
    checkRandom() {
        const ranNum = Math.floor(Math.random() * Math.floor(7))
        if ( count >= 16) {
            countIndex.fill(0)
            count = 0
        }

        if (countIndex[ranNum] >=3 ) {
            return this.checkRandom()
        } else {
            countIndex[ranNum] += 1
            count += 1
            return ranNum
        }
    }

    //Tạo cách chơi game
    play() {
        status = setInterval(() => {
            this.progess()
            this.updateCurrentBoard()
            this.draw()
        }, 800);
    }
    progess() {
        let nextTetromino = new this.currentTetromino.constructor(this.currentTetromino.row + 1, this.currentTetromino.col, this.currentTetromino.angle)
        let alert = document.getElementById("alert")
        //kiểm tra xe đã va vào đất hay khối đã đặt hay chua
        if (!this.bottomOverlapped(nextTetromino) && !this.landedOverlapped(nextTetromino)) {
            if (this.pauseGame === true) {
                alert.innerHTML = "Pause"
            } else {
                this.currentTetromino.fall()
                alert.innerHTML = "Run"
            }
        } else {
            this.mergeCurrentTetromino()
            this.swapTetromino()
            this.updateHintBoard()

            const clearableRowIndexes = this.findClearableRows()
            this.clearRows(clearableRowIndexes)
            this.score += this.calculateScore(clearableRowIndexes.length)

            if (this.isGameOver()) {
                clearInterval(status)
                this.gameOver = true
                alert.innerHTML = "Game Over"
                this.clearAll()
                this.score = 0
            } else {
                this.currentTetromino = this.randomTetromino(this.hintTetromino[1])
            }
        }
    }
    updateCurrentBoard() {
        //Vẽ lại các khối có sẵn
        for (let i = 0; i < this.boardHeight; i++) {
            for (let j = 0; j < this.boardWidth; j++) {
                this.currentBoard[i][j] = this.landedBoard[i][j]
            }
        }

        //Vẽ các khối đang rơi
        for (let i = 0; i < this.currentTetromino.height; i++) {
            for (let j = 0; j < this.currentTetromino.width; j++) {
                if (this.currentTetromino.shape[i][j] > 0) {
                    this.currentBoard[this.currentTetromino.row + i][this.currentTetromino.col + j] = this.currentTetromino.shape[i][j]
                }
            }
        }
    }
    updateHintBoard() {
        const hintDisplayranNum = this.hintTetromino[0]
        const hintDisplay = this.creatTetromino(hintDisplayranNum)
        //Xóa tetromino hint trc
        for (let i = 0; i < this.hintHeight; i++) {
            for (let j = 0; j < this.hintWidth; j++) {
                this.hintBoard[i][j] = 0
            }
        }
        //Vẽ tetromino hint moi
        for (let i = 0; i < hintDisplay.height; i++) {
            for (let j = 0; j < hintDisplay.width; j++) {
                if (hintDisplay.shape[i][j] > 0) {
                    this.hintBoard[hintDisplay.row + i][hintDisplay.col + j] = hintDisplay.shape[i][j]
                }
            }
        }
    }
    swapTetromino() {
        this.hintTetromino[1] = this.hintTetromino[0]
        this.hintTetromino[0] = this.checkRandom()
    }

    //Các hàm kiểm tra va chạm
    bottomOverlapped(tetromino) {
        if (tetromino.row + tetromino.height > this.boardHeight) {
            return true
        } else {
            return false
        }
    }
    landedOverlapped(tetromino) {
        for (let i = 0; i < tetromino.height; i++) {
            for (let j = 0; j < tetromino.width; j++) {
                if (tetromino.shape[i][j] > 0 &&
                    this.landedBoard[tetromino.row + i][tetromino.col + j] > 0) {
                    return true
                }
            }
        }
        return false
    }
    mergeCurrentTetromino() {
        for (let i = 0; i < this.currentTetromino.height; i++) {
            for (let j = 0; j < this.currentTetromino.width; j++) {
                if (this.currentTetromino.shape[i][j] > 0) {
                    this.landedBoard[this.currentTetromino.row + i][this.currentTetromino.col + j] = this.currentTetromino.shape[i][j]
                }
            }
        }
    }
    rightOverlapped(tetromino) {
        if (tetromino.col + tetromino.width > this.boardWidth) {
            return true
        } else {
            return false
        }
    }
    leftOverlapped(tetromino) {
        if (tetromino.col < 0){
            return true
        } else {
            return false
        }
    }

    //Các hàm điều khiển
    tryMoveDown() {
        this.progess()
        this.updateCurrentBoard()
        this.draw()
    }
    tryMoveLeft() {
        const tempTetromino = new this.currentTetromino.constructor(this.currentTetromino.row, this.currentTetromino.col - 1, this.currentTetromino.angle)
        if (!this.leftOverlapped(tempTetromino) && !this.landedOverlapped(tempTetromino)) {
            this.currentTetromino.col -= 1
            this.updateCurrentBoard()
            this.draw()
        }
    }
    tryMoveRight() {
        const tempTetromino = new this.currentTetromino.constructor(this.currentTetromino.row, this.currentTetromino.col + 1, this.currentTetromino.angle)
        if (!this.rightOverlapped(tempTetromino) && !this.landedOverlapped(tempTetromino)) {
            this.currentTetromino.col += 1
            this.updateCurrentBoard()
            this.draw()
        }
    }
    tryRotating() {
        const tempTetromino = new this.currentTetromino.constructor(this.currentTetromino.row + 1, this.currentTetromino.col, this.currentTetromino.angle)
        tempTetromino.rotate()
        if (!this.rightOverlapped(tempTetromino) && !this.landedOverlapped(tempTetromino) && !this.bottomOverlapped(tempTetromino)) {
            this.currentTetromino.rotate()
            this.updateCurrentBoard()
            this.draw()
        }
    }

    //Hàm tính điểm
    findClearableRows() {
        const clearableIndexes = []

        this.landedBoard.forEach((row, index) => {
            if (row.every(cell => cell > 0)) {
                clearableIndexes.push(index)
            }
        })
        return clearableIndexes
    }
    clearRows(rowIndexes) {
        for (let i = this.landedBoard.length - 1; i >= 0; i--) {
            for (let j = 0; j < rowIndexes.length; j++) {
                if (rowIndexes[j] === i) {
                    this.landedBoard.splice(rowIndexes[j], 1)
                }
            }
        }
        for (let i = 0; i < rowIndexes.length; i++) {
            this.landedBoard.unshift(new Array(this.boardWidth).fill(0))
        }
    }
    calculateScore(rowsCount) {
        return (rowsCount * (rowsCount + 1)) / 2
    }
    isGameOver() {
        for (let i = 0; i < this.boardWidth; i++) {
            if (this.landedBoard[2][i] > 0) {
                return true
            }
        }
        return false
    }
    clearAll() {
        for (let i = 0; i < this.boardHeight; i++) {
            for (let j = 0; j < this.boardWidth; j++) {
                this.currentBoard[i][j] = 0
                this.landedBoard[i][j] = 0
                this.currentTetromino.row = 0
                this.currentTetromino.col = 4
            }
        }
        for (let i = 0; i < this.hintHeight; i++) {
            for (let j = 0; j < this.hintWidth; j++) {
                this.hintBoard[i][j] = 0
            }
        }
        this.draw()
    }
}

//Tạo ra class chứa thuộc tính căn bản của các hình khối
class Tetromino{
    constructor(row, col, angle = 0) {
        if (this.constructor === Tetromino) {
            throw new Error("This is an abstract class.");
        }
        this.row = row;
        this.col = col;
        this.angle = angle;
    }

    get shape() {
        return this.constructor.shapes[this.angle]
    }

    get width() {
        return this.shape[0].length
    }

    get height() {
        return this.shape.length
    }

    fall() {
        this.row +=1
    }

    rotate() {
        if (this.angle < 3) {
            this.angle += 1
        } else {
            this.angle = 0
        }
    }

    move(direction) {
        if (direction === 'left') {
            this.col -= 1
        } else if (direction === 'right') {
            this.col += 1
        }
    }
}
//Các hình khối sẽ kế thừa class Tetromino để thừa kế thuộc tính của nó
//Có 7 hình khối nên có 7 class kế thừa
//Các khối khác nhau về hình dáng và màu sắc
//Khối chữ L
class LShape extends Tetromino {}
LShape.shapes =
    [
        [[1, 0],
         [1, 0],
         [1, 1]],

        [[1, 1, 1],
         [1, 0, 0]],

        [[1, 1],
         [0, 1],
         [0, 1]],

        [[0, 0, 1],
         [1, 1, 1]],
    ]
LShape.color = 'rgb(255, 0, 0)'
//Khối chữ J
class JShape extends Tetromino {}
JShape.shapes =
    [
        [[0, 2],
         [0, 2],
         [2, 2]],

        [[2, 0, 0],
         [2, 2, 2]],

        [[2, 2],
         [2, 0],
         [2, 0]],

        [[2, 2, 2],
         [0, 0, 2]],
    ]
JShape.color = 'rgb(255, 127, 0)'
//Khối chữ O
class OShape extends Tetromino {}
OShape.shapes =
    [
        [[3, 3],
         [3, 3]],

        [[3, 3],
         [3, 3]],

        [[3, 3],
         [3, 3]],

        [[3, 3],
         [3, 3]],
    ]
OShape.color = 'rgb(255, 255, 0)'
//Khối chữ T
class TShape extends Tetromino {}
TShape.shapes =
    [
        [[0, 4, 0],
         [4, 4, 4]],

        [[4, 0],
         [4, 4],
         [4, 0]],

        [[4, 4, 4],
         [0, 4, 0]],

        [[0, 4],
         [4, 4],
         [0, 4]],
    ]
TShape.color = 'rgb(0, 255, 0)'
//Khối chữ S
class SShape extends Tetromino {}
SShape.shapes =
    [
        [[0, 5, 5],
         [5, 5, 0]],

        [[5, 0],
         [5, 5],
         [0, 5]],

        [[0, 5, 5],
         [5, 5, 0]],

        [[5, 0],
         [5, 5],
         [0, 5]],
    ]
SShape.color = 'rgb(0, 0, 255)'
//Khối chữ Z
class ZShape extends Tetromino {}
ZShape.shapes =
    [
        [[6, 6, 0],
         [0, 6, 6]],

        [[0, 6],
         [6, 6],
         [6, 0]],

        [[6, 6, 0],
         [0, 6, 6]],

        [[0, 6],
         [6, 6],
         [6, 0]],
    ]
ZShape.color = 'rgb(75, 0, 130)'
//Khối chữ I
class IShape extends Tetromino {}
IShape.shapes =
    [
        [[7],
         [7],
         [7],
         [7]],

        [[7, 7, 7, 7]],

        [[7],
         [7],
         [7],
         [7]],

        [[7, 7, 7, 7]],
    ]
IShape.color = 'rgb(143, 0, 255)'

document.addEventListener('DOMContentLoaded', () =>{
    const game = new Game()
    game.updateCurrentBoard()
    game.draw()
    game.swapTetromino()

    let startBtn = document.getElementById("start")
    let alert = document.getElementById("alert")
    startBtn.onclick = startOb
    function startOb() {
        checkStart += 1
        if (checkStart % 2 ===1 ) {
            game.play()
            startBtn.innerText = "Restart"
            game.score = 0
        } else {
            clearInterval(status)
            game.clearAll()
            startBtn.innerText = "Start"
            alert.innerHTML = "Welcome"
        }
    }


    let pauseBtn = document.getElementById("pause")
    pauseBtn.onclick = pauseOb
    function pauseOb() {
        checkPause += 1
        if (checkPause % 2 === 1) {
            game.pauseGame = true
            pauseBtn.innerText = "Continue"
        } else {
            game.pauseGame = false
            pauseBtn.innerText = "Pause"
        }
    }

    //Nhận biết phím nhấn
    window.addEventListener('keydown', (event) => {
        switch (event.keyCode) {
            case 37: //left
                game.tryMoveLeft()
                break
            case 38: //up
                game.tryRotating()
                break
            case 39: //right
                game.tryMoveRight()
                break
            case 40: //down
                game.tryMoveDown()
                break
        }
    })
})


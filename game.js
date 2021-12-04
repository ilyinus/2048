import { fieldSize, cellSize, cellMargin, fieldPadding, scrollScreen } from "./index.js"

const UP = 'UP'
const DOWN = 'DOWN'
const LEFT = 'LEFT'
const RIGHT = 'RIGHT'
const mergedTilesId = new Set()
const renderDelay = 100

let startX
let startY
let score = 0
let moved = false
let lock = false

const $field = document.querySelector('.field')
const $score = document.querySelectorAll('.score')
let field = []

class Tile {

    id = new Date().getTime().toString()
    mergeTiles = null
    isRendered = false
    isMerged = false

    constructor(value, left, top) {
        this.id += (left + top)
        this.value = value
        this.setPosition(left, top)
    }

    setPosition(left, top) {
        this.left = left
        this.top = top
        if (this.mergedTile) {
            this.mergedTile.left = left
            this.mergedTile.top = top
        }
    }

}

const doAsync = (fn, delay = 0) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                resolve(fn())
            } catch (e) {
                reject(e)
            }
        }, delay)
    })
}

const move = async direction => {

    lock = true

    switch (direction) {
        case UP:
            rotate(3)
            compress(direction)
            shiftLeft()
            compress(direction)
            rotate(1)
            break
        case DOWN:
            rotate(1)
            compress(direction)
            shiftLeft()
            compress(direction)
            rotate(3)
            break
        case LEFT:
            compress(direction)
            shiftLeft()
            compress(direction)
            break
        case RIGHT:
            rotate(2)
            compress(direction)
            shiftLeft()
            compress(direction)
            rotate(2)
    }

    render()
    await doAsync(mergeTiles, renderDelay)
    render()

    if (moved) {
        await doAsync(createTile, renderDelay)
        render()
        moved = false

        if (isGameOver()) {
            scrollScreen(3)
            return
        }

    }

    lock = false

}

const shiftLeft = () => {
    field.forEach(row => {
        for (let i = 0; i < row.length - 1; i++) {
            if (row[i] && row[i + 1] && row[i].value === row[i + 1].value) {
                row[i].mergedTile = row[i + 1]
                row[i + 1] = null
                moved = true
            }
        }
    })
}

const rotate = (count = 1) => {
    let buffer, tmp
    const sideSize = field.length - 1

    do {
        for (let i = 0; i < Math.floor(field.length / 2); i++) {
            for (let j = i; j < field.length - 1 - i; j++) {
                buffer = field[j][sideSize - i]
                field[j][sideSize - i] = field[i][j]

                tmp = field[sideSize - i][sideSize - j]
                field[sideSize - i][sideSize - j] = buffer
                buffer = tmp

                tmp = field[sideSize - j][i]
                field[sideSize - j][i] = buffer
                buffer = tmp

                field[i][j] = buffer
            }
        }
    } while (--count > 0)

}

const compress = direction => {
    field.forEach(row => {
        for (let i = 0; i < row.length - 1; i++) {
            if (!row[i]) {
                for (let j = i + 1; j < row.length; j++) {
                    if (row[j]) {

                        row[i] = row[j]
                        row[j] = null
                        moved = true

                        switch (direction) {
                            case UP:
                                row[i].setPosition(row[i].left, i)
                                break
                            case DOWN:
                                row[i].setPosition(row[i].left, row.length - 1 - i)
                                break
                            case LEFT:
                                row[i].setPosition(i, row[i].top)
                                break
                            case RIGHT:
                                row[i].setPosition(row.length - 1 - i, row[i].top)
                        }

                        break
                    }
                }
            }
        }
    })
}

const mergeTiles = () => {
    field.forEach(row => {
        row.forEach(item => {
            if (item?.mergedTile) {
                item.value += item.mergedTile.value
                score += item.value
                mergedTilesId.add(item.mergedTile.id)
                item.mergedTile = null
                item.isMerged = true
            }
        })
    })
}

const createTile = () => {
    while (true) {
        const left = Math.floor(Math.random() * fieldSize)
        const top = Math.floor(Math.random() * fieldSize)
        const value = Math.random() < 0.9 ? 2 : 4;

        if (!field[left][top]) {
            field[left][top] = new Tile(value, top, left)
            break
        }
    }
}

const isGameOver = () => {

    for (let i = 0; i < field.length; i++) {
        for (let j = 0; j < field.length - 1; j++) {
            if (!field[i][j] || !field[i][j + 1] || field[i][j].value === field[i][j + 1].value) {
                return false
            }
        }
    }

    for (let i = 0; i < field.length - 1; i++) {
        for (let j = 0; j < field.length; j++) {
            if (!field[i][j] || !field[i + 1][j] || field[i][j].value === field[i + 1][j].value) {
                return false
            }
        }
    }

    return true

}

const render = () => {

    document.querySelectorAll('.field__tile').forEach($tile => {
        const id = $tile.getAttribute('id')
        if (mergedTilesId.has(id)) {
            $field.removeChild($tile)
            mergedTilesId.delete(id)
        }
    })

    field.forEach(row => {
        row.forEach(item => {
            if (item) {
                let $tile;

                if (item.isRendered) {
                    $tile = document.getElementById(item.id)
                } else {
                    $tile = document.createElement('div')
                    $tile.setAttribute('id', item.id)
                }

                $tile.className = ''
                $tile.classList.add('field__tile')
                $tile.classList.add(`_${item.value <= 2048 ? item.value : 'max'}`)

                // set tile size
                $tile.style.width = $tile.style.height = cellSize - cellMargin * 2 + 'px'

                if (!item.isRendered) {
                    $tile.classList.add('new')
                }

                // calculate tile position
                $tile.style.left = (item.left * cellSize + cellMargin + fieldPadding) + 'px'
                $tile.style.top = (item.top * cellSize + cellMargin + fieldPadding) + 'px'

                if (item.mergedTile) {
                    const $mergedTile = document.getElementById(item.mergedTile.id)
                    $mergedTile.style.left = (item.left * cellSize + cellMargin + fieldPadding) + 'px'
                    $mergedTile.style.top = (item.top * cellSize + cellMargin + fieldPadding) + 'px'
                }

                if (item.isMerged) {
                    $tile.classList.add('merge')
                    item.isMerged = false
                }

                // calculate font-size
                $tile.style.fontSize = (cellSize - cellMargin * 2) / Math.max(item.value.toString().length, 2) * 1.2 + 'px'

                $tile.textContent = item.value

                if (!item.isRendered) {
                    $field.append($tile)
                    item.isRendered = true
                }

                $score.forEach(item => {
                    item.textContent = 'Score: ' + score
                })

            }
        })
    })

}

const initField = () => {
    field = []
    for (let i = 0; i < fieldSize; i++) {
        field.push([])
        for (let j = 0; j < fieldSize; j++) {
            field[i].push(null)
        }
    }
}

export const startGame = () => {
    moved = false
    lock = false
    score = 0
    initField()
    createTile()
    render()
}

document.addEventListener('keydown', event => {

    if (lock) return

    switch (event.key) {
        case 'ArrowUp':
            move(UP)
            break
        case 'ArrowDown':
            move(DOWN)
            break
        case 'ArrowLeft':
            move(LEFT)
            break
        case 'ArrowRight':
            move(RIGHT)
            break
    }

})

$field.addEventListener('touchstart', event => {
    startX = event.changedTouches[0].clientX
    startY = event.changedTouches[0].clientY
})

$field.addEventListener('touchend', event => {

    if (lock) return

    const endX = event.changedTouches[0].clientX
    const endY = event.changedTouches[0].clientY

    if (Math.abs(startX - endX) > Math.abs(startY - endY)) {
        if (startX < endX) {
            move(RIGHT)
        } else {
            move(LEFT)
        }
    } else {
        if (startY > endY) {
            move(UP)
        } else {
            move(DOWN)
        }
    }

})
import { startGame } from './game.js'

export let fieldSize = 4
export let cellSize
export let cellMargin
export let fieldPadding

export const screens = document.querySelectorAll('.screen')
const sizeButtonsGroup = document.querySelector('.button-size-group')

export const scrollScreen = screenNumber => {
    screens.forEach(screen => {
        screen.style.position = 'relative'
        screen.style.zIndex = '0'
        screen.style.marginTop = '0'
    })

    for (let i = 1; i < screenNumber; i++) screens[i - 1].style.marginTop = '-100vh'

    setTimeout(() => {
        for (let i = 0; i < screens.length; i++) {
            if (i + 1 !== screenNumber) {
                screens[i].style.zIndex = '-1'
            }
            screens[i].style.position = 'absolute'
        }
    }, 500)
}

const prepareField = () => {
    const $field = document.querySelector('.field')
    $field.innerHTML = ''

    const screenWidth = document.body.clientWidth
    const screenHeight = document.body.clientHeight / document.querySelectorAll('.screen').length
    const min = Math.min(screenHeight, screenWidth)
    const size = min * (screenHeight > screenWidth ? 0.9 : 0.6) // field size

    fieldPadding = size * 0.01

    $field.style.width = size + 'px'
    $field.style.height = size + 'px'
    $field.style.padding = fieldPadding + 'px'

    cellSize = (size - fieldPadding * 2) / fieldSize
    cellMargin = cellSize * 0.04

    for (let i = 0; i < fieldSize * fieldSize; i++) {
        const $cell = document.createElement('div')
        $cell.style.width = $cell.style.height = cellSize - cellMargin * 2 + 'px'
        $cell.style.margin = cellMargin + 'px'
        $cell.classList.add('field__cell')
        $field.append($cell)
    }
}

sizeButtonsGroup.addEventListener('click', event => {
    if (event.target.nodeName === 'BUTTON') {
        sizeButtonsGroup.childNodes.forEach(node => {
            if (node.nodeName === 'BUTTON' && node !== event.target) {
                node.classList.remove('active')
            } else if (node.nodeName === 'BUTTON') {
                node.classList.add('active')
                fieldSize = parseInt(node.textContent.split('x')[0])
            }
        })
    }
})

document.querySelector('.btn-primary').addEventListener('click', () => {
    scrollScreen(2)
    prepareField()
    startGame()
})

document.querySelectorAll('.btn-menu').forEach(btn => {
    btn.addEventListener('click', () => {
        scrollScreen(1)
    })
})
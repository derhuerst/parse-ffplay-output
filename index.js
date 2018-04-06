'use strict'

const Terminal = require('headless-terminal')
const {Writable} = require('stream')

const width = 80
const height = 20

const createParser = () => {
	const terminal = new Terminal(width, height) // todo: options

	const write = (chunk, enc, cb) => {
		if (Buffer.isBuffer(chunk)) chunk = Buffer.from(chunk, enc)
		terminal.write(chunk)
		cb()
	}

	const slice = (y, x0, x1) => {
		let str = ''
		for (let x = x0; x < x1; x++) {
			const cell = terminal.displayBuffer.getCell(y, x)
			if (cell) str += cell[1]
		}
		return str
	}

	const getProgress = () => {
		let y = 0
		while (y < height) {
			const chunk = slice(y, 0, 13)
			const i = chunk.indexOf(' M-A: ')
			if (i > 0) return parseFloat(chunk.slice(0, i).trim())
			y++
		}
	}

	const parser = new Writable({write})
	parser.getProgress = getProgress
	return parser
}

module.exports = createParser

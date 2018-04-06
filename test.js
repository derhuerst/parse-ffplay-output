'use strict'

const path = require('path')
const {platform} = require('os')
const test = require('tape')
const pty = require('node-pty')

const createParser = require('.')

const file = path.join(__dirname, '440-hz.ogg')
const shell = platform() === 'win32' ? 'powershell.exe' : 'bash'

test('emits a reasonable progress value', {timeout: 10 * 1000}, (t) => {
	const sub = pty.spawn(shell, [], {
		name: 'parse-ffplay-output',
		cols: 80,
		rows: 30,
		cwd: process.cwd(),
		env: process.env
	})

	const parser = createParser()
	sub.pipe(parser)
	sub.write(`ffplay -vn -hide_banner -stats -nodisp -autoexit '${file}'; exit\n`)

	const validProgress = (expected) => () => {
		const p = parser.getProgress()
		t.equal(typeof p, 'number')
		t.notOk(Number.isNaN(p))
		t.ok(Math.round(p), expected)
	}

	t.plan(3 * 3)
	setTimeout(validProgress(1), 1 * 1000)
	setTimeout(validProgress(2), 2 * 1000)
	setTimeout(validProgress(8), 8 * 1000)
})

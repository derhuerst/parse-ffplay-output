'use strict'

const path = require('path')
const {platform} = require('os')
const test = require('tape')
const pty = require('node-pty')

const createParser = require('.')

const file = path.join(__dirname, '440-hz.ogg')
const shell = platform() === 'win32' ? 'powershell.exe' : 'bash'
const exe = platform() === 'linux' ? 'avplay' : 'ffplay'

test('emits a reasonable progress value', {timeout: 15 * 1000}, (t) => {
	t.plan(1 + 3 * 3)

	const sub = pty.spawn(shell, [], {
		name: 'parse-ffplay-output',
		cols: 80,
		rows: 30,
		cwd: process.cwd(),
		env: process.env
	})

	const parser = createParser()
	sub.pipe(parser)
	sub.write(`${exe} -vn -hide_banner -stats -nodisp -autoexit '${file}'; exit\n`)

	sub.once('exit', function (code) {
		t.equal(code, 0)
	})

	const validProgress = (expected) => () => {
		const p = parser.getProgress()
		t.equal(typeof p, 'number')
		t.notOk(Number.isNaN(p))
		t.ok(Math.round(p), expected)
	}

	setTimeout(validProgress(1), 1 * 1000)
	setTimeout(validProgress(2), 2 * 1000)
	setTimeout(validProgress(8), 8 * 1000)
})

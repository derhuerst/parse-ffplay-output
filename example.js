'use strict'

const path = require('path')
const {platform} = require('os')
const pty = require('node-pty')

const createParser = require('.')

const file = path.join(__dirname, '440-hz.ogg')
const shell = platform() === 'win32' ? 'powershell.exe' : 'bash'

const sub = pty.spawn(shell, [], {
	name: 'parse-ffplay-output',
	cols: 80,
	rows: 30,
	cwd: process.cwd(),
	env: process.env
})

sub.write(`ffplay -vn -hide_banner -stats -nodisp -autoexit '${file}'; exit\n`)

sub.once('exit', function (code) {
	parser.end()
	clearInterval(interval)
	process.exitCode = code
})

const parser = createParser()
sub.pipe(parser)

const interval = setInterval(() => {
	console.error('progress', parser.getProgress())
}, 1 * 1000)

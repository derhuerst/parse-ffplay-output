'use strict'

const path = require('path')
const {platform} = require('os')
const pty = require('node-pty')

const createParser = require('.')

const file = path.join(__dirname, '440-hz.ogg')
const shell = platform() === 'win32' ? 'powershell.exe' : 'bash'
const exe = platform() === 'linux' ? 'avplay' : 'ffplay'

const sub = pty.spawn(shell, [], {
	name: 'parse-ffplay-output',
	cols: 80,
	rows: 30,
	cwd: process.cwd(),
	env: process.env
})

sub.write(`${exe} -vn -hide_banner -stats -nodisp -autoexit '${file}'; exit\n`)

sub.on('exit', function (code) {
	process.exitCode = code
})

const parser = createParser()
sub.pipe(parser)

setInterval(() => {
	console.error('progress', parser.getProgress())
}, 1 * 1000)

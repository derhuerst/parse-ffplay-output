'use strict'

const path = require('path')
const {platform} = require('os')
const pty = require('node-pty')

const createParser = require('.')

if (!process.argv[2]) {
	console.error('Missing file path.')
	process.exit(1)
}
const file = path.join(__dirname, process.argv[2])
const shell = platform() === 'win32' ? 'powershell.exe' : 'bash'

const sub = pty.spawn(shell, [], {
	name: 'parse-ffplay-output',
	cols: 80,
	rows: 30,
	cwd: process.cwd(),
	env: process.env
})

sub.write(`ffplay -vn -volume 0 -hide_banner -stats -nodisp '${file}'; exit\n`)

const parser = createParser()
sub.pipe(parser)

setInterval(() => {
	console.error('progress', parser.getProgress())
}, 1 * 1000)

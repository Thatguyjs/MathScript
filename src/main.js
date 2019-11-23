const process = require("process");
const Command = require("./command.js");

const Compiler = require("./compiler/main.js");
const Parser = require("./parser/main.js");


// Setup commands
Command.setPrefix('-');
Command.setHelp('help');

Command.addCommand('c', "compile a program");
Command.addCommand('r', "run a compiled program");


// Construct a command to compile or parse
function construct(args) {
	if(!args[0]) return;
	if(!args[0].arguments.length) return console.log("A filepath is required");

	let command = {
		type: args[0].name === 'c' ? "compile" : "parse",
		filepath: args[0].arguments[0]
	};

	if(command.filepath[0] !== '.' && !command.filepath[1] !== ':') {
		command.filepath = './' + command.filepath;
	}

	return command;
}


// Compile a program
function compile(command) {
	Compiler.load(command.filepath, (code) => {
		if(code !== 0) console.log("Error");
		else Compiler.run();
	});
}


// Parse program
function parse(command) {
	Parser.load(command.filepath, (code) => {
		if(code !== 0) console.log("Error");
		else Parser.run();
	});
}


// Get arguments and compile / parse
let arguments = Command.parse(process.argv.slice(2));
let constructor = construct(arguments);

if(constructor) {
	if(constructor.type === 'compile') compile(constructor);
	else if(constructor.type === 'parse') parse(constructor);
}

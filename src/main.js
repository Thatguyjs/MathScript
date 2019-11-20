const process = require("process");
const Command = require("./command.js");

const Compiler = require("./compiler/main.js");
const Parser = require("./parser/main.js");


// Construct a command to compile or parse
function construct(args) {
	let command = {
		filepath: args[0]
	};

	if(command.filepath[0] !== '.' && !command.filepath[1] !== ':') {
		command.filepath = './' + command.filepath;
	}

	return command;
}


function compile(command) {
	Compiler.load(command.filepath, (code) => {
		if(code !== 0) console.log("Error");
		else Compiler.run();
	});
}


compile(construct(process.argv.slice(2)));

const Events = require("./event.js");
const IO = require("./io.js");


// Init Main
const Main = {
	separator: String.fromCharCode(31),

	stringCode: String.fromCharCode(30),
	numberCode: String.fromCharCode(29),
	nullCode: String.fromCharCode(28),

	commands: [],
	commandNum: 0,
	index: 1, // Skip `Program`

	statementPassed: false,

	memory: [],

	error: false,
	exitCode: 0
};


// Load and check the file
Main.load = function(data) {
	if(data.slice(0, 8) !== "Program" + this.separator) {
		console.log("File format not supported");
		return -1;
	}

	this.commands = data.split(this.separator);
	this.commandNum = this.commands.length;

	return 0;
}


// Call a pre-defined function
Main.callPreset = function(code, params) {
	switch(code) {

		// Print
		case -1:
			IO.log(params);
		break;

		// Get input
		case -2:
			if(typeof params[0] !== 'string') {
				IO.error(`Expected \"string\" for input, got \"${typeof params[0]}\" instead`);
				return this.error = true;
			}
			if(typeof params[1] !== 'number') {
				IO.error(`Expected \"number\" for input, got \"${typeof params[0]}\" instead`);
				return this.error = true;
			}

			process.stdout.write(params[0]);

			Events.pause();
			IO.getInput((data) => {
				Main.memory[params[1]] = data.replace(/\r|\n/g, ''); // Remove newlines
				Events.resume();
			});
		break;

		// Turn into number
		case -3:
		return Number(params[0]);

	}
}


// Call a user-defined function
Main.callFunc = function(address, params) {
	// TODO
}


// Do operations, return the result
Main.operate = function(op) {
	switch(op) {

		case 'exp':
		return Main.parseNode() ** Main.parseNode();

		case 'mul':
		return Main.parseNode() * Main.parseNode();

		case 'div':
		return Main.parseNode() / Main.parseNode();

		case 'add':
		return Main.parseNode() + Main.parseNode();

		case 'sub':
		return Main.parseNode() - Main.parseNode();

		case 'more':
		return Main.parseNode() > Main.parseNode();

		case 'less':
		return Main.parseNode() < Main.parseNode();

		case 'moeq':
		return Main.parseNode() >= Main.parseNode();

		case 'lseq':
		return Main.parseNode() <= Main.parseNode();

		case 'eqal':
		return Main.parseNode() === Main.parseNode();

		case 'and':
		return Main.parseNode() && Main.parseNode();

		case 'or':
		return Main.parseNode() || Main.parseNode();

	}
}


// Parse & run the next command
Main.parseNode = function() {
	let node = this.commands[this.index];

	// Value (string, number, etc.)
	if(node[0] === this.stringCode) {
		this.index++;
		return node.slice(1);
	}
	else if(node[0] === this.numberCode) {
		this.index++;
		return Number(node.slice(1));
	}
	else if(node[0] === this.nullCode) {
		this.index++;
		return null;
	}

	let condition = false;

	switch(node) {

		// Define a variable
		case 'def':
			this.index++;
			this.memory[Main.parseNode()] = Main.parseNode(); // Allocate memory
		return;

		// Set a variable
		case 'set':
			this.index++;
			this.memory[Main.parseNode()] = Main.parseNode(); // Set memory
		return;

		// Get a variable
		case 'get':
			this.index++;
		return this.memory[Main.parseNode()];

		// Operations
		case 'exp':
		case 'mul':
		case 'div':
		case 'add':
		case 'sub':
		case 'more':
		case 'less':
		case 'moeq':
		case 'lseq':
		case 'eqal':
		case 'and':
		case 'or':
			this.index++;
		return Main.operate(node);

		// If statement
		case 'if':
			this.index++;

			condition = Main.parseNode();
			this.index++;

			if(condition) {
				this.statementPassed = true;

				while(this.commands[this.index] !== 'endif' && !this.error) {
					Main.parseNode();
				}
			}
			else {
				this.statementPassed = false;

				while(this.commands[this.index] !== 'endif') {
					this.index++;
				}
			}

			this.index++;
		return;

		// Else statement
		case 'else':
			this.index++;

			condition = Main.parseNode();
			this.index++;

			if(!this.statementPassed && condition) {
				this.statementPassed = true;

				while(this.commands[this.index] !== 'endif' && !this.error) {
					Main.parseNode();
				}
			}
			else {
				while(this.commands[this.index] !== 'endif') {
					this.index++;
				}

				if(this.commands[this.index+1] !== 'else') this.statementPassed = false;
			}

			this.index++;
		return;

		// Call a function
		case 'run':
			this.index++;

			let address = Main.parseNode();
			let params = [];

			while(this.commands[this.index] !== 'end' && !this.error) {
				params.push(Main.parseNode());
			}

			this.index++;

		// Pre-defined
		if(address < 0) return Main.callPreset(address, params);
		else return Main.callFunc(address, params);

	}

	console.log("Invalid command: \"" + node + "\" at index " + this.index);
	this.error = true;
}


// Run the program & return the result code
Main.run = function() {
	Events.on('tick', () => {
		if(Main.index < Main.commandNum-1 && !Main.error) {
			Main.parseNode();
		}
		else {
			Events.remove('tick');
			Events.do('end');
		}
	});

	return new Promise((resolve) => {
		Events.on('end', () => {
			if(Main.error) {
				console.log("ERROR");
			}

			resolve(this.exitCode);
		});
	});
}


module.exports = Main;

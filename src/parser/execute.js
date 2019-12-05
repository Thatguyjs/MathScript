const IO = require("./io.js");


const Main = {
	separator: String.fromCharCode(31),

	stringCode: String.fromCharCode(30),
	numberCode: String.fromCharCode(29),
	nullCode: String.fromCharCode(28),

	commands: [],
	commandNum: 0,
	index: 1,

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


// Default functions
Main.callPreset = function(code, params) {
	switch(code) {

		// Print
		case -1:
			IO.log(params);
		break;

		// Input
		case -2:
			if(typeof params[0] !== 'string') {
				IO.error(`Expected \"string\" for input, got \"${typeof params[0]}\" instead`);
				return this.error = true;
			}

			process.stdout.write(params[0]);

		return new Promise((resolve) => {
			IO.getInput((data) => {
				resolve(data.slice(0, -1)); // Remove newline
			})
		});

		// Number
		case -3:
		return Number(params[0]);

	}
}


// Do operations, return the result
Main.operate = async function(op) {
	switch(op) {

		case 'exp':
		return await Main.parseNode() ** await Main.parseNode();

		case 'mul':
		return await Main.parseNode() * await Main.parseNode();

		case 'div':
		return await Main.parseNode() / await Main.parseNode();

		case 'add':
		return await Main.parseNode() + await Main.parseNode();

		case 'sub':
		return await Main.parseNode() - await Main.parseNode();

		case 'more':
		return await Main.parseNode() > await Main.parseNode();

		case 'less':
		return await Main.parseNode() < await Main.parseNode();

		case 'moeq':
		return await Main.parseNode() >= await Main.parseNode();

		case 'lseq':
		return await Main.parseNode() <= await Main.parseNode();

		case 'eqal':
		return await Main.parseNode() === await Main.parseNode();

		case 'and':
		return await Main.parseNode() && await Main.parseNode();

		case 'or':
		return await Main.parseNode() || await Main.parseNode();

	}
}


// Parse the next node (command or value)
Main.parseNode = async function() {
	let node = this.commands[this.index];
	let temp = []; // Temporary storage

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

	switch(node) {

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
		return await Main.operate(node);

		// Define a variable
		case 'def':
			this.index++;
			this.memory[await Main.parseNode()] = await Main.parseNode(); // Allocate memory
		return;

		// Set a variable
		case 'set':
			this.index++;
			this.memory[await Main.parseNode()] = await Main.parseNode(); // Set memory
		return;

		// Get a variable
		case 'get':
			this.index++;
		return this.memory[await Main.parseNode()];

		// If statements
		case 'if':
			this.index++;

			temp[0] = await Main.parseNode(); // Condition
			this.index++;

			if(temp[0]) {
				this.statementPassed = true;

				while(this.commands[this.index] !== 'endif' && !this.error) {
					await Main.parseNode();
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

		// Else statements
		case 'else':
			this.index++;

			temp[0] = await Main.parseNode(); // Condition
			this.index++;

			if(!this.statementPassed && temp[0]) {
				this.statementPassed = true;

				while(this.commands[this.index] !== 'endif' && !this.error) {
					await Main.parseNode();
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

			temp[0] = await Main.parseNode(); // Address
			temp[1] = []; // Parameters

			while(this.commands[this.index] !== 'end' && !this.error) {
				temp[1].push(await Main.parseNode());
			}

			this.index++;

		if(temp[0] < 0) return await Main.callPreset(temp[0], temp[1]);
		else return await Main.callFunc(temp[0], temp[1]);

	}

	console.log("Invalid command: \"" + node + "\" at index " + this.index);
	this.error = true;
}


// Run the parser
Main.run = async function() {
	while(this.index < this.commandNum-1 && !this.error) {
		await this.parseNode();
	}
}


module.exports = Main;

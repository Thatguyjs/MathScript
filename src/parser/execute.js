const Main = {
	separator: String.fromCharCode(31),
	valueCode: String.fromCharCode(26),

	commands: [],
	commandNum: 0,
	index: 1, // Skip `Program`

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
			console.log(params.join(' '));
		break;

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
	if(node[0] === this.valueCode) {
		this.index++;

		if(!isNaN(Number(node.slice(1)))) return Number(node.slice(1));
		return node.slice(1);
	}

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
			if(address < 0) Main.callPreset(address, params);
			else Main.callFunc(address, params);
		return; // TODO: Return statement from function


	}

	console.log("Invalid command: \"" + node + "\" at index " + this.index);
	this.error = true;
}


// Run the program & return the result code
Main.run = function() {
	while(this.index < this.commandNum-1 && !this.error) {
		this.parseNode(this.index);
	}

	if(this.error) {
		console.log("ERROR");
		return -1;
	}

	return this.exitCode;
}


module.exports = Main;

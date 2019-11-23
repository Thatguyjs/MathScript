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


// Do operations, return the result
Main.operate = function(op) {
	switch(op) {

		case 'add':
		return Main.parseNode() + Main.parseNode();

		case 'sub':
		return Main.parseNode() - Main.parseNode();

		case 'mul':
		return Main.parseNode() * Main.parseNode();

		case 'div':
		return Main.parseNode() / Main.parseNode();

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

		case 'def':
			this.index++;
			// Allocate memory
			this.memory[Main.parseNode()] = Main.parseNode();
		return;

		case 'add':
		case 'sub':
		case 'mul':
		case 'div':
			this.index++;
		return Main.operate(node);

	}

	console.log("Invalid command: \"" + node + "\" at index " + this.index);
	this.error = true;
}


// Run the program & return the result code
Main.run = function() {
	while(this.index < this.commandNum && !this.error) {
		this.parseNode(this.index);
	}

	if(this.error) {
		console.log("ERROR");
		return -1;
	}

	return this.exitCode;
}


module.exports = Main;
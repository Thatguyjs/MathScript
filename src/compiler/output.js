// Convert the AST (tree.js) into executable instructions

const Main = {
	// Use the `Unit Separator` for separating commands and arguments
	separator: String.fromCharCode(31),

	// Prefix non-commands for the parser
	stringCode: String.fromCharCode(30),
	numberCode: String.fromCharCode(29),
	nullCode: String.fromCharCode(28),

	// Maps operators to command names
	operators: {
		'**': 'exp',
		'*': 'mul', '/': 'div',
		'+': 'add', '-': 'sub',
		'>': 'more', '<': 'less', '>=': 'moeq', '<=': 'lseq', '==': 'eqal',
		'&&': 'and', '||': 'or'
	},

	// Memory references for variables
	memory: {
		"print": -1,
		"input": -2,
		"number": -3
	},

	// Memory pointer
	currentAddr: 0,

	tree: {},
	output: ""
};


// Load an AST
Main.load = function(tree) {
	this.tree = tree;
}


// Return arguments in a command format
Main.command = function(name, args="") {
	if(args !== "") {
		args.unshift(""); // Put a seperator after the first argument
		args = args.join(this.separator);
	}

	return name + args + this.separator;
}


// Convert a node into instructions
Main.compileNode = function(node) {
	switch(node.type) {

		// Compile a whole program
		case 'Program':
		return Main.command("Program") + node.body.map(Main.compileNode).join("");

		// Ignore EOLs
		case 'EOL':
		return "";

		// Ignore commas
		case 'COMMA':
		return "";

		// Operations
		case 'OPERATE':
		return Main.command(Main.operators[node.name], [Main.compileNode(node.params[0]), Main.compileNode(node.params[1])]);

		// Definitions
		case 'DEFINE':
			// Create variable reference
			Main.memory[node.id] = Main.currentAddr;
			Main.currentAddr++;
		return Main.command("def", [Main.numberCode + Main.memory[node.id], Main.compileNode(node.value)]);

		// Set a variable
		case 'SET':
		return Main.command("set", [Main.numberCode + Main.memory[node.id], Main.compileNode(node.value)]);

		// Reference and dereference a variable
		case 'REFERENCE':
		if(node.name === '&') return Main.numberCode + Main.memory[node.value.value];
		else return Main.command("get", [Main.compileNode(node.value)]);

		// Statements
		case 'STATEMENT':
			node.params = Main.compileNode(node.params);
			node.value = node.value.map(Main.compileNode);
			node.value.push("endif");
			node.value = node.value.join('');
		return Main.command(node.name, [node.params, "end", node.value]);

		// Function calls
		case 'CALL':
			node.params = node.params.map(Main.compileNode);
			node.params.unshift(Main.numberCode + Main.memory[node.id]);
			node.params.push("end");
		return Main.command("run", node.params);

		// Names
		case 'NAME':
		return Main.command("get", [Main.numberCode + Main.memory[node.value]]);

		// Booleans
		case 'BOOLEAN':
		return Main.numberCode + (node.value === "true" ? '1' : '0');

		// Strings
		case 'STRING':
		return Main.stringCode + node.value; // Prevent parser confusion

		// Numbers
		case 'NUMBER':
		return Main.numberCode + node.value;

		// Null (no value)
		case 'NULL':
		return Main.nullCode;

	}

	// Unexpected node
	Main.error = true;
}


// Run the parser & return the output string
Main.run = function() {
	this.output = Main.compileNode(this.tree);

	if(this.error) {
		console.log("Error generating commands (step 3 of 3)");
		return -1;
	}

	// Remove repeat separators
	let multiple = new RegExp(this.separator + this.separator, 'g');

	while(this.output.match(multiple)) {
		this.output = this.output.replace(multiple, this.separator);
	}

	return this.output;
}


module.exports = Main;

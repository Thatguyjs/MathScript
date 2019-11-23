// Convert the AST (tree.js) into executable instructions

const Main = {
	// Use the `Unit Separator` for separating commands and arguments
	separator: String.fromCharCode(31),

	// Use `Substitute` in fron of values to prevent confusion with commands
	valueCode: String.fromCharCode(26),

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
		"print": -1
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

		// Operations
		case 'OPERATE':
		return Main.command(Main.operators[node.name], [Main.compileNode(node.params[0]), Main.compileNode(node.params[1])]);

		// Definitions
		case 'DEFINE':
			// Create variable reference
			Main.memory[node.id] = Main.currentAddr;
			Main.currentAddr++;
		return Main.command("def", [Main.valueCode + Main.memory[node.id], Main.compileNode(node.value)]);

		// Set a variable
		case 'SET':
		return Main.command("set", [Main.valueCode + Main.memory[node.id], Main.compileNode(node.value)]);

		// Function calls
		case 'CALL':
			node.params = node.params.map(Main.compileNode);
			node.params.unshift(Main.valueCode + Main.memory[node.id]);
			node.params.push("end");
		return Main.command("run", node.params);

		// Names
		case 'NAME':
		return Main.command("get", [Main.valueCode + Main.memory[node.value]]);

		// Booleans
		case 'BOOLEAN':
		return Main.valueCode + (node.value === "true" ? '1' : '0');

		// Strings
		case 'STRING':
		return Main.valueCode + node.value; // Prevent parser confusion

		// Literals
		default:
		return Main.valueCode + node.value;

	}
}


// Run the parser & return the output string
Main.run = function() {
	this.output = Main.compileNode(this.tree);

	// Remove repeat separators
	let multiple = new RegExp(this.separator + this.separator, 'g');

	while(this.output.match(multiple)) {
		this.output = this.output.replace(multiple, this.separator);
	}

	return this.output;
}


module.exports = Main;

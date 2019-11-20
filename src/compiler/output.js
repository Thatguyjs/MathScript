// Convert the AST (tree.js) into executable instructions

const Main = {
	// Use the `Unit Separator` for separating commands and arguments
	separator: String.fromCharCode(31),

	// Maps operators to command names
	operators: {
		'**': 'exp',
		'*': 'mul', '/': 'div',
		'+': 'add', '-': 'sub',
		'>': 'mor', '<': 'les', '>=': 'mrq', '<=': 'lsq', '==': 'equ',
		'&&': 'and', '||': 'oor'
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
		args.unshift("");
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
		return Main.command(Main.operators[node.name], [Main.compileNode(node.params[0]), Main.compileNode(node.params[1])]).slice(0, -1);

		// Definitions
		case 'DEFINE':
			// Create variable reference
			Main.memory[node.id] = Main.currentAddr;
			Main.currentAddr++;
		return Main.command("def", [Main.memory[node.id], Main.compileNode(node.value)]);

		// Set a variable
		case 'SET':
		return Main.command("set", [Main.memory[node.id], Main.compileNode(node.value)]);

		// Function calls
		case 'CALL':
			node.params = node.params.map(Main.compileNode);
			node.params.unshift(Main.memory[node.id]);
			node.params.push("end");
		return Main.command("run", node.params);

		// Names
		case 'NAME':
		return Main.memory[node.value];

		// Literals
		default:
		return node.value;

	}
}


// Run the parser & return the output string
Main.run = function() {
	this.output = Main.compileNode(this.tree);
	
	return this.output;
}


module.exports = Main;

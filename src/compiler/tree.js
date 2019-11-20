// Generate an Abstract Syntax Tree from tokens (lexer.js)

const Main = {
	tokens: [],
	current: 0,

	tree: { type: "Program", body: [] },

	error: false
};


// Load a list of tokens
Main.load = function(tokens) {
	this.tokens = tokens;
}


// Parse the next token into part of the tree
Main.walk = function() {
	let token = this.tokens[this.current];
	let peek = this.tokens[this.current+1];

	// Check the next token first
	if(peek) {

		// Operation
		if(peek.type === "OPERATOR") {
			let future = this.tokens[this.current+3]; // Check with future operators

			// Store future operation first
			if(future.type === "OPERATOR" && future.order < peek.order) {
				let childNode = {
					type: "OPERATE",
					name: peek.value,
					params: [token, this.tokens[this.current+2]]
				};

				let parentNode = {
					type: "OPERATE",
					name: future.value,
					params: [childNode]
				};

				this.current += 4;
				parentNode.params.push(Main.walk());

				return parentNode;
			}

			// Store the current operation first
			let node = {
				type: "OPERATE",
				name: peek.value,
				params: [token]
			};

			this.current += 2;
			node.params.push(Main.walk());

			return node;
		}

		// Set a variable
		else if(peek.type === "SET") {
			this.current += 2; // So `this.tokens[this.current]` is the value

			let node = {
				type: "SET",
				id: token.value,
				value: Main.walk()
			};

			// TODO: Check value type (bool, int, char, string)

			return node;
		}

		// Function call
		else if(token.type === "NAME" && peek.value === "(") {
			this.current += 2;

			let node = {
				type: "CALL",
				id: token.value,
				params: []
			};

			// Get parameters
			while(this.tokens[this.current].value !== ")") {
				node.params.push(Main.walk());
			}

			this.current++;
			return node;
		}

	}

	// Use the current token

	// Define a variable
	if(token.type === "DATATYPE") {
		let node = {
			type: "DEFINE",
			name: token.value,
			id: peek.value,
			value: { type: "NULL", value: null }
		};

		switch(Main.tokens[this.current+2].type) {

			// Assign a value
			case 'SET':
				this.current += 3;
				node.value = Main.walk();
			break;

			case 'EOL':
				this.current += 2;
			break;

			default:
				this.error = true;
				console.log("Unexpected Token: " + Main.tokens[this.current+2].value);
			break;

		}

		return node;
	}

	// Misc. Token types
	else {
		this.current++;
		return token;
	}

	// No match
	this.error = true;
	return null;
}


// Generate a tree from `Main.tokens`
Main.run = function() {
	while(this.current < this.tokens.length && !this.error) {
		this.tree.body.push(this.walk());
	}

	if(this.error) {
		console.log("Error generating AST");
		return -1;
	}

	return this.tree;
}


module.exports = Main;
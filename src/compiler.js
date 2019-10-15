let Main = {
	matches: [
		[/\/\//, 'COMMENT'],
		[/\/\*/, 'BLOCK-COMMENT'],
		[/\s+/, 'WHITESPACE'],

		[/;/, 'EOL'],

		[/\(|\)/, 'PAREN'],
		[/\{|\}/, 'OBJECT'],
		[/\[|\]/, 'ARRAY'],

		[/\+|\-|\/|\*|>|<|>=|<=|==|&&|\|\|/, 'OPERATE'],
		[/=/, 'SET'],
		[/,/, 'SEPERATE'],
		[/return\s+/, 'RETURN'],

		[/if|else/, 'STATEMENT'],
		[/(int|string|bool)\s+/, 'DATATYPE'],

		[/function/, 'FUNCTION'],
		[/\d+/, 'NUMBER'],
		[/\"|\'|\`/, 'STRING'],
		[/true|false/, 'BOOL'],

		[/null/, 'NULL'],

		[/[a-z]+/i, 'NAME']
	],

	values: {
		"OPERATE": {
			'val': 'order',
			'&&': 0, '||': 0,
			'>': 1, '<': 1, '>=': 1, '<=': 1, '==': 1,
			'+': 1, '-': 1,
			'*': 2, '/': 2
		},
		"DATATYPE": {
			'val': 'holds',
			'int': 'NUMBER',
			'string': 'STRING',
			'bool': 'BOOL'
		}
	},

	globalAllowedTypes: [
		'OPERATOR', 'FUNCTION', 'ARRAY'
	],

	data: "",
	tokens: [],
	tree: {},

	error: false,
};


// Generate list of tokens
Main.generateTokens = function() {

	// Remove a past section of data
	function sliceTo(index, skip=0) {
		if(index < 0) {
			Main.error = true;
			return;
		}
		Main.data = Main.data.slice(index + skip);
	}

	// Gets the next token
	function next() {
		let result = null;

		for(let t in Main.matches) {
			let match = Main.data.match(Main.matches[t][0]);

			if(match && match.index === 0) {
				let custom = null;

				switch(Main.matches[t][1]) {

					case 'COMMENT':
						sliceTo(Main.data.indexOf('\n'), 1);
						result = next();
					break;

					case 'BLOCK-COMMENT':
						sliceTo(Main.data.indexOf('*/'), 2);
						result = next();
					break;

					case 'WHITESPACE':
						sliceTo(match[0].length);
						result = next();
					break;

					case 'STRING':
						result = {
							type: Main.matches[t][1],
							value: Main.data.slice(1, Main.data.indexOf(match[0], 1))
						};

						sliceTo(result.value.length+2);

						// For custom values
						custom = Main.values[Main.matches[t][1]];
						if(custom) result[custom.val] = custom[match[0]];
					break;

					default:
						sliceTo(match[0].length);

						result = {
							type: Main.matches[t][1],
							value: match[0].trim()
						};

						// For custom values
						custom = Main.values[Main.matches[t][1]];
						if(custom) result[custom.val] = custom[match[0].trim()];
					break;

				}
				break;
			}
		}

		if(!result && Main.data.length) Main.error = true;
		return result;
	}

	let token = next();


	while(token && !this.error) {
		this.tokens.push(token);
		token = next();
	}

	if(this.error) {
		console.log("Reading Error!");
		return null;
	}

	return 0;
}


// Generate an AST from the tokens
Main.generateTree = function() {
	this.tree = { type: "Program", body: [] };

	let current = 0;

	function walk() {
		let token = Main.tokens[current];
		let peek = Main.tokens[current+1];

		// Check the next token
		if(peek) {

			// Operator
			if(peek.type === 'OPERATE') {
				if(Main.tokens[current+3].type === 'OPERATE') {
					if(Main.tokens[current+3].order <= peek.order) {
						let node = {
							type: "OPERATE",
							name: peek.value,
							params: [token, Main.tokens[current+2]]
						};

						let parent = {
							type: "OPERATE",
							name: Main.tokens[current+3].value,
							params: [node]
						};

						current += 4;
						parent.params.push(walk());

						return parent;
					}
				}

				let node = {
					type: "OPERATE",
					name: peek.value,
					params: [token]
				};

				current += 2;
				node.params.push(walk());

				return node;
			}

			// Set variable
			else if(peek.type === 'SET') {
				current += 2;

				let node = {
					type: "SET",
					id: token.value,
					value: walk()
				};

				// TODO: Check value type

				return node;
			}

			// Call function
			else if(token.type === 'NAME' && peek.value === '(') {
				current += 2;

				let node = {
					type: "CALL",
					id: token.value,
					params: []
				};

				while(Main.tokens[current].value !== ')') {
					node.params.push(walk());
				}

				current++;
				return node;
			}

		}

		// Define a variable
		if(token.type === 'DATATYPE') {
			let node = {
				type: "DATATYPE",
				name: token.value,
				id: peek.value,
				value: { type: "NULL", value: 'null' }
			};

			if(Main.tokens[current+2].type === 'SET') {
				current += 3;
				node.value = walk();

				if(!Main.globalAllowedTypes.includes(node.value.type) && node.value.type !== token.holds) {
					Main.error = true;
					console.log("TypeError");
				}
			}
			else if(Main.tokens[current+2].type === 'EOL') {
				current += 2;
			}
			else {
				Main.error = true;
				console.log(`Unexpected token '${Main.tokens[current+2].value}'`);
			}

			return node;
		}

		// If / else statements
		else if(token.type === 'STATEMENT') {
			let node = {
				type: "STATEMENT",
				name: token.value,
				params: {},
				data: []
			};

			if(token.value === 'if') {
				current += 2;
				node.params = walk();

				current += 2;
				while(Main.tokens[current].value !== '}') {
					node.data.push(walk());
				}
			}

			else {
				if(Main.tokens[current+1].value === 'if') {
					current += 3;
					node.params = walk();
				}
				else {
					node.params = { type: "BOOL", value: true };
				}

				current += 2;
				while(Main.tokens[current].value !== '}') {
					node.data.push(walk());
				}
			}

			current++;
			return node;
		}

		// Functions
		else if(token.type === 'FUNCTION') {
			let node = {
				type: "FUNCTION",
				params: [],
				data: []
			};

			current += 2;
			let depth = 0;

			while(Main.tokens[current].value !== ')' || depth !== 0) {
				let val = walk();
				if(val.value === '(') depth++;
				else if(val.value === ')') depth--;

				node.params.push(val);
			}

			current += 2;
			depth = 0;

			while(Main.tokens[current].value !== '}' || depth !== 0) {
				let val = walk();
				if(val.value === '{') depth++;
				else if(val.value === '}') depth--;

				node.data.push(val);
			}

			current++;
			return node;
		}

		// Return statement
		else if(token.type === 'RETURN') {
			current++;
			return {
				type: "RETURN",
				value: walk()
			};
		}

		// Other values
		else {
			current++;
			return token;
		}

		// Nothing returned, throw error
		Main.error = true;
		return null;
	}

	while(current < this.tokens.length && !this.error) {
		this.tree.body.push(walk());
	}

	if(this.error) return null;
	return 0;
}


// Convert the AST into a compact string
Main.compileNode = function(node) {
	let params;
	let value;

	switch(node.type) {

		case 'Program':
			return node.body.map(Main.compileNode).join('');
		break;

		case 'EOL':
			return '~CMD:~T;EOL:~~CMD:';
		break;

		// TODO: Parenthesis

		// TODO: Objects

		// TODO: Arrays

		case 'OPERATE':
			params = node.params.map(Main.compileNode).join('');
			return `~CMD:~T;OP~N;${node.name}~P;${params}~~CMD:`;
		break;

		case 'SET':
			value = Main.compileNode(node.value);
			return `~CMD:~T;SET~I;${node.id}~V;${value}~~CMD:`;
		break;

		case 'RETURN':
			return `~CMD:~T;RET~V;${Main.compileNode(node.value)}~~CMD:`;
		break;

		case 'STATEMENT':
			params = Main.compileNode(node.params);
			value = node.data.map(Main.compileNode).join('');
			return `~CMD:~T;STA~N;${node.name}~P;${params}~D;${value}`;
		break;

		case 'DATATYPE':
			value = Main.compileNode(node.value);
			return `~CMD:~T;DEF~N;${node.name}~I;${node.id}~V;${value}~~CMD:`;
		break;

		case 'FUNCTION':
			params = node.params.map(Main.compileNode).join('');
			value = node.data.map(Main.compileNode).join('');
			return `~CMD:~T;FUNC~P;${params}~D;${value}`;
		break;

		case 'CALL':
			params = node.params.map(Main.compileNode).join('');
			return `~CMD:~T:CALL~I;${node.id}~P;${params}`;
		break;

		default:
			return `~OBJ:~T;${node.type}~V;${node.value}:~~OBJ:`;
		break;

	}
}


// Compile source code
Main.eval = function(data) {
	this.error = false;
	this.data = data;

	//console.log("Compiling...");

	// Generate tokens
	if(this.generateTokens() === null) return "ERROR";

	// Create AST (Abstract Syntax Tree) from the tokens
	if(this.generateTree() === null) return "ERROR";

	// Re-use 'data' as compiled code
	this.data = "";
	this.data = this.compileNode(this.tree);

	if(this.data === null) return "ERROR";

	//console.log("Compiled successfully");
	return this.data;
}


module.exports = Main;

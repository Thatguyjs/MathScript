// Generate a list of tokens from the source code

const Main = {
	keywords: [
		[/\s+/, 'NONE'],
		[/\/\/|\/\*/, 'COMMENT'], // Comments start with `//` and `/*`
		[/;/, 'EOL'], // Only used in certain cases

		[/\d+/, 'NUMBER'],
		[/\"|\'|\`/, 'STRING'], // The whole string is captured after a quotation mark
		[/true|false/, 'BOOLEAN'],

		[/\(|\)/, 'PAREN'],
		[/\{|\}/, 'BRACE'],
		
		[/\*\*|\*|\/|\+|\-|>|<|>=|<=|==|&&|\|\|/, 'OPERATOR'], // The operator `**` is used as `to the power of`
		[/=/, 'SET'], // Not used for comparisons

		[/int|char|string|bool/, 'DATATYPE'],
		[/if|else/, 'STATEMENT'],
		[/function/, 'FUNCTION'],

		[/\w+/, 'NAME'] // Used for anything user-defined
	],

	// Add custom properties to keyword types
	custom: {
		"OPERATOR": {
			_name_: "order",
			'&&': 0, '||': 0,
			'>': 1, '<': 1, '>=': 1, '<=': 1, '==': 1,
			'+': 2, '-': 2,
			'*': 3, '/': 3,
			'**': 4
		}
	},

	data: "",
	tokens: [],

	line: 0, // TODO: track line numbers
	end: false, // Is `data` empty?

	error: false
};


// Load a file
Main.load = function(file) {
	this.data = file.data;
}


// Advance [index] characters into `data`
Main.advance = function(index) {
	this.data = this.data.slice(index);

	if(!this.data.length) this.end = true;
}


// Generate the nest token from `data`
Main.generateToken = function() {
	let result = null;

	for(let k in this.keywords) {
		let match = this.data.match(this.keywords[k][0]); // Match regex

		if(match && match.index === 0) {
			switch(this.keywords[k][1]) {

				case 'NONE':
					this.advance(match[0].length);
					result = Main.generateToken();
				break;

				case 'COMMENT':
					if(match[0] === '//') this.advance(this.data.indexOf('\n')+1);
					else this.advance(this.data.indexOf('*/')+2);
					result = Main.generateToken();
				break;

				case 'STRING':
					let string = this.data.slice(1, this.data.indexOf(match[0], 1));
					this.advance(string.length+2); // Include both quotes as `+2`

					result = {
						type: this.keywords[k][1],
						value: string
					};
				break;

				default:
					this.advance(match[0].length);

					if(this.keywords[k][1] === "NUMBER") match[0] = Number(match[0]);

					result = {
						type: this.keywords[k][1],
						value: match[0]
					};
				break;

			}

			// Apply custom properties if necessary
			let custom = this.custom[this.keywords[k][1]];

			if(custom && custom[match[0]]) {
				result[custom._name_] = custom[match[0]];
			}

			break; // Stop checking keywords
		}
	}

	if(result === null && !this.end) this.error = true; // No match
	return result;
}


// Run the lexer and return a list of tokens
Main.run = function() {
	let token = this.generateToken();

	while(token && !this.end && !this.error) {
		this.tokens.push(token);
		token = this.generateToken();
	}

	if(this.error) {
		console.log("Error generating tokens");
		return -1;
	}

	return this.tokens;
}


module.exports = Main;

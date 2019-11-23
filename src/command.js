// Parse commands from `process.argv`

const Main = {
	prefix: "",
	commands: {},
	filters: [],

	result: []
};


// Set the command prefix
Main.setPrefix = function(prefix) {
	this.prefix = prefix;
}


// Set the default help command
Main.setHelp = function(name, description) {
	this.commands[name] = {
		type: "help",
		name: name,
		description: description || "show this menu",
		required: false
	};
}


// Add a new command to look for
Main.addCommand = function(name, description="(no description)", required=false) {
	if(!name) return console.error("A command name is required!");

	this.commands[name] = {
		name: name,
		description: description,
		required: required
	};
}


// Check if a command exists
Main.checkCommand = function(name) {
	return !!this.commands[name];
}


/*
	Filter classes
*/

// Require a specific command
class RequireFilter {
	constructor(command, error) {
		this.command = command;
		this.message = message;
	}

	apply(command) {
		// TODO
	}
}

// Require a specific command value
class ValueFilter {
	constructor(value, message) {
		this.value = content;
		this.message = message;
	}

	apply(command) {
		// TODO
	}
}

// Match regular expressions to the command
class RegexFilter {
	constructor(name, value, message) {
		this.name = name;
		this.value = value;
		this.message = message;
	}

	apply(command) {
		// TODO
	}
}

/*
	End of filter classes
*/


// Display an error message if a condition is not met
Main.addFilter = function(options) {
	if(typeof options !== 'object') return console.error("The function `addFilter` requires an object!");

	switch(options.type) {

		case 'required':
			this.filters.push(new RequireFilter(options.name, options.message));
		break;

		case 'content':
			this.filters.push(new ValueFilter(options.value, options.message));
		break;

		case 'regex':
			if(!options.name) options.name = /[^]+/;
			if(!options.content) options.content = /[^]+/;
			this.filters.push(new RegexFilter(options.name, options.value, options.message));
		break;

	}
}


// Display the default help command
Main.displayHelp = function() {
	for(let c in this.commands) {
		console.log(this.prefix + this.commands[c].name + '\t\t' + this.commands[c].description);
	}
}


// Parse a default command
Main.parseDefault = function(command) {
	switch(command.defaultType) {

		case 'help':
			this.displayHelp();
		break;

	}
}


// Parse an array of commands, apply filters
Main.parse = function(commands) {
	if(!commands) return -1;
	// TODO: Check filters

	let current = {
		name: "",
		arguments: []
	};

	for(let c in commands) {
		// Command prefix used
		if(commands[c][0] === this.prefix) {

			// Registrered command used
			if(this.checkCommand(commands[c].slice(1))) {
				// Check if it's a default command
				if(this.commands[commands[c].slice(1)].type) {
					current.default = true;
					current.defaultType = this.commands[commands[c].slice(1)].type;
				}

				// Start reading command
				if(!current.name) {
					current.name = commands[c].slice(1);
					current.arguments = [];
				}

				// End reading command
				else {
					if(current.default) this.parseDefault(current);
					else this.result.push(current);

					current = {};
				}
			}

			// Unknown command used
			else {
				console.log(`\`${commands[c]}\' is not recognised as a command`);
			}
		}

		// Add to `current`
		else if(current.name) {
			current.arguments.push(commands[c]);
		}
	}

	// Push last command
	if(current.name) {
		if(current.default) this.parseDefault(current);
		else this.result.push(current);
	}

	delete current;
	return this.result;
}


module.exports = Main;

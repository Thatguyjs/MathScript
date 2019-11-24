// Synchronous input / output

const Main = {
	colors: {
		default: '[0m',
		log: '[37m',
		warn: '[33m',
		error: '[31m'
	}
};


// Get color
Main.color = function(type) {
	return '\x1b' + this.colors[type];
}


// Log
Main.log = function(params) {
	if(!params.join) params = [params];
	console.log(this.color('log') + params.join(' ') + this.color('default'));
}

// Warning
Main.warn = function(params) {
	if(!params.join) params = [params];
	console.log(this.color('warn') + "WARN: " + params.join(' ') + this.color('default'));
}

// Error
Main.error = function(params) {
	if(!params.join) params = [params];
	console.log(this.color('error') + "ERROR: " + params.join(' ') + this.color('default'));
}


// Input
Main.getInput = function(callback) {
	let input = process.openStdin();
	input.setEncoding('utf-8');

	function listener(data) {
		callback(data);
		input.destroy();
	}

	process.stdin.addListener("data", listener)
}


module.exports = Main;

const fs = require("fs");

const Execute = require("./execute.js");


const Main = {
	file: { // Current file loaded
		path: "", // Relative path
		data: "" // File contents
	},

	loaded: null, // If the program was loaded successfully
};


// Load a file to be parsed
Main.load = function(filepath, callback) {
	let stream; // Predefine the stream object

	// Catch file errors and create read stream
	try {
		stream = fs.createReadStream(filepath);
		stream.setEncoding("utf-8");
	}
	catch(error) {
		console.log("\x1b[31mERROR OPENING FILE:\x1b[0m\n" + error);

		callback(-1);
		return;
	}

	// Setup the `Main.file` object
	this.file.path = filepath;

	// Read data from stream
	stream.on('data', (chunk) => {
		Main.file.data += chunk;
	});

	// Close stream
	stream.on('end', () => {
		stream.close();

		callback(0);
	});
}


// Run the parser
Main.run = function(callback) {
	if(Execute.load(this.file.data) === -1) return -1;
	return Execute.run();
}


module.exports = Main;

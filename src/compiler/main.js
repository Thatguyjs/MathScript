const fs = require("fs");

const Lexer = require("./lexer.js");
const Tree = require("./tree.js");
const Output = require("./output.js");


const Main = {
	file: { // Current file loaded
		path: "", // Relative file path
		outpath: "", // Relative output path
		data: "" // File contents
	},

	tokens: [],
	tree: {},
	output: ""
};


// Load a file to be compiled
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
	if(filepath.replace(/\.\/|\.\.\//, '').includes('.'))
		this.file.outpath = filepath.slice(0, filepath.lastIndexOf('.')) + '.mexe'
	else
		this.file.outpath = filepath + '.mexe';

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


// Run the compiler
Main.run = function() {
	Lexer.load(this.file);
	this.tokens = Lexer.run();

	if(this.tokens === -1) return -1;

	Tree.load(this.tokens);
	delete this.tokens;
	this.tree = Tree.run();

	if(this.tree === -1) return -1;

	// For debugging
	// fs.writeFileSync("./debug.json", JSON.stringify(this.tree, null, '\t'));

	Output.load(this.tree);
	delete this.tree;
	this.output = Output.run();

	if(this.output === -1) return -1;

	fs.writeFileSync("./output.txt", this.output);
	delete this.output;

	return 0;
}


module.exports = Main;

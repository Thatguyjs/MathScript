const Compiler = require("./compiler.js");
const FS = require("fs");

let data = Compiler.eval(FS.readFileSync('../code.rawm', {encoding: 'utf-8'}));

FS.writeFileSync('../result.mexe', data);

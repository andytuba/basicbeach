const tracery = require('tracery-grammar');
const nodescad = require('nodescad');
const seedrandom = require('seedrandom');
const fs = require('fs');

/* Config */
const config = {
	seed: Math.floor(Math.random() * 1000),
	grammar: 't21-tracery-readme', // 'basicbeach',
	model: 'example', // 'basicbeach',
	modelPath: 'src/models',
	nodescad: {
		binaryPath: '"/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD"',
		render: true,
	},
	variables: {
	},
};

/* Calculated constants */
const outputPath = `${process.cwd()}/output/${config.grammar}/${config.model}/${config.seed}/${config.grammar} - ${config.model} - ${config.seed} - ${Date.now()}`;
const outputBasename = `${config.grammar} - ${config.model} - ${config.seed}`;

/* Prepare output files */
fs.mkdirSync(outputPath, { recursive: true });
fs.writeFileSync(`${outputPath}/config - ${outputBasename}.json`, JSON.stringify(config, undefined, 2));

/* Generate text */
seedrandom(config.seed, { global: true });
const grammar = tracery.createGrammar(require(`./grammar/${config.grammar}.json`));
grammar.addModifiers(tracery.baseEngModifiers);
const text = grammar.flatten('#origin#');

/* Render scad script + text into stl model and png preview */ 
const stlOptions = {
	inputFile: `"${process.cwd()}/${config.modelPath}/${config.model}.scad"`,
	...config.nodescad,
	variables: {
		inputText: text,
		...config.variables,
	},
	format: 'stl',
	outputFile: `"${outputPath}/stl - ${outputBasename}.stl"`,
};
const pngOptions = {
	inputFile: `"${process.cwd()}/${config.modelPath}/${config.model}.scad"`,
	...config.nodescad,
	variables: {
		inputText: text,
		...config.variables,
	},
	format: 'png',
	outputFile: `"${outputPath}/png - ${outputBasename}.png"`,
};

nodescad.render(stlOptions, function (error, result) {
	const options = stlOptions;
	if (error || result && result.error) {
		console.error({ 
			options,
			error,
			result,
		});
	}
});

nodescad.render(pngOptions, function (error, result) {
	const options = pngOptions;
	if (error || result && result.error) {
		console.error({ 
			options,
			error,
			result,
		});
	}
});

// TODO: await all nodescad render 

/* Ding, fries are done. */
console.log(outputPath);
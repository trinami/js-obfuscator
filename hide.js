const fs = require("fs").promises;

const JavaScriptObfuscator = require("javascript-obfuscator");
const jsfuck = require("jsfuck");
const uglify = require("uglify-js");

async function obfuscateFile(inputFilePath, outputFilePath) {
	try {
		const inputFileContent = await fs.readFile(inputFilePath, "utf8");
		const obfuscatedCode = JavaScriptObfuscator.obfuscate(inputFileContent, {
			compact: true
		}).getObfuscatedCode();
		await fs.writeFile(outputFilePath, obfuscatedCode, "utf8");
		console.log(`Obfuscation complete. Obfuscated code written to '${outputFilePath}'.`)
	} catch (error) {
		console.error("Error during obfuscation:", error.message)
	}
}

async function compressFile(inputFilePath, outputFilePath) {
	try {
		const inputFileContent = await fs.readFile(inputFilePath, "utf8");
		const compressedCode = uglify.minify(inputFileContent, {
			compress: true,
			mangle: true
		}).code;
		await fs.writeFile(outputFilePath, compressedCode, "utf8");
		console.log(`Compression complete. Compressed code written to '${outputFilePath}'.`)
	} catch (error) {
		console.error("Error during compression:", error.message)
	}
}

async function applyJsFuck(inputFilePath, outputFilePath) {
	try {
		const inputFileContent = await fs.readFile(inputFilePath, "utf8");
		const jsFuckedCode = jsfuck.JSFuck.encode(inputFileContent);
		await fs.writeFile(outputFilePath, "eval(" + jsFuckedCode + ")", "utf8");
		console.log(`JsFuck complete. JsFucked code written to '${outputFilePath}'.`)
	} catch (error) {
		console.error("Error during JsFuck:", error.message)
	}
}

const [, , inputFilePath, outputFilePath] = process.argv;
if (!inputFilePath || !outputFilePath) {
	console.error("Error: Please provide both input and output file paths.");
	process.exit(1)
}

(async () => {
	try {
		await compressFile(inputFilePath, "temp-compressed1.js");
		await obfuscateFile("temp-compressed1.js", "temp-obfuscated.js");
		await compressFile("temp-obfuscated.js", "temp-compressed2.js");
		await applyJsFuck("temp-compressed2.js", "temp-fucked.js");
		await compressFile("temp-fucked.js", outputFilePath)
	} finally {
		await Promise.all([fs.unlink("temp-compressed1.js")["catch"](() => {}), fs.unlink("temp-obfuscated.js")["catch"](() => {}), fs.unlink("temp-compressed2.js")["catch"](() => {}), fs.unlink("temp-fucked.js")["catch"](() => {})])
	}
})();

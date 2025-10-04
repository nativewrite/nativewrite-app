import fs from "node:fs";
import path from "node:path";

function normalizeEnvFile(filePath) {
	const raw = fs.readFileSync(filePath, "utf8");
	const lines = raw.split(/\r?\n/);
	const envLine = /^([A-Z0-9_]+)=(.*)$/;

	/** @type {Record<string,string>} */
	const keyToValue = {};
	/** @type {string[]} */
	let order = [];
	let currentKey = null;
	let currentVal = "";

	function commit() {
		if (currentKey !== null) {
			keyToValue[currentKey] = currentVal;
			order = order.filter((k) => k !== currentKey);
			order.push(currentKey);
		}
		currentKey = null;
		currentVal = "";
	}

	for (const line of lines) {
		const match = line.match(envLine);
		if (match) {
			commit();
			currentKey = match[1];
			currentVal = match[2] ?? "";
			continue;
		}
		if (/^\s*#/.test(line) || /^\s*$/.test(line)) {
			commit();
			continue;
		}
		if (currentKey !== null) {
			// Continuation: append trimmed-left to avoid accidental spaces from wrapping
			currentVal += line.replace(/^\s+/, "");
		}
	}
	commit();

	const out = order.map((k) => `${k}=${keyToValue[k]}`);
	fs.writeFileSync(filePath, out.join("\r\n"), "utf8");
}

const target = process.argv[2] || path.join(process.cwd(), "app/.env.local");
if (!fs.existsSync(target)) {
	console.error(`File not found: ${target}`);
	process.exit(1);
}
normalizeEnvFile(target);
console.log(`Normalized: ${target}`);

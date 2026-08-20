import type { QrCodeMatrix } from './Encoder';

export interface RenderOptions {
	readonly size: number;
	readonly margin: number;
	readonly foregroundColor: string;
	readonly backgroundColor: string;
}

interface RgbColor {
	readonly red: number;
	readonly green: number;
	readonly blue: number;
}

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

export function renderPng(matrix: QrCodeMatrix, options: RenderOptions): Buffer {
	const totalModules = matrix.size + options.margin * 2;
	if (options.size < totalModules) {
		throw new RangeError(`Size must be at least ${totalModules}px for this QR Code`);
	}

	const foreground = parseColor(options.foregroundColor);
	const background = parseColor(options.backgroundColor);
	validateDistinctColors(options);
	const stride = Math.ceil(options.size / 8) + 1;
	const pixels = Buffer.alloc(stride * options.size);

	for (let y = 0; y < options.size; y++) {
		const rowOffset = y * stride;
		pixels[rowOffset] = 0;
		for (let x = 0; x < options.size; x++) {
			const moduleX = Math.floor((x * totalModules) / options.size) - options.margin;
			const moduleY = Math.floor((y * totalModules) / options.size) - options.margin;
			if (matrix.getModule(moduleX, moduleY)) {
				pixels[rowOffset + 1 + (x >>> 3)] |= 1 << (7 - (x & 7));
			}
		}
	}

	const header = Buffer.alloc(13);
	header.writeUInt32BE(options.size, 0);
	header.writeUInt32BE(options.size, 4);
	header[8] = 1;
	header[9] = 3;
	const palette = Buffer.from([
		background.red,
		background.green,
		background.blue,
		foreground.red,
		foreground.green,
		foreground.blue,
	]);

	return Buffer.concat([
		PNG_SIGNATURE,
		createPngChunk('IHDR', header),
		createPngChunk('PLTE', palette),
		createPngChunk('IDAT', createUncompressedZlibStream(pixels)),
		createPngChunk('IEND', Buffer.alloc(0)),
	]);
}

function createUncompressedZlibStream(data: Buffer): Buffer {
	const blocks: Buffer[] = [Buffer.from([0x78, 0x01])];
	for (let offset = 0; offset < data.length; offset += 65_535) {
		const length = Math.min(65_535, data.length - offset);
		const header = Buffer.alloc(5);
		header[0] = offset + length === data.length ? 1 : 0;
		header.writeUInt16LE(length, 1);
		header.writeUInt16LE(length ^ 0xffff, 3);
		blocks.push(header, data.subarray(offset, offset + length));
	}
	const checksum = Buffer.alloc(4);
	checksum.writeUInt32BE(adler32(data));
	blocks.push(checksum);
	return Buffer.concat(blocks);
}

function adler32(data: Buffer): number {
	let a = 1;
	let b = 0;
	for (const byte of data) {
		a = (a + byte) % 65_521;
		b = (b + a) % 65_521;
	}
	return ((b << 16) | a) >>> 0;
}

export function renderSvg(matrix: QrCodeMatrix, options: RenderOptions): string {
	parseColor(options.foregroundColor);
	parseColor(options.backgroundColor);
	validateDistinctColors(options);
	const totalModules = matrix.size + options.margin * 2;
	const path: string[] = [];

	for (let y = 0; y < matrix.size; y++) {
		let x = 0;
		while (x < matrix.size) {
			if (!matrix.getModule(x, y)) {
				x++;
				continue;
			}
			const start = x;
			while (x < matrix.size && matrix.getModule(x, y)) x++;
			path.push(`M${start + options.margin} ${y + options.margin}h${x - start}v1H${start + options.margin}z`);
		}
	}

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		`<svg xmlns="http://www.w3.org/2000/svg" width="${options.size}" height="${options.size}" viewBox="0 0 ${totalModules} ${totalModules}" shape-rendering="crispEdges">`,
		`<path fill="${options.backgroundColor}" d="M0 0h${totalModules}v${totalModules}H0z"/>`,
		`<path fill="${options.foregroundColor}" d="${path.join('')}"/>`,
		'</svg>',
	].join('');
}

function validateDistinctColors(options: RenderOptions): void {
	if (options.foregroundColor.toLowerCase() === options.backgroundColor.toLowerCase()) {
		throw new RangeError('Foreground and background colors must be different');
	}
}

function parseColor(value: string): RgbColor {
	if (!/^#[\dA-Fa-f]{6}$/.test(value)) throw new RangeError('Colors must use #RRGGBB format');
	return {
		red: Number.parseInt(value.slice(1, 3), 16),
		green: Number.parseInt(value.slice(3, 5), 16),
		blue: Number.parseInt(value.slice(5, 7), 16),
	};
}

function createPngChunk(type: string, data: Buffer): Buffer {
	const typeBuffer = Buffer.from(type, 'ascii');
	const chunk = Buffer.alloc(data.length + 12);
	chunk.writeUInt32BE(data.length, 0);
	typeBuffer.copy(chunk, 4);
	data.copy(chunk, 8);
	chunk.writeUInt32BE(crc32(chunk.subarray(4, data.length + 8)), data.length + 8);
	return chunk;
}

function crc32(data: Buffer): number {
	let crc = 0xffffffff;
	for (const byte of data) {
		crc ^= byte;
		for (let bit = 0; bit < 8; bit++) {
			crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
		}
	}
	return (crc ^ 0xffffffff) >>> 0;
}

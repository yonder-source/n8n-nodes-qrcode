import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';

import { encodeQrCode, type ErrorCorrectionLevel } from '../nodes/QrCode/Encoder';
import { renderPng, renderSvg } from '../nodes/QrCode/Renderer';

const renderOptions = {
	size: 512,
	margin: 4,
	foregroundColor: '#000000',
	backgroundColor: '#ffffff',
};

describe('QR Code encoder', () => {
	it.each<[string, ErrorCorrectionLevel]>([
		['hello world', 'L'],
		['https://example.com/orders/123', 'M'],
		['台灣繁體中文', 'Q'],
		['QR Code 🚀', 'H'],
	])('encodes and independently decodes %s at level %s', (text, level) => {
		const png = PNG.sync.read(renderPng(encodeQrCode(text, level), renderOptions));
		const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
		expect(decoded?.data).toBe(text);
	});

	it('uses version information for larger payloads', () => {
		const matrix = encodeQrCode('x'.repeat(300), 'H');
		expect(matrix.version).toBeGreaterThanOrEqual(7);
		expect(matrix.size).toBe(matrix.version * 4 + 17);
		expect(matrix.mask).toBeGreaterThanOrEqual(0);
		expect(matrix.mask).toBeLessThanOrEqual(7);
	});

	it('supports the maximum byte payload at low error correction', () => {
		expect(encodeQrCode('a'.repeat(2_953), 'L').version).toBe(40);
		expect(() => encodeQrCode('a'.repeat(2_954), 'L')).toThrow('Data too long');
	});
});

describe('QR Code renderers', () => {
	const matrix = encodeQrCode('renderer test', 'M');

	it('creates a valid indexed PNG with requested colors and quiet zone', () => {
		const output = renderPng(matrix, {
			...renderOptions,
			size: 256,
			foregroundColor: '#112233',
			backgroundColor: '#fefdfc',
		});
		expect(output.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

		const png = PNG.sync.read(output);
		expect([png.width, png.height]).toEqual([256, 256]);
		expect([...png.data.subarray(0, 4)]).toEqual([254, 253, 252, 255]);
		expect(jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data).toBe('renderer test');
	});

	it('creates SVG with dimensions, colors, and compact module paths', () => {
		const svg = renderSvg(matrix, renderOptions);
		expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"');
		expect(svg).toContain('fill="#ffffff"');
		expect(svg).toContain('fill="#000000"');
		expect(svg).toContain('shape-rendering="crispEdges"');
	});

	it('rejects invalid colors and undersized raster output', () => {
		expect(() => renderPng(matrix, { ...renderOptions, foregroundColor: 'black' })).toThrow(
			'#RRGGBB',
		);
		expect(() => renderPng(matrix, { ...renderOptions, size: 10 })).toThrow('at least');
	});
});

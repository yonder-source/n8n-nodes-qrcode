import { qrcodegen } from './vendor/NayukiQrCode';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrCodeMatrix {
	readonly version: number;
	readonly size: number;
	readonly mask: number;
	getModule(x: number, y: number): boolean;
}

const errorCorrectionLevels: Record<ErrorCorrectionLevel, qrcodegen.QrCode.Ecc> = {
	L: qrcodegen.QrCode.Ecc.LOW,
	M: qrcodegen.QrCode.Ecc.MEDIUM,
	Q: qrcodegen.QrCode.Ecc.QUARTILE,
	H: qrcodegen.QrCode.Ecc.HIGH,
};

export function encodeQrCode(text: string, level: ErrorCorrectionLevel): QrCodeMatrix {
	const bytes = [...Buffer.from(text, 'utf8')];
	const segment = qrcodegen.QrSegment.makeBytes(bytes);

	return qrcodegen.QrCode.encodeSegments(
		[segment],
		errorCorrectionLevels[level],
		1,
		40,
		-1,
		false,
	);
}

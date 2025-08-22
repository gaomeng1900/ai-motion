/**
 * @todo needs simplification
 */
export function computeBorderGeometry(
	pixelWidth: number,
	pixelHeight: number,
	borderWidth: number,
	glowWidth: number
): { positions: Float32Array; uvs: Float32Array } {
	const shortSide = Math.max(1, Math.min(pixelWidth, pixelHeight))
	const borderWidthPx = Math.min(borderWidth, 20)
	const glowWidthPx = glowWidth
	const totalThick = Math.min(borderWidthPx + glowWidthPx, shortSide)

	const insetX = Math.min(totalThick, Math.floor(pixelWidth / 2))
	const insetY = Math.min(totalThick, Math.floor(pixelHeight / 2))

	const toClipX = (x: number) => (x / pixelWidth) * 2 - 1
	const toClipY = (y: number) => (y / pixelHeight) * 2 - 1

	const x0 = 0
	const x1 = pixelWidth
	const y0 = 0
	const y1 = pixelHeight
	const xi0 = insetX
	const xi1 = pixelWidth - insetX
	const yi0 = insetY
	const yi1 = pixelHeight - insetY

	const X0 = toClipX(x0)
	const X1 = toClipX(x1)
	const Y0 = toClipY(y0)
	const Y1 = toClipY(y1)
	const Xi0 = toClipX(xi0)
	const Xi1 = toClipX(xi1)
	const Yi0 = toClipY(yi0)
	const Yi1 = toClipY(yi1)

	const u0 = 0
	const v0 = 0
	const u1 = 1
	const v1 = 1
	const ui0 = insetX / pixelWidth
	const ui1 = 1 - insetX / pixelWidth
	const vi0 = insetY / pixelHeight
	const vi1 = 1 - insetY / pixelHeight

	// prettier-ignore
	const positions = new Float32Array([
		// Top strip
		X0, Y0, X1, Y0, X0, Yi0, 
		X0, Yi0, X1, Y0, X1, Yi0,
		// Bottom strip
		X0, Yi1, X1, Yi1, X0, Y1,
		X0, Y1, X1, Yi1, X1, Y1,
		// Left strip
		X0, Yi0, Xi0, Yi0, X0, Yi1,
		X0, Yi1, Xi0, Yi0, Xi0, Yi1,
		// Right strip
		Xi1, Yi0, X1, Yi0, Xi1, Yi1, 
		Xi1, Yi1, X1, Yi0, X1, Yi1,
	])

	// prettier-ignore
	const uvs = new Float32Array([
		// Top strip
		u0, v0, u1, v0, u0, vi0, 
		u0, vi0, u1, v0, u1, vi0,
		// Bottom strip
		u0, vi1, u1, vi1, u0, v1, 
		u0, v1, u1, vi1, u1, v1,
		// Left strip
		u0, vi0, ui0, vi0, u0, vi1, 
		u0, vi1, ui0, vi0, ui0, vi1,
		// Right strip
		ui1, vi0, u1, vi0, ui1, vi1, 
		ui1, vi1, u1, vi0, u1, vi1,
	])

	return { positions, uvs }
}

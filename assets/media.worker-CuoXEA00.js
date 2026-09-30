function g(e, n) {
	return e.startsWith("image/") || /\.(jpg|jpeg|png|webp|bmp|gif|tiff|tif|avif|heic|heif|svg)$/i.test(n);
}
const u = 1718773093;
function U(e) {
	if (e.length < 12) return !1;
	const n = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(4, !1);
	return n === 1718909296 || n === 1836019574;
}
function C(e, n) {
	return e.startsWith("audio/") || /\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(n);
}
function h(e) {
	const n = new Uint8Array(e.length);
	return n.set(e), c(n, new DataView(n.buffer, n.byteOffset, n.byteLength), 0, n.length), n;
}
function c(e, n, a, f) {
	let t = a;
	for (; t + 8 <= f;) {
		const o = n.getUint32(t, !1), i = n.getUint32(t + 4, !1);
		let r = o, s = 8;
		if (o === 0) r = f - t;
		else if (o === 1) {
			if (t + 16 > f) break;
			r = Number(n.getBigUint64(t + 8, !1)), s = 16;
		}
		if (r < s || t + r > f) break;
		if (i === 1969517665 || i === 1835365473 || i === 1970628964 || i === 1768715124) {
			n.setUint32(t + 4, u, !1), e.fill(0, t + s, t + r), t += r;
			continue;
		}
		if (i === 1836019574 || i === 1953653099 || i === 1835297121 || i === 1835626086 || i === 1937007212 || i === 1684631142) c(e, n, t + s, t + r);
		else if (i === 1835295092) m(e, t + s, t + r);
		else if ((i === 1836476516 || i === 1953196132 || i === 1835296868) && r >= s + 20) {
			const l = e[t + s];
			l === 0 ? (n.setUint32(t + s + 4, 0, !1), n.setUint32(t + s + 8, 0, !1)) : l === 1 && r >= s + 28 && (n.setBigUint64(t + s + 4, 0n, !1), n.setBigUint64(t + s + 12, 0n, !1));
		}
		t += r;
	}
}
function m(e, n, a) {
	const f = new TextEncoder().encode("x264 - core");
	for (let t = n; t <= a - f.length; t++) {
		let o = !0;
		for (let i = 0; i < f.length; i++) if (e[t + i] !== f[i]) {
			o = !1;
			break;
		}
		if (o) for (let i = 0; i < 256 && t + i < a; i++) e[t + i] = 0;
	}
}
function O(e) {
	let n = 0, a = e.length;
	if (e.length >= 10 && e[0] === 73 && e[1] === 68 && e[2] === 51 && (n = 10 + ((e[6] & 127) << 21 | (e[7] & 127) << 14 | (e[8] & 127) << 7 | e[9] & 127)), e.length >= 128) {
		const f = e.length - 128;
		e[f] === 84 && e[f + 1] === 65 && e[f + 2] === 71 && (a = f);
	}
	return e.subarray(n, a);
}
self.onmessage = (e) => {
	const { buffer: n, mimeType: a, originalName: f } = e.data;
	if (g(a, f)) throw new Error(`Image payload rejected from media worker: MIME="${a}" name="${f}". Image assets must route exclusively through canvas re-synthesis.`);
	const t = new Uint8Array(n);
	let o;
	U(t) ? o = h(t) : C(a, f) ? o = O(t) : o = t;
	const i = o.buffer;
	self.postMessage({
		buffer: i,
		mimeType: a,
		originalName: f
	}, [i]);
};

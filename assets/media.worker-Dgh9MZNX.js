function C(e, n) {
	return e.startsWith("image/") || /\.(jpg|jpeg|png|webp|bmp|gif|tiff|tif|avif|heic|heif|svg)$/i.test(n);
}
const g = 1718773093;
function h(e) {
	if (e.length < 12) return !1;
	const n = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(4, !1);
	return n === 1718909296 || n === 1836019574;
}
function O(e, n) {
	return e.startsWith("audio/") || /\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(n);
}
function m(e) {
	const n = new TextEncoder().encode("x264 - core");
	for (let l = 0; l <= e.length - n.length; l++) {
		let f = !0;
		for (let t = 0; t < n.length; t++) if (e[l + t] !== n[t]) {
			f = !1;
			break;
		}
		if (f) for (let t = 0; t < 256 && l + t < e.length; t++) e[l + t] = 0;
	}
}
function F(e) {
	let n = 0, l = e.length;
	if (e.length >= 10 && e[0] === 73 && e[1] === 68 && e[2] === 51 && (n = 10 + ((e[6] & 127) << 21 | (e[7] & 127) << 14 | (e[8] & 127) << 7 | e[9] & 127)), e.length >= 128) {
		const f = e.length - 128;
		e[f] === 84 && e[f + 1] === 65 && e[f + 2] === 55 && (l = f);
	}
	return e.subarray(n, l);
}
function R(e) {
	const n = new Uint8Array(e.length);
	return n.set(e), u(n, new DataView(n.buffer, n.byteOffset, n.byteLength), 0, n.length), n;
}
function u(e, n, l, f) {
	let t = l;
	for (; t + 8 <= f;) {
		const o = n.getUint32(t, !1), i = n.getUint32(t + 4, !1);
		let a = o, s = 8;
		if (o === 0) a = f - t;
		else if (o === 1) {
			if (t + 16 > f) break;
			a = Number(n.getBigUint64(t + 8, !1)), s = 16;
		}
		if (a < s || t + a > f) break;
		if (i === 1969517665 || i === 1835365473 || i === 1970628964 || i === 1768715124) {
			n.setUint32(t + 4, g, !1), e.fill(0, t + s, t + a), t += a;
			continue;
		}
		if (i === 1953653099 && !p(n, t + s, t + a)) {
			n.setUint32(t + 4, g, !1), e.fill(0, t + s, t + a), t += a;
			continue;
		}
		if (i === 1836019574 || i === 1953653099 || i === 1835297121 || i === 1835626086 || i === 1937007212 || i === 1684631142) u(e, n, t + s, t + a);
		else if (i === 1835295092) m(e.subarray(t + s, t + a));
		else if ((i === 1836476516 || i === 1953196132 || i === 1835296868) && a >= s + 20) {
			const r = e[t + s];
			r === 0 ? (n.setUint32(t + s + 4, 0, !1), n.setUint32(t + s + 8, 0, !1)) : r === 1 && a >= s + 28 && (n.setBigUint64(t + s + 4, 0n, !1), n.setBigUint64(t + s + 12, 0n, !1));
		}
		t += a;
	}
}
function p(e, n, l) {
	let f = -1, t = -1, o = n;
	for (; o + 8 <= l;) {
		const i = e.getUint32(o, !1), a = e.getUint32(o + 4, !1);
		let s = i === 1 ? Number(e.getBigUint64(o + 8, !1)) : i;
		if (s === 0 && (s = l - o), a === 1835297121) {
			f = o + (i === 1 ? 16 : 8), t = o + s;
			break;
		}
		o += s;
	}
	if (f !== -1) {
		let i = f;
		for (; i + 8 <= t;) {
			const a = e.getUint32(i, !1), s = e.getUint32(i + 4, !1);
			let r = a === 1 ? Number(e.getBigUint64(i + 8, !1)) : a;
			if (r === 0 && (r = t - i), s === 1751411826 && r >= 24) {
				const U = a === 1 ? 16 : 8, c = e.getUint32(i + U + 8, !1);
				return c === 1986618469 || c === 1936684398;
			}
			i += r;
		}
	}
	return !1;
}
self.onmessage = (e) => {
	const { buffer: n, mimeType: l, originalName: f } = e.data;
	if (C(l, f)) throw new Error(`Image payload rejected from media worker: MIME="${l}" name="${f}". Image assets must route exclusively through canvas re-synthesis.`);
	const t = new Uint8Array(n);
	let o;
	h(t) ? o = R(t) : O(l, f) ? o = F(t) : o = t;
	const i = o.buffer;
	self.postMessage({
		buffer: i,
		mimeType: l,
		originalName: f
	}, [i]);
};

function u(e) {
	if (e.length < 12) return !1;
	const n = new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(4, !1);
	return n === 1718909296 || n === 1836019574;
}
function C(e, n) {
	return e.startsWith("audio/") || /\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(n);
}
function U(e) {
	const n = new Uint8Array(e.length);
	return n.set(e), c(n, new DataView(n.buffer, n.byteOffset, n.byteLength), 0, n.length), n;
}
function c(e, n, l, i) {
	let t = l;
	for (; t + 8 <= i;) {
		const o = n.getUint32(t, !1), f = n.getUint32(t + 4, !1);
		let s = o, a = 8;
		if (o === 0) s = i - t;
		else if (o === 1) {
			if (t + 16 > i) break;
			s = Number(n.getBigUint64(t + 8, !1)), a = 16;
		}
		if (s < a || t + s > i) break;
		if (f === 1969517665 || f === 1835365473 || f === 1970628964 || f === 1768715124) {
			n.setUint32(t + 4, 1718773093, !1), e.fill(0, t + a, t + s), t += s;
			continue;
		}
		if (f === 1836019574 || f === 1953653099 || f === 1835297121 || f === 1835626086 || f === 1937007212 || f === 1684631142) c(e, n, t + a, t + s);
		else if (f === 1835295092) g(e, t + a, t + s);
		else if ((f === 1836476516 || f === 1953196132 || f === 1835296868) && s >= a + 20) {
			const r = e[t + a];
			r === 0 ? (n.setUint32(t + a + 4, 0, !1), n.setUint32(t + a + 8, 0, !1)) : r === 1 && s >= a + 28 && (n.setBigUint64(t + a + 4, 0n, !1), n.setBigUint64(t + a + 12, 0n, !1));
		}
		t += s;
	}
}
function g(e, n, l) {
	const i = new TextEncoder().encode("x264 - core");
	for (let t = n; t <= l - i.length; t++) {
		let o = !0;
		for (let f = 0; f < i.length; f++) if (e[t + f] !== i[f]) {
			o = !1;
			break;
		}
		if (o) for (let f = 0; f < 256 && t + f < l; f++) e[t + f] = 0;
	}
}
function O(e) {
	let n = 0, l = e.length;
	if (e.length >= 10 && e[0] === 73 && e[1] === 68 && e[2] === 51 && (n = 10 + ((e[6] & 127) << 21 | (e[7] & 127) << 14 | (e[8] & 127) << 7 | e[9] & 127)), e.length >= 128) {
		const i = e.length - 128;
		e[i] === 84 && e[i + 1] === 65 && e[i + 2] === 71 && (l = i);
	}
	return e.subarray(n, l);
}
self.onmessage = (e) => {
	const { buffer: n, mimeType: l, originalName: i } = e.data, t = new Uint8Array(n);
	let o;
	u(t) ? o = U(t) : C(l, i) ? o = O(t) : o = t;
	const f = o.buffer;
	self.postMessage({
		buffer: f,
		mimeType: l,
		originalName: i
	}, [f]);
};

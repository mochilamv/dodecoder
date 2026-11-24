new Uint8Array([
	60,
	63,
	120,
	112,
	97,
	99,
	107,
	101,
	116,
	32,
	98,
	101,
	103,
	105,
	110
]);
var u = class extends Error {
	code;
	constructor(t, e) {
		super(e), this.name = "UnsupportedMediaFormatError", this.code = t;
	}
};
function _(t, e) {
	return t.startsWith("image/") || /\.(jpg|jpeg|png|webp|bmp|gif|tiff|tif|avif|heic|heif|svg)$/i.test(e);
}
function M(t, e) {
	return t.toLowerCase().startsWith("audio/") || /\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(e);
}
function E(t, e, n) {
	const o = t.toLowerCase();
	return !!(o === "video/webm" || o === "video/x-matroska" || o === "video/matroska" || /\.(mkv|webm)$/i.test(e) || n && n.byteLength >= 4 && n[0] === 26 && n[1] === 69 && n[2] === 223 && n[3] === 163);
}
const g = 1718773093;
const R = 1986618469, F = 1936684398, S = 16;
function h(t) {
	if (t.length < 12) return !1;
	const e = new DataView(t.buffer, t.byteOffset, t.byteLength).getUint32(4, !1);
	return e === 1718909296 || e === 1836019574;
}
function m(t, e, n) {
	if (e + 8 > n) return null;
	const o = t.getUint32(e, !1), a = t.getUint32(e + 4, !1);
	let i = 8, s, r = !1;
	if (o === 0) s = n - e, r = !0;
	else if (o === 1) {
		if (e + 16 > n) return null;
		const l = t.getBigUint64(e + 8, !1);
		if (l < 16n || l > BigInt(Number.MAX_SAFE_INTEGER)) return null;
		s = Number(l), i = 16;
	} else {
		if (o < 8) return null;
		s = o;
	}
	return s < i || e + s > n ? null : {
		boxType: a,
		headerSize: i,
		actualSize: s,
		isToEof: r
	};
}
function I(t) {
	return t === 1969517665 || t === 1835365473 || t === 1970628964 || t === 1768715124 || t === 1668313716 || t === 1481461855 || t === 1801812339 || (t >>> 24 & 255) === 169;
}
function b(t) {
	const e = new Uint8Array(t.byteLength);
	return e.set(t), O(e, new DataView(e.buffer, e.byteOffset, e.byteLength), 0, e.byteLength, 0), e;
}
function O(t, e, n, o, a) {
	if (a > S) return;
	let i = n;
	for (; i + 8 <= o;) {
		const s = m(e, i, o);
		if (!s) break;
		const { boxType: r, headerSize: l, actualSize: C, isToEof: U } = s, f = i + l, c = i + C;
		if (I(r)) {
			if (e.setUint32(i + 4, g, !1), t.fill(0, f, c), U) break;
			i = c;
			continue;
		}
		if (r === 1718773093 || r === 1936419184) {
			if (t.fill(0, f, c), U) break;
			i = c;
			continue;
		}
		if (r === 1953653099 && !p(e, f, c)) {
			if (e.setUint32(i + 4, g, !1), t.fill(0, f, c), U) break;
			i = c;
			continue;
		}
		if (r === 1836019574 || r === 1836019558 || r === 1953653099 || r === 1953653094 || r === 1835297121 || r === 1835626086 || r === 1937007212 || r === 1684631142) O(t, e, f, c, a + 1);
		else if (r === 1751411826) C >= l + 12 && (t.fill(0, f + 4, f + 8), t.fill(0, f + 12, c));
		else if ((r === 1836476516 || r === 1953196132 || r === 1835296868) && C >= l + 12) {
			const d = t[f];
			d === 0 ? (e.setUint32(f + 4, 0, !1), e.setUint32(f + 8, 0, !1)) : d === 1 && C >= l + 20 && (e.setBigUint64(f + 4, 0n, !1), e.setBigUint64(f + 12, 0n, !1));
		}
		if (U) break;
		i = c;
	}
}
function p(t, e, n) {
	let o = -1, a = -1, i = e;
	for (; i + 8 <= n;) {
		const s = m(t, i, n);
		if (!s) return !1;
		if (s.boxType === 1835297121) {
			o = i + s.headerSize, a = i + s.actualSize;
			break;
		}
		if (s.isToEof) break;
		i += s.actualSize;
	}
	if (o !== -1) {
		let s = o;
		for (; s + 8 <= a;) {
			const r = m(t, s, a);
			if (!r) return !1;
			if (r.boxType === 1751411826) {
				if (r.actualSize < r.headerSize + 12) return !1;
				const l = t.getUint32(s + r.headerSize + 8, !1);
				return l === R || l === F;
			}
			if (r.isToEof) break;
			s += r.actualSize;
		}
	}
	return !1;
}
function T(t) {
	if (t.byteOffset === 0 && t.byteLength === t.buffer.byteLength) return t.buffer;
	const e = new Uint8Array(t.byteLength);
	return e.set(t), e.buffer;
}
function k(t) {
	const { buffer: e, mimeType: n, originalName: o } = t;
	if (_(n, o)) throw new u("IMAGE_IN_MEDIA_PIPELINE", `Image payload rejected from media worker: MIME="${n}" name="${o}". Image assets must route exclusively through canvas re-synthesis.`);
	if (M(n, o)) throw new u("AUDIO_UNSUPPORTED", `Standalone audio payload rejected from media worker: MIME="${n}" name="${o}".`);
	const a = new Uint8Array(e);
	let i = null;
	try {
		if (E(n, o, a)) throw new u("CONTAINER_UNSUPPORTED", `MKV/WebM container rejected from media worker: MIME="${n}" name="${o}".`);
		if (!h(a)) throw new u("CONTAINER_UNSUPPORTED", `Unsupported media container rejected from media worker: MIME="${n}" name="${o}".`);
		i = b(a);
		const s = T(i);
		return i.buffer !== s && i.fill(0), {
			buffer: s,
			mimeType: n,
			originalName: o
		};
	} finally {
		a.fill(0);
	}
}
typeof self < "u" && (self.onmessage = (t) => {
	try {
		const e = k(t.data);
		self.postMessage(e, [e.buffer]);
	} catch (e) {
		if (e instanceof u) self.postMessage({
			error: e.message,
			errorCode: e.code
		});
		else {
			const n = e instanceof Error ? e.message : "Media worker processing failed";
			self.postMessage({ error: n });
		}
	}
});

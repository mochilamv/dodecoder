const Pt = -.010597401785, Dt = .032883011667, Ut = .030841381836, It = -.187034811719, Ft = -.027983769417, Ct = .63088076793, St = .714846570553, At = .230377813309, vt = At, Nt = -.714846570553, Xt = Ct, qt = .027983769417, kt = It, Vt = -.030841381836, Yt = Dt, Ht = .010597401785, pt = .7071067811865475;
function jt(t, n) {
	if (t <= 0 || n <= 0 || t > 2048 || n > 2048) throw new RangeError("Tile dimension exceeds MAX_TILE_DIMENSION bounds.");
	const e = (t + 1 >> 1) + 8, s = (n + 1 >> 1) + 8, c = Math.max(t, n) + 24 + 2, o = Math.max(e, s), i = e * s, a = Math.max(t, n);
	return {
		maxPatchW: t,
		maxPatchH: n,
		maxSubW: e,
		maxSubH: s,
		rowLo: new Float32Array(n * e),
		rowHi: new Float32Array(n * e),
		subBand0: new Float32Array(i),
		subBand1: new Float32Array(i),
		subScratch: new Float32Array(i),
		rowBuf1D: new Float32Array(a),
		ext1D: new Float32Array(c),
		colIn1D: new Float32Array(n),
		colLo1D: new Float32Array(o),
		colHi1D: new Float32Array(o),
		colOut1D: new Float32Array(n)
	};
}
function Zt(t) {
	t.rowLo.fill(0), t.rowHi.fill(0), t.subBand0.fill(0), t.subBand1.fill(0), t.subScratch.fill(0), t.rowBuf1D.fill(0), t.ext1D.fill(0), t.colIn1D.fill(0), t.colLo1D.fill(0), t.colHi1D.fill(0), t.colOut1D.fill(0);
}
function Gt(t) {
	const n = new Uint32Array(t.buffer, t.byteOffset, t.length);
	if (typeof globalThis.crypto < "u" && typeof globalThis.crypto.getRandomValues == "function") globalThis.crypto.getRandomValues(n);
	else {
		let e = 2654435769;
		for (let s = 0; s < n.length; s++) e ^= e << 13, e ^= e >>> 17, e ^= e << 5, n[s] = e >>> 0;
	}
}
function Bt(t, n) {
	if (n <= 1) return 0;
	const e = n << 1;
	let s = t % e;
	return s < 0 && (s += e), s < n ? s : e - 1 - s;
}
function et(t) {
	return (t & ~(t >> 31) | 255 - t >> 31) & 255;
}
function zt(t, n, e, s, c, o, i, a, f) {
	const u = s ? 2 : 8, r = u, l = u + (e & 1), m = e + r + l, E = m >> 1;
	for (let _ = 0; _ < r; _++) c[_] = t[n + Bt(_ - r, e)];
	for (let _ = 0; _ < e; _++) c[r + _] = t[n + _];
	for (let _ = 0; _ < l; _++) c[r + e + _] = t[n + Bt(e + _, e)];
	if (s) {
		for (let _ = 0; _ < E; _++) {
			const w = _ << 1, d = c[w], p = c[w + 1];
			o[i + _] = (d + p) * pt, a[f + _] = (d - p) * pt;
		}
		return E;
	}
	for (let _ = 0; _ < 6; _++) c[m + _] = c[_];
	for (let _ = 0; _ < E; _++) {
		const w = _ << 1, d = c[w], p = c[w + 1], x = c[w + 2], B = c[w + 3], M = c[w + 4], I = c[w + 5], D = c[w + 6], h = c[w + 7];
		o[i + _] = Pt * d + Dt * p + Ut * x + It * B + Ft * M + Ct * I + St * D + At * h, a[f + _] = vt * d + Nt * p + Xt * x + qt * B + kt * M + Vt * I + Yt * D + Ht * h;
	}
	return E;
}
function Wt(t, n, e, s, c, o, i, a, f) {
	const u = o ? 2 : 8, r = u, l = u + (c & 1), m = c + r + l, E = m >> 1;
	if (o) {
		for (let w = 0; w < m; w++) i[w] = 0;
		for (let w = 0; w < E; w++) {
			const d = t[n + w], p = e[s + w], x = w << 1;
			i[x] += (d + p) * pt, i[x + 1] += (d - p) * pt;
		}
		for (let w = 0; w < c; w++) a[f + w] = i[w + r];
		return;
	}
	const _ = m + 6;
	for (let w = 0; w < _; w++) i[w] = 0;
	for (let w = 0; w < E; w++) {
		const d = t[n + w], p = e[s + w], x = w << 1;
		i[x] += d * Pt + p * vt, i[x + 1] += d * Dt + p * Nt, i[x + 2] += d * Ut + p * Xt, i[x + 3] += d * It + p * qt, i[x + 4] += d * Ft + p * kt, i[x + 5] += d * Ct + p * Vt, i[x + 6] += d * St + p * Yt, i[x + 7] += d * At + p * Ht;
	}
	for (let w = 0; w < c; w++) a[f + w] = i[w + r];
}
function Kt(t, n) {
	if (n <= 0) return 0;
	if (n === 1) return t[0];
	const e = n >> 1;
	let s = 0, c = n - 1;
	for (; s < c;) {
		const o = s + c >> 1;
		if (t[o] < t[s]) {
			const r = t[s];
			t[s] = t[o], t[o] = r;
		}
		if (t[c] < t[s]) {
			const r = t[s];
			t[s] = t[c], t[c] = r;
		}
		if (t[c] < t[o]) {
			const r = t[o];
			t[o] = t[c], t[c] = r;
		}
		const i = t[o];
		let a = s, f = c, u = s;
		for (; u <= f;) {
			const r = t[u];
			r < i ? (t[u] = t[a], t[a] = r, a++, u++) : r > i ? (t[u] = t[f], t[f] = r, f--) : u++;
		}
		if (e < a) c = a - 1;
		else if (e > f) s = f + 1;
		else return i;
	}
	return t[s];
}
function Jt(t, n, e, s) {
	const c = n * e;
	if (c <= 0) return 0;
	let o = 0;
	for (let a = 0; a < c; a++) {
		const f = t[a], u = f < 0 ? -f : f;
		s[a] = u, o += u;
	}
	const i = Kt(s, c) / .6745;
	return i > 1e-5 ? i : o / c * .5;
}
function _t(t, n) {
	let e = t;
	return e < 0 ? e = -e : e >= n && (e = n - 1 - (e - n)), e < 0 ? 0 : e;
}
function xt(t, n, e, s, c) {
	for (let u = 0; u < e; u++) {
		const r = u * n;
		if (n >= 5) {
			const l = t[r], m = t[r + 1], E = t[r + 2], _ = t[r + 3], w = l * l, d = m * m, p = E * E, x = _ * _;
			c[r] = p + d + w + d + p, c[r + 1] = d + w + d + p + x;
			let B = w, M = d, I = p, D = x;
			const h = n - 2;
			for (let C = 2; C < h; C++) {
				const P = t[r + C + 2], A = P * P;
				c[r + C] = B + M + I + D + A, B = M, M = I, I = D, D = A;
			}
			c[r + n - 2] = B + M + I + D + D, c[r + n - 1] = M + I + D + I + M;
		} else for (let l = 0; l < n; l++) {
			let m = 0;
			for (let E = -2; E <= 2; E++) {
				const _ = t[r + _t(l + E, n)];
				m += _ * _;
			}
			c[r + l] = m;
		}
	}
	let o = 0, i = 0, a = 0;
	const f = .04;
	for (let u = 0; u < e; u++) {
		const r = _t(u - 2, e) * n, l = _t(u - 1, e) * n, m = u * n, E = _t(u + 1, e) * n, _ = _t(u + 2, e) * n;
		for (let w = 0; w < n; w++) {
			const d = (c[r + w] + c[l + w] + c[m + w] + c[E + w] + c[_ + w]) * f, p = m + w, x = t[p], B = d - s, M = x * (B > 0 ? B / (d > 1e-6 ? d : 1e-6) : 0);
			t[p] = M, o += x * M, i += x * x, a += M * M;
		}
	}
	return {
		sumOrigPost: o,
		sumOrigSq: i,
		sumPostSq: a
	};
}
function Lt(t, n, e, s, c, o, i, a) {
	let f = 0;
	for (let u = 0; u < s; u += 16) {
		const r = Math.min(s, u + 16);
		for (let l = u; l < r; l++) {
			for (let m = 0; m < e; m++) o.colIn1D[m] = t[m * n + l];
			f = zt(o.colIn1D, 0, e, c, o.ext1D, o.colLo1D, 0, o.colHi1D, 0);
			for (let m = 0; m < f; m++) {
				const E = m * s + l;
				i[E] = o.colLo1D[m], a[E] = o.colHi1D[m];
			}
		}
	}
	return f;
}
function Rt(t, n, e, s, c, o, i, a, f) {
	for (let u = 0; u < e; u += 16) {
		const r = Math.min(e, u + 16);
		for (let l = u; l < r; l++) {
			for (let m = 0; m < s; m++) {
				const E = m * e + l;
				a.colLo1D[m] = t[E], a.colHi1D[m] = n[E];
			}
			Wt(a.colLo1D, 0, a.colHi1D, 0, c, i, a.ext1D, a.colOut1D, 0);
			for (let m = 0; m < c; m++) f[m * o + l] = a.colOut1D[m];
		}
	}
}
function Qt(t, n, e, s, c, o, i) {
	if (n > 2048 || e > 2048) throw new RangeError(`Tile dimension (${n}x${e}) exceeds MAX_TILE_DIMENSION bounds.`);
	const a = Math.cos(s), f = Math.sin(s), u = 1 / (c !== 0 ? c : 1), r = 1 / (o !== 0 ? o : 1), l = a * u, m = f * u, E = -f * r, _ = a * r, w = (n - 1) * .5, d = (e - 1) * .5, p = n - 1, x = e - 1, B = Math.ceil(Math.abs(E) * w + Math.abs(_ - 1) * d) + 6;
	let M = 16;
	for (; M < B;) M <<= 1;
	M > 2048 && (M = 2048);
	const I = M - 1, D = n << 2, h = new Uint8Array(M * D);
	try {
		for (let C = 0; C < e; C++) {
			const P = C * D, A = (C & I) * D;
			h.set(t.subarray(P, P + D), A);
			const R = C - d, v = w + m * R - l * w, V = d + _ * R - E * w;
			for (let k = 0; k < n; k++) {
				const N = v + l * k, nt = V + E * k, X = Math.floor(N), H = Math.floor(nt), F = N - X, T = nt - H, L = F * (-.5 + F * (1 - .5 * F)), O = 1 + F * F * (1.5 * F - 2.5), b = F * (.5 + F * (2 - 1.5 * F)), Y = .5 * F * F * (F - 1), mt = T * (-.5 + T * (1 - .5 * T)), st = 1 + T * T * (1.5 * T - 2.5), wt = T * (.5 + T * (2 - 1.5 * T)), y = .5 * T * T * (T - 1);
				let g = X - 1, rt = X, it = X + 1, lt = X + 2;
				g < 0 ? g = 0 : g > p && (g = p), rt < 0 ? rt = 0 : rt > p && (rt = p), it < 0 ? it = 0 : it > p && (it = p), lt < 0 ? lt = 0 : lt > p && (lt = p);
				const gt = g << 2, Et = rt << 2, S = it << 2, G = lt << 2;
				let $ = 0, q = 0, K = 0, J = 0;
				for (let Q = 0; Q < 4; Q++) {
					let j = H - 1 + Q;
					j < 0 ? j = 0 : j > x && (j = x);
					const tt = Q === 0 ? mt : Q === 1 ? st : Q === 2 ? wt : y, ct = j <= C && C - j < M, U = ct ? h : t, Z = ct ? (j & I) * D : j * D, ot = Z + gt, z = Z + Et, ft = Z + S, at = Z + G;
					$ += tt * (U[ot] * L + U[z] * O + U[ft] * b + U[at] * Y), q += tt * (U[ot + 1] * L + U[z + 1] * O + U[ft + 1] * b + U[at + 1] * Y), K += tt * (U[ot + 2] * L + U[z + 2] * O + U[ft + 2] * b + U[at + 2] * Y), i && (J += tt * (U[ot + 3] * L + U[z + 3] * O + U[ft + 3] * b + U[at + 3] * Y));
				}
				const W = P + (k << 2);
				t[W] = et($ + .5 | 0), t[W + 1] = et(q + .5 | 0), t[W + 2] = et(K + .5 | 0), t[W + 3] = i ? et(J + .5 | 0) : 255;
			}
		}
	} finally {
		h.fill(0);
	}
}
function $t(t, n, e, s, c) {
	if (s <= 0) return;
	const o = new Uint32Array(/* @__PURE__ */ new ArrayBuffer(4096), 0, 1024), i = s > 2.2 ? 2.2 : s, a = 1 / 4294967295;
	try {
		const f = n * e;
		let u = o.length;
		for (let r = 0; r < f; r++) {
			u + 2 >= o.length && (Gt(o), u = 0);
			const l = (o[u++] * a - o[u++] * a) * i, m = r << 2;
			t[m] = et(t[m] + l + .5 | 0), t[m + 1] = et(t[m + 1] + l + .5 | 0), t[m + 2] = et(t[m + 2] + l + .5 | 0), c || (t[m + 3] = 255);
		}
	} finally {
		o.fill(0);
	}
}
function to(t, n = !1) {
	if (t === "standard") return {
		theta: 0,
		sx: 1,
		sy: 1,
		noiseIntensity: 0
	};
	const e = new Uint32Array(/* @__PURE__ */ new ArrayBuffer(16), 0, 4);
	try {
		Gt(e);
		const s = 1 / 4294967295, c = e[0] * s, o = e[1] * s, i = e[2] * s, a = e[3] * s, f = n ? 0 : 2, u = .1 + c * .2, r = (a >= .5 ? 1 : -1) * u * Math.PI / 180, l = .995 + o * .004;
		let m = .995 + i * .004;
		const E = l - m;
		return (E < 0 ? -E : E) < 5e-4 && (m = l < .997 ? l + 6e-4 : l - 6e-4), {
			theta: r,
			sx: l,
			sy: m,
			noiseIntensity: f
		};
	} finally {
		e.fill(0);
	}
}
function oo(t, n, e, s = "db4", c = 1) {
	if (n <= 0 || e <= 0 || t.length === 0) return {
		normalizedCrossCorrelation: 0,
		psnrDb: 100,
		ssim: 1,
		residualNoiseRms: 0
	};
	const o = n * e, i = t.length >= o * 4 ? 4 : t.length >= o * 3 ? 3 : 1, a = s === "haar", f = c < 0 ? 0 : c, u = Math.min(n, 512), r = Math.min(e, 512), l = jt(Math.min(u + 16, 2048), Math.min(r + 16, 2048));
	try {
		let m = 0, E = 0, _ = 0, w = 0, d = 0, p = 0, x = 0, B = 0;
		const M = 1.45;
		for (let R = 0; R < e; R += 512) {
			const v = Math.min(512, e - R), V = Math.min(8, R), k = Math.min(8, e - (R + v)), N = v + V + k, nt = R - V;
			for (let X = 0; X < n; X += 512) {
				const H = Math.min(512, n - X), F = Math.min(8, X), T = Math.min(8, n - (X + H)), L = H + F + T, O = X - F;
				let b = 0;
				for (let S = 0; S < N; S++) {
					const G = (nt + S) * n * i;
					if (i >= 3) for (let q = 0; q < L; q++) {
						const K = G + (O + q) * i;
						l.rowBuf1D[q] = .299 * t[K] + .587 * t[K + 1] + .114 * t[K + 2];
					}
					else for (let q = 0; q < L; q++) l.rowBuf1D[q] = t[G + O + q];
					const $ = S * l.maxSubW;
					b = zt(l.rowBuf1D, 0, L, a, l.ext1D, l.rowLo, $, l.rowHi, $);
				}
				const Y = Lt(l.rowHi, l.maxSubW, N, b, a, l, l.subBand0, l.subBand1), mt = Jt(l.subBand1, b, Y, l.subScratch) * f, st = mt * mt;
				if (st > 0) {
					const S = xt(l.subBand0, b, Y, st, l.subScratch), G = xt(l.subBand1, b, Y, st, l.subScratch);
					w += S.sumOrigPost + G.sumOrigPost, d += S.sumOrigSq + G.sumOrigSq, p += S.sumPostSq + G.sumPostSq;
				}
				if (Rt(l.subBand0, l.subBand1, b, Y, N, l.maxSubW, a, l, l.rowHi), Lt(l.rowLo, l.maxSubW, N, b, a, l, l.subBand0, l.subBand1), st > 0) {
					const S = xt(l.subBand1, b, Y, st, l.subScratch);
					w += S.sumOrigPost, d += S.sumOrigSq, p += S.sumPostSq;
				}
				Rt(l.subBand0, l.subBand1, b, Y, N, l.maxSubW, a, l, l.rowLo);
				const wt = H * v;
				let y = 0, g = 0, rt = 0, it = 0, lt = 0, gt = 0, Et = !1;
				for (let S = 0; S < v; S++) {
					const G = (V + S) * l.maxSubW;
					Wt(l.rowLo, G, l.rowHi, G, L, a, l.ext1D, l.rowBuf1D, 0);
					const $ = (R + S) * n * i;
					for (let q = 0; q < H; q++) {
						const K = l.rowBuf1D[F + q], J = $ + (X + q) * i;
						let W, Q;
						if (i >= 3) {
							const U = t[J], Z = t[J + 1], ot = t[J + 2];
							W = .299 * U + .587 * Z + .114 * ot;
							let z = K - W;
							z > M ? z = M : z < -1.45 && (z = -1.45);
							const ft = et(U + z + .5 | 0), at = et(Z + z + .5 | 0), dt = et(ot + z + .5 | 0);
							t[J] = ft, t[J + 1] = at, t[J + 2] = dt;
							const Tt = ft - U, bt = at - Z, ht = dt - ot;
							m += Tt * Tt + bt * bt + ht * ht, E += 3, Q = .299 * ft + .587 * at + .114 * dt;
						} else {
							const U = t[J];
							W = U;
							let Z = K - W;
							Z > M ? Z = M : Z < -1.45 && (Z = -1.45);
							const ot = et(U + Z + .5 | 0);
							t[J] = ot;
							const z = ot - U;
							m += z * z, E += 1, Q = ot;
						}
						const j = Q - W;
						_ += j * j, Et || (gt = W, Et = !0);
						const tt = W - gt, ct = Q - gt;
						y += tt, g += ct, rt += tt * tt, it += ct * ct, lt += tt * ct;
					}
				}
				if (wt > 0) {
					const S = 1 / wt, G = y * S, $ = g * S, q = gt + G, K = gt + $, J = Math.max(0, rt * S - G * G), W = Math.max(0, it * S - $ * $), Q = lt * S - G * $, j = 6.5025, tt = 58.5225, ct = (2 * q * K + j) * (2 * Q + tt), U = (q * q + K * K + j) * (J + W + tt);
					x += U > 0 ? ct / U : 1, B++;
				}
			}
		}
		const I = E > 0 ? m / E : 0, D = I <= 1e-9 ? 99.99 : 10 * Math.log10(65025 / I), h = B > 0 ? x / B : 1, C = Math.min(1, h), P = Math.sqrt(_ / o), A = Math.sqrt(d * p);
		return {
			normalizedCrossCorrelation: A > 1e-9 ? Math.max(0, Math.min(1, w / A)) : 0,
			psnrDb: D,
			ssim: C,
			residualNoiseRms: P
		};
	} finally {
		Zt(l);
	}
}
function no(t, n, e, s = !0, c = !1) {
	const o = t.width, i = t.height;
	if (o <= 0 || i <= 0) return;
	n.width !== o && (n.width = o), n.height !== i && (n.height = i);
	const a = n.getContext("2d", {
		willReadFrequently: !0,
		alpha: s
	});
	if (!a) throw new Error("Failed to acquire 2D rendering context on targetCanvas.");
	if (e === "standard") {
		a.drawImage(t, 0, 0);
		return;
	}
	a.clearRect(0, 0, o, i), a.drawImage(t, 0, 0, o, i);
	const f = a.getImageData(0, 0, o, i), u = f.data;
	let r = !1;
	try {
		const l = to(e, c);
		if (Qt(u, o, i, l.theta, l.sx, l.sy, s), oo(u, o, i, "db4", e === "paranoid" ? 1.25 : 1), !c && l.noiseIntensity > 0) $t(u, o, i, l.noiseIntensity, s);
		else if (!s) {
			const m = o * i * 4;
			for (let E = 3; E < m; E += 4) u[E] = 255;
		}
		a.putImageData(f, 0, 0), r = !0;
	} finally {
		r || u.fill(0);
	}
}
function ut(t) {
	const n = t < 0 ? -t : t;
	return n < 1 ? n * n * (1.5 * n - 2.5) + 1 : n < 2 ? n * n * (-.5 * n + 2.5) - 4 * n + 2 : 0;
}
function eo(t, n, e, s, c, o, i = !0) {
	const a = n / c, f = e / o, u = e - 1, r = n - 1;
	let l = 0;
	for (let m = 0; m < o; m++) {
		const E = (m + .5) * f - .5, _ = Math.floor(E), w = E - _, d = ut(w + 1), p = ut(w), x = ut(w - 1), B = ut(w - 2), M = (_ - 1 < 0 ? 0 : _ - 1 >= e ? u : _ - 1) * n, I = (_ < 0 ? 0 : _ >= e ? u : _) * n, D = (_ + 1 < 0 ? 0 : _ + 1 >= e ? u : _ + 1) * n, h = (_ + 2 < 0 ? 0 : _ + 2 >= e ? u : _ + 2) * n;
		for (let C = 0; C < c; C++) {
			const P = (C + .5) * a - .5, A = Math.floor(P), R = P - A, v = ut(R + 1), V = ut(R), k = ut(R - 1), N = ut(R - 2), nt = A - 1 < 0 ? 0 : A - 1 >= n ? r : A - 1, X = A < 0 ? 0 : A >= n ? r : A, H = A + 1 < 0 ? 0 : A + 1 >= n ? r : A + 1, F = A + 2 < 0 ? 0 : A + 2 >= n ? r : A + 2;
			let T = 0, L = 0, O = 0, b = 0;
			if (d !== 0) {
				if (v !== 0) {
					const y = t[M + nt], g = v * d;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
				if (V !== 0) {
					const y = t[M + X], g = V * d;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
				if (k !== 0) {
					const y = t[M + H], g = k * d;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
				if (N !== 0) {
					const y = t[M + F], g = N * d;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
			}
			if (p !== 0) {
				if (v !== 0) {
					const y = t[I + nt], g = v * p;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
				if (V !== 0) {
					const y = t[I + X], g = V * p;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
				if (k !== 0) {
					const y = t[I + H], g = k * p;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
				if (N !== 0) {
					const y = t[I + F], g = N * p;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
			}
			if (x !== 0) {
				if (v !== 0) {
					const y = t[D + nt], g = v * x;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
				if (V !== 0) {
					const y = t[D + X], g = V * x;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
				if (k !== 0) {
					const y = t[D + H], g = k * x;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
				if (N !== 0) {
					const y = t[D + F], g = N * x;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
			}
			if (B !== 0) {
				if (v !== 0) {
					const y = t[h + nt], g = v * B;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
				if (V !== 0) {
					const y = t[h + X], g = V * B;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
				if (k !== 0) {
					const y = t[h + H], g = k * B;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
				if (N !== 0) {
					const y = t[h + F], g = N * B;
					T += (y & 255) * g, L += (y >> 8 & 255) * g, O += (y >> 16 & 255) * g, b += (y >>> 24 & 255) * g;
				}
			}
			const Y = T < 0 ? 0 : T >= 255.5 ? 255 : T + .5 | 0, mt = L < 0 ? 0 : L >= 255.5 ? 255 : L + .5 | 0, st = O < 0 ? 0 : O >= 255.5 ? 255 : O + .5 | 0, wt = i ? b < 0 ? 0 : b >= 255.5 ? 255 : b + .5 | 0 : 255;
			s[l++] = Y | mt << 8 | st << 16 | wt << 24;
		}
	}
}
function so(t, n = !0) {
	const e = t.width, s = t.height;
	if (e < 4 || s < 4) return;
	const c = Math.max(2, e * .995 + .5 | 0), o = Math.max(2, s * .995 + .5 | 0);
	let i;
	typeof OffscreenCanvas < "u" ? i = new OffscreenCanvas(c, o) : (i = document.createElement("canvas"), i.width = c, i.height = o);
	const a = i.getContext("2d", { willReadFrequently: !0 });
	a.drawImage(t, 0, 0, c, o);
	const f = a.getImageData(0, 0, c, o), u = new Uint32Array(f.data.buffer), r = t.getContext("2d", { willReadFrequently: !0 }), l = r.createImageData(e, s);
	eo(u, c, o, new Uint32Array(l.data.buffer), e, s, n), r.putImageData(l, 0, 0);
}
function Mt(t) {
	let n = t[0], e = t[1], s = t[2], c = t[3], o = t[4], i = t[5], a = t[6], f = t[7], u = t[8], r = 0;
	return e > s && (r = e, e = s, s = r), o > i && (r = o, o = i, i = r), f > u && (r = f, f = u, u = r), n > e && (r = n, n = e, e = r), c > o && (r = c, c = o, o = r), a > f && (r = a, a = f, f = r), e > s && (r = e, e = s, s = r), o > i && (r = o, o = i, i = r), f > u && (r = f, f = u, u = r), n > c && (r = n, n = c, c = r), i > u && (r = i, i = u, u = r), o > f && (r = o, o = f, f = r), c > a && (r = c, c = a, a = r), e > o && (r = e, e = o, o = r), s > i && (r = s, s = i, i = r), o > f && (r = o, o = f, f = r), o > s && (r = o, o = s, s = r), a > o && (r = a, a = o, o = r), o > s && (o = s), o;
}
function Ot(t, n, e) {
	const s = t.length, c = new Uint8ClampedArray(s);
	c.set(t);
	const o = /* @__PURE__ */ new Uint8Array(9), i = /* @__PURE__ */ new Uint8Array(9), a = /* @__PURE__ */ new Uint8Array(9), f = n - 1, u = e - 1;
	for (let r = 0; r < e; r++) {
		const l = r * n;
		for (let m = 0; m < n; m++) {
			let E = 0;
			for (let w = -1; w <= 1; w++) {
				const d = (r + w < 0 ? 0 : r + w > u ? u : r + w) * n;
				for (let p = -1; p <= 1; p++) {
					const x = d + (m + p < 0 ? 0 : m + p > f ? f : m + p) << 2;
					o[E] = t[x], i[E] = t[x + 1], a[E] = t[x + 2], E++;
				}
			}
			const _ = l + m << 2;
			c[_] = Mt(o), c[_ + 1] = Mt(i), c[_ + 2] = Mt(a);
		}
	}
	t.set(c);
}
function co(t) {
	const n = t.width, e = t.height;
	if (n < 3 || e < 3) return;
	const s = t.getContext("2d", { willReadFrequently: !0 });
	if (!s) return;
	let c = null, o = null;
	try {
		typeof OffscreenCanvas < "u" ? c = new OffscreenCanvas(n, e) : (c = document.createElement("canvas"), c.width = n, c.height = e), o = c.getContext("webgl");
	} catch {
		o = null;
	}
	if (!o) {
		const i = s.getImageData(0, 0, n, e);
		Ot(i.data, n, e), s.putImageData(i, 0, 0);
		return;
	}
	try {
		const i = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = (a_position + 1.0) * 0.5;
      }
    `, a = `
      precision mediump float;
      uniform sampler2D u_image;
      uniform vec2 u_resolution;
      varying vec2 v_texCoord;

      void sort9(inout float v[9]) {
        for (int i = 0; i < 9; i++) {
          for (int j = i + 1; j < 9; j++) {
            if (v[i] > v[j]) {
              float tmp = v[i];
              v[i] = v[j];
              v[j] = tmp;
            }
          }
        }
      }

      void main() {
        vec2 onePixel = vec2(1.0, 1.0) / u_resolution;
        float r[9];
        float g[9];
        float b[9];
        int idx = 0;
        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec4 c = texture2D(u_image, v_texCoord + vec2(float(x), float(y)) * onePixel);
            r[idx] = c.r;
            g[idx] = c.g;
            b[idx] = c.b;
            idx++;
          }
        }
        sort9(r);
        sort9(g);
        sort9(b);
        float a = texture2D(u_image, v_texCoord).a;
        gl_FragColor = vec4(r[4], g[4], b[4], a);
      }
    `, f = o.createShader(o.VERTEX_SHADER);
		o.shaderSource(f, i), o.compileShader(f);
		const u = o.createShader(o.FRAGMENT_SHADER);
		o.shaderSource(u, a), o.compileShader(u);
		const r = o.createProgram();
		o.attachShader(r, f), o.attachShader(r, u), o.linkProgram(r), o.useProgram(r);
		const l = o.createBuffer();
		o.bindBuffer(o.ARRAY_BUFFER, l), o.bufferData(o.ARRAY_BUFFER, new Float32Array([
			-1,
			-1,
			1,
			-1,
			-1,
			1,
			-1,
			1,
			1,
			-1,
			1,
			1
		]), o.STATIC_DRAW);
		const m = o.getAttribLocation(r, "a_position");
		o.enableVertexAttribArray(m), o.vertexAttribPointer(m, 2, o.FLOAT, !1, 0, 0);
		const E = o.getUniformLocation(r, "u_resolution");
		o.uniform2f(E, n, e);
		const _ = o.createTexture();
		o.bindTexture(o.TEXTURE_2D, _), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_WRAP_S, o.CLAMP_TO_EDGE), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_WRAP_T, o.CLAMP_TO_EDGE), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_MIN_FILTER, o.NEAREST), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_MAG_FILTER, o.NEAREST), o.texImage2D(o.TEXTURE_2D, 0, o.RGBA, o.RGBA, o.UNSIGNED_BYTE, t), o.viewport(0, 0, n, e), o.drawArrays(o.TRIANGLES, 0, 6), s.drawImage(c, 0, 0);
	} catch {
		const i = s.getImageData(0, 0, n, e);
		Ot(i.data, n, e), s.putImageData(i, 0, 0);
	}
}
function ro(t, n = 1597463007) {
	let e = n || 305419896;
	const s = t.length;
	for (let c = 0; c < s; c += 4) {
		e ^= e << 13, e ^= e >>> 17, e ^= e << 5;
		const o = ((e & 1) === 0 ? 1 : -1) * ((e >>> 1 & 1) + 1), i = ((e >>> 2 & 1) === 0 ? 1 : -1) * ((e >>> 3 & 1) + 1), a = ((e >>> 4 & 1) === 0 ? 1 : -1) * ((e >>> 5 & 1) + 1);
		let f = t[c] + o, u = t[c + 1] + i, r = t[c + 2] + a;
		t[c] = f < 0 ? 0 : f > 255 ? 255 : f, t[c + 1] = u < 0 ? 0 : u > 255 ? 255 : u, t[c + 2] = r < 0 ? 0 : r > 255 ? 255 : r;
	}
}
function io(t, n, e) {
	for (let s = 0; s < e; s += 2) {
		const c = s + 1 < e, o = s * n, i = (s + 1) * n;
		for (let a = 0; a < n; a += 2) {
			const f = a + 1 < n, u = o + a << 2;
			let r = 1;
			const l = t[u], m = t[u + 1], E = t[u + 2], _ = .299 * l + .587 * m + .114 * E;
			let w = -.168736 * l - .331264 * m + .5 * E + 128, d = .5 * l - .418688 * m - .081312 * E + 128, p = 0, x = 0, B = 0, M = 0, I = 0, D = 0;
			if (f) {
				M = u + 4;
				const P = t[M], A = t[M + 1], R = t[M + 2];
				p = .299 * P + .587 * A + .114 * R, w += -.168736 * P - .331264 * A + .5 * R + 128, d += .5 * P - .418688 * A - .081312 * R + 128, r++;
			}
			if (c) {
				I = i + a << 2;
				const P = t[I], A = t[I + 1], R = t[I + 2];
				x = .299 * P + .587 * A + .114 * R, w += -.168736 * P - .331264 * A + .5 * R + 128, d += .5 * P - .418688 * A - .081312 * R + 128, r++;
			}
			if (c && f) {
				D = I + 4;
				const P = t[D], A = t[D + 1], R = t[D + 2];
				B = .299 * P + .587 * A + .114 * R, w += -.168736 * P - .331264 * A + .5 * R + 128, d += .5 * P - .418688 * A - .081312 * R + 128, r++;
			}
			const h = w / r - 128, C = d / r - 128;
			t[u] = _ + 1.402 * C, t[u + 1] = _ - .344136 * h - .714136 * C, t[u + 2] = _ + 1.772 * h, f && (t[M] = p + 1.402 * C, t[M + 1] = p - .344136 * h - .714136 * C, t[M + 2] = p + 1.772 * h), c && (t[I] = x + 1.402 * C, t[I + 1] = x - .344136 * h - .714136 * C, t[I + 2] = x + 1.772 * h), c && f && (t[D] = B + 1.402 * C, t[D + 1] = B - .344136 * h - .714136 * C, t[D + 2] = B + 1.772 * h);
		}
	}
}
function lo(t, n = !0) {
	so(t, n), co(t);
	const e = t.getContext("2d", { willReadFrequently: !0 });
	if (e) {
		const s = e.getImageData(0, 0, t.width, t.height);
		io(s.data, t.width, t.height), ro(s.data), e.putImageData(s, 0, 0);
	}
}
const fo = 1766015824, ao = 1665684045, uo = 1732332865, go = 1700284774, mo = 1950701684, wo = 2052348020, yo = 1767135348, _o = 1950960965, Eo = 1883789683, po = 1229144912, xo = 1163413830, Mo = 1481461792;
function Do(t, n) {
	return t.length < 12 ? t : n === "image/png" || t[0] === 137 && t[1] === 80 && t[2] === 78 && t[3] === 71 ? Io(t) : n === "image/jpeg" || t[0] === 255 && t[1] === 216 ? Co(t) : n === "image/webp" || t[0] === 82 && t[1] === 73 && t[2] === 70 && t[3] === 70 ? Ro(t) : t;
}
function Io(t) {
	if (t.length < 8) return t;
	const n = new DataView(t.buffer, t.byteOffset, t.byteLength);
	if (n.getUint32(0, !1) !== 2303741511 || n.getUint32(4, !1) !== 218765834) return t;
	const e = new Uint8Array(t.length);
	e.set(t.subarray(0, 8), 0);
	let s = 8, c = 8;
	const o = t.length;
	for (; s + 8 <= o;) {
		const i = n.getUint32(s, !1), a = n.getUint32(s + 4, !1), f = 12 + i;
		if (s + f > o) break;
		a === fo || a === ao || a === uo || a === go || a === mo || a === wo || a === yo || a === _o || a === Eo || (e.set(t.subarray(s, s + f), c), c += f), s += f;
	}
	return e.subarray(0, c);
}
function Co(t) {
	if (t.length < 4 || t[0] !== 255 || t[1] !== 216) return t;
	const n = new Uint8Array(t.length);
	n[0] = 255, n[1] = 216;
	let e = 2, s = 2;
	const c = t.length;
	for (; s < c - 1;) {
		if (t[s] !== 255) {
			n[e++] = t[s++];
			continue;
		}
		const o = t[s + 1];
		if (o === 255 || o === 0) {
			n[e++] = t[s++];
			continue;
		}
		if (o === 217) {
			n[e++] = 255, n[e++] = 217;
			break;
		}
		if (o === 218) {
			const f = t.subarray(s);
			n.set(f, e), e += f.length;
			break;
		}
		if (s + 3 >= c) break;
		const i = 2 + (t[s + 2] << 8 | t[s + 3]);
		if (s + i > c) break;
		let a = !1;
		o === 226 ? s + 15 <= c && t[s + 4] === 73 && t[s + 5] === 67 && t[s + 6] === 67 && t[s + 7] === 95 && t[s + 8] === 80 && t[s + 9] === 82 && t[s + 10] === 79 && t[s + 11] === 70 && t[s + 12] === 73 && t[s + 13] === 76 && t[s + 14] === 69 && t[s + 15] === 0 && (a = !0) : (o === 225 || o === 237 || o === 238 || o === 254 || o >= 227 && o <= 239) && (a = !0), a || (n.set(t.subarray(s, s + i), e), e += i), s += i;
	}
	return n.subarray(0, e);
}
const Ao = 1448097880, To = 1095520328, bo = 1448097824, ho = 1448097868, Bo = 1095649613, Lo = 1095650630;
function Ro(t) {
	if (t.length < 12) return t;
	const n = new DataView(t.buffer, t.byteOffset, t.byteLength);
	if (n.getUint32(0, !1) !== 1380533830 || n.getUint32(8, !1) !== 1464156752) return t;
	let e = !1, s = !1, c = null;
	const o = [];
	let i = 12;
	const a = t.length;
	for (; i + 8 <= a;) {
		const l = n.getUint32(i, !1), m = n.getUint32(i + 4, !0), E = 8 + (m + m % 2);
		if (i + E > a) break;
		l === To ? (e = !0, o.push({
			offset: i,
			totalLen: E,
			type: l
		})) : l === Bo || l === Lo ? (s = !0, o.push({
			offset: i,
			totalLen: E,
			type: l
		})) : l === Ao ? c = {
			offset: i,
			totalLen: E
		} : l === bo || l === ho ? o.push({
			offset: i,
			totalLen: E,
			type: l
		}) : l === po || l === xo || l === Mo || o.push({
			offset: i,
			totalLen: E,
			type: l
		}), i += E;
	}
	const f = new Uint8Array(t.length);
	f.set(t.subarray(0, 12), 0);
	const u = new DataView(f.buffer, f.byteOffset, f.byteLength);
	let r = 12;
	if ((e || s) && c) {
		f.set(t.subarray(c.offset, c.offset + c.totalLen), r);
		let l = 0;
		e && (l |= 16), s && (l |= 2), f[r + 8] = l, r += c.totalLen;
	}
	for (const l of o) f.set(t.subarray(l.offset, l.offset + l.totalLen), r), r += l.totalLen;
	return u.setUint32(4, r - 8, !0), f.subarray(0, r);
}
const Oo = .02;
function Po(t, n = Oo, e = 1) {
	const s = 2 * Math.PI, c = 1 / 4294967296, o = /* @__PURE__ */ new Uint32Array(16384);
	let i = 16384;
	const a = t.length - 7;
	let f = 0;
	for (; f < a; f += 8) {
		i > 16378 && (crypto.getRandomValues(o), i = 0);
		const u = t[f], r = t[f + 1], l = t[f + 2], m = t[f + 4], E = t[f + 5], _ = t[f + 6], w = (o[i++] + 1) * c, d = (o[i++] + 1) * c, p = (o[i++] + 1) * c, x = (o[i++] + 1) * c, B = (o[i++] + 1) * c, M = (o[i++] + 1) * c, I = Math.sqrt(-2 * Math.log(w)), D = Math.sqrt(-2 * Math.log(p)), h = Math.sqrt(-2 * Math.log(B)), C = s * d, P = s * x, A = s * M, R = I * Math.cos(C), v = I * Math.sin(C), V = D * Math.cos(P), k = D * Math.sin(P), N = h * Math.cos(A), nt = h * Math.sin(A), X = Math.sqrt(n * (.2126 * u + .7152 * r + .0722 * l) + e), H = Math.sqrt(n * (.2126 * m + .7152 * E + .0722 * _) + e), F = u + Math.round(R * X), T = r + Math.round(v * X), L = l + Math.round(V * X);
		t[f] = F < 0 ? 0 : F > 255 ? 255 : F, t[f + 1] = T < 0 ? 0 : T > 255 ? 255 : T, t[f + 2] = L < 0 ? 0 : L > 255 ? 255 : L;
		const O = m + Math.round(k * H), b = E + Math.round(N * H), Y = _ + Math.round(nt * H);
		t[f + 4] = O < 0 ? 0 : O > 255 ? 255 : O, t[f + 5] = b < 0 ? 0 : b > 255 ? 255 : b, t[f + 6] = Y < 0 ? 0 : Y > 255 ? 255 : Y;
	}
	if (f < t.length) {
		i > 16380 && (crypto.getRandomValues(o), i = 0);
		const u = t[f], r = t[f + 1], l = t[f + 2], m = (o[i++] + 1) * c, E = (o[i++] + 1) * c, _ = (o[i++] + 1) * c, w = (o[i++] + 1) * c, d = Math.sqrt(-2 * Math.log(m)), p = Math.sqrt(-2 * Math.log(_)), x = d * Math.cos(s * E), B = d * Math.sin(s * E), M = p * Math.cos(s * w), I = Math.sqrt(n * (.2126 * u + .7152 * r + .0722 * l) + e), D = u + Math.round(x * I), h = r + Math.round(B * I), C = l + Math.round(M * I);
		t[f] = D < 0 ? 0 : D > 255 ? 255 : D, t[f + 1] = h < 0 ? 0 : h > 255 ? 255 : h, t[f + 2] = C < 0 ? 0 : C > 255 ? 255 : C;
	}
}
const yt = 2048, Uo = .6;
self.onmessage = async (t) => {
	const { buffer: n, mimeType: e, options: s, needsAlpha: c } = t.data;
	try {
		const o = new Blob([n], { type: e }), i = await createImageBitmap(o);
		let a = i.width, f = i.height;
		i.close();
		const u = Math.max(a, f);
		let r = o;
		if (u > 1920) {
			const I = 1920 / u;
			a = Math.round(a * I), f = Math.round(f * I);
			const D = new OffscreenCanvas(a, f), h = D.getContext("2d", {
				alpha: c,
				willReadFrequently: !0
			}), C = await createImageBitmap(o);
			h.drawImage(C, 0, 0, a, f), C.close(), r = await D.convertToBlob({ type: "image/png" });
		}
		const l = Math.ceil(a / yt), m = Math.ceil(f / yt), E = l * m, _ = new OffscreenCanvas(a, f), w = _.getContext("2d", {
			alpha: c,
			willReadFrequently: !0
		});
		if (!w) throw new Error("WORKER_CONTEXT_FAILED");
		let d = 0;
		for (let I = 0; I < m; I++) for (let D = 0; D < l; D++) {
			const h = D * yt, C = I * yt, P = Math.min(yt, a - h), A = Math.min(yt, f - C), R = await createImageBitmap(r, h, C, P, A), v = new OffscreenCanvas(P, A), V = v.getContext("2d", {
				alpha: c,
				willReadFrequently: !0
			});
			no(R, v, s.defenseLevel === "standard" ? "hardened" : s.defenseLevel, c, !1), R.close(), lo(v, c);
			const N = V.getImageData(0, 0, P, A);
			Po(N.data), V.putImageData(N, 0, 0), w.drawImage(v, h, C), d++, self.postMessage({
				type: "progress",
				percent: Math.round(25 + d / E * 50)
			});
		}
		self.postMessage({
			type: "progress",
			percent: 80
		});
		const p = await _.convertToBlob({
			type: "image/webp",
			quality: Uo
		});
		if (p.type !== "image/webp") throw new Error("WEBP_ENCODE_UNSUPPORTED");
		const x = new Uint8Array(await p.arrayBuffer());
		self.postMessage({
			type: "progress",
			percent: 90
		});
		const B = Do(x, "image/webp"), M = B.buffer.slice(B.byteOffset, B.byteOffset + B.byteLength);
		self.postMessage({
			buffer: M,
			tilesProcessed: E,
			wasmEncoded: !1
		}, [M]);
	} catch (o) {
		self.postMessage({ error: o.message || "Worker processing failed" });
	}
};

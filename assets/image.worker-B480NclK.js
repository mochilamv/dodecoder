const zt = -.010597401785, Ut = .032883011667, $t = .030841381836, St = -.187034811719, Zt = -.027983769417, Ot = .63088076793, Kt = .714846570553, Pt = .230377813309, jt = Pt, Jt = -.714846570553, Qt = Ot, tn = .027983769417, nn = St, en = -.030841381836, on = Ut, sn = .010597401785, bt = .7071067811865475;
function un(t, n) {
	if (t <= 0 || n <= 0 || t > 2048 || n > 2048) throw new RangeError("Tile dimension exceeds MAX_TILE_DIMENSION bounds.");
	const e = (t + 1 >> 1) + 8, s = (n + 1 >> 1) + 8, r = Math.max(t, n) + 24 + 2, i = Math.max(e, s), o = e * s, a = Math.max(t, n);
	return {
		maxPatchW: t,
		maxPatchH: n,
		maxSubW: e,
		maxSubH: s,
		rowLo: new Float32Array(n * e),
		rowHi: new Float32Array(n * e),
		subBand0: new Float32Array(o),
		subBand1: new Float32Array(o),
		subScratch: new Float32Array(o),
		rowBuf1D: new Float32Array(a),
		ext1D: new Float32Array(r),
		colIn1D: new Float32Array(n),
		colLo1D: new Float32Array(i),
		colHi1D: new Float32Array(i),
		colOut1D: new Float32Array(n)
	};
}
function an(t) {
	t.rowLo.fill(0), t.rowHi.fill(0), t.subBand0.fill(0), t.subBand1.fill(0), t.subScratch.fill(0), t.rowBuf1D.fill(0), t.ext1D.fill(0), t.colIn1D.fill(0), t.colLo1D.fill(0), t.colHi1D.fill(0), t.colOut1D.fill(0);
}
function gn(t) {
	const n = new Uint32Array(t.buffer, t.byteOffset, t.length);
	if (typeof globalThis.crypto < "u" && typeof globalThis.crypto.getRandomValues == "function") globalThis.crypto.getRandomValues(n);
	else {
		let e = 2654435769;
		for (let s = 0; s < n.length; s++) e ^= e << 13, e ^= e >>> 17, e ^= e << 5, n[s] = e >>> 0;
	}
}
function Nt(t, n) {
	if (n <= 1) return 0;
	const e = n << 1;
	let s = t % e;
	return s < 0 && (s += e), s < n ? s : e - 1 - s;
}
function rt(t) {
	return (t & ~(t >> 31) | 255 - t >> 31) & 255;
}
function Ft(t) {
	return t >= 0 ? Math.floor(t + .5) : -Math.floor(-t + .5);
}
function rn(t, n, e, s, r, i, o, a, u) {
	const g = s ? 2 : 8, f = g, h = g + (e & 1), l = e + f + h, d = l >> 1;
	for (let m = 0; m < f; m++) r[m] = t[n + Nt(m - f, e)];
	for (let m = 0; m < e; m++) r[f + m] = t[n + m];
	for (let m = 0; m < h; m++) r[f + e + m] = t[n + Nt(e + m, e)];
	if (s) {
		for (let m = 0; m < d; m++) {
			const p = m << 1, w = r[p], y = r[p + 1];
			i[o + m] = (w + y) * bt, a[u + m] = (w - y) * bt;
		}
		return d;
	}
	for (let m = 0; m < 6; m++) r[l + m] = r[m];
	for (let m = 0; m < d; m++) {
		const p = m << 1, w = r[p], y = r[p + 1], I = r[p + 2], _ = r[p + 3], A = r[p + 4], C = r[p + 5], b = r[p + 6], B = r[p + 7];
		i[o + m] = zt * w + Ut * y + $t * I + St * _ + Zt * A + Ot * C + Kt * b + Pt * B, a[u + m] = jt * w + Jt * y + Qt * I + tn * _ + nn * A + en * C + on * b + sn * B;
	}
	return d;
}
function cn(t, n, e, s, r, i, o, a, u) {
	const g = i ? 2 : 8, f = g, h = g + (r & 1), l = r + f + h, d = l >> 1;
	if (i) {
		for (let p = 0; p < l; p++) o[p] = 0;
		for (let p = 0; p < d; p++) {
			const w = t[n + p], y = e[s + p], I = p << 1;
			o[I] += (w + y) * bt, o[I + 1] += (w - y) * bt;
		}
		for (let p = 0; p < r; p++) a[u + p] = o[p + f];
		return;
	}
	const m = l + 6;
	for (let p = 0; p < m; p++) o[p] = 0;
	for (let p = 0; p < d; p++) {
		const w = t[n + p], y = e[s + p], I = p << 1;
		o[I] += w * zt + y * jt, o[I + 1] += w * Ut + y * Jt, o[I + 2] += w * $t + y * Qt, o[I + 3] += w * St + y * tn, o[I + 4] += w * Zt + y * nn, o[I + 5] += w * Ot + y * en, o[I + 6] += w * Kt + y * on, o[I + 7] += w * Pt + y * sn;
	}
	for (let p = 0; p < r; p++) a[u + p] = o[p + f];
}
function mn(t, n) {
	if (n <= 0) return 0;
	if (n === 1) return t[0];
	const e = n >> 1;
	let s = 0, r = n - 1;
	for (; s < r;) {
		const i = s + r >> 1;
		if (t[i] < t[s]) {
			const f = t[s];
			t[s] = t[i], t[i] = f;
		}
		if (t[r] < t[s]) {
			const f = t[s];
			t[s] = t[r], t[r] = f;
		}
		if (t[r] < t[i]) {
			const f = t[i];
			t[i] = t[r], t[r] = f;
		}
		const o = t[i];
		let a = s, u = r, g = s;
		for (; g <= u;) {
			const f = t[g];
			f < o ? (t[g] = t[a], t[a] = f, a++, g++) : f > o ? (t[g] = t[u], t[u] = f, u--) : g++;
		}
		if (e < a) r = a - 1;
		else if (e > u) s = u + 1;
		else return o;
	}
	return t[s];
}
function pn(t, n, e, s) {
	const r = n * e;
	if (r <= 0) return 0;
	let i = 0;
	for (let a = 0; a < r; a++) {
		const u = t[a], g = u < 0 ? -u : u;
		s[a] = g, i += g;
	}
	const o = mn(s, r) / .6745;
	return o > 1e-5 ? o : i / r * .5;
}
function It(t, n) {
	let e = t;
	return e < 0 ? e = -e : e >= n && (e = n - 1 - (e - n)), e < 0 ? 0 : e;
}
function Bt(t, n, e, s, r) {
	for (let g = 0; g < e; g++) {
		const f = g * n;
		if (n >= 5) {
			const h = t[f], l = t[f + 1], d = t[f + 2], m = t[f + 3], p = h * h, w = l * l, y = d * d, I = m * m;
			r[f] = y + w + p + w + y, r[f + 1] = w + p + w + y + I;
			let _ = p, A = w, C = y, b = I;
			const B = n - 2;
			for (let U = 2; U < B; U++) {
				const G = t[f + U + 2], R = G * G;
				r[f + U] = _ + A + C + b + R, _ = A, A = C, C = b, b = R;
			}
			r[f + n - 2] = _ + A + C + b + b, r[f + n - 1] = A + C + b + C + A;
		} else for (let h = 0; h < n; h++) {
			let l = 0;
			for (let d = -2; d <= 2; d++) {
				const m = t[f + It(h + d, n)];
				l += m * m;
			}
			r[f + h] = l;
		}
	}
	let i = 0, o = 0, a = 0;
	const u = .04;
	for (let g = 0; g < e; g++) {
		const f = It(g - 2, e) * n, h = It(g - 1, e) * n, l = g * n, d = It(g + 1, e) * n, m = It(g + 2, e) * n;
		for (let p = 0; p < n; p++) {
			const w = (r[f + p] + r[h + p] + r[l + p] + r[d + p] + r[m + p]) * u, y = l + p, I = t[y], _ = w - s, A = I * (_ > 0 ? _ / (w > 1e-6 ? w : 1e-6) : 0);
			t[y] = A, i += I * A, o += I * I, a += A * A;
		}
	}
	return {
		sumOrigPost: i,
		sumOrigSq: o,
		sumPostSq: a
	};
}
function Xt(t, n, e, s, r, i, o, a) {
	let u = 0;
	for (let g = 0; g < s; g += 16) {
		const f = Math.min(s, g + 16);
		for (let h = g; h < f; h++) {
			for (let l = 0; l < e; l++) i.colIn1D[l] = t[l * n + h];
			u = rn(i.colIn1D, 0, e, r, i.ext1D, i.colLo1D, 0, i.colHi1D, 0);
			for (let l = 0; l < u; l++) {
				const d = l * s + h;
				o[d] = i.colLo1D[l], a[d] = i.colHi1D[l];
			}
		}
	}
	return u;
}
function vt(t, n, e, s, r, i, o, a, u) {
	for (let g = 0; g < e; g += 16) {
		const f = Math.min(e, g + 16);
		for (let h = g; h < f; h++) {
			for (let l = 0; l < s; l++) {
				const d = l * e + h;
				a.colLo1D[l] = t[d], a.colHi1D[l] = n[d];
			}
			cn(a.colLo1D, 0, a.colHi1D, 0, r, o, a.ext1D, a.colOut1D, 0);
			for (let l = 0; l < r; l++) u[l * i + h] = a.colOut1D[l];
		}
	}
}
function hn(t, n, e, s, r, i, o) {
	if (n > 2048 || e > 2048) throw new RangeError(`Tile dimension (${n}x${e}) exceeds MAX_TILE_DIMENSION bounds.`);
	const a = Math.cos(s), u = Math.sin(s), g = 1 / (r !== 0 ? r : 1), f = 1 / (i !== 0 ? i : 1), h = a * g, l = u * g, d = -u * f, m = a * f, p = (n - 1) * .5, w = (e - 1) * .5, y = n - 1, I = e - 1, _ = Math.ceil(Math.abs(d) * p + Math.abs(m - 1) * w) + 6;
	let A = 16;
	for (; A < _;) A <<= 1;
	A > 2048 && (A = 2048);
	const C = A - 1, b = n << 2, B = new Uint8Array(A * b);
	try {
		for (let U = 0; U < e; U++) {
			const G = U * b, R = (U & C) * b;
			B.set(t.subarray(G, G + b), R);
			const O = U - w, S = p + l * O - h * p, H = w + m * O - d * p;
			for (let N = 0; N < n; N++) {
				const k = S + h * N, K = H + d * N, $ = Math.floor(k), Y = Math.floor(K), F = k - $, L = K - Y, T = F * (-.5 + F * (1 - .5 * F)), D = 1 + F * F * (1.5 * F - 2.5), V = F * (.5 + F * (2 - 1.5 * F)), tt = .5 * F * F * (F - 1), E = L * (-.5 + L * (1 - .5 * L)), M = 1 + L * L * (1.5 * L - 2.5), c = L * (.5 + L * (2 - 1.5 * L)), x = .5 * L * L * (L - 1);
				let et = $ - 1, it = $, ct = $ + 1, ut = $ + 2;
				et < 0 ? et = 0 : et > y && (et = y), it < 0 ? it = 0 : it > y && (it = y), ct < 0 ? ct = 0 : ct > y && (ct = y), ut < 0 ? ut = 0 : ut > y && (ut = y);
				const Lt = et << 2, Mt = it << 2, Tt = ct << 2, mt = ut << 2;
				let pt = 0, v = 0, z = 0, ot = 0;
				for (let W = 0; W < 4; W++) {
					let q = Y - 1 + W;
					q < 0 ? q = 0 : q > I && (q = I);
					const j = W === 0 ? E : W === 1 ? M : W === 2 ? c : x, ft = q <= U && U - q < A, P = ft ? B : t, st = ft ? (q & C) * b : q * b, nt = st + Lt, Z = st + Mt, J = st + Tt, Q = st + mt;
					if (o) {
						const lt = P[nt + 3], _t = P[Z + 3], At = P[J + 3], dt = P[Q + 3], at = T * lt, ht = D * _t, Et = V * At, wt = tt * dt;
						pt += j * (P[nt] * at + P[Z] * ht + P[J] * Et + P[Q] * wt), v += j * (P[nt + 1] * at + P[Z + 1] * ht + P[J + 1] * Et + P[Q + 1] * wt), z += j * (P[nt + 2] * at + P[Z + 2] * ht + P[J + 2] * Et + P[Q + 2] * wt), ot += j * (at + ht + Et + wt);
					} else pt += j * (P[nt] * T + P[Z] * D + P[J] * V + P[Q] * tt), v += j * (P[nt + 1] * T + P[Z + 1] * D + P[J + 1] * V + P[Q + 1] * tt), z += j * (P[nt + 2] * T + P[Z + 2] * D + P[J + 2] * V + P[Q + 2] * tt);
				}
				const X = G + (N << 2);
				if (o) {
					const W = rt(ot + .5 | 0);
					if (W === 0) t[X] = 0, t[X + 1] = 0, t[X + 2] = 0, t[X + 3] = 0;
					else {
						const q = 1 / ot;
						t[X] = rt(pt * q + .5 | 0), t[X + 1] = rt(v * q + .5 | 0), t[X + 2] = rt(z * q + .5 | 0), t[X + 3] = W;
					}
				} else t[X] = rt(pt + .5 | 0), t[X + 1] = rt(v + .5 | 0), t[X + 2] = rt(z + .5 | 0), t[X + 3] = 255;
			}
		}
	} finally {
		B.fill(0);
	}
}
function En(t, n = !1) {
	if (t === "standard") return {
		theta: 0,
		sx: 1,
		sy: 1,
		noiseIntensity: 0
	};
	const e = new Uint32Array(/* @__PURE__ */ new ArrayBuffer(16), 0, 4);
	try {
		gn(e);
		const s = 1 / 4294967295, r = e[0] * s, i = e[1] * s, o = e[2] * s, a = e[3] * s, u = n ? 0 : 2, g = .1 + r * .2, f = (a >= .5 ? 1 : -1) * g * Math.PI / 180, h = .995 + i * .004;
		let l = .995 + o * .004;
		const d = h - l;
		return (d < 0 ? -d : d) < 5e-4 && (l = h < .997 ? h + 6e-4 : h - 6e-4), {
			theta: f,
			sx: h,
			sy: l,
			noiseIntensity: u
		};
	} finally {
		e.fill(0);
	}
}
function wn(t, n, e, s = "db4", r = 1, i = 8) {
	if (n <= 0 || e <= 0 || t.length === 0) return {
		normalizedCrossCorrelation: 0,
		psnrDb: 100,
		ssim: 1,
		residualNoiseRms: 0
	};
	const o = n * e, a = t.length >= o * 4 ? 4 : t.length >= o * 3 ? 3 : 1, u = s === "haar", g = r < 0 ? 0 : r, f = Math.min(n, 512), h = Math.min(e, 512), l = un(Math.min(f + 32, 2048), Math.min(h + 32, 2048)), d = n > 512 || e > 512, m = d ? new Uint8Array(t) : t;
	try {
		let p = 0, w = 0, y = 0, I = 0, _ = 0, A = 0, C = 0, b = 0;
		const B = i < 0 ? 0 : i;
		for (let N = 0; N < e; N += 512) {
			const k = Math.min(512, e - N), K = Math.min(16, N), $ = Math.min(16, e - (N + k)), Y = k + K + $, F = N - K;
			for (let L = 0; L < n; L += 512) {
				const T = Math.min(512, n - L), D = Math.min(16, L), V = Math.min(16, n - (L + T)), tt = T + D + V, E = L - D;
				let M = 0;
				for (let v = 0; v < Y; v++) {
					const z = (F + v) * n * a;
					if (a >= 3) for (let X = 0; X < tt; X++) {
						const W = z + (E + X) * a;
						l.rowBuf1D[X] = .299 * m[W] + .587 * m[W + 1] + .114 * m[W + 2] - 127.5;
					}
					else for (let X = 0; X < tt; X++) l.rowBuf1D[X] = m[z + E + X] - 127.5;
					const ot = v * l.maxSubW;
					M = rn(l.rowBuf1D, 0, tt, u, l.ext1D, l.rowLo, ot, l.rowHi, ot);
				}
				const c = Xt(l.rowHi, l.maxSubW, Y, M, u, l, l.subBand0, l.subBand1), x = pn(l.subBand1, M, c, l.subScratch) * g, et = x * x;
				if (et > 0) {
					const v = Bt(l.subBand0, M, c, et, l.subScratch), z = Bt(l.subBand1, M, c, et, l.subScratch);
					I += v.sumOrigPost + z.sumOrigPost, _ += v.sumOrigSq + z.sumOrigSq, A += v.sumPostSq + z.sumPostSq;
				}
				if (vt(l.subBand0, l.subBand1, M, c, Y, l.maxSubW, u, l, l.rowHi), Xt(l.rowLo, l.maxSubW, Y, M, u, l, l.subBand0, l.subBand1), et > 0) {
					const v = Bt(l.subBand1, M, c, et, l.subScratch);
					I += v.sumOrigPost, _ += v.sumOrigSq, A += v.sumPostSq;
				}
				vt(l.subBand0, l.subBand1, M, c, Y, l.maxSubW, u, l, l.rowLo);
				const it = T * k;
				let ct = 0, ut = 0, Lt = 0, Mt = 0, Tt = 0, mt = 0, pt = !1;
				for (let v = 0; v < k; v++) {
					const z = (K + v) * l.maxSubW;
					cn(l.rowLo, z, l.rowHi, z, tt, u, l.ext1D, l.rowBuf1D, 0);
					const ot = (N + v) * n * a;
					for (let X = 0; X < T; X++) {
						const W = l.rowBuf1D[D + X], q = ot + (L + X) * a;
						let j, ft;
						if (a >= 3) {
							const Z = t[q], J = t[q + 1], Q = t[q + 2];
							j = .299 * Z + .587 * J + .114 * Q;
							let lt = W - (j - 127.5);
							lt > B ? lt = B : lt < -B && (lt = -B);
							const _t = Ft(lt), At = rt(Z + _t), dt = rt(J + _t), at = rt(Q + _t);
							t[q] = At, t[q + 1] = dt, t[q + 2] = at;
							const ht = At - Z, Et = dt - J, wt = at - Q;
							p += ht * ht + Et * Et + wt * wt, w += 3, ft = .299 * At + .587 * dt + .114 * at;
						} else {
							const Z = t[q];
							j = Z;
							let J = W - (j - 127.5);
							J > B ? J = B : J < -B && (J = -B);
							const Q = rt(Z + Ft(J));
							t[q] = Q;
							const lt = Q - Z;
							p += lt * lt, w += 1, ft = Q;
						}
						const P = ft - j;
						y += P * P, pt || (mt = j, pt = !0);
						const st = j - mt, nt = ft - mt;
						ct += st, ut += nt, Lt += st * st, Mt += nt * nt, Tt += st * nt;
					}
				}
				if (it > 0) {
					const v = 1 / it, z = ct * v, ot = ut * v, X = mt + z, W = mt + ot, q = Math.max(0, Lt * v - z * z), j = Math.max(0, Mt * v - ot * ot), ft = Tt * v - z * ot, P = 6.5025, st = 58.5225, nt = (2 * X * W + P) * (2 * ft + st), Z = (X * X + W * W + P) * (q + j + st);
					C += Z > 0 ? nt / Z : 1, b++;
				}
			}
		}
		const U = w > 0 ? p / w : 0, G = U <= 1e-9 ? 99.99 : 10 * Math.log10(65025 / U), R = b > 0 ? C / b : 1, O = Math.min(1, R), S = Math.sqrt(y / o), H = Math.sqrt(_ * A);
		return {
			normalizedCrossCorrelation: H > 1e-9 ? Math.max(0, Math.min(1, I / H)) : 0,
			psnrDb: G,
			ssim: O,
			residualNoiseRms: S
		};
	} finally {
		an(l), d && m.fill(0);
	}
}
function _n(t, n, e, s = !0) {
	const r = t.width, i = t.height;
	if (r <= 0 || i <= 0) return;
	const o = t === n;
	o || (n.width !== r && (n.width = r), n.height !== i && (n.height = i));
	const a = n.getContext("2d", {
		willReadFrequently: !0,
		alpha: s
	});
	if (!a) throw new Error("Failed to acquire 2D rendering context on targetCanvas.");
	if (e === "standard") {
		o || a.drawImage(t, 0, 0);
		return;
	}
	o || (a.clearRect(0, 0, r, i), a.drawImage(t, 0, 0, r, i));
	const u = a.getImageData(0, 0, r, i), g = u.data;
	let f = !1;
	try {
		if (s) for (let l = 0; l < g.length; l += 4) g[l + 3] === 0 && (g[l] = 0, g[l + 1] = 0, g[l + 2] = 0);
		const h = En(e, !0);
		if (wn(g, r, i, "db4", e === "paranoid" ? 1.25 : 1, 8), hn(g, r, i, h.theta, h.sx, h.sy, s), !s) {
			const l = r * i * 4;
			for (let d = 3; d < l; d += 4) g[d] = 255;
		}
		a.putImageData(u, 0, 0), f = !0;
	} finally {
		f || g.fill(0);
	}
}
function gt(t) {
	const n = t < 0 ? -t : t;
	return n < 1 ? n * n * (1.5 * n - 2.5) + 1 : n < 2 ? n * n * (-.5 * n + 2.5) - 4 * n + 2 : 0;
}
function An(t, n, e, s, r, i, o = !0) {
	const a = n / r, u = e / i, g = e - 1, f = n - 1;
	let h = 0;
	for (let l = 0; l < i; l++) {
		const d = (l + .5) * u - .5, m = Math.floor(d), p = d - m, w = gt(p + 1), y = gt(p), I = gt(p - 1), _ = gt(p - 2), A = (m - 1 < 0 ? 0 : m - 1 >= e ? g : m - 1) * n, C = (m < 0 ? 0 : m >= e ? g : m) * n, b = (m + 1 < 0 ? 0 : m + 1 >= e ? g : m + 1) * n, B = (m + 2 < 0 ? 0 : m + 2 >= e ? g : m + 2) * n;
		for (let U = 0; U < r; U++) {
			const G = (U + .5) * a - .5, R = Math.floor(G), O = G - R, S = gt(O + 1), H = gt(O), N = gt(O - 1), k = gt(O - 2), K = R - 1 < 0 ? 0 : R - 1 >= n ? f : R - 1, $ = R < 0 ? 0 : R >= n ? f : R, Y = R + 1 < 0 ? 0 : R + 1 >= n ? f : R + 1, F = R + 2 < 0 ? 0 : R + 2 >= n ? f : R + 2;
			let L = 0, T = 0, D = 0, V = 0;
			if (o) {
				if (w !== 0) {
					if (S !== 0) {
						const E = t[A + K], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = S * w * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
					if (H !== 0) {
						const E = t[A + $], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = H * w * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
					if (N !== 0) {
						const E = t[A + Y], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = N * w * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
					if (k !== 0) {
						const E = t[A + F], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = k * w * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
				}
				if (y !== 0) {
					if (S !== 0) {
						const E = t[C + K], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = S * y * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
					if (H !== 0) {
						const E = t[C + $], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = H * y * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
					if (N !== 0) {
						const E = t[C + Y], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = N * y * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
					if (k !== 0) {
						const E = t[C + F], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = k * y * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
				}
				if (I !== 0) {
					if (S !== 0) {
						const E = t[b + K], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = S * I * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
					if (H !== 0) {
						const E = t[b + $], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = H * I * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
					if (N !== 0) {
						const E = t[b + Y], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = N * I * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
					if (k !== 0) {
						const E = t[b + F], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = k * I * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
				}
				if (_ !== 0) {
					if (S !== 0) {
						const E = t[B + K], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = S * _ * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
					if (H !== 0) {
						const E = t[B + $], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = H * _ * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
					if (N !== 0) {
						const E = t[B + Y], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = N * _ * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
					if (k !== 0) {
						const E = t[B + F], M = E >>> 24 & 255;
						if (M !== 0) {
							const c = k * _ * M;
							L += (E & 255) * c, T += (E >> 8 & 255) * c, D += (E >> 16 & 255) * c, V += c;
						}
					}
				}
				const tt = V < 0 ? 0 : V >= 255.5 ? 255 : V + .5 | 0;
				if (tt === 0) s[h++] = 0;
				else {
					const E = 1 / V, M = L * E, c = T * E, x = D * E, et = M < 0 ? 0 : M >= 255.5 ? 255 : M + .5 | 0, it = c < 0 ? 0 : c >= 255.5 ? 255 : c + .5 | 0, ct = x < 0 ? 0 : x >= 255.5 ? 255 : x + .5 | 0;
					s[h++] = et | it << 8 | ct << 16 | tt << 24;
				}
			} else {
				if (w !== 0) {
					if (S !== 0) {
						const c = t[A + K], x = S * w;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
					if (H !== 0) {
						const c = t[A + $], x = H * w;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
					if (N !== 0) {
						const c = t[A + Y], x = N * w;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
					if (k !== 0) {
						const c = t[A + F], x = k * w;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
				}
				if (y !== 0) {
					if (S !== 0) {
						const c = t[C + K], x = S * y;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
					if (H !== 0) {
						const c = t[C + $], x = H * y;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
					if (N !== 0) {
						const c = t[C + Y], x = N * y;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
					if (k !== 0) {
						const c = t[C + F], x = k * y;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
				}
				if (I !== 0) {
					if (S !== 0) {
						const c = t[b + K], x = S * I;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
					if (H !== 0) {
						const c = t[b + $], x = H * I;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
					if (N !== 0) {
						const c = t[b + Y], x = N * I;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
					if (k !== 0) {
						const c = t[b + F], x = k * I;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
				}
				if (_ !== 0) {
					if (S !== 0) {
						const c = t[B + K], x = S * _;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
					if (H !== 0) {
						const c = t[B + $], x = H * _;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
					if (N !== 0) {
						const c = t[B + Y], x = N * _;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
					if (k !== 0) {
						const c = t[B + F], x = k * _;
						L += (c & 255) * x, T += (c >> 8 & 255) * x, D += (c >> 16 & 255) * x;
					}
				}
				const tt = L < 0 ? 0 : L >= 255.5 ? 255 : L + .5 | 0, E = T < 0 ? 0 : T >= 255.5 ? 255 : T + .5 | 0, M = D < 0 ? 0 : D >= 255.5 ? 255 : D + .5 | 0;
				s[h++] = tt | E << 8 | M << 16 | 255 << 24;
			}
		}
	}
}
function dn(t, n = !0) {
	const e = t.width, s = t.height;
	if (e < 4 || s < 4) return;
	const r = Math.max(2, e * .995 + .5 | 0), i = Math.max(2, s * .995 + .5 | 0);
	let o;
	typeof OffscreenCanvas < "u" ? o = new OffscreenCanvas(r, i) : (o = document.createElement("canvas"), o.width = r, o.height = i);
	const a = o.getContext("2d", { willReadFrequently: !0 });
	a.drawImage(t, 0, 0, r, i);
	const u = a.getImageData(0, 0, r, i), g = new Uint32Array(u.data.buffer), f = t.getContext("2d", { willReadFrequently: !0 }), h = f.createImageData(e, s);
	An(g, r, i, new Uint32Array(h.data.buffer), e, s, n), f.putImageData(h, 0, 0);
}
function Rt(t) {
	let n = t[0], e = t[1], s = t[2], r = t[3], i = t[4], o = t[5], a = t[6], u = t[7], g = t[8], f = 0;
	return e > s && (f = e, e = s, s = f), i > o && (f = i, i = o, o = f), u > g && (f = u, u = g, g = f), n > e && (f = n, n = e, e = f), r > i && (f = r, r = i, i = f), a > u && (f = a, a = u, u = f), e > s && (f = e, e = s, s = f), i > o && (f = i, i = o, o = f), u > g && (f = u, u = g, g = f), n > r && (f = n, n = r, r = f), o > g && (f = o, o = g, g = f), i > u && (f = i, i = u, u = f), r > a && (f = r, r = a, a = f), e > i && (f = e, e = i, i = f), s > o && (f = s, s = o, o = f), i > u && (f = i, i = u, u = f), i > s && (f = i, i = s, s = f), a > i && (f = a, a = i, i = f), i > s && (i = s), i;
}
function Gt(t, n, e) {
	const s = t.length, r = new Uint8ClampedArray(s);
	r.set(t);
	const i = /* @__PURE__ */ new Uint8Array(9), o = /* @__PURE__ */ new Uint8Array(9), a = /* @__PURE__ */ new Uint8Array(9), u = n - 1, g = e - 1;
	for (let f = 0; f < e; f++) {
		const h = f * n;
		for (let l = 0; l < n; l++) {
			let d = 0;
			for (let p = -1; p <= 1; p++) {
				const w = (f + p < 0 ? 0 : f + p > g ? g : f + p) * n;
				for (let y = -1; y <= 1; y++) {
					const I = w + (l + y < 0 ? 0 : l + y > u ? u : l + y) << 2;
					i[d] = t[I], o[d] = t[I + 1], a[d] = t[I + 2], d++;
				}
			}
			const m = h + l << 2;
			t[m + 3] === 0 ? (r[m] = 0, r[m + 1] = 0, r[m + 2] = 0) : (r[m] = Rt(i), r[m + 1] = Rt(o), r[m + 2] = Rt(a));
		}
	}
	t.set(r);
}
function In(t, n = !0) {
	const e = t.width, s = t.height;
	if (e < 3 || s < 3) return;
	const r = t.getContext("2d", { willReadFrequently: !0 });
	if (!r) return;
	let i = null, o = null, a = null, u = null, g = null, f = null, h = null;
	try {
		try {
			typeof OffscreenCanvas < "u" ? i = new OffscreenCanvas(e, s) : (i = document.createElement("canvas"), i.width = e, i.height = s);
			const l = {
				alpha: n,
				premultipliedAlpha: !1,
				preserveDrawingBuffer: !0,
				antialias: !1,
				depth: !1,
				stencil: !1
			};
			o = i.getContext("webgl", l);
		} catch {
			o = null;
		}
		if (!o) {
			const l = r.getImageData(0, 0, e, s);
			Gt(l.data, e, s), r.putImageData(l, 0, 0);
			return;
		}
		try {
			const l = `
        attribute vec2 a_position;
        varying vec2 v_texCoord;
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
          v_texCoord = (a_position + 1.0) * 0.5;
        }
      `, d = `
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
          gl_FragColor = ${n ? "a == 0.0 ? vec4(0.0, 0.0, 0.0, 0.0) : vec4(r[4], g[4], b[4], a)" : "vec4(r[4], g[4], b[4], 1.0)"};
        }
      `;
			if (a = o.createShader(o.VERTEX_SHADER), !a) throw new Error("WebGL vertex shader allocation failed");
			if (o.shaderSource(a, l), o.compileShader(a), !o.getShaderParameter(a, o.COMPILE_STATUS)) throw new Error(`WebGL vertex shader compile failed: ${o.getShaderInfoLog(a) || "unknown"}`);
			if (u = o.createShader(o.FRAGMENT_SHADER), !u) throw new Error("WebGL fragment shader allocation failed");
			if (o.shaderSource(u, d), o.compileShader(u), !o.getShaderParameter(u, o.COMPILE_STATUS)) throw new Error(`WebGL fragment shader compile failed: ${o.getShaderInfoLog(u) || "unknown"}`);
			if (g = o.createProgram(), !g) throw new Error("WebGL program allocation failed");
			if (o.attachShader(g, a), o.attachShader(g, u), o.linkProgram(g), !o.getProgramParameter(g, o.LINK_STATUS)) throw new Error(`WebGL program link failed: ${o.getProgramInfoLog(g) || "unknown"}`);
			if (o.useProgram(g), f = o.createBuffer(), !f) throw new Error("WebGL vertex buffer allocation failed");
			o.bindBuffer(o.ARRAY_BUFFER, f), o.bufferData(o.ARRAY_BUFFER, new Float32Array([
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
			const m = o.getAttribLocation(g, "a_position");
			if (m < 0) throw new Error("WebGL attribute a_position unavailable");
			o.enableVertexAttribArray(m), o.vertexAttribPointer(m, 2, o.FLOAT, !1, 0, 0);
			const p = o.getUniformLocation(g, "u_resolution");
			if (!p) throw new Error("WebGL uniform u_resolution unavailable");
			o.uniform2f(p, e, s);
			const w = o.getUniformLocation(g, "u_image");
			if (w && o.uniform1i(w, 0), h = o.createTexture(), !h) throw new Error("WebGL texture allocation failed");
			o.bindTexture(o.TEXTURE_2D, h), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_WRAP_S, o.CLAMP_TO_EDGE), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_WRAP_T, o.CLAMP_TO_EDGE), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_MIN_FILTER, o.NEAREST), o.texParameteri(o.TEXTURE_2D, o.TEXTURE_MAG_FILTER, o.NEAREST), o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL, !0), o.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL, !1), o.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL, o.NONE), o.texImage2D(o.TEXTURE_2D, 0, o.RGBA, o.RGBA, o.UNSIGNED_BYTE, t), o.bindFramebuffer(o.FRAMEBUFFER, null), o.viewport(0, 0, e, s), o.clearColor(0, 0, 0, 0), o.clear(o.COLOR_BUFFER_BIT), o.drawArrays(o.TRIANGLES, 0, 6), r.clearRect(0, 0, e, s), r.drawImage(i, 0, 0);
		} catch {
			const l = r.getImageData(0, 0, e, s);
			Gt(l.data, e, s), r.putImageData(l, 0, 0);
		}
	} finally {
		if (o) try {
			o.bindTexture(o.TEXTURE_2D, null), o.bindBuffer(o.ARRAY_BUFFER, null), o.bindFramebuffer(o.FRAMEBUFFER, null), o.useProgram(null), h && o.deleteTexture(h), f && o.deleteBuffer(f), g && (a && o.detachShader(g, a), u && o.detachShader(g, u), o.deleteProgram(g)), a && o.deleteShader(a), u && o.deleteShader(u), o.getExtension("WEBGL_lose_context")?.loseContext();
		} catch {}
		i && (i.width = 0, i.height = 0);
	}
}
const Ct = 65536;
function ln(t) {
	for (let n = 0; n < t.length; n += Ct) {
		const e = Math.min(Ct, t.length - n);
		globalThis.crypto.getRandomValues(t.subarray(n, n + e));
	}
	return t;
}
function yn(t) {
	let n = t | 0 || 305419896;
	return (e) => {
		for (let s = 0; s < e.length; s++) n ^= n << 13, n ^= n >>> 17, n ^= n << 5, e[s] = n & 255;
		return e;
	};
}
function xn(t, n) {
	const e = t.length >> 2;
	if (e <= 0) return;
	const s = typeof n == "function" ? n : typeof n == "number" ? yn(n) : ln, r = Math.min(e, Ct), i = new Uint8Array(r);
	try {
		let o = 0;
		for (; o < e;) {
			const a = Math.min(r, e - o), u = a === r ? i : i.subarray(0, a);
			s(u);
			for (let g = 0; g < a; g++) {
				const f = u[g], h = o + g << 2;
				if (t[h + 3] === 0) {
					t[h] = 0, t[h + 1] = 0, t[h + 2] = 0;
					continue;
				}
				const l = ((f & 1) === 0 ? 1 : -1) * ((f >>> 1 & 1) + 1), d = ((f >>> 2 & 1) === 0 ? 1 : -1) * ((f >>> 3 & 1) + 1), m = ((f >>> 4 & 1) === 0 ? 1 : -1) * ((f >>> 5 & 1) + 1), p = t[h] + l, w = t[h + 1] + d, y = t[h + 2] + m;
				t[h] = p < 0 ? 0 : p > 255 ? 255 : p, t[h + 1] = w < 0 ? 0 : w > 255 ? 255 : w, t[h + 2] = y < 0 ? 0 : y > 255 ? 255 : y;
			}
			o += a;
		}
	} finally {
		i.fill(0);
	}
}
function Ln(t) {
	let n = 0;
	for (let e = 0; e < t.length; e += 4) t[e + 3] === 0 && (t[e] !== 0 || t[e + 1] !== 0 || t[e + 2] !== 0) && (t[e] = 0, t[e + 1] = 0, t[e + 2] = 0, n++);
	return n;
}
function fn(t, n = !0, e) {
	const s = t.length >> 2, r = {
		hasTransparency: !1,
		pixelsSnappedOpaque: 0,
		pixelsSnappedTransparent: 0,
		pixelsDitheredAlpha: 0,
		pixelsZeroedRgb: 0,
		maxAbsAlphaDelta: 0
	};
	if (s <= 0) return r;
	if (!n) {
		for (let u = 0; u < t.length; u += 4) {
			const g = t[u + 3];
			if (g !== 255) {
				const f = 255 - g;
				f > r.maxAbsAlphaDelta && (r.maxAbsAlphaDelta = f), t[u + 3] = 255, r.pixelsSnappedOpaque++;
			}
		}
		return r;
	}
	const i = e ?? ln, o = Math.min(s, Ct), a = new Uint8Array(o);
	try {
		let u = 0;
		for (; u < s;) {
			const g = Math.min(o, s - u), f = g === o ? a : a.subarray(0, g);
			let h = !1;
			for (let l = 0; l < g; l++) {
				const d = u + l << 2, m = t[d + 3];
				if (m >= 252) {
					if (m !== 255) {
						const p = 255 - m;
						p > r.maxAbsAlphaDelta && (r.maxAbsAlphaDelta = p), t[d + 3] = 255, r.pixelsSnappedOpaque++;
					}
				} else if (m <= 3) r.hasTransparency = !0, m !== 0 && (m > r.maxAbsAlphaDelta && (r.maxAbsAlphaDelta = m), t[d + 3] = 0, r.pixelsSnappedTransparent++), (t[d] !== 0 || t[d + 1] !== 0 || t[d + 2] !== 0) && (t[d] = 0, t[d + 1] = 0, t[d + 2] = 0, r.pixelsZeroedRgb++);
				else {
					h || (i(f), h = !0);
					const p = m & 252 | f[l] & 3;
					t[d + 3] = p, r.hasTransparency = !0, r.pixelsDitheredAlpha++;
					const w = p >= m ? p - m : m - p;
					w > r.maxAbsAlphaDelta && (r.maxAbsAlphaDelta = w);
				}
			}
			u += g;
		}
	} finally {
		a.fill(0);
	}
	return r;
}
function Mn(t, n, e) {
	for (let s = 0; s < e; s += 2) {
		const r = s + 1 < e, i = s * n, o = (s + 1) * n;
		for (let a = 0; a < n; a += 2) {
			const u = a + 1 < n, g = i + a << 2;
			let f = 0, h = 0, l = 0;
			const d = t[g + 3] !== 0;
			let m = 0, p = 0, w = 0, y = 0, I = 0, _ = 0, A = 0, C = !1, b = !1, B = !1;
			if (d) {
				const R = t[g], O = t[g + 1], S = t[g + 2];
				m = .299 * R + .587 * O + .114 * S, h += -.168736 * R - .331264 * O + .5 * S + 128, l += .5 * R - .418688 * O - .081312 * S + 128, f++;
			} else t[g] = 0, t[g + 1] = 0, t[g + 2] = 0;
			if (u) if (I = g + 4, C = t[I + 3] !== 0, C) {
				const R = t[I], O = t[I + 1], S = t[I + 2];
				p = .299 * R + .587 * O + .114 * S, h += -.168736 * R - .331264 * O + .5 * S + 128, l += .5 * R - .418688 * O - .081312 * S + 128, f++;
			} else t[I] = 0, t[I + 1] = 0, t[I + 2] = 0;
			if (r) if (_ = o + a << 2, b = t[_ + 3] !== 0, b) {
				const R = t[_], O = t[_ + 1], S = t[_ + 2];
				w = .299 * R + .587 * O + .114 * S, h += -.168736 * R - .331264 * O + .5 * S + 128, l += .5 * R - .418688 * O - .081312 * S + 128, f++;
			} else t[_] = 0, t[_ + 1] = 0, t[_ + 2] = 0;
			if (r && u) if (A = _ + 4, B = t[A + 3] !== 0, B) {
				const R = t[A], O = t[A + 1], S = t[A + 2];
				y = .299 * R + .587 * O + .114 * S, h += -.168736 * R - .331264 * O + .5 * S + 128, l += .5 * R - .418688 * O - .081312 * S + 128, f++;
			} else t[A] = 0, t[A + 1] = 0, t[A + 2] = 0;
			if (f === 0) continue;
			const U = h / f - 128, G = l / f - 128;
			d && (t[g] = m + 1.402 * G, t[g + 1] = m - .344136 * U - .714136 * G, t[g + 2] = m + 1.772 * U), C && (t[I] = p + 1.402 * G, t[I + 1] = p - .344136 * U - .714136 * G, t[I + 2] = p + 1.772 * U), b && (t[_] = w + 1.402 * G, t[_ + 1] = w - .344136 * U - .714136 * G, t[_ + 2] = w + 1.772 * U), B && (t[A] = y + 1.402 * G, t[A + 1] = y - .344136 * U - .714136 * G, t[A + 2] = y + 1.772 * U);
		}
	}
}
function Tn(t, n = !0) {
	const e = t.getContext("2d", { willReadFrequently: !0 });
	if (e && n) {
		const s = e.getImageData(0, 0, t.width, t.height);
		Ln(s.data) > 0 && e.putImageData(s, 0, 0);
	}
	if (dn(t, n), In(t, n), e) {
		const s = e.getImageData(0, 0, t.width, t.height);
		Mn(s.data, t.width, t.height), xn(s.data), fn(s.data, n), e.putImageData(s, 0, 0);
	}
}
const Dn = 1766015824, bn = 1665684045, Cn = 1732332865, Bn = 1700284774, Rn = 1950701684, Un = 2052348020, Sn = 1767135348, On = 1950960965, Pn = 1883789683, Vt = 1229144912, kt = 1163413830, Ht = 1481461792;
function Nn(t, n) {
	return t.length < 12 ? t : n === "image/png" || t[0] === 137 && t[1] === 80 && t[2] === 78 && t[3] === 71 ? Fn(t) : n === "image/jpeg" || t[0] === 255 && t[1] === 216 ? Xn(t) : n === "image/webp" || t[0] === 82 && t[1] === 73 && t[2] === 70 && t[3] === 70 ? $n(t) : t;
}
function Fn(t) {
	if (t.length < 8) return t;
	const n = new DataView(t.buffer, t.byteOffset, t.byteLength);
	if (n.getUint32(0, !1) !== 2303741511 || n.getUint32(4, !1) !== 218765834) return t;
	const e = new Uint8Array(t.length);
	e.set(t.subarray(0, 8), 0);
	let s = 8, r = 8;
	const i = t.length;
	for (; s + 8 <= i;) {
		const o = n.getUint32(s, !1), a = n.getUint32(s + 4, !1), u = 12 + o;
		if (s + u > i) break;
		a === Dn || a === bn || a === Cn || a === Bn || a === Rn || a === Un || a === Sn || a === On || a === Pn || (e.set(t.subarray(s, s + u), r), r += u), s += u;
	}
	return e.subarray(0, r);
}
function Xn(t) {
	if (t.length < 4 || t[0] !== 255 || t[1] !== 216) return t;
	const n = new Uint8Array(t.length);
	n[0] = 255, n[1] = 216;
	let e = 2, s = 2;
	const r = t.length;
	for (; s < r - 1;) {
		if (t[s] !== 255) {
			n[e++] = t[s++];
			continue;
		}
		const i = t[s + 1];
		if (i === 255 || i === 0) {
			n[e++] = t[s++];
			continue;
		}
		if (i === 217) {
			n[e++] = 255, n[e++] = 217;
			break;
		}
		if (i === 218) {
			const u = t.subarray(s);
			n.set(u, e), e += u.length;
			break;
		}
		if (s + 3 >= r) break;
		const o = 2 + (t[s + 2] << 8 | t[s + 3]);
		if (s + o > r) break;
		let a = !1;
		i === 226 ? s + 15 <= r && t[s + 4] === 73 && t[s + 5] === 67 && t[s + 6] === 67 && t[s + 7] === 95 && t[s + 8] === 80 && t[s + 9] === 82 && t[s + 10] === 79 && t[s + 11] === 70 && t[s + 12] === 73 && t[s + 13] === 76 && t[s + 14] === 69 && t[s + 15] === 0 && (a = !0) : (i === 225 || i === 237 || i === 238 || i === 254 || i >= 227 && i <= 239) && (a = !0), a || (n.set(t.subarray(s, s + o), e), e += o), s += o;
	}
	return n.subarray(0, e);
}
const vn = 1448097880, qt = 1095520328, Gn = 1448097824, Vn = 1448097868, Wt = 1095649613, Yt = 1095650630, kn = 32, Hn = 16, qn = 8, Wn = 4, Yn = 2, zn = 10;
function $n(t) {
	if (t.length < 12) return t;
	const n = new DataView(t.buffer, t.byteOffset, t.byteLength);
	if (n.getUint32(0, !1) !== 1380533830 || n.getUint32(8, !1) !== 1464156752) return t;
	const e = n.getUint32(4, !0), s = e >= 4 ? 8 + e : t.length, r = Math.min(t.length, s);
	let i = null;
	const o = [];
	let a = 12;
	for (; a + 8 <= r;) {
		const _ = n.getUint32(a, !1), A = n.getUint32(a + 4, !0), C = a + 8 + A;
		if (C > r) break;
		const b = C + (A & 1), B = b > r ? r : b;
		_ === vn ? A === zn && i === null && (i = {
			offset: a,
			payloadLen: A,
			type: _
		}) : (_ === qt || _ === Wt || _ === Yt || _ === Gn || _ === Vn) && o.push({
			offset: a,
			payloadLen: A,
			type: _
		}), a = B;
	}
	const u = o.some((_) => _.type === qt), g = o.some((_) => _.type === Wt || _.type === Yt), f = o.some((_) => _.type === Vt), h = o.some((_) => _.type === kt), l = o.some((_) => _.type === Ht), d = (u || g) && i !== null;
	let m = d ? 18 : 0;
	for (const _ of o) m += 8 + _.payloadLen + (_.payloadLen & 1);
	const p = 12 + m, w = new Uint8Array(p);
	w.set(t.subarray(0, 12), 0);
	const y = new DataView(w.buffer, w.byteOffset, w.byteLength);
	let I = 12;
	if (d && i !== null) {
		w.set(t.subarray(i.offset, i.offset + 18), I);
		let A = 0;
		f && (A |= kn), u && (A |= Hn), h && (A |= qn), l && (A |= Wn), g && (A |= Yn), w[I + 8] = A, w[I + 9] = 0, w[I + 10] = 0, w[I + 11] = 0, I += 18;
	}
	for (const _ of o) {
		const A = 8 + _.payloadLen;
		w.set(t.subarray(_.offset, _.offset + A), I), I += A, (_.payloadLen & 1) === 1 && (w[I++] = 0);
	}
	return y.setUint32(4, m + 4, !0), w;
}
const Zn = .02;
function Kn(t, n = Zn, e = 1) {
	const s = 2 * Math.PI, r = 1 / 4294967296, i = /* @__PURE__ */ new Uint32Array(16384);
	let o = 16384;
	const a = t.length - 7;
	let u = 0;
	try {
		for (; u < a; u += 8) {
			o > 16378 && (crypto.getRandomValues(i), o = 0);
			const g = t[u + 3], f = t[u + 7], h = t[u], l = t[u + 1], d = t[u + 2], m = t[u + 4], p = t[u + 5], w = t[u + 6], y = (i[o++] + 1) * r, I = (i[o++] + 1) * r, _ = (i[o++] + 1) * r, A = (i[o++] + 1) * r, C = (i[o++] + 1) * r, b = (i[o++] + 1) * r, B = Math.sqrt(-2 * Math.log(y)), U = Math.sqrt(-2 * Math.log(_)), G = Math.sqrt(-2 * Math.log(C)), R = s * I, O = s * A, S = s * b, H = B * Math.cos(R), N = B * Math.sin(R), k = U * Math.cos(O), K = U * Math.sin(O), $ = G * Math.cos(S), Y = G * Math.sin(S);
			if (g === 0) t[u] = 0, t[u + 1] = 0, t[u + 2] = 0;
			else {
				const F = Math.sqrt(n * (.2126 * h + .7152 * l + .0722 * d) + e), L = h + Math.round(H * F), T = l + Math.round(N * F), D = d + Math.round(k * F);
				t[u] = L < 0 ? 0 : L > 255 ? 255 : L, t[u + 1] = T < 0 ? 0 : T > 255 ? 255 : T, t[u + 2] = D < 0 ? 0 : D > 255 ? 255 : D;
			}
			if (f === 0) t[u + 4] = 0, t[u + 5] = 0, t[u + 6] = 0;
			else {
				const F = Math.sqrt(n * (.2126 * m + .7152 * p + .0722 * w) + e), L = m + Math.round(K * F), T = p + Math.round($ * F), D = w + Math.round(Y * F);
				t[u + 4] = L < 0 ? 0 : L > 255 ? 255 : L, t[u + 5] = T < 0 ? 0 : T > 255 ? 255 : T, t[u + 6] = D < 0 ? 0 : D > 255 ? 255 : D;
			}
		}
		if (u < t.length) if (t[u + 3] === 0) t[u] = 0, t[u + 1] = 0, t[u + 2] = 0;
		else {
			o > 16380 && (crypto.getRandomValues(i), o = 0);
			const g = t[u], f = t[u + 1], h = t[u + 2], l = (i[o++] + 1) * r, d = (i[o++] + 1) * r, m = (i[o++] + 1) * r, p = (i[o++] + 1) * r, w = Math.sqrt(-2 * Math.log(l)), y = Math.sqrt(-2 * Math.log(m)), I = w * Math.cos(s * d), _ = w * Math.sin(s * d), A = y * Math.cos(s * p), C = Math.sqrt(n * (.2126 * g + .7152 * f + .0722 * h) + e), b = g + Math.round(I * C), B = f + Math.round(_ * C), U = h + Math.round(A * C);
			t[u] = b < 0 ? 0 : b > 255 ? 255 : b, t[u + 1] = B < 0 ? 0 : B > 255 ? 255 : B, t[u + 2] = U < 0 ? 0 : U > 255 ? 255 : U;
		}
	} finally {
		i.fill(0);
	}
}
function xt(t) {
	if (t instanceof Error && t.name === "AbortError") return t;
	const n = new Error(typeof t == "string" && t.length > 0 ? t : "Image processing aborted");
	return n.name = "AbortError", n;
}
async function jn(t, n, e) {
	if (e?.aborted) throw xt(e.reason);
	const s = await t();
	let r = !0, i = !1;
	const o = {
		bitmap: s,
		releaseOwnership() {
			return r = !1, s;
		}
	};
	try {
		if (e?.aborted) throw xt(e.reason);
		return await n(o);
	} finally {
		r && !i && (i = !0, s.close());
	}
}
const Jn = 16384, Qn = 64e6, te = 512;
var Dt = class extends RangeError {
	code;
	width;
	height;
	format;
	constructor(t, n, e) {
		super(n), this.name = "ImageDecompressionGuardError", this.code = t, this.width = e?.width, this.height = e?.height, this.format = e?.format;
	}
};
function ne(t, n) {
	if (t.byteLength < 24 || n.getUint32(0, !1) !== 2303741511 || n.getUint32(4, !1) !== 218765834) return null;
	const e = n.getUint32(8, !1), s = n.getUint32(12, !1);
	return e !== 13 || s !== 1229472850 ? null : {
		format: "png",
		width: n.getUint32(16, !1),
		height: n.getUint32(20, !1)
	};
}
function ee(t) {
	return t >= 192 && t <= 195 || t >= 197 && t <= 199 || t >= 201 && t <= 203 || t >= 205 && t <= 207;
}
function oe(t) {
	return t === 1 || t >= 208 && t <= 217;
}
function se(t) {
	const n = t.byteLength;
	if (n < 4 || t[0] !== 255 || t[1] !== 216) return null;
	let e = 2;
	for (; e < n;) {
		if (t[e] !== 255) return null;
		for (; e < n && t[e] === 255;) e++;
		if (e >= n) return null;
		const s = t[e++];
		if (s === 0 || s === 217 || s === 218) return null;
		if (oe(s)) continue;
		if (e + 2 > n) return null;
		const r = t[e] << 8 | t[e + 1];
		if (r < 2 || e + r > n) return null;
		if (ee(s)) {
			if (r < 7) return null;
			const i = t[e + 3] << 8 | t[e + 4];
			return {
				format: "jpeg",
				width: t[e + 5] << 8 | t[e + 6],
				height: i
			};
		}
		e += r;
	}
	return null;
}
function re(t, n) {
	const e = t.byteLength;
	if (e < 20 || n.getUint32(0, !1) !== 1380533830 || n.getUint32(8, !1) !== 1464156752) return null;
	const s = n.getUint32(12, !1), r = n.getUint32(16, !0);
	if (20 + r > e) return null;
	if (s === 1448097880) return r < 10 || e < 30 ? null : {
		format: "webp",
		width: 1 + (t[24] | t[25] << 8 | t[26] << 16),
		height: 1 + (t[27] | t[28] << 8 | t[29] << 16)
	};
	if (s === 1448097824) return r < 10 || e < 30 || (t[20] & 1) !== 0 || t[23] !== 157 || t[24] !== 1 || t[25] !== 42 ? null : {
		format: "webp",
		width: n.getUint16(26, !0) & 16383,
		height: n.getUint16(28, !0) & 16383
	};
	if (s === 1448097868) {
		if (r < 5 || e < 25 || t[20] !== 47) return null;
		const i = n.getUint32(21, !0);
		return {
			format: "webp",
			width: (i & 16383) + 1,
			height: (i >>> 14 & 16383) + 1
		};
	}
	return null;
}
function ie(t, n) {
	return t.byteLength < 10 || t[0] !== 71 || t[1] !== 73 || t[2] !== 70 || t[3] !== 56 || t[4] !== 55 && t[4] !== 57 || t[5] !== 97 ? null : {
		format: "gif",
		width: n.getUint16(6, !0),
		height: n.getUint16(8, !0)
	};
}
function ce(t, n) {
	const e = t.byteLength;
	if (e < 22 || t[0] !== 66 || t[1] !== 77) return null;
	const s = n.getUint32(14, !0);
	if (s === 12) return e < 22 ? null : {
		format: "bmp",
		width: n.getUint16(18, !0),
		height: n.getUint16(20, !0)
	};
	if (s >= 40) {
		if (e < 26) return null;
		const r = n.getInt32(18, !0), i = n.getInt32(22, !0);
		return r <= 0 || i === 0 || i === -2147483648 ? null : {
			format: "bmp",
			width: r,
			height: Math.abs(i)
		};
	}
	return null;
}
function le(t, n) {
	const e = t.byteLength;
	if (e < 8) return null;
	let s;
	if (t[0] === 73 && t[1] === 73 && t[2] === 42 && t[3] === 0) s = !0;
	else if (t[0] === 77 && t[1] === 77 && t[2] === 0 && t[3] === 42) s = !1;
	else return null;
	const r = n.getUint32(4, s);
	if (r < 8 || r + 2 > e) return null;
	const i = n.getUint16(r, s);
	if (i === 0 || i > te || r + 2 + i * 12 > e) return null;
	let o = null, a = null;
	for (let u = 0; u < i; u++) {
		const g = r + 2 + u * 12, f = n.getUint16(g, s);
		if (f !== 256 && f !== 257) continue;
		const h = n.getUint16(g + 2, s);
		if (n.getUint32(g + 4, s) !== 1) return null;
		let l;
		if (h === 3) l = n.getUint16(g + 8, s);
		else if (h === 4) l = n.getUint32(g + 8, s);
		else return null;
		if (f === 256 ? o = l : a = l, o !== null && a !== null) break;
	}
	return o === null || a === null ? null : {
		format: "tiff",
		width: o,
		height: a
	};
}
function fe(t) {
	const n = t instanceof Uint8Array ? t : new Uint8Array(t);
	if (n.byteLength < 4) return null;
	const e = new DataView(n.buffer, n.byteOffset, n.byteLength);
	return n[0] === 137 && n[1] === 80 && n[2] === 78 && n[3] === 71 ? ne(n, e) : n[0] === 255 && n[1] === 216 ? se(n) : n[0] === 82 && n[1] === 73 && n[2] === 70 && n[3] === 70 ? re(n, e) : n[0] === 71 && n[1] === 73 && n[2] === 70 && n[3] === 56 ? ie(n, e) : n[0] === 66 && n[1] === 77 ? ce(n, e) : n[0] === 73 && n[1] === 73 && n[2] === 42 && n[3] === 0 || n[0] === 77 && n[1] === 77 && n[2] === 0 && n[3] === 42 ? le(n, e) : null;
}
function ue(t, n = Jn, e = Qn) {
	const s = fe(t);
	if (!s) throw new Dt("UNSUPPORTED_OR_INVALID_IMAGE_HEADER", "Unable to verify image header dimensions before decode; rejecting malformed or unsupported image container.");
	const { format: r, width: i, height: o } = s;
	if (!Number.isSafeInteger(i) || !Number.isSafeInteger(o) || i <= 0 || o <= 0) throw new Dt("INVALID_IMAGE_DIMENSIONS", `Invalid ${r.toUpperCase()} header dimensions: ${i}x${o}`, {
		width: i,
		height: o,
		format: r
	});
	if (i > n || o > n) throw new Dt("IMAGE_DIMENSION_LIMIT_EXCEEDED", `${r.toUpperCase()} dimension ${i}x${o} exceeds safe pre-decode limit ${n}px`, {
		width: i,
		height: o,
		format: r
	});
	const a = i * o;
	if (!Number.isSafeInteger(a) || a > e) throw new Dt("IMAGE_PIXEL_COUNT_LIMIT_EXCEEDED", `${r.toUpperCase()} pixel count ${a} (${i}x${o}) exceeds safe pre-decode limit ${e}`, {
		width: i,
		height: o,
		format: r
	});
	return s;
}
const yt = 1920, ae = .6;
async function ge(t, n, e) {
	const { buffer: s, mimeType: r, options: i, needsAlpha: o } = t;
	if (e?.aborted) throw xt(e.reason);
	ue(s);
	const a = new Blob([s], { type: r }), u = await jn(() => createImageBitmap(a), ({ bitmap: A }) => {
		const C = A.width, b = A.height;
		if (C <= 0 || b <= 0) throw new Error("INVALID_IMAGE_DIMENSIONS");
		const B = Math.max(C, b), U = B > yt ? Math.max(1, Math.round(C * yt / B)) : C, G = B > yt ? Math.max(1, Math.round(b * yt / B)) : b, R = new OffscreenCanvas(U, G), O = R.getContext("2d", {
			alpha: o,
			willReadFrequently: !0
		});
		if (!O) throw new Error("WORKER_CONTEXT_FAILED");
		return B > yt && (O.imageSmoothingEnabled = !0, O.imageSmoothingQuality = "high"), O.drawImage(A, 0, 0, U, G), {
			width: U,
			height: G,
			canvas: R,
			ctx: O
		};
	}, e);
	if (e?.aborted) throw xt(e.reason);
	n?.(35);
	const { width: g, height: f, canvas: h, ctx: l } = u;
	_n(h, h, i.defenseLevel === "standard" ? "hardened" : i.defenseLevel, o), n?.(55), Tn(h, o), n?.(70);
	const m = l.getImageData(0, 0, g, f);
	Kn(m.data);
	const p = fn(m.data, o);
	if (l.putImageData(m, 0, 0), e?.aborted) throw xt(e.reason);
	let w = h;
	if (o && !p.hasTransparency) {
		const A = new OffscreenCanvas(g, f), C = A.getContext("2d", { alpha: !1 });
		C && (C.drawImage(h, 0, 0), w = A);
	}
	n?.(80);
	const y = await w.convertToBlob({
		type: "image/webp",
		quality: ae
	});
	if (y.type !== "image/webp") throw new Error("WEBP_ENCODE_UNSUPPORTED");
	const I = new Uint8Array(await y.arrayBuffer());
	n?.(90);
	let _ = null;
	try {
		_ = Nn(I, "image/webp");
		const A = new Uint8Array(_.byteLength);
		return A.set(_), {
			buffer: A.buffer,
			tilesProcessed: 1
		};
	} finally {
		I.fill(0), _ && _.fill(0);
	}
}
typeof self < "u" && (self.onmessage = async (t) => {
	try {
		const n = await ge(t.data, (e) => {
			self.postMessage({
				type: "progress",
				percent: e
			});
		});
		self.postMessage(n, [n.buffer]);
	} catch (n) {
		self.postMessage({ error: n?.message || "Worker processing failed" });
	}
});

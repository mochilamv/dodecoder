function At(t, n = !1) {
	if (t === "standard") return {
		theta: 0,
		sx: 1,
		sy: 1,
		noiseIntensity: 0
	};
	const c = /* @__PURE__ */ new Uint32Array(3);
	crypto.getRandomValues(c);
	const s = .1 + c[0] / 4294967295 * .2, l = (c[0] % 2 === 0 ? 1 : -1) * (s * Math.PI) / 180, e = .995 + c[1] / 4294967295 * .004;
	let i = .995 + c[2] / 4294967295 * .004;
	return e - i > -5e-4 && e - i < 5e-4 && (i = e < .997 ? e + 6e-4 : e - 6e-4), {
		theta: l,
		sx: e,
		sy: i,
		noiseIntensity: n ? 0 : 2
	};
}
function et(t) {
	const n = t < 0 ? -t : t;
	return n < 1 ? n * n * (1.5 * n - 2.5) + 1 : n < 2 ? n * n * (-.5 * n + 2.5) - 4 * n + 2 : 0;
}
function Pt(t, n, c, s = !0, l = !1) {
	const e = t.width, i = t.height;
	if (c === "standard") {
		n.width = e, n.height = i, n.getContext("2d", {
			willReadFrequently: !0,
			alpha: s
		}).drawImage(t, 0, 0);
		return;
	}
	const h = At(c, l), r = new OffscreenCanvas(e, i).getContext("2d", { willReadFrequently: !0 });
	r.drawImage(t, 0, 0);
	const w = r.getImageData(0, 0, e, i), o = new Uint32Array(w.data.buffer), p = 3, x = e - 6, m = i - 6;
	n.width = x, n.height = m;
	const d = n.getContext("2d", {
		willReadFrequently: !0,
		alpha: s
	}), I = d.createImageData(x, m), O = new Uint32Array(I.data.buffer), T = Math.cos(h.theta), U = Math.sin(h.theta), F = h.sx * T, L = -h.sy * U, E = h.sx * U, _ = h.sy * T, C = F * _ - L * E, M = _ / C, D = -L / C, y = -E / C, B = F / C, X = e * .5, W = i * .5, V = /* @__PURE__ */ new Uint32Array(1);
	crypto.getRandomValues(V);
	let v = V[0] || 305419896;
	const z = i - 1, N = e - 1;
	let H = 0;
	const Z = h.noiseIntensity > 0;
	for (let b = 0; b < m; b++) {
		const A = b + p - W, P = -X + p;
		let R = P * M + A * D + X, J = P * y + A * B + W;
		for (let ft = 0; ft < x; ft++) {
			const Y = Math.floor(R), j = Math.floor(J), f = R - Y, a = J - j, K = et(f + 1), Q = et(f), $ = et(f - 1), tt = et(f - 2), st = et(a + 1), ct = et(a), rt = et(a - 1), it = et(a - 2), at = (j - 1 < 0 ? 0 : j - 1 > z ? z : j - 1) * e, lt = (j < 0 ? 0 : j > z ? z : j) * e, ut = (j + 1 < 0 ? 0 : j + 1 > z ? z : j + 1) * e, gt = (j + 2 < 0 ? 0 : j + 2 > z ? z : j + 2) * e, ht = Y - 1 < 0 ? 0 : Y - 1 > N ? N : Y - 1, wt = Y < 0 ? 0 : Y > N ? N : Y, pt = Y + 1 < 0 ? 0 : Y + 1 > N ? N : Y + 1, yt = Y + 2 < 0 ? 0 : Y + 2 > N ? N : Y + 2;
			let k = 0, q = 0, G = 0, S = 0;
			if (st !== 0) {
				if (K !== 0) {
					const u = o[at + ht], g = K * st;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
				if (Q !== 0) {
					const u = o[at + wt], g = Q * st;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
				if ($ !== 0) {
					const u = o[at + pt], g = $ * st;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
				if (tt !== 0) {
					const u = o[at + yt], g = tt * st;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
			}
			if (ct !== 0) {
				if (K !== 0) {
					const u = o[lt + ht], g = K * ct;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
				if (Q !== 0) {
					const u = o[lt + wt], g = Q * ct;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
				if ($ !== 0) {
					const u = o[lt + pt], g = $ * ct;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
				if (tt !== 0) {
					const u = o[lt + yt], g = tt * ct;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
			}
			if (rt !== 0) {
				if (K !== 0) {
					const u = o[ut + ht], g = K * rt;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
				if (Q !== 0) {
					const u = o[ut + wt], g = Q * rt;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
				if ($ !== 0) {
					const u = o[ut + pt], g = $ * rt;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
				if (tt !== 0) {
					const u = o[ut + yt], g = tt * rt;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
			}
			if (it !== 0) {
				if (K !== 0) {
					const u = o[gt + ht], g = K * it;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
				if (Q !== 0) {
					const u = o[gt + wt], g = Q * it;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
				if ($ !== 0) {
					const u = o[gt + pt], g = $ * it;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
				if (tt !== 0) {
					const u = o[gt + yt], g = tt * it;
					k += (u & 255) * g, q += (u >> 8 & 255) * g, G += (u >> 16 & 255) * g, S += (u >>> 24 & 255) * g;
				}
			}
			let mt = 0;
			Z && (v ^= v << 13, v ^= v >>> 17, v ^= v << 5, mt = (v & 255) % 5 - 2);
			const dt = k + mt, xt = q + mt, Ct = G + mt, Mt = dt < 0 ? 0 : dt >= 255.5 ? 255 : dt + .5 | 0, bt = xt < 0 ? 0 : xt >= 255.5 ? 255 : xt + .5 | 0, Rt = Ct < 0 ? 0 : Ct >= 255.5 ? 255 : Ct + .5 | 0, Tt = s ? S < 0 ? 0 : S >= 255.5 ? 255 : S + .5 | 0 : 255;
			O[H++] = Mt | bt << 8 | Rt << 16 | Tt << 24, R += M, J += y;
		}
	}
	d.putImageData(I, 0, 0);
}
function nt(t) {
	const n = t < 0 ? -t : t;
	return n < 1 ? n * n * (1.5 * n - 2.5) + 1 : n < 2 ? n * n * (-.5 * n + 2.5) - 4 * n + 2 : 0;
}
function It(t, n, c, s, l, e, i = !0) {
	const h = n / l, r = c / e, w = c - 1, o = n - 1;
	let p = 0;
	for (let x = 0; x < e; x++) {
		const m = (x + .5) * r - .5, d = Math.floor(m), I = m - d, O = nt(I + 1), T = nt(I), U = nt(I - 1), F = nt(I - 2), L = (d - 1 < 0 ? 0 : d - 1 >= c ? w : d - 1) * n, E = (d < 0 ? 0 : d >= c ? w : d) * n, _ = (d + 1 < 0 ? 0 : d + 1 >= c ? w : d + 1) * n, C = (d + 2 < 0 ? 0 : d + 2 >= c ? w : d + 2) * n;
		for (let M = 0; M < l; M++) {
			const D = (M + .5) * h - .5, y = Math.floor(D), B = D - y, X = nt(B + 1), W = nt(B), V = nt(B - 1), v = nt(B - 2), z = y - 1 < 0 ? 0 : y - 1 >= n ? o : y - 1, N = y < 0 ? 0 : y >= n ? o : y, H = y + 1 < 0 ? 0 : y + 1 >= n ? o : y + 1, Z = y + 2 < 0 ? 0 : y + 2 >= n ? o : y + 2;
			let b = 0, A = 0, P = 0, R = 0;
			if (O !== 0) {
				if (X !== 0) {
					const f = t[L + z], a = X * O;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
				if (W !== 0) {
					const f = t[L + N], a = W * O;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
				if (V !== 0) {
					const f = t[L + H], a = V * O;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
				if (v !== 0) {
					const f = t[L + Z], a = v * O;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
			}
			if (T !== 0) {
				if (X !== 0) {
					const f = t[E + z], a = X * T;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
				if (W !== 0) {
					const f = t[E + N], a = W * T;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
				if (V !== 0) {
					const f = t[E + H], a = V * T;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
				if (v !== 0) {
					const f = t[E + Z], a = v * T;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
			}
			if (U !== 0) {
				if (X !== 0) {
					const f = t[_ + z], a = X * U;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
				if (W !== 0) {
					const f = t[_ + N], a = W * U;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
				if (V !== 0) {
					const f = t[_ + H], a = V * U;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
				if (v !== 0) {
					const f = t[_ + Z], a = v * U;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
			}
			if (F !== 0) {
				if (X !== 0) {
					const f = t[C + z], a = X * F;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
				if (W !== 0) {
					const f = t[C + N], a = W * F;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
				if (V !== 0) {
					const f = t[C + H], a = V * F;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
				if (v !== 0) {
					const f = t[C + Z], a = v * F;
					b += (f & 255) * a, A += (f >> 8 & 255) * a, P += (f >> 16 & 255) * a, R += (f >>> 24 & 255) * a;
				}
			}
			const J = b < 0 ? 0 : b >= 255.5 ? 255 : b + .5 | 0, ft = A < 0 ? 0 : A >= 255.5 ? 255 : A + .5 | 0, Y = P < 0 ? 0 : P >= 255.5 ? 255 : P + .5 | 0, j = i ? R < 0 ? 0 : R >= 255.5 ? 255 : R + .5 | 0 : 255;
			s[p++] = J | ft << 8 | Y << 16 | j << 24;
		}
	}
}
function Ut(t, n = !0) {
	const c = t.width, s = t.height;
	if (c < 4 || s < 4) return;
	const l = Math.max(2, c * .995 + .5 | 0), e = Math.max(2, s * .995 + .5 | 0);
	let i;
	typeof OffscreenCanvas < "u" ? i = new OffscreenCanvas(l, e) : (i = document.createElement("canvas"), i.width = l, i.height = e);
	const h = i.getContext("2d", { willReadFrequently: !0 });
	h.drawImage(t, 0, 0, l, e);
	const r = h.getImageData(0, 0, l, e), w = new Uint32Array(r.data.buffer), o = t.getContext("2d", { willReadFrequently: !0 }), p = o.createImageData(c, s);
	It(w, l, e, new Uint32Array(p.data.buffer), c, s, n), o.putImageData(p, 0, 0);
}
function Et(t) {
	let n = t[0], c = t[1], s = t[2], l = t[3], e = t[4], i = t[5], h = t[6], r = t[7], w = t[8], o = 0;
	return c > s && (o = c, c = s, s = o), e > i && (o = e, e = i, i = o), r > w && (o = r, r = w, w = o), n > c && (o = n, n = c, c = o), l > e && (o = l, l = e, e = o), h > r && (o = h, h = r, r = o), c > s && (o = c, c = s, s = o), e > i && (o = e, e = i, i = o), r > w && (o = r, r = w, w = o), n > l && (o = n, n = l, l = o), i > w && (o = i, i = w, w = o), e > r && (o = e, e = r, r = o), l > h && (o = l, l = h, h = o), c > e && (o = c, c = e, e = o), s > i && (o = s, s = i, i = o), e > r && (o = e, e = r, r = o), e > s && (o = e, e = s, s = o), h > e && (o = h, h = e, e = o), e > s && (e = s), e;
}
function _t(t, n, c) {
	const s = t.length, l = new Uint8ClampedArray(s);
	l.set(t);
	const e = /* @__PURE__ */ new Uint8Array(9), i = /* @__PURE__ */ new Uint8Array(9), h = /* @__PURE__ */ new Uint8Array(9), r = n - 1, w = c - 1;
	for (let o = 0; o < c; o++) {
		const p = o * n;
		for (let x = 0; x < n; x++) {
			let m = 0;
			for (let I = -1; I <= 1; I++) {
				const O = (o + I < 0 ? 0 : o + I > w ? w : o + I) * n;
				for (let T = -1; T <= 1; T++) {
					const U = O + (x + T < 0 ? 0 : x + T > r ? r : x + T) << 2;
					e[m] = t[U], i[m] = t[U + 1], h[m] = t[U + 2], m++;
				}
			}
			const d = p + x << 2;
			l[d] = Et(e), l[d + 1] = Et(i), l[d + 2] = Et(h);
		}
	}
	t.set(l);
}
function Dt(t) {
	const n = t.width, c = t.height;
	if (n < 3 || c < 3) return;
	const s = t.getContext("2d", { willReadFrequently: !0 });
	if (!s) return;
	let l = null, e = null;
	try {
		typeof OffscreenCanvas < "u" ? l = new OffscreenCanvas(n, c) : (l = document.createElement("canvas"), l.width = n, l.height = c), e = l.getContext("webgl");
	} catch {
		e = null;
	}
	if (!e) {
		const i = s.getImageData(0, 0, n, c);
		_t(i.data, n, c), s.putImageData(i, 0, 0);
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
    `, h = `
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
    `, r = e.createShader(e.VERTEX_SHADER);
		e.shaderSource(r, i), e.compileShader(r);
		const w = e.createShader(e.FRAGMENT_SHADER);
		e.shaderSource(w, h), e.compileShader(w);
		const o = e.createProgram();
		e.attachShader(o, r), e.attachShader(o, w), e.linkProgram(o), e.useProgram(o);
		const p = e.createBuffer();
		e.bindBuffer(e.ARRAY_BUFFER, p), e.bufferData(e.ARRAY_BUFFER, new Float32Array([
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
		]), e.STATIC_DRAW);
		const x = e.getAttribLocation(o, "a_position");
		e.enableVertexAttribArray(x), e.vertexAttribPointer(x, 2, e.FLOAT, !1, 0, 0);
		const m = e.getUniformLocation(o, "u_resolution");
		e.uniform2f(m, n, c);
		const d = e.createTexture();
		e.bindTexture(e.TEXTURE_2D, d), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, t), e.viewport(0, 0, n, c), e.drawArrays(e.TRIANGLES, 0, 6), s.drawImage(l, 0, 0);
	} catch {
		const i = s.getImageData(0, 0, n, c);
		_t(i.data, n, c), s.putImageData(i, 0, 0);
	}
}
function Bt(t, n = 1597463007) {
	let c = n || 305419896;
	const s = t.length;
	for (let l = 0; l < s; l += 4) {
		c ^= c << 13, c ^= c >>> 17, c ^= c << 5;
		const e = ((c & 1) === 0 ? 1 : -1) * ((c >>> 1 & 1) + 1), i = ((c >>> 2 & 1) === 0 ? 1 : -1) * ((c >>> 3 & 1) + 1), h = ((c >>> 4 & 1) === 0 ? 1 : -1) * ((c >>> 5 & 1) + 1);
		let r = t[l] + e, w = t[l + 1] + i, o = t[l + 2] + h;
		t[l] = r < 0 ? 0 : r > 255 ? 255 : r, t[l + 1] = w < 0 ? 0 : w > 255 ? 255 : w, t[l + 2] = o < 0 ? 0 : o > 255 ? 255 : o;
	}
}
function Ot(t, n, c) {
	for (let s = 0; s < c; s += 2) {
		const l = s + 1 < c, e = s * n, i = (s + 1) * n;
		for (let h = 0; h < n; h += 2) {
			const r = h + 1 < n, w = e + h << 2;
			let o = 1;
			const p = t[w], x = t[w + 1], m = t[w + 2], d = .299 * p + .587 * x + .114 * m;
			let I = -.168736 * p - .331264 * x + .5 * m + 128, O = .5 * p - .418688 * x - .081312 * m + 128, T = 0, U = 0, F = 0, L = 0, E = 0, _ = 0;
			if (r) {
				L = w + 4;
				const D = t[L], y = t[L + 1], B = t[L + 2];
				T = .299 * D + .587 * y + .114 * B, I += -.168736 * D - .331264 * y + .5 * B + 128, O += .5 * D - .418688 * y - .081312 * B + 128, o++;
			}
			if (l) {
				E = i + h << 2;
				const D = t[E], y = t[E + 1], B = t[E + 2];
				U = .299 * D + .587 * y + .114 * B, I += -.168736 * D - .331264 * y + .5 * B + 128, O += .5 * D - .418688 * y - .081312 * B + 128, o++;
			}
			if (l && r) {
				_ = E + 4;
				const D = t[_], y = t[_ + 1], B = t[_ + 2];
				F = .299 * D + .587 * y + .114 * B, I += -.168736 * D - .331264 * y + .5 * B + 128, O += .5 * D - .418688 * y - .081312 * B + 128, o++;
			}
			const C = I / o - 128, M = O / o - 128;
			t[w] = d + 1.402 * M, t[w + 1] = d - .344136 * C - .714136 * M, t[w + 2] = d + 1.772 * C, r && (t[L] = T + 1.402 * M, t[L + 1] = T - .344136 * C - .714136 * M, t[L + 2] = T + 1.772 * C), l && (t[E] = U + 1.402 * M, t[E + 1] = U - .344136 * C - .714136 * M, t[E + 2] = U + 1.772 * C), l && r && (t[_] = F + 1.402 * M, t[_ + 1] = F - .344136 * C - .714136 * M, t[_ + 2] = F + 1.772 * C);
		}
	}
}
function Ft(t, n = !0) {
	Ut(t, n), Dt(t);
	const c = t.getContext("2d", { willReadFrequently: !0 });
	if (c) {
		const s = c.getImageData(0, 0, t.width, t.height);
		Ot(s.data, t.width, t.height), Bt(s.data), c.putImageData(s, 0, 0);
	}
}
const Lt = 1766015824, vt = 1665684045, St = 1732332865, Xt = 1700284774, Nt = 1950701684, kt = 2052348020, qt = 1767135348, Gt = 1950960965, Wt = 1883789683, Vt = 1229144912, zt = 1163413830, Yt = 1481461792;
function jt(t, n) {
	return t.length < 12 ? t : n === "image/png" || t[0] === 137 && t[1] === 80 && t[2] === 78 && t[3] === 71 ? Ht(t) : n === "image/jpeg" || t[0] === 255 && t[1] === 216 ? Zt(t) : n === "image/webp" || t[0] === 82 && t[1] === 73 && t[2] === 70 && t[3] === 70 ? ne(t) : t;
}
function Ht(t) {
	if (t.length < 8) return t;
	const n = new DataView(t.buffer, t.byteOffset, t.byteLength);
	if (n.getUint32(0, !1) !== 2303741511 || n.getUint32(4, !1) !== 218765834) return t;
	const c = new Uint8Array(t.length);
	c.set(t.subarray(0, 8), 0);
	let s = 8, l = 8;
	const e = t.length;
	for (; s + 8 <= e;) {
		const i = n.getUint32(s, !1), h = n.getUint32(s + 4, !1), r = 12 + i;
		if (s + r > e) break;
		h === Lt || h === vt || h === St || h === Xt || h === Nt || h === kt || h === qt || h === Gt || h === Wt || (c.set(t.subarray(s, s + r), l), l += r), s += r;
	}
	return c.subarray(0, l);
}
function Zt(t) {
	if (t.length < 4 || t[0] !== 255 || t[1] !== 216) return t;
	const n = new Uint8Array(t.length);
	n[0] = 255, n[1] = 216;
	let c = 2, s = 2;
	const l = t.length;
	for (; s < l - 1;) {
		if (t[s] !== 255) {
			n[c++] = t[s++];
			continue;
		}
		const e = t[s + 1];
		if (e === 255 || e === 0) {
			n[c++] = t[s++];
			continue;
		}
		if (e === 217) {
			n[c++] = 255, n[c++] = 217;
			break;
		}
		if (e === 218) {
			const r = t.subarray(s);
			n.set(r, c), c += r.length;
			break;
		}
		if (s + 3 >= l) break;
		const i = 2 + (t[s + 2] << 8 | t[s + 3]);
		if (s + i > l) break;
		let h = !1;
		e === 226 ? s + 15 <= l && t[s + 4] === 73 && t[s + 5] === 67 && t[s + 6] === 67 && t[s + 7] === 95 && t[s + 8] === 80 && t[s + 9] === 82 && t[s + 10] === 79 && t[s + 11] === 70 && t[s + 12] === 73 && t[s + 13] === 76 && t[s + 14] === 69 && t[s + 15] === 0 && (h = !0) : (e === 225 || e === 237 || e === 238 || e === 254 || e >= 227 && e <= 239) && (h = !0), h || (n.set(t.subarray(s, s + i), c), c += i), s += i;
	}
	return n.subarray(0, c);
}
const Jt = 1448097880, Kt = 1095520328, Qt = 1448097824, $t = 1448097868, te = 1095649613, ee = 1095650630;
function ne(t) {
	if (t.length < 12) return t;
	const n = new DataView(t.buffer, t.byteOffset, t.byteLength);
	if (n.getUint32(0, !1) !== 1380533830 || n.getUint32(8, !1) !== 1464156752) return t;
	let c = !1, s = !1, l = null;
	const e = [];
	let i = 12;
	const h = t.length;
	for (; i + 8 <= h;) {
		const p = n.getUint32(i, !1), x = n.getUint32(i + 4, !0), m = 8 + (x + x % 2);
		if (i + m > h) break;
		p === Kt ? (c = !0, e.push({
			offset: i,
			totalLen: m,
			type: p
		})) : p === te || p === ee ? (s = !0, e.push({
			offset: i,
			totalLen: m,
			type: p
		})) : p === Jt ? l = {
			offset: i,
			totalLen: m
		} : p === Qt || p === $t ? e.push({
			offset: i,
			totalLen: m,
			type: p
		}) : p === Vt || p === zt || p === Yt || e.push({
			offset: i,
			totalLen: m,
			type: p
		}), i += m;
	}
	const r = new Uint8Array(t.length);
	r.set(t.subarray(0, 12), 0);
	const w = new DataView(r.buffer, r.byteOffset, r.byteLength);
	let o = 12;
	if ((c || s) && l) {
		r.set(t.subarray(l.offset, l.offset + l.totalLen), o);
		let p = 0;
		c && (p |= 16), s && (p |= 2), r[o + 8] = p, o += l.totalLen;
	}
	for (const p of e) r.set(t.subarray(p.offset, p.offset + p.totalLen), o), o += p.totalLen;
	return w.setUint32(4, o - 8, !0), r.subarray(0, o);
}
const oe = .02;
function se(t, n = oe, c = 1) {
	const s = 2 * Math.PI, l = 1 / 4294967296, e = /* @__PURE__ */ new Uint32Array(16384);
	let i = 16384;
	const h = t.length - 7;
	let r = 0;
	for (; r < h; r += 8) {
		i > 16378 && (crypto.getRandomValues(e), i = 0);
		const w = t[r], o = t[r + 1], p = t[r + 2], x = t[r + 4], m = t[r + 5], d = t[r + 6], I = (e[i++] + 1) * l, O = (e[i++] + 1) * l, T = (e[i++] + 1) * l, U = (e[i++] + 1) * l, F = (e[i++] + 1) * l, L = (e[i++] + 1) * l, E = Math.sqrt(-2 * Math.log(I)), _ = Math.sqrt(-2 * Math.log(T)), C = Math.sqrt(-2 * Math.log(F)), M = s * O, D = s * U, y = s * L, B = E * Math.cos(M), X = E * Math.sin(M), W = _ * Math.cos(D), V = _ * Math.sin(D), v = C * Math.cos(y), z = C * Math.sin(y), N = Math.sqrt(n * (.2126 * w + .7152 * o + .0722 * p) + c), H = Math.sqrt(n * (.2126 * x + .7152 * m + .0722 * d) + c), Z = w + Math.round(B * N), b = o + Math.round(X * N), A = p + Math.round(W * N);
		t[r] = Z < 0 ? 0 : Z > 255 ? 255 : Z, t[r + 1] = b < 0 ? 0 : b > 255 ? 255 : b, t[r + 2] = A < 0 ? 0 : A > 255 ? 255 : A;
		const P = x + Math.round(V * H), R = m + Math.round(v * H), J = d + Math.round(z * H);
		t[r + 4] = P < 0 ? 0 : P > 255 ? 255 : P, t[r + 5] = R < 0 ? 0 : R > 255 ? 255 : R, t[r + 6] = J < 0 ? 0 : J > 255 ? 255 : J;
	}
	if (r < t.length) {
		i > 16380 && (crypto.getRandomValues(e), i = 0);
		const w = t[r], o = t[r + 1], p = t[r + 2], x = (e[i++] + 1) * l, m = (e[i++] + 1) * l, d = (e[i++] + 1) * l, I = (e[i++] + 1) * l, O = Math.sqrt(-2 * Math.log(x)), T = Math.sqrt(-2 * Math.log(d)), U = O * Math.cos(s * m), F = O * Math.sin(s * m), L = T * Math.cos(s * I), E = Math.sqrt(n * (.2126 * w + .7152 * o + .0722 * p) + c), _ = w + Math.round(U * E), C = o + Math.round(F * E), M = p + Math.round(L * E);
		t[r] = _ < 0 ? 0 : _ > 255 ? 255 : _, t[r + 1] = C < 0 ? 0 : C > 255 ? 255 : C, t[r + 2] = M < 0 ? 0 : M > 255 ? 255 : M;
	}
}
const ot = 2048, ce = .6;
self.onmessage = async (t) => {
	const { buffer: n, mimeType: c, options: s, needsAlpha: l } = t.data;
	try {
		const e = new Blob([n], { type: c }), i = await createImageBitmap(e);
		let h = i.width, r = i.height;
		i.close();
		const w = Math.max(h, r);
		let o = e;
		if (w > 1920) {
			const E = 1920 / w;
			h = Math.round(h * E), r = Math.round(r * E);
			const _ = new OffscreenCanvas(h, r), C = _.getContext("2d", {
				alpha: l,
				willReadFrequently: !0
			}), M = await createImageBitmap(e);
			C.drawImage(M, 0, 0, h, r), M.close(), o = await _.convertToBlob({ type: "image/png" });
		}
		const p = Math.ceil(h / ot), x = Math.ceil(r / ot), m = p * x, d = new OffscreenCanvas(h, r), I = d.getContext("2d", {
			alpha: l,
			willReadFrequently: !0
		});
		if (!I) throw new Error("WORKER_CONTEXT_FAILED");
		let O = 0;
		for (let E = 0; E < x; E++) for (let _ = 0; _ < p; _++) {
			const C = _ * ot, M = E * ot, D = Math.min(ot, h - C), y = Math.min(ot, r - M), B = await createImageBitmap(o, C, M, D, y), X = new OffscreenCanvas(D, y), W = X.getContext("2d", {
				alpha: l,
				willReadFrequently: !0
			});
			Pt(B, X, s.defenseLevel === "standard" ? "hardened" : s.defenseLevel, l, !1), B.close(), Ft(X, l);
			const v = W.getImageData(0, 0, D, y);
			se(v.data), W.putImageData(v, 0, 0), I.drawImage(X, C, M), O++, self.postMessage({
				type: "progress",
				percent: Math.round(25 + O / m * 50)
			});
		}
		self.postMessage({
			type: "progress",
			percent: 80
		});
		const T = await d.convertToBlob({
			type: "image/webp",
			quality: ce
		});
		if (T.type !== "image/webp") throw new Error("WEBP_ENCODE_UNSUPPORTED");
		const U = new Uint8Array(await T.arrayBuffer());
		self.postMessage({
			type: "progress",
			percent: 90
		});
		const F = jt(U, "image/webp"), L = F.buffer.slice(F.byteOffset, F.byteOffset + F.byteLength);
		self.postMessage({
			buffer: L,
			tilesProcessed: m,
			wasmEncoded: !1
		}, [L]);
	} catch (e) {
		self.postMessage({ error: e.message || "Worker processing failed" });
	}
};

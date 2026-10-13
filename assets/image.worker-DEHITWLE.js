var Ot = Object.create, Rt = Object.defineProperty, vt = Object.getOwnPropertyDescriptor, Dt = Object.getOwnPropertyNames, Lt = Object.getPrototypeOf, Pt = Object.prototype.hasOwnProperty, ye = (t, n) => () => (n || (t((n = { exports: {} }).exports, n), t = null), n.exports), Ft = (t, n, s, o) => {
	if (n && typeof n == "object" || typeof n == "function") for (var i = Dt(n), e = 0, l = i.length, w; e < l; e++) w = i[e], !Pt.call(t, w) && w !== s && Rt(t, w, {
		get: ((u) => n[u]).bind(null, w),
		enumerable: !(o = vt(n, w)) || o.enumerable
	});
	return t;
}, Ct = (t, n, s) => (s = t != null ? Ot(Lt(t)) : {}, Ft(n || !t || !t.__esModule || !Pt.call(t, "default") ? Rt(s, "default", {
	value: t,
	enumerable: !0
}) : s, t));
function Bt(t, n = !1) {
	if (t === "standard") return {
		theta: 0,
		sx: 1,
		sy: 1,
		noiseIntensity: 0
	};
	const s = /* @__PURE__ */ new Uint32Array(3);
	crypto.getRandomValues(s);
	const o = .1 + s[0] / 4294967295 * .2, i = (s[0] % 2 === 0 ? 1 : -1) * (o * Math.PI) / 180, e = .995 + s[1] / 4294967295 * .004;
	let l = .995 + s[2] / 4294967295 * .004;
	return e - l > -5e-4 && e - l < 5e-4 && (l = e < .997 ? e + 6e-4 : e - 6e-4), {
		theta: i,
		sx: e,
		sy: l,
		noiseIntensity: n ? 0 : 2
	};
}
function et(t) {
	const n = t < 0 ? -t : t;
	return n < 1 ? n * n * (1.5 * n - 2.5) + 1 : n < 2 ? n * n * (-.5 * n + 2.5) - 4 * n + 2 : 0;
}
function St(t, n, s, o = !0, i = !1) {
	const e = t.width, l = t.height;
	if (s === "standard") {
		n.width = e, n.height = l, n.getContext("2d", {
			willReadFrequently: !0,
			alpha: o
		}).drawImage(t, 0, 0);
		return;
	}
	const w = Bt(s, i), u = new OffscreenCanvas(e, l).getContext("2d", { willReadFrequently: !0 });
	u.drawImage(t, 0, 0);
	const p = u.getImageData(0, 0, e, l), g = new Uint32Array(p.data.buffer), h = 3, y = e - 6, m = l - 6;
	n.width = y, n.height = m;
	const d = n.getContext("2d", {
		willReadFrequently: !0,
		alpha: o
	}), U = d.createImageData(y, m), O = new Uint32Array(U.data.buffer), E = Math.cos(w.theta), T = Math.sin(w.theta), F = w.sx * E, D = -w.sy * T, b = w.sx * T, R = w.sy * E, x = F * R - D * b, I = R / x, v = -D / x, _ = -b / x, L = F / x, G = e * .5, z = l * .5, Y = /* @__PURE__ */ new Uint32Array(1);
	crypto.getRandomValues(Y);
	let S = Y[0] || 305419896;
	const V = l - 1, X = e - 1;
	let H = 0;
	const J = w.noiseIntensity > 0;
	for (let M = 0; M < m; M++) {
		const P = M + h - z, A = -G + h;
		let C = A * I + P * v + G, Z = A * _ + P * L + z;
		for (let at = 0; at < y; at++) {
			const j = Math.floor(C), k = Math.floor(Z), c = C - j, r = Z - k, K = et(c + 1), Q = et(c), $ = et(c - 1), tt = et(c - 2), st = et(r + 1), ct = et(r), rt = et(r - 1), it = et(r - 2), ft = (k - 1 < 0 ? 0 : k - 1 > V ? V : k - 1) * e, lt = (k < 0 ? 0 : k > V ? V : k) * e, ut = (k + 1 < 0 ? 0 : k + 1 > V ? V : k + 1) * e, gt = (k + 2 < 0 ? 0 : k + 2 > V ? V : k + 2) * e, wt = j - 1 < 0 ? 0 : j - 1 > X ? X : j - 1, ht = j < 0 ? 0 : j > X ? X : j, pt = j + 1 < 0 ? 0 : j + 1 > X ? X : j + 1, yt = j + 2 < 0 ? 0 : j + 2 > X ? X : j + 2;
			let N = 0, W = 0, q = 0, B = 0;
			if (st !== 0) {
				if (K !== 0) {
					const a = g[ft + wt], f = K * st;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (Q !== 0) {
					const a = g[ft + ht], f = Q * st;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if ($ !== 0) {
					const a = g[ft + pt], f = $ * st;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (tt !== 0) {
					const a = g[ft + yt], f = tt * st;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
			}
			if (ct !== 0) {
				if (K !== 0) {
					const a = g[lt + wt], f = K * ct;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (Q !== 0) {
					const a = g[lt + ht], f = Q * ct;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if ($ !== 0) {
					const a = g[lt + pt], f = $ * ct;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (tt !== 0) {
					const a = g[lt + yt], f = tt * ct;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
			}
			if (rt !== 0) {
				if (K !== 0) {
					const a = g[ut + wt], f = K * rt;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (Q !== 0) {
					const a = g[ut + ht], f = Q * rt;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if ($ !== 0) {
					const a = g[ut + pt], f = $ * rt;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (tt !== 0) {
					const a = g[ut + yt], f = tt * rt;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
			}
			if (it !== 0) {
				if (K !== 0) {
					const a = g[gt + wt], f = K * it;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (Q !== 0) {
					const a = g[gt + ht], f = Q * it;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if ($ !== 0) {
					const a = g[gt + pt], f = $ * it;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (tt !== 0) {
					const a = g[gt + yt], f = tt * it;
					N += (a & 255) * f, W += (a >> 8 & 255) * f, q += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
			}
			let mt = 0;
			J && (S ^= S << 13, S ^= S >>> 17, S ^= S << 5, mt = (S & 255) % 5 - 2);
			const dt = N + mt, xt = W + mt, bt = q + mt, At = dt < 0 ? 0 : dt >= 255.5 ? 255 : dt + .5 | 0, Tt = xt < 0 ? 0 : xt >= 255.5 ? 255 : xt + .5 | 0, It = bt < 0 ? 0 : bt >= 255.5 ? 255 : bt + .5 | 0, Ut = o ? B < 0 ? 0 : B >= 255.5 ? 255 : B + .5 | 0 : 255;
			O[H++] = At | Tt << 8 | It << 16 | Ut << 24, C += I, Z += _;
		}
	}
	d.putImageData(U, 0, 0);
}
function nt(t) {
	const n = t < 0 ? -t : t;
	return n < 1 ? n * n * (1.5 * n - 2.5) + 1 : n < 2 ? n * n * (-.5 * n + 2.5) - 4 * n + 2 : 0;
}
function Xt(t, n, s, o, i, e, l = !0) {
	const w = n / i, u = s / e, p = s - 1, g = n - 1;
	let h = 0;
	for (let y = 0; y < e; y++) {
		const m = (y + .5) * u - .5, d = Math.floor(m), U = m - d, O = nt(U + 1), E = nt(U), T = nt(U - 1), F = nt(U - 2), D = (d - 1 < 0 ? 0 : d - 1 >= s ? p : d - 1) * n, b = (d < 0 ? 0 : d >= s ? p : d) * n, R = (d + 1 < 0 ? 0 : d + 1 >= s ? p : d + 1) * n, x = (d + 2 < 0 ? 0 : d + 2 >= s ? p : d + 2) * n;
		for (let I = 0; I < i; I++) {
			const v = (I + .5) * w - .5, _ = Math.floor(v), L = v - _, G = nt(L + 1), z = nt(L), Y = nt(L - 1), S = nt(L - 2), V = _ - 1 < 0 ? 0 : _ - 1 >= n ? g : _ - 1, X = _ < 0 ? 0 : _ >= n ? g : _, H = _ + 1 < 0 ? 0 : _ + 1 >= n ? g : _ + 1, J = _ + 2 < 0 ? 0 : _ + 2 >= n ? g : _ + 2;
			let M = 0, P = 0, A = 0, C = 0;
			if (O !== 0) {
				if (G !== 0) {
					const c = t[D + V], r = G * O;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
				if (z !== 0) {
					const c = t[D + X], r = z * O;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
				if (Y !== 0) {
					const c = t[D + H], r = Y * O;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
				if (S !== 0) {
					const c = t[D + J], r = S * O;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
			}
			if (E !== 0) {
				if (G !== 0) {
					const c = t[b + V], r = G * E;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
				if (z !== 0) {
					const c = t[b + X], r = z * E;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
				if (Y !== 0) {
					const c = t[b + H], r = Y * E;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
				if (S !== 0) {
					const c = t[b + J], r = S * E;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
			}
			if (T !== 0) {
				if (G !== 0) {
					const c = t[R + V], r = G * T;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
				if (z !== 0) {
					const c = t[R + X], r = z * T;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
				if (Y !== 0) {
					const c = t[R + H], r = Y * T;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
				if (S !== 0) {
					const c = t[R + J], r = S * T;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
			}
			if (F !== 0) {
				if (G !== 0) {
					const c = t[x + V], r = G * F;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
				if (z !== 0) {
					const c = t[x + X], r = z * F;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
				if (Y !== 0) {
					const c = t[x + H], r = Y * F;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
				if (S !== 0) {
					const c = t[x + J], r = S * F;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, C += (c >>> 24 & 255) * r;
				}
			}
			const Z = M < 0 ? 0 : M >= 255.5 ? 255 : M + .5 | 0, at = P < 0 ? 0 : P >= 255.5 ? 255 : P + .5 | 0, j = A < 0 ? 0 : A >= 255.5 ? 255 : A + .5 | 0, k = l ? C < 0 ? 0 : C >= 255.5 ? 255 : C + .5 | 0 : 255;
			o[h++] = Z | at << 8 | j << 16 | k << 24;
		}
	}
}
function Nt(t, n = !0) {
	const s = t.width, o = t.height;
	if (s < 4 || o < 4) return;
	const i = Math.max(2, s * .995 + .5 | 0), e = Math.max(2, o * .995 + .5 | 0);
	let l;
	typeof OffscreenCanvas < "u" ? l = new OffscreenCanvas(i, e) : (l = document.createElement("canvas"), l.width = i, l.height = e);
	const w = l.getContext("2d", { willReadFrequently: !0 });
	w.drawImage(t, 0, 0, i, e);
	const u = w.getImageData(0, 0, i, e), p = new Uint32Array(u.data.buffer), g = t.getContext("2d", { willReadFrequently: !0 }), h = g.createImageData(s, o);
	Xt(p, i, e, new Uint32Array(h.data.buffer), s, o, n), g.putImageData(h, 0, 0);
}
function Mt(t) {
	for (let n = 1; n < 9; n++) {
		const s = t[n];
		let o = n - 1;
		for (; o >= 0 && t[o] > s;) t[o + 1] = t[o], o--;
		t[o + 1] = s;
	}
}
function Et(t, n, s) {
	const o = t.length, i = new Uint8ClampedArray(o);
	i.set(t);
	const e = /* @__PURE__ */ new Uint8Array(9), l = /* @__PURE__ */ new Uint8Array(9), w = /* @__PURE__ */ new Uint8Array(9), u = n - 1, p = s - 1;
	for (let g = 0; g < s; g++) {
		const h = g * n;
		for (let y = 0; y < n; y++) {
			let m = 0;
			for (let U = -1; U <= 1; U++) {
				const O = (g + U < 0 ? 0 : g + U > p ? p : g + U) * n;
				for (let E = -1; E <= 1; E++) {
					const T = O + (y + E < 0 ? 0 : y + E > u ? u : y + E) << 2;
					e[m] = t[T], l[m] = t[T + 1], w[m] = t[T + 2], m++;
				}
			}
			Mt(e), Mt(l), Mt(w);
			const d = h + y << 2;
			i[d] = e[4], i[d + 1] = l[4], i[d + 2] = w[4];
		}
	}
	t.set(i);
}
function Wt(t) {
	const n = t.width, s = t.height;
	if (n < 3 || s < 3) return;
	const o = t.getContext("2d", { willReadFrequently: !0 });
	if (!o) return;
	let i = null, e = null;
	try {
		typeof OffscreenCanvas < "u" ? i = new OffscreenCanvas(n, s) : (i = document.createElement("canvas"), i.width = n, i.height = s), e = i.getContext("webgl");
	} catch {
		e = null;
	}
	if (!e) {
		const l = o.getImageData(0, 0, n, s);
		Et(l.data, n, s), o.putImageData(l, 0, 0);
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
    `, w = `
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
    `, u = e.createShader(e.VERTEX_SHADER);
		e.shaderSource(u, l), e.compileShader(u);
		const p = e.createShader(e.FRAGMENT_SHADER);
		e.shaderSource(p, w), e.compileShader(p);
		const g = e.createProgram();
		e.attachShader(g, u), e.attachShader(g, p), e.linkProgram(g), e.useProgram(g);
		const h = e.createBuffer();
		e.bindBuffer(e.ARRAY_BUFFER, h), e.bufferData(e.ARRAY_BUFFER, new Float32Array([
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
		const y = e.getAttribLocation(g, "a_position");
		e.enableVertexAttribArray(y), e.vertexAttribPointer(y, 2, e.FLOAT, !1, 0, 0);
		const m = e.getUniformLocation(g, "u_resolution");
		e.uniform2f(m, n, s);
		const d = e.createTexture();
		e.bindTexture(e.TEXTURE_2D, d), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, t), e.viewport(0, 0, n, s), e.drawArrays(e.TRIANGLES, 0, 6), o.drawImage(i, 0, 0);
	} catch {
		const l = o.getImageData(0, 0, n, s);
		Et(l.data, n, s), o.putImageData(l, 0, 0);
	}
}
function qt(t, n = 1597463007) {
	let s = n || 305419896;
	const o = t.length;
	for (let i = 0; i < o; i += 4) {
		s ^= s << 13, s ^= s >>> 17, s ^= s << 5;
		const e = ((s & 1) === 0 ? 1 : -1) * ((s >>> 1 & 1) + 1), l = ((s >>> 2 & 1) === 0 ? 1 : -1) * ((s >>> 3 & 1) + 1), w = ((s >>> 4 & 1) === 0 ? 1 : -1) * ((s >>> 5 & 1) + 1);
		let u = t[i] + e, p = t[i + 1] + l, g = t[i + 2] + w;
		t[i] = u < 0 ? 0 : u > 255 ? 255 : u, t[i + 1] = p < 0 ? 0 : p > 255 ? 255 : p, t[i + 2] = g < 0 ? 0 : g > 255 ? 255 : g;
	}
}
function Gt(t, n, s) {
	for (let o = 0; o < s; o += 2) {
		const i = o + 1 < s, e = o * n, l = (o + 1) * n;
		for (let w = 0; w < n; w += 2) {
			const u = w + 1 < n, p = e + w << 2;
			let g = 1;
			const h = t[p], y = t[p + 1], m = t[p + 2], d = .299 * h + .587 * y + .114 * m;
			let U = -.168736 * h - .331264 * y + .5 * m + 128, O = .5 * h - .418688 * y - .081312 * m + 128, E = 0, T = 0, F = 0, D = 0, b = 0, R = 0;
			if (u) {
				D = p + 4;
				const v = t[D], _ = t[D + 1], L = t[D + 2];
				E = .299 * v + .587 * _ + .114 * L, U += -.168736 * v - .331264 * _ + .5 * L + 128, O += .5 * v - .418688 * _ - .081312 * L + 128, g++;
			}
			if (i) {
				b = l + w << 2;
				const v = t[b], _ = t[b + 1], L = t[b + 2];
				T = .299 * v + .587 * _ + .114 * L, U += -.168736 * v - .331264 * _ + .5 * L + 128, O += .5 * v - .418688 * _ - .081312 * L + 128, g++;
			}
			if (i && u) {
				R = b + 4;
				const v = t[R], _ = t[R + 1], L = t[R + 2];
				F = .299 * v + .587 * _ + .114 * L, U += -.168736 * v - .331264 * _ + .5 * L + 128, O += .5 * v - .418688 * _ - .081312 * L + 128, g++;
			}
			const x = U / g - 128, I = O / g - 128;
			t[p] = d + 1.402 * I, t[p + 1] = d - .344136 * x - .714136 * I, t[p + 2] = d + 1.772 * x, u && (t[D] = E + 1.402 * I, t[D + 1] = E - .344136 * x - .714136 * I, t[D + 2] = E + 1.772 * x), i && (t[b] = T + 1.402 * I, t[b + 1] = T - .344136 * x - .714136 * I, t[b + 2] = T + 1.772 * x), i && u && (t[R] = F + 1.402 * I, t[R + 1] = F - .344136 * x - .714136 * I, t[R + 2] = F + 1.772 * x);
		}
	}
}
function Vt(t, n = !0) {
	Nt(t, n), Wt(t);
	const s = t.getContext("2d", { willReadFrequently: !0 });
	if (s) {
		const o = s.getImageData(0, 0, t.width, t.height);
		Gt(o.data, t.width, t.height), qt(o.data), s.putImageData(o, 0, 0);
	}
}
const jt = 1766015824, kt = 1665684045, zt = 1732332865, Yt = 1700284774, Ht = 1950701684, Jt = 2052348020, Zt = 1767135348, Kt = 1950960965, Qt = 1883789683, $t = 1229144912, te = 1163413830, ee = 1481461792;
function ne(t, n) {
	return t.length < 12 ? t : n === "image/png" || t[0] === 137 && t[1] === 80 && t[2] === 78 && t[3] === 71 ? oe(t) : n === "image/jpeg" || t[0] === 255 && t[1] === 216 ? se(t) : n === "image/webp" || t[0] === 82 && t[1] === 73 && t[2] === 70 && t[3] === 70 ? ue(t) : t;
}
function oe(t) {
	if (t.length < 8) return t;
	const n = new DataView(t.buffer, t.byteOffset, t.byteLength);
	if (n.getUint32(0, !1) !== 2303741511 || n.getUint32(4, !1) !== 218765834) return t;
	const s = new Uint8Array(t.length);
	s.set(t.subarray(0, 8), 0);
	let o = 8, i = 8;
	const e = t.length;
	for (; o + 8 <= e;) {
		const l = n.getUint32(o, !1), w = n.getUint32(o + 4, !1), u = 12 + l;
		if (o + u > e) break;
		w === jt || w === kt || w === zt || w === Yt || w === Ht || w === Jt || w === Zt || w === Kt || w === Qt || (s.set(t.subarray(o, o + u), i), i += u), o += u;
	}
	return s.subarray(0, i);
}
function se(t) {
	if (t.length < 4 || t[0] !== 255 || t[1] !== 216) return t;
	const n = new Uint8Array(t.length);
	n[0] = 255, n[1] = 216;
	let s = 2, o = 2;
	const i = t.length;
	for (; o < i - 1;) {
		if (t[o] !== 255) {
			n[s++] = t[o++];
			continue;
		}
		const e = t[o + 1];
		if (e === 255 || e === 0) {
			n[s++] = t[o++];
			continue;
		}
		if (e === 217) {
			n[s++] = 255, n[s++] = 217;
			break;
		}
		if (e === 218) {
			const u = t.subarray(o);
			n.set(u, s), s += u.length;
			break;
		}
		if (o + 3 >= i) break;
		const l = 2 + (t[o + 2] << 8 | t[o + 3]);
		if (o + l > i) break;
		let w = !1;
		e === 226 ? o + 15 <= i && t[o + 4] === 73 && t[o + 5] === 67 && t[o + 6] === 67 && t[o + 7] === 95 && t[o + 8] === 80 && t[o + 9] === 82 && t[o + 10] === 79 && t[o + 11] === 70 && t[o + 12] === 73 && t[o + 13] === 76 && t[o + 14] === 69 && t[o + 15] === 0 && (w = !0) : (e === 225 || e === 237 || e === 238 || e === 254 || e >= 227 && e <= 239) && (w = !0), w || (n.set(t.subarray(o, o + l), s), s += l), o += l;
	}
	return n.subarray(0, s);
}
const ce = 1448097880, re = 1095520328, ie = 1448097824, ae = 1448097868, fe = 1095649613, le = 1095650630;
function ue(t) {
	if (t.length < 12) return t;
	const n = new DataView(t.buffer, t.byteOffset, t.byteLength);
	if (n.getUint32(0, !1) !== 1380533830 || n.getUint32(8, !1) !== 1464156752) return t;
	let s = !1, o = !1, i = null;
	const e = [];
	let l = 12;
	const w = t.length;
	for (; l + 8 <= w;) {
		const h = n.getUint32(l, !1), y = n.getUint32(l + 4, !0), m = 8 + (y + y % 2);
		if (l + m > w) break;
		h === re ? (s = !0, e.push({
			offset: l,
			totalLen: m,
			type: h
		})) : h === fe || h === le ? (o = !0, e.push({
			offset: l,
			totalLen: m,
			type: h
		})) : h === ce ? i = {
			offset: l,
			totalLen: m
		} : h === ie || h === ae ? e.push({
			offset: l,
			totalLen: m,
			type: h
		}) : h === $t || h === te || h === ee || e.push({
			offset: l,
			totalLen: m,
			type: h
		}), l += m;
	}
	const u = new Uint8Array(t.length);
	u.set(t.subarray(0, 12), 0);
	const p = new DataView(u.buffer, u.byteOffset, u.byteLength);
	let g = 12;
	if ((s || o) && i) {
		u.set(t.subarray(i.offset, i.offset + i.totalLen), g);
		let h = 0;
		s && (h |= 16), o && (h |= 2), u[g + 8] = h, g += i.totalLen;
	}
	for (const h of e) u.set(t.subarray(h.offset, h.offset + h.totalLen), g), g += h.totalLen;
	return p.setUint32(4, g - 8, !0), u.subarray(0, g);
}
const ge = .02;
function we(t, n = ge, s = 1) {
	const o = 2 * Math.PI, i = 1 / 4294967296, e = /* @__PURE__ */ new Uint32Array(16384);
	let l = 16384;
	const w = t.length - 7;
	let u = 0;
	for (; u < w; u += 8) {
		l > 16378 && (crypto.getRandomValues(e), l = 0);
		const p = t[u], g = t[u + 1], h = t[u + 2], y = t[u + 4], m = t[u + 5], d = t[u + 6], U = (e[l++] + 1) * i, O = (e[l++] + 1) * i, E = (e[l++] + 1) * i, T = (e[l++] + 1) * i, F = (e[l++] + 1) * i, D = (e[l++] + 1) * i, b = Math.sqrt(-2 * Math.log(U)), R = Math.sqrt(-2 * Math.log(E)), x = Math.sqrt(-2 * Math.log(F)), I = o * O, v = o * T, _ = o * D, L = b * Math.cos(I), G = b * Math.sin(I), z = R * Math.cos(v), Y = R * Math.sin(v), S = x * Math.cos(_), V = x * Math.sin(_), X = Math.sqrt(n * (.2126 * p + .7152 * g + .0722 * h) + s), H = Math.sqrt(n * (.2126 * y + .7152 * m + .0722 * d) + s), J = p + Math.round(L * X), M = g + Math.round(G * X), P = h + Math.round(z * X);
		t[u] = J < 0 ? 0 : J > 255 ? 255 : J, t[u + 1] = M < 0 ? 0 : M > 255 ? 255 : M, t[u + 2] = P < 0 ? 0 : P > 255 ? 255 : P;
		const A = y + Math.round(Y * H), C = m + Math.round(S * H), Z = d + Math.round(V * H);
		t[u + 4] = A < 0 ? 0 : A > 255 ? 255 : A, t[u + 5] = C < 0 ? 0 : C > 255 ? 255 : C, t[u + 6] = Z < 0 ? 0 : Z > 255 ? 255 : Z;
	}
	if (u < t.length) {
		l > 16380 && (crypto.getRandomValues(e), l = 0);
		const p = t[u], g = t[u + 1], h = t[u + 2], y = (e[l++] + 1) * i, m = (e[l++] + 1) * i, d = (e[l++] + 1) * i, U = (e[l++] + 1) * i, O = Math.sqrt(-2 * Math.log(y)), E = Math.sqrt(-2 * Math.log(d)), T = O * Math.cos(o * m), F = O * Math.sin(o * m), D = E * Math.cos(o * U), b = Math.sqrt(n * (.2126 * p + .7152 * g + .0722 * h) + s), R = p + Math.round(T * b), x = g + Math.round(F * b), I = h + Math.round(D * b);
		t[u] = R < 0 ? 0 : R > 255 ? 255 : R, t[u + 1] = x < 0 ? 0 : x > 255 ? 255 : x, t[u + 2] = I < 0 ? 0 : I > 255 ? 255 : I;
	}
}
let _t = null;
async function he() {
	if (_t) return _t;
	let t;
	if (typeof globalThis.process < "u" && globalThis.process?.versions?.node) {
		const s = await import("./__vite-browser-external-zHBftLmc.js").then((e) => Ct(e.default, 1)), o = (await import("./__vite-browser-external-zHBftLmc.js").then((e) => Ct(e.default, 1))).resolve(globalThis.process.cwd(), "src/core/wasm/deterministic_encoder.wasm"), i = s.readFileSync(o);
		t = i.buffer.slice(i.byteOffset, i.byteOffset + i.byteLength);
	} else {
		const s = new URL(new URL("deterministic_encoder-DTQagINg.wasm", import.meta.url).href, "" + import.meta.url).href;
		t = await (await fetch(s)).arrayBuffer();
	}
	const { instance: n } = await WebAssembly.instantiate(t, {});
	return _t = n, _t;
}
async function pe(t, n, s) {
	const { wasm_alloc: o, wasm_free: i, encode_deterministic_webp: e, get_output_len: l, memory: w } = (await he()).exports, u = t.length, p = o(u);
	try {
		new Uint8Array(w.buffer).set(t, p);
		const g = e(n, s, p, u), h = l(), y = new Uint8Array(h);
		return y.set(new Uint8Array(w.buffer, g, h)), y;
	} finally {
		i(p, u);
	}
}
const ot = 2048;
self.onmessage = async (t) => {
	const { buffer: n, mimeType: s, options: o, needsAlpha: i } = t.data;
	try {
		const e = new Blob([n], { type: s }), l = await createImageBitmap(e), w = l.width, u = l.height;
		l.close();
		const p = Math.ceil(w / ot), g = Math.ceil(u / ot), h = p * g, y = new OffscreenCanvas(w, u).getContext("2d", {
			alpha: i,
			willReadFrequently: !0
		});
		if (!y) throw new Error("WORKER_CONTEXT_FAILED");
		let m = 0;
		for (let T = 0; T < g; T++) for (let F = 0; F < p; F++) {
			const D = F * ot, b = T * ot, R = Math.min(ot, w - D), x = Math.min(ot, u - b), I = await createImageBitmap(e, D, b, R, x), v = new OffscreenCanvas(R, x), _ = v.getContext("2d", {
				alpha: i,
				willReadFrequently: !0
			});
			St(I, v, o.defenseLevel === "standard" ? "hardened" : o.defenseLevel, i, !1), I.close(), Vt(v, i);
			const G = _.getImageData(0, 0, R, x);
			we(G.data), _.putImageData(G, 0, 0), y.drawImage(v, D, b), m++, self.postMessage({
				type: "progress",
				percent: Math.round(25 + m / h * 50)
			});
		}
		self.postMessage({
			type: "progress",
			percent: 78
		});
		const U = await pe(y.getImageData(0, 0, w, u).data, w, u);
		self.postMessage({
			type: "progress",
			percent: 90
		});
		const O = ne(U, "image/webp"), E = O.buffer.slice(O.byteOffset, O.byteOffset + O.byteLength);
		self.postMessage({
			buffer: E,
			tilesProcessed: h,
			wasmEncoded: !0
		}, [E]);
	} catch (e) {
		self.postMessage({ error: e.message || "Worker processing failed" });
	}
};
export { ye as t };

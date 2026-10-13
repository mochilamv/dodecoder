var Ot = Object.create, Rt = Object.defineProperty, vt = Object.getOwnPropertyDescriptor, Dt = Object.getOwnPropertyNames, Ft = Object.getPrototypeOf, Pt = Object.prototype.hasOwnProperty, ye = (t, n) => () => (n || (t((n = { exports: {} }).exports, n), t = null), n.exports), Lt = (t, n, s, o) => {
	if (n && typeof n == "object" || typeof n == "function") for (var i = Dt(n), e = 0, u = i.length, g; e < u; e++) g = i[e], !Pt.call(t, g) && g !== s && Rt(t, g, {
		get: ((l) => n[l]).bind(null, g),
		enumerable: !(o = vt(n, g)) || o.enumerable
	});
	return t;
}, Ct = (t, n, s) => (s = t != null ? Ot(Ft(t)) : {}, Lt(n || !t || !t.__esModule || !Pt.call(t, "default") ? Rt(s, "default", {
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
	let u = .995 + s[2] / 4294967295 * .004;
	return e - u > -5e-4 && e - u < 5e-4 && (u = e < .997 ? e + 6e-4 : e - 6e-4), {
		theta: i,
		sx: e,
		sy: u,
		noiseIntensity: n ? 0 : 2
	};
}
function et(t) {
	const n = t < 0 ? -t : t;
	return n < 1 ? n * n * (1.5 * n - 2.5) + 1 : n < 2 ? n * n * (-.5 * n + 2.5) - 4 * n + 2 : 0;
}
function St(t, n, s, o = !0, i = !1) {
	const e = t.width, u = t.height;
	if (s === "standard") {
		n.width = e, n.height = u, n.getContext("2d", {
			willReadFrequently: !0,
			alpha: o
		}).drawImage(t, 0, 0);
		return;
	}
	const g = Bt(s, i), l = new OffscreenCanvas(e, u).getContext("2d", { willReadFrequently: !0 });
	l.drawImage(t, 0, 0);
	const p = l.getImageData(0, 0, e, u), w = new Uint32Array(p.data.buffer), h = 3, y = e - 6, d = u - 6;
	n.width = y, n.height = d;
	const m = n.getContext("2d", {
		willReadFrequently: !0,
		alpha: o
	}), U = m.createImageData(y, d), F = new Uint32Array(U.data.buffer), O = Math.cos(g.theta), R = Math.sin(g.theta), L = g.sx * O, P = -g.sy * R, b = g.sx * R, M = g.sy * O, x = L * M - P * b, T = M / x, D = -P / x, _ = -b / x, v = L / x, G = e * .5, j = u * .5, V = /* @__PURE__ */ new Uint32Array(1);
	crypto.getRandomValues(V);
	let S = V[0] || 305419896;
	const k = u - 1, X = e - 1;
	let H = 0;
	const J = g.noiseIntensity > 0;
	for (let C = 0; C < d; C++) {
		const A = C + h - j, I = -G + h;
		let E = I * T + A * D + G, Z = I * _ + A * v + j;
		for (let at = 0; at < y; at++) {
			const z = Math.floor(E), Y = Math.floor(Z), c = E - z, r = Z - Y, K = et(c + 1), Q = et(c), $ = et(c - 1), tt = et(c - 2), st = et(r + 1), ct = et(r), rt = et(r - 1), it = et(r - 2), ft = (Y - 1 < 0 ? 0 : Y - 1 > k ? k : Y - 1) * e, lt = (Y < 0 ? 0 : Y > k ? k : Y) * e, ut = (Y + 1 < 0 ? 0 : Y + 1 > k ? k : Y + 1) * e, gt = (Y + 2 < 0 ? 0 : Y + 2 > k ? k : Y + 2) * e, wt = z - 1 < 0 ? 0 : z - 1 > X ? X : z - 1, ht = z < 0 ? 0 : z > X ? X : z, pt = z + 1 < 0 ? 0 : z + 1 > X ? X : z + 1, yt = z + 2 < 0 ? 0 : z + 2 > X ? X : z + 2;
			let N = 0, q = 0, W = 0, B = 0;
			if (st !== 0) {
				if (K !== 0) {
					const a = w[ft + wt], f = K * st;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (Q !== 0) {
					const a = w[ft + ht], f = Q * st;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if ($ !== 0) {
					const a = w[ft + pt], f = $ * st;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (tt !== 0) {
					const a = w[ft + yt], f = tt * st;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
			}
			if (ct !== 0) {
				if (K !== 0) {
					const a = w[lt + wt], f = K * ct;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (Q !== 0) {
					const a = w[lt + ht], f = Q * ct;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if ($ !== 0) {
					const a = w[lt + pt], f = $ * ct;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (tt !== 0) {
					const a = w[lt + yt], f = tt * ct;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
			}
			if (rt !== 0) {
				if (K !== 0) {
					const a = w[ut + wt], f = K * rt;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (Q !== 0) {
					const a = w[ut + ht], f = Q * rt;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if ($ !== 0) {
					const a = w[ut + pt], f = $ * rt;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (tt !== 0) {
					const a = w[ut + yt], f = tt * rt;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
			}
			if (it !== 0) {
				if (K !== 0) {
					const a = w[gt + wt], f = K * it;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (Q !== 0) {
					const a = w[gt + ht], f = Q * it;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if ($ !== 0) {
					const a = w[gt + pt], f = $ * it;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
				if (tt !== 0) {
					const a = w[gt + yt], f = tt * it;
					N += (a & 255) * f, q += (a >> 8 & 255) * f, W += (a >> 16 & 255) * f, B += (a >>> 24 & 255) * f;
				}
			}
			let mt = 0;
			J && (S ^= S << 13, S ^= S >>> 17, S ^= S << 5, mt = (S & 255) % 5 - 2);
			const _t = N + mt, xt = q + mt, bt = W + mt, Tt = _t < 0 ? 0 : _t >= 255.5 ? 255 : _t + .5 | 0, At = xt < 0 ? 0 : xt >= 255.5 ? 255 : xt + .5 | 0, It = bt < 0 ? 0 : bt >= 255.5 ? 255 : bt + .5 | 0, Ut = o ? B < 0 ? 0 : B >= 255.5 ? 255 : B + .5 | 0 : 255;
			F[H++] = Tt | At << 8 | It << 16 | Ut << 24, E += T, Z += _;
		}
	}
	m.putImageData(U, 0, 0);
}
function nt(t) {
	const n = t < 0 ? -t : t;
	return n < 1 ? n * n * (1.5 * n - 2.5) + 1 : n < 2 ? n * n * (-.5 * n + 2.5) - 4 * n + 2 : 0;
}
function Xt(t, n, s, o, i, e, u = !0) {
	const g = n / i, l = s / e, p = s - 1, w = n - 1;
	let h = 0;
	for (let y = 0; y < e; y++) {
		const d = (y + .5) * l - .5, m = Math.floor(d), U = d - m, F = nt(U + 1), O = nt(U), R = nt(U - 1), L = nt(U - 2), P = (m - 1 < 0 ? 0 : m - 1 >= s ? p : m - 1) * n, b = (m < 0 ? 0 : m >= s ? p : m) * n, M = (m + 1 < 0 ? 0 : m + 1 >= s ? p : m + 1) * n, x = (m + 2 < 0 ? 0 : m + 2 >= s ? p : m + 2) * n;
		for (let T = 0; T < i; T++) {
			const D = (T + .5) * g - .5, _ = Math.floor(D), v = D - _, G = nt(v + 1), j = nt(v), V = nt(v - 1), S = nt(v - 2), k = _ - 1 < 0 ? 0 : _ - 1 >= n ? w : _ - 1, X = _ < 0 ? 0 : _ >= n ? w : _, H = _ + 1 < 0 ? 0 : _ + 1 >= n ? w : _ + 1, J = _ + 2 < 0 ? 0 : _ + 2 >= n ? w : _ + 2;
			let C = 0, A = 0, I = 0, E = 0;
			if (F !== 0) {
				if (G !== 0) {
					const c = t[P + k], r = G * F;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
				if (j !== 0) {
					const c = t[P + X], r = j * F;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
				if (V !== 0) {
					const c = t[P + H], r = V * F;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
				if (S !== 0) {
					const c = t[P + J], r = S * F;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
			}
			if (O !== 0) {
				if (G !== 0) {
					const c = t[b + k], r = G * O;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
				if (j !== 0) {
					const c = t[b + X], r = j * O;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
				if (V !== 0) {
					const c = t[b + H], r = V * O;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
				if (S !== 0) {
					const c = t[b + J], r = S * O;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
			}
			if (R !== 0) {
				if (G !== 0) {
					const c = t[M + k], r = G * R;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
				if (j !== 0) {
					const c = t[M + X], r = j * R;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
				if (V !== 0) {
					const c = t[M + H], r = V * R;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
				if (S !== 0) {
					const c = t[M + J], r = S * R;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
			}
			if (L !== 0) {
				if (G !== 0) {
					const c = t[x + k], r = G * L;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
				if (j !== 0) {
					const c = t[x + X], r = j * L;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
				if (V !== 0) {
					const c = t[x + H], r = V * L;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
				if (S !== 0) {
					const c = t[x + J], r = S * L;
					C += (c & 255) * r, A += (c >> 8 & 255) * r, I += (c >> 16 & 255) * r, E += (c >>> 24 & 255) * r;
				}
			}
			const Z = C < 0 ? 0 : C >= 255.5 ? 255 : C + .5 | 0, at = A < 0 ? 0 : A >= 255.5 ? 255 : A + .5 | 0, z = I < 0 ? 0 : I >= 255.5 ? 255 : I + .5 | 0, Y = u ? E < 0 ? 0 : E >= 255.5 ? 255 : E + .5 | 0 : 255;
			o[h++] = Z | at << 8 | z << 16 | Y << 24;
		}
	}
}
function Nt(t, n = !0) {
	const s = t.width, o = t.height;
	if (s < 4 || o < 4) return;
	const i = Math.max(2, s * .995 + .5 | 0), e = Math.max(2, o * .995 + .5 | 0);
	let u;
	typeof OffscreenCanvas < "u" ? u = new OffscreenCanvas(i, e) : (u = document.createElement("canvas"), u.width = i, u.height = e);
	const g = u.getContext("2d", { willReadFrequently: !0 });
	g.drawImage(t, 0, 0, i, e);
	const l = g.getImageData(0, 0, i, e), p = new Uint32Array(l.data.buffer), w = t.getContext("2d", { willReadFrequently: !0 }), h = w.createImageData(s, o);
	Xt(p, i, e, new Uint32Array(h.data.buffer), s, o, n), w.putImageData(h, 0, 0);
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
	const e = /* @__PURE__ */ new Uint8Array(9), u = /* @__PURE__ */ new Uint8Array(9), g = /* @__PURE__ */ new Uint8Array(9), l = n - 1, p = s - 1;
	for (let w = 0; w < s; w++) {
		const h = w * n;
		for (let y = 0; y < n; y++) {
			let d = 0;
			for (let U = -1; U <= 1; U++) {
				const F = (w + U < 0 ? 0 : w + U > p ? p : w + U) * n;
				for (let O = -1; O <= 1; O++) {
					const R = F + (y + O < 0 ? 0 : y + O > l ? l : y + O) << 2;
					e[d] = t[R], u[d] = t[R + 1], g[d] = t[R + 2], d++;
				}
			}
			Mt(e), Mt(u), Mt(g);
			const m = h + y << 2;
			i[m] = e[4], i[m + 1] = u[4], i[m + 2] = g[4];
		}
	}
	t.set(i);
}
function qt(t) {
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
		const u = o.getImageData(0, 0, n, s);
		Et(u.data, n, s), o.putImageData(u, 0, 0);
		return;
	}
	try {
		const u = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = (a_position + 1.0) * 0.5;
      }
    `, g = `
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
    `, l = e.createShader(e.VERTEX_SHADER);
		e.shaderSource(l, u), e.compileShader(l);
		const p = e.createShader(e.FRAGMENT_SHADER);
		e.shaderSource(p, g), e.compileShader(p);
		const w = e.createProgram();
		e.attachShader(w, l), e.attachShader(w, p), e.linkProgram(w), e.useProgram(w);
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
		const y = e.getAttribLocation(w, "a_position");
		e.enableVertexAttribArray(y), e.vertexAttribPointer(y, 2, e.FLOAT, !1, 0, 0);
		const d = e.getUniformLocation(w, "u_resolution");
		e.uniform2f(d, n, s);
		const m = e.createTexture();
		e.bindTexture(e.TEXTURE_2D, m), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, t), e.viewport(0, 0, n, s), e.drawArrays(e.TRIANGLES, 0, 6), o.drawImage(i, 0, 0);
	} catch {
		const u = o.getImageData(0, 0, n, s);
		Et(u.data, n, s), o.putImageData(u, 0, 0);
	}
}
function Wt(t, n = 1597463007) {
	let s = n || 305419896;
	const o = t.length;
	for (let i = 0; i < o; i += 4) {
		s ^= s << 13, s ^= s >>> 17, s ^= s << 5;
		const e = ((s & 1) === 0 ? 1 : -1) * ((s >>> 1 & 1) + 1), u = ((s >>> 2 & 1) === 0 ? 1 : -1) * ((s >>> 3 & 1) + 1), g = ((s >>> 4 & 1) === 0 ? 1 : -1) * ((s >>> 5 & 1) + 1);
		let l = t[i] + e, p = t[i + 1] + u, w = t[i + 2] + g;
		t[i] = l < 0 ? 0 : l > 255 ? 255 : l, t[i + 1] = p < 0 ? 0 : p > 255 ? 255 : p, t[i + 2] = w < 0 ? 0 : w > 255 ? 255 : w;
	}
}
function Gt(t, n, s) {
	for (let o = 0; o < s; o += 2) {
		const i = o + 1 < s, e = o * n, u = (o + 1) * n;
		for (let g = 0; g < n; g += 2) {
			const l = g + 1 < n, p = e + g << 2;
			let w = 1;
			const h = t[p], y = t[p + 1], d = t[p + 2], m = .299 * h + .587 * y + .114 * d;
			let U = -.168736 * h - .331264 * y + .5 * d + 128, F = .5 * h - .418688 * y - .081312 * d + 128, O = 0, R = 0, L = 0, P = 0, b = 0, M = 0;
			if (l) {
				P = p + 4;
				const D = t[P], _ = t[P + 1], v = t[P + 2];
				O = .299 * D + .587 * _ + .114 * v, U += -.168736 * D - .331264 * _ + .5 * v + 128, F += .5 * D - .418688 * _ - .081312 * v + 128, w++;
			}
			if (i) {
				b = u + g << 2;
				const D = t[b], _ = t[b + 1], v = t[b + 2];
				R = .299 * D + .587 * _ + .114 * v, U += -.168736 * D - .331264 * _ + .5 * v + 128, F += .5 * D - .418688 * _ - .081312 * v + 128, w++;
			}
			if (i && l) {
				M = b + 4;
				const D = t[M], _ = t[M + 1], v = t[M + 2];
				L = .299 * D + .587 * _ + .114 * v, U += -.168736 * D - .331264 * _ + .5 * v + 128, F += .5 * D - .418688 * _ - .081312 * v + 128, w++;
			}
			const x = U / w - 128, T = F / w - 128;
			t[p] = m + 1.402 * T, t[p + 1] = m - .344136 * x - .714136 * T, t[p + 2] = m + 1.772 * x, l && (t[P] = O + 1.402 * T, t[P + 1] = O - .344136 * x - .714136 * T, t[P + 2] = O + 1.772 * x), i && (t[b] = R + 1.402 * T, t[b + 1] = R - .344136 * x - .714136 * T, t[b + 2] = R + 1.772 * x), i && l && (t[M] = L + 1.402 * T, t[M + 1] = L - .344136 * x - .714136 * T, t[M + 2] = L + 1.772 * x);
		}
	}
}
function Vt(t, n = !0) {
	Nt(t, n), qt(t);
	const s = t.getContext("2d", { willReadFrequently: !0 });
	if (s) {
		const o = s.getImageData(0, 0, t.width, t.height);
		Gt(o.data, t.width, t.height), Wt(o.data), s.putImageData(o, 0, 0);
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
		const u = n.getUint32(o, !1), g = n.getUint32(o + 4, !1), l = 12 + u;
		if (o + l > e) break;
		g === jt || g === kt || g === zt || g === Yt || g === Ht || g === Jt || g === Zt || g === Kt || g === Qt || (s.set(t.subarray(o, o + l), i), i += l), o += l;
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
			const l = t.subarray(o);
			n.set(l, s), s += l.length;
			break;
		}
		if (o + 3 >= i) break;
		const u = 2 + (t[o + 2] << 8 | t[o + 3]);
		if (o + u > i) break;
		let g = !1;
		e === 226 ? o + 15 <= i && t[o + 4] === 73 && t[o + 5] === 67 && t[o + 6] === 67 && t[o + 7] === 95 && t[o + 8] === 80 && t[o + 9] === 82 && t[o + 10] === 79 && t[o + 11] === 70 && t[o + 12] === 73 && t[o + 13] === 76 && t[o + 14] === 69 && t[o + 15] === 0 && (g = !0) : (e === 225 || e === 237 || e === 238 || e === 254 || e >= 227 && e <= 239) && (g = !0), g || (n.set(t.subarray(o, o + u), s), s += u), o += u;
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
	let u = 12;
	const g = t.length;
	for (; u + 8 <= g;) {
		const h = n.getUint32(u, !1), y = n.getUint32(u + 4, !0), d = 8 + (y + y % 2);
		if (u + d > g) break;
		h === re ? (s = !0, e.push({
			offset: u,
			totalLen: d,
			type: h
		})) : h === fe || h === le ? (o = !0, e.push({
			offset: u,
			totalLen: d,
			type: h
		})) : h === ce ? i = {
			offset: u,
			totalLen: d
		} : h === ie || h === ae ? e.push({
			offset: u,
			totalLen: d,
			type: h
		}) : h === $t || h === te || h === ee || e.push({
			offset: u,
			totalLen: d,
			type: h
		}), u += d;
	}
	const l = new Uint8Array(t.length);
	l.set(t.subarray(0, 12), 0);
	const p = new DataView(l.buffer, l.byteOffset, l.byteLength);
	let w = 12;
	if ((s || o) && i) {
		l.set(t.subarray(i.offset, i.offset + i.totalLen), w);
		let h = 0;
		s && (h |= 16), o && (h |= 2), l[w + 8] = h, w += i.totalLen;
	}
	for (const h of e) l.set(t.subarray(h.offset, h.offset + h.totalLen), w), w += h.totalLen;
	return p.setUint32(4, w - 8, !0), l.subarray(0, w);
}
const ge = .02;
function we(t, n = ge, s = 1) {
	const o = 2 * Math.PI, i = 1 / 4294967296, e = /* @__PURE__ */ new Uint32Array(16384);
	let u = 16384;
	const g = t.length - 7;
	let l = 0;
	for (; l < g; l += 8) {
		u > 16378 && (crypto.getRandomValues(e), u = 0);
		const p = t[l], w = t[l + 1], h = t[l + 2], y = t[l + 4], d = t[l + 5], m = t[l + 6], U = (e[u++] + 1) * i, F = (e[u++] + 1) * i, O = (e[u++] + 1) * i, R = (e[u++] + 1) * i, L = (e[u++] + 1) * i, P = (e[u++] + 1) * i, b = Math.sqrt(-2 * Math.log(U)), M = Math.sqrt(-2 * Math.log(O)), x = Math.sqrt(-2 * Math.log(L)), T = o * F, D = o * R, _ = o * P, v = b * Math.cos(T), G = b * Math.sin(T), j = M * Math.cos(D), V = M * Math.sin(D), S = x * Math.cos(_), k = x * Math.sin(_), X = Math.sqrt(n * (.2126 * p + .7152 * w + .0722 * h) + s), H = Math.sqrt(n * (.2126 * y + .7152 * d + .0722 * m) + s), J = p + Math.round(v * X), C = w + Math.round(G * X), A = h + Math.round(j * X);
		t[l] = J < 0 ? 0 : J > 255 ? 255 : J, t[l + 1] = C < 0 ? 0 : C > 255 ? 255 : C, t[l + 2] = A < 0 ? 0 : A > 255 ? 255 : A;
		const I = y + Math.round(V * H), E = d + Math.round(S * H), Z = m + Math.round(k * H);
		t[l + 4] = I < 0 ? 0 : I > 255 ? 255 : I, t[l + 5] = E < 0 ? 0 : E > 255 ? 255 : E, t[l + 6] = Z < 0 ? 0 : Z > 255 ? 255 : Z;
	}
	if (l < t.length) {
		u > 16380 && (crypto.getRandomValues(e), u = 0);
		const p = t[l], w = t[l + 1], h = t[l + 2], y = (e[u++] + 1) * i, d = (e[u++] + 1) * i, m = (e[u++] + 1) * i, U = (e[u++] + 1) * i, F = Math.sqrt(-2 * Math.log(y)), O = Math.sqrt(-2 * Math.log(m)), R = F * Math.cos(o * d), L = F * Math.sin(o * d), P = O * Math.cos(o * U), b = Math.sqrt(n * (.2126 * p + .7152 * w + .0722 * h) + s), M = p + Math.round(R * b), x = w + Math.round(L * b), T = h + Math.round(P * b);
		t[l] = M < 0 ? 0 : M > 255 ? 255 : M, t[l + 1] = x < 0 ? 0 : x > 255 ? 255 : x, t[l + 2] = T < 0 ? 0 : T > 255 ? 255 : T;
	}
}
let dt = null;
async function he() {
	if (dt) return dt;
	let t;
	if (typeof globalThis.process < "u" && globalThis.process?.versions?.node) {
		const s = await import("./__vite-browser-external-C9wrIE-0.js").then((e) => Ct(e.default, 1)), o = (await import("./__vite-browser-external-C9wrIE-0.js").then((e) => Ct(e.default, 1))).resolve(globalThis.process.cwd(), "src/core/wasm/deterministic_encoder.wasm"), i = s.readFileSync(o);
		t = i.buffer.slice(i.byteOffset, i.byteOffset + i.byteLength);
	} else {
		const s = new URL(new URL("deterministic_encoder-DTQagINg.wasm", import.meta.url).href, "" + import.meta.url).href;
		t = await (await fetch(s)).arrayBuffer();
	}
	const { instance: n } = await WebAssembly.instantiate(t, {});
	return dt = n, dt;
}
async function pe(t, n, s) {
	const { wasm_alloc: o, wasm_free: i, encode_deterministic_webp: e, get_output_len: u, memory: g } = (await he()).exports, l = t.length, p = o(l);
	try {
		new Uint8Array(g.buffer).set(t, p);
		const w = e(n, s, p, l), h = u(), y = new Uint8Array(h);
		return y.set(new Uint8Array(g.buffer, w, h)), y;
	} finally {
		i(p, l);
	}
}
const ot = 2048;
self.onmessage = async (t) => {
	const { buffer: n, mimeType: s, options: o, needsAlpha: i } = t.data;
	try {
		const e = new Blob([n], { type: s }), u = await createImageBitmap(e);
		let g = u.width, l = u.height;
		u.close();
		const p = Math.max(g, l);
		let w = e;
		if (p > 1920) {
			const P = 1920 / p;
			g = Math.round(g * P), l = Math.round(l * P);
			const b = new OffscreenCanvas(g, l), M = b.getContext("2d", {
				alpha: i,
				willReadFrequently: !0
			}), x = await createImageBitmap(e);
			M.drawImage(x, 0, 0, g, l), x.close(), w = await b.convertToBlob({ type: "image/png" });
		}
		const h = Math.ceil(g / ot), y = Math.ceil(l / ot), d = h * y, m = new OffscreenCanvas(g, l).getContext("2d", {
			alpha: i,
			willReadFrequently: !0
		});
		if (!m) throw new Error("WORKER_CONTEXT_FAILED");
		let U = 0;
		for (let P = 0; P < y; P++) for (let b = 0; b < h; b++) {
			const M = b * ot, x = P * ot, T = Math.min(ot, g - M), D = Math.min(ot, l - x), _ = await createImageBitmap(w, M, x, T, D), v = new OffscreenCanvas(T, D), G = v.getContext("2d", {
				alpha: i,
				willReadFrequently: !0
			});
			St(_, v, o.defenseLevel === "standard" ? "hardened" : o.defenseLevel, i, !1), _.close(), Vt(v, i);
			const V = G.getImageData(0, 0, T, D);
			we(V.data), G.putImageData(V, 0, 0), m.drawImage(v, M, x), U++, self.postMessage({
				type: "progress",
				percent: Math.round(25 + U / d * 50)
			});
		}
		self.postMessage({
			type: "progress",
			percent: 78
		});
		const O = await pe(m.getImageData(0, 0, g, l).data, g, l);
		self.postMessage({
			type: "progress",
			percent: 90
		});
		const R = ne(O, "image/webp"), L = R.buffer.slice(R.byteOffset, R.byteOffset + R.byteLength);
		self.postMessage({
			buffer: L,
			tilesProcessed: d,
			wasmEncoded: !0
		}, [L]);
	} catch (e) {
		self.postMessage({ error: e.message || "Worker processing failed" });
	}
};
export { ye as t };

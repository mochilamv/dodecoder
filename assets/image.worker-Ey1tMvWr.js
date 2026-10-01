var Mt = Object.create, Rt = Object.defineProperty, vt = Object.getOwnPropertyDescriptor, Dt = Object.getOwnPropertyNames, Lt = Object.getPrototypeOf, At = Object.prototype.hasOwnProperty, ye = (t, n) => () => (n || (t((n = { exports: {} }).exports, n), t = null), n.exports), Ft = (t, n, s, o) => {
	if (n && typeof n == "object" || typeof n == "function") for (var f = Dt(n), e = 0, u = f.length, l; e < u; e++) l = f[e], !At.call(t, l) && l !== s && Rt(t, l, {
		get: ((g) => n[g]).bind(null, l),
		enumerable: !(o = vt(n, l)) || o.enumerable
	});
	return t;
}, Et = (t, n, s) => (s = t != null ? Mt(Lt(t)) : {}, Ft(n || !t || !t.__esModule || !At.call(t, "default") ? Rt(s, "default", {
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
	const o = .1 + s[0] / 4294967295 * .2, f = (s[0] % 2 === 0 ? 1 : -1) * (o * Math.PI) / 180, e = .995 + s[1] / 4294967295 * .004;
	let u = .995 + s[2] / 4294967295 * .004;
	return e - u > -5e-4 && e - u < 5e-4 && (u = e < .997 ? e + 6e-4 : e - 6e-4), {
		theta: f,
		sx: e,
		sy: u,
		noiseIntensity: n ? 0 : 2
	};
}
function Q(t) {
	const n = t < 0 ? -t : t;
	return n < 1 ? n * n * (1.5 * n - 2.5) + 1 : n < 2 ? n * n * (-.5 * n + 2.5) - 4 * n + 2 : 0;
}
function St(t, n, s, o = !0, f = !1) {
	const e = t.width, u = t.height;
	if (s === "standard") {
		n.width = e, n.height = u, n.getContext("2d", {
			willReadFrequently: !0,
			alpha: o
		}).drawImage(t, 0, 0);
		return;
	}
	const l = Bt(s, f), g = new OffscreenCanvas(e, u).getContext("2d", { willReadFrequently: !0 });
	g.drawImage(t, 0, 0);
	const p = g.getImageData(0, 0, e, u), w = new Uint32Array(p.data.buffer), h = 3, y = e - 6, m = u - 6;
	n.width = y, n.height = m;
	const d = n.getContext("2d", {
		willReadFrequently: !0,
		alpha: o
	}), x = d.createImageData(y, m), D = new Uint32Array(x.data.buffer), b = Math.cos(l.theta), P = Math.sin(l.theta), L = l.sx * b, M = -l.sy * P, I = l.sx * P, R = l.sy * b, C = L * R - M * I, E = R / C, F = -M / C, _ = -I / C, v = L / C, q = e * .5, Y = u * .5, H = /* @__PURE__ */ new Uint32Array(1);
	crypto.getRandomValues(H);
	let W = H[0] || 305419896;
	const V = u - 1, k = e - 1;
	let tt = 0;
	const et = l.noiseIntensity > 0;
	for (let A = 0; A < m; A++) {
		const U = A + h - Y, O = -q + h;
		let T = O * E + U * F + q, ot = O * _ + U * v + Y;
		for (let at = 0; at < y; at++) {
			const G = Math.floor(T), j = Math.floor(ot), c = T - G, r = ot - j, z = Q(c + 1), J = Q(c), Z = Q(c - 1), K = Q(c - 2), st = Q(r + 1), ct = Q(r), rt = Q(r - 1), it = Q(r - 2), ft = (j - 1 < 0 ? 0 : j - 1 > V ? V : j - 1) * e, lt = (j < 0 ? 0 : j > V ? V : j) * e, ut = (j + 1 < 0 ? 0 : j + 1 > V ? V : j + 1) * e, wt = (j + 2 < 0 ? 0 : j + 2 > V ? V : j + 2) * e, gt = G - 1 < 0 ? 0 : G - 1 > k ? k : G - 1, ht = G < 0 ? 0 : G > k ? k : G, pt = G + 1 < 0 ? 0 : G + 1 > k ? k : G + 1, yt = G + 2 < 0 ? 0 : G + 2 > k ? k : G + 2;
			let S = 0, X = 0, N = 0, B = 0;
			if (st !== 0) {
				if (z !== 0) {
					const i = w[ft + gt], a = z * st;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
				if (J !== 0) {
					const i = w[ft + ht], a = J * st;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
				if (Z !== 0) {
					const i = w[ft + pt], a = Z * st;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
				if (K !== 0) {
					const i = w[ft + yt], a = K * st;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
			}
			if (ct !== 0) {
				if (z !== 0) {
					const i = w[lt + gt], a = z * ct;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
				if (J !== 0) {
					const i = w[lt + ht], a = J * ct;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
				if (Z !== 0) {
					const i = w[lt + pt], a = Z * ct;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
				if (K !== 0) {
					const i = w[lt + yt], a = K * ct;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
			}
			if (rt !== 0) {
				if (z !== 0) {
					const i = w[ut + gt], a = z * rt;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
				if (J !== 0) {
					const i = w[ut + ht], a = J * rt;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
				if (Z !== 0) {
					const i = w[ut + pt], a = Z * rt;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
				if (K !== 0) {
					const i = w[ut + yt], a = K * rt;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
			}
			if (it !== 0) {
				if (z !== 0) {
					const i = w[wt + gt], a = z * it;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
				if (J !== 0) {
					const i = w[wt + ht], a = J * it;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
				if (Z !== 0) {
					const i = w[wt + pt], a = Z * it;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
				if (K !== 0) {
					const i = w[wt + yt], a = K * it;
					S += (i & 255) * a, X += (i >> 8 & 255) * a, N += (i >> 16 & 255) * a, B += (i >>> 24 & 255) * a;
				}
			}
			let mt = 0;
			et && (W ^= W << 13, W ^= W >>> 17, W ^= W << 5, mt = (W & 255) % 5 - 2);
			const _t = S + mt, xt = X + mt, bt = N + mt, Tt = _t < 0 ? 0 : _t >= 255.5 ? 255 : _t + .5 | 0, It = xt < 0 ? 0 : xt >= 255.5 ? 255 : xt + .5 | 0, Ut = bt < 0 ? 0 : bt >= 255.5 ? 255 : bt + .5 | 0, Ot = o ? B < 0 ? 0 : B >= 255.5 ? 255 : B + .5 | 0 : 255;
			D[tt++] = Tt | It << 8 | Ut << 16 | Ot << 24, T += E, ot += _;
		}
	}
	d.putImageData(x, 0, 0);
}
function $(t) {
	const n = t < 0 ? -t : t;
	return n < 1 ? n * n * (1.5 * n - 2.5) + 1 : n < 2 ? n * n * (-.5 * n + 2.5) - 4 * n + 2 : 0;
}
function Xt(t, n, s, o, f, e, u = !0) {
	const l = n / f, g = s / e, p = s - 1, w = n - 1;
	let h = 0;
	for (let y = 0; y < e; y++) {
		const m = (y + .5) * g - .5, d = Math.floor(m), x = m - d, D = $(x + 1), b = $(x), P = $(x - 1), L = $(x - 2), M = (d - 1 < 0 ? 0 : d - 1 >= s ? p : d - 1) * n, I = (d < 0 ? 0 : d >= s ? p : d) * n, R = (d + 1 < 0 ? 0 : d + 1 >= s ? p : d + 1) * n, C = (d + 2 < 0 ? 0 : d + 2 >= s ? p : d + 2) * n;
		for (let E = 0; E < f; E++) {
			const F = (E + .5) * l - .5, _ = Math.floor(F), v = F - _, q = $(v + 1), Y = $(v), H = $(v - 1), W = $(v - 2), V = _ - 1 < 0 ? 0 : _ - 1 >= n ? w : _ - 1, k = _ < 0 ? 0 : _ >= n ? w : _, tt = _ + 1 < 0 ? 0 : _ + 1 >= n ? w : _ + 1, et = _ + 2 < 0 ? 0 : _ + 2 >= n ? w : _ + 2;
			let A = 0, U = 0, O = 0, T = 0;
			if (D !== 0) {
				if (q !== 0) {
					const c = t[M + V], r = q * D;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
				if (Y !== 0) {
					const c = t[M + k], r = Y * D;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
				if (H !== 0) {
					const c = t[M + tt], r = H * D;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
				if (W !== 0) {
					const c = t[M + et], r = W * D;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
			}
			if (b !== 0) {
				if (q !== 0) {
					const c = t[I + V], r = q * b;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
				if (Y !== 0) {
					const c = t[I + k], r = Y * b;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
				if (H !== 0) {
					const c = t[I + tt], r = H * b;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
				if (W !== 0) {
					const c = t[I + et], r = W * b;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
			}
			if (P !== 0) {
				if (q !== 0) {
					const c = t[R + V], r = q * P;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
				if (Y !== 0) {
					const c = t[R + k], r = Y * P;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
				if (H !== 0) {
					const c = t[R + tt], r = H * P;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
				if (W !== 0) {
					const c = t[R + et], r = W * P;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
			}
			if (L !== 0) {
				if (q !== 0) {
					const c = t[C + V], r = q * L;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
				if (Y !== 0) {
					const c = t[C + k], r = Y * L;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
				if (H !== 0) {
					const c = t[C + tt], r = H * L;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
				if (W !== 0) {
					const c = t[C + et], r = W * L;
					A += (c & 255) * r, U += (c >> 8 & 255) * r, O += (c >> 16 & 255) * r, T += (c >>> 24 & 255) * r;
				}
			}
			const ot = A < 0 ? 0 : A >= 255.5 ? 255 : A + .5 | 0, at = U < 0 ? 0 : U >= 255.5 ? 255 : U + .5 | 0, G = O < 0 ? 0 : O >= 255.5 ? 255 : O + .5 | 0, j = u ? T < 0 ? 0 : T >= 255.5 ? 255 : T + .5 | 0 : 255;
			o[h++] = ot | at << 8 | G << 16 | j << 24;
		}
	}
}
function Nt(t, n = !0) {
	const s = t.width, o = t.height;
	if (s < 4 || o < 4) return;
	const f = Math.max(2, s * .995 + .5 | 0), e = Math.max(2, o * .995 + .5 | 0);
	let u;
	typeof OffscreenCanvas < "u" ? u = new OffscreenCanvas(f, e) : (u = document.createElement("canvas"), u.width = f, u.height = e);
	const l = u.getContext("2d", { willReadFrequently: !0 });
	l.drawImage(t, 0, 0, f, e);
	const g = l.getImageData(0, 0, f, e), p = new Uint32Array(g.data.buffer), w = t.getContext("2d", { willReadFrequently: !0 }), h = w.createImageData(s, o);
	Xt(p, f, e, new Uint32Array(h.data.buffer), s, o, n), w.putImageData(h, 0, 0);
}
function Ct(t) {
	for (let n = 1; n < 9; n++) {
		const s = t[n];
		let o = n - 1;
		for (; o >= 0 && t[o] > s;) t[o + 1] = t[o], o--;
		t[o + 1] = s;
	}
}
function Pt(t, n, s) {
	const o = t.length, f = new Uint8ClampedArray(o);
	f.set(t);
	const e = /* @__PURE__ */ new Uint8Array(9), u = /* @__PURE__ */ new Uint8Array(9), l = /* @__PURE__ */ new Uint8Array(9), g = n - 1, p = s - 1;
	for (let w = 0; w < s; w++) {
		const h = w * n;
		for (let y = 0; y < n; y++) {
			let m = 0;
			for (let x = -1; x <= 1; x++) {
				const D = (w + x < 0 ? 0 : w + x > p ? p : w + x) * n;
				for (let b = -1; b <= 1; b++) {
					const P = D + (y + b < 0 ? 0 : y + b > g ? g : y + b) << 2;
					e[m] = t[P], u[m] = t[P + 1], l[m] = t[P + 2], m++;
				}
			}
			Ct(e), Ct(u), Ct(l);
			const d = h + y << 2;
			f[d] = e[4], f[d + 1] = u[4], f[d + 2] = l[4];
		}
	}
	t.set(f);
}
function Wt(t) {
	const n = t.width, s = t.height;
	if (n < 3 || s < 3) return;
	const o = t.getContext("2d", { willReadFrequently: !0 });
	if (!o) return;
	let f = null, e = null;
	try {
		typeof OffscreenCanvas < "u" ? f = new OffscreenCanvas(n, s) : (f = document.createElement("canvas"), f.width = n, f.height = s), e = f.getContext("webgl");
	} catch {
		e = null;
	}
	if (!e) {
		const u = o.getImageData(0, 0, n, s);
		Pt(u.data, n, s), o.putImageData(u, 0, 0);
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
    `, l = `
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
    `, g = e.createShader(e.VERTEX_SHADER);
		e.shaderSource(g, u), e.compileShader(g);
		const p = e.createShader(e.FRAGMENT_SHADER);
		e.shaderSource(p, l), e.compileShader(p);
		const w = e.createProgram();
		e.attachShader(w, g), e.attachShader(w, p), e.linkProgram(w), e.useProgram(w);
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
		const m = e.getUniformLocation(w, "u_resolution");
		e.uniform2f(m, n, s);
		const d = e.createTexture();
		e.bindTexture(e.TEXTURE_2D, d), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, t), e.viewport(0, 0, n, s), e.drawArrays(e.TRIANGLES, 0, 6), o.drawImage(f, 0, 0);
	} catch {
		const u = o.getImageData(0, 0, n, s);
		Pt(u.data, n, s), o.putImageData(u, 0, 0);
	}
}
function Gt(t, n = 1597463007) {
	let s = n || 305419896;
	const o = t.length;
	for (let f = 0; f < o; f += 4) {
		s ^= s << 13, s ^= s >>> 17, s ^= s << 5;
		const e = ((s & 1) === 0 ? 1 : -1) * ((s >>> 1 & 1) + 1), u = ((s >>> 2 & 1) === 0 ? 1 : -1) * ((s >>> 3 & 1) + 1), l = ((s >>> 4 & 1) === 0 ? 1 : -1) * ((s >>> 5 & 1) + 1);
		let g = t[f] + e, p = t[f + 1] + u, w = t[f + 2] + l;
		t[f] = g < 0 ? 0 : g > 255 ? 255 : g, t[f + 1] = p < 0 ? 0 : p > 255 ? 255 : p, t[f + 2] = w < 0 ? 0 : w > 255 ? 255 : w;
	}
}
function jt(t, n, s) {
	for (let o = 0; o < s; o += 2) {
		const f = o + 1 < s, e = o * n, u = (o + 1) * n;
		for (let l = 0; l < n; l += 2) {
			const g = l + 1 < n, p = e + l << 2;
			let w = 1;
			const h = t[p], y = t[p + 1], m = t[p + 2], d = .299 * h + .587 * y + .114 * m;
			let x = -.168736 * h - .331264 * y + .5 * m + 128, D = .5 * h - .418688 * y - .081312 * m + 128, b = 0, P = 0, L = 0, M = 0, I = 0, R = 0;
			if (g) {
				M = p + 4;
				const F = t[M], _ = t[M + 1], v = t[M + 2];
				b = .299 * F + .587 * _ + .114 * v, x += -.168736 * F - .331264 * _ + .5 * v + 128, D += .5 * F - .418688 * _ - .081312 * v + 128, w++;
			}
			if (f) {
				I = u + l << 2;
				const F = t[I], _ = t[I + 1], v = t[I + 2];
				P = .299 * F + .587 * _ + .114 * v, x += -.168736 * F - .331264 * _ + .5 * v + 128, D += .5 * F - .418688 * _ - .081312 * v + 128, w++;
			}
			if (f && g) {
				R = I + 4;
				const F = t[R], _ = t[R + 1], v = t[R + 2];
				L = .299 * F + .587 * _ + .114 * v, x += -.168736 * F - .331264 * _ + .5 * v + 128, D += .5 * F - .418688 * _ - .081312 * v + 128, w++;
			}
			const C = x / w - 128, E = D / w - 128;
			t[p] = d + 1.402 * E, t[p + 1] = d - .344136 * C - .714136 * E, t[p + 2] = d + 1.772 * C, g && (t[M] = b + 1.402 * E, t[M + 1] = b - .344136 * C - .714136 * E, t[M + 2] = b + 1.772 * C), f && (t[I] = P + 1.402 * E, t[I + 1] = P - .344136 * C - .714136 * E, t[I + 2] = P + 1.772 * C), f && g && (t[R] = L + 1.402 * E, t[R + 1] = L - .344136 * C - .714136 * E, t[R + 2] = L + 1.772 * C);
		}
	}
}
function Vt(t, n = !0) {
	Nt(t, n), Wt(t);
	const s = t.getContext("2d", { willReadFrequently: !0 });
	if (s) {
		const o = s.getImageData(0, 0, t.width, t.height);
		jt(o.data, t.width, t.height), Gt(o.data), s.putImageData(o, 0, 0);
	}
}
const kt = 1766015824, qt = 1665684045, Yt = 1732332865, Ht = 1700284774, zt = 1950701684, Jt = 2052348020, Zt = 1767135348, Kt = 1950960965, Qt = 1883789683, $t = 1229144912, te = 1163413830, ee = 1481461792;
function ne(t, n) {
	return t.length < 12 ? t : n === "image/png" || t[0] === 137 && t[1] === 80 && t[2] === 78 && t[3] === 71 ? oe(t) : n === "image/jpeg" || t[0] === 255 && t[1] === 216 ? se(t) : n === "image/webp" || t[0] === 82 && t[1] === 73 && t[2] === 70 && t[3] === 70 ? ue(t) : t;
}
function oe(t) {
	if (t.length < 8) return t;
	const n = new DataView(t.buffer, t.byteOffset, t.byteLength);
	if (n.getUint32(0, !1) !== 2303741511 || n.getUint32(4, !1) !== 218765834) return t;
	const s = new Uint8Array(t.length);
	s.set(t.subarray(0, 8), 0);
	let o = 8, f = 8;
	const e = t.length;
	for (; o + 8 <= e;) {
		const u = n.getUint32(o, !1), l = n.getUint32(o + 4, !1), g = 12 + u;
		if (o + g > e) break;
		l === kt || l === qt || l === Yt || l === Ht || l === zt || l === Jt || l === Zt || l === Kt || l === Qt || (s.set(t.subarray(o, o + g), f), f += g), o += g;
	}
	return s.subarray(0, f);
}
function se(t) {
	if (t.length < 4 || t[0] !== 255 || t[1] !== 216) return t;
	const n = new Uint8Array(t.length);
	n[0] = 255, n[1] = 216;
	let s = 2, o = 2;
	const f = t.length;
	for (; o < f - 1;) {
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
			const g = t.subarray(o);
			n.set(g, s), s += g.length;
			break;
		}
		if (o + 3 >= f) break;
		const u = 2 + (t[o + 2] << 8 | t[o + 3]);
		if (o + u > f) break;
		let l = !1;
		e === 226 ? o + 15 <= f && t[o + 4] === 73 && t[o + 5] === 67 && t[o + 6] === 67 && t[o + 7] === 95 && t[o + 8] === 80 && t[o + 9] === 82 && t[o + 10] === 79 && t[o + 11] === 70 && t[o + 12] === 73 && t[o + 13] === 76 && t[o + 14] === 69 && t[o + 15] === 0 && (l = !0) : (e === 225 || e === 237 || e === 238 || e === 254 || e >= 227 && e <= 239) && (l = !0), l || (n.set(t.subarray(o, o + u), s), s += u), o += u;
	}
	return n.subarray(0, s);
}
const ce = 1448097880, re = 1095520328, ie = 1448097824, ae = 1448097868, fe = 1095649613, le = 1095650630;
function ue(t) {
	if (t.length < 12) return t;
	const n = new DataView(t.buffer, t.byteOffset, t.byteLength);
	if (n.getUint32(0, !1) !== 1380533830 || n.getUint32(8, !1) !== 1464156752) return t;
	let s = !1, o = !1, f = null;
	const e = [];
	let u = 12;
	const l = t.length;
	for (; u + 8 <= l;) {
		const h = n.getUint32(u, !1), y = n.getUint32(u + 4, !0), m = 8 + (y + y % 2);
		if (u + m > l) break;
		h === re ? (s = !0, e.push({
			offset: u,
			totalLen: m,
			type: h
		})) : h === fe || h === le ? (o = !0, e.push({
			offset: u,
			totalLen: m,
			type: h
		})) : h === ce ? f = {
			offset: u,
			totalLen: m
		} : h === ie || h === ae ? e.push({
			offset: u,
			totalLen: m,
			type: h
		}) : h === $t || h === te || h === ee || e.push({
			offset: u,
			totalLen: m,
			type: h
		}), u += m;
	}
	const g = new Uint8Array(t.length);
	g.set(t.subarray(0, 12), 0);
	const p = new DataView(g.buffer, g.byteOffset, g.byteLength);
	let w = 12;
	if ((s || o) && f) {
		g.set(t.subarray(f.offset, f.offset + f.totalLen), w);
		let h = 0;
		s && (h |= 16), o && (h |= 2), g[w + 8] = h, w += f.totalLen;
	}
	for (const h of e) g.set(t.subarray(h.offset, h.offset + h.totalLen), w), w += h.totalLen;
	return p.setUint32(4, w - 8, !0), g.subarray(0, w);
}
const we = .02;
function ge(t, n = we, s = 1) {
	const o = t.length >> 2, f = new Uint32Array(o * 4);
	crypto.getRandomValues(f);
	let e = 0;
	const u = 2 * Math.PI, l = 1 / 4294967296;
	for (let g = 0; g < t.length; g += 4) {
		const p = t[g], w = t[g + 1], h = t[g + 2], y = .2126 * p + .7152 * w + .0722 * h, m = Math.sqrt(n * y + s), d = (f[e++] + 1) * l, x = (f[e++] + 1) * l, D = Math.sqrt(-2 * Math.log(d)), b = D * Math.cos(u * x), P = D * Math.sin(u * x), L = (f[e++] + 1) * l, M = (f[e++] + 1) * l, I = Math.sqrt(-2 * Math.log(L)) * Math.cos(u * M), R = p + Math.round(b * m), C = w + Math.round(P * m), E = h + Math.round(I * m);
		t[g] = R < 0 ? 0 : R > 255 ? 255 : R, t[g + 1] = C < 0 ? 0 : C > 255 ? 255 : C, t[g + 2] = E < 0 ? 0 : E > 255 ? 255 : E;
	}
}
let dt = null;
async function he() {
	if (dt) return dt;
	let t;
	if (typeof globalThis.process < "u" && globalThis.process?.versions?.node) {
		const s = await import("./__vite-browser-external-Ez5IdbMd.js").then((e) => Et(e.default, 1)), o = (await import("./__vite-browser-external-Ez5IdbMd.js").then((e) => Et(e.default, 1))).resolve(globalThis.process.cwd(), "src/core/wasm/deterministic_encoder.wasm"), f = s.readFileSync(o);
		t = f.buffer.slice(f.byteOffset, f.byteOffset + f.byteLength);
	} else {
		const s = new URL(new URL("deterministic_encoder-DTQagINg.wasm", import.meta.url).href, "" + import.meta.url).href;
		t = await (await fetch(s)).arrayBuffer();
	}
	const { instance: n } = await WebAssembly.instantiate(t, {});
	return dt = n, dt;
}
async function pe(t, n, s) {
	const { wasm_alloc: o, wasm_free: f, encode_deterministic_webp: e, get_output_len: u, memory: l } = (await he()).exports, g = t.length, p = o(g);
	try {
		new Uint8Array(l.buffer).set(t, p);
		const w = e(n, s, p, g), h = u(), y = new Uint8Array(h);
		return y.set(new Uint8Array(l.buffer, w, h)), y;
	} finally {
		f(p, g);
	}
}
const nt = 2048;
self.onmessage = async (t) => {
	const { buffer: n, mimeType: s, options: o, needsAlpha: f } = t.data;
	try {
		const e = new Blob([n], { type: s }), u = await createImageBitmap(e), l = u.width, g = u.height;
		u.close();
		const p = Math.ceil(l / nt), w = Math.ceil(g / nt), h = p * w, y = new OffscreenCanvas(l, g).getContext("2d", {
			alpha: f,
			willReadFrequently: !0
		});
		if (!y) throw new Error("WORKER_CONTEXT_FAILED");
		for (let b = 0; b < w; b++) for (let P = 0; P < p; P++) {
			const L = P * nt, M = b * nt, I = Math.min(nt, l - L), R = Math.min(nt, g - M), C = await createImageBitmap(e, L, M, I, R), E = new OffscreenCanvas(I, R), F = E.getContext("2d", {
				alpha: f,
				willReadFrequently: !0
			});
			St(C, E, o.defenseLevel === "standard" ? "hardened" : o.defenseLevel, f, !1), C.close(), Vt(E, f);
			const v = F.getImageData(0, 0, I, R);
			ge(v.data), F.putImageData(v, 0, 0), y.drawImage(E, L, M);
		}
		const x = ne(await pe(y.getImageData(0, 0, l, g).data, l, g), "image/webp"), D = x.buffer.slice(x.byteOffset, x.byteOffset + x.byteLength);
		self.postMessage({
			buffer: D,
			tilesProcessed: h,
			wasmEncoded: !0
		}, [D]);
	} catch (e) {
		self.postMessage({ error: e.message || "Worker processing failed" });
	}
};
export { ye as t };

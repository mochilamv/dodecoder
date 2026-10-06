var Ot = Object.create, Rt = Object.defineProperty, vt = Object.getOwnPropertyDescriptor, Dt = Object.getOwnPropertyNames, Lt = Object.getPrototypeOf, Pt = Object.prototype.hasOwnProperty, ye = (t, n) => () => (n || (t((n = { exports: {} }).exports, n), t = null), n.exports), Ft = (t, n, s, o) => {
	if (n && typeof n == "object" || typeof n == "function") for (var i = Dt(n), e = 0, g = i.length, l; e < g; e++) l = i[e], !Pt.call(t, l) && l !== s && Rt(t, l, {
		get: ((h) => n[h]).bind(null, l),
		enumerable: !(o = vt(n, l)) || o.enumerable
	});
	return t;
}, Et = (t, n, s) => (s = t != null ? Ot(Lt(t)) : {}, Ft(n || !t || !t.__esModule || !Pt.call(t, "default") ? Rt(s, "default", {
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
	let g = .995 + s[2] / 4294967295 * .004;
	return e - g > -5e-4 && e - g < 5e-4 && (g = e < .997 ? e + 6e-4 : e - 6e-4), {
		theta: i,
		sx: e,
		sy: g,
		noiseIntensity: n ? 0 : 2
	};
}
function tt(t) {
	const n = t < 0 ? -t : t;
	return n < 1 ? n * n * (1.5 * n - 2.5) + 1 : n < 2 ? n * n * (-.5 * n + 2.5) - 4 * n + 2 : 0;
}
function St(t, n, s, o = !0, i = !1) {
	const e = t.width, g = t.height;
	if (s === "standard") {
		n.width = e, n.height = g, n.getContext("2d", {
			willReadFrequently: !0,
			alpha: o
		}).drawImage(t, 0, 0);
		return;
	}
	const l = Bt(s, i), h = new OffscreenCanvas(e, g).getContext("2d", { willReadFrequently: !0 });
	h.drawImage(t, 0, 0);
	const w = h.getImageData(0, 0, e, g), u = new Uint32Array(w.data.buffer), p = 3, y = e - 6, _ = g - 6;
	n.width = y, n.height = _;
	const m = n.getContext("2d", {
		willReadFrequently: !0,
		alpha: o
	}), b = m.createImageData(y, _), F = new Uint32Array(b.data.buffer), x = Math.cos(l.theta), T = Math.sin(l.theta), L = l.sx * x, O = -l.sy * T, I = l.sx * T, R = l.sy * x, C = L * R - O * I, E = R / C, U = -O / C, d = -I / C, v = L / C, k = e * .5, z = g * .5, Y = /* @__PURE__ */ new Uint32Array(1);
	crypto.getRandomValues(Y);
	let B = Y[0] || 305419896;
	const X = g - 1, N = e - 1;
	let H = 0;
	const J = l.noiseIntensity > 0;
	for (let M = 0; M < _; M++) {
		const P = M + p - z, A = -k + p;
		let D = A * E + P * U + k, ot = A * d + P * v + z;
		for (let at = 0; at < y; at++) {
			const j = Math.floor(D), V = Math.floor(ot), c = D - j, r = ot - V, Z = tt(c + 1), K = tt(c), Q = tt(c - 1), $ = tt(c - 2), st = tt(r + 1), ct = tt(r), rt = tt(r - 1), it = tt(r - 2), ft = (V - 1 < 0 ? 0 : V - 1 > X ? X : V - 1) * e, lt = (V < 0 ? 0 : V > X ? X : V) * e, ut = (V + 1 < 0 ? 0 : V + 1 > X ? X : V + 1) * e, gt = (V + 2 < 0 ? 0 : V + 2 > X ? X : V + 2) * e, wt = j - 1 < 0 ? 0 : j - 1 > N ? N : j - 1, ht = j < 0 ? 0 : j > N ? N : j, pt = j + 1 < 0 ? 0 : j + 1 > N ? N : j + 1, yt = j + 2 < 0 ? 0 : j + 2 > N ? N : j + 2;
			let W = 0, q = 0, G = 0, S = 0;
			if (st !== 0) {
				if (Z !== 0) {
					const a = u[ft + wt], f = Z * st;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
				if (K !== 0) {
					const a = u[ft + ht], f = K * st;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
				if (Q !== 0) {
					const a = u[ft + pt], f = Q * st;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
				if ($ !== 0) {
					const a = u[ft + yt], f = $ * st;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
			}
			if (ct !== 0) {
				if (Z !== 0) {
					const a = u[lt + wt], f = Z * ct;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
				if (K !== 0) {
					const a = u[lt + ht], f = K * ct;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
				if (Q !== 0) {
					const a = u[lt + pt], f = Q * ct;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
				if ($ !== 0) {
					const a = u[lt + yt], f = $ * ct;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
			}
			if (rt !== 0) {
				if (Z !== 0) {
					const a = u[ut + wt], f = Z * rt;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
				if (K !== 0) {
					const a = u[ut + ht], f = K * rt;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
				if (Q !== 0) {
					const a = u[ut + pt], f = Q * rt;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
				if ($ !== 0) {
					const a = u[ut + yt], f = $ * rt;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
			}
			if (it !== 0) {
				if (Z !== 0) {
					const a = u[gt + wt], f = Z * it;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
				if (K !== 0) {
					const a = u[gt + ht], f = K * it;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
				if (Q !== 0) {
					const a = u[gt + pt], f = Q * it;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
				if ($ !== 0) {
					const a = u[gt + yt], f = $ * it;
					W += (a & 255) * f, q += (a >> 8 & 255) * f, G += (a >> 16 & 255) * f, S += (a >>> 24 & 255) * f;
				}
			}
			let mt = 0;
			J && (B ^= B << 13, B ^= B >>> 17, B ^= B << 5, mt = (B & 255) % 5 - 2);
			const dt = W + mt, xt = q + mt, bt = G + mt, At = dt < 0 ? 0 : dt >= 255.5 ? 255 : dt + .5 | 0, Tt = xt < 0 ? 0 : xt >= 255.5 ? 255 : xt + .5 | 0, It = bt < 0 ? 0 : bt >= 255.5 ? 255 : bt + .5 | 0, Ut = o ? S < 0 ? 0 : S >= 255.5 ? 255 : S + .5 | 0 : 255;
			F[H++] = At | Tt << 8 | It << 16 | Ut << 24, D += E, ot += d;
		}
	}
	m.putImageData(b, 0, 0);
}
function et(t) {
	const n = t < 0 ? -t : t;
	return n < 1 ? n * n * (1.5 * n - 2.5) + 1 : n < 2 ? n * n * (-.5 * n + 2.5) - 4 * n + 2 : 0;
}
function Xt(t, n, s, o, i, e, g = !0) {
	const l = n / i, h = s / e, w = s - 1, u = n - 1;
	let p = 0;
	for (let y = 0; y < e; y++) {
		const _ = (y + .5) * h - .5, m = Math.floor(_), b = _ - m, F = et(b + 1), x = et(b), T = et(b - 1), L = et(b - 2), O = (m - 1 < 0 ? 0 : m - 1 >= s ? w : m - 1) * n, I = (m < 0 ? 0 : m >= s ? w : m) * n, R = (m + 1 < 0 ? 0 : m + 1 >= s ? w : m + 1) * n, C = (m + 2 < 0 ? 0 : m + 2 >= s ? w : m + 2) * n;
		for (let E = 0; E < i; E++) {
			const U = (E + .5) * l - .5, d = Math.floor(U), v = U - d, k = et(v + 1), z = et(v), Y = et(v - 1), B = et(v - 2), X = d - 1 < 0 ? 0 : d - 1 >= n ? u : d - 1, N = d < 0 ? 0 : d >= n ? u : d, H = d + 1 < 0 ? 0 : d + 1 >= n ? u : d + 1, J = d + 2 < 0 ? 0 : d + 2 >= n ? u : d + 2;
			let M = 0, P = 0, A = 0, D = 0;
			if (F !== 0) {
				if (k !== 0) {
					const c = t[O + X], r = k * F;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
				if (z !== 0) {
					const c = t[O + N], r = z * F;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
				if (Y !== 0) {
					const c = t[O + H], r = Y * F;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
				if (B !== 0) {
					const c = t[O + J], r = B * F;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
			}
			if (x !== 0) {
				if (k !== 0) {
					const c = t[I + X], r = k * x;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
				if (z !== 0) {
					const c = t[I + N], r = z * x;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
				if (Y !== 0) {
					const c = t[I + H], r = Y * x;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
				if (B !== 0) {
					const c = t[I + J], r = B * x;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
			}
			if (T !== 0) {
				if (k !== 0) {
					const c = t[R + X], r = k * T;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
				if (z !== 0) {
					const c = t[R + N], r = z * T;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
				if (Y !== 0) {
					const c = t[R + H], r = Y * T;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
				if (B !== 0) {
					const c = t[R + J], r = B * T;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
			}
			if (L !== 0) {
				if (k !== 0) {
					const c = t[C + X], r = k * L;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
				if (z !== 0) {
					const c = t[C + N], r = z * L;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
				if (Y !== 0) {
					const c = t[C + H], r = Y * L;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
				if (B !== 0) {
					const c = t[C + J], r = B * L;
					M += (c & 255) * r, P += (c >> 8 & 255) * r, A += (c >> 16 & 255) * r, D += (c >>> 24 & 255) * r;
				}
			}
			const ot = M < 0 ? 0 : M >= 255.5 ? 255 : M + .5 | 0, at = P < 0 ? 0 : P >= 255.5 ? 255 : P + .5 | 0, j = A < 0 ? 0 : A >= 255.5 ? 255 : A + .5 | 0, V = g ? D < 0 ? 0 : D >= 255.5 ? 255 : D + .5 | 0 : 255;
			o[p++] = ot | at << 8 | j << 16 | V << 24;
		}
	}
}
function Nt(t, n = !0) {
	const s = t.width, o = t.height;
	if (s < 4 || o < 4) return;
	const i = Math.max(2, s * .995 + .5 | 0), e = Math.max(2, o * .995 + .5 | 0);
	let g;
	typeof OffscreenCanvas < "u" ? g = new OffscreenCanvas(i, e) : (g = document.createElement("canvas"), g.width = i, g.height = e);
	const l = g.getContext("2d", { willReadFrequently: !0 });
	l.drawImage(t, 0, 0, i, e);
	const h = l.getImageData(0, 0, i, e), w = new Uint32Array(h.data.buffer), u = t.getContext("2d", { willReadFrequently: !0 }), p = u.createImageData(s, o);
	Xt(w, i, e, new Uint32Array(p.data.buffer), s, o, n), u.putImageData(p, 0, 0);
}
function Ct(t) {
	for (let n = 1; n < 9; n++) {
		const s = t[n];
		let o = n - 1;
		for (; o >= 0 && t[o] > s;) t[o + 1] = t[o], o--;
		t[o + 1] = s;
	}
}
function Mt(t, n, s) {
	const o = t.length, i = new Uint8ClampedArray(o);
	i.set(t);
	const e = /* @__PURE__ */ new Uint8Array(9), g = /* @__PURE__ */ new Uint8Array(9), l = /* @__PURE__ */ new Uint8Array(9), h = n - 1, w = s - 1;
	for (let u = 0; u < s; u++) {
		const p = u * n;
		for (let y = 0; y < n; y++) {
			let _ = 0;
			for (let b = -1; b <= 1; b++) {
				const F = (u + b < 0 ? 0 : u + b > w ? w : u + b) * n;
				for (let x = -1; x <= 1; x++) {
					const T = F + (y + x < 0 ? 0 : y + x > h ? h : y + x) << 2;
					e[_] = t[T], g[_] = t[T + 1], l[_] = t[T + 2], _++;
				}
			}
			Ct(e), Ct(g), Ct(l);
			const m = p + y << 2;
			i[m] = e[4], i[m + 1] = g[4], i[m + 2] = l[4];
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
		const g = o.getImageData(0, 0, n, s);
		Mt(g.data, n, s), o.putImageData(g, 0, 0);
		return;
	}
	try {
		const g = `
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
    `, h = e.createShader(e.VERTEX_SHADER);
		e.shaderSource(h, g), e.compileShader(h);
		const w = e.createShader(e.FRAGMENT_SHADER);
		e.shaderSource(w, l), e.compileShader(w);
		const u = e.createProgram();
		e.attachShader(u, h), e.attachShader(u, w), e.linkProgram(u), e.useProgram(u);
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
		const y = e.getAttribLocation(u, "a_position");
		e.enableVertexAttribArray(y), e.vertexAttribPointer(y, 2, e.FLOAT, !1, 0, 0);
		const _ = e.getUniformLocation(u, "u_resolution");
		e.uniform2f(_, n, s);
		const m = e.createTexture();
		e.bindTexture(e.TEXTURE_2D, m), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, t), e.viewport(0, 0, n, s), e.drawArrays(e.TRIANGLES, 0, 6), o.drawImage(i, 0, 0);
	} catch {
		const g = o.getImageData(0, 0, n, s);
		Mt(g.data, n, s), o.putImageData(g, 0, 0);
	}
}
function qt(t, n = 1597463007) {
	let s = n || 305419896;
	const o = t.length;
	for (let i = 0; i < o; i += 4) {
		s ^= s << 13, s ^= s >>> 17, s ^= s << 5;
		const e = ((s & 1) === 0 ? 1 : -1) * ((s >>> 1 & 1) + 1), g = ((s >>> 2 & 1) === 0 ? 1 : -1) * ((s >>> 3 & 1) + 1), l = ((s >>> 4 & 1) === 0 ? 1 : -1) * ((s >>> 5 & 1) + 1);
		let h = t[i] + e, w = t[i + 1] + g, u = t[i + 2] + l;
		t[i] = h < 0 ? 0 : h > 255 ? 255 : h, t[i + 1] = w < 0 ? 0 : w > 255 ? 255 : w, t[i + 2] = u < 0 ? 0 : u > 255 ? 255 : u;
	}
}
function Gt(t, n, s) {
	for (let o = 0; o < s; o += 2) {
		const i = o + 1 < s, e = o * n, g = (o + 1) * n;
		for (let l = 0; l < n; l += 2) {
			const h = l + 1 < n, w = e + l << 2;
			let u = 1;
			const p = t[w], y = t[w + 1], _ = t[w + 2], m = .299 * p + .587 * y + .114 * _;
			let b = -.168736 * p - .331264 * y + .5 * _ + 128, F = .5 * p - .418688 * y - .081312 * _ + 128, x = 0, T = 0, L = 0, O = 0, I = 0, R = 0;
			if (h) {
				O = w + 4;
				const U = t[O], d = t[O + 1], v = t[O + 2];
				x = .299 * U + .587 * d + .114 * v, b += -.168736 * U - .331264 * d + .5 * v + 128, F += .5 * U - .418688 * d - .081312 * v + 128, u++;
			}
			if (i) {
				I = g + l << 2;
				const U = t[I], d = t[I + 1], v = t[I + 2];
				T = .299 * U + .587 * d + .114 * v, b += -.168736 * U - .331264 * d + .5 * v + 128, F += .5 * U - .418688 * d - .081312 * v + 128, u++;
			}
			if (i && h) {
				R = I + 4;
				const U = t[R], d = t[R + 1], v = t[R + 2];
				L = .299 * U + .587 * d + .114 * v, b += -.168736 * U - .331264 * d + .5 * v + 128, F += .5 * U - .418688 * d - .081312 * v + 128, u++;
			}
			const C = b / u - 128, E = F / u - 128;
			t[w] = m + 1.402 * E, t[w + 1] = m - .344136 * C - .714136 * E, t[w + 2] = m + 1.772 * C, h && (t[O] = x + 1.402 * E, t[O + 1] = x - .344136 * C - .714136 * E, t[O + 2] = x + 1.772 * C), i && (t[I] = T + 1.402 * E, t[I + 1] = T - .344136 * C - .714136 * E, t[I + 2] = T + 1.772 * C), i && h && (t[R] = L + 1.402 * E, t[R + 1] = L - .344136 * C - .714136 * E, t[R + 2] = L + 1.772 * C);
		}
	}
}
function jt(t, n = !0) {
	Nt(t, n), Wt(t);
	const s = t.getContext("2d", { willReadFrequently: !0 });
	if (s) {
		const o = s.getImageData(0, 0, t.width, t.height);
		Gt(o.data, t.width, t.height), qt(o.data), s.putImageData(o, 0, 0);
	}
}
const Vt = 1766015824, kt = 1665684045, zt = 1732332865, Yt = 1700284774, Ht = 1950701684, Jt = 2052348020, Zt = 1767135348, Kt = 1950960965, Qt = 1883789683, $t = 1229144912, te = 1163413830, ee = 1481461792;
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
		const g = n.getUint32(o, !1), l = n.getUint32(o + 4, !1), h = 12 + g;
		if (o + h > e) break;
		l === Vt || l === kt || l === zt || l === Yt || l === Ht || l === Jt || l === Zt || l === Kt || l === Qt || (s.set(t.subarray(o, o + h), i), i += h), o += h;
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
			const h = t.subarray(o);
			n.set(h, s), s += h.length;
			break;
		}
		if (o + 3 >= i) break;
		const g = 2 + (t[o + 2] << 8 | t[o + 3]);
		if (o + g > i) break;
		let l = !1;
		e === 226 ? o + 15 <= i && t[o + 4] === 73 && t[o + 5] === 67 && t[o + 6] === 67 && t[o + 7] === 95 && t[o + 8] === 80 && t[o + 9] === 82 && t[o + 10] === 79 && t[o + 11] === 70 && t[o + 12] === 73 && t[o + 13] === 76 && t[o + 14] === 69 && t[o + 15] === 0 && (l = !0) : (e === 225 || e === 237 || e === 238 || e === 254 || e >= 227 && e <= 239) && (l = !0), l || (n.set(t.subarray(o, o + g), s), s += g), o += g;
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
	let g = 12;
	const l = t.length;
	for (; g + 8 <= l;) {
		const p = n.getUint32(g, !1), y = n.getUint32(g + 4, !0), _ = 8 + (y + y % 2);
		if (g + _ > l) break;
		p === re ? (s = !0, e.push({
			offset: g,
			totalLen: _,
			type: p
		})) : p === fe || p === le ? (o = !0, e.push({
			offset: g,
			totalLen: _,
			type: p
		})) : p === ce ? i = {
			offset: g,
			totalLen: _
		} : p === ie || p === ae ? e.push({
			offset: g,
			totalLen: _,
			type: p
		}) : p === $t || p === te || p === ee || e.push({
			offset: g,
			totalLen: _,
			type: p
		}), g += _;
	}
	const h = new Uint8Array(t.length);
	h.set(t.subarray(0, 12), 0);
	const w = new DataView(h.buffer, h.byteOffset, h.byteLength);
	let u = 12;
	if ((s || o) && i) {
		h.set(t.subarray(i.offset, i.offset + i.totalLen), u);
		let p = 0;
		s && (p |= 16), o && (p |= 2), h[u + 8] = p, u += i.totalLen;
	}
	for (const p of e) h.set(t.subarray(p.offset, p.offset + p.totalLen), u), u += p.totalLen;
	return w.setUint32(4, u - 8, !0), h.subarray(0, u);
}
const ge = .02;
function we(t, n = ge, s = 1) {
	const o = 2 * Math.PI, i = 1 / 4294967296, e = /* @__PURE__ */ new Uint32Array(16384);
	let g = 16384;
	function l() {
		return g >= 16384 && (crypto.getRandomValues(e), g = 0), e[g++];
	}
	const h = t.length - 7;
	let w = 0;
	for (; w < h; w += 8) {
		const u = t[w], p = t[w + 1], y = t[w + 2], _ = t[w + 4], m = t[w + 5], b = t[w + 6], F = (l() + 1) * i, x = (l() + 1) * i, T = (l() + 1) * i, L = (l() + 1) * i, O = (l() + 1) * i, I = (l() + 1) * i, R = Math.sqrt(-2 * Math.log(F)), C = Math.sqrt(-2 * Math.log(T)), E = Math.sqrt(-2 * Math.log(O)), U = R * Math.cos(o * x), d = R * Math.sin(o * x), v = C * Math.cos(o * L), k = C * Math.sin(o * L), z = E * Math.cos(o * I), Y = E * Math.sin(o * I), B = Math.sqrt(n * (.2126 * u + .7152 * p + .0722 * y) + s), X = Math.sqrt(n * (.2126 * _ + .7152 * m + .0722 * b) + s), N = u + Math.round(U * B), H = p + Math.round(d * B), J = y + Math.round(v * B);
		t[w] = N < 0 ? 0 : N > 255 ? 255 : N, t[w + 1] = H < 0 ? 0 : H > 255 ? 255 : H, t[w + 2] = J < 0 ? 0 : J > 255 ? 255 : J;
		const M = _ + Math.round(k * X), P = m + Math.round(z * X), A = b + Math.round(Y * X);
		t[w + 4] = M < 0 ? 0 : M > 255 ? 255 : M, t[w + 5] = P < 0 ? 0 : P > 255 ? 255 : P, t[w + 6] = A < 0 ? 0 : A > 255 ? 255 : A;
	}
	if (w < t.length) {
		const u = t[w], p = t[w + 1], y = t[w + 2], _ = (l() + 1) * i, m = (l() + 1) * i, b = (l() + 1) * i, F = (l() + 1) * i, x = Math.sqrt(-2 * Math.log(_)), T = Math.sqrt(-2 * Math.log(b)), L = x * Math.cos(o * m), O = x * Math.sin(o * m), I = T * Math.cos(o * F), R = Math.sqrt(n * (.2126 * u + .7152 * p + .0722 * y) + s), C = u + Math.round(L * R), E = p + Math.round(O * R), U = y + Math.round(I * R);
		t[w] = C < 0 ? 0 : C > 255 ? 255 : C, t[w + 1] = E < 0 ? 0 : E > 255 ? 255 : E, t[w + 2] = U < 0 ? 0 : U > 255 ? 255 : U;
	}
}
let _t = null;
async function he() {
	if (_t) return _t;
	let t;
	if (typeof globalThis.process < "u" && globalThis.process?.versions?.node) {
		const s = await import("./__vite-browser-external-C3RYgusv.js").then((e) => Et(e.default, 1)), o = (await import("./__vite-browser-external-C3RYgusv.js").then((e) => Et(e.default, 1))).resolve(globalThis.process.cwd(), "src/core/wasm/deterministic_encoder.wasm"), i = s.readFileSync(o);
		t = i.buffer.slice(i.byteOffset, i.byteOffset + i.byteLength);
	} else {
		const s = new URL(new URL("deterministic_encoder-DTQagINg.wasm", import.meta.url).href, "" + import.meta.url).href;
		t = await (await fetch(s)).arrayBuffer();
	}
	const { instance: n } = await WebAssembly.instantiate(t, {});
	return _t = n, _t;
}
async function pe(t, n, s) {
	const { wasm_alloc: o, wasm_free: i, encode_deterministic_webp: e, get_output_len: g, memory: l } = (await he()).exports, h = t.length, w = o(h);
	try {
		new Uint8Array(l.buffer).set(t, w);
		const u = e(n, s, w, h), p = g(), y = new Uint8Array(p);
		return y.set(new Uint8Array(l.buffer, u, p)), y;
	} finally {
		i(w, h);
	}
}
const nt = 2048;
self.onmessage = async (t) => {
	const { buffer: n, mimeType: s, options: o, needsAlpha: i } = t.data;
	try {
		const e = new Blob([n], { type: s }), g = await createImageBitmap(e), l = g.width, h = g.height;
		g.close();
		const w = Math.ceil(l / nt), u = Math.ceil(h / nt), p = w * u, y = new OffscreenCanvas(l, h).getContext("2d", {
			alpha: i,
			willReadFrequently: !0
		});
		if (!y) throw new Error("WORKER_CONTEXT_FAILED");
		for (let x = 0; x < u; x++) for (let T = 0; T < w; T++) {
			const L = T * nt, O = x * nt, I = Math.min(nt, l - L), R = Math.min(nt, h - O), C = await createImageBitmap(e, L, O, I, R), E = new OffscreenCanvas(I, R), U = E.getContext("2d", {
				alpha: i,
				willReadFrequently: !0
			});
			St(C, E, o.defenseLevel === "standard" ? "hardened" : o.defenseLevel, i, !1), C.close(), jt(E, i);
			const v = U.getImageData(0, 0, I, R);
			we(v.data), U.putImageData(v, 0, 0), y.drawImage(E, L, O);
		}
		const b = ne(await pe(y.getImageData(0, 0, l, h).data, l, h), "image/webp"), F = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
		self.postMessage({
			buffer: F,
			tilesProcessed: p,
			wasmEncoded: !0
		}, [F]);
	} catch (e) {
		self.postMessage({ error: e.message || "Worker processing failed" });
	}
};
export { ye as t };

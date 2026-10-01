function Pt(t, n = !1) {
	if (t === "standard") return {
		theta: 0,
		sx: 1,
		sy: 1,
		noiseIntensity: 0
	};
	const f = /* @__PURE__ */ new Uint32Array(3);
	crypto.getRandomValues(f);
	const c = .1 + f[0] / 4294967295 * .2, a = (f[0] % 2 === 0 ? 1 : -1) * (c * Math.PI) / 180, e = .995 + f[1] / 4294967295 * .004;
	let l = .995 + f[2] / 4294967295 * .004;
	return e - l > -5e-4 && e - l < 5e-4 && (l = e < .997 ? e + 6e-4 : e - 6e-4), {
		theta: a,
		sx: e,
		sy: l,
		noiseIntensity: n ? 0 : 2
	};
}
function z(t) {
	const n = t < 0 ? -t : t;
	return n < 1 ? n * n * (1.5 * n - 2.5) + 1 : n < 2 ? n * n * (-.5 * n + 2.5) - 4 * n + 2 : 0;
}
function Tt(t, n, f, c = !0, a = !1) {
	const e = t.width, l = t.height;
	if (f === "standard") {
		n.width = e, n.height = l, n.getContext("2d", {
			willReadFrequently: !0,
			alpha: c
		}).drawImage(t, 0, 0);
		return;
	}
	const g = Pt(f, a), w = new OffscreenCanvas(e, l).getContext("2d", { willReadFrequently: !0 });
	w.drawImage(t, 0, 0);
	const d = w.getImageData(0, 0, e, l), u = new Uint32Array(d.data.buffer), h = 3, m = e - 6, y = l - 6;
	n.width = m, n.height = y;
	const x = n.getContext("2d", {
		willReadFrequently: !0,
		alpha: c
	}), C = x.createImageData(m, y), v = new Uint32Array(C.data.buffer), R = Math.cos(g.theta), P = Math.sin(g.theta), W = g.sx * R, S = -g.sy * P, L = g.sx * P, X = g.sy * R, U = W * X - S * L, k = X / U, B = -S / U, p = -L / U, I = W / U, j = e * .5, Y = l * .5, H = /* @__PURE__ */ new Uint32Array(1);
	crypto.getRandomValues(H);
	let O = H[0] || 305419896;
	const G = l - 1, q = e - 1;
	let tt = 0;
	const et = g.noiseIntensity > 0;
	for (let _ = 0; _ < y; _++) {
		const b = _ + h - Y, A = -j + h;
		let E = A * k + b * B + j, nt = A * p + b * I + Y;
		for (let it = 0; it < m; it++) {
			const V = Math.floor(E), N = Math.floor(nt), o = E - V, s = nt - N, J = z(o + 1), K = z(o), Z = z(o - 1), $ = z(o - 2), ot = z(s + 1), st = z(s), ct = z(s - 1), rt = z(s - 2), ft = (N - 1 < 0 ? 0 : N - 1 > G ? G : N - 1) * e, at = (N < 0 ? 0 : N > G ? G : N) * e, lt = (N + 1 < 0 ? 0 : N + 1 > G ? G : N + 1) * e, ut = (N + 2 < 0 ? 0 : N + 2 > G ? G : N + 2) * e, gt = V - 1 < 0 ? 0 : V - 1 > q ? q : V - 1, wt = V < 0 ? 0 : V > q ? q : V, ht = V + 1 < 0 ? 0 : V + 1 > q ? q : V + 1, dt = V + 2 < 0 ? 0 : V + 2 > q ? q : V + 2;
			let F = 0, D = 0, M = 0, T = 0;
			if (ot !== 0) {
				if (J !== 0) {
					const r = u[ft + gt], i = J * ot;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
				if (K !== 0) {
					const r = u[ft + wt], i = K * ot;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
				if (Z !== 0) {
					const r = u[ft + ht], i = Z * ot;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
				if ($ !== 0) {
					const r = u[ft + dt], i = $ * ot;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
			}
			if (st !== 0) {
				if (J !== 0) {
					const r = u[at + gt], i = J * st;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
				if (K !== 0) {
					const r = u[at + wt], i = K * st;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
				if (Z !== 0) {
					const r = u[at + ht], i = Z * st;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
				if ($ !== 0) {
					const r = u[at + dt], i = $ * st;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
			}
			if (ct !== 0) {
				if (J !== 0) {
					const r = u[lt + gt], i = J * ct;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
				if (K !== 0) {
					const r = u[lt + wt], i = K * ct;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
				if (Z !== 0) {
					const r = u[lt + ht], i = Z * ct;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
				if ($ !== 0) {
					const r = u[lt + dt], i = $ * ct;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
			}
			if (rt !== 0) {
				if (J !== 0) {
					const r = u[ut + gt], i = J * rt;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
				if (K !== 0) {
					const r = u[ut + wt], i = K * rt;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
				if (Z !== 0) {
					const r = u[ut + ht], i = Z * rt;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
				if ($ !== 0) {
					const r = u[ut + dt], i = $ * rt;
					F += (r & 255) * i, D += (r >> 8 & 255) * i, M += (r >> 16 & 255) * i, T += (r >>> 24 & 255) * i;
				}
			}
			let yt = 0;
			et && (O ^= O << 13, O ^= O >>> 17, O ^= O << 5, yt = (O & 255) % 5 - 2);
			const xt = F + yt, pt = D + yt, mt = M + yt, Et = xt < 0 ? 0 : xt >= 255.5 ? 255 : xt + .5 | 0, Rt = pt < 0 ? 0 : pt >= 255.5 ? 255 : pt + .5 | 0, bt = mt < 0 ? 0 : mt >= 255.5 ? 255 : mt + .5 | 0, At = c ? T < 0 ? 0 : T >= 255.5 ? 255 : T + .5 | 0 : 255;
			v[tt++] = Et | Rt << 8 | bt << 16 | At << 24, E += k, nt += p;
		}
	}
	x.putImageData(C, 0, 0);
}
function Q(t) {
	const n = t < 0 ? -t : t;
	return n < 1 ? n * n * (1.5 * n - 2.5) + 1 : n < 2 ? n * n * (-.5 * n + 2.5) - 4 * n + 2 : 0;
}
function Ut(t, n, f, c, a, e, l = !0) {
	const g = n / a, w = f / e, d = f - 1, u = n - 1;
	let h = 0;
	for (let m = 0; m < e; m++) {
		const y = (m + .5) * w - .5, x = Math.floor(y), C = y - x, v = Q(C + 1), R = Q(C), P = Q(C - 1), W = Q(C - 2), S = (x - 1 < 0 ? 0 : x - 1 >= f ? d : x - 1) * n, L = (x < 0 ? 0 : x >= f ? d : x) * n, X = (x + 1 < 0 ? 0 : x + 1 >= f ? d : x + 1) * n, U = (x + 2 < 0 ? 0 : x + 2 >= f ? d : x + 2) * n;
		for (let k = 0; k < a; k++) {
			const B = (k + .5) * g - .5, p = Math.floor(B), I = B - p, j = Q(I + 1), Y = Q(I), H = Q(I - 1), O = Q(I - 2), G = p - 1 < 0 ? 0 : p - 1 >= n ? u : p - 1, q = p < 0 ? 0 : p >= n ? u : p, tt = p + 1 < 0 ? 0 : p + 1 >= n ? u : p + 1, et = p + 2 < 0 ? 0 : p + 2 >= n ? u : p + 2;
			let _ = 0, b = 0, A = 0, E = 0;
			if (v !== 0) {
				if (j !== 0) {
					const o = t[S + G], s = j * v;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
				if (Y !== 0) {
					const o = t[S + q], s = Y * v;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
				if (H !== 0) {
					const o = t[S + tt], s = H * v;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
				if (O !== 0) {
					const o = t[S + et], s = O * v;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
			}
			if (R !== 0) {
				if (j !== 0) {
					const o = t[L + G], s = j * R;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
				if (Y !== 0) {
					const o = t[L + q], s = Y * R;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
				if (H !== 0) {
					const o = t[L + tt], s = H * R;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
				if (O !== 0) {
					const o = t[L + et], s = O * R;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
			}
			if (P !== 0) {
				if (j !== 0) {
					const o = t[X + G], s = j * P;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
				if (Y !== 0) {
					const o = t[X + q], s = Y * P;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
				if (H !== 0) {
					const o = t[X + tt], s = H * P;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
				if (O !== 0) {
					const o = t[X + et], s = O * P;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
			}
			if (W !== 0) {
				if (j !== 0) {
					const o = t[U + G], s = j * W;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
				if (Y !== 0) {
					const o = t[U + q], s = Y * W;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
				if (H !== 0) {
					const o = t[U + tt], s = H * W;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
				if (O !== 0) {
					const o = t[U + et], s = O * W;
					_ += (o & 255) * s, b += (o >> 8 & 255) * s, A += (o >> 16 & 255) * s, E += (o >>> 24 & 255) * s;
				}
			}
			const nt = _ < 0 ? 0 : _ >= 255.5 ? 255 : _ + .5 | 0, it = b < 0 ? 0 : b >= 255.5 ? 255 : b + .5 | 0, V = A < 0 ? 0 : A >= 255.5 ? 255 : A + .5 | 0, N = l ? E < 0 ? 0 : E >= 255.5 ? 255 : E + .5 | 0 : 255;
			c[h++] = nt | it << 8 | V << 16 | N << 24;
		}
	}
}
function It(t, n = !0) {
	const f = t.width, c = t.height;
	if (f < 4 || c < 4) return;
	const a = Math.max(2, f * .995 + .5 | 0), e = Math.max(2, c * .995 + .5 | 0);
	let l;
	typeof OffscreenCanvas < "u" ? l = new OffscreenCanvas(a, e) : (l = document.createElement("canvas"), l.width = a, l.height = e);
	const g = l.getContext("2d", { willReadFrequently: !0 });
	g.drawImage(t, 0, 0, a, e);
	const w = g.getImageData(0, 0, a, e), d = new Uint32Array(w.data.buffer), u = t.getContext("2d", { willReadFrequently: !0 }), h = u.createImageData(f, c);
	Ut(d, a, e, new Uint32Array(h.data.buffer), f, c, n), u.putImageData(h, 0, 0);
}
function Ct(t) {
	for (let n = 1; n < 9; n++) {
		const f = t[n];
		let c = n - 1;
		for (; c >= 0 && t[c] > f;) t[c + 1] = t[c], c--;
		t[c + 1] = f;
	}
}
function _t(t, n, f) {
	const c = t.length, a = new Uint8ClampedArray(c);
	a.set(t);
	const e = /* @__PURE__ */ new Uint8Array(9), l = /* @__PURE__ */ new Uint8Array(9), g = /* @__PURE__ */ new Uint8Array(9), w = n - 1, d = f - 1;
	for (let u = 0; u < f; u++) {
		const h = u * n;
		for (let m = 0; m < n; m++) {
			let y = 0;
			for (let C = -1; C <= 1; C++) {
				const v = (u + C < 0 ? 0 : u + C > d ? d : u + C) * n;
				for (let R = -1; R <= 1; R++) {
					const P = v + (m + R < 0 ? 0 : m + R > w ? w : m + R) << 2;
					e[y] = t[P], l[y] = t[P + 1], g[y] = t[P + 2], y++;
				}
			}
			Ct(e), Ct(l), Ct(g);
			const x = h + m << 2;
			a[x] = e[4], a[x + 1] = l[4], a[x + 2] = g[4];
		}
	}
	t.set(a);
}
function vt(t) {
	const n = t.width, f = t.height;
	if (n < 3 || f < 3) return;
	const c = t.getContext("2d", { willReadFrequently: !0 });
	if (!c) return;
	let a = null, e = null;
	try {
		typeof OffscreenCanvas < "u" ? a = new OffscreenCanvas(n, f) : (a = document.createElement("canvas"), a.width = n, a.height = f), e = a.getContext("webgl");
	} catch {
		e = null;
	}
	if (!e) {
		const l = c.getImageData(0, 0, n, f);
		_t(l.data, n, f), c.putImageData(l, 0, 0);
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
    `, w = e.createShader(e.VERTEX_SHADER);
		e.shaderSource(w, l), e.compileShader(w);
		const d = e.createShader(e.FRAGMENT_SHADER);
		e.shaderSource(d, g), e.compileShader(d);
		const u = e.createProgram();
		e.attachShader(u, w), e.attachShader(u, d), e.linkProgram(u), e.useProgram(u);
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
		const m = e.getAttribLocation(u, "a_position");
		e.enableVertexAttribArray(m), e.vertexAttribPointer(m, 2, e.FLOAT, !1, 0, 0);
		const y = e.getUniformLocation(u, "u_resolution");
		e.uniform2f(y, n, f);
		const x = e.createTexture();
		e.bindTexture(e.TEXTURE_2D, x), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, t), e.viewport(0, 0, n, f), e.drawArrays(e.TRIANGLES, 0, 6), c.drawImage(a, 0, 0);
	} catch {
		const l = c.getImageData(0, 0, n, f);
		_t(l.data, n, f), c.putImageData(l, 0, 0);
	}
}
function Ft(t, n = 1597463007) {
	let f = n || 305419896;
	const c = t.length;
	for (let a = 0; a < c; a += 4) {
		f ^= f << 13, f ^= f >>> 17, f ^= f << 5;
		const e = ((f & 1) === 0 ? 1 : -1) * ((f >>> 1 & 1) + 1), l = ((f >>> 2 & 1) === 0 ? 1 : -1) * ((f >>> 3 & 1) + 1), g = ((f >>> 4 & 1) === 0 ? 1 : -1) * ((f >>> 5 & 1) + 1);
		let w = t[a] + e, d = t[a + 1] + l, u = t[a + 2] + g;
		t[a] = w < 0 ? 0 : w > 255 ? 255 : w, t[a + 1] = d < 0 ? 0 : d > 255 ? 255 : d, t[a + 2] = u < 0 ? 0 : u > 255 ? 255 : u;
	}
}
function Dt(t, n, f) {
	for (let c = 0; c < f; c += 2) {
		const a = c + 1 < f, e = c * n, l = (c + 1) * n;
		for (let g = 0; g < n; g += 2) {
			const w = g + 1 < n, d = e + g << 2;
			let u = 1;
			const h = t[d], m = t[d + 1], y = t[d + 2], x = .299 * h + .587 * m + .114 * y;
			let C = -.168736 * h - .331264 * m + .5 * y + 128, v = .5 * h - .418688 * m - .081312 * y + 128, R = 0, P = 0, W = 0, S = 0, L = 0, X = 0;
			if (w) {
				S = d + 4;
				const B = t[S], p = t[S + 1], I = t[S + 2];
				R = .299 * B + .587 * p + .114 * I, C += -.168736 * B - .331264 * p + .5 * I + 128, v += .5 * B - .418688 * p - .081312 * I + 128, u++;
			}
			if (a) {
				L = l + g << 2;
				const B = t[L], p = t[L + 1], I = t[L + 2];
				P = .299 * B + .587 * p + .114 * I, C += -.168736 * B - .331264 * p + .5 * I + 128, v += .5 * B - .418688 * p - .081312 * I + 128, u++;
			}
			if (a && w) {
				X = L + 4;
				const B = t[X], p = t[X + 1], I = t[X + 2];
				W = .299 * B + .587 * p + .114 * I, C += -.168736 * B - .331264 * p + .5 * I + 128, v += .5 * B - .418688 * p - .081312 * I + 128, u++;
			}
			const U = C / u - 128, k = v / u - 128;
			t[d] = x + 1.402 * k, t[d + 1] = x - .344136 * U - .714136 * k, t[d + 2] = x + 1.772 * U, w && (t[S] = R + 1.402 * k, t[S + 1] = R - .344136 * U - .714136 * k, t[S + 2] = R + 1.772 * U), a && (t[L] = P + 1.402 * k, t[L + 1] = P - .344136 * U - .714136 * k, t[L + 2] = P + 1.772 * U), a && w && (t[X] = W + 1.402 * k, t[X + 1] = W - .344136 * U - .714136 * k, t[X + 2] = W + 1.772 * U);
		}
	}
}
function Mt(t, n = !0) {
	It(t, n), vt(t);
	const f = t.getContext("2d", { willReadFrequently: !0 });
	if (f) {
		const c = f.getImageData(0, 0, t.width, t.height);
		Dt(c.data, t.width, t.height), Ft(c.data), f.putImageData(c, 0, 0);
	}
}
const Lt = 1766015824, Bt = 1665684045, Ot = 1732332865, St = 1700284774, Xt = 1950701684, kt = 2052348020, Vt = 1767135348, Nt = 1950960965, Wt = 1883789683, Gt = 1229144912, qt = 1163413830, jt = 1481461792;
function Yt(t, n) {
	return t.length < 12 ? t : n === "image/png" || t[0] === 137 && t[1] === 80 && t[2] === 78 && t[3] === 71 ? Ht(t) : n === "image/jpeg" || t[0] === 255 && t[1] === 216 ? Jt(t) : n === "image/webp" || t[0] === 82 && t[1] === 73 && t[2] === 70 && t[3] === 70 ? ee(t) : t;
}
function Ht(t) {
	if (t.length < 8) return t;
	const n = new DataView(t.buffer, t.byteOffset, t.byteLength);
	if (n.getUint32(0, !1) !== 2303741511 || n.getUint32(4, !1) !== 218765834) return t;
	const f = new Uint8Array(t.length);
	f.set(t.subarray(0, 8), 0);
	let c = 8, a = 8;
	const e = t.length;
	for (; c + 8 <= e;) {
		const l = n.getUint32(c, !1), g = n.getUint32(c + 4, !1), w = 12 + l;
		if (c + w > e) break;
		g === Lt || g === Bt || g === Ot || g === St || g === Xt || g === kt || g === Vt || g === Nt || g === Wt || (f.set(t.subarray(c, c + w), a), a += w), c += w;
	}
	return f.subarray(0, a);
}
function Jt(t) {
	if (t.length < 4 || t[0] !== 255 || t[1] !== 216) return t;
	const n = new Uint8Array(t.length);
	n[0] = 255, n[1] = 216;
	let f = 2, c = 2;
	const a = t.length;
	for (; c < a - 1;) {
		if (t[c] !== 255) {
			n[f++] = t[c++];
			continue;
		}
		const e = t[c + 1];
		if (e === 255 || e === 0) {
			n[f++] = t[c++];
			continue;
		}
		if (e === 217) {
			n[f++] = 255, n[f++] = 217;
			break;
		}
		if (e === 218) {
			const w = t.subarray(c);
			n.set(w, f), f += w.length;
			break;
		}
		if (c + 3 >= a) break;
		const l = 2 + (t[c + 2] << 8 | t[c + 3]);
		if (c + l > a) break;
		let g = !1;
		e === 226 ? c + 15 <= a && t[c + 4] === 73 && t[c + 5] === 67 && t[c + 6] === 67 && t[c + 7] === 95 && t[c + 8] === 80 && t[c + 9] === 82 && t[c + 10] === 79 && t[c + 11] === 70 && t[c + 12] === 73 && t[c + 13] === 76 && t[c + 14] === 69 && t[c + 15] === 0 && (g = !0) : (e === 225 || e === 237 || e === 238 || e === 254 || e >= 227 && e <= 239) && (g = !0), g || (n.set(t.subarray(c, c + l), f), f += l), c += l;
	}
	return n.subarray(0, f);
}
const Kt = 1448097880, Zt = 1095520328, $t = 1448097824, zt = 1448097868, Qt = 1095649613, te = 1095650630;
function ee(t) {
	if (t.length < 12) return t;
	const n = new DataView(t.buffer, t.byteOffset, t.byteLength);
	if (n.getUint32(0, !1) !== 1380533830 || n.getUint32(8, !1) !== 1464156752) return t;
	let f = !1, c = !1, a = null;
	const e = [];
	let l = 12;
	const g = t.length;
	for (; l + 8 <= g;) {
		const h = n.getUint32(l, !1), m = n.getUint32(l + 4, !0), y = 8 + (m + m % 2);
		if (l + y > g) break;
		h === Zt ? (f = !0, e.push({
			offset: l,
			totalLen: y,
			type: h
		})) : h === Qt || h === te ? (c = !0, e.push({
			offset: l,
			totalLen: y,
			type: h
		})) : h === Kt ? a = {
			offset: l,
			totalLen: y
		} : h === $t || h === zt ? e.push({
			offset: l,
			totalLen: y,
			type: h
		}) : h === Gt || h === qt || h === jt || e.push({
			offset: l,
			totalLen: y,
			type: h
		}), l += y;
	}
	const w = new Uint8Array(t.length);
	w.set(t.subarray(0, 12), 0);
	const d = new DataView(w.buffer, w.byteOffset, w.byteLength);
	let u = 12;
	if ((f || c) && a) {
		w.set(t.subarray(a.offset, a.offset + a.totalLen), u);
		let h = 0;
		f && (h |= 16), c && (h |= 2), w[u + 8] = h, u += a.totalLen;
	}
	for (const h of e) w.set(t.subarray(h.offset, h.offset + h.totalLen), u), u += h.totalLen;
	return d.setUint32(4, u - 8, !0), w.subarray(0, u);
}
self.onmessage = async (t) => {
	const { buffer: n, mimeType: f, options: c, needsAlpha: a } = t.data;
	try {
		const e = new Blob([n], { type: f }), l = await createImageBitmap(e);
		let g = l.width, w = l.height;
		const d = Math.max(g, w);
		let u = l;
		if (d > 1920) {
			const R = 1920 / d;
			g = Math.floor(g * R), w = Math.floor(w * R);
			const P = new OffscreenCanvas(g, w);
			P.getContext("2d", {
				alpha: a,
				willReadFrequently: !0
			}).drawImage(l, 0, 0, g, w), u = P;
		}
		const h = new OffscreenCanvas(g, w);
		if (!h.getContext("2d", {
			alpha: a,
			willReadFrequently: !0
		})) throw new Error("WORKER_CONTEXT_FAILED");
		const m = c.defenseLevel === "standard" ? "hardened" : c.defenseLevel;
		Tt(u, h, m, a, !1), l.close(), Mt(h, a);
		const y = "image/webp", x = await (await h.convertToBlob({
			type: y,
			quality: .6
		})).arrayBuffer(), C = new Uint8Array(x);
		!a && C.length >= 16 && String.fromCharCode(C[12], C[13], C[14], C[15]) === "VP8X" && console.warn("Residual extended chunks detected: FourCC equals VP8X on intended non-transparent media.");
		const v = Yt(C, y).buffer;
		self.postMessage({ buffer: v }, [v]);
	} catch (e) {
		self.postMessage({ error: e.message || "Worker processing failed" });
	}
};

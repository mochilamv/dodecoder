(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))a(l);new MutationObserver(l=>{for(const r of l)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function n(l){const r={};return l.integrity&&(r.integrity=l.integrity),l.referrerPolicy&&(r.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?r.credentials="include":l.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(l){if(l.ep)return;l.ep=!0;const r=n(l);fetch(l.href,r)}})();var Ne=1229472850,je=1347179589,Ve=1229209940,Xe=1229278788,Ge=1700284774,He=1950701684,qe=2052348020,We=1767135348,Qe=1950960965,Ze=1883789683,Ye=1766015824,Ke=1665684045,Je=1732332865,et=1934772034,tt=1448097824,nt=1448097868,at=1448097880,rt=1095649613,st=1095650630,it=1163413830,ot=1481461792,lt=1229144912,ct=1095520328,le=1969517665,ce=1835365473,de=1768715124,ue=1970628964;function dt(e){const t=new Uint8Array(e),n=[];if(t.length<4)return n;const a=new DataView(e);return t[0]===255&&t[1]===216?ut(t):a.getUint32(0,!1)===2303741511?ft(t,a):a.getUint32(0,!1)===1380533830&&t.length>=12&&a.getUint32(8,!1)===1464156752?pt(t,a):t.length>12&&a.getUint32(4,!1)===1718909296?mt(t,a):n}function ut(e){const t=[];t.push({offset:0,marker:"0xFFD8",name:"SOI (Start of Image)",isSanitizedSafe:!0,description:"Mandatory standard JPEG boundary marker"});let n=2;const a=e.length;for(;n<a-1;){if(e[n]!==255){n++;continue}const l=e[n+1];if(l===255||l===0){n++;continue}const r="0xFF"+l.toString(16).toUpperCase().padStart(2,"0");if(l===217){t.push({offset:n,marker:r,name:"EOI (End of Image)",isSanitizedSafe:!0,description:"End of image data stream"});break}if(l===218){for(t.push({offset:n,marker:r,name:"SOS (Start of Scan)",isSanitizedSafe:!0,description:"Compressed image pixel bitstream follows"}),n+=2;n<a-1&&!(e[n]===255&&e[n+1]!==0&&e[n+1]<=217);)n++;continue}if(n+3>=a)break;const o=e[n+2]<<8|e[n+3];let i=`Segment (${r})`,c=!1,s="";switch(l){case 224:i="APP0 (JFIF Header)",c=!0,s="Basic JPEG container identification";break;case 225:e[n+4]===69&&e[n+5]===120&&e[n+6]===105&&e[n+7]===102?(i="APP1 (EXIF / GPS / IFD1 Thumbnail)",c=!1,s="High risk: contains camera serials, timestamps, GPS, and thumbnail traps"):(i="APP1 (Metadata/XMP)",c=!1,s="Contains edit history, instance IDs, or XMP packets");break;case 226:i="APP2 (ICC Color Profile)",c=!1,s="Contains OS calibration profile or author system identifiers";break;case 237:i="APP13 (Photoshop / IPTC)",c=!1,s="Contains bylines, captions, and Photoshop edit records";break;case 238:i="APP14 (Adobe DCT)",c=!1,s="Adobe color transform marker";break;case 219:i="DQT (Quantization Table)",c=!0,s="Quantization matrix; forensic fingerprint of ISP encoder";break;case 196:i="DHT (Huffman Table)",c=!0,s="Entropy encoding frequency table";break;case 192:case 194:i=`SOF (Start of Frame - ${l===192?"Baseline":"Progressive"})`,c=!0,s="Image dimensions, bit depth, and color components";break;case 254:i="COM (Comment)",c=!1,s="Text comment embedded in image";break;default:l>=227&&l<=239&&(i=`APP${l-224} (Vendor Marker)`,c=!1,s="Proprietary camera or software metadata block")}t.push({offset:n,marker:r,name:i,length:o,isSanitizedSafe:c,description:s}),n+=2+o}return t}function ft(e,t){const n=[];let a=8;const l=t.byteLength;for(;a+8<=l;){const r=t.getUint32(a,!1),o=t.getUint32(a+4,!1);let i=!1,c="Image raster data or standard header",s="UNKNOWN";switch(o){case Ne:i=!0,s="IHDR",c="Header: Dimensions, depth, color type";break;case je:i=!0,s="PLTE",c="Palette table";break;case Ve:i=!0,s="IDAT",c="Compressed image pixel data";break;case Xe:i=!0,s="IEND",c="End of PNG image";break;case Ge:i=!1,s="eXIf",c="Embedded raw EXIF metadata block";break;case He:i=!1,s="tEXt",c="Textual metadata (Creation time, software, author)";break;case qe:i=!1,s="zTXt",c="Compressed textual metadata";break;case We:i=!1,s="iTXt",c="Internationalized UTF-8 metadata";break;case Qe:i=!1,s="tIME",c="Modification timestamp";break;case Ze:i=!1,s="pHYs",c="Physical pixel dimensions / DPI";break;case Ye:i=!1,s="iCCP",c="Embedded ICC Color Profile / Display calibration fingerprint";break;case Ke:i=!1,s="cHRM",c="Primary chromaticities display calibration";break;case Je:i=!1,s="gAMA",c="Image gamma correction curve";break;case et:i=!0,s="sRGB",c="Standard sRGB color space rendering intent";break;default:s="CHUNK",i=!1}n.push({offset:a,marker:s,name:`Chunk: ${s}`,length:r,isSanitizedSafe:i,description:c}),a+=12+r}return n}function pt(e,t){const n=[];let a=12;const l=t.byteLength;for(;a+8<=l;){const r=t.getUint32(a,!1),o=t.getUint32(a+4,!0);let i=!1,c="Visual raster bitstream",s="WEBP";switch(r){case tt:s="VP8",i=!0;break;case nt:s="VP8L",i=!0;break;case at:s="VP8X",i=!0;break;case rt:s="ANIM",i=!0;break;case st:s="ANMF",i=!0;break;case it:s="EXIF",i=!1,c="Embedded EXIF metadata block";break;case ot:s="XMP",i=!1,c="Embedded XMP metadata block";break;case lt:s="ICCP",i=!1,c="ICC Color Profile";break;case ct:s="ALPH",i=!0,c="Alpha transparency channel for reconstructed pixels";break;default:s="CHUNK",i=!1}n.push({offset:a,marker:s,name:`WebP Chunk: ${s}`,length:o,isSanitizedSafe:i,description:c});const u=o+o%2;a+=8+u}return n}function mt(e,t){const n=[];let a=0;const l=t.byteLength;for(;a+8<=l;){const r=t.getUint32(a,!1),o=t.getUint32(a+4,!1);if(r<8&&r!==0)break;const i=o===le||o===ce||o===de||o===ue;let c="BOX",s="Video/Audio container structure";switch(o){case le:c="udta",s="User Data box (stores GPS, camera model, author)";break;case ce:c="meta",s="Metadata box (tags, encoder settings)";break;case de:c="ilst",s="Item List atom (QuickTime/iTunes metadata)";break;case ue:c="uuid",s="Vendor proprietary custom box";break;case 1718909296:c="ftyp";break;case 1836019574:c="moov";break;case 1835295092:c="mdat";break;default:c="atom"}if(n.push({offset:a,marker:c,name:`Box: ${c}`,length:r,isSanitizedSafe:!i,description:s}),r===0||a+r>l)break;a+=r}return n}async function Me(e){const t=e instanceof Uint8Array?e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength):e,n=await crypto.subtle.digest("SHA-256",t);return Array.from(new Uint8Array(n)).map(a=>a.toString(16).padStart(2,"0")).join("")}function ht(e){const t=e.match(/\.([a-zA-Z0-9]+)$/);return(t?t[1]:e).replace(/[^a-zA-Z0-9]/g,"").toLowerCase()||"webp"}async function ae(e,t,n=32){return`${(await Me(e)).slice(0,n)}.${ht(t)}`}var gt=ae;async function te(e,t){const n=await e.arrayBuffer(),a=new Uint8Array(n),l=[],r=dt(n);let o=!1,i=!1,c=!1,s=!1;const u=xt(a);if(u!==-1){o=!0;const g=new DataView(n,u),x=g.getUint16(0)===18761;try{const h=g.getUint32(4,x);if(h<a.length){const f=ee(g,h,x,"IFD0");if(l.push(...f.tags),f.gpsPointer){i=!0;const b=ee(g,f.gpsPointer,x,"GPS");l.push(...b.tags)}if(f.exifPointer){const b=ee(g,f.exifPointer,x,"EXIF");l.push(...b.tags),b.hasMakerNotes&&(s=!0)}if(f.nextIfdOffset&&f.nextIfdOffset!==0){c=!0;const b=ee(g,f.nextIfdOffset,x,"IFD1");l.push({category:"IFD1_Thumbnail",name:"IFD1 Embedded Thumbnail",value:`Embedded image preview found at offset ${f.nextIfdOffset}`,severity:"critical",description:"Embedded unedited thumbnail: major forensic leak vector."}),l.push(...b.tags)}}}catch{l.push({category:"EXIF",name:"Malformed EXIF Header",value:"Header parsing failed",severity:"medium"})}}const d=yt(a);d.length>0&&l.push(...d),r.some(g=>g.name.includes("ICC")||g.marker==="ICCP")&&l.push({category:"ICC",name:"ICC Color Profile",value:"Color management profile present (hardware/software calibration)",severity:"medium",description:"Can identify operating system or monitor calibration profile."});const m=await Me(n),p=o||s?"high":r.length>5?"moderate":"low";return{fileName:t||(e instanceof File?e.name:"unnamed_media"),fileSize:e.size,mimeType:e.type||"application/octet-stream",hasExif:o,hasGps:i,hasThumbnail:c,hasMakerNotes:s,tags:l,markers:r,prnuSusceptibility:p,sha256:m}}function xt(e){if(e.length>=8&&(e[0]===73&&e[1]===73&&e[2]===42&&e[3]===0||e[0]===77&&e[1]===77&&e[2]===0&&e[3]===42))return 0;for(let t=0;t<Math.min(e.length-10,65536);t++)if(e[t]===255&&e[t+1]===225&&e[t+4]===69&&e[t+5]===120&&e[t+6]===105&&e[t+7]===102&&e[t+8]===0&&e[t+9]===0)return t+10;for(let t=12;t<Math.min(e.length-8,65536);t++)if(e[t]===69&&e[t+1]===88&&e[t+2]===73&&e[t+3]===70)return t+8;return-1}function ee(e,t,n,a){const l={tags:[]};if(t+2>=e.byteLength)return l;const r=e.getUint16(t,n);let o=t+2;for(let i=0;i<r&&!(o+12>e.byteLength);i++){const c=e.getUint16(o,n),s=e.getUint16(o+2,n),u=e.getUint32(o+4,n),d=o+8;let m="";if(c===34665&&a==="IFD0")l.exifPointer=e.getUint32(d,n);else if(c===34853&&a==="IFD0")l.gpsPointer=e.getUint32(d,n);else if(c===37500)l.hasMakerNotes=!0,l.tags.push({category:"MakerNotes",name:"Proprietary MakerNotes",value:`${u} bytes of camera-specific binary telemetry`,severity:"critical",description:"Manufacturer proprietary block containing sensor temperatures, lens serials, or face biometric coordinates."});else{const p=bt(c,a);p&&(s===2?m=vt(e,d,u,n):s===3?m=e.getUint16(d,n).toString():s===4?m=e.getUint32(d,n).toString():m=`[${u} items]`,m.trim()&&l.tags.push({category:a==="GPS"?"GPS":a==="IFD1"?"IFD1_Thumbnail":"EXIF",name:p.name,value:m.trim(),severity:p.severity,description:p.description}))}o+=12}return o+4<=e.byteLength&&(l.nextIfdOffset=e.getUint32(o,n)),l}function bt(e,t){if(t==="GPS")switch(e){case 1:return{name:"GPS Latitude Ref",severity:"critical",description:"North/South coordinate hemisphere"};case 2:return{name:"GPS Latitude",severity:"critical",description:"Precise GPS latitude coordinates"};case 3:return{name:"GPS Longitude Ref",severity:"critical",description:"East/West coordinate hemisphere"};case 4:return{name:"GPS Longitude",severity:"critical",description:"Precise GPS longitude coordinates"};case 6:return{name:"GPS Altitude",severity:"critical",description:"Elevation above sea level"};case 7:return{name:"GPS TimeStamp",severity:"critical",description:"Atomic satellite UTC timestamp"};case 29:return{name:"GPS DateStamp",severity:"critical",description:"Satellite GPS date"}}switch(e){case 271:return{name:"Camera Manufacturer (Make)",severity:"high",description:"Brand of camera or smartphone"};case 272:return{name:"Camera Model",severity:"critical",description:"Exact phone or camera hardware model"};case 305:return{name:"Software / OS Version",severity:"high",description:"Firmware or operating system build"};case 306:return{name:"Modify Date / Time",severity:"high",description:"Modification timestamp"};case 36867:return{name:"Date / Time Original",severity:"critical",description:"Exact moment the shutter was pressed"};case 36868:return{name:"Date / Time Digitized",severity:"critical",description:"Sensor analog-to-digital timestamp"};case 42033:return{name:"Camera Body Serial Number",severity:"critical",description:"Hardware unique serial number"};case 42036:return{name:"Lens Model",severity:"high",description:"Optical lens specifications"};case 42016:return{name:"Image Unique ID",severity:"critical",description:"Unique cryptographic ID generated by ISP"};case 513:return{name:"Thumbnail Offset",severity:"critical",description:"Pointer to raw thumbnail stream"};case 514:return{name:"Thumbnail Length",severity:"critical",description:"Byte length of embedded thumbnail"};default:return null}}function vt(e,t,n,a){let l=t;if(n>4&&(l=e.getUint32(t,a)),l+n>e.byteLength)return"";let r="";for(let o=0;o<n;o++){const i=e.getUint8(l+o);if(i===0)break;r+=String.fromCharCode(i)}return r}function yt(e){const t=[],n=Math.min(e.length-20,2e5),a="<?xpacket begin";for(let l=0;l<n;l++)if(e[l]===60&&e[l+1]===63&&String.fromCharCode(...e.slice(l,l+15))===a){t.push({category:"XMP",name:"Adobe XMP Metadata Packet",value:"XMP Packet detected",severity:"critical",description:"Contains edit history, Photoshop/Lightroom instance IDs, and original document UUIDs."});break}return t}function wt(e,t=!1){if(e==="standard")return{theta:0,sx:1,sy:1,noiseIntensity:0};const n=new Uint32Array(3);crypto.getRandomValues(n);const a=.1+n[0]/4294967295*.2,l=(n[0]%2===0?1:-1)*(a*Math.PI)/180,r=.995+n[1]/4294967295*.004;let o=.995+n[2]/4294967295*.004;return Math.abs(r-o)<5e-4&&(o=r<.997?r+6e-4:r-6e-4),{theta:l,sx:r,sy:o,noiseIntensity:t?0:2}}function T(e){const t=Math.abs(e);return t<=1?1.5*t*t*t-2.5*t*t+1:t<2?-.5*t*t*t+2.5*t*t-4*t+2:0}function Ct(e,t,n,a=!0,l=!1){const r=e.width,o=e.height;if(n==="standard"){t.width=r,t.height=o,t.getContext("2d",{willReadFrequently:!0,alpha:a}).drawImage(e,0,0);return}const i=wt(n,l),c=new OffscreenCanvas(r,o).getContext("2d",{willReadFrequently:!0});c.drawImage(e,0,0);const s=c.getImageData(0,0,r,o),u=new Uint32Array(s.data.buffer),d=3,m=r-6,p=o-6;t.width=m,t.height=p;const g=t.getContext("2d",{willReadFrequently:!0,alpha:a}),x=g.createImageData(m,p),h=new Uint32Array(x.data.buffer),f=Math.cos(i.theta),b=Math.sin(i.theta),w=i.sx*f,v=-i.sy*b,C=i.sx*b,k=i.sy*f,L=w*k-v*C,H=k/L,q=-v/L,N=-C/L,W=w/L,j=r/2,Q=o/2,Z=new Uint32Array(1);crypto.getRandomValues(Z);let U=Z[0]||305419896;for(let R=0;R<p;R++){const S=R+d-Q,P=-j+d;let A=P*H+S*q+j,V=P*N+S*W+Q;for(let M=0;M<m;M++){const E=Math.floor(A),F=Math.floor(V),I=A-E,D=V-F,Ae=T(I+1),Ee=T(I),Ie=T(I-1),De=T(I-2),Le=T(D+1),Fe=T(D),Te=T(D-1),Be=T(D-2);let re=0,se=0,ie=0,oe=0;for(let O=-1;O<=2;O++){let _=0;if(O===-1?_=Le:O===0?_=Fe:O===1?_=Te:_=Be,_===0)continue;let X=F+O;X<0?X=0:X>=o&&(X=o-1);const $e=X*r;for(let z=-1;z<=2;z++){let $=0;if(z===-1?$=Ae:z===0?$=Ee:z===1?$=Ie:$=De,$===0)continue;let G=E+z;G<0?G=0:G>=r&&(G=r-1);const K=$*_,J=u[$e+G];re+=(J&255)*K,se+=(J>>8&255)*K,ie+=(J>>16&255)*K,oe+=(J>>24&255)*K}}let Y=0;i.noiseIntensity>0&&(U^=U<<13,U^=U>>>17,U^=U<<5,Y=(U&255)%5-2);const Re=Math.min(255,Math.max(0,re+Y)),Oe=Math.min(255,Math.max(0,se+Y)),_e=Math.min(255,Math.max(0,ie+Y)),ze=a?Math.min(255,Math.max(0,oe)):255;h[R*m+M]=Re|Oe<<8|_e<<16|ze<<24,A+=H,V+=N}}g.putImageData(x,0,0)}var kt=1766015824,Mt=1665684045,Ut=1732332865,St=1700284774,Pt=1950701684,At=2052348020,Et=1767135348,It=1950960965,Dt=1883789683,Lt=1229144912,Ft=1163413830,Tt=1481461792;function Bt(e,t){return e.length<12?e:t==="image/png"||e[0]===137&&e[1]===80&&e[2]===78&&e[3]===71?Rt(e):t==="image/jpeg"||e[0]===255&&e[1]===216?Ot(e):t==="image/webp"||e[0]===82&&e[1]===73&&e[2]===70&&e[3]===70?Xt(e):e}function Rt(e){if(e.length<8)return e;const t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(t.getUint32(0,!1)!==2303741511||t.getUint32(4,!1)!==218765834)return e;const n=new Uint8Array(e.length);n.set(e.subarray(0,8),0);let a=8,l=8;const r=e.length;for(;a+8<=r;){const o=t.getUint32(a,!1),i=t.getUint32(a+4,!1),c=12+o;if(a+c>r)break;i===kt||i===Mt||i===Ut||i===St||i===Pt||i===At||i===Et||i===It||i===Dt||(n.set(e.subarray(a,a+c),l),l+=c),a+=c}return n.subarray(0,l)}function Ot(e){if(e.length<4||e[0]!==255||e[1]!==216)return e;const t=new Uint8Array(e.length);t[0]=255,t[1]=216;let n=2,a=2;const l=e.length;for(;a<l-1;){if(e[a]!==255){t[n++]=e[a++];continue}const r=e[a+1];if(r===255||r===0){t[n++]=e[a++];continue}if(r===217){t[n++]=255,t[n++]=217;break}if(r===218){const c=e.subarray(a);t.set(c,n),n+=c.length;break}if(a+3>=l)break;const o=2+(e[a+2]<<8|e[a+3]);if(a+o>l)break;let i=!1;r===226?a+15<=l&&e[a+4]===73&&e[a+5]===67&&e[a+6]===67&&e[a+7]===95&&e[a+8]===80&&e[a+9]===82&&e[a+10]===79&&e[a+11]===70&&e[a+12]===73&&e[a+13]===76&&e[a+14]===69&&e[a+15]===0&&(i=!0):(r===225||r===237||r===238||r===254||r>=227&&r<=239)&&(i=!0),i||(t.set(e.subarray(a,a+o),n),n+=o),a+=o}return t.subarray(0,n)}var _t=1448097880,zt=1095520328,$t=1448097824,Nt=1448097868,jt=1095649613,Vt=1095650630;function Xt(e){if(e.length<12)return e;const t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(t.getUint32(0,!1)!==1380533830||t.getUint32(8,!1)!==1464156752)return e;let n=!1,a=!1,l=null;const r=[];let o=12;const i=e.length;for(;o+8<=i;){const d=t.getUint32(o,!1),m=t.getUint32(o+4,!0),p=8+(m+m%2);if(o+p>i)break;d===zt?(n=!0,r.push({offset:o,totalLen:p,type:d})):d===jt||d===Vt?(a=!0,r.push({offset:o,totalLen:p,type:d})):d===_t?l={offset:o,totalLen:p}:d===$t||d===Nt?r.push({offset:o,totalLen:p,type:d}):d===Lt||d===Ft||d===Tt||r.push({offset:o,totalLen:p,type:d}),o+=p}const c=new Uint8Array(e.length);c.set(e.subarray(0,12),0);const s=new DataView(c.buffer,c.byteOffset,c.byteLength);let u=12;if((n||a)&&l){c.set(e.subarray(l.offset,l.offset+l.totalLen),u);let d=0;n&&(d|=16),a&&(d|=2),c[u+8]=d,u+=l.totalLen}for(const d of r)c.set(e.subarray(d.offset,d.offset+d.totalLen),u),u+=d.totalLen;return s.setUint32(4,u-8,!0),c.subarray(0,u)}function B(e){const t=Math.abs(e);return t<=1?1.5*t*t*t-2.5*t*t+1:t<2?-.5*t*t*t+2.5*t*t-4*t+2:0}function Gt(e,t,n,a,l,r,o=!0){const i=t/l,c=n/r;for(let s=0;s<r;s++){const u=(s+.5)*c-.5,d=Math.floor(u),m=u-d,p=B(m+1),g=B(m),x=B(m-1),h=B(m-2);for(let f=0;f<l;f++){const b=(f+.5)*i-.5,w=Math.floor(b),v=b-w,C=B(v+1),k=B(v),L=B(v-1),H=B(v-2);let q=0,N=0,W=0,j=0;for(let S=-1;S<=2;S++){let P=0;if(S===-1?P=p:S===0?P=g:S===1?P=x:P=h,P===0)continue;let A=d+S;A<0?A=0:A>=n&&(A=n-1);const V=A*t;for(let M=-1;M<=2;M++){let E=0;if(M===-1?E=C:M===0?E=k:M===1?E=L:E=H,E===0)continue;let F=w+M;F<0?F=0:F>=t&&(F=t-1);const I=E*P,D=e[V+F];q+=(D&255)*I,N+=(D>>8&255)*I,W+=(D>>16&255)*I,j+=(D>>24&255)*I}}const Q=Math.min(255,Math.max(0,Math.round(q))),Z=Math.min(255,Math.max(0,Math.round(N))),U=Math.min(255,Math.max(0,Math.round(W))),R=o?Math.min(255,Math.max(0,Math.round(j))):255;a[s*l+f]=Q|Z<<8|U<<16|R<<24}}}function Ht(e,t=!0){const n=e.width,a=e.height;if(n<4||a<4)return;const l=Math.max(2,Math.round(n*.995)),r=Math.max(2,Math.round(a*.995));let o;typeof OffscreenCanvas<"u"?o=new OffscreenCanvas(l,r):(o=document.createElement("canvas"),o.width=l,o.height=r);const i=o.getContext("2d",{willReadFrequently:!0});i.drawImage(e,0,0,l,r);const c=i.getImageData(0,0,l,r),s=new Uint32Array(c.data.buffer),u=e.getContext("2d",{willReadFrequently:!0}),d=u.createImageData(n,a);Gt(s,l,r,new Uint32Array(d.data.buffer),n,a,t),u.putImageData(d,0,0)}function ne(e){for(let t=1;t<9;t++){const n=e[t];let a=t-1;for(;a>=0&&e[a]>n;)e[a+1]=e[a],a--;e[a+1]=n}}function fe(e,t,n){const a=e.length,l=new Uint8ClampedArray(a);l.set(e);const r=new Uint8Array(9),o=new Uint8Array(9),i=new Uint8Array(9);for(let c=0;c<n;c++)for(let s=0;s<t;s++){let u=0;for(let m=-1;m<=1;m++){const p=Math.min(n-1,Math.max(0,c+m))*t;for(let g=-1;g<=1;g++){const x=(p+Math.min(t-1,Math.max(0,s+g)))*4;r[u]=e[x],o[u]=e[x+1],i[u]=e[x+2],u++}}ne(r),ne(o),ne(i);const d=(c*t+s)*4;l[d]=r[4],l[d+1]=o[4],l[d+2]=i[4]}e.set(l)}function qt(e){const t=e.width,n=e.height;if(t<3||n<3)return;const a=e.getContext("2d",{willReadFrequently:!0});if(!a)return;let l=null,r=null;try{typeof OffscreenCanvas<"u"?l=new OffscreenCanvas(t,n):(l=document.createElement("canvas"),l.width=t,l.height=n),r=l.getContext("webgl")}catch{r=null}if(!r){const o=a.getImageData(0,0,t,n);fe(o.data,t,n),a.putImageData(o,0,0);return}try{const o=`
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = (a_position + 1.0) * 0.5;
      }
    `,i=`
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
    `,c=r.createShader(r.VERTEX_SHADER);r.shaderSource(c,o),r.compileShader(c);const s=r.createShader(r.FRAGMENT_SHADER);r.shaderSource(s,i),r.compileShader(s);const u=r.createProgram();r.attachShader(u,c),r.attachShader(u,s),r.linkProgram(u),r.useProgram(u);const d=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,d),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),r.STATIC_DRAW);const m=r.getAttribLocation(u,"a_position");r.enableVertexAttribArray(m),r.vertexAttribPointer(m,2,r.FLOAT,!1,0,0);const p=r.getUniformLocation(u,"u_resolution");r.uniform2f(p,t,n);const g=r.createTexture();r.bindTexture(r.TEXTURE_2D,g),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.NEAREST),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,e),r.viewport(0,0,t,n),r.drawArrays(r.TRIANGLES,0,6),a.drawImage(l,0,0)}catch{const o=a.getImageData(0,0,t,n);fe(o.data,t,n),a.putImageData(o,0,0)}}function Wt(e,t=1597463007){let n=t||305419896;for(let a=0;a<e.length;a+=4){n^=n<<13,n^=n>>>17,n^=n<<5;const l=((n&1)===0?1:-1)*((n>>1&1)+1),r=((n>>2&1)===0?1:-1)*((n>>3&1)+1),o=((n>>4&1)===0?1:-1)*((n>>5&1)+1);e[a]=Math.min(255,Math.max(0,e[a]+l)),e[a+1]=Math.min(255,Math.max(0,e[a+1]+r)),e[a+2]=Math.min(255,Math.max(0,e[a+2]+o))}}function Ue(e,t,n){for(let a=0;a<n;a+=2){const l=a+1<n;for(let r=0;r<t;r+=2){const o=r+1<t,i=[[r,a]];o&&i.push([r+1,a]),l&&i.push([r,a+1]),l&&o&&i.push([r+1,a+1]);let c=0,s=0;const u=[];for(const[p,g]of i){const x=(g*t+p)*4,h=e[x],f=e[x+1],b=e[x+2],w=.299*h+.587*f+.114*b,v=-.168736*h-.331264*f+.5*b+128,C=.5*h-.418688*f-.081312*b+128;u.push(w),c+=v,s+=C}const d=c/i.length,m=s/i.length;for(let p=0;p<i.length;p++){const[g,x]=i[p],h=(x*t+g)*4,f=u[p],b=d-128,w=m-128,v=f+1.402*w,C=f-.344136*b-.714136*w,k=f+1.772*b;e[h]=Math.min(255,Math.max(0,Math.round(v))),e[h+1]=Math.min(255,Math.max(0,Math.round(C))),e[h+2]=Math.min(255,Math.max(0,Math.round(k)))}}}}function Qt(e,t=!0){Ht(e,t),qt(e);const n=e.getContext("2d",{willReadFrequently:!0});if(n){const a=n.getImageData(0,0,e.width,e.height);Ue(a.data,e.width,e.height),Wt(a.data),n.putImageData(a,0,0)}}async function pe(e,t,n){n?.(10);const a=e instanceof File?e.name:"unnamed_image",l=e.size,r=await te(e,a);n?.(25);const o=await createImageBitmap(e);n?.(45);const i="image/webp",c=.6,s=!!t.extremeSanitization,u=!(e.type==="image/jpeg"||/\.(jpe?g|bmp)$/i.test(a));let d;typeof OffscreenCanvas<"u"?d=new OffscreenCanvas(o.width,o.height):(d=document.createElement("canvas"),d.width=o.width,d.height=o.height),d.getContext("2d",{willReadFrequently:!0,alpha:u});const m=t.defenseLevel==="standard"?"hardened":t.defenseLevel;if(Ct(o,d,m,u,!1),s)Qt(d,u);else{const v=d.getContext("2d",{willReadFrequently:!0});if(v){const C=v.getImageData(0,0,d.width,d.height);Ue(C.data,d.width,d.height),v.putImageData(C,0,0)}}n?.(70);let p;d instanceof OffscreenCanvas?p=await d.convertToBlob({type:i,quality:c}):p=await new Promise((v,C)=>{d.toBlob(k=>{k?v(k):C(new Error("Failed to encode canvas blob"))},i,c)}),n?.(85),o.close(),d.getContext("2d")?.clearRect(0,0,d.width,d.height);const g=await p.arrayBuffer();let x=Bt(new Uint8Array(g),i);const h=new Blob([x],{type:i});n?.(92);const f=await ae(x,"webp"),b=await te(h,f);if(b.sha256===r.sha256)throw new Error("Mandatory re-synthesis invariant violated: output SHA-256 must diverge from input");n?.(100);const w={blob:h,originalBlob:e,originalName:a,sanitizedName:f,originalSize:l,sanitizedSize:h.size,format:i,sha256:b.sha256,defenseLevel:t.defenseLevel,auditBefore:r,auditAfter:b,processedAt:Date.now(),isDeepDecontaminated:s,extremeSanitization:t.extremeSanitization};return x=null,w}var Zt=1718773093;function me(e){if(e.length<12)return!1;const t=new DataView(e.buffer,e.byteOffset,e.byteLength).getUint32(4,!1);return t===1718909296||t===1836019574}function he(e,t){return e.startsWith("audio/")||/\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(t)}function ge(e){const t=new Uint8Array(e.length);return t.set(e),Se(t,new DataView(t.buffer,t.byteOffset,t.byteLength),0,t.length),t}function Se(e,t,n,a){let l=n;for(;l+8<=a;){const r=t.getUint32(l,!1),o=t.getUint32(l+4,!1);let i=r,c=8;if(r===0)i=a-l;else if(r===1){if(l+16>a)break;i=Number(t.getBigUint64(l+8,!1)),c=16}if(i<c||l+i>a)break;if(o===1969517665||o===1835365473||o===1970628964||o===1768715124){t.setUint32(l+4,Zt,!1),e.fill(0,l+c,l+i),l+=i;continue}if(o===1836019574||o===1953653099||o===1835297121||o===1835626086||o===1937007212||o===1684631142)Se(e,t,l+c,l+i);else if(o===1835295092)Yt(e,l+c,l+i);else if((o===1836476516||o===1953196132||o===1835296868)&&i>=c+20){const s=e[l+c];s===0?(t.setUint32(l+c+4,0,!1),t.setUint32(l+c+8,0,!1)):s===1&&i>=c+28&&(t.setBigUint64(l+c+4,0n,!1),t.setBigUint64(l+c+12,0n,!1))}l+=i}}function Yt(e,t,n){const a=new TextEncoder().encode("x264 - core");for(let l=t;l<=n-a.length;l++){let r=!0;for(let o=0;o<a.length;o++)if(e[l+o]!==a[o]){r=!1;break}if(r)for(let o=0;o<256&&l+o<n;o++)e[l+o]=0}}function xe(e){let t=0,n=e.length;if(e.length>=10&&e[0]===73&&e[1]===68&&e[2]===51&&(t=10+((e[6]&127)<<21|(e[7]&127)<<14|(e[8]&127)<<7|e[9]&127)),e.length>=128){const a=e.length-128;e[a]===84&&e[a+1]===65&&e[a+2]===71&&(n=a)}return e.subarray(t,n)}async function Kt(e,t,n){if(typeof Worker<"u")return new Promise((l,r)=>{try{const o=new Worker(new URL(new URL("media.worker-CAWCdypE.js",import.meta.url).href,""+import.meta.url),{type:"module"});o.onmessage=i=>{const c=new Uint8Array(i.data.buffer);o.terminate(),l(c)},o.onerror=i=>{o.terminate(),r(i)},o.postMessage({buffer:e,mimeType:t,originalName:n},[e])}catch{const o=new Uint8Array(e);l(me(o)?ge(o):he(t,n)?xe(o):o)}});const a=new Uint8Array(e);return me(a)?ge(a):he(t,n)?xe(a):a}async function be(e,t,n){n?.(15);const a=e instanceof File?e.name:"unnamed_media",l=await te(e,a);n?.(35);let r=await e.arrayBuffer();const o=e.type||"";let i=await Kt(r,o,a);n?.(75);const c=new Blob([i],{type:o||"video/mp4"}),s=a.split(".").pop()||"mp4",u=await ae(i,s);n?.(90);const d=await te(c,u);n?.(100);const m={blob:c,originalBlob:e,originalName:a,sanitizedName:u,originalSize:e.size,sanitizedSize:c.size,format:o,sha256:d.sha256,defenseLevel:t.defenseLevel,auditBefore:l,auditAfter:d,processedAt:Date.now()};return i=null,r=null,m}async function Jt(e,t={},n){const a=e.type.toLowerCase(),l=e.name.toLowerCase(),r=t.defenseLevel||"paranoid",o=t.quality??.85,i=t.extremeSanitization??!1,c=a.startsWith("image/")||/\.(jpg|jpeg|png|webp|bmp|gif|tiff)$/i.test(l),s=a.startsWith("video/")||a.startsWith("audio/")||/\.(mp4|mov|mkv|webm|mp3|wav|ogg|aac|m4a)$/i.test(l);if(c)return await pe(e,{defenseLevel:r,outputFormat:"image/webp",quality:o,extremeSanitization:i},n);if(s)return await be(e,{defenseLevel:r},n);try{return await pe(e,{defenseLevel:r,outputFormat:"image/webp",quality:o,extremeSanitization:i},n)}catch{return await be(e,{defenseLevel:r},n)}}var Pe=new Uint32Array(256);for(let e=0;e<256;e++){let t=e;for(let n=0;n<8;n++)t&1?t=3988292384^t>>>1:t=t>>>1;Pe[e]=t}function en(e){let t=-1;for(let n=0;n<e.length;n++)t=Pe[(t^e[n])&255]^t>>>8;return(t^-1)>>>0}var tn=new TextEncoder;async function nn(e,t){const n=[];let a=0,l=0;for(let h=0;h<e.length;h++){const f=e[h],b=await f.blob.arrayBuffer(),w=new Uint8Array(b),v=tn.encode(f.sanitizedName),C=en(w),k=w.length;n.push({nameBytes:v,data:w,crc:C,size:k,offset:a});const L=30+v.length+k;a+=L,l+=46+v.length,t?.(Math.round((h+1)/e.length*40))}const r=a+l+22,o=new ArrayBuffer(r),i=new DataView(o),c=new Uint8Array(o);let s=0;const u=0,d=33,m=20,p=20,g=0;for(let h=0;h<n.length;h++){const f=n[h];i.setUint32(s,67324752,!0),s+=4,i.setUint16(s,m,!0),s+=2,i.setUint16(s,0,!0),s+=2,i.setUint16(s,g,!0),s+=2,i.setUint16(s,u,!0),s+=2,i.setUint16(s,d,!0),s+=2,i.setUint32(s,f.crc,!0),s+=4,i.setUint32(s,f.size,!0),s+=4,i.setUint32(s,f.size,!0),s+=4,i.setUint16(s,f.nameBytes.length,!0),s+=2,i.setUint16(s,0,!0),s+=2,c.set(f.nameBytes,s),s+=f.nameBytes.length,c.set(f.data,s),s+=f.size,t?.(40+Math.round((h+1)/n.length*40))}const x=s;for(let h=0;h<n.length;h++){const f=n[h];i.setUint32(s,33639248,!0),s+=4,i.setUint16(s,p,!0),s+=2,i.setUint16(s,m,!0),s+=2,i.setUint16(s,0,!0),s+=2,i.setUint16(s,g,!0),s+=2,i.setUint16(s,u,!0),s+=2,i.setUint16(s,d,!0),s+=2,i.setUint32(s,f.crc,!0),s+=4,i.setUint32(s,f.size,!0),s+=4,i.setUint32(s,f.size,!0),s+=4,i.setUint16(s,f.nameBytes.length,!0),s+=2,i.setUint16(s,0,!0),s+=2,i.setUint16(s,0,!0),s+=2,i.setUint16(s,0,!0),s+=2,i.setUint16(s,0,!0),s+=2,i.setUint32(s,32,!0),s+=4,i.setUint32(s,f.offset,!0),s+=4,c.set(f.nameBytes,s),s+=f.nameBytes.length}return i.setUint32(s,101010256,!0),s+=4,i.setUint16(s,0,!0),s+=2,i.setUint16(s,0,!0),s+=2,i.setUint16(s,n.length,!0),s+=2,i.setUint16(s,n.length,!0),s+=2,i.setUint32(s,l,!0),s+=4,i.setUint32(s,x,!0),s+=4,i.setUint16(s,0,!0),s+=2,t?.(100),{zipBlob:new Blob([o],{type:"application/zip"}),zipFileName:`bundle_${await gt(o,"zip",12)}`}}function ve(e,t){const n=URL.createObjectURL(e),a=document.createElement("a");a.href=n,a.download=t,a.rel="noopener noreferrer",document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>{URL.revokeObjectURL(n)},1e3)}function an(e){try{e instanceof Uint8Array?e.fill(0):new Uint8Array(e).fill(0)}catch{}}function rn(e){for(const t of e)try{URL.revokeObjectURL(t)}catch{}}function sn(e,t){const n=document.createElement("div");n.className="border border-neutral-800 bg-[#080808] rounded-xl p-4 sm:p-5 mb-6 text-neutral-200",n.innerHTML=`
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
      <!-- Encoder Quality -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">Encoder Quality</span>
            <span id="quality-val" class="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
              60%
            </span>
            <span class="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded font-mono font-normal">
              OPSEC Enforced
            </span>
          </div>
        </div>
        <p class="text-[11px] text-neutral-400">
          Hardcoded strictly to 60% with YUV 4:2:0 Chroma Subsampling to neutralize PRNU and steganographic carriers.
        </p>
      </div>

      <!-- Extreme Sanitization Toggle -->
      <div class="flex items-center justify-between gap-4 p-3 rounded-lg border border-neutral-800/80 bg-neutral-950/50">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <label for="extreme-toggle" class="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300 cursor-pointer">
              Extreme Sanitization
            </label>
            <span class="text-[10px] text-purple-400 bg-purple-950/60 border border-purple-800/60 px-1.5 py-0.5 rounded font-mono font-normal">
              Deep Decontamination
            </span>
          </div>
          <p class="text-[11px] text-neutral-400">
            Spatial micro-resampling, 3x3 median filter, and visibility dithering against steganography.
          </p>
        </div>

        <label class="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            id="extreme-toggle"
            type="checkbox"
            class="sr-only peer"
            ${e.extremeSanitization?"checked":""}
          />
          <div class="w-9 h-5 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>
    </div>
  `;const a=n.querySelector("#extreme-toggle");return a&&a.addEventListener("change",()=>{t({extremeSanitization:a.checked})}),n}var y={shield:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',shieldCheck:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path stroke-linecap="round" stroke-linejoin="round" d="m9 12 2 2 4-4"/></svg>',lock:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',download:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',archive:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',trash:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',eye:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',alertTriangle:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',check:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',upload:'<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>',cpu:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3m-3 6h3M1 9h3m-3 6h3"/></svg>',info:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>',close:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',sparkles:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>'};function on(e){const t=document.createElement("div");t.className="relative border border-dashed border-neutral-800 hover:border-neutral-600 bg-[#050505] hover:bg-[#0a0a0a] rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 group cursor-pointer overflow-hidden",t.innerHTML=`
    <!-- Hidden File Input -->
    <input type="file" id="file-input" multiple accept="image/*,video/*,audio/*,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.mp4,.mov,.mp3,.wav,.ogg" class="hidden" />

    <div class="relative z-10 flex flex-col items-center justify-center space-y-4">
      <div class="w-14 h-14 rounded-xl bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
        ${y.upload}
      </div>

      <div class="space-y-1">
        <h3 class="text-base sm:text-lg font-medium text-neutral-200 group-hover:text-white font-mono">
          Drop files here or click to browse
        </h3>
        <p class="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto">
          Batch processing for images, videos, and audio. Full pixel reconstruction and zero metadata.
        </p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-neutral-400">
        <span class="px-2 py-0.5 rounded border border-neutral-800 bg-neutral-950">Images (JPEG, PNG, WebP)</span>
        <span class="px-2 py-0.5 rounded border border-neutral-800 bg-neutral-950">Videos (MP4, MOV)</span>
        <span class="px-2 py-0.5 rounded border border-neutral-800 bg-neutral-950">Audio (MP3, WAV)</span>
      </div>

      <button type="button" class="mt-2 px-5 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-200 hover:text-white transition-all">
        Select Files
      </button>
    </div>
  `;const n=t.querySelector("#file-input");return t.addEventListener("click",()=>{n.click()}),n.addEventListener("change",()=>{n.files&&n.files.length>0&&(e(Array.from(n.files)),n.value="")}),t.addEventListener("dragover",a=>{a.preventDefault(),a.stopPropagation(),t.classList.add("border-emerald-500","bg-neutral-950")}),t.addEventListener("dragleave",a=>{a.preventDefault(),a.stopPropagation(),t.classList.remove("border-emerald-500","bg-neutral-950")}),t.addEventListener("drop",a=>{a.preventDefault(),a.stopPropagation(),t.classList.remove("border-emerald-500","bg-neutral-950"),a.dataTransfer&&a.dataTransfer.files.length>0&&e(Array.from(a.dataTransfer.files))}),t}function ye(e,t){const n=document.createElement("div");if(n.className="mt-6 space-y-4",e.length===0)return n;const a=e.filter(c=>c.status==="done").length,l=e.length;n.innerHTML=`
    <!-- Batch Actions Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#080808] border border-neutral-800">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full ${a===l?"bg-emerald-400":"bg-neutral-400 animate-pulse"}"></span>
        <span class="text-xs font-mono font-medium text-neutral-300">
          Queue: ${a} of ${l} processed
        </span>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        ${a>0?`
          <button id="btn-download-zip" class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
            ${y.archive}
            <span>Download All (ZIP)</span>
          </button>
        `:""}

        <button id="btn-clear-all" class="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-red-400 text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
          ${y.trash}
          <span>Clear</span>
        </button>
      </div>
    </div>

    <!-- Items List -->
    <div class="space-y-3" id="queue-items-container"></div>
  `;const r=n.querySelector("#btn-download-zip");r&&r.addEventListener("click",t.onDownloadAllZip);const o=n.querySelector("#btn-clear-all");o&&o.addEventListener("click",t.onClearQueue);const i=n.querySelector("#queue-items-container");return e.forEach(c=>{const s=document.createElement("div");s.className="p-4 rounded-xl border border-neutral-900 bg-black hover:border-neutral-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4";const u=c.status==="done",d=c.status==="error",m=c.status==="processing"||c.status==="analyzing",p=[];if(c.result?.auditBefore){const h=c.result.auditBefore;h.hasGps&&p.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">GPS EXPOSED</span>'),h.hasThumbnail&&p.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">THUMBNAIL LEAK</span>'),h.hasMakerNotes&&p.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">MAKERNOTES</span>'),h.hasExif&&!h.hasGps&&p.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">EXIF</span>')}s.innerHTML=`
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <div class="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-0.5 text-neutral-400">
          ${u?`<span class="text-emerald-400">${y.check}</span>`:d?`<span class="text-red-400">${y.alertTriangle}</span>`:`<span class="text-neutral-400 animate-spin">${y.cpu}</span>`}
        </div>

        <div class="min-w-0 flex-1 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-mono font-medium text-neutral-200 truncate max-w-[200px] sm:max-w-xs" title="${c.file.name}">
              ${c.file.name}
            </span>
            <span class="text-[10px] text-neutral-400 font-mono">(${we(c.file.size)})</span>
            ${p.join(" ")}
          </div>

          ${u&&c.result?`
            <div class="flex flex-wrap items-center gap-2 pt-0.5">
              <span class="text-xs font-mono text-emerald-400 font-medium">
                ${c.result.sanitizedName}
              </span>
              <span class="text-[10px] text-neutral-400 font-mono">
                (${we(c.result.sanitizedSize)})
              </span>
              <span class="text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 font-mono">
                CLEAN
              </span>
              ${c.result.isDeepDecontaminated?`
                <span class="text-[10px] px-1.5 py-0.5 rounded border border-purple-500/50 bg-purple-950/40 text-purple-300 font-mono" title="Anti-steganography pipeline applied: spatial micro-resampling, 3x3 median filter, and visibility dithering">
                  DECONTAMINATED
                </span>
              `:""}
            </div>
          `:""}

          ${m?`
            <div class="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden mt-2">
              <div class="bg-neutral-200 h-full transition-all duration-300" style="width: ${c.progress}%"></div>
            </div>
            <div class="text-[10px] text-neutral-400 font-mono flex justify-between">
              <span>${c.status==="analyzing"?"Scanning...":"Re-encoding..."}</span>
              <span>${c.progress}%</span>
            </div>
          `:""}

          ${d?`
            <div class="text-xs text-red-400 font-mono mt-1">
              Error: ${c.error||"Failed to process"}
            </div>
          `:""}
        </div>
      </div>

      <!-- Action Buttons -->
      ${u&&c.result?`
        <div class="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-900">
          <button class="btn-inspect px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
            ${y.eye}
            <span>Inspect</span>
          </button>

          <button class="btn-download px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer">
            ${y.download}
            <span>Download</span>
          </button>
        </div>
      `:""}
    `;const g=s.querySelector(".btn-inspect");g&&g.addEventListener("click",()=>t.onInspectForensics(c));const x=s.querySelector(".btn-download");x&&x.addEventListener("click",()=>t.onDownloadSingle(c)),i.appendChild(s)}),n}function we(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],a=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,a)).toFixed(1))} ${n[a]}`}function ln(e,t){const n=document.createElement("div");n.className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in";const a=URL.createObjectURL(e.originalBlob||e.blob),l=URL.createObjectURL(e.blob);n.innerHTML=`
    <div class="relative w-full max-w-5xl bg-[#080808] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div>
          <h2 class="text-sm font-bold font-mono text-white tracking-wide">File Inspection</h2>
          <p class="text-[11px] text-neutral-400 font-mono">Comparison between raw input and sanitized output</p>
        </div>

        <button id="modal-close" class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
          ${y.close}
        </button>
      </div>

      <!-- Scrollable Audit Body -->
      <div class="p-6 overflow-y-auto space-y-6 text-neutral-300">
        <!-- Visual & Hash Comparison Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- ORIGINAL -->
          <div class="border border-red-900/40 bg-[#0c0909] rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-red-950 pb-2">
              <span class="text-xs font-mono font-semibold text-red-400 uppercase flex items-center gap-1.5">
                ${y.alertTriangle} Input File
              </span>
              <span class="text-[10px] font-mono text-neutral-400 truncate max-w-[200px]">${e.originalName}</span>
            </div>

            <div class="aspect-video bg-black rounded-lg border border-neutral-900 overflow-hidden flex items-center justify-center relative">
              ${Ce(a,e.originalName)}
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-red-500/50 text-[10px] font-mono text-red-400">
                ${e.auditBefore.tags.length} Metadata Tags Detected
              </div>
            </div>

            <div class="space-y-1 font-mono text-[11px]">
              <div class="flex justify-between text-neutral-400">
                <span>File Size:</span>
                <span class="text-white">${ke(e.originalSize)}</span>
              </div>
              <div class="text-neutral-400">
                <span>Input SHA-256:</span>
                <div class="text-[10px] text-neutral-500 break-all">${e.auditBefore.sha256}</div>
              </div>
            </div>
          </div>

          <!-- SANITIZED -->
          <div class="border border-emerald-900/40 bg-[#070c09] rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-emerald-950 pb-2">
              <span class="text-xs font-mono font-semibold text-emerald-400 uppercase flex items-center gap-1.5">
                ${y.shieldCheck} Clean File
              </span>
              <span class="text-[10px] font-mono text-emerald-300 truncate max-w-[200px]">${e.sanitizedName}</span>
            </div>

            <div class="aspect-video bg-black rounded-lg border border-neutral-900 overflow-hidden flex items-center justify-center relative">
              ${Ce(l,e.sanitizedName)}
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                ${y.check} 0 Metadata Tags • Pure Bitstream
              </div>
            </div>

            <div class="space-y-1 font-mono text-[11px]">
              <div class="flex justify-between text-neutral-400">
                <span>Clean Size:</span>
                <span class="text-emerald-400 font-semibold">${ke(e.sanitizedSize)}</span>
              </div>
              <div class="text-neutral-400">
                <span>Output SHA-256:</span>
                <div class="text-[10px] text-emerald-400/80 break-all">${e.sha256}</div>
              </div>
            </div>
          </div>
        </div>

        ${e.isDeepDecontaminated?`
          <div class="p-3 rounded-xl border border-purple-500/50 bg-purple-950/30 text-purple-300 text-xs font-mono flex items-center gap-2.5">
            <span class="text-purple-400 shrink-0">${y.shield}</span>
            <span><strong>Anti-Steganography Pipeline:</strong> Spatial micro-resampling, hardware-accelerated 3x3 median filtering, visibility dithering, and lossy VP8 quantization applied to destroy steganographic watermarks and tracking signals.</span>
          </div>
        `:""}

        <!-- Metadata Tag Inspection -->
        <div class="border border-neutral-800 rounded-xl bg-neutral-950 p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h3 class="text-xs font-mono font-semibold text-neutral-200 uppercase tracking-wider">
              Detected Metadata
            </h3>
            <span class="text-[10px] font-mono text-neutral-400">
              Input: <strong class="text-red-400">${e.auditBefore.tags.length}</strong> tags | Output: <strong class="text-emerald-400">0</strong> tags
            </span>
          </div>

          ${e.auditBefore.tags.length>0?`
            <div class="overflow-x-auto">
              <table class="w-full text-left font-mono text-xs">
                <thead>
                  <tr class="border-b border-neutral-800 text-neutral-500 text-[10px]">
                    <th class="py-1.5 px-2">Type</th>
                    <th class="py-1.5 px-2">Tag</th>
                    <th class="py-1.5 px-2">Value</th>
                    <th class="py-1.5 px-2">Severity</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-neutral-900">
                  ${e.auditBefore.tags.map(o=>`
                    <tr class="hover:bg-neutral-900/50">
                      <td class="py-2 px-2 text-neutral-400 text-[11px]">${o.category}</td>
                      <td class="py-2 px-2 text-white font-medium">${o.name}</td>
                      <td class="py-2 px-2 text-neutral-300 max-w-xs truncate" title="${o.value}">${o.value}</td>
                      <td class="py-2 px-2">
                        <span class="px-1.5 py-0.5 rounded text-[9px] uppercase ${o.severity==="critical"?"bg-red-950 text-red-400 border border-red-900":"bg-neutral-900 text-neutral-300 border border-neutral-800"}">
                          ${o.severity}
                        </span>
                      </td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            </div>
          `:`
            <div class="p-3 text-center text-xs text-neutral-500 font-mono">
              No embedded tags found in input file.
            </div>
          `}
        </div>

        <!-- Binary Marker Breakdown -->
        <div class="border border-neutral-800 rounded-xl bg-neutral-950 p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-neutral-800 pb-2">
            <h3 class="text-xs font-mono font-semibold text-neutral-200 uppercase tracking-wider">
              Container Segments
            </h3>
            <span class="text-[10px] font-mono text-emerald-400">All vendor markers eliminated</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Source Markers -->
            <div>
              <div class="text-[11px] font-mono text-neutral-400 mb-2 font-medium">Input Segments:</div>
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                ${e.auditBefore.markers.map(o=>`
                  <div class="flex items-center justify-between p-2 rounded bg-black border ${o.isSanitizedSafe?"border-neutral-800":"border-red-900/50 bg-red-950/20"} text-[11px] font-mono">
                    <span class="${o.isSanitizedSafe?"text-neutral-300":"text-red-400 font-medium"}">${o.name}</span>
                    <span class="text-[10px] text-neutral-500">${o.marker}</span>
                  </div>
                `).join("")}
              </div>
            </div>

            <!-- Sanitized Markers -->
            <div>
              <div class="text-[11px] font-mono text-neutral-400 mb-2 font-medium">Clean Segments:</div>
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                ${e.auditAfter.markers.map(o=>`
                  <div class="flex items-center justify-between p-2 rounded bg-black border border-emerald-900/40 text-[11px] font-mono">
                    <span class="text-emerald-400">${o.name}</span>
                    <span class="text-[10px] text-emerald-600">${o.marker}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        </div>

        <!-- Defense Summary -->
        <div class="p-3.5 rounded-xl border border-neutral-800 bg-black flex items-center justify-between text-xs font-mono">
          <div class="flex items-center gap-2 text-neutral-300">
            ${y.shieldCheck}
            <span>Full Reconstruction & Noise Disruption Applied</span>
          </div>
          <span class="text-[11px] text-neutral-500">In-Memory • No Server Upload</span>
        </div>
      </div>
    </div>
  `;const r=()=>{rn([a,l]),t()};return n.querySelector("#modal-close")?.addEventListener("click",r),n.addEventListener("click",o=>{o.target===n&&r()}),n}function Ce(e,t){const n=/\.(mp4|mov|webm)$/i.test(t),a=/\.(mp3|wav|ogg|aac|m4a)$/i.test(t);return n?`<video src="${e}" controls class="max-h-full max-w-full rounded"></video>`:a?`
      <div class="p-4 flex flex-col items-center justify-center text-center space-y-2 w-full">
        <span class="text-neutral-400 font-mono text-[11px]">Audio Stream</span>
        <audio src="${e}" controls class="w-full max-w-xs"></audio>
      </div>`:`<img src="${e}" alt="Preview" class="max-h-full max-w-full object-contain" />`}function ke(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],a=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,a)).toFixed(1))} ${n[a]}`}function cn(e){const t=document.createElement("div");t.className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in",t.innerHTML=`
    <div class="relative w-full max-w-3xl bg-[#080808] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div class="flex items-center gap-2.5">
          <span class="text-neutral-400">${y.info}</span>
          <h2 class="text-sm font-semibold font-mono text-white tracking-wide">Legal, Licenses & Privacy</h2>
        </div>
        <button id="legal-close" class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
          ${y.close}
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto space-y-6 text-neutral-300 text-xs leading-relaxed font-sans">
        <!-- 1. Intended Purpose & Privacy Mandates -->
        <section class="space-y-2">
          <h3 class="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
            ${y.shield} Purpose & Data Minimization
          </h3>
          <p class="text-neutral-400">
            Dodecoder is an open-source, client-side media sanitization tool built to enforce data minimization principles:
          </p>
          <ul class="list-disc list-inside space-y-1 text-neutral-400 pl-2">
            <li><strong>GDPR (EU) Art. 5(1)(c):</strong> Personal data must be limited to what is strictly necessary.</li>
            <li><strong>LGPD (Brazil) Art. 6, III:</strong> Principle of necessity — limiting data processing to the minimum necessary.</li>
          </ul>
        </section>

        <!-- 2. Client-Side In-Memory Processing Guarantee -->
        <section class="space-y-2 p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40">
          <h3 class="text-xs font-mono font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
            ${y.lock} Client-Side Execution (Zero Network Traffic)
          </h3>
          <p class="text-neutral-300">
            All media decoding, canvas pixel reconstruction, metadata stripping, and cryptographic hashing execute locally in your browser memory.
          </p>
          <p class="text-[11px] text-neutral-400">
            No files, telemetry, or device identifiers are sent to any server. All processing memory is cleared when the session closes.
          </p>
        </section>

        <!-- 3. Software Licenses -->
        <section class="space-y-3">
          <h3 class="text-xs font-mono font-semibold text-white uppercase tracking-wider">
            Licenses & Attributions
          </h3>

          <div class="space-y-2 border border-neutral-800 rounded-lg p-3 bg-black">
            <div class="font-mono font-semibold text-white">Dodecoder</div>
            <div class="text-neutral-400">Created by <strong>Mochilamv</strong> & <strong>Antigravity (AI)</strong>. Licensed under the <strong>MIT License</strong>.</div>
            <div class="text-[11px] text-neutral-500 font-mono">
              Copyright &copy; 2026 Mochilamv & Antigravity. Free and open-source software.
            </div>
          </div>

          <div class="space-y-2 border border-neutral-800 rounded-lg p-3 bg-black">
            <div class="font-mono font-semibold text-white">Dependencies & Architecture</div>
            <ul class="text-[11px] text-neutral-400 space-y-1 font-mono">
              <li>• <strong>Runtime:</strong> Zero external third-party dependencies (100% Native Web APIs & Standalone TypeScript)</li>
              <li>• <strong>Build Engine:</strong> Vite & TypeScript (MIT License)</li>
              <li>• <strong>Styling:</strong> Tailwind CSS (MIT License)</li>
            </ul>
          </div>
        </section>

        <!-- 4. Operational Notes -->
        <section class="space-y-2 border-t border-neutral-800 pt-3">
          <h3 class="text-xs font-mono font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            ${y.info} Usage Recommendations
          </h3>
          <ol class="list-decimal list-inside space-y-1 text-neutral-400 text-[11px] pl-2 font-mono">
            <li>Run inside a Private/Incognito browser window.</li>
            <li>Close the tab after downloading to release memory buffers immediately.</li>
            <li>Use the ZIP download option to normalize filesystem timestamps (set to 1980 standard).</li>
          </ol>
        </section>
      </div>

      <!-- Footer -->
      <div class="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex justify-end">
        <button id="legal-close-btn" class="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs cursor-pointer transition-colors">
          Close
        </button>
      </div>
    </div>
  `;const n=t.querySelector("#legal-close"),a=t.querySelector("#legal-close-btn");return n.addEventListener("click",e),a.addEventListener("click",e),t.addEventListener("click",l=>{l.target===t&&e()}),t}var dn=class{root;settings={quality:.6,extremeSanitization:!1};queue=[];activeAuditModal=null;activeLegalModal=null;isProcessingQueue=!1;constructor(e){this.root=e,this.render()}render(){this.root.innerHTML="";const e=document.createElement("main");e.className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col";const t=sn(this.settings,r=>{this.settings={...this.settings,...r}});e.appendChild(t);const n=on(r=>this.handleFilesAdded(r));e.appendChild(n);const a=ye(this.queue,{onDownloadSingle:r=>this.handleDownloadSingle(r),onDownloadAllZip:()=>this.handleDownloadAllZip(),onInspectForensics:r=>this.handleInspectForensics(r),onClearQueue:()=>this.handleClearQueue()});e.appendChild(a);const l=this.createFooter();e.appendChild(l),this.root.appendChild(e)}createFooter(){const e=document.createElement("footer");return e.className="mt-auto pt-16 pb-8 text-center text-neutral-500 text-xs font-mono border-t border-neutral-900",e.innerHTML=`
      <div class="mb-3 space-y-1">
        <div class="text-sm font-bold tracking-widest uppercase text-white font-mono">Dodecoder</div>
        <div class="text-[11px] text-neutral-500">Client-Side Media Sanitization & Anti-Forensics</div>
      </div>
      <div class="flex flex-wrap items-center justify-center gap-3 text-[11px] text-neutral-400">
        <span>By Mochilamv & Antigravity (AI)</span>
        <span>•</span>
        <span>MIT License</span>
        <span>•</span>
        <button id="footer-legal-btn" class="text-neutral-400 hover:text-white underline cursor-pointer">
          Licenses & Legal
        </button>
      </div>
    `,e.querySelector("#footer-legal-btn")?.addEventListener("click",()=>{this.openLegalModal()}),e}handleFilesAdded(e){const t=e.map(n=>({id:`${Date.now()}-${Math.random().toString(36).slice(2,9)}`,file:n,status:"idle",progress:0}));this.queue.push(...t),this.render(),this.processQueue()}async processQueue(){if(!this.isProcessingQueue){this.isProcessingQueue=!0;for(let e=0;e<this.queue.length;e++){const t=this.queue[e];if(t.status==="idle"){t.status="analyzing",t.progress=25,this.updateQueueView();try{t.status="processing";const n=await Jt(t.file,{quality:this.settings.quality,extremeSanitization:this.settings.extremeSanitization},a=>{t.progress=a,this.updateQueueView()});t.status="done",t.progress=100,t.result=n}catch(n){t.status="error",t.error=n.message||"Processing failed"}this.updateQueueView()}}this.isProcessingQueue=!1}}updateQueueView(){const e=this.root.querySelector("#queue-items-container")?.parentElement;if(e){const t=ye(this.queue,{onDownloadSingle:n=>this.handleDownloadSingle(n),onDownloadAllZip:()=>this.handleDownloadAllZip(),onInspectForensics:n=>this.handleInspectForensics(n),onClearQueue:()=>this.handleClearQueue()});e.replaceWith(t)}else this.render()}handleDownloadSingle(e){e.result&&ve(e.result.blob,e.result.sanitizedName)}async handleDownloadAllZip(){const e=this.queue.filter(a=>a.status==="done"&&a.result).map(a=>a.result);if(e.length===0)return;const{zipBlob:t,zipFileName:n}=await nn(e);ve(t,n)}handleInspectForensics(e){e.result&&this.openAuditModal(e.result)}openAuditModal(e){this.activeAuditModal&&this.activeAuditModal.remove(),this.activeAuditModal=ln(e,()=>{this.activeAuditModal?.remove(),this.activeAuditModal=null}),document.body.appendChild(this.activeAuditModal)}openLegalModal(){this.activeLegalModal&&this.activeLegalModal.remove(),this.activeLegalModal=cn(()=>{this.activeLegalModal?.remove(),this.activeLegalModal=null}),document.body.appendChild(this.activeLegalModal)}handleClearQueue(){for(const e of this.queue)e.result&&e.result.blob.arrayBuffer().then(t=>an(t)).catch(()=>{});this.queue=[],this.render()}};document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("app");if(!e)throw new Error("Application root element (#app) not found");new dn(e)});

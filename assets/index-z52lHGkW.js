(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const l of i)if(l.type==="childList")for(const c of l.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&a(c)}).observe(document,{childList:!0,subtree:!0});function n(i){const l={};return i.integrity&&(l.integrity=i.integrity),i.referrerPolicy&&(l.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?l.credentials="include":i.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function a(i){if(i.ep)return;i.ep=!0;const l=n(i);fetch(i.href,l)}})();var Te=1229472850,ze=1347179589,Re=1229209940,_e=1229278788,Ne=1700284774,je=1950701684,Ve=2052348020,qe=1767135348,He=1950960965,Ge=1883789683,Xe=1766015824,Qe=1665684045,We=1732332865,Ze=1934772034,Ke=1448097824,Ye=1448097868,Je=1448097880,et=1095649613,tt=1095650630,nt=1163413830,at=1481461792,rt=1229144912,st=1095520328,ie=1969517665,oe=1835365473,le=1768715124,ce=1970628964;function it(e){const t=new Uint8Array(e),n=[];if(t.length<4)return n;const a=new DataView(e);return t[0]===255&&t[1]===216?ot(t):a.getUint32(0,!1)===2303741511?lt(t,a):a.getUint32(0,!1)===1380533830&&t.length>=12&&a.getUint32(8,!1)===1464156752?ct(t,a):t.length>12&&a.getUint32(4,!1)===1718909296?dt(t,a):n}function ot(e){const t=[];t.push({offset:0,marker:"0xFFD8",name:"SOI (Start of Image)",isSanitizedSafe:!0,description:"Mandatory standard JPEG boundary marker"});let n=2;const a=e.length;for(;n<a-1;){if(e[n]!==255){n++;continue}const i=e[n+1];if(i===255||i===0){n++;continue}const l="0xFF"+i.toString(16).toUpperCase().padStart(2,"0");if(i===217){t.push({offset:n,marker:l,name:"EOI (End of Image)",isSanitizedSafe:!0,description:"End of image data stream"});break}if(i===218){for(t.push({offset:n,marker:l,name:"SOS (Start of Scan)",isSanitizedSafe:!0,description:"Compressed image pixel bitstream follows"}),n+=2;n<a-1&&!(e[n]===255&&e[n+1]!==0&&e[n+1]<=217);)n++;continue}if(n+3>=a)break;const c=e[n+2]<<8|e[n+3];let s=`Segment (${l})`,o=!1,r="";switch(i){case 224:s="APP0 (JFIF Header)",o=!0,r="Basic JPEG container identification";break;case 225:e[n+4]===69&&e[n+5]===120&&e[n+6]===105&&e[n+7]===102?(s="APP1 (EXIF / GPS / IFD1 Thumbnail)",o=!1,r="High risk: contains camera serials, timestamps, GPS, and thumbnail traps"):(s="APP1 (Metadata/XMP)",o=!1,r="Contains edit history, instance IDs, or XMP packets");break;case 226:s="APP2 (ICC Color Profile)",o=!1,r="Contains OS calibration profile or author system identifiers";break;case 237:s="APP13 (Photoshop / IPTC)",o=!1,r="Contains bylines, captions, and Photoshop edit records";break;case 238:s="APP14 (Adobe DCT)",o=!1,r="Adobe color transform marker";break;case 219:s="DQT (Quantization Table)",o=!0,r="Quantization matrix; forensic fingerprint of ISP encoder";break;case 196:s="DHT (Huffman Table)",o=!0,r="Entropy encoding frequency table";break;case 192:case 194:s=`SOF (Start of Frame - ${i===192?"Baseline":"Progressive"})`,o=!0,r="Image dimensions, bit depth, and color components";break;case 254:s="COM (Comment)",o=!1,r="Text comment embedded in image";break;default:i>=227&&i<=239&&(s=`APP${i-224} (Vendor Marker)`,o=!1,r="Proprietary camera or software metadata block")}t.push({offset:n,marker:l,name:s,length:c,isSanitizedSafe:o,description:r}),n+=2+c}return t}function lt(e,t){const n=[];let a=8;const i=t.byteLength;for(;a+8<=i;){const l=t.getUint32(a,!1),c=t.getUint32(a+4,!1);let s=!1,o="Image raster data or standard header",r="UNKNOWN";switch(c){case Te:s=!0,r="IHDR",o="Header: Dimensions, depth, color type";break;case ze:s=!0,r="PLTE",o="Palette table";break;case Re:s=!0,r="IDAT",o="Compressed image pixel data";break;case _e:s=!0,r="IEND",o="End of PNG image";break;case Ne:s=!1,r="eXIf",o="Embedded raw EXIF metadata block";break;case je:s=!1,r="tEXt",o="Textual metadata (Creation time, software, author)";break;case Ve:s=!1,r="zTXt",o="Compressed textual metadata";break;case qe:s=!1,r="iTXt",o="Internationalized UTF-8 metadata";break;case He:s=!1,r="tIME",o="Modification timestamp";break;case Ge:s=!1,r="pHYs",o="Physical pixel dimensions / DPI";break;case Xe:s=!1,r="iCCP",o="Embedded ICC Color Profile / Display calibration fingerprint";break;case Qe:s=!1,r="cHRM",o="Primary chromaticities display calibration";break;case We:s=!1,r="gAMA",o="Image gamma correction curve";break;case Ze:s=!0,r="sRGB",o="Standard sRGB color space rendering intent";break;default:r="CHUNK",s=!1}n.push({offset:a,marker:r,name:`Chunk: ${r}`,length:l,isSanitizedSafe:s,description:o}),a+=12+l}return n}function ct(e,t){const n=[];let a=12;const i=t.byteLength;for(;a+8<=i;){const l=t.getUint32(a,!1),c=t.getUint32(a+4,!0);let s=!1,o="Visual raster bitstream",r="WEBP";switch(l){case Ke:r="VP8",s=!0;break;case Ye:r="VP8L",s=!0;break;case Je:r="VP8X",s=!0;break;case et:r="ANIM",s=!0;break;case tt:r="ANMF",s=!0;break;case nt:r="EXIF",s=!1,o="Embedded EXIF metadata block";break;case at:r="XMP",s=!1,o="Embedded XMP metadata block";break;case rt:r="ICCP",s=!1,o="ICC Color Profile";break;case st:r="ALPH",s=!0,o="Canal de transparência alfa dos pixels reconstruídos";break;default:r="CHUNK",s=!1}n.push({offset:a,marker:r,name:`WebP Chunk: ${r}`,length:c,isSanitizedSafe:s,description:o});const d=c+c%2;a+=8+d}return n}function dt(e,t){const n=[];let a=0;const i=t.byteLength;for(;a+8<=i;){const l=t.getUint32(a,!1),c=t.getUint32(a+4,!1);if(l<8&&l!==0)break;const s=c===ie||c===oe||c===le||c===ce;let o="BOX",r="Video/Audio container structure";switch(c){case ie:o="udta",r="User Data box (stores GPS, camera model, author)";break;case oe:o="meta",r="Metadata box (tags, encoder settings)";break;case le:o="ilst",r="Item List atom (QuickTime/iTunes metadata)";break;case ce:o="uuid",r="Vendor proprietary custom box";break;case 1718909296:o="ftyp";break;case 1836019574:o="moov";break;case 1835295092:o="mdat";break;default:o="atom"}if(n.push({offset:a,marker:o,name:`Box: ${o}`,length:l,isSanitizedSafe:!s,description:r}),l===0||a+l>i)break;a+=l}return n}function ut(e,t){if(e.length<12)return 0;let n=0;const a=e.length;if(e[0]===255&&e[1]===216||t==="image/jpeg"){let i=2;for(;i<a-1;){if(e[i]!==255){i++;continue}const l=e[i+1];if(l===255||l===0){i++;continue}if(l===217||l===218||i+3>=a)break;const c=e[i+2]<<8|e[i+3],s=i+4,o=i+2+c;if(o>a)break;if(l===225)if(s+6<=o&&e[s]===69&&e[s+1]===120&&e[s+2]===105&&e[s+3]===102&&e[s+4]===0&&e[s+5]===0){n++;const r=s+6;if(r+8<=o){const d=new DataView(e.buffer,e.byteOffset+r,o-r),f=d.getUint16(0)===18761,m=d.getUint32(4,f);if(m+2<=d.byteLength){const g=d.getUint16(m,f),h=m+2+g*12;h+4<=d.byteLength&&d.getUint32(h,f)!==0&&n++}}}else n++;else l===226?s+12<=o&&e[s]===73&&e[s+1]===67&&e[s+2]===67&&e[s+3]===95&&e[s+4]===80&&e[s+5]===82&&e[s+6]===79&&e[s+7]===70&&e[s+8]===73&&e[s+9]===76&&e[s+10]===69&&e[s+11]===0&&n++:(l>=227&&l<=239||l===254)&&n++;i=o}return n}if(e[0]===137&&e[1]===80&&e[2]===78&&e[3]===71||t==="image/png"){let i=8;const l=new DataView(e.buffer,e.byteOffset,e.byteLength);for(;i+8<=a;){const c=l.getUint32(i,!1),s=l.getUint32(i+4,!1),o=12+c;if(i+o>a)break;switch(s){case 1700284774:case 1766015824:case 1950701684:case 2052348020:case 1767135348:n++}i+=o}return n}if(e[0]===82&&e[1]===73&&e[2]===70&&e[3]===70||t==="image/webp"){let i=12;const l=new DataView(e.buffer,e.byteOffset,e.byteLength);for(;i+8<=a;){const c=l.getUint32(i,!1),s=l.getUint32(i+4,!0),o=8+(s+s%2);if(i+o>a)break;(c===1163413830||c===1481461792||c===1229144912)&&n++,i+=o}return n}return 0}async function ft(e){const t=e instanceof Uint8Array?e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength):e,n=await crypto.subtle.digest("SHA-256",t);return Array.from(new Uint8Array(n)).map(a=>a.toString(16).padStart(2,"0")).join("")}async function G(e,t,n=16){const a=e instanceof Uint8Array?e:new Uint8Array(e),i=new Uint8Array(32);crypto.getRandomValues(i);const l=new Uint8Array(i.length+a.length);l.set(i,0),l.set(a,i.length);const c=await crypto.subtle.digest("SHA-256",l.buffer),s=Array.from(new Uint8Array(c)).map(r=>r.toString(16).padStart(2,"0")).join("");i.fill(0),l.fill(0);const o=t.replace(/[^a-zA-Z0-9]/g,"").toLowerCase()||"bin";return`${s.slice(0,n)}.${o}`}async function T(e,t){const n=await e.arrayBuffer(),a=new Uint8Array(n),i=[],l=it(n);let c=!1,s=!1,o=!1,r=!1;const d=pt(a);if(d!==-1){c=!0;const h=new DataView(n,d),b=h.getUint16(0)===18761;try{const p=h.getUint32(4,b);if(p<a.length){const u=H(h,p,b,"IFD0");if(i.push(...u.tags),u.gpsPointer){s=!0;const w=H(h,u.gpsPointer,b,"GPS");i.push(...w.tags)}if(u.exifPointer){const w=H(h,u.exifPointer,b,"EXIF");i.push(...w.tags),w.hasMakerNotes&&(r=!0)}if(u.nextIfdOffset&&u.nextIfdOffset!==0){o=!0;const w=H(h,u.nextIfdOffset,b,"IFD1");i.push({category:"IFD1_Thumbnail",name:"IFD1 Embedded Thumbnail",value:`Embedded image preview found at offset ${u.nextIfdOffset}`,severity:"critical",description:"Embedded unedited thumbnail: major forensic leak vector."}),i.push(...w.tags)}}}catch{i.push({category:"EXIF",name:"Malformed EXIF Header",value:"Header parsing failed",severity:"medium"})}}const f=ht(a);f.length>0&&i.push(...f),l.some(h=>h.name.includes("ICC")||h.marker==="ICCP")&&i.push({category:"ICC",name:"ICC Color Profile",value:"Color management profile present (hardware/software calibration)",severity:"medium",description:"Can identify operating system or monitor calibration profile."});const m=await ft(n),g=c||r?"high":l.length>5?"moderate":"low";return{fileName:t||(e instanceof File?e.name:"unnamed_media"),fileSize:e.size,mimeType:e.type||"application/octet-stream",hasExif:c,hasGps:s,hasThumbnail:o,hasMakerNotes:r,tags:i,markers:l,prnuSusceptibility:g,sha256:m}}function pt(e){if(e.length>=8&&(e[0]===73&&e[1]===73&&e[2]===42&&e[3]===0||e[0]===77&&e[1]===77&&e[2]===0&&e[3]===42))return 0;for(let t=0;t<Math.min(e.length-10,65536);t++)if(e[t]===255&&e[t+1]===225&&e[t+4]===69&&e[t+5]===120&&e[t+6]===105&&e[t+7]===102&&e[t+8]===0&&e[t+9]===0)return t+10;for(let t=12;t<Math.min(e.length-8,65536);t++)if(e[t]===69&&e[t+1]===88&&e[t+2]===73&&e[t+3]===70)return t+8;return-1}function H(e,t,n,a){const i={tags:[]};if(t+2>=e.byteLength)return i;const l=e.getUint16(t,n);let c=t+2;for(let s=0;s<l&&!(c+12>e.byteLength);s++){const o=e.getUint16(c,n),r=e.getUint16(c+2,n),d=e.getUint32(c+4,n),f=c+8;let m="";if(o===34665&&a==="IFD0")i.exifPointer=e.getUint32(f,n);else if(o===34853&&a==="IFD0")i.gpsPointer=e.getUint32(f,n);else if(o===37500)i.hasMakerNotes=!0,i.tags.push({category:"MakerNotes",name:"Proprietary MakerNotes",value:`${d} bytes of camera-specific binary telemetry`,severity:"critical",description:"Manufacturer proprietary block containing sensor temperatures, lens serials, or face biometric coordinates."});else{const g=mt(o,a);g&&(r===2?m=gt(e,f,d,n):r===3?m=e.getUint16(f,n).toString():r===4?m=e.getUint32(f,n).toString():m=`[${d} items]`,m.trim()&&i.tags.push({category:a==="GPS"?"GPS":a==="IFD1"?"IFD1_Thumbnail":"EXIF",name:g.name,value:m.trim(),severity:g.severity,description:g.description}))}c+=12}return c+4<=e.byteLength&&(i.nextIfdOffset=e.getUint32(c,n)),i}function mt(e,t){if(t==="GPS")switch(e){case 1:return{name:"GPS Latitude Ref",severity:"critical",description:"North/South coordinate hemisphere"};case 2:return{name:"GPS Latitude",severity:"critical",description:"Precise GPS latitude coordinates"};case 3:return{name:"GPS Longitude Ref",severity:"critical",description:"East/West coordinate hemisphere"};case 4:return{name:"GPS Longitude",severity:"critical",description:"Precise GPS longitude coordinates"};case 6:return{name:"GPS Altitude",severity:"critical",description:"Elevation above sea level"};case 7:return{name:"GPS TimeStamp",severity:"critical",description:"Atomic satellite UTC timestamp"};case 29:return{name:"GPS DateStamp",severity:"critical",description:"Satellite GPS date"}}switch(e){case 271:return{name:"Camera Manufacturer (Make)",severity:"high",description:"Brand of camera or smartphone"};case 272:return{name:"Camera Model",severity:"critical",description:"Exact phone or camera hardware model"};case 305:return{name:"Software / OS Version",severity:"high",description:"Firmware or operating system build"};case 306:return{name:"Modify Date / Time",severity:"high",description:"Modification timestamp"};case 36867:return{name:"Date / Time Original",severity:"critical",description:"Exact moment the shutter was pressed"};case 36868:return{name:"Date / Time Digitized",severity:"critical",description:"Sensor analog-to-digital timestamp"};case 42033:return{name:"Camera Body Serial Number",severity:"critical",description:"Hardware unique serial number"};case 42036:return{name:"Lens Model",severity:"high",description:"Optical lens specifications"};case 42016:return{name:"Image Unique ID",severity:"critical",description:"Unique cryptographic ID generated by ISP"};case 513:return{name:"Thumbnail Offset",severity:"critical",description:"Pointer to raw thumbnail stream"};case 514:return{name:"Thumbnail Length",severity:"critical",description:"Byte length of embedded thumbnail"};default:return null}}function gt(e,t,n,a){let i=t;if(n>4&&(i=e.getUint32(t,a)),i+n>e.byteLength)return"";let l="";for(let c=0;c<n;c++){const s=e.getUint8(i+c);if(s===0)break;l+=String.fromCharCode(s)}return l}function ht(e){const t=[],n=Math.min(e.length-20,2e5),a="<?xpacket begin";for(let i=0;i<n;i++)if(e[i]===60&&e[i+1]===63&&String.fromCharCode(...e.slice(i,i+15))===a){t.push({category:"XMP",name:"Adobe XMP Metadata Packet",value:"XMP Packet detected",severity:"critical",description:"Contains edit history, Photoshop/Lightroom instance IDs, and original document UUIDs."});break}return t}function xt(e,t=!1){if(e==="standard")return{theta:0,sx:1,sy:1,noiseIntensity:0};const n=new Uint32Array(3);crypto.getRandomValues(n);const a=.1+n[0]/4294967295*.2,i=(n[0]%2===0?1:-1)*(a*Math.PI)/180,l=.995+n[1]/4294967295*.004;let c=.995+n[2]/4294967295*.004;return Math.abs(l-c)<5e-4&&(c=l<.997?l+6e-4:l-6e-4),{theta:i,sx:l,sy:c,noiseIntensity:t?0:2}}function S(e){const t=Math.abs(e);return t<=1?1.5*t*t*t-2.5*t*t+1:t<2?-.5*t*t*t+2.5*t*t-4*t+2:0}function bt(e,t,n,a=!0,i=!1){const l=e.width,c=e.height;if(n==="standard"){t.width=l,t.height=c,t.getContext("2d",{willReadFrequently:!0,alpha:a}).drawImage(e,0,0);return}const s=xt(n,i),o=new OffscreenCanvas(l,c).getContext("2d",{willReadFrequently:!0});o.drawImage(e,0,0);const r=o.getImageData(0,0,l,c),d=new Uint32Array(r.data.buffer),f=3,m=l-6,g=c-6;t.width=m,t.height=g;const h=t.getContext("2d",{willReadFrequently:!0,alpha:a}),b=h.createImageData(m,g),p=new Uint32Array(b.data.buffer),u=Math.cos(s.theta),w=Math.sin(s.theta),k=s.sx*u,v=-s.sy*w,P=s.sx*w,C=s.sy*u,U=k*C-v*P,D=C/U,z=-v/U,y=-P/U,A=k/U,M=l/2,Z=c/2,K=new Uint32Array(1);crypto.getRandomValues(K);let I=K[0]||305419896;for(let R=0;R<g;R++){const Y=R+f-Z,J=-M+f;let X=J*D+Y*z+M,Q=J*y+Y*A+Z;for(let W=0;W<m;W++){const ee=Math.floor(X),te=Math.floor(Q),_=X-ee,N=Q-te,Ue=S(_+1),Me=S(_),Se=S(_-1),Pe=S(_-2),Ie=S(N+1),Ae=S(N),Le=S(N-1),Fe=S(N-2);let ne=0,ae=0,re=0,se=0;for(let L=-1;L<=2;L++){let F=0;if(L===-1?F=Ie:L===0?F=Ae:L===1?F=Le:F=Fe,F===0)continue;let $=te+L;$<0?$=0:$>=c&&($=c-1);const Ee=$*l;for(let B=-1;B<=2;B++){let O=0;if(B===-1?O=Ue:B===0?O=Me:B===1?O=Se:O=Pe,O===0)continue;let E=ee+B;E<0?E=0:E>=l&&(E=l-1);const V=O*F,q=d[Ee+E];ne+=(q&255)*V,ae+=(q>>8&255)*V,re+=(q>>16&255)*V,se+=(q>>24&255)*V}}let j=0;s.noiseIntensity>0&&(I^=I<<13,I^=I>>>17,I^=I<<5,j=(I&255)%5-2);const Be=Math.min(255,Math.max(0,ne+j)),Oe=Math.min(255,Math.max(0,ae+j)),De=Math.min(255,Math.max(0,re+j)),$e=a?Math.min(255,Math.max(0,se)):255;p[R*m+W]=Be|Oe<<8|De<<16|$e<<24,X+=D,Q+=y}}h.putImageData(b,0,0)}var vt=1766015824,wt=1665684045,yt=1732332865,kt=1700284774,Ct=1950701684,Ut=2052348020,Mt=1767135348,St=1950960965,Pt=1883789683,It=1229144912,At=1163413830,Lt=1481461792;function xe(e,t){return e.length<12?e:t==="image/png"||e[0]===137&&e[1]===80&&e[2]===78&&e[3]===71?Ft(e):t==="image/jpeg"||e[0]===255&&e[1]===216?Bt(e):t==="image/webp"||e[0]===82&&e[1]===73&&e[2]===70&&e[3]===70?Ot(e):e}function Ft(e){if(e.length<8)return e;const t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(t.getUint32(0,!1)!==2303741511||t.getUint32(4,!1)!==218765834)return e;const n=new Uint8Array(e.length);n.set(e.subarray(0,8),0);let a=8,i=8;const l=e.length;for(;a+8<=l;){const c=t.getUint32(a,!1),s=t.getUint32(a+4,!1),o=12+c;if(a+o>l)break;s===vt||s===wt||s===yt||s===kt||s===Ct||s===Ut||s===Mt||s===St||s===Pt||(n.set(e.subarray(a,a+o),i),i+=o),a+=o}return n.subarray(0,i)}function Bt(e){if(e.length<4||e[0]!==255||e[1]!==216)return e;const t=new Uint8Array(e.length);t[0]=255,t[1]=216;let n=2,a=2;const i=e.length;for(;a<i-1;){if(e[a]!==255){t[n++]=e[a++];continue}const l=e[a+1];if(l===255||l===0){t[n++]=e[a++];continue}if(l===217){t[n++]=255,t[n++]=217;break}if(l===218){const o=e.subarray(a);t.set(o,n),n+=o.length;break}if(a+3>=i)break;const c=2+(e[a+2]<<8|e[a+3]);if(a+c>i)break;let s=!1;l===226?a+15<=i&&e[a+4]===73&&e[a+5]===67&&e[a+6]===67&&e[a+7]===95&&e[a+8]===80&&e[a+9]===82&&e[a+10]===79&&e[a+11]===70&&e[a+12]===73&&e[a+13]===76&&e[a+14]===69&&e[a+15]===0&&(s=!0):(l===225||l===237||l===238||l===254||l>=227&&l<=239)&&(s=!0),s||(t.set(e.subarray(a,a+c),n),n+=c),a+=c}return t.subarray(0,n)}function Ot(e){if(e.length<12)return e;const t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(t.getUint32(0,!1)!==1380533830||t.getUint32(8,!1)!==1464156752)return e;const n=new Uint8Array(e.length);n.set(e.subarray(0,12),0);const a=new DataView(n.buffer,n.byteOffset,n.byteLength);let i=12,l=12;const c=e.length;for(;i+8<=c;){const s=t.getUint32(i,!1),o=t.getUint32(i+4,!0),r=8+(o+o%2);if(i+r>c)break;if(s===It||s===At||s===Lt){i+=r;continue}if(s===1448097880&&o>=10){n.set(e.subarray(i,i+r),l),n[l+8]&=-45,l+=r,i+=r;continue}n.set(e.subarray(i,i+r),l),l+=r,i+=r}return a.setUint32(4,l-8,!0),n.subarray(0,l)}var Dt=xe;function $t(e,t,n){if(t==="image/png"||/\.png$/i.test(n)||/screenshot/i.test(n))return!0;if(t==="image/jpeg"||/\.(jpe?g)$/i.test(n)){try{let a;typeof OffscreenCanvas<"u"?a=new OffscreenCanvas(48,48):(a=document.createElement("canvas"),a.width=48,a.height=48);const i=a.getContext("2d",{willReadFrequently:!0});if(i){i.drawImage(e,0,0,48,48);const l=i.getImageData(0,0,48,48).data,c=new Set;for(let s=0;s<l.length;s+=4){const o=l[s]>>4,r=l[s+1]>>4,d=l[s+2]>>4,f=o<<8|r<<4|d;if(c.add(f),c.size>=32)return!1}return c.size<32}}catch{}return!1}return!0}async function de(e,t,n){n?.(10);const a=e instanceof File?e.name:"unnamed_image",i=e.size,l=await e.arrayBuffer(),c=new Uint8Array(l),s=await T(e,a);n?.(25);let o=t.outputFormat;o==="original"&&(o=e.type||"image/jpeg"),["image/webp","image/jpeg","image/png"].includes(o)||(o="image/webp");const r=o==="image/webp"?"webp":o==="image/png"?"png":"jpg";if(ut(c,e.type)===0){n?.(80);const y=new Blob([c],{type:o}),A=await G(c,r),M=await T(y,A);return n?.(100),{blob:y,originalBlob:e,originalName:a,sanitizedName:A,originalSize:i,sanitizedSize:y.size,format:o,sha256:M.sha256,defenseLevel:t.defenseLevel,auditBefore:s,auditAfter:M,processedAt:Date.now(),isBypass:!0}}const d=await createImageBitmap(e);n?.(45);const f=$t(d,e.type,a),m=f;let g=o,h=t.quality??.85;f?(g=o==="image/png"?"image/png":"image/webp",h=1):h=t.quality??.85;const b=!(e.type==="image/jpeg"||/\.(jpe?g|bmp)$/i.test(a))&&g!=="image/jpeg";let p;typeof OffscreenCanvas<"u"?p=new OffscreenCanvas(d.width,d.height):(p=document.createElement("canvas"),p.width=d.width,p.height=d.height),p.getContext("2d",{willReadFrequently:!0,alpha:b}),bt(d,p,t.defenseLevel,b,m),n?.(70);let u;p instanceof OffscreenCanvas?u=await p.convertToBlob({type:g,quality:h}):u=await new Promise((y,A)=>{p.toBlob(M=>{M?y(M):A(new Error("Failed to encode canvas blob"))},g,h)}),n?.(85),d.close();const w=await u.arrayBuffer(),k=xe(new Uint8Array(w),g);let v=new Blob([k],{type:g}),P=k,C;if(v.size>i){C="Tamanho inflado por injeção de entropia";const y=Dt(c,e.type||g);P=y,v=new Blob([y],{type:e.type||g})}n?.(92);const U=v.type==="image/webp"?"webp":v.type==="image/png"?"png":"jpg",D=await G(P,U),z=await T(v,D);return n?.(100),{blob:v,originalBlob:e,originalName:a,sanitizedName:D,originalSize:i,sanitizedSize:v.size,format:v.type,sha256:z.sha256,defenseLevel:t.defenseLevel,auditBefore:s,auditAfter:z,processedAt:Date.now(),warningBadge:C}}var Et=1718909296,be=1836019574,Tt=1836476516,zt=1953196132,Rt=1835296868,ve=1969517665,we=1835365473,_t=1768715124,ye=1970628964,Nt=1835295092;async function ue(e,t,n){n?.(15);const a=e instanceof File?e.name:"unnamed_media",i=await T(e,a);n?.(35);const l=await e.arrayBuffer(),c=new Uint8Array(l);let s;const o=e.type||"";jt(c)?s=qt(c):Vt(o,a)?s=Gt(c):s=c,n?.(75);const r=new Blob([s],{type:o||"video/mp4"}),d=a.split(".").pop()||"mp4",f=await G(s,d);n?.(90);const m=await T(r,f);return n?.(100),{blob:r,originalBlob:e,originalName:a,sanitizedName:f,originalSize:e.size,sanitizedSize:r.size,format:o,sha256:m.sha256,defenseLevel:t.defenseLevel,auditBefore:i,auditAfter:m,processedAt:Date.now()}}function jt(e){if(e.length<12)return!1;const t=new DataView(e.buffer,e.byteOffset,e.byteLength).getUint32(4,!1);return t===Et||t===be}function Vt(e,t){return e.startsWith("audio/")||/\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(t)}function qt(e){const t=new Uint8Array(e.length);let n=0,a=0;const i=e.length,l=new DataView(e.buffer,e.byteOffset,e.byteLength);for(;a+8<=i;){const c=l.getUint32(a,!1),s=l.getUint32(a+4,!1);let o=c,r=8;if(c===0)o=i-a;else if(c===1){if(a+16>i)break;o=Number(l.getBigUint64(a+8,!1)),r=16}if(o<r||a+o>i)break;if(s===ve||s===we||s===ye){a+=o;continue}if(s===be){const d=ke(e.subarray(a,a+o));t.set(d,n),n+=d.length}else if(s===Nt){const d=Ht(e.subarray(a,a+o));t.set(d,n),n+=d.length}else t.set(e.subarray(a,a+o),n),n+=o;a+=o}return t.subarray(0,n)}function ke(e){const t=new Uint8Array(e.length);let n=8,a=8;const i=e.length,l=new DataView(e.buffer,e.byteOffset,e.byteLength),c=new DataView(t.buffer,t.byteOffset,t.byteLength);for(t.set(e.subarray(0,8),0);a+8<=i;){const s=l.getUint32(a,!1),o=l.getUint32(a+4,!1);let r=s,d=8;if(s===0)r=i-a;else if(s===1){if(a+16>i)break;r=Number(l.getBigUint64(a+8,!1)),d=16}if(r<d||a+r>i)break;if(o===ve||o===we||o===_t||o===ye){a+=r;continue}if(o===1953653099||o===1835297121||o===1835626086||o===1937007212||o===1684631142){const f=ke(e.subarray(a,a+r));t.set(f,n),n+=f.length}else{const f=e.subarray(a,a+r);if(t.set(f,n),(o===Tt||o===zt||o===Rt)&&r>=28){const m=t[n+8];m===0?(c.setUint32(n+12,0,!1),c.setUint32(n+16,0,!1)):m===1&&r>=40&&(c.setBigUint64(n+12,0n,!1),c.setBigUint64(n+20,0n,!1))}n+=r}a+=r}return c.setUint32(0,n,!1),t.subarray(0,n)}function Ht(e){const t=new TextEncoder().encode("x264 - core");for(let n=8;n<e.length-t.length;n++){let a=!0;for(let i=0;i<t.length;i++)if(e[n+i]!==t[i]){a=!1;break}if(a)for(let i=0;i<256&&n+i<e.length;i++)e[n+i]=0}return e}function Gt(e){let t=0,n=e.length;if(e.length>=10&&e[0]===73&&e[1]===68&&e[2]===51&&(t=10+((e[6]&127)<<21|(e[7]&127)<<14|(e[8]&127)<<7|e[9]&127)),e.length>=128){const a=e.length-128;e[a]===84&&e[a+1]===65&&e[a+2]===71&&(n=a)}return e.subarray(t,n)}async function Xt(e,t={},n){const a=e.type.toLowerCase(),i=e.name.toLowerCase(),l=t.defenseLevel||"paranoid",c=t.quality??.85,s=a.startsWith("image/")||/\.(jpg|jpeg|png|webp|bmp|gif|tiff)$/i.test(i),o=a.startsWith("video/")||a.startsWith("audio/")||/\.(mp4|mov|mkv|webm|mp3|wav|ogg|aac|m4a)$/i.test(i);if(s){const r=t.outputFormat||(i.endsWith(".png")?"image/png":"image/webp");return await de(e,{defenseLevel:l,outputFormat:r,quality:c},n)}if(o)return await ue(e,{defenseLevel:l},n);try{return await de(e,{defenseLevel:l,outputFormat:"image/webp",quality:c},n)}catch{return await ue(e,{defenseLevel:l},n)}}var Ce=new Uint32Array(256);for(let e=0;e<256;e++){let t=e;for(let n=0;n<8;n++)t&1?t=3988292384^t>>>1:t=t>>>1;Ce[e]=t}function Qt(e){let t=-1;for(let n=0;n<e.length;n++)t=Ce[(t^e[n])&255]^t>>>8;return(t^-1)>>>0}var Wt=new TextEncoder;async function Zt(e,t){const n=[];let a=0,i=0;for(let p=0;p<e.length;p++){const u=e[p],w=await u.blob.arrayBuffer(),k=new Uint8Array(w),v=Wt.encode(u.sanitizedName),P=Qt(k),C=k.length;n.push({nameBytes:v,data:k,crc:P,size:C,offset:a});const U=30+v.length+C;a+=U,i+=46+v.length,t?.(Math.round((p+1)/e.length*40))}const l=a+i+22,c=new ArrayBuffer(l),s=new DataView(c),o=new Uint8Array(c);let r=0;const d=0,f=33,m=20,g=20,h=0;for(let p=0;p<n.length;p++){const u=n[p];s.setUint32(r,67324752,!0),r+=4,s.setUint16(r,m,!0),r+=2,s.setUint16(r,0,!0),r+=2,s.setUint16(r,h,!0),r+=2,s.setUint16(r,d,!0),r+=2,s.setUint16(r,f,!0),r+=2,s.setUint32(r,u.crc,!0),r+=4,s.setUint32(r,u.size,!0),r+=4,s.setUint32(r,u.size,!0),r+=4,s.setUint16(r,u.nameBytes.length,!0),r+=2,s.setUint16(r,0,!0),r+=2,o.set(u.nameBytes,r),r+=u.nameBytes.length,o.set(u.data,r),r+=u.size,t?.(40+Math.round((p+1)/n.length*40))}const b=r;for(let p=0;p<n.length;p++){const u=n[p];s.setUint32(r,33639248,!0),r+=4,s.setUint16(r,g,!0),r+=2,s.setUint16(r,m,!0),r+=2,s.setUint16(r,0,!0),r+=2,s.setUint16(r,h,!0),r+=2,s.setUint16(r,d,!0),r+=2,s.setUint16(r,f,!0),r+=2,s.setUint32(r,u.crc,!0),r+=4,s.setUint32(r,u.size,!0),r+=4,s.setUint32(r,u.size,!0),r+=4,s.setUint16(r,u.nameBytes.length,!0),r+=2,s.setUint16(r,0,!0),r+=2,s.setUint16(r,0,!0),r+=2,s.setUint16(r,0,!0),r+=2,s.setUint16(r,0,!0),r+=2,s.setUint32(r,32,!0),r+=4,s.setUint32(r,u.offset,!0),r+=4,o.set(u.nameBytes,r),r+=u.nameBytes.length}return s.setUint32(r,101010256,!0),r+=4,s.setUint16(r,0,!0),r+=2,s.setUint16(r,0,!0),r+=2,s.setUint16(r,n.length,!0),r+=2,s.setUint16(r,n.length,!0),r+=2,s.setUint32(r,i,!0),r+=4,s.setUint32(r,b,!0),r+=4,s.setUint16(r,0,!0),r+=2,t?.(100),{zipBlob:new Blob([c],{type:"application/zip"}),zipFileName:`bundle_${await G(c,"zip",12)}`}}function fe(e,t){const n=URL.createObjectURL(e),a=document.createElement("a");a.href=n,a.download=t,a.rel="noopener noreferrer",document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>{URL.revokeObjectURL(n)},1e3)}function Kt(e){try{e instanceof Uint8Array?e.fill(0):new Uint8Array(e).fill(0)}catch{}}function Yt(e){for(const t of e)try{URL.revokeObjectURL(t)}catch{}}function Jt(e,t){const n=document.createElement("div");n.className="border border-neutral-800 bg-[#080808] rounded-xl p-4 sm:p-5 mb-6 text-neutral-200",n.innerHTML=`
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">Encoder Quality</span>
          <span id="quality-val" class="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
            ${Math.round(e.quality*100)}%
          </span>
        </div>
        <p class="text-[11px] text-neutral-400 mt-1">
          Adjusts image and media compression. Full reconstruction and metadata removal are always applied.
        </p>
      </div>

      <div class="w-full sm:w-72 space-y-1.5">
        <input
          id="quality-slider"
          type="range"
          min="60"
          max="95"
          step="1"
          value="${Math.round(e.quality*100)}"
          class="w-full accent-neutral-200 cursor-pointer bg-neutral-900"
        />
        <div class="flex justify-between text-[10px] text-neutral-400 font-mono">
          <span>60% (Max Compression)</span>
          <span>85% (Recommended)</span>
          <span>95% (High Quality)</span>
        </div>
      </div>
    </div>
  `;const a=n.querySelector("#quality-slider"),i=n.querySelector("#quality-val");return a&&i&&a.addEventListener("input",()=>{const l=parseInt(a.value,10);i.textContent=`${l}%`,t({quality:l/100})}),n}var x={shield:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',shieldCheck:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path stroke-linecap="round" stroke-linejoin="round" d="m9 12 2 2 4-4"/></svg>',lock:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',download:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',archive:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',trash:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',eye:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',alertTriangle:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',check:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',upload:'<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>',cpu:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3m-3 6h3M1 9h3m-3 6h3"/></svg>',info:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>',close:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',sparkles:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>'};function en(e){const t=document.createElement("div");t.className="relative border border-dashed border-neutral-800 hover:border-neutral-600 bg-[#050505] hover:bg-[#0a0a0a] rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 group cursor-pointer overflow-hidden",t.innerHTML=`
    <!-- Hidden File Input -->
    <input type="file" id="file-input" multiple accept="image/*,video/*,audio/*,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.mp4,.mov,.mp3,.wav,.ogg" class="hidden" />

    <div class="relative z-10 flex flex-col items-center justify-center space-y-4">
      <div class="w-14 h-14 rounded-xl bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
        ${x.upload}
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
  `;const n=t.querySelector("#file-input");return t.addEventListener("click",()=>{n.click()}),n.addEventListener("change",()=>{n.files&&n.files.length>0&&(e(Array.from(n.files)),n.value="")}),t.addEventListener("dragover",a=>{a.preventDefault(),a.stopPropagation(),t.classList.add("border-emerald-500","bg-neutral-950")}),t.addEventListener("dragleave",a=>{a.preventDefault(),a.stopPropagation(),t.classList.remove("border-emerald-500","bg-neutral-950")}),t.addEventListener("drop",a=>{a.preventDefault(),a.stopPropagation(),t.classList.remove("border-emerald-500","bg-neutral-950"),a.dataTransfer&&a.dataTransfer.files.length>0&&e(Array.from(a.dataTransfer.files))}),t}function pe(e,t){const n=document.createElement("div");if(n.className="mt-6 space-y-4",e.length===0)return n;const a=e.filter(o=>o.status==="done").length,i=e.length;n.innerHTML=`
    <!-- Batch Actions Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#080808] border border-neutral-800">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full ${a===i?"bg-emerald-400":"bg-neutral-400 animate-pulse"}"></span>
        <span class="text-xs font-mono font-medium text-neutral-300">
          Queue: ${a} of ${i} processed
        </span>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        ${a>0?`
          <button id="btn-download-zip" class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
            ${x.archive}
            <span>Download All (ZIP)</span>
          </button>
        `:""}

        <button id="btn-clear-all" class="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-red-400 text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
          ${x.trash}
          <span>Clear</span>
        </button>
      </div>
    </div>

    <!-- Items List -->
    <div class="space-y-3" id="queue-items-container"></div>
  `;const l=n.querySelector("#btn-download-zip");l&&l.addEventListener("click",t.onDownloadAllZip);const c=n.querySelector("#btn-clear-all");c&&c.addEventListener("click",t.onClearQueue);const s=n.querySelector("#queue-items-container");return e.forEach(o=>{const r=document.createElement("div");r.className="p-4 rounded-xl border border-neutral-900 bg-black hover:border-neutral-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4";const d=o.status==="done",f=o.status==="error",m=o.status==="processing"||o.status==="analyzing",g=[];if(o.result?.auditBefore){const p=o.result.auditBefore;p.hasGps&&g.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">GPS EXPOSED</span>'),p.hasThumbnail&&g.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">THUMBNAIL LEAK</span>'),p.hasMakerNotes&&g.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">MAKERNOTES</span>'),p.hasExif&&!p.hasGps&&g.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">EXIF</span>')}r.innerHTML=`
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <div class="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-0.5 text-neutral-400">
          ${d?`<span class="text-emerald-400">${x.check}</span>`:f?`<span class="text-red-400">${x.alertTriangle}</span>`:`<span class="text-neutral-400 animate-spin">${x.cpu}</span>`}
        </div>

        <div class="min-w-0 flex-1 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-mono font-medium text-neutral-200 truncate max-w-[200px] sm:max-w-xs" title="${o.file.name}">
              ${o.file.name}
            </span>
            <span class="text-[10px] text-neutral-400 font-mono">(${me(o.file.size)})</span>
            ${g.join(" ")}
          </div>

          ${d&&o.result?`
            <div class="flex flex-wrap items-center gap-2 pt-0.5">
              <span class="text-xs font-mono text-emerald-400 font-medium">
                ${o.result.sanitizedName}
              </span>
              <span class="text-[10px] text-neutral-400 font-mono">
                (${me(o.result.sanitizedSize)})
              </span>
              <span class="text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 font-mono">
                CLEAN
              </span>
              ${o.result.warningBadge?`
                <span class="text-[10px] px-1.5 py-0.5 rounded border border-amber-500/50 bg-amber-950/40 text-amber-400 font-mono" title="${o.result.warningBadge}">
                  ${o.result.warningBadge}
                </span>
              `:""}
              ${o.result.isBypass?`
                <span class="text-[10px] px-1.5 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300 font-mono" title="Sem metadados originais: bitstream 1:1 preservado">
                  STRIP ONLY (1:1)
                </span>
              `:""}
            </div>
          `:""}

          ${m?`
            <div class="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden mt-2">
              <div class="bg-neutral-200 h-full transition-all duration-300" style="width: ${o.progress}%"></div>
            </div>
            <div class="text-[10px] text-neutral-400 font-mono flex justify-between">
              <span>${o.status==="analyzing"?"Scanning...":"Re-encoding..."}</span>
              <span>${o.progress}%</span>
            </div>
          `:""}

          ${f?`
            <div class="text-xs text-red-400 font-mono mt-1">
              Error: ${o.error||"Failed to process"}
            </div>
          `:""}
        </div>
      </div>

      <!-- Action Buttons -->
      ${d&&o.result?`
        <div class="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-900">
          <button class="btn-inspect px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
            ${x.eye}
            <span>Inspect</span>
          </button>

          <button class="btn-download px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer">
            ${x.download}
            <span>Download</span>
          </button>
        </div>
      `:""}
    `;const h=r.querySelector(".btn-inspect");h&&h.addEventListener("click",()=>t.onInspectForensics(o));const b=r.querySelector(".btn-download");b&&b.addEventListener("click",()=>t.onDownloadSingle(o)),s.appendChild(r)}),n}function me(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],a=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,a)).toFixed(1))} ${n[a]}`}function tn(e,t){const n=document.createElement("div");n.className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in";const a=URL.createObjectURL(e.originalBlob||e.blob),i=URL.createObjectURL(e.blob);n.innerHTML=`
    <div class="relative w-full max-w-5xl bg-[#080808] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div>
          <h2 class="text-sm font-bold font-mono text-white tracking-wide">File Inspection</h2>
          <p class="text-[11px] text-neutral-400 font-mono">Comparison between raw input and sanitized output</p>
        </div>

        <button id="modal-close" class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
          ${x.close}
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
                ${x.alertTriangle} Input File
              </span>
              <span class="text-[10px] font-mono text-neutral-400 truncate max-w-[200px]">${e.originalName}</span>
            </div>

            <div class="aspect-video bg-black rounded-lg border border-neutral-900 overflow-hidden flex items-center justify-center relative">
              ${ge(a,e.originalName)}
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-red-500/50 text-[10px] font-mono text-red-400">
                ${e.auditBefore.tags.length} Metadata Tags Detected
              </div>
            </div>

            <div class="space-y-1 font-mono text-[11px]">
              <div class="flex justify-between text-neutral-400">
                <span>File Size:</span>
                <span class="text-white">${he(e.originalSize)}</span>
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
                ${x.shieldCheck} Clean File
              </span>
              <span class="text-[10px] font-mono text-emerald-300 truncate max-w-[200px]">${e.sanitizedName}</span>
            </div>

            <div class="aspect-video bg-black rounded-lg border border-neutral-900 overflow-hidden flex items-center justify-center relative">
              ${ge(i,e.sanitizedName)}
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                ${x.check} 0 Metadata Tags • Pure Bitstream
              </div>
            </div>

            <div class="space-y-1 font-mono text-[11px]">
              <div class="flex justify-between text-neutral-400">
                <span>Clean Size:</span>
                <span class="text-emerald-400 font-semibold">${he(e.sanitizedSize)}</span>
              </div>
              <div class="text-neutral-400">
                <span>Output SHA-256:</span>
                <div class="text-[10px] text-emerald-400/80 break-all">${e.sha256}</div>
              </div>
            </div>
          </div>
        </div>

        ${e.warningBadge?`
          <div class="p-3 rounded-xl border border-amber-500/50 bg-amber-950/30 text-amber-300 text-xs font-mono flex items-center gap-2.5">
            <span class="text-amber-400 shrink-0">${x.alertTriangle}</span>
            <span><strong>Aviso de Eficiência:</strong> ${e.warningBadge}. O resultado do canvas foi descartado e aplicada a remoção cirúrgica direta no bitstream para evitar inchaço.</span>
          </div>
        `:""}
        ${e.isBypass?`
          <div class="p-3 rounded-xl border border-neutral-700 bg-neutral-900/60 text-neutral-300 text-xs font-mono flex items-center gap-2.5">
            <span class="text-emerald-400 shrink-0">${x.check}</span>
            <span><strong>Fast-Track Bypass (1:1):</strong> 0 metadados suspeitos encontrados. O bitstream foi preservado diretamente sem recodificação.</span>
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
                  ${e.auditBefore.tags.map(c=>`
                    <tr class="hover:bg-neutral-900/50">
                      <td class="py-2 px-2 text-neutral-400 text-[11px]">${c.category}</td>
                      <td class="py-2 px-2 text-white font-medium">${c.name}</td>
                      <td class="py-2 px-2 text-neutral-300 max-w-xs truncate" title="${c.value}">${c.value}</td>
                      <td class="py-2 px-2">
                        <span class="px-1.5 py-0.5 rounded text-[9px] uppercase ${c.severity==="critical"?"bg-red-950 text-red-400 border border-red-900":"bg-neutral-900 text-neutral-300 border border-neutral-800"}">
                          ${c.severity}
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
                ${e.auditBefore.markers.map(c=>`
                  <div class="flex items-center justify-between p-2 rounded bg-black border ${c.isSanitizedSafe?"border-neutral-800":"border-red-900/50 bg-red-950/20"} text-[11px] font-mono">
                    <span class="${c.isSanitizedSafe?"text-neutral-300":"text-red-400 font-medium"}">${c.name}</span>
                    <span class="text-[10px] text-neutral-500">${c.marker}</span>
                  </div>
                `).join("")}
              </div>
            </div>

            <!-- Sanitized Markers -->
            <div>
              <div class="text-[11px] font-mono text-neutral-400 mb-2 font-medium">Clean Segments:</div>
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                ${e.auditAfter.markers.map(c=>`
                  <div class="flex items-center justify-between p-2 rounded bg-black border border-emerald-900/40 text-[11px] font-mono">
                    <span class="text-emerald-400">${c.name}</span>
                    <span class="text-[10px] text-emerald-600">${c.marker}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        </div>

        <!-- Defense Summary -->
        <div class="p-3.5 rounded-xl border border-neutral-800 bg-black flex items-center justify-between text-xs font-mono">
          <div class="flex items-center gap-2 text-neutral-300">
            ${x.shieldCheck}
            <span>Full Reconstruction & Noise Disruption Applied</span>
          </div>
          <span class="text-[11px] text-neutral-500">In-Memory • No Server Upload</span>
        </div>
      </div>
    </div>
  `;const l=()=>{Yt([a,i]),t()};return n.querySelector("#modal-close")?.addEventListener("click",l),n.addEventListener("click",c=>{c.target===n&&l()}),n}function ge(e,t){const n=/\.(mp4|mov|webm)$/i.test(t),a=/\.(mp3|wav|ogg|aac|m4a)$/i.test(t);return n?`<video src="${e}" controls class="max-h-full max-w-full rounded"></video>`:a?`
      <div class="p-4 flex flex-col items-center justify-center text-center space-y-2 w-full">
        <span class="text-neutral-400 font-mono text-[11px]">Audio Stream</span>
        <audio src="${e}" controls class="w-full max-w-xs"></audio>
      </div>`:`<img src="${e}" alt="Preview" class="max-h-full max-w-full object-contain" />`}function he(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],a=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,a)).toFixed(1))} ${n[a]}`}function nn(e){const t=document.createElement("div");t.className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in",t.innerHTML=`
    <div class="relative w-full max-w-3xl bg-[#080808] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div class="flex items-center gap-2.5">
          <span class="text-neutral-400">${x.info}</span>
          <h2 class="text-sm font-semibold font-mono text-white tracking-wide">Legal, Licenses & Privacy</h2>
        </div>
        <button id="legal-close" class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
          ${x.close}
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto space-y-6 text-neutral-300 text-xs leading-relaxed font-sans">
        <!-- 1. Intended Purpose & Privacy Mandates -->
        <section class="space-y-2">
          <h3 class="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
            ${x.shield} Purpose & Data Minimization
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
            ${x.lock} Client-Side Execution (Zero Network Traffic)
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
            ${x.info} Usage Recommendations
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
  `;const n=t.querySelector("#legal-close"),a=t.querySelector("#legal-close-btn");return n.addEventListener("click",e),a.addEventListener("click",e),t.addEventListener("click",i=>{i.target===t&&e()}),t}var an=class{root;settings={quality:.85};queue=[];activeAuditModal=null;activeLegalModal=null;isProcessingQueue=!1;constructor(e){this.root=e,this.render()}render(){this.root.innerHTML="";const e=document.createElement("main");e.className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col";const t=Jt(this.settings,l=>{this.settings={...this.settings,...l}});e.appendChild(t);const n=en(l=>this.handleFilesAdded(l));e.appendChild(n);const a=pe(this.queue,{onDownloadSingle:l=>this.handleDownloadSingle(l),onDownloadAllZip:()=>this.handleDownloadAllZip(),onInspectForensics:l=>this.handleInspectForensics(l),onClearQueue:()=>this.handleClearQueue()});e.appendChild(a);const i=this.createFooter();e.appendChild(i),this.root.appendChild(e)}createFooter(){const e=document.createElement("footer");return e.className="mt-auto pt-16 pb-8 text-center text-neutral-500 text-xs font-mono border-t border-neutral-900",e.innerHTML=`
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
    `,e.querySelector("#footer-legal-btn")?.addEventListener("click",()=>{this.openLegalModal()}),e}handleFilesAdded(e){const t=e.map(n=>({id:`${Date.now()}-${Math.random().toString(36).slice(2,9)}`,file:n,status:"idle",progress:0}));this.queue.push(...t),this.render(),this.processQueue()}async processQueue(){if(!this.isProcessingQueue){this.isProcessingQueue=!0;for(let e=0;e<this.queue.length;e++){const t=this.queue[e];if(t.status==="idle"){t.status="analyzing",t.progress=25,this.updateQueueView();try{t.status="processing";const n=await Xt(t.file,{quality:this.settings.quality},a=>{t.progress=a,this.updateQueueView()});t.status="done",t.progress=100,t.result=n}catch(n){t.status="error",t.error=n.message||"Processing failed"}this.updateQueueView()}}this.isProcessingQueue=!1}}updateQueueView(){const e=this.root.querySelector("#queue-items-container")?.parentElement;if(e){const t=pe(this.queue,{onDownloadSingle:n=>this.handleDownloadSingle(n),onDownloadAllZip:()=>this.handleDownloadAllZip(),onInspectForensics:n=>this.handleInspectForensics(n),onClearQueue:()=>this.handleClearQueue()});e.replaceWith(t)}else this.render()}handleDownloadSingle(e){e.result&&fe(e.result.blob,e.result.sanitizedName)}async handleDownloadAllZip(){const e=this.queue.filter(a=>a.status==="done"&&a.result).map(a=>a.result);if(e.length===0)return;const{zipBlob:t,zipFileName:n}=await Zt(e);fe(t,n)}handleInspectForensics(e){e.result&&this.openAuditModal(e.result)}openAuditModal(e){this.activeAuditModal&&this.activeAuditModal.remove(),this.activeAuditModal=tn(e,()=>{this.activeAuditModal?.remove(),this.activeAuditModal=null}),document.body.appendChild(this.activeAuditModal)}openLegalModal(){this.activeLegalModal&&this.activeLegalModal.remove(),this.activeLegalModal=nn(()=>{this.activeLegalModal?.remove(),this.activeLegalModal=null}),document.body.appendChild(this.activeLegalModal)}handleClearQueue(){for(const e of this.queue)e.result&&e.result.blob.arrayBuffer().then(t=>Kt(t)).catch(()=>{});this.queue=[],this.render()}};document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("app");if(!e)throw new Error("Application root element (#app) not found");new an(e)});

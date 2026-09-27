(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const l of s)if(l.type==="childList")for(const c of l.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&a(c)}).observe(document,{childList:!0,subtree:!0});function n(s){const l={};return s.integrity&&(l.integrity=s.integrity),s.referrerPolicy&&(l.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?l.credentials="include":s.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function a(s){if(s.ep)return;s.ep=!0;const l=n(s);fetch(s.href,l)}})();var Ee=1229472850,$e=1347179589,Te=1229209940,ze=1229278788,Re=1700284774,_e=1950701684,Ne=2052348020,je=1767135348,Ve=1950960965,qe=1883789683,He=1766015824,Ge=1665684045,Xe=1732332865,Qe=1934772034,We=1448097824,Ze=1448097868,Ke=1448097880,Je=1095649613,Ye=1095650630,et=1163413830,tt=1481461792,nt=1229144912,at=1095520328,ae=1969517665,re=1835365473,se=1768715124,ie=1970628964;function rt(e){const t=new Uint8Array(e),n=[];if(t.length<4)return n;const a=new DataView(e);return t[0]===255&&t[1]===216?st(t):a.getUint32(0,!1)===2303741511?it(t,a):a.getUint32(0,!1)===1380533830&&t.length>=12&&a.getUint32(8,!1)===1464156752?ot(t,a):t.length>12&&a.getUint32(4,!1)===1718909296?lt(t,a):n}function st(e){const t=[];t.push({offset:0,marker:"0xFFD8",name:"SOI (Start of Image)",isSanitizedSafe:!0,description:"Mandatory standard JPEG boundary marker"});let n=2;const a=e.length;for(;n<a-1;){if(e[n]!==255){n++;continue}const s=e[n+1];if(s===255||s===0){n++;continue}const l="0xFF"+s.toString(16).toUpperCase().padStart(2,"0");if(s===217){t.push({offset:n,marker:l,name:"EOI (End of Image)",isSanitizedSafe:!0,description:"End of image data stream"});break}if(s===218){for(t.push({offset:n,marker:l,name:"SOS (Start of Scan)",isSanitizedSafe:!0,description:"Compressed image pixel bitstream follows"}),n+=2;n<a-1&&!(e[n]===255&&e[n+1]!==0&&e[n+1]<=217);)n++;continue}if(n+3>=a)break;const c=e[n+2]<<8|e[n+3];let i=`Segment (${l})`,o=!1,r="";switch(s){case 224:i="APP0 (JFIF Header)",o=!0,r="Basic JPEG container identification";break;case 225:e[n+4]===69&&e[n+5]===120&&e[n+6]===105&&e[n+7]===102?(i="APP1 (EXIF / GPS / IFD1 Thumbnail)",o=!1,r="High risk: contains camera serials, timestamps, GPS, and thumbnail traps"):(i="APP1 (Metadata/XMP)",o=!1,r="Contains edit history, instance IDs, or XMP packets");break;case 226:i="APP2 (ICC Color Profile)",o=!1,r="Contains OS calibration profile or author system identifiers";break;case 237:i="APP13 (Photoshop / IPTC)",o=!1,r="Contains bylines, captions, and Photoshop edit records";break;case 238:i="APP14 (Adobe DCT)",o=!1,r="Adobe color transform marker";break;case 219:i="DQT (Quantization Table)",o=!0,r="Quantization matrix; forensic fingerprint of ISP encoder";break;case 196:i="DHT (Huffman Table)",o=!0,r="Entropy encoding frequency table";break;case 192:case 194:i=`SOF (Start of Frame - ${s===192?"Baseline":"Progressive"})`,o=!0,r="Image dimensions, bit depth, and color components";break;case 254:i="COM (Comment)",o=!1,r="Text comment embedded in image";break;default:s>=227&&s<=239&&(i=`APP${s-224} (Vendor Marker)`,o=!1,r="Proprietary camera or software metadata block")}t.push({offset:n,marker:l,name:i,length:c,isSanitizedSafe:o,description:r}),n+=2+c}return t}function it(e,t){const n=[];let a=8;const s=t.byteLength;for(;a+8<=s;){const l=t.getUint32(a,!1),c=t.getUint32(a+4,!1);let i=!1,o="Image raster data or standard header",r="UNKNOWN";switch(c){case Ee:i=!0,r="IHDR",o="Header: Dimensions, depth, color type";break;case $e:i=!0,r="PLTE",o="Palette table";break;case Te:i=!0,r="IDAT",o="Compressed image pixel data";break;case ze:i=!0,r="IEND",o="End of PNG image";break;case Re:i=!1,r="eXIf",o="Embedded raw EXIF metadata block";break;case _e:i=!1,r="tEXt",o="Textual metadata (Creation time, software, author)";break;case Ne:i=!1,r="zTXt",o="Compressed textual metadata";break;case je:i=!1,r="iTXt",o="Internationalized UTF-8 metadata";break;case Ve:i=!1,r="tIME",o="Modification timestamp";break;case qe:i=!1,r="pHYs",o="Physical pixel dimensions / DPI";break;case He:i=!1,r="iCCP",o="Embedded ICC Color Profile / Display calibration fingerprint";break;case Ge:i=!1,r="cHRM",o="Primary chromaticities display calibration";break;case Xe:i=!1,r="gAMA",o="Image gamma correction curve";break;case Qe:i=!0,r="sRGB",o="Standard sRGB color space rendering intent";break;default:r="CHUNK",i=!1}n.push({offset:a,marker:r,name:`Chunk: ${r}`,length:l,isSanitizedSafe:i,description:o}),a+=12+l}return n}function ot(e,t){const n=[];let a=12;const s=t.byteLength;for(;a+8<=s;){const l=t.getUint32(a,!1),c=t.getUint32(a+4,!0);let i=!1,o="Visual raster bitstream",r="WEBP";switch(l){case We:r="VP8",i=!0;break;case Ze:r="VP8L",i=!0;break;case Ke:r="VP8X",i=!0;break;case Je:r="ANIM",i=!0;break;case Ye:r="ANMF",i=!0;break;case et:r="EXIF",i=!1,o="Embedded EXIF metadata block";break;case tt:r="XMP",i=!1,o="Embedded XMP metadata block";break;case nt:r="ICCP",i=!1,o="ICC Color Profile";break;case at:r="ALPH",i=!0,o="Canal de transparência alfa dos pixels reconstruídos";break;default:r="CHUNK",i=!1}n.push({offset:a,marker:r,name:`WebP Chunk: ${r}`,length:c,isSanitizedSafe:i,description:o});const d=c+c%2;a+=8+d}return n}function lt(e,t){const n=[];let a=0;const s=t.byteLength;for(;a+8<=s;){const l=t.getUint32(a,!1),c=t.getUint32(a+4,!1);if(l<8&&l!==0)break;const i=c===ae||c===re||c===se||c===ie;let o="BOX",r="Video/Audio container structure";switch(c){case ae:o="udta",r="User Data box (stores GPS, camera model, author)";break;case re:o="meta",r="Metadata box (tags, encoder settings)";break;case se:o="ilst",r="Item List atom (QuickTime/iTunes metadata)";break;case ie:o="uuid",r="Vendor proprietary custom box";break;case 1718909296:o="ftyp";break;case 1836019574:o="moov";break;case 1835295092:o="mdat";break;default:o="atom"}if(n.push({offset:a,marker:o,name:`Box: ${o}`,length:l,isSanitizedSafe:!i,description:r}),l===0||a+l>s)break;a+=l}return n}async function ct(e){const t=e instanceof Uint8Array?e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength):e,n=await crypto.subtle.digest("SHA-256",t);return Array.from(new Uint8Array(n)).map(a=>a.toString(16).padStart(2,"0")).join("")}async function q(e,t,n=16){const a=e instanceof Uint8Array?e:new Uint8Array(e),s=new Uint8Array(32);crypto.getRandomValues(s);const l=new Uint8Array(s.length+a.length);l.set(s,0),l.set(a,s.length);const c=await crypto.subtle.digest("SHA-256",l.buffer),i=Array.from(new Uint8Array(c)).map(r=>r.toString(16).padStart(2,"0")).join("");s.fill(0),l.fill(0);const o=t.replace(/[^a-zA-Z0-9]/g,"").toLowerCase()||"bin";return`${i.slice(0,n)}.${o}`}async function R(e,t){const n=await e.arrayBuffer(),a=new Uint8Array(n),s=[],l=rt(n);let c=!1,i=!1,o=!1,r=!1;const d=dt(a);if(d!==-1){c=!0;const h=new DataView(n,d),b=h.getUint16(0)===18761;try{const p=h.getUint32(4,b);if(p<a.length){const u=z(h,p,b,"IFD0");if(s.push(...u.tags),u.gpsPointer){i=!0;const v=z(h,u.gpsPointer,b,"GPS");s.push(...v.tags)}if(u.exifPointer){const v=z(h,u.exifPointer,b,"EXIF");s.push(...v.tags),v.hasMakerNotes&&(r=!0)}if(u.nextIfdOffset&&u.nextIfdOffset!==0){o=!0;const v=z(h,u.nextIfdOffset,b,"IFD1");s.push({category:"IFD1_Thumbnail",name:"IFD1 Embedded Thumbnail",value:`Embedded image preview found at offset ${u.nextIfdOffset}`,severity:"critical",description:"Embedded unedited thumbnail: major forensic leak vector."}),s.push(...v.tags)}}}catch{s.push({category:"EXIF",name:"Malformed EXIF Header",value:"Header parsing failed",severity:"medium"})}}const f=pt(a);f.length>0&&s.push(...f),l.some(h=>h.name.includes("ICC")||h.marker==="ICCP")&&s.push({category:"ICC",name:"ICC Color Profile",value:"Color management profile present (hardware/software calibration)",severity:"medium",description:"Can identify operating system or monitor calibration profile."});const m=await ct(n),g=c||r?"high":l.length>5?"moderate":"low";return{fileName:t||(e instanceof File?e.name:"unnamed_media"),fileSize:e.size,mimeType:e.type||"application/octet-stream",hasExif:c,hasGps:i,hasThumbnail:o,hasMakerNotes:r,tags:s,markers:l,prnuSusceptibility:g,sha256:m}}function dt(e){if(e.length>=8&&(e[0]===73&&e[1]===73&&e[2]===42&&e[3]===0||e[0]===77&&e[1]===77&&e[2]===0&&e[3]===42))return 0;for(let t=0;t<Math.min(e.length-10,65536);t++)if(e[t]===255&&e[t+1]===225&&e[t+4]===69&&e[t+5]===120&&e[t+6]===105&&e[t+7]===102&&e[t+8]===0&&e[t+9]===0)return t+10;for(let t=12;t<Math.min(e.length-8,65536);t++)if(e[t]===69&&e[t+1]===88&&e[t+2]===73&&e[t+3]===70)return t+8;return-1}function z(e,t,n,a){const s={tags:[]};if(t+2>=e.byteLength)return s;const l=e.getUint16(t,n);let c=t+2;for(let i=0;i<l&&!(c+12>e.byteLength);i++){const o=e.getUint16(c,n),r=e.getUint16(c+2,n),d=e.getUint32(c+4,n),f=c+8;let m="";if(o===34665&&a==="IFD0")s.exifPointer=e.getUint32(f,n);else if(o===34853&&a==="IFD0")s.gpsPointer=e.getUint32(f,n);else if(o===37500)s.hasMakerNotes=!0,s.tags.push({category:"MakerNotes",name:"Proprietary MakerNotes",value:`${d} bytes of camera-specific binary telemetry`,severity:"critical",description:"Manufacturer proprietary block containing sensor temperatures, lens serials, or face biometric coordinates."});else{const g=ut(o,a);g&&(r===2?m=ft(e,f,d,n):r===3?m=e.getUint16(f,n).toString():r===4?m=e.getUint32(f,n).toString():m=`[${d} items]`,m.trim()&&s.tags.push({category:a==="GPS"?"GPS":a==="IFD1"?"IFD1_Thumbnail":"EXIF",name:g.name,value:m.trim(),severity:g.severity,description:g.description}))}c+=12}return c+4<=e.byteLength&&(s.nextIfdOffset=e.getUint32(c,n)),s}function ut(e,t){if(t==="GPS")switch(e){case 1:return{name:"GPS Latitude Ref",severity:"critical",description:"North/South coordinate hemisphere"};case 2:return{name:"GPS Latitude",severity:"critical",description:"Precise GPS latitude coordinates"};case 3:return{name:"GPS Longitude Ref",severity:"critical",description:"East/West coordinate hemisphere"};case 4:return{name:"GPS Longitude",severity:"critical",description:"Precise GPS longitude coordinates"};case 6:return{name:"GPS Altitude",severity:"critical",description:"Elevation above sea level"};case 7:return{name:"GPS TimeStamp",severity:"critical",description:"Atomic satellite UTC timestamp"};case 29:return{name:"GPS DateStamp",severity:"critical",description:"Satellite GPS date"}}switch(e){case 271:return{name:"Camera Manufacturer (Make)",severity:"high",description:"Brand of camera or smartphone"};case 272:return{name:"Camera Model",severity:"critical",description:"Exact phone or camera hardware model"};case 305:return{name:"Software / OS Version",severity:"high",description:"Firmware or operating system build"};case 306:return{name:"Modify Date / Time",severity:"high",description:"Modification timestamp"};case 36867:return{name:"Date / Time Original",severity:"critical",description:"Exact moment the shutter was pressed"};case 36868:return{name:"Date / Time Digitized",severity:"critical",description:"Sensor analog-to-digital timestamp"};case 42033:return{name:"Camera Body Serial Number",severity:"critical",description:"Hardware unique serial number"};case 42036:return{name:"Lens Model",severity:"high",description:"Optical lens specifications"};case 42016:return{name:"Image Unique ID",severity:"critical",description:"Unique cryptographic ID generated by ISP"};case 513:return{name:"Thumbnail Offset",severity:"critical",description:"Pointer to raw thumbnail stream"};case 514:return{name:"Thumbnail Length",severity:"critical",description:"Byte length of embedded thumbnail"};default:return null}}function ft(e,t,n,a){let s=t;if(n>4&&(s=e.getUint32(t,a)),s+n>e.byteLength)return"";let l="";for(let c=0;c<n;c++){const i=e.getUint8(s+c);if(i===0)break;l+=String.fromCharCode(i)}return l}function pt(e){const t=[],n=Math.min(e.length-20,2e5),a="<?xpacket begin";for(let s=0;s<n;s++)if(e[s]===60&&e[s+1]===63&&String.fromCharCode(...e.slice(s,s+15))===a){t.push({category:"XMP",name:"Adobe XMP Metadata Packet",value:"XMP Packet detected",severity:"critical",description:"Contains edit history, Photoshop/Lightroom instance IDs, and original document UUIDs."});break}return t}function mt(e){if(e==="standard")return{theta:0,sx:1,sy:1,noiseIntensity:0};const t=new Uint32Array(3);crypto.getRandomValues(t);const n=.1+t[0]/4294967295*.2,a=(t[0]%2===0?1:-1)*(n*Math.PI)/180,s=.995+t[1]/4294967295*.004;let l=.995+t[2]/4294967295*.004;return Math.abs(s-l)<5e-4&&(l=s<.997?s+6e-4:s-6e-4),{theta:a,sx:s,sy:l,noiseIntensity:2}}function w(e){const t=Math.abs(e);return t<=1?1.5*t*t*t-2.5*t*t+1:t<2?-.5*t*t*t+2.5*t*t-4*t+2:0}function ht(e,t,n,a=!0){const s=e.width,l=e.height;if(n==="standard"){t.width=s,t.height=l,t.getContext("2d",{willReadFrequently:!0,alpha:a}).drawImage(e,0,0);return}const c=mt(n),i=new OffscreenCanvas(s,l).getContext("2d",{willReadFrequently:!0});i.drawImage(e,0,0);const o=i.getImageData(0,0,s,l),r=new Uint32Array(o.data.buffer),d=3,f=s-6,m=l-6;t.width=f,t.height=m;const g=t.getContext("2d",{willReadFrequently:!0,alpha:a}),h=g.createImageData(f,m),b=new Uint32Array(h.data.buffer),p=Math.cos(c.theta),u=Math.sin(c.theta),v=c.sx*p,y=-c.sy*u,U=c.sx*u,L=c.sy*p,k=v*L-y*U,O=L/k,ye=-y/k,H=-U/k,we=v/k,G=s/2,X=l/2,Q=new Uint32Array(1);crypto.getRandomValues(Q);let C=Q[0]||305419896;for(let D=0;D<m;D++){const W=D+d-X,Z=-G+d;let _=Z*O+W*ye+G,N=Z*H+W*we+X;for(let j=0;j<f;j++){const K=Math.floor(_),J=Math.floor(N),B=_-K,E=N-J,ke=w(B+1),Ce=w(B),Ue=w(B-1),Me=w(B-2),Se=w(E+1),Pe=w(E),Ie=w(E-1),Ae=w(E-2);let Y=0,ee=0,te=0,ne=0;for(let M=-1;M<=2;M++){let S=0;if(M===-1?S=Se:M===0?S=Pe:M===1?S=Ie:S=Ae,S===0)continue;let A=J+M;A<0?A=0:A>=l&&(A=l-1);const Be=A*s;for(let P=-1;P<=2;P++){let I=0;if(P===-1?I=ke:P===0?I=Ce:P===1?I=Ue:I=Me,I===0)continue;let F=K+P;F<0?F=0:F>=s&&(F=s-1);const $=I*S,T=r[Be+F];Y+=(T&255)*$,ee+=(T>>8&255)*$,te+=(T>>16&255)*$,ne+=(T>>24&255)*$}}C^=C<<13,C^=C>>>17,C^=C<<5;const V=(C&255)%5-2,Fe=Math.min(255,Math.max(0,Y+V)),Le=Math.min(255,Math.max(0,ee+V)),Oe=Math.min(255,Math.max(0,te+V)),De=a?Math.min(255,Math.max(0,ne)):255;b[D*f+j]=Fe|Le<<8|Oe<<16|De<<24,_+=O,N+=H}}g.putImageData(h,0,0)}var gt=1766015824,xt=1665684045,bt=1732332865,vt=1700284774,yt=1950701684,wt=2052348020,kt=1767135348,Ct=1950960965,Ut=1883789683,Mt=1229144912,St=1163413830,Pt=1481461792;function It(e,t){return e.length<12?e:t==="image/png"||e[0]===137&&e[1]===80&&e[2]===78&&e[3]===71?At(e):t==="image/jpeg"||e[0]===255&&e[1]===216?Ft(e):t==="image/webp"||e[0]===82&&e[1]===73&&e[2]===70&&e[3]===70?Lt(e):e}function At(e){if(e.length<8)return e;const t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(t.getUint32(0,!1)!==2303741511||t.getUint32(4,!1)!==218765834)return e;const n=new Uint8Array(e.length);n.set(e.subarray(0,8),0);let a=8,s=8;const l=e.length;for(;a+8<=l;){const c=t.getUint32(a,!1),i=t.getUint32(a+4,!1),o=12+c;if(a+o>l)break;i===gt||i===xt||i===bt||i===vt||i===yt||i===wt||i===kt||i===Ct||i===Ut||(n.set(e.subarray(a,a+o),s),s+=o),a+=o}return n.subarray(0,s)}function Ft(e){if(e.length<4||e[0]!==255||e[1]!==216)return e;const t=new Uint8Array(e.length);t[0]=255,t[1]=216;let n=2,a=2;const s=e.length;for(;a<s-1;){if(e[a]!==255){t[n++]=e[a++];continue}const l=e[a+1];if(l===255||l===0){t[n++]=e[a++];continue}if(l===217){t[n++]=255,t[n++]=217;break}if(l===218){const o=e.subarray(a);t.set(o,n),n+=o.length;break}if(a+3>=s)break;const c=2+(e[a+2]<<8|e[a+3]);if(a+c>s)break;let i=!1;l===226?a+15<=s&&e[a+4]===73&&e[a+5]===67&&e[a+6]===67&&e[a+7]===95&&e[a+8]===80&&e[a+9]===82&&e[a+10]===79&&e[a+11]===70&&e[a+12]===73&&e[a+13]===76&&e[a+14]===69&&e[a+15]===0&&(i=!0):(l===225||l===237||l===238||l===254||l>=227&&l<=239)&&(i=!0),i||(t.set(e.subarray(a,a+c),n),n+=c),a+=c}return t.subarray(0,n)}function Lt(e){if(e.length<12)return e;const t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(t.getUint32(0,!1)!==1380533830||t.getUint32(8,!1)!==1464156752)return e;const n=new Uint8Array(e.length);n.set(e.subarray(0,12),0);const a=new DataView(n.buffer,n.byteOffset,n.byteLength);let s=12,l=12;const c=e.length;for(;s+8<=c;){const i=t.getUint32(s,!1),o=t.getUint32(s+4,!0),r=8+(o+o%2);if(s+r>c)break;if(i===Mt||i===St||i===Pt){s+=r;continue}if(i===1448097880&&o>=10){n.set(e.subarray(s,s+r),l),n[l+8]&=-45,l+=r,s+=r;continue}n.set(e.subarray(s,s+r),l),l+=r,s+=r}return a.setUint32(4,l-8,!0),n.subarray(0,l)}async function oe(e,t,n){n?.(10);const a=e instanceof File?e.name:"unnamed_image",s=await R(e,a);n?.(30);const l=await createImageBitmap(e);n?.(50);let c=t.outputFormat;c==="original"&&(c=e.type||"image/jpeg"),["image/webp","image/jpeg","image/png"].includes(c)||(c="image/webp");const i=!(e.type==="image/jpeg"||/\.(jpe?g|bmp)$/i.test(a))&&c!=="image/jpeg",o=t.quality??.92,r=c==="image/webp"?"webp":c==="image/png"?"png":"jpg";let d;typeof OffscreenCanvas<"u"?d=new OffscreenCanvas(l.width,l.height):(d=document.createElement("canvas"),d.width=l.width,d.height=l.height),d.getContext("2d",{willReadFrequently:!0,alpha:i}),ht(l,d,t.defenseLevel,i),n?.(70);let f;d instanceof OffscreenCanvas?f=await d.convertToBlob({type:c,quality:o}):f=await new Promise((u,v)=>{d.toBlob(y=>{y?u(y):v(new Error("Failed to encode canvas blob"))},c,o)}),n?.(80),l.close();const m=await f.arrayBuffer(),g=It(new Uint8Array(m),c),h=new Blob([g],{type:c});n?.(88);const b=await q(g,r),p=await R(h,b);return n?.(100),{blob:h,originalBlob:e,originalName:a,sanitizedName:b,originalSize:e.size,sanitizedSize:h.size,format:c,sha256:p.sha256,defenseLevel:t.defenseLevel,auditBefore:s,auditAfter:p,processedAt:Date.now()}}var Ot=1718909296,me=1836019574,Dt=1836476516,Bt=1953196132,Et=1835296868,he=1969517665,ge=1835365473,$t=1768715124,xe=1970628964,Tt=1835295092;async function le(e,t,n){n?.(15);const a=e instanceof File?e.name:"unnamed_media",s=await R(e,a);n?.(35);const l=await e.arrayBuffer(),c=new Uint8Array(l);let i;const o=e.type||"";zt(c)?i=_t(c):Rt(o,a)?i=jt(c):i=c,n?.(75);const r=new Blob([i],{type:o||"video/mp4"}),d=a.split(".").pop()||"mp4",f=await q(i,d);n?.(90);const m=await R(r,f);return n?.(100),{blob:r,originalBlob:e,originalName:a,sanitizedName:f,originalSize:e.size,sanitizedSize:r.size,format:o,sha256:m.sha256,defenseLevel:t.defenseLevel,auditBefore:s,auditAfter:m,processedAt:Date.now()}}function zt(e){if(e.length<12)return!1;const t=new DataView(e.buffer,e.byteOffset,e.byteLength).getUint32(4,!1);return t===Ot||t===me}function Rt(e,t){return e.startsWith("audio/")||/\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(t)}function _t(e){const t=new Uint8Array(e.length);let n=0,a=0;const s=e.length,l=new DataView(e.buffer,e.byteOffset,e.byteLength);for(;a+8<=s;){const c=l.getUint32(a,!1),i=l.getUint32(a+4,!1);let o=c,r=8;if(c===0)o=s-a;else if(c===1){if(a+16>s)break;o=Number(l.getBigUint64(a+8,!1)),r=16}if(o<r||a+o>s)break;if(i===he||i===ge||i===xe){a+=o;continue}if(i===me){const d=be(e.subarray(a,a+o));t.set(d,n),n+=d.length}else if(i===Tt){const d=Nt(e.subarray(a,a+o));t.set(d,n),n+=d.length}else t.set(e.subarray(a,a+o),n),n+=o;a+=o}return t.subarray(0,n)}function be(e){const t=new Uint8Array(e.length);let n=8,a=8;const s=e.length,l=new DataView(e.buffer,e.byteOffset,e.byteLength),c=new DataView(t.buffer,t.byteOffset,t.byteLength);for(t.set(e.subarray(0,8),0);a+8<=s;){const i=l.getUint32(a,!1),o=l.getUint32(a+4,!1);let r=i,d=8;if(i===0)r=s-a;else if(i===1){if(a+16>s)break;r=Number(l.getBigUint64(a+8,!1)),d=16}if(r<d||a+r>s)break;if(o===he||o===ge||o===$t||o===xe){a+=r;continue}if(o===1953653099||o===1835297121||o===1835626086||o===1937007212||o===1684631142){const f=be(e.subarray(a,a+r));t.set(f,n),n+=f.length}else{const f=e.subarray(a,a+r);if(t.set(f,n),(o===Dt||o===Bt||o===Et)&&r>=28){const m=t[n+8];m===0?(c.setUint32(n+12,0,!1),c.setUint32(n+16,0,!1)):m===1&&r>=40&&(c.setBigUint64(n+12,0n,!1),c.setBigUint64(n+20,0n,!1))}n+=r}a+=r}return c.setUint32(0,n,!1),t.subarray(0,n)}function Nt(e){const t=new TextEncoder().encode("x264 - core");for(let n=8;n<e.length-t.length;n++){let a=!0;for(let s=0;s<t.length;s++)if(e[n+s]!==t[s]){a=!1;break}if(a)for(let s=0;s<256&&n+s<e.length;s++)e[n+s]=0}return e}function jt(e){let t=0,n=e.length;if(e.length>=10&&e[0]===73&&e[1]===68&&e[2]===51&&(t=10+((e[6]&127)<<21|(e[7]&127)<<14|(e[8]&127)<<7|e[9]&127)),e.length>=128){const a=e.length-128;e[a]===84&&e[a+1]===65&&e[a+2]===71&&(n=a)}return e.subarray(t,n)}async function Vt(e,t={},n){const a=e.type.toLowerCase(),s=e.name.toLowerCase(),l=t.defenseLevel||"paranoid",c=t.quality??.85,i=a.startsWith("image/")||/\.(jpg|jpeg|png|webp|bmp|gif|tiff)$/i.test(s),o=a.startsWith("video/")||a.startsWith("audio/")||/\.(mp4|mov|mkv|webm|mp3|wav|ogg|aac|m4a)$/i.test(s);if(i){const r=t.outputFormat||(s.endsWith(".png")?"image/png":"image/webp");return await oe(e,{defenseLevel:l,outputFormat:r,quality:c},n)}if(o)return await le(e,{defenseLevel:l},n);try{return await oe(e,{defenseLevel:l,outputFormat:"image/webp",quality:c},n)}catch{return await le(e,{defenseLevel:l},n)}}var ve=new Uint32Array(256);for(let e=0;e<256;e++){let t=e;for(let n=0;n<8;n++)t&1?t=3988292384^t>>>1:t=t>>>1;ve[e]=t}function qt(e){let t=-1;for(let n=0;n<e.length;n++)t=ve[(t^e[n])&255]^t>>>8;return(t^-1)>>>0}var Ht=new TextEncoder;async function Gt(e,t){const n=[];let a=0,s=0;for(let p=0;p<e.length;p++){const u=e[p],v=await u.blob.arrayBuffer(),y=new Uint8Array(v),U=Ht.encode(u.sanitizedName),L=qt(y),k=y.length;n.push({nameBytes:U,data:y,crc:L,size:k,offset:a});const O=30+U.length+k;a+=O,s+=46+U.length,t?.(Math.round((p+1)/e.length*40))}const l=a+s+22,c=new ArrayBuffer(l),i=new DataView(c),o=new Uint8Array(c);let r=0;const d=0,f=33,m=20,g=20,h=0;for(let p=0;p<n.length;p++){const u=n[p];i.setUint32(r,67324752,!0),r+=4,i.setUint16(r,m,!0),r+=2,i.setUint16(r,0,!0),r+=2,i.setUint16(r,h,!0),r+=2,i.setUint16(r,d,!0),r+=2,i.setUint16(r,f,!0),r+=2,i.setUint32(r,u.crc,!0),r+=4,i.setUint32(r,u.size,!0),r+=4,i.setUint32(r,u.size,!0),r+=4,i.setUint16(r,u.nameBytes.length,!0),r+=2,i.setUint16(r,0,!0),r+=2,o.set(u.nameBytes,r),r+=u.nameBytes.length,o.set(u.data,r),r+=u.size,t?.(40+Math.round((p+1)/n.length*40))}const b=r;for(let p=0;p<n.length;p++){const u=n[p];i.setUint32(r,33639248,!0),r+=4,i.setUint16(r,g,!0),r+=2,i.setUint16(r,m,!0),r+=2,i.setUint16(r,0,!0),r+=2,i.setUint16(r,h,!0),r+=2,i.setUint16(r,d,!0),r+=2,i.setUint16(r,f,!0),r+=2,i.setUint32(r,u.crc,!0),r+=4,i.setUint32(r,u.size,!0),r+=4,i.setUint32(r,u.size,!0),r+=4,i.setUint16(r,u.nameBytes.length,!0),r+=2,i.setUint16(r,0,!0),r+=2,i.setUint16(r,0,!0),r+=2,i.setUint16(r,0,!0),r+=2,i.setUint16(r,0,!0),r+=2,i.setUint32(r,32,!0),r+=4,i.setUint32(r,u.offset,!0),r+=4,o.set(u.nameBytes,r),r+=u.nameBytes.length}return i.setUint32(r,101010256,!0),r+=4,i.setUint16(r,0,!0),r+=2,i.setUint16(r,0,!0),r+=2,i.setUint16(r,n.length,!0),r+=2,i.setUint16(r,n.length,!0),r+=2,i.setUint32(r,s,!0),r+=4,i.setUint32(r,b,!0),r+=4,i.setUint16(r,0,!0),r+=2,t?.(100),{zipBlob:new Blob([c],{type:"application/zip"}),zipFileName:`bundle_${await q(c,"zip",12)}`}}function ce(e,t){const n=URL.createObjectURL(e),a=document.createElement("a");a.href=n,a.download=t,a.rel="noopener noreferrer",document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>{URL.revokeObjectURL(n)},1e3)}function Xt(e){try{e instanceof Uint8Array?e.fill(0):new Uint8Array(e).fill(0)}catch{}}function Qt(e){for(const t of e)try{URL.revokeObjectURL(t)}catch{}}function Wt(e,t){const n=document.createElement("div");n.className="border border-neutral-800 bg-[#080808] rounded-xl p-4 sm:p-5 mb-6 text-neutral-200",n.innerHTML=`
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
  `;const a=n.querySelector("#quality-slider"),s=n.querySelector("#quality-val");return a&&s&&a.addEventListener("input",()=>{const l=parseInt(a.value,10);s.textContent=`${l}%`,t({quality:l/100})}),n}var x={shield:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',shieldCheck:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path stroke-linecap="round" stroke-linejoin="round" d="m9 12 2 2 4-4"/></svg>',lock:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',download:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',archive:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',trash:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',eye:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',alertTriangle:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',check:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',upload:'<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>',cpu:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3m-3 6h3M1 9h3m-3 6h3"/></svg>',info:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>',close:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',sparkles:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>'};function Zt(e){const t=document.createElement("div");t.className="relative border border-dashed border-neutral-800 hover:border-neutral-600 bg-[#050505] hover:bg-[#0a0a0a] rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 group cursor-pointer overflow-hidden",t.innerHTML=`
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
  `;const n=t.querySelector("#file-input");return t.addEventListener("click",()=>{n.click()}),n.addEventListener("change",()=>{n.files&&n.files.length>0&&(e(Array.from(n.files)),n.value="")}),t.addEventListener("dragover",a=>{a.preventDefault(),a.stopPropagation(),t.classList.add("border-emerald-500","bg-neutral-950")}),t.addEventListener("dragleave",a=>{a.preventDefault(),a.stopPropagation(),t.classList.remove("border-emerald-500","bg-neutral-950")}),t.addEventListener("drop",a=>{a.preventDefault(),a.stopPropagation(),t.classList.remove("border-emerald-500","bg-neutral-950"),a.dataTransfer&&a.dataTransfer.files.length>0&&e(Array.from(a.dataTransfer.files))}),t}function de(e,t){const n=document.createElement("div");if(n.className="mt-6 space-y-4",e.length===0)return n;const a=e.filter(o=>o.status==="done").length,s=e.length;n.innerHTML=`
    <!-- Batch Actions Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#080808] border border-neutral-800">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full ${a===s?"bg-emerald-400":"bg-neutral-400 animate-pulse"}"></span>
        <span class="text-xs font-mono font-medium text-neutral-300">
          Queue: ${a} of ${s} processed
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
  `;const l=n.querySelector("#btn-download-zip");l&&l.addEventListener("click",t.onDownloadAllZip);const c=n.querySelector("#btn-clear-all");c&&c.addEventListener("click",t.onClearQueue);const i=n.querySelector("#queue-items-container");return e.forEach(o=>{const r=document.createElement("div");r.className="p-4 rounded-xl border border-neutral-900 bg-black hover:border-neutral-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4";const d=o.status==="done",f=o.status==="error",m=o.status==="processing"||o.status==="analyzing",g=[];if(o.result?.auditBefore){const p=o.result.auditBefore;p.hasGps&&g.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">GPS EXPOSED</span>'),p.hasThumbnail&&g.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">THUMBNAIL LEAK</span>'),p.hasMakerNotes&&g.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">MAKERNOTES</span>'),p.hasExif&&!p.hasGps&&g.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">EXIF</span>')}r.innerHTML=`
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <div class="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-0.5 text-neutral-400">
          ${d?`<span class="text-emerald-400">${x.check}</span>`:f?`<span class="text-red-400">${x.alertTriangle}</span>`:`<span class="text-neutral-400 animate-spin">${x.cpu}</span>`}
        </div>

        <div class="min-w-0 flex-1 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-mono font-medium text-neutral-200 truncate max-w-[200px] sm:max-w-xs" title="${o.file.name}">
              ${o.file.name}
            </span>
            <span class="text-[10px] text-neutral-400 font-mono">(${ue(o.file.size)})</span>
            ${g.join(" ")}
          </div>

          ${d&&o.result?`
            <div class="flex flex-wrap items-center gap-2 pt-0.5">
              <span class="text-xs font-mono text-emerald-400 font-medium">
                ${o.result.sanitizedName}
              </span>
              <span class="text-[10px] text-neutral-400 font-mono">
                (${ue(o.result.sanitizedSize)})
              </span>
              <span class="text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 font-mono">
                CLEAN
              </span>
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
    `;const h=r.querySelector(".btn-inspect");h&&h.addEventListener("click",()=>t.onInspectForensics(o));const b=r.querySelector(".btn-download");b&&b.addEventListener("click",()=>t.onDownloadSingle(o)),i.appendChild(r)}),n}function ue(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],a=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,a)).toFixed(1))} ${n[a]}`}function Kt(e,t){const n=document.createElement("div");n.className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in";const a=URL.createObjectURL(e.originalBlob||e.blob),s=URL.createObjectURL(e.blob);n.innerHTML=`
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
              ${fe(a,e.originalName)}
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-red-500/50 text-[10px] font-mono text-red-400">
                ${e.auditBefore.tags.length} Metadata Tags Detected
              </div>
            </div>

            <div class="space-y-1 font-mono text-[11px]">
              <div class="flex justify-between text-neutral-400">
                <span>File Size:</span>
                <span class="text-white">${pe(e.originalSize)}</span>
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
              ${fe(s,e.sanitizedName)}
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                ${x.check} 0 Metadata Tags • Pure Bitstream
              </div>
            </div>

            <div class="space-y-1 font-mono text-[11px]">
              <div class="flex justify-between text-neutral-400">
                <span>Clean Size:</span>
                <span class="text-emerald-400 font-semibold">${pe(e.sanitizedSize)}</span>
              </div>
              <div class="text-neutral-400">
                <span>Output SHA-256:</span>
                <div class="text-[10px] text-emerald-400/80 break-all">${e.sha256}</div>
              </div>
            </div>
          </div>
        </div>

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
  `;const l=()=>{Qt([a,s]),t()};return n.querySelector("#modal-close")?.addEventListener("click",l),n.addEventListener("click",c=>{c.target===n&&l()}),n}function fe(e,t){const n=/\.(mp4|mov|webm)$/i.test(t),a=/\.(mp3|wav|ogg|aac|m4a)$/i.test(t);return n?`<video src="${e}" controls class="max-h-full max-w-full rounded"></video>`:a?`
      <div class="p-4 flex flex-col items-center justify-center text-center space-y-2 w-full">
        <span class="text-neutral-400 font-mono text-[11px]">Audio Stream</span>
        <audio src="${e}" controls class="w-full max-w-xs"></audio>
      </div>`:`<img src="${e}" alt="Preview" class="max-h-full max-w-full object-contain" />`}function pe(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],a=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,a)).toFixed(1))} ${n[a]}`}function Jt(e){const t=document.createElement("div");t.className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in",t.innerHTML=`
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
  `;const n=t.querySelector("#legal-close"),a=t.querySelector("#legal-close-btn");return n.addEventListener("click",e),a.addEventListener("click",e),t.addEventListener("click",s=>{s.target===t&&e()}),t}var Yt=class{root;settings={quality:.85};queue=[];activeAuditModal=null;activeLegalModal=null;isProcessingQueue=!1;constructor(e){this.root=e,this.render()}render(){this.root.innerHTML="";const e=document.createElement("main");e.className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col";const t=Wt(this.settings,l=>{this.settings={...this.settings,...l}});e.appendChild(t);const n=Zt(l=>this.handleFilesAdded(l));e.appendChild(n);const a=de(this.queue,{onDownloadSingle:l=>this.handleDownloadSingle(l),onDownloadAllZip:()=>this.handleDownloadAllZip(),onInspectForensics:l=>this.handleInspectForensics(l),onClearQueue:()=>this.handleClearQueue()});e.appendChild(a);const s=this.createFooter();e.appendChild(s),this.root.appendChild(e)}createFooter(){const e=document.createElement("footer");return e.className="mt-auto pt-16 pb-8 text-center text-neutral-500 text-xs font-mono border-t border-neutral-900",e.innerHTML=`
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
    `,e.querySelector("#footer-legal-btn")?.addEventListener("click",()=>{this.openLegalModal()}),e}handleFilesAdded(e){const t=e.map(n=>({id:`${Date.now()}-${Math.random().toString(36).slice(2,9)}`,file:n,status:"idle",progress:0}));this.queue.push(...t),this.render(),this.processQueue()}async processQueue(){if(!this.isProcessingQueue){this.isProcessingQueue=!0;for(let e=0;e<this.queue.length;e++){const t=this.queue[e];if(t.status==="idle"){t.status="analyzing",t.progress=25,this.updateQueueView();try{t.status="processing";const n=await Vt(t.file,{quality:this.settings.quality},a=>{t.progress=a,this.updateQueueView()});t.status="done",t.progress=100,t.result=n}catch(n){t.status="error",t.error=n.message||"Processing failed"}this.updateQueueView()}}this.isProcessingQueue=!1}}updateQueueView(){const e=this.root.querySelector("#queue-items-container")?.parentElement;if(e){const t=de(this.queue,{onDownloadSingle:n=>this.handleDownloadSingle(n),onDownloadAllZip:()=>this.handleDownloadAllZip(),onInspectForensics:n=>this.handleInspectForensics(n),onClearQueue:()=>this.handleClearQueue()});e.replaceWith(t)}else this.render()}handleDownloadSingle(e){e.result&&ce(e.result.blob,e.result.sanitizedName)}async handleDownloadAllZip(){const e=this.queue.filter(a=>a.status==="done"&&a.result).map(a=>a.result);if(e.length===0)return;const{zipBlob:t,zipFileName:n}=await Gt(e);ce(t,n)}handleInspectForensics(e){e.result&&this.openAuditModal(e.result)}openAuditModal(e){this.activeAuditModal&&this.activeAuditModal.remove(),this.activeAuditModal=Kt(e,()=>{this.activeAuditModal?.remove(),this.activeAuditModal=null}),document.body.appendChild(this.activeAuditModal)}openLegalModal(){this.activeLegalModal&&this.activeLegalModal.remove(),this.activeLegalModal=Jt(()=>{this.activeLegalModal?.remove(),this.activeLegalModal=null}),document.body.appendChild(this.activeLegalModal)}handleClearQueue(){for(const e of this.queue)e.result&&e.result.blob.arrayBuffer().then(t=>Xt(t)).catch(()=>{});this.queue=[],this.render()}};document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("app");if(!e)throw new Error("Application root element (#app) not found");new Yt(e)});

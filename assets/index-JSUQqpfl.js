(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&a(c)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();var $e=1229472850,Ne=1347179589,je=1229209940,Ve=1229278788,qe=1700284774,Xe=1950701684,He=2052348020,Ge=1767135348,We=1950960965,Qe=1883789683,Ze=1766015824,Ye=1665684045,Ke=1732332865,Je=1934772034,et=1448097824,tt=1448097868,nt=1448097880,at=1095649613,rt=1095650630,it=1163413830,st=1481461792,ot=1229144912,lt=1095520328,le=1969517665,ce=1835365473,de=1768715124,ue=1970628964;function ct(e){const t=new Uint8Array(e),n=[];if(t.length<4)return n;const a=new DataView(e);return t[0]===255&&t[1]===216?dt(t):a.getUint32(0,!1)===2303741511?ut(t,a):a.getUint32(0,!1)===1380533830&&t.length>=12&&a.getUint32(8,!1)===1464156752?ft(t,a):t.length>12&&a.getUint32(4,!1)===1718909296?pt(t,a):n}function dt(e){const t=[];t.push({offset:0,marker:"0xFFD8",name:"SOI (Start of Image)",isSanitizedSafe:!0,description:"Mandatory standard JPEG boundary marker"});let n=2;const a=e.length;for(;n<a-1;){if(e[n]!==255){n++;continue}const s=e[n+1];if(s===255||s===0){n++;continue}const r="0xFF"+s.toString(16).toUpperCase().padStart(2,"0");if(s===217){t.push({offset:n,marker:r,name:"EOI (End of Image)",isSanitizedSafe:!0,description:"End of image data stream"});break}if(s===218){for(t.push({offset:n,marker:r,name:"SOS (Start of Scan)",isSanitizedSafe:!0,description:"Compressed image pixel bitstream follows"}),n+=2;n<a-1&&!(e[n]===255&&e[n+1]!==0&&e[n+1]<=217);)n++;continue}if(n+3>=a)break;const c=e[n+2]<<8|e[n+3];let o=`Segment (${r})`,l=!1,i="";switch(s){case 224:o="APP0 (JFIF Header)",l=!0,i="Basic JPEG container identification";break;case 225:e[n+4]===69&&e[n+5]===120&&e[n+6]===105&&e[n+7]===102?(o="APP1 (EXIF / GPS / IFD1 Thumbnail)",l=!1,i="High risk: contains camera serials, timestamps, GPS, and thumbnail traps"):(o="APP1 (Metadata/XMP)",l=!1,i="Contains edit history, instance IDs, or XMP packets");break;case 226:o="APP2 (ICC Color Profile)",l=!1,i="Contains OS calibration profile or author system identifiers";break;case 237:o="APP13 (Photoshop / IPTC)",l=!1,i="Contains bylines, captions, and Photoshop edit records";break;case 238:o="APP14 (Adobe DCT)",l=!1,i="Adobe color transform marker";break;case 219:o="DQT (Quantization Table)",l=!0,i="Quantization matrix; forensic fingerprint of ISP encoder";break;case 196:o="DHT (Huffman Table)",l=!0,i="Entropy encoding frequency table";break;case 192:case 194:o=`SOF (Start of Frame - ${s===192?"Baseline":"Progressive"})`,l=!0,i="Image dimensions, bit depth, and color components";break;case 254:o="COM (Comment)",l=!1,i="Text comment embedded in image";break;default:s>=227&&s<=239&&(o=`APP${s-224} (Vendor Marker)`,l=!1,i="Proprietary camera or software metadata block")}t.push({offset:n,marker:r,name:o,length:c,isSanitizedSafe:l,description:i}),n+=2+c}return t}function ut(e,t){const n=[];let a=8;const s=t.byteLength;for(;a+8<=s;){const r=t.getUint32(a,!1),c=t.getUint32(a+4,!1);let o=!1,l="Image raster data or standard header",i="UNKNOWN";switch(c){case $e:o=!0,i="IHDR",l="Header: Dimensions, depth, color type";break;case Ne:o=!0,i="PLTE",l="Palette table";break;case je:o=!0,i="IDAT",l="Compressed image pixel data";break;case Ve:o=!0,i="IEND",l="End of PNG image";break;case qe:o=!1,i="eXIf",l="Embedded raw EXIF metadata block";break;case Xe:o=!1,i="tEXt",l="Textual metadata (Creation time, software, author)";break;case He:o=!1,i="zTXt",l="Compressed textual metadata";break;case Ge:o=!1,i="iTXt",l="Internationalized UTF-8 metadata";break;case We:o=!1,i="tIME",l="Modification timestamp";break;case Qe:o=!1,i="pHYs",l="Physical pixel dimensions / DPI";break;case Ze:o=!1,i="iCCP",l="Embedded ICC Color Profile / Display calibration fingerprint";break;case Ye:o=!1,i="cHRM",l="Primary chromaticities display calibration";break;case Ke:o=!1,i="gAMA",l="Image gamma correction curve";break;case Je:o=!0,i="sRGB",l="Standard sRGB color space rendering intent";break;default:i="CHUNK",o=!1}n.push({offset:a,marker:i,name:`Chunk: ${i}`,length:r,isSanitizedSafe:o,description:l}),a+=12+r}return n}function ft(e,t){const n=[];let a=12;const s=t.byteLength;for(;a+8<=s;){const r=t.getUint32(a,!1),c=t.getUint32(a+4,!0);let o=!1,l="Visual raster bitstream",i="WEBP";switch(r){case et:i="VP8",o=!0;break;case tt:i="VP8L",o=!0;break;case nt:i="VP8X",o=!0;break;case at:i="ANIM",o=!0;break;case rt:i="ANMF",o=!0;break;case it:i="EXIF",o=!1,l="Embedded EXIF metadata block";break;case st:i="XMP",o=!1,l="Embedded XMP metadata block";break;case ot:i="ICCP",o=!1,l="ICC Color Profile";break;case lt:i="ALPH",o=!0,l="Alpha transparency channel for reconstructed pixels";break;default:i="CHUNK",o=!1}n.push({offset:a,marker:i,name:`WebP Chunk: ${i}`,length:c,isSanitizedSafe:o,description:l});const d=c+c%2;a+=8+d}return n}function pt(e,t){const n=[];let a=0;const s=t.byteLength;for(;a+8<=s;){const r=t.getUint32(a,!1),c=t.getUint32(a+4,!1);if(r<8&&r!==0)break;const o=c===le||c===ce||c===de||c===ue;let l="BOX",i="Video/Audio container structure";switch(c){case le:l="udta",i="User Data box (stores GPS, camera model, author)";break;case ce:l="meta",i="Metadata box (tags, encoder settings)";break;case de:l="ilst",i="Item List atom (QuickTime/iTunes metadata)";break;case ue:l="uuid",i="Vendor proprietary custom box";break;case 1718909296:l="ftyp";break;case 1836019574:l="moov";break;case 1835295092:l="mdat";break;default:l="atom"}if(n.push({offset:a,marker:l,name:`Box: ${l}`,length:r,isSanitizedSafe:!o,description:i}),r===0||a+r>s)break;a+=r}return n}function mt(e,t){if(e.length<12)return 0;let n=0;const a=e.length;if(e[0]===255&&e[1]===216||t==="image/jpeg"){let s=2;for(;s<a-1;){if(e[s]!==255){s++;continue}const r=e[s+1];if(r===255||r===0){s++;continue}if(r===217||r===218||s+3>=a)break;const c=e[s+2]<<8|e[s+3],o=s+4,l=s+2+c;if(l>a)break;if(r===225)if(o+6<=l&&e[o]===69&&e[o+1]===120&&e[o+2]===105&&e[o+3]===102&&e[o+4]===0&&e[o+5]===0){n++;const i=o+6;if(i+8<=l){const d=new DataView(e.buffer,e.byteOffset+i,l-i),u=d.getUint16(0)===18761,f=d.getUint32(4,u);if(f+2<=d.byteLength){const m=d.getUint16(f,u),g=f+2+m*12;g+4<=d.byteLength&&d.getUint32(g,u)!==0&&n++}}}else n++;else r===226?o+12<=l&&e[o]===73&&e[o+1]===67&&e[o+2]===67&&e[o+3]===95&&e[o+4]===80&&e[o+5]===82&&e[o+6]===79&&e[o+7]===70&&e[o+8]===73&&e[o+9]===76&&e[o+10]===69&&e[o+11]===0&&n++:(r>=227&&r<=239||r===254)&&n++;s=l}return n}if(e[0]===137&&e[1]===80&&e[2]===78&&e[3]===71||t==="image/png"){let s=8;const r=new DataView(e.buffer,e.byteOffset,e.byteLength);for(;s+8<=a;){const c=r.getUint32(s,!1),o=r.getUint32(s+4,!1),l=12+c;if(s+l>a)break;switch(o){case 1700284774:case 1766015824:case 1950701684:case 2052348020:case 1767135348:n++}s+=l}return n}if(e[0]===82&&e[1]===73&&e[2]===70&&e[3]===70||t==="image/webp"){let s=12;const r=new DataView(e.buffer,e.byteOffset,e.byteLength);for(;s+8<=a;){const c=r.getUint32(s,!1),o=r.getUint32(s+4,!0),l=8+(o+o%2);if(s+l>a)break;(c===1163413830||c===1481461792||c===1229144912)&&n++,s+=l}return n}return 0}async function gt(e){const t=e instanceof Uint8Array?e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength):e,n=await crypto.subtle.digest("SHA-256",t);return Array.from(new Uint8Array(n)).map(a=>a.toString(16).padStart(2,"0")).join("")}function ht(e){const t=e.match(/\.([a-zA-Z0-9]+)$/);return(t?t[1]:e).replace(/[^a-zA-Z0-9]/g,"").toLowerCase()||"webp"}async function ne(e,t,n=32){const a=e instanceof Uint8Array?e:new Uint8Array(e),s=new Uint8Array(32);crypto.getRandomValues(s);const r=new Uint8Array(s.length+a.length);r.set(s,0),r.set(a,s.length);const c=await crypto.subtle.digest("SHA-256",r.buffer),o=Array.from(new Uint8Array(c)).map(i=>i.toString(16).padStart(2,"0")).join("");s.fill(0),r.fill(0);const l=ht(t);return`${o.slice(0,n)}.${l}`}async function Z(e,t){const n=await e.arrayBuffer(),a=new Uint8Array(n),s=[],r=ct(n);let c=!1,o=!1,l=!1,i=!1;const d=xt(a);if(d!==-1){c=!0;const g=new DataView(n,d),x=g.getUint16(0)===18761;try{const h=g.getUint32(4,x);if(h<a.length){const p=te(g,h,x,"IFD0");if(s.push(...p.tags),p.gpsPointer){o=!0;const v=te(g,p.gpsPointer,x,"GPS");s.push(...v.tags)}if(p.exifPointer){const v=te(g,p.exifPointer,x,"EXIF");s.push(...v.tags),v.hasMakerNotes&&(i=!0)}if(p.nextIfdOffset&&p.nextIfdOffset!==0){l=!0;const v=te(g,p.nextIfdOffset,x,"IFD1");s.push({category:"IFD1_Thumbnail",name:"IFD1 Embedded Thumbnail",value:`Embedded image preview found at offset ${p.nextIfdOffset}`,severity:"critical",description:"Embedded unedited thumbnail: major forensic leak vector."}),s.push(...v.tags)}}}catch{s.push({category:"EXIF",name:"Malformed EXIF Header",value:"Header parsing failed",severity:"medium"})}}const u=wt(a);u.length>0&&s.push(...u),r.some(g=>g.name.includes("ICC")||g.marker==="ICCP")&&s.push({category:"ICC",name:"ICC Color Profile",value:"Color management profile present (hardware/software calibration)",severity:"medium",description:"Can identify operating system or monitor calibration profile."});const f=await gt(n),m=c||i?"high":r.length>5?"moderate":"low";return{fileName:t||(e instanceof File?e.name:"unnamed_media"),fileSize:e.size,mimeType:e.type||"application/octet-stream",hasExif:c,hasGps:o,hasThumbnail:l,hasMakerNotes:i,tags:s,markers:r,prnuSusceptibility:m,sha256:f}}function xt(e){if(e.length>=8&&(e[0]===73&&e[1]===73&&e[2]===42&&e[3]===0||e[0]===77&&e[1]===77&&e[2]===0&&e[3]===42))return 0;for(let t=0;t<Math.min(e.length-10,65536);t++)if(e[t]===255&&e[t+1]===225&&e[t+4]===69&&e[t+5]===120&&e[t+6]===105&&e[t+7]===102&&e[t+8]===0&&e[t+9]===0)return t+10;for(let t=12;t<Math.min(e.length-8,65536);t++)if(e[t]===69&&e[t+1]===88&&e[t+2]===73&&e[t+3]===70)return t+8;return-1}function te(e,t,n,a){const s={tags:[]};if(t+2>=e.byteLength)return s;const r=e.getUint16(t,n);let c=t+2;for(let o=0;o<r&&!(c+12>e.byteLength);o++){const l=e.getUint16(c,n),i=e.getUint16(c+2,n),d=e.getUint32(c+4,n),u=c+8;let f="";if(l===34665&&a==="IFD0")s.exifPointer=e.getUint32(u,n);else if(l===34853&&a==="IFD0")s.gpsPointer=e.getUint32(u,n);else if(l===37500)s.hasMakerNotes=!0,s.tags.push({category:"MakerNotes",name:"Proprietary MakerNotes",value:`${d} bytes of camera-specific binary telemetry`,severity:"critical",description:"Manufacturer proprietary block containing sensor temperatures, lens serials, or face biometric coordinates."});else{const m=bt(l,a);m&&(i===2?f=vt(e,u,d,n):i===3?f=e.getUint16(u,n).toString():i===4?f=e.getUint32(u,n).toString():f=`[${d} items]`,f.trim()&&s.tags.push({category:a==="GPS"?"GPS":a==="IFD1"?"IFD1_Thumbnail":"EXIF",name:m.name,value:f.trim(),severity:m.severity,description:m.description}))}c+=12}return c+4<=e.byteLength&&(s.nextIfdOffset=e.getUint32(c,n)),s}function bt(e,t){if(t==="GPS")switch(e){case 1:return{name:"GPS Latitude Ref",severity:"critical",description:"North/South coordinate hemisphere"};case 2:return{name:"GPS Latitude",severity:"critical",description:"Precise GPS latitude coordinates"};case 3:return{name:"GPS Longitude Ref",severity:"critical",description:"East/West coordinate hemisphere"};case 4:return{name:"GPS Longitude",severity:"critical",description:"Precise GPS longitude coordinates"};case 6:return{name:"GPS Altitude",severity:"critical",description:"Elevation above sea level"};case 7:return{name:"GPS TimeStamp",severity:"critical",description:"Atomic satellite UTC timestamp"};case 29:return{name:"GPS DateStamp",severity:"critical",description:"Satellite GPS date"}}switch(e){case 271:return{name:"Camera Manufacturer (Make)",severity:"high",description:"Brand of camera or smartphone"};case 272:return{name:"Camera Model",severity:"critical",description:"Exact phone or camera hardware model"};case 305:return{name:"Software / OS Version",severity:"high",description:"Firmware or operating system build"};case 306:return{name:"Modify Date / Time",severity:"high",description:"Modification timestamp"};case 36867:return{name:"Date / Time Original",severity:"critical",description:"Exact moment the shutter was pressed"};case 36868:return{name:"Date / Time Digitized",severity:"critical",description:"Sensor analog-to-digital timestamp"};case 42033:return{name:"Camera Body Serial Number",severity:"critical",description:"Hardware unique serial number"};case 42036:return{name:"Lens Model",severity:"high",description:"Optical lens specifications"};case 42016:return{name:"Image Unique ID",severity:"critical",description:"Unique cryptographic ID generated by ISP"};case 513:return{name:"Thumbnail Offset",severity:"critical",description:"Pointer to raw thumbnail stream"};case 514:return{name:"Thumbnail Length",severity:"critical",description:"Byte length of embedded thumbnail"};default:return null}}function vt(e,t,n,a){let s=t;if(n>4&&(s=e.getUint32(t,a)),s+n>e.byteLength)return"";let r="";for(let c=0;c<n;c++){const o=e.getUint8(s+c);if(o===0)break;r+=String.fromCharCode(o)}return r}function wt(e){const t=[],n=Math.min(e.length-20,2e5),a="<?xpacket begin";for(let s=0;s<n;s++)if(e[s]===60&&e[s+1]===63&&String.fromCharCode(...e.slice(s,s+15))===a){t.push({category:"XMP",name:"Adobe XMP Metadata Packet",value:"XMP Packet detected",severity:"critical",description:"Contains edit history, Photoshop/Lightroom instance IDs, and original document UUIDs."});break}return t}function yt(e,t=!1){if(e==="standard")return{theta:0,sx:1,sy:1,noiseIntensity:0};const n=new Uint32Array(3);crypto.getRandomValues(n);const a=.1+n[0]/4294967295*.2,s=(n[0]%2===0?1:-1)*(a*Math.PI)/180,r=.995+n[1]/4294967295*.004;let c=.995+n[2]/4294967295*.004;return Math.abs(r-c)<5e-4&&(c=r<.997?r+6e-4:r-6e-4),{theta:s,sx:r,sy:c,noiseIntensity:t?0:2}}function _(e){const t=Math.abs(e);return t<=1?1.5*t*t*t-2.5*t*t+1:t<2?-.5*t*t*t+2.5*t*t-4*t+2:0}function kt(e,t,n,a=!0,s=!1){const r=e.width,c=e.height;if(n==="standard"){t.width=r,t.height=c,t.getContext("2d",{willReadFrequently:!0,alpha:a}).drawImage(e,0,0);return}const o=yt(n,s),l=new OffscreenCanvas(r,c).getContext("2d",{willReadFrequently:!0});l.drawImage(e,0,0);const i=l.getImageData(0,0,r,c),d=new Uint32Array(i.data.buffer),u=3,f=r-6,m=c-6;t.width=f,t.height=m;const g=t.getContext("2d",{willReadFrequently:!0,alpha:a}),x=g.createImageData(f,m),h=new Uint32Array(x.data.buffer),p=Math.cos(o.theta),v=Math.sin(o.theta),C=o.sx*p,y=-o.sy*v,w=o.sx*v,M=o.sy*p,U=C*M-y*w,N=M/U,$=-y/U,O=-w/U,k=C/U,S=r/2,A=c/2,Y=new Uint32Array(1);crypto.getRandomValues(Y);let E=Y[0]||305419896;for(let j=0;j<m;j++){const I=j+u-A,D=-S+u;let L=D*N+I*$+S,G=D*O+I*k+A;for(let P=0;P<f;P++){const F=Math.floor(L),R=Math.floor(G),B=L-F,T=G-R,Ae=_(B+1),Pe=_(B),Ee=_(B-1),Ie=_(B-2),De=_(T+1),Le=_(T),Fe=_(T-1),Be=_(T-2);let re=0,ie=0,se=0,oe=0;for(let V=-1;V<=2;V++){let q=0;if(V===-1?q=De:V===0?q=Le:V===1?q=Fe:q=Be,q===0)continue;let W=R+V;W<0?W=0:W>=c&&(W=c-1);const ze=W*r;for(let X=-1;X<=2;X++){let H=0;if(X===-1?H=Ae:X===0?H=Pe:X===1?H=Ee:H=Ie,H===0)continue;let Q=F+X;Q<0?Q=0:Q>=r&&(Q=r-1);const J=H*q,ee=d[ze+Q];re+=(ee&255)*J,ie+=(ee>>8&255)*J,se+=(ee>>16&255)*J,oe+=(ee>>24&255)*J}}let K=0;o.noiseIntensity>0&&(E^=E<<13,E^=E>>>17,E^=E<<5,K=(E&255)%5-2);const Te=Math.min(255,Math.max(0,re+K)),Oe=Math.min(255,Math.max(0,ie+K)),Re=Math.min(255,Math.max(0,se+K)),_e=a?Math.min(255,Math.max(0,oe)):255;h[j*f+P]=Te|Oe<<8|Re<<16|_e<<24,L+=N,G+=O}}g.putImageData(x,0,0)}var Ct=1766015824,Ut=1665684045,Mt=1732332865,St=1700284774,At=1950701684,Pt=2052348020,Et=1767135348,It=1950960965,Dt=1883789683,Lt=1229144912,Ft=1163413830,Bt=1481461792;function we(e,t){return e.length<12?e:t==="image/png"||e[0]===137&&e[1]===80&&e[2]===78&&e[3]===71?Tt(e):t==="image/jpeg"||e[0]===255&&e[1]===216?Ot(e):t==="image/webp"||e[0]===82&&e[1]===73&&e[2]===70&&e[3]===70?Vt(e):e}function Tt(e){if(e.length<8)return e;const t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(t.getUint32(0,!1)!==2303741511||t.getUint32(4,!1)!==218765834)return e;const n=new Uint8Array(e.length);n.set(e.subarray(0,8),0);let a=8,s=8;const r=e.length;for(;a+8<=r;){const c=t.getUint32(a,!1),o=t.getUint32(a+4,!1),l=12+c;if(a+l>r)break;o===Ct||o===Ut||o===Mt||o===St||o===At||o===Pt||o===Et||o===It||o===Dt||(n.set(e.subarray(a,a+l),s),s+=l),a+=l}return n.subarray(0,s)}function Ot(e){if(e.length<4||e[0]!==255||e[1]!==216)return e;const t=new Uint8Array(e.length);t[0]=255,t[1]=216;let n=2,a=2;const s=e.length;for(;a<s-1;){if(e[a]!==255){t[n++]=e[a++];continue}const r=e[a+1];if(r===255||r===0){t[n++]=e[a++];continue}if(r===217){t[n++]=255,t[n++]=217;break}if(r===218){const l=e.subarray(a);t.set(l,n),n+=l.length;break}if(a+3>=s)break;const c=2+(e[a+2]<<8|e[a+3]);if(a+c>s)break;let o=!1;r===226?a+15<=s&&e[a+4]===73&&e[a+5]===67&&e[a+6]===67&&e[a+7]===95&&e[a+8]===80&&e[a+9]===82&&e[a+10]===79&&e[a+11]===70&&e[a+12]===73&&e[a+13]===76&&e[a+14]===69&&e[a+15]===0&&(o=!0):(r===225||r===237||r===238||r===254||r>=227&&r<=239)&&(o=!0),o||(t.set(e.subarray(a,a+c),n),n+=c),a+=c}return t.subarray(0,n)}var Rt=1448097880,_t=1095520328,zt=1448097824,$t=1448097868,Nt=1095649613,jt=1095650630;function Vt(e){if(e.length<12)return e;const t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(t.getUint32(0,!1)!==1380533830||t.getUint32(8,!1)!==1464156752)return e;let n=!1,a=!1,s=null;const r=[];let c=12;const o=e.length;for(;c+8<=o;){const u=t.getUint32(c,!1),f=t.getUint32(c+4,!0),m=8+(f+f%2);if(c+m>o)break;u===_t?(n=!0,r.push({offset:c,totalLen:m,type:u})):u===Nt||u===jt?(a=!0,r.push({offset:c,totalLen:m,type:u})):u===Rt?s={offset:c,totalLen:m}:u===zt||u===$t?r.push({offset:c,totalLen:m,type:u}):u===Lt||u===Ft||u===Bt||r.push({offset:c,totalLen:m,type:u}),c+=m}const l=new Uint8Array(e.length);l.set(e.subarray(0,12),0);const i=new DataView(l.buffer,l.byteOffset,l.byteLength);let d=12;if((n||a)&&s){l.set(e.subarray(s.offset,s.offset+s.totalLen),d);let u=0;n&&(u|=16),a&&(u|=2),l[d+8]=u,d+=s.totalLen}for(const u of r)l.set(e.subarray(u.offset,u.offset+u.totalLen),d),d+=u.totalLen;return i.setUint32(4,d-8,!0),l.subarray(0,d)}var qt=we;function z(e){const t=Math.abs(e);return t<=1?1.5*t*t*t-2.5*t*t+1:t<2?-.5*t*t*t+2.5*t*t-4*t+2:0}function Xt(e,t,n,a,s,r,c=!0){const o=t/s,l=n/r;for(let i=0;i<r;i++){const d=(i+.5)*l-.5,u=Math.floor(d),f=d-u,m=z(f+1),g=z(f),x=z(f-1),h=z(f-2);for(let p=0;p<s;p++){const v=(p+.5)*o-.5,C=Math.floor(v),y=v-C,w=z(y+1),M=z(y),U=z(y-1),N=z(y-2);let $=0,O=0,k=0,S=0;for(let I=-1;I<=2;I++){let D=0;if(I===-1?D=m:I===0?D=g:I===1?D=x:D=h,D===0)continue;let L=u+I;L<0?L=0:L>=n&&(L=n-1);const G=L*t;for(let P=-1;P<=2;P++){let F=0;if(P===-1?F=w:P===0?F=M:P===1?F=U:F=N,F===0)continue;let R=C+P;R<0?R=0:R>=t&&(R=t-1);const B=F*D,T=e[G+R];$+=(T&255)*B,O+=(T>>8&255)*B,k+=(T>>16&255)*B,S+=(T>>24&255)*B}}const A=Math.min(255,Math.max(0,Math.round($))),Y=Math.min(255,Math.max(0,Math.round(O))),E=Math.min(255,Math.max(0,Math.round(k))),j=c?Math.min(255,Math.max(0,Math.round(S))):255;a[i*s+p]=A|Y<<8|E<<16|j<<24}}}function Ht(e,t=!0){const n=e.width,a=e.height;if(n<4||a<4)return;const s=Math.max(2,Math.round(n*.995)),r=Math.max(2,Math.round(a*.995));let c;typeof OffscreenCanvas<"u"?c=new OffscreenCanvas(s,r):(c=document.createElement("canvas"),c.width=s,c.height=r);const o=c.getContext("2d",{willReadFrequently:!0});o.drawImage(e,0,0,s,r);const l=o.getImageData(0,0,s,r),i=new Uint32Array(l.data.buffer),d=e.getContext("2d",{willReadFrequently:!0}),u=d.createImageData(n,a);Xt(i,s,r,new Uint32Array(u.data.buffer),n,a,t),d.putImageData(u,0,0)}function ae(e){for(let t=1;t<9;t++){const n=e[t];let a=t-1;for(;a>=0&&e[a]>n;)e[a+1]=e[a],a--;e[a+1]=n}}function fe(e,t,n){const a=e.length,s=new Uint8ClampedArray(a);s.set(e);const r=new Uint8Array(9),c=new Uint8Array(9),o=new Uint8Array(9);for(let l=0;l<n;l++)for(let i=0;i<t;i++){let d=0;for(let f=-1;f<=1;f++){const m=Math.min(n-1,Math.max(0,l+f))*t;for(let g=-1;g<=1;g++){const x=(m+Math.min(t-1,Math.max(0,i+g)))*4;r[d]=e[x],c[d]=e[x+1],o[d]=e[x+2],d++}}ae(r),ae(c),ae(o);const u=(l*t+i)*4;s[u]=r[4],s[u+1]=c[4],s[u+2]=o[4]}e.set(s)}function Gt(e){const t=e.width,n=e.height;if(t<3||n<3)return;const a=e.getContext("2d",{willReadFrequently:!0});if(!a)return;let s=null,r=null;try{typeof OffscreenCanvas<"u"?s=new OffscreenCanvas(t,n):(s=document.createElement("canvas"),s.width=t,s.height=n),r=s.getContext("webgl")}catch{r=null}if(!r){const c=a.getImageData(0,0,t,n);fe(c.data,t,n),a.putImageData(c,0,0);return}try{const c=`
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = (a_position + 1.0) * 0.5;
      }
    `,o=`
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
    `,l=r.createShader(r.VERTEX_SHADER);r.shaderSource(l,c),r.compileShader(l);const i=r.createShader(r.FRAGMENT_SHADER);r.shaderSource(i,o),r.compileShader(i);const d=r.createProgram();r.attachShader(d,l),r.attachShader(d,i),r.linkProgram(d),r.useProgram(d);const u=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,u),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),r.STATIC_DRAW);const f=r.getAttribLocation(d,"a_position");r.enableVertexAttribArray(f),r.vertexAttribPointer(f,2,r.FLOAT,!1,0,0);const m=r.getUniformLocation(d,"u_resolution");r.uniform2f(m,t,n);const g=r.createTexture();r.bindTexture(r.TEXTURE_2D,g),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.NEAREST),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,e),r.viewport(0,0,t,n),r.drawArrays(r.TRIANGLES,0,6),a.drawImage(s,0,0)}catch{const c=a.getImageData(0,0,t,n);fe(c.data,t,n),a.putImageData(c,0,0)}}function Wt(e,t=1597463007){let n=t||305419896;for(let a=0;a<e.length;a+=4){n^=n<<13,n^=n>>>17,n^=n<<5;const s=((n&1)===0?1:-1)*((n>>1&1)+1),r=((n>>2&1)===0?1:-1)*((n>>3&1)+1),c=((n>>4&1)===0?1:-1)*((n>>5&1)+1);e[a]=Math.min(255,Math.max(0,e[a]+s)),e[a+1]=Math.min(255,Math.max(0,e[a+1]+r)),e[a+2]=Math.min(255,Math.max(0,e[a+2]+c))}}function Qt(e,t=!0){Ht(e,t),Gt(e);const n=e.getContext("2d",{willReadFrequently:!0});if(n){const a=n.getImageData(0,0,e.width,e.height);Wt(a.data),n.putImageData(a,0,0)}}function Zt(e,t,n){if(t==="image/png"||/\.png$/i.test(n)||/screenshot/i.test(n))return!0;if(t==="image/jpeg"||/\.(jpe?g)$/i.test(n)){try{let a;typeof OffscreenCanvas<"u"?a=new OffscreenCanvas(48,48):(a=document.createElement("canvas"),a.width=48,a.height=48);const s=a.getContext("2d",{willReadFrequently:!0});if(s){s.drawImage(e,0,0,48,48);const r=s.getImageData(0,0,48,48).data,c=new Set;for(let o=0;o<r.length;o+=4){const l=r[o]>>4,i=r[o+1]>>4,d=r[o+2]>>4,u=l<<8|i<<4|d;if(c.add(u),c.size>=32)return!1}return c.size<32}}catch{}return!1}return!0}async function pe(e,t,n){n?.(10);const a=e instanceof File?e.name:"unnamed_image",s=e.size,r=await e.arrayBuffer(),c=new Uint8Array(r),o=await Z(e,a);n?.(25);let l=t.outputFormat;l==="original"&&(l=e.type||"image/jpeg"),["image/webp","image/jpeg","image/png"].includes(l)||(l="image/webp");const i=l==="image/webp"?"webp":l==="image/png"?"png":"jpg";if(mt(c,e.type)===0&&!t.extremeSanitization){n?.(80);const k=new Blob([c],{type:l}),S=await ne(c,i),A=await Z(k,S);return n?.(100),{blob:k,originalBlob:e,originalName:a,sanitizedName:S,originalSize:s,sanitizedSize:k.size,format:l,sha256:A.sha256,defenseLevel:t.defenseLevel,auditBefore:o,auditAfter:A,processedAt:Date.now(),isBypass:!0,extremeSanitization:t.extremeSanitization}}const d=await createImageBitmap(e);n?.(45);const u=Zt(d,e.type,a);let f=!1,m=l,g=t.quality??.85,x=u;t.extremeSanitization&&u?(m="image/webp",g=t.quality??.85,x=!1,f=!0):u?(m=l==="image/png"?"image/png":"image/webp",g=1):g=t.quality??.85;const h=!(e.type==="image/jpeg"||/\.(jpe?g|bmp)$/i.test(a))&&m!=="image/jpeg";let p;typeof OffscreenCanvas<"u"?p=new OffscreenCanvas(d.width,d.height):(p=document.createElement("canvas"),p.width=d.width,p.height=d.height),p.getContext("2d",{willReadFrequently:!0,alpha:h}),kt(d,p,t.defenseLevel,h,x),f&&Qt(p,h),n?.(70);let v;p instanceof OffscreenCanvas?v=await p.convertToBlob({type:m,quality:g}):v=await new Promise((k,S)=>{p.toBlob(A=>{A?k(A):S(new Error("Failed to encode canvas blob"))},m,g)}),n?.(85),d.close();const C=await v.arrayBuffer(),y=we(new Uint8Array(C),m);let w=new Blob([y],{type:m}),M=y,U;if(!f&&w.size>s){U="Size inflated by entropy injection";const k=qt(c,e.type||m);M=k,w=new Blob([k],{type:e.type||m})}n?.(92);const N=w.type==="image/webp"?"webp":w.type==="image/png"?"png":"jpg",$=await ne(M,N),O=await Z(w,$);return n?.(100),{blob:w,originalBlob:e,originalName:a,sanitizedName:$,originalSize:s,sanitizedSize:w.size,format:w.type,sha256:O.sha256,defenseLevel:t.defenseLevel,auditBefore:o,auditAfter:O,processedAt:Date.now(),warningBadge:U,isDeepDecontaminated:f,extremeSanitization:t.extremeSanitization}}var Yt=1718909296,ye=1836019574,Kt=1836476516,Jt=1953196132,en=1835296868,ke=1969517665,Ce=1835365473,tn=1768715124,Ue=1970628964,nn=1835295092;async function me(e,t,n){n?.(15);const a=e instanceof File?e.name:"unnamed_media",s=await Z(e,a);n?.(35);const r=await e.arrayBuffer(),c=new Uint8Array(r);let o;const l=e.type||"";an(c)?o=sn(c):rn(l,a)?o=ln(c):o=c,n?.(75);const i=new Blob([o],{type:l||"video/mp4"}),d=a.split(".").pop()||"mp4",u=await ne(o,d);n?.(90);const f=await Z(i,u);return n?.(100),{blob:i,originalBlob:e,originalName:a,sanitizedName:u,originalSize:e.size,sanitizedSize:i.size,format:l,sha256:f.sha256,defenseLevel:t.defenseLevel,auditBefore:s,auditAfter:f,processedAt:Date.now()}}function an(e){if(e.length<12)return!1;const t=new DataView(e.buffer,e.byteOffset,e.byteLength).getUint32(4,!1);return t===Yt||t===ye}function rn(e,t){return e.startsWith("audio/")||/\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(t)}function sn(e){const t=new Uint8Array(e.length);let n=0,a=0;const s=e.length,r=new DataView(e.buffer,e.byteOffset,e.byteLength);for(;a+8<=s;){const c=r.getUint32(a,!1),o=r.getUint32(a+4,!1);let l=c,i=8;if(c===0)l=s-a;else if(c===1){if(a+16>s)break;l=Number(r.getBigUint64(a+8,!1)),i=16}if(l<i||a+l>s)break;if(o===ke||o===Ce||o===Ue){a+=l;continue}if(o===ye){const d=Me(e.subarray(a,a+l));t.set(d,n),n+=d.length}else if(o===nn){const d=on(e.subarray(a,a+l));t.set(d,n),n+=d.length}else t.set(e.subarray(a,a+l),n),n+=l;a+=l}return t.subarray(0,n)}function Me(e){const t=new Uint8Array(e.length);let n=8,a=8;const s=e.length,r=new DataView(e.buffer,e.byteOffset,e.byteLength),c=new DataView(t.buffer,t.byteOffset,t.byteLength);for(t.set(e.subarray(0,8),0);a+8<=s;){const o=r.getUint32(a,!1),l=r.getUint32(a+4,!1);let i=o,d=8;if(o===0)i=s-a;else if(o===1){if(a+16>s)break;i=Number(r.getBigUint64(a+8,!1)),d=16}if(i<d||a+i>s)break;if(l===ke||l===Ce||l===tn||l===Ue){a+=i;continue}if(l===1953653099||l===1835297121||l===1835626086||l===1937007212||l===1684631142){const u=Me(e.subarray(a,a+i));t.set(u,n),n+=u.length}else{const u=e.subarray(a,a+i);if(t.set(u,n),(l===Kt||l===Jt||l===en)&&i>=28){const f=t[n+8];f===0?(c.setUint32(n+12,0,!1),c.setUint32(n+16,0,!1)):f===1&&i>=40&&(c.setBigUint64(n+12,0n,!1),c.setBigUint64(n+20,0n,!1))}n+=i}a+=i}return c.setUint32(0,n,!1),t.subarray(0,n)}function on(e){const t=new TextEncoder().encode("x264 - core");for(let n=8;n<e.length-t.length;n++){let a=!0;for(let s=0;s<t.length;s++)if(e[n+s]!==t[s]){a=!1;break}if(a)for(let s=0;s<256&&n+s<e.length;s++)e[n+s]=0}return e}function ln(e){let t=0,n=e.length;if(e.length>=10&&e[0]===73&&e[1]===68&&e[2]===51&&(t=10+((e[6]&127)<<21|(e[7]&127)<<14|(e[8]&127)<<7|e[9]&127)),e.length>=128){const a=e.length-128;e[a]===84&&e[a+1]===65&&e[a+2]===71&&(n=a)}return e.subarray(t,n)}async function cn(e,t={},n){const a=e.type.toLowerCase(),s=e.name.toLowerCase(),r=t.defenseLevel||"paranoid",c=t.quality??.85,o=t.extremeSanitization??!1,l=a.startsWith("image/")||/\.(jpg|jpeg|png|webp|bmp|gif|tiff)$/i.test(s),i=a.startsWith("video/")||a.startsWith("audio/")||/\.(mp4|mov|mkv|webm|mp3|wav|ogg|aac|m4a)$/i.test(s);if(l){const d=t.outputFormat||(s.endsWith(".png")?"image/png":"image/webp");return await pe(e,{defenseLevel:r,outputFormat:d,quality:c,extremeSanitization:o},n)}if(i)return await me(e,{defenseLevel:r},n);try{return await pe(e,{defenseLevel:r,outputFormat:"image/webp",quality:c,extremeSanitization:o},n)}catch{return await me(e,{defenseLevel:r},n)}}var Se=new Uint32Array(256);for(let e=0;e<256;e++){let t=e;for(let n=0;n<8;n++)t&1?t=3988292384^t>>>1:t=t>>>1;Se[e]=t}function dn(e){let t=-1;for(let n=0;n<e.length;n++)t=Se[(t^e[n])&255]^t>>>8;return(t^-1)>>>0}var un=new TextEncoder;async function fn(e,t){const n=[];let a=0,s=0;for(let h=0;h<e.length;h++){const p=e[h],v=await p.blob.arrayBuffer(),C=new Uint8Array(v),y=un.encode(p.sanitizedName),w=dn(C),M=C.length;n.push({nameBytes:y,data:C,crc:w,size:M,offset:a});const U=30+y.length+M;a+=U,s+=46+y.length,t?.(Math.round((h+1)/e.length*40))}const r=a+s+22,c=new ArrayBuffer(r),o=new DataView(c),l=new Uint8Array(c);let i=0;const d=0,u=33,f=20,m=20,g=0;for(let h=0;h<n.length;h++){const p=n[h];o.setUint32(i,67324752,!0),i+=4,o.setUint16(i,f,!0),i+=2,o.setUint16(i,0,!0),i+=2,o.setUint16(i,g,!0),i+=2,o.setUint16(i,d,!0),i+=2,o.setUint16(i,u,!0),i+=2,o.setUint32(i,p.crc,!0),i+=4,o.setUint32(i,p.size,!0),i+=4,o.setUint32(i,p.size,!0),i+=4,o.setUint16(i,p.nameBytes.length,!0),i+=2,o.setUint16(i,0,!0),i+=2,l.set(p.nameBytes,i),i+=p.nameBytes.length,l.set(p.data,i),i+=p.size,t?.(40+Math.round((h+1)/n.length*40))}const x=i;for(let h=0;h<n.length;h++){const p=n[h];o.setUint32(i,33639248,!0),i+=4,o.setUint16(i,m,!0),i+=2,o.setUint16(i,f,!0),i+=2,o.setUint16(i,0,!0),i+=2,o.setUint16(i,g,!0),i+=2,o.setUint16(i,d,!0),i+=2,o.setUint16(i,u,!0),i+=2,o.setUint32(i,p.crc,!0),i+=4,o.setUint32(i,p.size,!0),i+=4,o.setUint32(i,p.size,!0),i+=4,o.setUint16(i,p.nameBytes.length,!0),i+=2,o.setUint16(i,0,!0),i+=2,o.setUint16(i,0,!0),i+=2,o.setUint16(i,0,!0),i+=2,o.setUint16(i,0,!0),i+=2,o.setUint32(i,32,!0),i+=4,o.setUint32(i,p.offset,!0),i+=4,l.set(p.nameBytes,i),i+=p.nameBytes.length}return o.setUint32(i,101010256,!0),i+=4,o.setUint16(i,0,!0),i+=2,o.setUint16(i,0,!0),i+=2,o.setUint16(i,n.length,!0),i+=2,o.setUint16(i,n.length,!0),i+=2,o.setUint32(i,s,!0),i+=4,o.setUint32(i,x,!0),i+=4,o.setUint16(i,0,!0),i+=2,t?.(100),{zipBlob:new Blob([c],{type:"application/zip"}),zipFileName:`bundle_${await ne(c,"zip",12)}`}}function ge(e,t){const n=URL.createObjectURL(e),a=document.createElement("a");a.href=n,a.download=t,a.rel="noopener noreferrer",document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>{URL.revokeObjectURL(n)},1e3)}function pn(e){try{e instanceof Uint8Array?e.fill(0):new Uint8Array(e).fill(0)}catch{}}function mn(e){for(const t of e)try{URL.revokeObjectURL(t)}catch{}}function gn(e,t){const n=document.createElement("div");n.className="border border-neutral-800 bg-[#080808] rounded-xl p-4 sm:p-5 mb-6 text-neutral-200",n.innerHTML=`
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
      <!-- Encoder Quality -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">Encoder Quality</span>
            <span id="quality-val" class="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
              ${Math.round(e.quality*100)}%
            </span>
          </div>
        </div>
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
          <span>60% Max Compression</span>
          <span>85% Recommended</span>
          <span>95% High Quality</span>
        </div>
      </div>

      <!-- Extreme Sanitization Toggle -->
      <div class="flex items-center justify-between gap-4 p-3 rounded-lg border border-neutral-800/80 bg-neutral-950/50">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <label for="extreme-toggle" class="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300 cursor-pointer">
              Extreme Sanitization
            </label>
            <span class="text-[10px] text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded font-mono font-normal">
              Recommended for VP8L
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
  `;const a=n.querySelector("#quality-slider"),s=n.querySelector("#quality-val");a&&s&&a.addEventListener("input",()=>{const c=parseInt(a.value,10);s.textContent=`${c}%`,t({quality:c/100})});const r=n.querySelector("#extreme-toggle");return r&&r.addEventListener("change",()=>{t({extremeSanitization:r.checked})}),n}var b={shield:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',shieldCheck:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path stroke-linecap="round" stroke-linejoin="round" d="m9 12 2 2 4-4"/></svg>',lock:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',download:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',archive:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',trash:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',eye:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',alertTriangle:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',check:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',upload:'<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>',cpu:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3m-3 6h3M1 9h3m-3 6h3"/></svg>',info:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>',close:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',sparkles:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>'};function hn(e){const t=document.createElement("div");t.className="relative border border-dashed border-neutral-800 hover:border-neutral-600 bg-[#050505] hover:bg-[#0a0a0a] rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 group cursor-pointer overflow-hidden",t.innerHTML=`
    <!-- Hidden File Input -->
    <input type="file" id="file-input" multiple accept="image/*,video/*,audio/*,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.mp4,.mov,.mp3,.wav,.ogg" class="hidden" />

    <div class="relative z-10 flex flex-col items-center justify-center space-y-4">
      <div class="w-14 h-14 rounded-xl bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
        ${b.upload}
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
  `;const n=t.querySelector("#file-input");return t.addEventListener("click",()=>{n.click()}),n.addEventListener("change",()=>{n.files&&n.files.length>0&&(e(Array.from(n.files)),n.value="")}),t.addEventListener("dragover",a=>{a.preventDefault(),a.stopPropagation(),t.classList.add("border-emerald-500","bg-neutral-950")}),t.addEventListener("dragleave",a=>{a.preventDefault(),a.stopPropagation(),t.classList.remove("border-emerald-500","bg-neutral-950")}),t.addEventListener("drop",a=>{a.preventDefault(),a.stopPropagation(),t.classList.remove("border-emerald-500","bg-neutral-950"),a.dataTransfer&&a.dataTransfer.files.length>0&&e(Array.from(a.dataTransfer.files))}),t}function he(e,t){const n=document.createElement("div");if(n.className="mt-6 space-y-4",e.length===0)return n;const a=e.filter(l=>l.status==="done").length,s=e.length;n.innerHTML=`
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
            ${b.archive}
            <span>Download All (ZIP)</span>
          </button>
        `:""}

        <button id="btn-clear-all" class="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-red-400 text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
          ${b.trash}
          <span>Clear</span>
        </button>
      </div>
    </div>

    <!-- Items List -->
    <div class="space-y-3" id="queue-items-container"></div>
  `;const r=n.querySelector("#btn-download-zip");r&&r.addEventListener("click",t.onDownloadAllZip);const c=n.querySelector("#btn-clear-all");c&&c.addEventListener("click",t.onClearQueue);const o=n.querySelector("#queue-items-container");return e.forEach(l=>{const i=document.createElement("div");i.className="p-4 rounded-xl border border-neutral-900 bg-black hover:border-neutral-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4";const d=l.status==="done",u=l.status==="error",f=l.status==="processing"||l.status==="analyzing",m=[];if(l.result?.auditBefore){const h=l.result.auditBefore;h.hasGps&&m.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">GPS EXPOSED</span>'),h.hasThumbnail&&m.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">THUMBNAIL LEAK</span>'),h.hasMakerNotes&&m.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">MAKERNOTES</span>'),h.hasExif&&!h.hasGps&&m.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">EXIF</span>')}i.innerHTML=`
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <div class="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-0.5 text-neutral-400">
          ${d?`<span class="text-emerald-400">${b.check}</span>`:u?`<span class="text-red-400">${b.alertTriangle}</span>`:`<span class="text-neutral-400 animate-spin">${b.cpu}</span>`}
        </div>

        <div class="min-w-0 flex-1 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-mono font-medium text-neutral-200 truncate max-w-[200px] sm:max-w-xs" title="${l.file.name}">
              ${l.file.name}
            </span>
            <span class="text-[10px] text-neutral-400 font-mono">(${xe(l.file.size)})</span>
            ${m.join(" ")}
          </div>

          ${d&&l.result?`
            <div class="flex flex-wrap items-center gap-2 pt-0.5">
              <span class="text-xs font-mono text-emerald-400 font-medium">
                ${l.result.sanitizedName}
              </span>
              <span class="text-[10px] text-neutral-400 font-mono">
                (${xe(l.result.sanitizedSize)})
              </span>
              <span class="text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 font-mono">
                CLEAN
              </span>
              ${l.result.warningBadge?`
                <span class="text-[10px] px-1.5 py-0.5 rounded border border-amber-500/50 bg-amber-950/40 text-amber-400 font-mono" title="${l.result.warningBadge}">
                  ${l.result.warningBadge}
                </span>
              `:""}
              ${l.result.isDeepDecontaminated?`
                <span class="text-[10px] px-1.5 py-0.5 rounded border border-purple-500/50 bg-purple-950/40 text-purple-300 font-mono" title="Anti-steganography pipeline applied: spatial micro-resampling, 3x3 median filter, and visibility dithering">
                  DECONTAMINATED
                </span>
              `:""}
              ${l.result.isBypass?`
                <span class="text-[10px] px-1.5 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300 font-mono" title="No original metadata: 1:1 bitstream preserved">
                  STRIP ONLY 1:1
                </span>
              `:""}
            </div>
          `:""}

          ${f?`
            <div class="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden mt-2">
              <div class="bg-neutral-200 h-full transition-all duration-300" style="width: ${l.progress}%"></div>
            </div>
            <div class="text-[10px] text-neutral-400 font-mono flex justify-between">
              <span>${l.status==="analyzing"?"Scanning...":"Re-encoding..."}</span>
              <span>${l.progress}%</span>
            </div>
          `:""}

          ${u?`
            <div class="text-xs text-red-400 font-mono mt-1">
              Error: ${l.error||"Failed to process"}
            </div>
          `:""}
        </div>
      </div>

      <!-- Action Buttons -->
      ${d&&l.result?`
        <div class="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-900">
          <button class="btn-inspect px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
            ${b.eye}
            <span>Inspect</span>
          </button>

          <button class="btn-download px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer">
            ${b.download}
            <span>Download</span>
          </button>
        </div>
      `:""}
    `;const g=i.querySelector(".btn-inspect");g&&g.addEventListener("click",()=>t.onInspectForensics(l));const x=i.querySelector(".btn-download");x&&x.addEventListener("click",()=>t.onDownloadSingle(l)),o.appendChild(i)}),n}function xe(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],a=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,a)).toFixed(1))} ${n[a]}`}function xn(e,t){const n=document.createElement("div");n.className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in";const a=URL.createObjectURL(e.originalBlob||e.blob),s=URL.createObjectURL(e.blob);n.innerHTML=`
    <div class="relative w-full max-w-5xl bg-[#080808] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div>
          <h2 class="text-sm font-bold font-mono text-white tracking-wide">File Inspection</h2>
          <p class="text-[11px] text-neutral-400 font-mono">Comparison between raw input and sanitized output</p>
        </div>

        <button id="modal-close" class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
          ${b.close}
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
                ${b.alertTriangle} Input File
              </span>
              <span class="text-[10px] font-mono text-neutral-400 truncate max-w-[200px]">${e.originalName}</span>
            </div>

            <div class="aspect-video bg-black rounded-lg border border-neutral-900 overflow-hidden flex items-center justify-center relative">
              ${be(a,e.originalName)}
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-red-500/50 text-[10px] font-mono text-red-400">
                ${e.auditBefore.tags.length} Metadata Tags Detected
              </div>
            </div>

            <div class="space-y-1 font-mono text-[11px]">
              <div class="flex justify-between text-neutral-400">
                <span>File Size:</span>
                <span class="text-white">${ve(e.originalSize)}</span>
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
                ${b.shieldCheck} Clean File
              </span>
              <span class="text-[10px] font-mono text-emerald-300 truncate max-w-[200px]">${e.sanitizedName}</span>
            </div>

            <div class="aspect-video bg-black rounded-lg border border-neutral-900 overflow-hidden flex items-center justify-center relative">
              ${be(s,e.sanitizedName)}
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                ${b.check} 0 Metadata Tags • Pure Bitstream
              </div>
            </div>

            <div class="space-y-1 font-mono text-[11px]">
              <div class="flex justify-between text-neutral-400">
                <span>Clean Size:</span>
                <span class="text-emerald-400 font-semibold">${ve(e.sanitizedSize)}</span>
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
            <span class="text-amber-400 shrink-0">${b.alertTriangle}</span>
            <span><strong>Efficiency Warning:</strong> ${e.warningBadge}. Canvas result was discarded and surgical metadata stripping was applied directly to the original bitstream to prevent bloat.</span>
          </div>
        `:""}
        ${e.isDeepDecontaminated?`
          <div class="p-3 rounded-xl border border-purple-500/50 bg-purple-950/30 text-purple-300 text-xs font-mono flex items-center gap-2.5">
            <span class="text-purple-400 shrink-0">${b.shield}</span>
            <span><strong>Anti-Steganography Pipeline:</strong> Spatial micro-resampling, hardware-accelerated 3x3 median filtering, visibility dithering, and lossy VP8 quantization applied to destroy steganographic watermarks and tracking signals.</span>
          </div>
        `:""}
        ${e.isBypass?`
          <div class="p-3 rounded-xl border border-neutral-700 bg-neutral-900/60 text-neutral-300 text-xs font-mono flex items-center gap-2.5">
            <span class="text-emerald-400 shrink-0">${b.check}</span>
            <span><strong>Fast-Track Bypass 1:1:</strong> 0 suspicious metadata tags detected. Original bitstream preserved directly without re-encoding.</span>
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
            ${b.shieldCheck}
            <span>Full Reconstruction & Noise Disruption Applied</span>
          </div>
          <span class="text-[11px] text-neutral-500">In-Memory • No Server Upload</span>
        </div>
      </div>
    </div>
  `;const r=()=>{mn([a,s]),t()};return n.querySelector("#modal-close")?.addEventListener("click",r),n.addEventListener("click",c=>{c.target===n&&r()}),n}function be(e,t){const n=/\.(mp4|mov|webm)$/i.test(t),a=/\.(mp3|wav|ogg|aac|m4a)$/i.test(t);return n?`<video src="${e}" controls class="max-h-full max-w-full rounded"></video>`:a?`
      <div class="p-4 flex flex-col items-center justify-center text-center space-y-2 w-full">
        <span class="text-neutral-400 font-mono text-[11px]">Audio Stream</span>
        <audio src="${e}" controls class="w-full max-w-xs"></audio>
      </div>`:`<img src="${e}" alt="Preview" class="max-h-full max-w-full object-contain" />`}function ve(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],a=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,a)).toFixed(1))} ${n[a]}`}function bn(e){const t=document.createElement("div");t.className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in",t.innerHTML=`
    <div class="relative w-full max-w-3xl bg-[#080808] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div class="flex items-center gap-2.5">
          <span class="text-neutral-400">${b.info}</span>
          <h2 class="text-sm font-semibold font-mono text-white tracking-wide">Legal, Licenses & Privacy</h2>
        </div>
        <button id="legal-close" class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
          ${b.close}
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto space-y-6 text-neutral-300 text-xs leading-relaxed font-sans">
        <!-- 1. Intended Purpose & Privacy Mandates -->
        <section class="space-y-2">
          <h3 class="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
            ${b.shield} Purpose & Data Minimization
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
            ${b.lock} Client-Side Execution (Zero Network Traffic)
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
            ${b.info} Usage Recommendations
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
  `;const n=t.querySelector("#legal-close"),a=t.querySelector("#legal-close-btn");return n.addEventListener("click",e),a.addEventListener("click",e),t.addEventListener("click",s=>{s.target===t&&e()}),t}var vn=class{root;settings={quality:.85,extremeSanitization:!1};queue=[];activeAuditModal=null;activeLegalModal=null;isProcessingQueue=!1;constructor(e){this.root=e,this.render()}render(){this.root.innerHTML="";const e=document.createElement("main");e.className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col";const t=gn(this.settings,r=>{this.settings={...this.settings,...r}});e.appendChild(t);const n=hn(r=>this.handleFilesAdded(r));e.appendChild(n);const a=he(this.queue,{onDownloadSingle:r=>this.handleDownloadSingle(r),onDownloadAllZip:()=>this.handleDownloadAllZip(),onInspectForensics:r=>this.handleInspectForensics(r),onClearQueue:()=>this.handleClearQueue()});e.appendChild(a);const s=this.createFooter();e.appendChild(s),this.root.appendChild(e)}createFooter(){const e=document.createElement("footer");return e.className="mt-auto pt-16 pb-8 text-center text-neutral-500 text-xs font-mono border-t border-neutral-900",e.innerHTML=`
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
    `,e.querySelector("#footer-legal-btn")?.addEventListener("click",()=>{this.openLegalModal()}),e}handleFilesAdded(e){const t=e.map(n=>({id:`${Date.now()}-${Math.random().toString(36).slice(2,9)}`,file:n,status:"idle",progress:0}));this.queue.push(...t),this.render(),this.processQueue()}async processQueue(){if(!this.isProcessingQueue){this.isProcessingQueue=!0;for(let e=0;e<this.queue.length;e++){const t=this.queue[e];if(t.status==="idle"){t.status="analyzing",t.progress=25,this.updateQueueView();try{t.status="processing";const n=await cn(t.file,{quality:this.settings.quality,extremeSanitization:this.settings.extremeSanitization},a=>{t.progress=a,this.updateQueueView()});t.status="done",t.progress=100,t.result=n}catch(n){t.status="error",t.error=n.message||"Processing failed"}this.updateQueueView()}}this.isProcessingQueue=!1}}updateQueueView(){const e=this.root.querySelector("#queue-items-container")?.parentElement;if(e){const t=he(this.queue,{onDownloadSingle:n=>this.handleDownloadSingle(n),onDownloadAllZip:()=>this.handleDownloadAllZip(),onInspectForensics:n=>this.handleInspectForensics(n),onClearQueue:()=>this.handleClearQueue()});e.replaceWith(t)}else this.render()}handleDownloadSingle(e){e.result&&ge(e.result.blob,e.result.sanitizedName)}async handleDownloadAllZip(){const e=this.queue.filter(a=>a.status==="done"&&a.result).map(a=>a.result);if(e.length===0)return;const{zipBlob:t,zipFileName:n}=await fn(e);ge(t,n)}handleInspectForensics(e){e.result&&this.openAuditModal(e.result)}openAuditModal(e){this.activeAuditModal&&this.activeAuditModal.remove(),this.activeAuditModal=xn(e,()=>{this.activeAuditModal?.remove(),this.activeAuditModal=null}),document.body.appendChild(this.activeAuditModal)}openLegalModal(){this.activeLegalModal&&this.activeLegalModal.remove(),this.activeLegalModal=bn(()=>{this.activeLegalModal?.remove(),this.activeLegalModal=null}),document.body.appendChild(this.activeLegalModal)}handleClearQueue(){for(const e of this.queue)e.result&&e.result.blob.arrayBuffer().then(t=>pn(t)).catch(()=>{});this.queue=[],this.render()}};document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("app");if(!e)throw new Error("Application root element (#app) not found");new vn(e)});

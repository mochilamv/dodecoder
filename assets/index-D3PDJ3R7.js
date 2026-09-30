(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))r(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&r(l)}).observe(document,{childList:!0,subtree:!0});function n(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function r(o){if(o.ep)return;o.ep=!0;const a=n(o);fetch(o.href,a)}})();var We=1229472850,Qe=1347179589,Ze=1229209940,Ye=1229278788,Ke=1700284774,Je=1950701684,et=2052348020,tt=1767135348,nt=1950960965,rt=1883789683,at=1766015824,st=1665684045,ot=1732332865,it=1934772034,lt=1448097824,ct=1448097868,dt=1448097880,ut=1095649613,ft=1095650630,pt=1163413830,mt=1481461792,gt=1229144912,ht=1095520328,Se=1969517665,Me=1835365473,Pe=1768715124,Ae=1970628964;function xt(e){const t=new Uint8Array(e),n=[];if(t.length<4)return n;const r=new DataView(e);return t[0]===255&&t[1]===216?bt(t):r.getUint32(0,!1)===2303741511?vt(t,r):r.getUint32(0,!1)===1380533830&&t.length>=12&&r.getUint32(8,!1)===1464156752?wt(t,r):t.length>12&&r.getUint32(4,!1)===1718909296?yt(t,r):n}function bt(e){const t=[];t.push({offset:0,marker:"0xFFD8",name:"SOI (Start of Image)",isSanitizedSafe:!0,description:"Mandatory standard JPEG boundary marker"});let n=2;const r=e.length;for(;n<r-1;){if(e[n]!==255){n++;continue}const o=e[n+1];if(o===255||o===0){n++;continue}const a="0xFF"+o.toString(16).toUpperCase().padStart(2,"0");if(o===217){t.push({offset:n,marker:a,name:"EOI (End of Image)",isSanitizedSafe:!0,description:"End of image data stream"});break}if(o===218){for(t.push({offset:n,marker:a,name:"SOS (Start of Scan)",isSanitizedSafe:!0,description:"Compressed image pixel bitstream follows"}),n+=2;n<r-1&&!(e[n]===255&&e[n+1]!==0&&e[n+1]<=217);)n++;continue}if(n+3>=r)break;const l=e[n+2]<<8|e[n+3];let i=`Segment (${a})`,c=!1,s="";switch(o){case 224:i="APP0 (JFIF Header)",c=!0,s="Basic JPEG container identification";break;case 225:e[n+4]===69&&e[n+5]===120&&e[n+6]===105&&e[n+7]===102?(i="APP1 (EXIF / GPS / IFD1 Thumbnail)",c=!1,s="High risk: contains camera serials, timestamps, GPS, and thumbnail traps"):(i="APP1 (Metadata/XMP)",c=!1,s="Contains edit history, instance IDs, or XMP packets");break;case 226:i="APP2 (ICC Color Profile)",c=!1,s="Contains OS calibration profile or author system identifiers";break;case 237:i="APP13 (Photoshop / IPTC)",c=!1,s="Contains bylines, captions, and Photoshop edit records";break;case 238:i="APP14 (Adobe DCT)",c=!1,s="Adobe color transform marker";break;case 219:i="DQT (Quantization Table)",c=!0,s="Quantization matrix; forensic fingerprint of ISP encoder";break;case 196:i="DHT (Huffman Table)",c=!0,s="Entropy encoding frequency table";break;case 192:case 194:i=`SOF (Start of Frame - ${o===192?"Baseline":"Progressive"})`,c=!0,s="Image dimensions, bit depth, and color components";break;case 254:i="COM (Comment)",c=!1,s="Text comment embedded in image";break;default:o>=227&&o<=239&&(i=`APP${o-224} (Vendor Marker)`,c=!1,s="Proprietary camera or software metadata block")}t.push({offset:n,marker:a,name:i,length:l,isSanitizedSafe:c,description:s}),n+=2+l}return t}function vt(e,t){const n=[];let r=8;const o=t.byteLength;for(;r+8<=o;){const a=t.getUint32(r,!1),l=t.getUint32(r+4,!1);let i=!1,c="Image raster data or standard header",s="UNKNOWN";switch(l){case We:i=!0,s="IHDR",c="Header: Dimensions, depth, color type";break;case Qe:i=!0,s="PLTE",c="Palette table";break;case Ze:i=!0,s="IDAT",c="Compressed image pixel data";break;case Ye:i=!0,s="IEND",c="End of PNG image";break;case Ke:i=!1,s="eXIf",c="Embedded raw EXIF metadata block";break;case Je:i=!1,s="tEXt",c="Textual metadata (Creation time, software, author)";break;case et:i=!1,s="zTXt",c="Compressed textual metadata";break;case tt:i=!1,s="iTXt",c="Internationalized UTF-8 metadata";break;case nt:i=!1,s="tIME",c="Modification timestamp";break;case rt:i=!1,s="pHYs",c="Physical pixel dimensions / DPI";break;case at:i=!1,s="iCCP",c="Embedded ICC Color Profile / Display calibration fingerprint";break;case st:i=!1,s="cHRM",c="Primary chromaticities display calibration";break;case ot:i=!1,s="gAMA",c="Image gamma correction curve";break;case it:i=!0,s="sRGB",c="Standard sRGB color space rendering intent";break;default:s="CHUNK",i=!1}n.push({offset:r,marker:s,name:`Chunk: ${s}`,length:a,isSanitizedSafe:i,description:c}),r+=12+a}return n}function wt(e,t){const n=[];let r=12;const o=t.byteLength;for(;r+8<=o;){const a=t.getUint32(r,!1),l=t.getUint32(r+4,!0);let i=!1,c="Visual raster bitstream",s="WEBP";switch(a){case lt:s="VP8",i=!0;break;case ct:s="VP8L",i=!0;break;case dt:s="VP8X",i=!0;break;case ut:s="ANIM",i=!0;break;case ft:s="ANMF",i=!0;break;case pt:s="EXIF",i=!1,c="Embedded EXIF metadata block";break;case mt:s="XMP",i=!1,c="Embedded XMP metadata block";break;case gt:s="ICCP",i=!1,c="ICC Color Profile";break;case ht:s="ALPH",i=!0,c="Alpha transparency channel for reconstructed pixels";break;default:s="CHUNK",i=!1}n.push({offset:r,marker:s,name:`WebP Chunk: ${s}`,length:l,isSanitizedSafe:i,description:c});const f=l+l%2;r+=8+f}return n}function yt(e,t){const n=[];let r=0;const o=t.byteLength;for(;r+8<=o;){const a=t.getUint32(r,!1),l=t.getUint32(r+4,!1);if(a<8&&a!==0)break;const i=l===Se||l===Me||l===Pe||l===Ae;let c="BOX",s="Video/Audio container structure";switch(l){case Se:c="udta",s="User Data box (stores GPS, camera model, author)";break;case Me:c="meta",s="Metadata box (tags, encoder settings)";break;case Pe:c="ilst",s="Item List atom (QuickTime/iTunes metadata)";break;case Ae:c="uuid",s="Vendor proprietary custom box";break;case 1718909296:c="ftyp";break;case 1836019574:c="moov";break;case 1835295092:c="mdat";break;default:c="atom"}if(n.push({offset:r,marker:c,name:`Box: ${c}`,length:a,isSanitizedSafe:!i,description:s}),a===0||r+a>o)break;r+=a}return n}async function $e(e){const t=e instanceof Uint8Array?e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength):e,n=await crypto.subtle.digest("SHA-256",t);return Array.from(new Uint8Array(n)).map(r=>r.toString(16).padStart(2,"0")).join("")}function Ct(e){const t=e.match(/\.([a-zA-Z0-9]+)$/);return(t?t[1]:e).replace(/[^a-zA-Z0-9]/g,"").toLowerCase()||"webp"}async function Ue(e,t,n=32){return`${(await $e(e)).slice(0,n)}.${Ct(t)}`}var kt=Ue;async function ve(e,t){const n=await e.arrayBuffer(),r=new Uint8Array(n),o=[],a=xt(n);let l=!1,i=!1,c=!1,s=!1;const f=Ut(r);if(f!==-1){l=!0;const b=new DataView(n,f),y=b.getUint16(0)===18761;try{const w=b.getUint32(4,y);if(w<r.length){const h=be(b,w,y,"IFD0");if(o.push(...h.tags),h.gpsPointer){i=!0;const C=be(b,h.gpsPointer,y,"GPS");o.push(...C.tags)}if(h.exifPointer){const C=be(b,h.exifPointer,y,"EXIF");o.push(...C.tags),C.hasMakerNotes&&(s=!0)}if(h.nextIfdOffset&&h.nextIfdOffset!==0){c=!0;const C=be(b,h.nextIfdOffset,y,"IFD1");o.push({category:"IFD1_Thumbnail",name:"IFD1 Embedded Thumbnail",value:`Embedded image preview found at offset ${h.nextIfdOffset}`,severity:"critical",description:"Embedded unedited thumbnail: major forensic leak vector."}),o.push(...C.tags)}}}catch{o.push({category:"EXIF",name:"Malformed EXIF Header",value:"Header parsing failed",severity:"medium"})}}const g=Pt(r);g.length>0&&o.push(...g),a.some(b=>b.name.includes("ICC")||b.marker==="ICCP")&&o.push({category:"ICC",name:"ICC Color Profile",value:"Color management profile present (hardware/software calibration)",severity:"medium",description:"Can identify operating system or monitor calibration profile."});const v=await $e(n),x=l||s?"high":a.length>5?"moderate":"low";return{fileName:t||(e instanceof File?e.name:"unnamed_media"),fileSize:e.size,mimeType:e.type||"application/octet-stream",hasExif:l,hasGps:i,hasThumbnail:c,hasMakerNotes:s,tags:o,markers:a,prnuSusceptibility:x,sha256:v}}function Ut(e){if(e.length>=8&&(e[0]===73&&e[1]===73&&e[2]===42&&e[3]===0||e[0]===77&&e[1]===77&&e[2]===0&&e[3]===42))return 0;for(let t=0;t<Math.min(e.length-10,65536);t++)if(e[t]===255&&e[t+1]===225&&e[t+4]===69&&e[t+5]===120&&e[t+6]===105&&e[t+7]===102&&e[t+8]===0&&e[t+9]===0)return t+10;for(let t=12;t<Math.min(e.length-8,65536);t++)if(e[t]===69&&e[t+1]===88&&e[t+2]===73&&e[t+3]===70)return t+8;return-1}function be(e,t,n,r){const o={tags:[]};if(t+2>=e.byteLength)return o;const a=e.getUint16(t,n);let l=t+2;for(let i=0;i<a&&!(l+12>e.byteLength);i++){const c=e.getUint16(l,n),s=e.getUint16(l+2,n),f=e.getUint32(l+4,n),g=l+8;let v="";if(c===34665&&r==="IFD0")o.exifPointer=e.getUint32(g,n);else if(c===34853&&r==="IFD0")o.gpsPointer=e.getUint32(g,n);else if(c===37500)o.hasMakerNotes=!0,o.tags.push({category:"MakerNotes",name:"Proprietary MakerNotes",value:`${f} bytes of camera-specific binary telemetry`,severity:"critical",description:"Manufacturer proprietary block containing sensor temperatures, lens serials, or face biometric coordinates."});else{const x=St(c,r);x&&(s===2?v=Mt(e,g,f,n):s===3?v=e.getUint16(g,n).toString():s===4?v=e.getUint32(g,n).toString():v=`[${f} items]`,v.trim()&&o.tags.push({category:r==="GPS"?"GPS":r==="IFD1"?"IFD1_Thumbnail":"EXIF",name:x.name,value:v.trim(),severity:x.severity,description:x.description}))}l+=12}return l+4<=e.byteLength&&(o.nextIfdOffset=e.getUint32(l,n)),o}function St(e,t){if(t==="GPS")switch(e){case 1:return{name:"GPS Latitude Ref",severity:"critical",description:"North/South coordinate hemisphere"};case 2:return{name:"GPS Latitude",severity:"critical",description:"Precise GPS latitude coordinates"};case 3:return{name:"GPS Longitude Ref",severity:"critical",description:"East/West coordinate hemisphere"};case 4:return{name:"GPS Longitude",severity:"critical",description:"Precise GPS longitude coordinates"};case 6:return{name:"GPS Altitude",severity:"critical",description:"Elevation above sea level"};case 7:return{name:"GPS TimeStamp",severity:"critical",description:"Atomic satellite UTC timestamp"};case 29:return{name:"GPS DateStamp",severity:"critical",description:"Satellite GPS date"}}switch(e){case 271:return{name:"Camera Manufacturer (Make)",severity:"high",description:"Brand of camera or smartphone"};case 272:return{name:"Camera Model",severity:"critical",description:"Exact phone or camera hardware model"};case 305:return{name:"Software / OS Version",severity:"high",description:"Firmware or operating system build"};case 306:return{name:"Modify Date / Time",severity:"high",description:"Modification timestamp"};case 36867:return{name:"Date / Time Original",severity:"critical",description:"Exact moment the shutter was pressed"};case 36868:return{name:"Date / Time Digitized",severity:"critical",description:"Sensor analog-to-digital timestamp"};case 42033:return{name:"Camera Body Serial Number",severity:"critical",description:"Hardware unique serial number"};case 42036:return{name:"Lens Model",severity:"high",description:"Optical lens specifications"};case 42016:return{name:"Image Unique ID",severity:"critical",description:"Unique cryptographic ID generated by ISP"};case 513:return{name:"Thumbnail Offset",severity:"critical",description:"Pointer to raw thumbnail stream"};case 514:return{name:"Thumbnail Length",severity:"critical",description:"Byte length of embedded thumbnail"};default:return null}}function Mt(e,t,n,r){let o=t;if(n>4&&(o=e.getUint32(t,r)),o+n>e.byteLength)return"";let a="";for(let l=0;l<n;l++){const i=e.getUint8(o+l);if(i===0)break;a+=String.fromCharCode(i)}return a}function Pt(e){const t=[],n=Math.min(e.length-20,2e5),r="<?xpacket begin";for(let o=0;o<n;o++)if(e[o]===60&&e[o+1]===63&&String.fromCharCode(...e.slice(o,o+15))===r){t.push({category:"XMP",name:"Adobe XMP Metadata Packet",value:"XMP Packet detected",severity:"critical",description:"Contains edit history, Photoshop/Lightroom instance IDs, and original document UUIDs."});break}return t}function At(e,t=!1){if(e==="standard")return{theta:0,sx:1,sy:1,noiseIntensity:0};const n=new Uint32Array(3);crypto.getRandomValues(n);const r=.1+n[0]/4294967295*.2,o=(n[0]%2===0?1:-1)*(r*Math.PI)/180,a=.995+n[1]/4294967295*.004;let l=.995+n[2]/4294967295*.004;return a-l>-5e-4&&a-l<5e-4&&(l=a<.997?a+6e-4:a-6e-4),{theta:o,sx:a,sy:l,noiseIntensity:t?0:2}}function J(e){const t=e<0?-e:e;return t<1?t*t*(1.5*t-2.5)+1:t<2?t*t*(-.5*t+2.5)-4*t+2:0}function It(e,t,n,r=!0,o=!1){const a=e.width,l=e.height;if(n==="standard"){t.width=a,t.height=l,t.getContext("2d",{willReadFrequently:!0,alpha:r}).drawImage(e,0,0);return}const i=At(n,o),c=new OffscreenCanvas(a,l).getContext("2d",{willReadFrequently:!0});c.drawImage(e,0,0);const s=c.getImageData(0,0,a,l),f=new Uint32Array(s.data.buffer),g=3,v=a-6,x=l-6;t.width=v,t.height=x;const b=t.getContext("2d",{willReadFrequently:!0,alpha:r}),y=b.createImageData(v,x),w=new Uint32Array(y.data.buffer),h=Math.cos(i.theta),C=Math.sin(i.theta),F=i.sx*h,U=-i.sy*C,S=i.sx*C,E=i.sy*h,L=F*E-U*S,N=E/L,$=-U/L,k=-S/L,T=F/L,H=a*.5,q=l*.5,W=new Uint32Array(1);crypto.getRandomValues(W);let z=W[0]||305419896;const G=l-1,X=a-1;let te=0;const ne=i.noiseIntensity>0;for(let M=0;M<x;M++){const A=M+g-q,I=-H+g;let P=I*N+A*$+H,re=I*k+A*T+q;for(let le=0;le<v;le++){const j=Math.floor(P),V=Math.floor(re),d=P-j,u=re-V,Q=J(d+1),Z=J(d),Y=J(d-1),K=J(d-2),ae=J(u+1),se=J(u),oe=J(u-1),ie=J(u-2),ce=(V-1<0?0:V-1>G?G:V-1)*a,de=(V<0?0:V>G?G:V)*a,ue=(V+1<0?0:V+1>G?G:V+1)*a,fe=(V+2<0?0:V+2>G?G:V+2)*a,pe=j-1<0?0:j-1>X?X:j-1,me=j<0?0:j>X?X:j,ge=j+1<0?0:j+1>X?X:j+1,he=j+2<0?0:j+2>X?X:j+2;let R=0,O=0,_=0,D=0;if(ae!==0){if(Q!==0){const p=f[ce+pe],m=Q*ae;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}if(Z!==0){const p=f[ce+me],m=Z*ae;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}if(Y!==0){const p=f[ce+ge],m=Y*ae;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}if(K!==0){const p=f[ce+he],m=K*ae;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}}if(se!==0){if(Q!==0){const p=f[de+pe],m=Q*se;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}if(Z!==0){const p=f[de+me],m=Z*se;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}if(Y!==0){const p=f[de+ge],m=Y*se;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}if(K!==0){const p=f[de+he],m=K*se;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}}if(oe!==0){if(Q!==0){const p=f[ue+pe],m=Q*oe;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}if(Z!==0){const p=f[ue+me],m=Z*oe;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}if(Y!==0){const p=f[ue+ge],m=Y*oe;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}if(K!==0){const p=f[ue+he],m=K*oe;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}}if(ie!==0){if(Q!==0){const p=f[fe+pe],m=Q*ie;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}if(Z!==0){const p=f[fe+me],m=Z*ie;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}if(Y!==0){const p=f[fe+ge],m=Y*ie;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}if(K!==0){const p=f[fe+he],m=K*ie;R+=(p&255)*m,O+=(p>>8&255)*m,_+=(p>>16&255)*m,D+=(p>>>24&255)*m}}let xe=0;ne&&(z^=z<<13,z^=z>>>17,z^=z<<5,xe=(z&255)%5-2);const we=R+xe,ye=O+xe,Ce=_+xe,Ge=we<0?0:we>=255.5?255:we+.5|0,Xe=ye<0?0:ye>=255.5?255:ye+.5|0,He=Ce<0?0:Ce>=255.5?255:Ce+.5|0,qe=r?D<0?0:D>=255.5?255:D+.5|0:255;w[te++]=Ge|Xe<<8|He<<16|qe<<24,P+=N,re+=k}}b.putImageData(y,0,0)}var Et=1766015824,Lt=1665684045,Ft=1732332865,Dt=1700284774,Bt=1950701684,Tt=2052348020,Rt=1767135348,Ot=1950960965,_t=1883789683,$t=1229144912,zt=1163413830,Nt=1481461792;function jt(e,t){return e.length<12?e:t==="image/png"||e[0]===137&&e[1]===80&&e[2]===78&&e[3]===71?Vt(e):t==="image/jpeg"||e[0]===255&&e[1]===216?Gt(e):t==="image/webp"||e[0]===82&&e[1]===73&&e[2]===70&&e[3]===70?Yt(e):e}function Vt(e){if(e.length<8)return e;const t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(t.getUint32(0,!1)!==2303741511||t.getUint32(4,!1)!==218765834)return e;const n=new Uint8Array(e.length);n.set(e.subarray(0,8),0);let r=8,o=8;const a=e.length;for(;r+8<=a;){const l=t.getUint32(r,!1),i=t.getUint32(r+4,!1),c=12+l;if(r+c>a)break;i===Et||i===Lt||i===Ft||i===Dt||i===Bt||i===Tt||i===Rt||i===Ot||i===_t||(n.set(e.subarray(r,r+c),o),o+=c),r+=c}return n.subarray(0,o)}function Gt(e){if(e.length<4||e[0]!==255||e[1]!==216)return e;const t=new Uint8Array(e.length);t[0]=255,t[1]=216;let n=2,r=2;const o=e.length;for(;r<o-1;){if(e[r]!==255){t[n++]=e[r++];continue}const a=e[r+1];if(a===255||a===0){t[n++]=e[r++];continue}if(a===217){t[n++]=255,t[n++]=217;break}if(a===218){const c=e.subarray(r);t.set(c,n),n+=c.length;break}if(r+3>=o)break;const l=2+(e[r+2]<<8|e[r+3]);if(r+l>o)break;let i=!1;a===226?r+15<=o&&e[r+4]===73&&e[r+5]===67&&e[r+6]===67&&e[r+7]===95&&e[r+8]===80&&e[r+9]===82&&e[r+10]===79&&e[r+11]===70&&e[r+12]===73&&e[r+13]===76&&e[r+14]===69&&e[r+15]===0&&(i=!0):(a===225||a===237||a===238||a===254||a>=227&&a<=239)&&(i=!0),i||(t.set(e.subarray(r,r+l),n),n+=l),r+=l}return t.subarray(0,n)}var Xt=1448097880,Ht=1095520328,qt=1448097824,Wt=1448097868,Qt=1095649613,Zt=1095650630;function Yt(e){if(e.length<12)return e;const t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(t.getUint32(0,!1)!==1380533830||t.getUint32(8,!1)!==1464156752)return e;let n=!1,r=!1,o=null;const a=[];let l=12;const i=e.length;for(;l+8<=i;){const g=t.getUint32(l,!1),v=t.getUint32(l+4,!0),x=8+(v+v%2);if(l+x>i)break;g===Ht?(n=!0,a.push({offset:l,totalLen:x,type:g})):g===Qt||g===Zt?(r=!0,a.push({offset:l,totalLen:x,type:g})):g===Xt?o={offset:l,totalLen:x}:g===qt||g===Wt?a.push({offset:l,totalLen:x,type:g}):g===$t||g===zt||g===Nt||a.push({offset:l,totalLen:x,type:g}),l+=x}const c=new Uint8Array(e.length);c.set(e.subarray(0,12),0);const s=new DataView(c.buffer,c.byteOffset,c.byteLength);let f=12;if((n||r)&&o){c.set(e.subarray(o.offset,o.offset+o.totalLen),f);let g=0;n&&(g|=16),r&&(g|=2),c[f+8]=g,f+=o.totalLen}for(const g of a)c.set(e.subarray(g.offset,g.offset+g.totalLen),f),f+=g.totalLen;return s.setUint32(4,f-8,!0),c.subarray(0,f)}function ee(e){const t=e<0?-e:e;return t<1?t*t*(1.5*t-2.5)+1:t<2?t*t*(-.5*t+2.5)-4*t+2:0}function Kt(e,t,n,r,o,a,l=!0){const i=t/o,c=n/a,s=n-1,f=t-1;let g=0;for(let v=0;v<a;v++){const x=(v+.5)*c-.5,b=Math.floor(x),y=x-b,w=ee(y+1),h=ee(y),C=ee(y-1),F=ee(y-2),U=(b-1<0?0:b-1>=n?s:b-1)*t,S=(b<0?0:b>=n?s:b)*t,E=(b+1<0?0:b+1>=n?s:b+1)*t,L=(b+2<0?0:b+2>=n?s:b+2)*t;for(let N=0;N<o;N++){const $=(N+.5)*i-.5,k=Math.floor($),T=$-k,H=ee(T+1),q=ee(T),W=ee(T-1),z=ee(T-2),G=k-1<0?0:k-1>=t?f:k-1,X=k<0?0:k>=t?f:k,te=k+1<0?0:k+1>=t?f:k+1,ne=k+2<0?0:k+2>=t?f:k+2;let M=0,A=0,I=0,P=0;if(w!==0){if(H!==0){const d=e[U+G],u=H*w;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}if(q!==0){const d=e[U+X],u=q*w;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}if(W!==0){const d=e[U+te],u=W*w;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}if(z!==0){const d=e[U+ne],u=z*w;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}}if(h!==0){if(H!==0){const d=e[S+G],u=H*h;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}if(q!==0){const d=e[S+X],u=q*h;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}if(W!==0){const d=e[S+te],u=W*h;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}if(z!==0){const d=e[S+ne],u=z*h;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}}if(C!==0){if(H!==0){const d=e[E+G],u=H*C;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}if(q!==0){const d=e[E+X],u=q*C;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}if(W!==0){const d=e[E+te],u=W*C;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}if(z!==0){const d=e[E+ne],u=z*C;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}}if(F!==0){if(H!==0){const d=e[L+G],u=H*F;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}if(q!==0){const d=e[L+X],u=q*F;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}if(W!==0){const d=e[L+te],u=W*F;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}if(z!==0){const d=e[L+ne],u=z*F;M+=(d&255)*u,A+=(d>>8&255)*u,I+=(d>>16&255)*u,P+=(d>>>24&255)*u}}const re=M<0?0:M>=255.5?255:M+.5|0,le=A<0?0:A>=255.5?255:A+.5|0,j=I<0?0:I>=255.5?255:I+.5|0,V=l?P<0?0:P>=255.5?255:P+.5|0:255;r[g++]=re|le<<8|j<<16|V<<24}}}function Jt(e,t=!0){const n=e.width,r=e.height;if(n<4||r<4)return;const o=Math.max(2,n*.995+.5|0),a=Math.max(2,r*.995+.5|0);let l;typeof OffscreenCanvas<"u"?l=new OffscreenCanvas(o,a):(l=document.createElement("canvas"),l.width=o,l.height=a);const i=l.getContext("2d",{willReadFrequently:!0});i.drawImage(e,0,0,o,a);const c=i.getImageData(0,0,o,a),s=new Uint32Array(c.data.buffer),f=e.getContext("2d",{willReadFrequently:!0}),g=f.createImageData(n,r);Kt(s,o,a,new Uint32Array(g.data.buffer),n,r,t),f.putImageData(g,0,0)}function ke(e){for(let t=1;t<9;t++){const n=e[t];let r=t-1;for(;r>=0&&e[r]>n;)e[r+1]=e[r],r--;e[r+1]=n}}function Ie(e,t,n){const r=e.length,o=new Uint8ClampedArray(r);o.set(e);const a=new Uint8Array(9),l=new Uint8Array(9),i=new Uint8Array(9),c=t-1,s=n-1;for(let f=0;f<n;f++){const g=f*t;for(let v=0;v<t;v++){let x=0;for(let y=-1;y<=1;y++){const w=(f+y<0?0:f+y>s?s:f+y)*t;for(let h=-1;h<=1;h++){const C=w+(v+h<0?0:v+h>c?c:v+h)<<2;a[x]=e[C],l[x]=e[C+1],i[x]=e[C+2],x++}}ke(a),ke(l),ke(i);const b=g+v<<2;o[b]=a[4],o[b+1]=l[4],o[b+2]=i[4]}}e.set(o)}function en(e){const t=e.width,n=e.height;if(t<3||n<3)return;const r=e.getContext("2d",{willReadFrequently:!0});if(!r)return;let o=null,a=null;try{typeof OffscreenCanvas<"u"?o=new OffscreenCanvas(t,n):(o=document.createElement("canvas"),o.width=t,o.height=n),a=o.getContext("webgl")}catch{a=null}if(!a){const l=r.getImageData(0,0,t,n);Ie(l.data,t,n),r.putImageData(l,0,0);return}try{const l=`
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
    `,c=a.createShader(a.VERTEX_SHADER);a.shaderSource(c,l),a.compileShader(c);const s=a.createShader(a.FRAGMENT_SHADER);a.shaderSource(s,i),a.compileShader(s);const f=a.createProgram();a.attachShader(f,c),a.attachShader(f,s),a.linkProgram(f),a.useProgram(f);const g=a.createBuffer();a.bindBuffer(a.ARRAY_BUFFER,g),a.bufferData(a.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),a.STATIC_DRAW);const v=a.getAttribLocation(f,"a_position");a.enableVertexAttribArray(v),a.vertexAttribPointer(v,2,a.FLOAT,!1,0,0);const x=a.getUniformLocation(f,"u_resolution");a.uniform2f(x,t,n);const b=a.createTexture();a.bindTexture(a.TEXTURE_2D,b),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.NEAREST),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.NEAREST),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,a.RGBA,a.UNSIGNED_BYTE,e),a.viewport(0,0,t,n),a.drawArrays(a.TRIANGLES,0,6),r.drawImage(o,0,0)}catch{const l=r.getImageData(0,0,t,n);Ie(l.data,t,n),r.putImageData(l,0,0)}}function tn(e,t=1597463007){let n=t||305419896;const r=e.length;for(let o=0;o<r;o+=4){n^=n<<13,n^=n>>>17,n^=n<<5;const a=((n&1)===0?1:-1)*((n>>>1&1)+1),l=((n>>>2&1)===0?1:-1)*((n>>>3&1)+1),i=((n>>>4&1)===0?1:-1)*((n>>>5&1)+1);let c=e[o]+a,s=e[o+1]+l,f=e[o+2]+i;e[o]=c<0?0:c>255?255:c,e[o+1]=s<0?0:s>255?255:s,e[o+2]=f<0?0:f>255?255:f}}function ze(e,t,n){for(let r=0;r<n;r+=2){const o=r+1<n,a=r*t,l=(r+1)*t;for(let i=0;i<t;i+=2){const c=i+1<t,s=a+i<<2;let f=1;const g=e[s],v=e[s+1],x=e[s+2],b=.299*g+.587*v+.114*x;let y=-.168736*g-.331264*v+.5*x+128,w=.5*g-.418688*v-.081312*x+128,h=0,C=0,F=0,U=0,S=0,E=0;if(c){U=s+4;const $=e[U],k=e[U+1],T=e[U+2];h=.299*$+.587*k+.114*T,y+=-.168736*$-.331264*k+.5*T+128,w+=.5*$-.418688*k-.081312*T+128,f++}if(o){S=l+i<<2;const $=e[S],k=e[S+1],T=e[S+2];C=.299*$+.587*k+.114*T,y+=-.168736*$-.331264*k+.5*T+128,w+=.5*$-.418688*k-.081312*T+128,f++}if(o&&c){E=S+4;const $=e[E],k=e[E+1],T=e[E+2];F=.299*$+.587*k+.114*T,y+=-.168736*$-.331264*k+.5*T+128,w+=.5*$-.418688*k-.081312*T+128,f++}const L=y/f-128,N=w/f-128;e[s]=b+1.402*N,e[s+1]=b-.344136*L-.714136*N,e[s+2]=b+1.772*L,c&&(e[U]=h+1.402*N,e[U+1]=h-.344136*L-.714136*N,e[U+2]=h+1.772*L),o&&(e[S]=C+1.402*N,e[S+1]=C-.344136*L-.714136*N,e[S+2]=C+1.772*L),o&&c&&(e[E]=F+1.402*N,e[E+1]=F-.344136*L-.714136*N,e[E+2]=F+1.772*L)}}}function nn(e,t=!0){Jt(e,t),en(e);const n=e.getContext("2d",{willReadFrequently:!0});if(n){const r=n.getImageData(0,0,e.width,e.height);ze(r.data,e.width,e.height),tn(r.data),n.putImageData(r,0,0)}}async function rn(e,t,n){n?.(10);const r=e instanceof File?e.name:"unnamed_image",o=e.size,a=await ve(e,r);n?.(25);const l=await createImageBitmap(e);n?.(45);const i="image/webp",c=.6,s=!!t.extremeSanitization,f=!(e.type==="image/jpeg"||/\.(jpe?g|bmp)$/i.test(r));let g;typeof OffscreenCanvas<"u"?g=new OffscreenCanvas(l.width,l.height):(g=document.createElement("canvas"),g.width=l.width,g.height=l.height),g.getContext("2d",{willReadFrequently:!0,alpha:f});const v=t.defenseLevel==="standard"?"hardened":t.defenseLevel;if(It(l,g,v,f,!1),s)nn(g,f);else{const U=g.getContext("2d",{willReadFrequently:!0});if(U){const S=U.getImageData(0,0,g.width,g.height);ze(S.data,g.width,g.height),U.putImageData(S,0,0)}}n?.(70);let x;g instanceof OffscreenCanvas?x=await g.convertToBlob({type:i,quality:c}):x=await new Promise((U,S)=>{g.toBlob(E=>{E?U(E):S(new Error("Failed to encode canvas blob"))},i,c)}),n?.(85),l.close(),g.getContext("2d")?.clearRect(0,0,g.width,g.height);const b=await x.arrayBuffer();let y=jt(new Uint8Array(b),i);const w=new Blob([y],{type:i});n?.(92);const h=await Ue(y,"webp"),C=await ve(w,h);if(C.sha256===a.sha256)throw new Error("Mandatory re-synthesis invariant violated: output SHA-256 must diverge from input");n?.(100);const F={blob:w,originalBlob:e,originalName:r,sanitizedName:h,originalSize:o,sanitizedSize:w.size,format:i,sha256:C.sha256,defenseLevel:t.defenseLevel,auditBefore:a,auditAfter:C,processedAt:Date.now(),isDeepDecontaminated:s,extremeSanitization:t.extremeSanitization};return y=null,F}function Ne(e,t){return e.startsWith("image/")||/\.(jpg|jpeg|png|webp|bmp|gif|tiff|tif|avif|heic|heif|svg)$/i.test(t)}var an=1718773093;function Ee(e){if(e.length<12)return!1;const t=new DataView(e.buffer,e.byteOffset,e.byteLength).getUint32(4,!1);return t===1718909296||t===1836019574}function Le(e,t){return e.startsWith("audio/")||/\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(t)}function Fe(e){const t=new Uint8Array(e.length);return t.set(e),je(t,new DataView(t.buffer,t.byteOffset,t.byteLength),0,t.length),t}function je(e,t,n,r){let o=n;for(;o+8<=r;){const a=t.getUint32(o,!1),l=t.getUint32(o+4,!1);let i=a,c=8;if(a===0)i=r-o;else if(a===1){if(o+16>r)break;i=Number(t.getBigUint64(o+8,!1)),c=16}if(i<c||o+i>r)break;if(l===1969517665||l===1835365473||l===1970628964||l===1768715124){t.setUint32(o+4,an,!1),e.fill(0,o+c,o+i),o+=i;continue}if(l===1836019574||l===1953653099||l===1835297121||l===1835626086||l===1937007212||l===1684631142)je(e,t,o+c,o+i);else if(l===1835295092)sn(e,o+c,o+i);else if((l===1836476516||l===1953196132||l===1835296868)&&i>=c+20){const s=e[o+c];s===0?(t.setUint32(o+c+4,0,!1),t.setUint32(o+c+8,0,!1)):s===1&&i>=c+28&&(t.setBigUint64(o+c+4,0n,!1),t.setBigUint64(o+c+12,0n,!1))}o+=i}}function sn(e,t,n){const r=new TextEncoder().encode("x264 - core");for(let o=t;o<=n-r.length;o++){let a=!0;for(let l=0;l<r.length;l++)if(e[o+l]!==r[l]){a=!1;break}if(a)for(let l=0;l<256&&o+l<n;l++)e[o+l]=0}}function De(e){let t=0,n=e.length;if(e.length>=10&&e[0]===73&&e[1]===68&&e[2]===51&&(t=10+((e[6]&127)<<21|(e[7]&127)<<14|(e[8]&127)<<7|e[9]&127)),e.length>=128){const r=e.length-128;e[r]===84&&e[r+1]===65&&e[r+2]===71&&(n=r)}return e.subarray(t,n)}async function on(e,t,n){if(Ne(t,n))throw new Error(`Image payload rejected from media pipeline: MIME="${t}" name="${n}". Image assets must route exclusively through canvas re-synthesis.`);if(typeof Worker<"u")return new Promise((o,a)=>{try{const l=new Worker(new URL(new URL("media.worker-CuoXEA00.js",import.meta.url).href,""+import.meta.url),{type:"module"});l.onmessage=i=>{const c=new Uint8Array(i.data.buffer);l.terminate(),o(c)},l.onerror=i=>{l.terminate(),a(i)},l.postMessage({buffer:e,mimeType:t,originalName:n},[e])}catch{const l=new Uint8Array(e);o(Ee(l)?Fe(l):Le(t,n)?De(l):l)}});const r=new Uint8Array(e);return Ee(r)?Fe(r):Le(t,n)?De(r):r}async function ln(e,t,n){const r=e instanceof File?e.name:"",o=e.type||"";if(Ne(o,r))throw new Error(`Image payload rejected from media pipeline: MIME="${o}" name="${r}". Image assets must route exclusively through canvas re-synthesis.`);n?.(15);const a=e instanceof File?e.name:"unnamed_media",l=await ve(e,a);n?.(35);let i=await e.arrayBuffer();const c=e.type||"";let s=await on(i,c,a);n?.(75);const f=new Blob([s],{type:c||"video/mp4"}),g=a.split(".").pop()||"mp4",v=await Ue(s,g);n?.(90);const x=await ve(f,v);n?.(100);const b={blob:f,originalBlob:e,originalName:a,sanitizedName:v,originalSize:e.size,sanitizedSize:f.size,format:c,sha256:x.sha256,defenseLevel:t.defenseLevel,auditBefore:l,auditAfter:x,processedAt:Date.now()};return s=null,i=null,b}async function cn(e,t={},n){const r=e.type.toLowerCase(),o=e.name.toLowerCase(),a=t.defenseLevel||"paranoid",l=t.quality??.85,i=t.extremeSanitization??!1,c=r.startsWith("image/")||/\.(jpg|jpeg|png|webp|bmp|gif|tiff)$/i.test(o),s=r.startsWith("video/")||r.startsWith("audio/")||/\.(mp4|mov|mkv|webm|mp3|wav|ogg|aac|m4a)$/i.test(o);if(c)return await rn(e,{defenseLevel:a,outputFormat:"image/webp",quality:l,extremeSanitization:i},n);if(s)return await ln(e,{defenseLevel:a},n);throw new Error(`Unsupported file type: MIME="${r}" name="${o}". Only image (JPEG, PNG, WebP, BMP, TIFF, GIF) and media (MP4, MOV, MKV, WebM, MP3, WAV, OGG, AAC, M4A) formats are accepted.`)}var Ve=new Uint32Array(256);for(let e=0;e<256;e++){let t=e;for(let n=0;n<8;n++)t&1?t=3988292384^t>>>1:t=t>>>1;Ve[e]=t}function dn(e){let t=-1;for(let n=0;n<e.length;n++)t=Ve[(t^e[n])&255]^t>>>8;return(t^-1)>>>0}var un=new TextEncoder;async function fn(e,t){const n=[];let r=0,o=0;for(let w=0;w<e.length;w++){const h=e[w],C=await h.blob.arrayBuffer(),F=new Uint8Array(C),U=un.encode(h.sanitizedName),S=dn(F),E=F.length;n.push({nameBytes:U,data:F,crc:S,size:E,offset:r});const L=30+U.length+E;r+=L,o+=46+U.length,t?.(Math.round((w+1)/e.length*40))}const a=r+o+22,l=new ArrayBuffer(a),i=new DataView(l),c=new Uint8Array(l);let s=0;const f=0,g=33,v=20,x=20,b=0;for(let w=0;w<n.length;w++){const h=n[w];i.setUint32(s,67324752,!0),s+=4,i.setUint16(s,v,!0),s+=2,i.setUint16(s,0,!0),s+=2,i.setUint16(s,b,!0),s+=2,i.setUint16(s,f,!0),s+=2,i.setUint16(s,g,!0),s+=2,i.setUint32(s,h.crc,!0),s+=4,i.setUint32(s,h.size,!0),s+=4,i.setUint32(s,h.size,!0),s+=4,i.setUint16(s,h.nameBytes.length,!0),s+=2,i.setUint16(s,0,!0),s+=2,c.set(h.nameBytes,s),s+=h.nameBytes.length,c.set(h.data,s),s+=h.size,t?.(40+Math.round((w+1)/n.length*40))}const y=s;for(let w=0;w<n.length;w++){const h=n[w];i.setUint32(s,33639248,!0),s+=4,i.setUint16(s,x,!0),s+=2,i.setUint16(s,v,!0),s+=2,i.setUint16(s,0,!0),s+=2,i.setUint16(s,b,!0),s+=2,i.setUint16(s,f,!0),s+=2,i.setUint16(s,g,!0),s+=2,i.setUint32(s,h.crc,!0),s+=4,i.setUint32(s,h.size,!0),s+=4,i.setUint32(s,h.size,!0),s+=4,i.setUint16(s,h.nameBytes.length,!0),s+=2,i.setUint16(s,0,!0),s+=2,i.setUint16(s,0,!0),s+=2,i.setUint16(s,0,!0),s+=2,i.setUint16(s,0,!0),s+=2,i.setUint32(s,32,!0),s+=4,i.setUint32(s,h.offset,!0),s+=4,c.set(h.nameBytes,s),s+=h.nameBytes.length}return i.setUint32(s,101010256,!0),s+=4,i.setUint16(s,0,!0),s+=2,i.setUint16(s,0,!0),s+=2,i.setUint16(s,n.length,!0),s+=2,i.setUint16(s,n.length,!0),s+=2,i.setUint32(s,o,!0),s+=4,i.setUint32(s,y,!0),s+=4,i.setUint16(s,0,!0),s+=2,t?.(100),{zipBlob:new Blob([l],{type:"application/zip"}),zipFileName:`bundle_${await kt(l,"zip",12)}`}}function Be(e,t){const n=URL.createObjectURL(e),r=document.createElement("a");r.href=n,r.download=t,r.rel="noopener noreferrer",document.body.appendChild(r),r.click(),document.body.removeChild(r),setTimeout(()=>{URL.revokeObjectURL(n)},1e3)}function pn(e){try{e instanceof Uint8Array?e.fill(0):new Uint8Array(e).fill(0)}catch{}}function mn(e){for(const t of e)try{URL.revokeObjectURL(t)}catch{}}function gn(e,t){const n=document.createElement("div");n.className="border border-neutral-800 bg-[#080808] rounded-xl p-4 sm:p-5 mb-6 text-neutral-200",n.innerHTML=`
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
  `;const r=n.querySelector("#extreme-toggle");return r&&r.addEventListener("change",()=>{t({extremeSanitization:r.checked})}),n}var B={shield:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',shieldCheck:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path stroke-linecap="round" stroke-linejoin="round" d="m9 12 2 2 4-4"/></svg>',lock:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',download:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',archive:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',trash:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',eye:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',alertTriangle:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',check:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',upload:'<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>',cpu:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3m-3 6h3M1 9h3m-3 6h3"/></svg>',info:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>',close:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',sparkles:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>'};function hn(e){const t=document.createElement("div");t.className="relative border border-dashed border-neutral-800 hover:border-neutral-600 bg-[#050505] hover:bg-[#0a0a0a] rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 group cursor-pointer overflow-hidden",t.innerHTML=`
    <!-- Hidden File Input -->
    <input type="file" id="file-input" multiple accept="image/*,video/*,audio/*,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.mp4,.mov,.mp3,.wav,.ogg" class="hidden" />

    <div class="relative z-10 flex flex-col items-center justify-center space-y-4">
      <div class="w-14 h-14 rounded-xl bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
        ${B.upload}
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
  `;const n=t.querySelector("#file-input");return t.addEventListener("click",()=>{n.click()}),n.addEventListener("change",()=>{n.files&&n.files.length>0&&(e(Array.from(n.files)),n.value="")}),t.addEventListener("dragover",r=>{r.preventDefault(),r.stopPropagation(),t.classList.add("border-emerald-500","bg-neutral-950")}),t.addEventListener("dragleave",r=>{r.preventDefault(),r.stopPropagation(),t.classList.remove("border-emerald-500","bg-neutral-950")}),t.addEventListener("drop",r=>{r.preventDefault(),r.stopPropagation(),t.classList.remove("border-emerald-500","bg-neutral-950"),r.dataTransfer&&r.dataTransfer.files.length>0&&e(Array.from(r.dataTransfer.files))}),t}function Te(e,t){const n=document.createElement("div");if(n.className="mt-6 space-y-4",e.length===0)return n;const r=e.filter(c=>c.status==="done").length,o=e.length;n.innerHTML=`
    <!-- Batch Actions Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#080808] border border-neutral-800">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full ${r===o?"bg-emerald-400":"bg-neutral-400 animate-pulse"}"></span>
        <span class="text-xs font-mono font-medium text-neutral-300">
          Queue: ${r} of ${o} processed
        </span>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        ${r>0?`
          <button id="btn-download-zip" class="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-semibold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
            ${B.archive}
            <span>Download All (ZIP)</span>
          </button>
        `:""}

        <button id="btn-clear-all" class="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-red-400 text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
          ${B.trash}
          <span>Clear</span>
        </button>
      </div>
    </div>

    <!-- Items List -->
    <div class="space-y-3" id="queue-items-container"></div>
  `;const a=n.querySelector("#btn-download-zip");a&&a.addEventListener("click",t.onDownloadAllZip);const l=n.querySelector("#btn-clear-all");l&&l.addEventListener("click",t.onClearQueue);const i=n.querySelector("#queue-items-container");return e.forEach(c=>{const s=document.createElement("div");s.className="p-4 rounded-xl border border-neutral-900 bg-black hover:border-neutral-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4";const f=c.status==="done",g=c.status==="error",v=c.status==="processing"||c.status==="analyzing",x=[];if(c.result?.auditBefore){const w=c.result.auditBefore;w.hasGps&&x.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">GPS EXPOSED</span>'),w.hasThumbnail&&x.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">THUMBNAIL LEAK</span>'),w.hasMakerNotes&&x.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">MAKERNOTES</span>'),w.hasExif&&!w.hasGps&&x.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">EXIF</span>')}s.innerHTML=`
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <div class="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-0.5 text-neutral-400">
          ${f?`<span class="text-emerald-400">${B.check}</span>`:g?`<span class="text-red-400">${B.alertTriangle}</span>`:`<span class="text-neutral-400 animate-spin">${B.cpu}</span>`}
        </div>

        <div class="min-w-0 flex-1 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-mono font-medium text-neutral-200 truncate max-w-[200px] sm:max-w-xs" title="${c.file.name}">
              ${c.file.name}
            </span>
            <span class="text-[10px] text-neutral-400 font-mono">(${Re(c.file.size)})</span>
            ${x.join(" ")}
          </div>

          ${f&&c.result?`
            <div class="flex flex-wrap items-center gap-2 pt-0.5">
              <span class="text-xs font-mono text-emerald-400 font-medium">
                ${c.result.sanitizedName}
              </span>
              <span class="text-[10px] text-neutral-400 font-mono">
                (${Re(c.result.sanitizedSize)})
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

          ${v?`
            <div class="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden mt-2">
              <div class="bg-neutral-200 h-full transition-all duration-300" style="width: ${c.progress}%"></div>
            </div>
            <div class="text-[10px] text-neutral-400 font-mono flex justify-between">
              <span>${c.status==="analyzing"?"Scanning...":"Re-encoding..."}</span>
              <span>${c.progress}%</span>
            </div>
          `:""}

          ${g?`
            <div class="text-xs text-red-400 font-mono mt-1">
              Error: ${c.error||"Failed to process"}
            </div>
          `:""}
        </div>
      </div>

      <!-- Action Buttons -->
      ${f&&c.result?`
        <div class="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-900">
          <button class="btn-inspect px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
            ${B.eye}
            <span>Inspect</span>
          </button>

          <button class="btn-download px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer">
            ${B.download}
            <span>Download</span>
          </button>
        </div>
      `:""}
    `;const b=s.querySelector(".btn-inspect");b&&b.addEventListener("click",()=>t.onInspectForensics(c));const y=s.querySelector(".btn-download");y&&y.addEventListener("click",()=>t.onDownloadSingle(c)),i.appendChild(s)}),n}function Re(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],r=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,r)).toFixed(1))} ${n[r]}`}function xn(e,t){const n=document.createElement("div");n.className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in";const r=URL.createObjectURL(e.originalBlob||e.blob),o=URL.createObjectURL(e.blob);n.innerHTML=`
    <div class="relative w-full max-w-5xl bg-[#080808] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div>
          <h2 class="text-sm font-bold font-mono text-white tracking-wide">File Inspection</h2>
          <p class="text-[11px] text-neutral-400 font-mono">Comparison between raw input and sanitized output</p>
        </div>

        <button id="modal-close" class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
          ${B.close}
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
                ${B.alertTriangle} Input File
              </span>
              <span class="text-[10px] font-mono text-neutral-400 truncate max-w-[200px]">${e.originalName}</span>
            </div>

            <div class="aspect-video bg-black rounded-lg border border-neutral-900 overflow-hidden flex items-center justify-center relative">
              ${Oe(r,e.originalName)}
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-red-500/50 text-[10px] font-mono text-red-400">
                ${e.auditBefore.tags.length} Metadata Tags Detected
              </div>
            </div>

            <div class="space-y-1 font-mono text-[11px]">
              <div class="flex justify-between text-neutral-400">
                <span>File Size:</span>
                <span class="text-white">${_e(e.originalSize)}</span>
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
                ${B.shieldCheck} Clean File
              </span>
              <span class="text-[10px] font-mono text-emerald-300 truncate max-w-[200px]">${e.sanitizedName}</span>
            </div>

            <div class="aspect-video bg-black rounded-lg border border-neutral-900 overflow-hidden flex items-center justify-center relative">
              ${Oe(o,e.sanitizedName)}
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                ${B.check} 0 Metadata Tags • Pure Bitstream
              </div>
            </div>

            <div class="space-y-1 font-mono text-[11px]">
              <div class="flex justify-between text-neutral-400">
                <span>Clean Size:</span>
                <span class="text-emerald-400 font-semibold">${_e(e.sanitizedSize)}</span>
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
            <span class="text-purple-400 shrink-0">${B.shield}</span>
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
                  ${e.auditBefore.tags.map(l=>`
                    <tr class="hover:bg-neutral-900/50">
                      <td class="py-2 px-2 text-neutral-400 text-[11px]">${l.category}</td>
                      <td class="py-2 px-2 text-white font-medium">${l.name}</td>
                      <td class="py-2 px-2 text-neutral-300 max-w-xs truncate" title="${l.value}">${l.value}</td>
                      <td class="py-2 px-2">
                        <span class="px-1.5 py-0.5 rounded text-[9px] uppercase ${l.severity==="critical"?"bg-red-950 text-red-400 border border-red-900":"bg-neutral-900 text-neutral-300 border border-neutral-800"}">
                          ${l.severity}
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
                ${e.auditBefore.markers.map(l=>`
                  <div class="flex items-center justify-between p-2 rounded bg-black border ${l.isSanitizedSafe?"border-neutral-800":"border-red-900/50 bg-red-950/20"} text-[11px] font-mono">
                    <span class="${l.isSanitizedSafe?"text-neutral-300":"text-red-400 font-medium"}">${l.name}</span>
                    <span class="text-[10px] text-neutral-500">${l.marker}</span>
                  </div>
                `).join("")}
              </div>
            </div>

            <!-- Sanitized Markers -->
            <div>
              <div class="text-[11px] font-mono text-neutral-400 mb-2 font-medium">Clean Segments:</div>
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                ${e.auditAfter.markers.map(l=>`
                  <div class="flex items-center justify-between p-2 rounded bg-black border border-emerald-900/40 text-[11px] font-mono">
                    <span class="text-emerald-400">${l.name}</span>
                    <span class="text-[10px] text-emerald-600">${l.marker}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        </div>

        <!-- Defense Summary -->
        <div class="p-3.5 rounded-xl border border-neutral-800 bg-black flex items-center justify-between text-xs font-mono">
          <div class="flex items-center gap-2 text-neutral-300">
            ${B.shieldCheck}
            <span>Full Reconstruction & Noise Disruption Applied</span>
          </div>
          <span class="text-[11px] text-neutral-500">In-Memory • No Server Upload</span>
        </div>
      </div>
    </div>
  `;const a=()=>{mn([r,o]),t()};return n.querySelector("#modal-close")?.addEventListener("click",a),n.addEventListener("click",l=>{l.target===n&&a()}),n}function Oe(e,t){const n=/\.(mp4|mov|webm)$/i.test(t),r=/\.(mp3|wav|ogg|aac|m4a)$/i.test(t);return n?`<video src="${e}" controls class="max-h-full max-w-full rounded"></video>`:r?`
      <div class="p-4 flex flex-col items-center justify-center text-center space-y-2 w-full">
        <span class="text-neutral-400 font-mono text-[11px]">Audio Stream</span>
        <audio src="${e}" controls class="w-full max-w-xs"></audio>
      </div>`:`<img src="${e}" alt="Preview" class="max-h-full max-w-full object-contain" />`}function _e(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],r=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,r)).toFixed(1))} ${n[r]}`}function bn(e){const t=document.createElement("div");t.className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in",t.innerHTML=`
    <div class="relative w-full max-w-3xl bg-[#080808] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div class="flex items-center gap-2.5">
          <span class="text-neutral-400">${B.info}</span>
          <h2 class="text-sm font-semibold font-mono text-white tracking-wide">Legal, Licenses & Privacy</h2>
        </div>
        <button id="legal-close" class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
          ${B.close}
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto space-y-6 text-neutral-300 text-xs leading-relaxed font-sans">
        <!-- 1. Intended Purpose & Privacy Mandates -->
        <section class="space-y-2">
          <h3 class="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
            ${B.shield} Purpose & Data Minimization
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
            ${B.lock} Client-Side Execution (Zero Network Traffic)
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
            ${B.info} Usage Recommendations
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
  `;const n=t.querySelector("#legal-close"),r=t.querySelector("#legal-close-btn");return n.addEventListener("click",e),r.addEventListener("click",e),t.addEventListener("click",o=>{o.target===t&&e()}),t}var vn=class{root;settings={quality:.6,extremeSanitization:!1};queue=[];activeAuditModal=null;activeLegalModal=null;isProcessingQueue=!1;constructor(e){this.root=e,this.render()}render(){this.root.innerHTML="";const e=document.createElement("main");e.className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col";const t=gn(this.settings,a=>{this.settings={...this.settings,...a}});e.appendChild(t);const n=hn(a=>this.handleFilesAdded(a));e.appendChild(n);const r=Te(this.queue,{onDownloadSingle:a=>this.handleDownloadSingle(a),onDownloadAllZip:()=>this.handleDownloadAllZip(),onInspectForensics:a=>this.handleInspectForensics(a),onClearQueue:()=>this.handleClearQueue()});e.appendChild(r);const o=this.createFooter();e.appendChild(o),this.root.appendChild(e)}createFooter(){const e=document.createElement("footer");return e.className="mt-auto pt-16 pb-8 text-center text-neutral-500 text-xs font-mono border-t border-neutral-900",e.innerHTML=`
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
    `,e.querySelector("#footer-legal-btn")?.addEventListener("click",()=>{this.openLegalModal()}),e}handleFilesAdded(e){const t=e.map(n=>({id:`${Date.now()}-${Math.random().toString(36).slice(2,9)}`,file:n,status:"idle",progress:0}));this.queue.push(...t),this.render(),this.processQueue()}async processQueue(){if(!this.isProcessingQueue){this.isProcessingQueue=!0;for(let e=0;e<this.queue.length;e++){const t=this.queue[e];if(t.status==="idle"){t.status="analyzing",t.progress=25,this.updateQueueView();try{t.status="processing";const n=await cn(t.file,{quality:this.settings.quality,extremeSanitization:this.settings.extremeSanitization},r=>{t.progress=r,this.updateQueueView()});t.status="done",t.progress=100,t.result=n}catch(n){t.status="error",t.error=n.message||"Processing failed"}this.updateQueueView()}}this.isProcessingQueue=!1}}updateQueueView(){const e=this.root.querySelector("#queue-items-container")?.parentElement;if(e){const t=Te(this.queue,{onDownloadSingle:n=>this.handleDownloadSingle(n),onDownloadAllZip:()=>this.handleDownloadAllZip(),onInspectForensics:n=>this.handleInspectForensics(n),onClearQueue:()=>this.handleClearQueue()});e.replaceWith(t)}else this.render()}handleDownloadSingle(e){e.result&&Be(e.result.blob,e.result.sanitizedName)}async handleDownloadAllZip(){const e=this.queue.filter(r=>r.status==="done"&&r.result).map(r=>r.result);if(e.length===0)return;const{zipBlob:t,zipFileName:n}=await fn(e);Be(t,n)}handleInspectForensics(e){e.result&&this.openAuditModal(e.result)}openAuditModal(e){this.activeAuditModal&&this.activeAuditModal.remove(),this.activeAuditModal=xn(e,()=>{this.activeAuditModal?.remove(),this.activeAuditModal=null}),document.body.appendChild(this.activeAuditModal)}openLegalModal(){this.activeLegalModal&&this.activeLegalModal.remove(),this.activeLegalModal=bn(()=>{this.activeLegalModal?.remove(),this.activeLegalModal=null}),document.body.appendChild(this.activeLegalModal)}handleClearQueue(){for(const e of this.queue)e.result&&e.result.blob.arrayBuffer().then(t=>pn(t)).catch(()=>{});this.queue=[],this.render()}};document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("app");if(!e)throw new Error("Application root element (#app) not found");new vn(e)});

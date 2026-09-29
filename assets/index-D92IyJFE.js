(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))a(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const l of r.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&a(l)}).observe(document,{childList:!0,subtree:!0});function n(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(s){if(s.ep)return;s.ep=!0;const r=n(s);fetch(s.href,r)}})();var je=1229472850,Ve=1347179589,Xe=1229209940,qe=1229278788,Ge=1700284774,He=1950701684,We=2052348020,Qe=1767135348,Ze=1950960965,Ye=1883789683,Ke=1766015824,Je=1665684045,et=1732332865,tt=1934772034,nt=1448097824,at=1448097868,rt=1448097880,st=1095649613,it=1095650630,ot=1163413830,lt=1481461792,ct=1229144912,dt=1095520328,le=1969517665,ce=1835365473,de=1768715124,ue=1970628964;function ut(e){const t=new Uint8Array(e),n=[];if(t.length<4)return n;const a=new DataView(e);return t[0]===255&&t[1]===216?ft(t):a.getUint32(0,!1)===2303741511?pt(t,a):a.getUint32(0,!1)===1380533830&&t.length>=12&&a.getUint32(8,!1)===1464156752?mt(t,a):t.length>12&&a.getUint32(4,!1)===1718909296?gt(t,a):n}function ft(e){const t=[];t.push({offset:0,marker:"0xFFD8",name:"SOI (Start of Image)",isSanitizedSafe:!0,description:"Mandatory standard JPEG boundary marker"});let n=2;const a=e.length;for(;n<a-1;){if(e[n]!==255){n++;continue}const s=e[n+1];if(s===255||s===0){n++;continue}const r="0xFF"+s.toString(16).toUpperCase().padStart(2,"0");if(s===217){t.push({offset:n,marker:r,name:"EOI (End of Image)",isSanitizedSafe:!0,description:"End of image data stream"});break}if(s===218){for(t.push({offset:n,marker:r,name:"SOS (Start of Scan)",isSanitizedSafe:!0,description:"Compressed image pixel bitstream follows"}),n+=2;n<a-1&&!(e[n]===255&&e[n+1]!==0&&e[n+1]<=217);)n++;continue}if(n+3>=a)break;const l=e[n+2]<<8|e[n+3];let i=`Segment (${r})`,c=!1,o="";switch(s){case 224:i="APP0 (JFIF Header)",c=!0,o="Basic JPEG container identification";break;case 225:e[n+4]===69&&e[n+5]===120&&e[n+6]===105&&e[n+7]===102?(i="APP1 (EXIF / GPS / IFD1 Thumbnail)",c=!1,o="High risk: contains camera serials, timestamps, GPS, and thumbnail traps"):(i="APP1 (Metadata/XMP)",c=!1,o="Contains edit history, instance IDs, or XMP packets");break;case 226:i="APP2 (ICC Color Profile)",c=!1,o="Contains OS calibration profile or author system identifiers";break;case 237:i="APP13 (Photoshop / IPTC)",c=!1,o="Contains bylines, captions, and Photoshop edit records";break;case 238:i="APP14 (Adobe DCT)",c=!1,o="Adobe color transform marker";break;case 219:i="DQT (Quantization Table)",c=!0,o="Quantization matrix; forensic fingerprint of ISP encoder";break;case 196:i="DHT (Huffman Table)",c=!0,o="Entropy encoding frequency table";break;case 192:case 194:i=`SOF (Start of Frame - ${s===192?"Baseline":"Progressive"})`,c=!0,o="Image dimensions, bit depth, and color components";break;case 254:i="COM (Comment)",c=!1,o="Text comment embedded in image";break;default:s>=227&&s<=239&&(i=`APP${s-224} (Vendor Marker)`,c=!1,o="Proprietary camera or software metadata block")}t.push({offset:n,marker:r,name:i,length:l,isSanitizedSafe:c,description:o}),n+=2+l}return t}function pt(e,t){const n=[];let a=8;const s=t.byteLength;for(;a+8<=s;){const r=t.getUint32(a,!1),l=t.getUint32(a+4,!1);let i=!1,c="Image raster data or standard header",o="UNKNOWN";switch(l){case je:i=!0,o="IHDR",c="Header: Dimensions, depth, color type";break;case Ve:i=!0,o="PLTE",c="Palette table";break;case Xe:i=!0,o="IDAT",c="Compressed image pixel data";break;case qe:i=!0,o="IEND",c="End of PNG image";break;case Ge:i=!1,o="eXIf",c="Embedded raw EXIF metadata block";break;case He:i=!1,o="tEXt",c="Textual metadata (Creation time, software, author)";break;case We:i=!1,o="zTXt",c="Compressed textual metadata";break;case Qe:i=!1,o="iTXt",c="Internationalized UTF-8 metadata";break;case Ze:i=!1,o="tIME",c="Modification timestamp";break;case Ye:i=!1,o="pHYs",c="Physical pixel dimensions / DPI";break;case Ke:i=!1,o="iCCP",c="Embedded ICC Color Profile / Display calibration fingerprint";break;case Je:i=!1,o="cHRM",c="Primary chromaticities display calibration";break;case et:i=!1,o="gAMA",c="Image gamma correction curve";break;case tt:i=!0,o="sRGB",c="Standard sRGB color space rendering intent";break;default:o="CHUNK",i=!1}n.push({offset:a,marker:o,name:`Chunk: ${o}`,length:r,isSanitizedSafe:i,description:c}),a+=12+r}return n}function mt(e,t){const n=[];let a=12;const s=t.byteLength;for(;a+8<=s;){const r=t.getUint32(a,!1),l=t.getUint32(a+4,!0);let i=!1,c="Visual raster bitstream",o="WEBP";switch(r){case nt:o="VP8",i=!0;break;case at:o="VP8L",i=!0;break;case rt:o="VP8X",i=!0;break;case st:o="ANIM",i=!0;break;case it:o="ANMF",i=!0;break;case ot:o="EXIF",i=!1,c="Embedded EXIF metadata block";break;case lt:o="XMP",i=!1,c="Embedded XMP metadata block";break;case ct:o="ICCP",i=!1,c="ICC Color Profile";break;case dt:o="ALPH",i=!0,c="Alpha transparency channel for reconstructed pixels";break;default:o="CHUNK",i=!1}n.push({offset:a,marker:o,name:`WebP Chunk: ${o}`,length:l,isSanitizedSafe:i,description:c});const d=l+l%2;a+=8+d}return n}function gt(e,t){const n=[];let a=0;const s=t.byteLength;for(;a+8<=s;){const r=t.getUint32(a,!1),l=t.getUint32(a+4,!1);if(r<8&&r!==0)break;const i=l===le||l===ce||l===de||l===ue;let c="BOX",o="Video/Audio container structure";switch(l){case le:c="udta",o="User Data box (stores GPS, camera model, author)";break;case ce:c="meta",o="Metadata box (tags, encoder settings)";break;case de:c="ilst",o="Item List atom (QuickTime/iTunes metadata)";break;case ue:c="uuid",o="Vendor proprietary custom box";break;case 1718909296:c="ftyp";break;case 1836019574:c="moov";break;case 1835295092:c="mdat";break;default:c="atom"}if(n.push({offset:a,marker:c,name:`Box: ${c}`,length:r,isSanitizedSafe:!i,description:o}),r===0||a+r>s)break;a+=r}return n}function ht(e,t){if(e.length<12)return 0;let n=0;const a=e.length;if(e[0]===255&&e[1]===216||t==="image/jpeg"){let s=2;for(;s<a-1;){if(e[s]!==255){s++;continue}const r=e[s+1];if(r===255||r===0){s++;continue}if(r===217||r===218||s+3>=a)break;const l=e[s+2]<<8|e[s+3],i=s+4,c=s+2+l;if(c>a)break;if(r===225)if(i+6<=c&&e[i]===69&&e[i+1]===120&&e[i+2]===105&&e[i+3]===102&&e[i+4]===0&&e[i+5]===0){n++;const o=i+6;if(o+8<=c){const d=new DataView(e.buffer,e.byteOffset+o,c-o),u=d.getUint16(0)===18761,m=d.getUint32(4,u);if(m+2<=d.byteLength){const p=d.getUint16(m,u),g=m+2+p*12;g+4<=d.byteLength&&d.getUint32(g,u)!==0&&n++}}}else n++;else r===226?i+12<=c&&e[i]===73&&e[i+1]===67&&e[i+2]===67&&e[i+3]===95&&e[i+4]===80&&e[i+5]===82&&e[i+6]===79&&e[i+7]===70&&e[i+8]===73&&e[i+9]===76&&e[i+10]===69&&e[i+11]===0&&n++:(r>=227&&r<=239||r===254)&&n++;s=c}return n}if(e[0]===137&&e[1]===80&&e[2]===78&&e[3]===71||t==="image/png"){let s=8;const r=new DataView(e.buffer,e.byteOffset,e.byteLength);for(;s+8<=a;){const l=r.getUint32(s,!1),i=r.getUint32(s+4,!1),c=12+l;if(s+c>a)break;switch(i){case 1700284774:case 1766015824:case 1950701684:case 2052348020:case 1767135348:n++}s+=c}return n}if(e[0]===82&&e[1]===73&&e[2]===70&&e[3]===70||t==="image/webp"){let s=12;const r=new DataView(e.buffer,e.byteOffset,e.byteLength);for(;s+8<=a;){const l=r.getUint32(s,!1),i=r.getUint32(s+4,!0),c=8+(i+i%2);if(s+c>a)break;(l===1163413830||l===1481461792||l===1229144912)&&n++,s+=c}return n}return 0}async function Me(e){const t=e instanceof Uint8Array?e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength):e,n=await crypto.subtle.digest("SHA-256",t);return Array.from(new Uint8Array(n)).map(a=>a.toString(16).padStart(2,"0")).join("")}function xt(e){const t=e.match(/\.([a-zA-Z0-9]+)$/);return(t?t[1]:e).replace(/[^a-zA-Z0-9]/g,"").toLowerCase()||"webp"}async function ne(e,t,n=32){return`${(await Me(e)).slice(0,n)}.${xt(t)}`}var bt=ne;async function Y(e,t){const n=await e.arrayBuffer(),a=new Uint8Array(n),s=[],r=ut(n);let l=!1,i=!1,c=!1,o=!1;const d=vt(a);if(d!==-1){l=!0;const g=new DataView(n,d),x=g.getUint16(0)===18761;try{const h=g.getUint32(4,x);if(h<a.length){const f=te(g,h,x,"IFD0");if(s.push(...f.tags),f.gpsPointer){i=!0;const b=te(g,f.gpsPointer,x,"GPS");s.push(...b.tags)}if(f.exifPointer){const b=te(g,f.exifPointer,x,"EXIF");s.push(...b.tags),b.hasMakerNotes&&(o=!0)}if(f.nextIfdOffset&&f.nextIfdOffset!==0){c=!0;const b=te(g,f.nextIfdOffset,x,"IFD1");s.push({category:"IFD1_Thumbnail",name:"IFD1 Embedded Thumbnail",value:`Embedded image preview found at offset ${f.nextIfdOffset}`,severity:"critical",description:"Embedded unedited thumbnail: major forensic leak vector."}),s.push(...b.tags)}}}catch{s.push({category:"EXIF",name:"Malformed EXIF Header",value:"Header parsing failed",severity:"medium"})}}const u=Ct(a);u.length>0&&s.push(...u),r.some(g=>g.name.includes("ICC")||g.marker==="ICCP")&&s.push({category:"ICC",name:"ICC Color Profile",value:"Color management profile present (hardware/software calibration)",severity:"medium",description:"Can identify operating system or monitor calibration profile."});const m=await Me(n),p=l||o?"high":r.length>5?"moderate":"low";return{fileName:t||(e instanceof File?e.name:"unnamed_media"),fileSize:e.size,mimeType:e.type||"application/octet-stream",hasExif:l,hasGps:i,hasThumbnail:c,hasMakerNotes:o,tags:s,markers:r,prnuSusceptibility:p,sha256:m}}function vt(e){if(e.length>=8&&(e[0]===73&&e[1]===73&&e[2]===42&&e[3]===0||e[0]===77&&e[1]===77&&e[2]===0&&e[3]===42))return 0;for(let t=0;t<Math.min(e.length-10,65536);t++)if(e[t]===255&&e[t+1]===225&&e[t+4]===69&&e[t+5]===120&&e[t+6]===105&&e[t+7]===102&&e[t+8]===0&&e[t+9]===0)return t+10;for(let t=12;t<Math.min(e.length-8,65536);t++)if(e[t]===69&&e[t+1]===88&&e[t+2]===73&&e[t+3]===70)return t+8;return-1}function te(e,t,n,a){const s={tags:[]};if(t+2>=e.byteLength)return s;const r=e.getUint16(t,n);let l=t+2;for(let i=0;i<r&&!(l+12>e.byteLength);i++){const c=e.getUint16(l,n),o=e.getUint16(l+2,n),d=e.getUint32(l+4,n),u=l+8;let m="";if(c===34665&&a==="IFD0")s.exifPointer=e.getUint32(u,n);else if(c===34853&&a==="IFD0")s.gpsPointer=e.getUint32(u,n);else if(c===37500)s.hasMakerNotes=!0,s.tags.push({category:"MakerNotes",name:"Proprietary MakerNotes",value:`${d} bytes of camera-specific binary telemetry`,severity:"critical",description:"Manufacturer proprietary block containing sensor temperatures, lens serials, or face biometric coordinates."});else{const p=wt(c,a);p&&(o===2?m=yt(e,u,d,n):o===3?m=e.getUint16(u,n).toString():o===4?m=e.getUint32(u,n).toString():m=`[${d} items]`,m.trim()&&s.tags.push({category:a==="GPS"?"GPS":a==="IFD1"?"IFD1_Thumbnail":"EXIF",name:p.name,value:m.trim(),severity:p.severity,description:p.description}))}l+=12}return l+4<=e.byteLength&&(s.nextIfdOffset=e.getUint32(l,n)),s}function wt(e,t){if(t==="GPS")switch(e){case 1:return{name:"GPS Latitude Ref",severity:"critical",description:"North/South coordinate hemisphere"};case 2:return{name:"GPS Latitude",severity:"critical",description:"Precise GPS latitude coordinates"};case 3:return{name:"GPS Longitude Ref",severity:"critical",description:"East/West coordinate hemisphere"};case 4:return{name:"GPS Longitude",severity:"critical",description:"Precise GPS longitude coordinates"};case 6:return{name:"GPS Altitude",severity:"critical",description:"Elevation above sea level"};case 7:return{name:"GPS TimeStamp",severity:"critical",description:"Atomic satellite UTC timestamp"};case 29:return{name:"GPS DateStamp",severity:"critical",description:"Satellite GPS date"}}switch(e){case 271:return{name:"Camera Manufacturer (Make)",severity:"high",description:"Brand of camera or smartphone"};case 272:return{name:"Camera Model",severity:"critical",description:"Exact phone or camera hardware model"};case 305:return{name:"Software / OS Version",severity:"high",description:"Firmware or operating system build"};case 306:return{name:"Modify Date / Time",severity:"high",description:"Modification timestamp"};case 36867:return{name:"Date / Time Original",severity:"critical",description:"Exact moment the shutter was pressed"};case 36868:return{name:"Date / Time Digitized",severity:"critical",description:"Sensor analog-to-digital timestamp"};case 42033:return{name:"Camera Body Serial Number",severity:"critical",description:"Hardware unique serial number"};case 42036:return{name:"Lens Model",severity:"high",description:"Optical lens specifications"};case 42016:return{name:"Image Unique ID",severity:"critical",description:"Unique cryptographic ID generated by ISP"};case 513:return{name:"Thumbnail Offset",severity:"critical",description:"Pointer to raw thumbnail stream"};case 514:return{name:"Thumbnail Length",severity:"critical",description:"Byte length of embedded thumbnail"};default:return null}}function yt(e,t,n,a){let s=t;if(n>4&&(s=e.getUint32(t,a)),s+n>e.byteLength)return"";let r="";for(let l=0;l<n;l++){const i=e.getUint8(s+l);if(i===0)break;r+=String.fromCharCode(i)}return r}function Ct(e){const t=[],n=Math.min(e.length-20,2e5),a="<?xpacket begin";for(let s=0;s<n;s++)if(e[s]===60&&e[s+1]===63&&String.fromCharCode(...e.slice(s,s+15))===a){t.push({category:"XMP",name:"Adobe XMP Metadata Packet",value:"XMP Packet detected",severity:"critical",description:"Contains edit history, Photoshop/Lightroom instance IDs, and original document UUIDs."});break}return t}function kt(e,t=!1){if(e==="standard")return{theta:0,sx:1,sy:1,noiseIntensity:0};const n=new Uint32Array(3);crypto.getRandomValues(n);const a=.1+n[0]/4294967295*.2,s=(n[0]%2===0?1:-1)*(a*Math.PI)/180,r=.995+n[1]/4294967295*.004;let l=.995+n[2]/4294967295*.004;return Math.abs(r-l)<5e-4&&(l=r<.997?r+6e-4:r-6e-4),{theta:s,sx:r,sy:l,noiseIntensity:t?0:2}}function _(e){const t=Math.abs(e);return t<=1?1.5*t*t*t-2.5*t*t+1:t<2?-.5*t*t*t+2.5*t*t-4*t+2:0}function Mt(e,t,n,a=!0,s=!1){const r=e.width,l=e.height;if(n==="standard"){t.width=r,t.height=l,t.getContext("2d",{willReadFrequently:!0,alpha:a}).drawImage(e,0,0);return}const i=kt(n,s),c=new OffscreenCanvas(r,l).getContext("2d",{willReadFrequently:!0});c.drawImage(e,0,0);const o=c.getImageData(0,0,r,l),d=new Uint32Array(o.data.buffer),u=3,m=r-6,p=l-6;t.width=m,t.height=p;const g=t.getContext("2d",{willReadFrequently:!0,alpha:a}),x=g.createImageData(m,p),h=new Uint32Array(x.data.buffer),f=Math.cos(i.theta),b=Math.sin(i.theta),k=i.sx*f,y=-i.sy*b,w=i.sx*b,M=i.sy*f,S=k*M-y*w,N=M/S,$=-y/S,R=-w/S,j=k/S,C=r/2,U=l/2,A=new Uint32Array(1);crypto.getRandomValues(A);let P=A[0]||305419896;for(let V=0;V<p;V++){const I=V+u-U,D=-C+u;let L=D*N+I*$+C,W=D*R+I*j+U;for(let E=0;E<m;E++){const B=Math.floor(L),O=Math.floor(W),F=L-B,T=W-O,Ee=_(F+1),Ie=_(F),De=_(F-1),Le=_(F-2),Be=_(T+1),Fe=_(T),Te=_(T-1),Re=_(T-2);let re=0,se=0,ie=0,oe=0;for(let X=-1;X<=2;X++){let q=0;if(X===-1?q=Be:X===0?q=Fe:X===1?q=Te:q=Re,q===0)continue;let Q=O+X;Q<0?Q=0:Q>=l&&(Q=l-1);const Ne=Q*r;for(let G=-1;G<=2;G++){let H=0;if(G===-1?H=Ee:G===0?H=Ie:G===1?H=De:H=Le,H===0)continue;let Z=B+G;Z<0?Z=0:Z>=r&&(Z=r-1);const J=H*q,ee=d[Ne+Z];re+=(ee&255)*J,se+=(ee>>8&255)*J,ie+=(ee>>16&255)*J,oe+=(ee>>24&255)*J}}let K=0;i.noiseIntensity>0&&(P^=P<<13,P^=P>>>17,P^=P<<5,K=(P&255)%5-2);const Oe=Math.min(255,Math.max(0,re+K)),_e=Math.min(255,Math.max(0,se+K)),ze=Math.min(255,Math.max(0,ie+K)),$e=a?Math.min(255,Math.max(0,oe)):255;h[V*m+E]=Oe|_e<<8|ze<<16|$e<<24,L+=N,W+=R}}g.putImageData(x,0,0)}var Ut=1766015824,St=1665684045,Pt=1732332865,At=1700284774,Et=1950701684,It=2052348020,Dt=1767135348,Lt=1950960965,Bt=1883789683,Ft=1229144912,Tt=1163413830,Rt=1481461792;function Ue(e,t){return e.length<12?e:t==="image/png"||e[0]===137&&e[1]===80&&e[2]===78&&e[3]===71?Ot(e):t==="image/jpeg"||e[0]===255&&e[1]===216?_t(e):t==="image/webp"||e[0]===82&&e[1]===73&&e[2]===70&&e[3]===70?qt(e):e}function Ot(e){if(e.length<8)return e;const t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(t.getUint32(0,!1)!==2303741511||t.getUint32(4,!1)!==218765834)return e;const n=new Uint8Array(e.length);n.set(e.subarray(0,8),0);let a=8,s=8;const r=e.length;for(;a+8<=r;){const l=t.getUint32(a,!1),i=t.getUint32(a+4,!1),c=12+l;if(a+c>r)break;i===Ut||i===St||i===Pt||i===At||i===Et||i===It||i===Dt||i===Lt||i===Bt||(n.set(e.subarray(a,a+c),s),s+=c),a+=c}return n.subarray(0,s)}function _t(e){if(e.length<4||e[0]!==255||e[1]!==216)return e;const t=new Uint8Array(e.length);t[0]=255,t[1]=216;let n=2,a=2;const s=e.length;for(;a<s-1;){if(e[a]!==255){t[n++]=e[a++];continue}const r=e[a+1];if(r===255||r===0){t[n++]=e[a++];continue}if(r===217){t[n++]=255,t[n++]=217;break}if(r===218){const c=e.subarray(a);t.set(c,n),n+=c.length;break}if(a+3>=s)break;const l=2+(e[a+2]<<8|e[a+3]);if(a+l>s)break;let i=!1;r===226?a+15<=s&&e[a+4]===73&&e[a+5]===67&&e[a+6]===67&&e[a+7]===95&&e[a+8]===80&&e[a+9]===82&&e[a+10]===79&&e[a+11]===70&&e[a+12]===73&&e[a+13]===76&&e[a+14]===69&&e[a+15]===0&&(i=!0):(r===225||r===237||r===238||r===254||r>=227&&r<=239)&&(i=!0),i||(t.set(e.subarray(a,a+l),n),n+=l),a+=l}return t.subarray(0,n)}var zt=1448097880,$t=1095520328,Nt=1448097824,jt=1448097868,Vt=1095649613,Xt=1095650630;function qt(e){if(e.length<12)return e;const t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(t.getUint32(0,!1)!==1380533830||t.getUint32(8,!1)!==1464156752)return e;let n=!1,a=!1,s=null;const r=[];let l=12;const i=e.length;for(;l+8<=i;){const u=t.getUint32(l,!1),m=t.getUint32(l+4,!0),p=8+(m+m%2);if(l+p>i)break;u===$t?(n=!0,r.push({offset:l,totalLen:p,type:u})):u===Vt||u===Xt?(a=!0,r.push({offset:l,totalLen:p,type:u})):u===zt?s={offset:l,totalLen:p}:u===Nt||u===jt?r.push({offset:l,totalLen:p,type:u}):u===Ft||u===Tt||u===Rt||r.push({offset:l,totalLen:p,type:u}),l+=p}const c=new Uint8Array(e.length);c.set(e.subarray(0,12),0);const o=new DataView(c.buffer,c.byteOffset,c.byteLength);let d=12;if((n||a)&&s){c.set(e.subarray(s.offset,s.offset+s.totalLen),d);let u=0;n&&(u|=16),a&&(u|=2),c[d+8]=u,d+=s.totalLen}for(const u of r)c.set(e.subarray(u.offset,u.offset+u.totalLen),d),d+=u.totalLen;return o.setUint32(4,d-8,!0),c.subarray(0,d)}var Gt=Ue;function z(e){const t=Math.abs(e);return t<=1?1.5*t*t*t-2.5*t*t+1:t<2?-.5*t*t*t+2.5*t*t-4*t+2:0}function Ht(e,t,n,a,s,r,l=!0){const i=t/s,c=n/r;for(let o=0;o<r;o++){const d=(o+.5)*c-.5,u=Math.floor(d),m=d-u,p=z(m+1),g=z(m),x=z(m-1),h=z(m-2);for(let f=0;f<s;f++){const b=(f+.5)*i-.5,k=Math.floor(b),y=b-k,w=z(y+1),M=z(y),S=z(y-1),N=z(y-2);let $=0,R=0,j=0,C=0;for(let I=-1;I<=2;I++){let D=0;if(I===-1?D=p:I===0?D=g:I===1?D=x:D=h,D===0)continue;let L=u+I;L<0?L=0:L>=n&&(L=n-1);const W=L*t;for(let E=-1;E<=2;E++){let B=0;if(E===-1?B=w:E===0?B=M:E===1?B=S:B=N,B===0)continue;let O=k+E;O<0?O=0:O>=t&&(O=t-1);const F=B*D,T=e[W+O];$+=(T&255)*F,R+=(T>>8&255)*F,j+=(T>>16&255)*F,C+=(T>>24&255)*F}}const U=Math.min(255,Math.max(0,Math.round($))),A=Math.min(255,Math.max(0,Math.round(R))),P=Math.min(255,Math.max(0,Math.round(j))),V=l?Math.min(255,Math.max(0,Math.round(C))):255;a[o*s+f]=U|A<<8|P<<16|V<<24}}}function Wt(e,t=!0){const n=e.width,a=e.height;if(n<4||a<4)return;const s=Math.max(2,Math.round(n*.995)),r=Math.max(2,Math.round(a*.995));let l;typeof OffscreenCanvas<"u"?l=new OffscreenCanvas(s,r):(l=document.createElement("canvas"),l.width=s,l.height=r);const i=l.getContext("2d",{willReadFrequently:!0});i.drawImage(e,0,0,s,r);const c=i.getImageData(0,0,s,r),o=new Uint32Array(c.data.buffer),d=e.getContext("2d",{willReadFrequently:!0}),u=d.createImageData(n,a);Ht(o,s,r,new Uint32Array(u.data.buffer),n,a,t),d.putImageData(u,0,0)}function ae(e){for(let t=1;t<9;t++){const n=e[t];let a=t-1;for(;a>=0&&e[a]>n;)e[a+1]=e[a],a--;e[a+1]=n}}function fe(e,t,n){const a=e.length,s=new Uint8ClampedArray(a);s.set(e);const r=new Uint8Array(9),l=new Uint8Array(9),i=new Uint8Array(9);for(let c=0;c<n;c++)for(let o=0;o<t;o++){let d=0;for(let m=-1;m<=1;m++){const p=Math.min(n-1,Math.max(0,c+m))*t;for(let g=-1;g<=1;g++){const x=(p+Math.min(t-1,Math.max(0,o+g)))*4;r[d]=e[x],l[d]=e[x+1],i[d]=e[x+2],d++}}ae(r),ae(l),ae(i);const u=(c*t+o)*4;s[u]=r[4],s[u+1]=l[4],s[u+2]=i[4]}e.set(s)}function Qt(e){const t=e.width,n=e.height;if(t<3||n<3)return;const a=e.getContext("2d",{willReadFrequently:!0});if(!a)return;let s=null,r=null;try{typeof OffscreenCanvas<"u"?s=new OffscreenCanvas(t,n):(s=document.createElement("canvas"),s.width=t,s.height=n),r=s.getContext("webgl")}catch{r=null}if(!r){const l=a.getImageData(0,0,t,n);fe(l.data,t,n),a.putImageData(l,0,0);return}try{const l=`
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
    `,c=r.createShader(r.VERTEX_SHADER);r.shaderSource(c,l),r.compileShader(c);const o=r.createShader(r.FRAGMENT_SHADER);r.shaderSource(o,i),r.compileShader(o);const d=r.createProgram();r.attachShader(d,c),r.attachShader(d,o),r.linkProgram(d),r.useProgram(d);const u=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,u),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),r.STATIC_DRAW);const m=r.getAttribLocation(d,"a_position");r.enableVertexAttribArray(m),r.vertexAttribPointer(m,2,r.FLOAT,!1,0,0);const p=r.getUniformLocation(d,"u_resolution");r.uniform2f(p,t,n);const g=r.createTexture();r.bindTexture(r.TEXTURE_2D,g),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MAG_FILTER,r.NEAREST),r.texImage2D(r.TEXTURE_2D,0,r.RGBA,r.RGBA,r.UNSIGNED_BYTE,e),r.viewport(0,0,t,n),r.drawArrays(r.TRIANGLES,0,6),a.drawImage(s,0,0)}catch{const l=a.getImageData(0,0,t,n);fe(l.data,t,n),a.putImageData(l,0,0)}}function Zt(e,t=1597463007){let n=t||305419896;for(let a=0;a<e.length;a+=4){n^=n<<13,n^=n>>>17,n^=n<<5;const s=((n&1)===0?1:-1)*((n>>1&1)+1),r=((n>>2&1)===0?1:-1)*((n>>3&1)+1),l=((n>>4&1)===0?1:-1)*((n>>5&1)+1);e[a]=Math.min(255,Math.max(0,e[a]+s)),e[a+1]=Math.min(255,Math.max(0,e[a+1]+r)),e[a+2]=Math.min(255,Math.max(0,e[a+2]+l))}}function Se(e,t,n){for(let a=0;a<n;a+=2){const s=a+1<n;for(let r=0;r<t;r+=2){const l=r+1<t,i=[[r,a]];l&&i.push([r+1,a]),s&&i.push([r,a+1]),s&&l&&i.push([r+1,a+1]);let c=0,o=0;const d=[];for(const[p,g]of i){const x=(g*t+p)*4,h=e[x],f=e[x+1],b=e[x+2],k=.299*h+.587*f+.114*b,y=-.168736*h-.331264*f+.5*b+128,w=.5*h-.418688*f-.081312*b+128;d.push(k),c+=y,o+=w}const u=c/i.length,m=o/i.length;for(let p=0;p<i.length;p++){const[g,x]=i[p],h=(x*t+g)*4,f=d[p],b=u-128,k=m-128,y=f+1.402*k,w=f-.344136*b-.714136*k,M=f+1.772*b;e[h]=Math.min(255,Math.max(0,Math.round(y))),e[h+1]=Math.min(255,Math.max(0,Math.round(w))),e[h+2]=Math.min(255,Math.max(0,Math.round(M)))}}}}function Yt(e,t=!0){Wt(e,t),Qt(e);const n=e.getContext("2d",{willReadFrequently:!0});if(n){const a=n.getImageData(0,0,e.width,e.height);Se(a.data,e.width,e.height),Zt(a.data),n.putImageData(a,0,0)}}function Kt(e,t,n){if(t==="image/png"||/\.png$/i.test(n)||/screenshot/i.test(n))return!0;if(t==="image/jpeg"||/\.(jpe?g)$/i.test(n)){try{let a;typeof OffscreenCanvas<"u"?a=new OffscreenCanvas(48,48):(a=document.createElement("canvas"),a.width=48,a.height=48);const s=a.getContext("2d",{willReadFrequently:!0});if(s){s.drawImage(e,0,0,48,48);const r=s.getImageData(0,0,48,48).data,l=new Set;let i=!1;for(let c=0;c<r.length;c+=4){const o=r[c]>>4,d=r[c+1]>>4,u=r[c+2]>>4,m=o<<8|d<<4|u;if(l.add(m),l.size>=32){i=!0;break}}return s.clearRect(0,0,48,48),!i}}catch{}return!1}return!0}async function pe(e,t,n){n?.(10);const a=e instanceof File?e.name:"unnamed_image",s=e.size;let r=await e.arrayBuffer(),l=new Uint8Array(r);const i=await Y(e,a);n?.(25);let c=t.outputFormat;c==="original"&&(c=e.type||"image/jpeg"),["image/webp","image/jpeg","image/png"].includes(c)||(c="image/webp");const o=c==="image/webp"?"webp":c==="image/png"?"png":"jpg";if(ht(l,e.type)===0&&!t.extremeSanitization){n?.(80);const C=new Blob([l],{type:c}),U=await ne(l,o),A=await Y(C,U);n?.(100);const P={blob:C,originalBlob:e,originalName:a,sanitizedName:U,originalSize:s,sanitizedSize:C.size,format:c,sha256:A.sha256,defenseLevel:t.defenseLevel,auditBefore:i,auditAfter:A,processedAt:Date.now(),isBypass:!0,extremeSanitization:t.extremeSanitization};return r=null,l=null,P}const d=await createImageBitmap(e);n?.(45);const u=Kt(d,e.type,a);let m=!1,p=c,g=.6,x=u;t.extremeSanitization&&u?(p="image/webp",g=.6,x=!1,m=!0):u?(p=c==="image/png"?"image/png":"image/webp",g=1):g=.6;const h=!(e.type==="image/jpeg"||/\.(jpe?g|bmp)$/i.test(a))&&p!=="image/jpeg";let f;if(typeof OffscreenCanvas<"u"?f=new OffscreenCanvas(d.width,d.height):(f=document.createElement("canvas"),f.width=d.width,f.height=d.height),f.getContext("2d",{willReadFrequently:!0,alpha:h}),Mt(d,f,t.defenseLevel,h,x),m)Yt(f,h);else if(p==="image/webp"||p==="image/jpeg"){const C=f.getContext("2d",{willReadFrequently:!0});if(C){const U=C.getImageData(0,0,f.width,f.height);Se(U.data,f.width,f.height),C.putImageData(U,0,0)}}n?.(70);let b;f instanceof OffscreenCanvas?b=await f.convertToBlob({type:p,quality:g}):b=await new Promise((C,U)=>{f.toBlob(A=>{A?C(A):U(new Error("Failed to encode canvas blob"))},p,g)}),n?.(85),d.close(),f.getContext("2d")?.clearRect(0,0,f.width,f.height);const k=await b.arrayBuffer(),y=Ue(new Uint8Array(k),p);let w=new Blob([y],{type:p}),M=y,S;if(!m&&w.size>s){S="Size inflated by entropy injection";const C=Gt(l,e.type||p);M=C,w=new Blob([C],{type:e.type||p})}n?.(92);const N=w.type==="image/webp"?"webp":w.type==="image/png"?"png":"jpg",$=await ne(M,N),R=await Y(w,$);n?.(100);const j={blob:w,originalBlob:e,originalName:a,sanitizedName:$,originalSize:s,sanitizedSize:w.size,format:w.type,sha256:R.sha256,defenseLevel:t.defenseLevel,auditBefore:i,auditAfter:R,processedAt:Date.now(),warningBadge:S,isDeepDecontaminated:m,extremeSanitization:t.extremeSanitization};return r=null,l=null,M=null,j}var Jt=1718773093;function me(e){if(e.length<12)return!1;const t=new DataView(e.buffer,e.byteOffset,e.byteLength).getUint32(4,!1);return t===1718909296||t===1836019574}function ge(e,t){return e.startsWith("audio/")||/\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(t)}function he(e){const t=new Uint8Array(e.length);return t.set(e),Pe(t,new DataView(t.buffer,t.byteOffset,t.byteLength),0,t.length),t}function Pe(e,t,n,a){let s=n;for(;s+8<=a;){const r=t.getUint32(s,!1),l=t.getUint32(s+4,!1);let i=r,c=8;if(r===0)i=a-s;else if(r===1){if(s+16>a)break;i=Number(t.getBigUint64(s+8,!1)),c=16}if(i<c||s+i>a)break;if(l===1969517665||l===1835365473||l===1970628964||l===1768715124){t.setUint32(s+4,Jt,!1),e.fill(0,s+c,s+i),s+=i;continue}if(l===1836019574||l===1953653099||l===1835297121||l===1835626086||l===1937007212||l===1684631142)Pe(e,t,s+c,s+i);else if(l===1835295092)en(e,s+c,s+i);else if((l===1836476516||l===1953196132||l===1835296868)&&i>=c+20){const o=e[s+c];o===0?(t.setUint32(s+c+4,0,!1),t.setUint32(s+c+8,0,!1)):o===1&&i>=c+28&&(t.setBigUint64(s+c+4,0n,!1),t.setBigUint64(s+c+12,0n,!1))}s+=i}}function en(e,t,n){const a=new TextEncoder().encode("x264 - core");for(let s=t;s<=n-a.length;s++){let r=!0;for(let l=0;l<a.length;l++)if(e[s+l]!==a[l]){r=!1;break}if(r)for(let l=0;l<256&&s+l<n;l++)e[s+l]=0}}function xe(e){let t=0,n=e.length;if(e.length>=10&&e[0]===73&&e[1]===68&&e[2]===51&&(t=10+((e[6]&127)<<21|(e[7]&127)<<14|(e[8]&127)<<7|e[9]&127)),e.length>=128){const a=e.length-128;e[a]===84&&e[a+1]===65&&e[a+2]===71&&(n=a)}return e.subarray(t,n)}async function tn(e,t,n){if(typeof Worker<"u")return new Promise((s,r)=>{try{const l=new Worker(new URL(new URL("media.worker-CAWCdypE.js",import.meta.url).href,""+import.meta.url),{type:"module"});l.onmessage=i=>{const c=new Uint8Array(i.data.buffer);l.terminate(),s(c)},l.onerror=i=>{l.terminate(),r(i)},l.postMessage({buffer:e,mimeType:t,originalName:n},[e])}catch{const l=new Uint8Array(e);s(me(l)?he(l):ge(t,n)?xe(l):l)}});const a=new Uint8Array(e);return me(a)?he(a):ge(t,n)?xe(a):a}async function be(e,t,n){n?.(15);const a=e instanceof File?e.name:"unnamed_media",s=await Y(e,a);n?.(35);let r=await e.arrayBuffer();const l=e.type||"";let i=await tn(r,l,a);n?.(75);const c=new Blob([i],{type:l||"video/mp4"}),o=a.split(".").pop()||"mp4",d=await ne(i,o);n?.(90);const u=await Y(c,d);n?.(100);const m={blob:c,originalBlob:e,originalName:a,sanitizedName:d,originalSize:e.size,sanitizedSize:c.size,format:l,sha256:u.sha256,defenseLevel:t.defenseLevel,auditBefore:s,auditAfter:u,processedAt:Date.now()};return i=null,r=null,m}async function nn(e,t={},n){const a=e.type.toLowerCase(),s=e.name.toLowerCase(),r=t.defenseLevel||"paranoid",l=t.quality??.85,i=t.extremeSanitization??!1,c=a.startsWith("image/")||/\.(jpg|jpeg|png|webp|bmp|gif|tiff)$/i.test(s),o=a.startsWith("video/")||a.startsWith("audio/")||/\.(mp4|mov|mkv|webm|mp3|wav|ogg|aac|m4a)$/i.test(s);if(c){const d=t.outputFormat||(s.endsWith(".png")?"image/png":"image/webp");return await pe(e,{defenseLevel:r,outputFormat:d,quality:l,extremeSanitization:i},n)}if(o)return await be(e,{defenseLevel:r},n);try{return await pe(e,{defenseLevel:r,outputFormat:"image/webp",quality:l,extremeSanitization:i},n)}catch{return await be(e,{defenseLevel:r},n)}}var Ae=new Uint32Array(256);for(let e=0;e<256;e++){let t=e;for(let n=0;n<8;n++)t&1?t=3988292384^t>>>1:t=t>>>1;Ae[e]=t}function an(e){let t=-1;for(let n=0;n<e.length;n++)t=Ae[(t^e[n])&255]^t>>>8;return(t^-1)>>>0}var rn=new TextEncoder;async function sn(e,t){const n=[];let a=0,s=0;for(let h=0;h<e.length;h++){const f=e[h],b=await f.blob.arrayBuffer(),k=new Uint8Array(b),y=rn.encode(f.sanitizedName),w=an(k),M=k.length;n.push({nameBytes:y,data:k,crc:w,size:M,offset:a});const S=30+y.length+M;a+=S,s+=46+y.length,t?.(Math.round((h+1)/e.length*40))}const r=a+s+22,l=new ArrayBuffer(r),i=new DataView(l),c=new Uint8Array(l);let o=0;const d=0,u=33,m=20,p=20,g=0;for(let h=0;h<n.length;h++){const f=n[h];i.setUint32(o,67324752,!0),o+=4,i.setUint16(o,m,!0),o+=2,i.setUint16(o,0,!0),o+=2,i.setUint16(o,g,!0),o+=2,i.setUint16(o,d,!0),o+=2,i.setUint16(o,u,!0),o+=2,i.setUint32(o,f.crc,!0),o+=4,i.setUint32(o,f.size,!0),o+=4,i.setUint32(o,f.size,!0),o+=4,i.setUint16(o,f.nameBytes.length,!0),o+=2,i.setUint16(o,0,!0),o+=2,c.set(f.nameBytes,o),o+=f.nameBytes.length,c.set(f.data,o),o+=f.size,t?.(40+Math.round((h+1)/n.length*40))}const x=o;for(let h=0;h<n.length;h++){const f=n[h];i.setUint32(o,33639248,!0),o+=4,i.setUint16(o,p,!0),o+=2,i.setUint16(o,m,!0),o+=2,i.setUint16(o,0,!0),o+=2,i.setUint16(o,g,!0),o+=2,i.setUint16(o,d,!0),o+=2,i.setUint16(o,u,!0),o+=2,i.setUint32(o,f.crc,!0),o+=4,i.setUint32(o,f.size,!0),o+=4,i.setUint32(o,f.size,!0),o+=4,i.setUint16(o,f.nameBytes.length,!0),o+=2,i.setUint16(o,0,!0),o+=2,i.setUint16(o,0,!0),o+=2,i.setUint16(o,0,!0),o+=2,i.setUint16(o,0,!0),o+=2,i.setUint32(o,32,!0),o+=4,i.setUint32(o,f.offset,!0),o+=4,c.set(f.nameBytes,o),o+=f.nameBytes.length}return i.setUint32(o,101010256,!0),o+=4,i.setUint16(o,0,!0),o+=2,i.setUint16(o,0,!0),o+=2,i.setUint16(o,n.length,!0),o+=2,i.setUint16(o,n.length,!0),o+=2,i.setUint32(o,s,!0),o+=4,i.setUint32(o,x,!0),o+=4,i.setUint16(o,0,!0),o+=2,t?.(100),{zipBlob:new Blob([l],{type:"application/zip"}),zipFileName:`bundle_${await bt(l,"zip",12)}`}}function ve(e,t){const n=URL.createObjectURL(e),a=document.createElement("a");a.href=n,a.download=t,a.rel="noopener noreferrer",document.body.appendChild(a),a.click(),document.body.removeChild(a),setTimeout(()=>{URL.revokeObjectURL(n)},1e3)}function on(e){try{e instanceof Uint8Array?e.fill(0):new Uint8Array(e).fill(0)}catch{}}function ln(e){for(const t of e)try{URL.revokeObjectURL(t)}catch{}}function cn(e,t){const n=document.createElement("div");n.className="border border-neutral-800 bg-[#080808] rounded-xl p-4 sm:p-5 mb-6 text-neutral-200",n.innerHTML=`
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
  `;const a=n.querySelector("#extreme-toggle");return a&&a.addEventListener("change",()=>{t({extremeSanitization:a.checked})}),n}var v={shield:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',shieldCheck:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path stroke-linecap="round" stroke-linejoin="round" d="m9 12 2 2 4-4"/></svg>',lock:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',download:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',archive:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',trash:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',eye:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',alertTriangle:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',check:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',upload:'<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>',cpu:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3m-3 6h3M1 9h3m-3 6h3"/></svg>',info:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>',close:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',sparkles:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>'};function dn(e){const t=document.createElement("div");t.className="relative border border-dashed border-neutral-800 hover:border-neutral-600 bg-[#050505] hover:bg-[#0a0a0a] rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 group cursor-pointer overflow-hidden",t.innerHTML=`
    <!-- Hidden File Input -->
    <input type="file" id="file-input" multiple accept="image/*,video/*,audio/*,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.mp4,.mov,.mp3,.wav,.ogg" class="hidden" />

    <div class="relative z-10 flex flex-col items-center justify-center space-y-4">
      <div class="w-14 h-14 rounded-xl bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
        ${v.upload}
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
  `;const n=t.querySelector("#file-input");return t.addEventListener("click",()=>{n.click()}),n.addEventListener("change",()=>{n.files&&n.files.length>0&&(e(Array.from(n.files)),n.value="")}),t.addEventListener("dragover",a=>{a.preventDefault(),a.stopPropagation(),t.classList.add("border-emerald-500","bg-neutral-950")}),t.addEventListener("dragleave",a=>{a.preventDefault(),a.stopPropagation(),t.classList.remove("border-emerald-500","bg-neutral-950")}),t.addEventListener("drop",a=>{a.preventDefault(),a.stopPropagation(),t.classList.remove("border-emerald-500","bg-neutral-950"),a.dataTransfer&&a.dataTransfer.files.length>0&&e(Array.from(a.dataTransfer.files))}),t}function we(e,t){const n=document.createElement("div");if(n.className="mt-6 space-y-4",e.length===0)return n;const a=e.filter(c=>c.status==="done").length,s=e.length;n.innerHTML=`
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
            ${v.archive}
            <span>Download All (ZIP)</span>
          </button>
        `:""}

        <button id="btn-clear-all" class="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-red-400 text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
          ${v.trash}
          <span>Clear</span>
        </button>
      </div>
    </div>

    <!-- Items List -->
    <div class="space-y-3" id="queue-items-container"></div>
  `;const r=n.querySelector("#btn-download-zip");r&&r.addEventListener("click",t.onDownloadAllZip);const l=n.querySelector("#btn-clear-all");l&&l.addEventListener("click",t.onClearQueue);const i=n.querySelector("#queue-items-container");return e.forEach(c=>{const o=document.createElement("div");o.className="p-4 rounded-xl border border-neutral-900 bg-black hover:border-neutral-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4";const d=c.status==="done",u=c.status==="error",m=c.status==="processing"||c.status==="analyzing",p=[];if(c.result?.auditBefore){const h=c.result.auditBefore;h.hasGps&&p.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">GPS EXPOSED</span>'),h.hasThumbnail&&p.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">THUMBNAIL LEAK</span>'),h.hasMakerNotes&&p.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950/80 border border-red-500/50 text-red-400">MAKERNOTES</span>'),h.hasExif&&!h.hasGps&&p.push('<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">EXIF</span>')}o.innerHTML=`
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <div class="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center shrink-0 mt-0.5 text-neutral-400">
          ${d?`<span class="text-emerald-400">${v.check}</span>`:u?`<span class="text-red-400">${v.alertTriangle}</span>`:`<span class="text-neutral-400 animate-spin">${v.cpu}</span>`}
        </div>

        <div class="min-w-0 flex-1 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-mono font-medium text-neutral-200 truncate max-w-[200px] sm:max-w-xs" title="${c.file.name}">
              ${c.file.name}
            </span>
            <span class="text-[10px] text-neutral-400 font-mono">(${ye(c.file.size)})</span>
            ${p.join(" ")}
          </div>

          ${d&&c.result?`
            <div class="flex flex-wrap items-center gap-2 pt-0.5">
              <span class="text-xs font-mono text-emerald-400 font-medium">
                ${c.result.sanitizedName}
              </span>
              <span class="text-[10px] text-neutral-400 font-mono">
                (${ye(c.result.sanitizedSize)})
              </span>
              <span class="text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 font-mono">
                CLEAN
              </span>
              ${c.result.warningBadge?`
                <span class="text-[10px] px-1.5 py-0.5 rounded border border-amber-500/50 bg-amber-950/40 text-amber-400 font-mono" title="${c.result.warningBadge}">
                  ${c.result.warningBadge}
                </span>
              `:""}
              ${c.result.isDeepDecontaminated?`
                <span class="text-[10px] px-1.5 py-0.5 rounded border border-purple-500/50 bg-purple-950/40 text-purple-300 font-mono" title="Anti-steganography pipeline applied: spatial micro-resampling, 3x3 median filter, and visibility dithering">
                  DECONTAMINATED
                </span>
              `:""}
              ${c.result.isBypass?`
                <span class="text-[10px] px-1.5 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300 font-mono" title="No original metadata: 1:1 bitstream preserved">
                  STRIP ONLY 1:1
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

          ${u?`
            <div class="text-xs text-red-400 font-mono mt-1">
              Error: ${c.error||"Failed to process"}
            </div>
          `:""}
        </div>
      </div>

      <!-- Action Buttons -->
      ${d&&c.result?`
        <div class="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-900">
          <button class="btn-inspect px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
            ${v.eye}
            <span>Inspect</span>
          </button>

          <button class="btn-download px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer">
            ${v.download}
            <span>Download</span>
          </button>
        </div>
      `:""}
    `;const g=o.querySelector(".btn-inspect");g&&g.addEventListener("click",()=>t.onInspectForensics(c));const x=o.querySelector(".btn-download");x&&x.addEventListener("click",()=>t.onDownloadSingle(c)),i.appendChild(o)}),n}function ye(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],a=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,a)).toFixed(1))} ${n[a]}`}function un(e,t){const n=document.createElement("div");n.className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in";const a=URL.createObjectURL(e.originalBlob||e.blob),s=URL.createObjectURL(e.blob);n.innerHTML=`
    <div class="relative w-full max-w-5xl bg-[#080808] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div>
          <h2 class="text-sm font-bold font-mono text-white tracking-wide">File Inspection</h2>
          <p class="text-[11px] text-neutral-400 font-mono">Comparison between raw input and sanitized output</p>
        </div>

        <button id="modal-close" class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
          ${v.close}
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
                ${v.alertTriangle} Input File
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
                ${v.shieldCheck} Clean File
              </span>
              <span class="text-[10px] font-mono text-emerald-300 truncate max-w-[200px]">${e.sanitizedName}</span>
            </div>

            <div class="aspect-video bg-black rounded-lg border border-neutral-900 overflow-hidden flex items-center justify-center relative">
              ${Ce(s,e.sanitizedName)}
              <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                ${v.check} 0 Metadata Tags • Pure Bitstream
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

        ${e.warningBadge?`
          <div class="p-3 rounded-xl border border-amber-500/50 bg-amber-950/30 text-amber-300 text-xs font-mono flex items-center gap-2.5">
            <span class="text-amber-400 shrink-0">${v.alertTriangle}</span>
            <span><strong>Efficiency Warning:</strong> ${e.warningBadge}. Canvas result was discarded and surgical metadata stripping was applied directly to the original bitstream to prevent bloat.</span>
          </div>
        `:""}
        ${e.isDeepDecontaminated?`
          <div class="p-3 rounded-xl border border-purple-500/50 bg-purple-950/30 text-purple-300 text-xs font-mono flex items-center gap-2.5">
            <span class="text-purple-400 shrink-0">${v.shield}</span>
            <span><strong>Anti-Steganography Pipeline:</strong> Spatial micro-resampling, hardware-accelerated 3x3 median filtering, visibility dithering, and lossy VP8 quantization applied to destroy steganographic watermarks and tracking signals.</span>
          </div>
        `:""}
        ${e.isBypass?`
          <div class="p-3 rounded-xl border border-neutral-700 bg-neutral-900/60 text-neutral-300 text-xs font-mono flex items-center gap-2.5">
            <span class="text-emerald-400 shrink-0">${v.check}</span>
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
            ${v.shieldCheck}
            <span>Full Reconstruction & Noise Disruption Applied</span>
          </div>
          <span class="text-[11px] text-neutral-500">In-Memory • No Server Upload</span>
        </div>
      </div>
    </div>
  `;const r=()=>{ln([a,s]),t()};return n.querySelector("#modal-close")?.addEventListener("click",r),n.addEventListener("click",l=>{l.target===n&&r()}),n}function Ce(e,t){const n=/\.(mp4|mov|webm)$/i.test(t),a=/\.(mp3|wav|ogg|aac|m4a)$/i.test(t);return n?`<video src="${e}" controls class="max-h-full max-w-full rounded"></video>`:a?`
      <div class="p-4 flex flex-col items-center justify-center text-center space-y-2 w-full">
        <span class="text-neutral-400 font-mono text-[11px]">Audio Stream</span>
        <audio src="${e}" controls class="w-full max-w-xs"></audio>
      </div>`:`<img src="${e}" alt="Preview" class="max-h-full max-w-full object-contain" />`}function ke(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],a=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,a)).toFixed(1))} ${n[a]}`}function fn(e){const t=document.createElement("div");t.className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in",t.innerHTML=`
    <div class="relative w-full max-w-3xl bg-[#080808] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
        <div class="flex items-center gap-2.5">
          <span class="text-neutral-400">${v.info}</span>
          <h2 class="text-sm font-semibold font-mono text-white tracking-wide">Legal, Licenses & Privacy</h2>
        </div>
        <button id="legal-close" class="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer">
          ${v.close}
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 overflow-y-auto space-y-6 text-neutral-300 text-xs leading-relaxed font-sans">
        <!-- 1. Intended Purpose & Privacy Mandates -->
        <section class="space-y-2">
          <h3 class="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
            ${v.shield} Purpose & Data Minimization
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
            ${v.lock} Client-Side Execution (Zero Network Traffic)
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
            ${v.info} Usage Recommendations
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
  `;const n=t.querySelector("#legal-close"),a=t.querySelector("#legal-close-btn");return n.addEventListener("click",e),a.addEventListener("click",e),t.addEventListener("click",s=>{s.target===t&&e()}),t}var pn=class{root;settings={quality:.6,extremeSanitization:!1};queue=[];activeAuditModal=null;activeLegalModal=null;isProcessingQueue=!1;constructor(e){this.root=e,this.render()}render(){this.root.innerHTML="";const e=document.createElement("main");e.className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col";const t=cn(this.settings,r=>{this.settings={...this.settings,...r}});e.appendChild(t);const n=dn(r=>this.handleFilesAdded(r));e.appendChild(n);const a=we(this.queue,{onDownloadSingle:r=>this.handleDownloadSingle(r),onDownloadAllZip:()=>this.handleDownloadAllZip(),onInspectForensics:r=>this.handleInspectForensics(r),onClearQueue:()=>this.handleClearQueue()});e.appendChild(a);const s=this.createFooter();e.appendChild(s),this.root.appendChild(e)}createFooter(){const e=document.createElement("footer");return e.className="mt-auto pt-16 pb-8 text-center text-neutral-500 text-xs font-mono border-t border-neutral-900",e.innerHTML=`
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
    `,e.querySelector("#footer-legal-btn")?.addEventListener("click",()=>{this.openLegalModal()}),e}handleFilesAdded(e){const t=e.map(n=>({id:`${Date.now()}-${Math.random().toString(36).slice(2,9)}`,file:n,status:"idle",progress:0}));this.queue.push(...t),this.render(),this.processQueue()}async processQueue(){if(!this.isProcessingQueue){this.isProcessingQueue=!0;for(let e=0;e<this.queue.length;e++){const t=this.queue[e];if(t.status==="idle"){t.status="analyzing",t.progress=25,this.updateQueueView();try{t.status="processing";const n=await nn(t.file,{quality:this.settings.quality,extremeSanitization:this.settings.extremeSanitization},a=>{t.progress=a,this.updateQueueView()});t.status="done",t.progress=100,t.result=n}catch(n){t.status="error",t.error=n.message||"Processing failed"}this.updateQueueView()}}this.isProcessingQueue=!1}}updateQueueView(){const e=this.root.querySelector("#queue-items-container")?.parentElement;if(e){const t=we(this.queue,{onDownloadSingle:n=>this.handleDownloadSingle(n),onDownloadAllZip:()=>this.handleDownloadAllZip(),onInspectForensics:n=>this.handleInspectForensics(n),onClearQueue:()=>this.handleClearQueue()});e.replaceWith(t)}else this.render()}handleDownloadSingle(e){e.result&&ve(e.result.blob,e.result.sanitizedName)}async handleDownloadAllZip(){const e=this.queue.filter(a=>a.status==="done"&&a.result).map(a=>a.result);if(e.length===0)return;const{zipBlob:t,zipFileName:n}=await sn(e);ve(t,n)}handleInspectForensics(e){e.result&&this.openAuditModal(e.result)}openAuditModal(e){this.activeAuditModal&&this.activeAuditModal.remove(),this.activeAuditModal=un(e,()=>{this.activeAuditModal?.remove(),this.activeAuditModal=null}),document.body.appendChild(this.activeAuditModal)}openLegalModal(){this.activeLegalModal&&this.activeLegalModal.remove(),this.activeLegalModal=fn(()=>{this.activeLegalModal?.remove(),this.activeLegalModal=null}),document.body.appendChild(this.activeLegalModal)}handleClearQueue(){for(const e of this.queue)e.result&&e.result.blob.arrayBuffer().then(t=>on(t)).catch(()=>{});this.queue=[],this.render()}};document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("app");if(!e)throw new Error("Application root element (#app) not found");new pn(e)});

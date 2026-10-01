(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const c of i.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function n(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(a){if(a.ep)return;a.ep=!0;const i=n(a);fetch(a.href,i)}})();var We=1229472850,qe=1347179589,Qe=1229209940,Ye=1229278788,Ze=1700284774,Ke=1950701684,Je=2052348020,et=1767135348,tt=1950960965,nt=1883789683,st=1766015824,it=1665684045,ot=1732332865,at=1934772034,rt=1448097824,ct=1448097868,lt=1448097880,ft=1095649613,dt=1095650630,ut=1163413830,pt=1481461792,mt=1229144912,ht=1095520328,Ue=1969517665,Ae=1835365473,Ie=1768715124,Me=1970628964;function Ft(e){const t=new Uint8Array(e),n=[];if(t.length<4)return n;const s=new DataView(e);return t[0]===255&&t[1]===216?gt(t):s.getUint32(0,!1)===2303741511?vt(t,s):s.getUint32(0,!1)===1380533830&&t.length>=12&&s.getUint32(8,!1)===1464156752?xt(t,s):t.length>12&&s.getUint32(4,!1)===1718909296?wt(t,s):n}function gt(e){const t=[];t.push({offset:0,marker:"0xFFD8",name:"SOI (Start of Image)",isSanitizedSafe:!0,description:"Mandatory standard JPEG boundary marker"});let n=2;const s=e.length;for(;n<s-1;){if(e[n]!==255){n++;continue}const a=e[n+1];if(a===255||a===0){n++;continue}const i="0xFF"+a.toString(16).toUpperCase().padStart(2,"0");if(a===217){t.push({offset:n,marker:i,name:"EOI (End of Image)",isSanitizedSafe:!0,description:"End of image data stream"});break}if(a===218){for(t.push({offset:n,marker:i,name:"SOS (Start of Scan)",isSanitizedSafe:!0,description:"Compressed image pixel bitstream follows"}),n+=2;n<s-1&&!(e[n]===255&&e[n+1]!==0&&e[n+1]<=217);)n++;continue}if(n+3>=s)break;const c=e[n+2]<<8|e[n+3];let r=`Segment (${i})`,l=!1,o="";switch(a){case 224:r="APP0 (JFIF Header)",l=!0,o="Basic JPEG container identification";break;case 225:e[n+4]===69&&e[n+5]===120&&e[n+6]===105&&e[n+7]===102?(r="APP1 (EXIF / GPS / IFD1 Thumbnail)",l=!1,o="High risk: contains camera serials, timestamps, GPS, and thumbnail traps"):(r="APP1 (Metadata/XMP)",l=!1,o="Contains edit history, instance IDs, or XMP packets");break;case 226:r="APP2 (ICC Color Profile)",l=!1,o="Contains OS calibration profile or author system identifiers";break;case 237:r="APP13 (Photoshop / IPTC)",l=!1,o="Contains bylines, captions, and Photoshop edit records";break;case 238:r="APP14 (Adobe DCT)",l=!1,o="Adobe color transform marker";break;case 219:r="DQT (Quantization Table)",l=!0,o="Quantization matrix; forensic fingerprint of ISP encoder";break;case 196:r="DHT (Huffman Table)",l=!0,o="Entropy encoding frequency table";break;case 192:case 194:r=`SOF (Start of Frame - ${a===192?"Baseline":"Progressive"})`,l=!0,o="Image dimensions, bit depth, and color components";break;case 254:r="COM (Comment)",l=!1,o="Text comment embedded in image";break;default:a>=227&&a<=239&&(r=`APP${a-224} (Vendor Marker)`,l=!1,o="Proprietary camera or software metadata block")}t.push({offset:n,marker:i,name:r,length:c,isSanitizedSafe:l,description:o}),n+=2+c}return t}function vt(e,t){const n=[];let s=8;const a=t.byteLength;for(;s+8<=a;){const i=t.getUint32(s,!1),c=t.getUint32(s+4,!1);let r=!1,l="Image raster data or standard header",o="UNKNOWN";switch(c){case We:r=!0,o="IHDR",l="Header: Dimensions, depth, color type";break;case qe:r=!0,o="PLTE",l="Palette table";break;case Qe:r=!0,o="IDAT",l="Compressed image pixel data";break;case Ye:r=!0,o="IEND",l="End of PNG image";break;case Ze:r=!1,o="eXIf",l="Embedded raw EXIF metadata block";break;case Ke:r=!1,o="tEXt",l="Textual metadata (Creation time, software, author)";break;case Je:r=!1,o="zTXt",l="Compressed textual metadata";break;case et:r=!1,o="iTXt",l="Internationalized UTF-8 metadata";break;case tt:r=!1,o="tIME",l="Modification timestamp";break;case nt:r=!1,o="pHYs",l="Physical pixel dimensions / DPI";break;case st:r=!1,o="iCCP",l="Embedded ICC Color Profile / Display calibration fingerprint";break;case it:r=!1,o="cHRM",l="Primary chromaticities display calibration";break;case ot:r=!1,o="gAMA",l="Image gamma correction curve";break;case at:r=!0,o="sRGB",l="Standard sRGB color space rendering intent";break;default:o="CHUNK",r=!1}n.push({offset:s,marker:o,name:`Chunk: ${o}`,length:i,isSanitizedSafe:r,description:l}),s+=12+i}return n}function xt(e,t){const n=[];let s=12;const a=t.byteLength;for(;s+8<=a;){const i=t.getUint32(s,!1),c=t.getUint32(s+4,!0);let r=!1,l="Visual raster bitstream",o="WEBP";switch(i){case rt:o="VP8",r=!0;break;case ct:o="VP8L",r=!0;break;case lt:o="VP8X",r=!0;break;case ft:o="ANIM",r=!0;break;case dt:o="ANMF",r=!0;break;case ut:o="EXIF",r=!1,l="Embedded EXIF metadata block";break;case pt:o="XMP",r=!1,l="Embedded XMP metadata block";break;case mt:o="ICCP",r=!1,l="ICC Color Profile";break;case ht:o="ALPH",r=!0,l="Alpha transparency channel for reconstructed pixels";break;default:o="CHUNK",r=!1}n.push({offset:s,marker:o,name:`WebP Chunk: ${o}`,length:c,isSanitizedSafe:r,description:l});const u=c+c%2;s+=8+u}return n}function wt(e,t){const n=[];let s=0;const a=t.byteLength;for(;s+8<=a;){const i=t.getUint32(s,!1),c=t.getUint32(s+4,!1);if(i<8&&i!==0)break;const r=c===Ue||c===Ae||c===Ie||c===Me;let l="BOX",o="Video/Audio container structure";switch(c){case Ue:l="udta",o="User Data box (stores GPS, camera model, author)";break;case Ae:l="meta",o="Metadata box (tags, encoder settings)";break;case Ie:l="ilst",o="Item List atom (QuickTime/iTunes metadata)";break;case Me:l="uuid",o="Vendor proprietary custom box";break;case 1718909296:l="ftyp";break;case 1836019574:l="moov";break;case 1835295092:l="mdat";break;default:l="atom"}if(n.push({offset:s,marker:l,name:`Box: ${l}`,length:i,isSanitizedSafe:!r,description:o}),i===0||s+i>a)break;s+=i}return n}async function Ne(e){const t=e instanceof Uint8Array?e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength):e,n=await crypto.subtle.digest("SHA-256",t);return Array.from(new Uint8Array(n)).map(s=>s.toString(16).padStart(2,"0")).join("")}function yt(e){const t=e.match(/\.([a-zA-Z0-9]+)$/);return(t?t[1]:e).replace(/[^a-zA-Z0-9]/g,"").toLowerCase()||"webp"}async function Ee(e,t,n=32){return`${(await Ne(e)).slice(0,n)}.${yt(t)}`}var bt=Ee;async function we(e,t){const n=await e.arrayBuffer(),s=new Uint8Array(n),a=[],i=Ft(n);let c=!1,r=!1,l=!1,o=!1;const u=Ct(s);if(u!==-1){c=!0;const g=new DataView(n,u),C=g.getUint16(0)===18761;try{const w=g.getUint32(4,C);if(w<s.length){const F=xe(g,w,C,"IFD0");if(a.push(...F.tags),F.gpsPointer){r=!0;const y=xe(g,F.gpsPointer,C,"GPS");a.push(...y.tags)}if(F.exifPointer){const y=xe(g,F.exifPointer,C,"EXIF");a.push(...y.tags),y.hasMakerNotes&&(o=!0)}if(F.nextIfdOffset&&F.nextIfdOffset!==0){l=!0;const y=xe(g,F.nextIfdOffset,C,"IFD1");a.push({category:"IFD1_Thumbnail",name:"IFD1 Embedded Thumbnail",value:`Embedded image preview found at offset ${F.nextIfdOffset}`,severity:"critical",description:"Embedded unedited thumbnail: major forensic leak vector."}),a.push(...y.tags)}}}catch{a.push({category:"EXIF",name:"Malformed EXIF Header",value:"Header parsing failed",severity:"medium"})}}const h=Ut(s);h.length>0&&a.push(...h),i.some(g=>g.name.includes("ICC")||g.marker==="ICCP")&&a.push({category:"ICC",name:"ICC Color Profile",value:"Color management profile present (hardware/software calibration)",severity:"medium",description:"Can identify operating system or monitor calibration profile."});const x=await Ne(n),v=c||o?"high":i.length>5?"moderate":"low";return{fileName:t||(e instanceof File?e.name:"unnamed_media"),fileSize:e.size,mimeType:e.type||"application/octet-stream",hasExif:c,hasGps:r,hasThumbnail:l,hasMakerNotes:o,tags:a,markers:i,prnuSusceptibility:v,sha256:x}}function Ct(e){if(e.length>=8&&(e[0]===73&&e[1]===73&&e[2]===42&&e[3]===0||e[0]===77&&e[1]===77&&e[2]===0&&e[3]===42))return 0;for(let t=0;t<Math.min(e.length-10,65536);t++)if(e[t]===255&&e[t+1]===225&&e[t+4]===69&&e[t+5]===120&&e[t+6]===105&&e[t+7]===102&&e[t+8]===0&&e[t+9]===0)return t+10;for(let t=12;t<Math.min(e.length-8,65536);t++)if(e[t]===69&&e[t+1]===88&&e[t+2]===73&&e[t+3]===70)return t+8;return-1}function xe(e,t,n,s){const a={tags:[]};if(t+2>=e.byteLength)return a;const i=e.getUint16(t,n);let c=t+2;for(let r=0;r<i&&!(c+12>e.byteLength);r++){const l=e.getUint16(c,n),o=e.getUint16(c+2,n),u=e.getUint32(c+4,n),h=c+8;let x="";if(l===34665&&s==="IFD0")a.exifPointer=e.getUint32(h,n);else if(l===34853&&s==="IFD0")a.gpsPointer=e.getUint32(h,n);else if(l===37500)a.hasMakerNotes=!0,a.tags.push({category:"MakerNotes",name:"Proprietary MakerNotes",value:`${u} bytes of camera-specific binary telemetry`,severity:"critical",description:"Manufacturer proprietary block containing sensor temperatures, lens serials, or face biometric coordinates."});else{const v=kt(l,s);v&&(o===2?x=Et(e,h,u,n):o===3?x=e.getUint16(h,n).toString():o===4?x=e.getUint32(h,n).toString():x=`[${u} items]`,x.trim()&&a.tags.push({category:s==="GPS"?"GPS":s==="IFD1"?"IFD1_Thumbnail":"EXIF",name:v.name,value:x.trim(),severity:v.severity,description:v.description}))}c+=12}return c+4<=e.byteLength&&(a.nextIfdOffset=e.getUint32(c,n)),a}function kt(e,t){if(t==="GPS")switch(e){case 1:return{name:"GPS Latitude Ref",severity:"critical",description:"North/South coordinate hemisphere"};case 2:return{name:"GPS Latitude",severity:"critical",description:"Precise GPS latitude coordinates"};case 3:return{name:"GPS Longitude Ref",severity:"critical",description:"East/West coordinate hemisphere"};case 4:return{name:"GPS Longitude",severity:"critical",description:"Precise GPS longitude coordinates"};case 6:return{name:"GPS Altitude",severity:"critical",description:"Elevation above sea level"};case 7:return{name:"GPS TimeStamp",severity:"critical",description:"Atomic satellite UTC timestamp"};case 29:return{name:"GPS DateStamp",severity:"critical",description:"Satellite GPS date"}}switch(e){case 271:return{name:"Camera Manufacturer (Make)",severity:"high",description:"Brand of camera or smartphone"};case 272:return{name:"Camera Model",severity:"critical",description:"Exact phone or camera hardware model"};case 305:return{name:"Software / OS Version",severity:"high",description:"Firmware or operating system build"};case 306:return{name:"Modify Date / Time",severity:"high",description:"Modification timestamp"};case 36867:return{name:"Date / Time Original",severity:"critical",description:"Exact moment the shutter was pressed"};case 36868:return{name:"Date / Time Digitized",severity:"critical",description:"Sensor analog-to-digital timestamp"};case 42033:return{name:"Camera Body Serial Number",severity:"critical",description:"Hardware unique serial number"};case 42036:return{name:"Lens Model",severity:"high",description:"Optical lens specifications"};case 42016:return{name:"Image Unique ID",severity:"critical",description:"Unique cryptographic ID generated by ISP"};case 513:return{name:"Thumbnail Offset",severity:"critical",description:"Pointer to raw thumbnail stream"};case 514:return{name:"Thumbnail Length",severity:"critical",description:"Byte length of embedded thumbnail"};default:return null}}function Et(e,t,n,s){let a=t;if(n>4&&(a=e.getUint32(t,s)),a+n>e.byteLength)return"";let i="";for(let c=0;c<n;c++){const r=e.getUint8(a+c);if(r===0)break;i+=String.fromCharCode(r)}return i}function Ut(e){const t=[],n=Math.min(e.length-20,2e5),s="<?xpacket begin";for(let a=0;a<n;a++)if(e[a]===60&&e[a+1]===63&&String.fromCharCode(...e.slice(a,a+15))===s){t.push({category:"XMP",name:"Adobe XMP Metadata Packet",value:"XMP Packet detected",severity:"critical",description:"Contains edit history, Photoshop/Lightroom instance IDs, and original document UUIDs."});break}return t}function At(e,t=!1){if(e==="standard")return{theta:0,sx:1,sy:1,noiseIntensity:0};const n=new Uint32Array(3);crypto.getRandomValues(n);const s=.1+n[0]/4294967295*.2,a=(n[0]%2===0?1:-1)*(s*Math.PI)/180,i=.995+n[1]/4294967295*.004;let c=.995+n[2]/4294967295*.004;return i-c>-5e-4&&i-c<5e-4&&(c=i<.997?i+6e-4:i-6e-4),{theta:a,sx:i,sy:c,noiseIntensity:t?0:2}}function J(e){const t=e<0?-e:e;return t<1?t*t*(1.5*t-2.5)+1:t<2?t*t*(-.5*t+2.5)-4*t+2:0}function It(e,t,n,s=!0,a=!1){const i=e.width,c=e.height;if(n==="standard"){t.width=i,t.height=c,t.getContext("2d",{willReadFrequently:!0,alpha:s}).drawImage(e,0,0);return}const r=At(n,a),l=new OffscreenCanvas(i,c).getContext("2d",{willReadFrequently:!0});l.drawImage(e,0,0);const o=l.getImageData(0,0,i,c),u=new Uint32Array(o.data.buffer),h=3,x=i-6,v=c-6;t.width=x,t.height=v;const g=t.getContext("2d",{willReadFrequently:!0,alpha:s}),C=g.createImageData(x,v),w=new Uint32Array(C.data.buffer),F=Math.cos(r.theta),y=Math.sin(r.theta),k=r.sx*F,A=-r.sy*y,T=r.sx*y,R=r.sy*F,E=k*R-A*T,B=R/E,L=-A/E,b=-T/E,U=k/E,D=i*.5,$=c*.5,W=new Uint32Array(1);crypto.getRandomValues(W);let G=W[0]||305419896;const V=c-1,j=i-1;let te=0;const ne=r.noiseIntensity>0;for(let I=0;I<v;I++){const S=I+h-$,P=-D+h;let M=P*B+S*L+D,ie=P*b+S*U+$;for(let le=0;le<x;le++){const H=Math.floor(M),X=Math.floor(ie),f=M-H,d=ie-X,Q=J(f+1),Y=J(f),Z=J(f-1),K=J(f-2),oe=J(d+1),ae=J(d),re=J(d-1),ce=J(d-2),fe=(X-1<0?0:X-1>V?V:X-1)*i,de=(X<0?0:X>V?V:X)*i,ue=(X+1<0?0:X+1>V?V:X+1)*i,pe=(X+2<0?0:X+2>V?V:X+2)*i,me=H-1<0?0:H-1>j?j:H-1,he=H<0?0:H>j?j:H,Fe=H+1<0?0:H+1>j?j:H+1,ge=H+2<0?0:H+2>j?j:H+2;let _=0,N=0,z=0,O=0;if(oe!==0){if(Q!==0){const p=u[fe+me],m=Q*oe;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}if(Y!==0){const p=u[fe+he],m=Y*oe;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}if(Z!==0){const p=u[fe+Fe],m=Z*oe;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}if(K!==0){const p=u[fe+ge],m=K*oe;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}}if(ae!==0){if(Q!==0){const p=u[de+me],m=Q*ae;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}if(Y!==0){const p=u[de+he],m=Y*ae;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}if(Z!==0){const p=u[de+Fe],m=Z*ae;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}if(K!==0){const p=u[de+ge],m=K*ae;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}}if(re!==0){if(Q!==0){const p=u[ue+me],m=Q*re;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}if(Y!==0){const p=u[ue+he],m=Y*re;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}if(Z!==0){const p=u[ue+Fe],m=Z*re;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}if(K!==0){const p=u[ue+ge],m=K*re;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}}if(ce!==0){if(Q!==0){const p=u[pe+me],m=Q*ce;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}if(Y!==0){const p=u[pe+he],m=Y*ce;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}if(Z!==0){const p=u[pe+Fe],m=Z*ce;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}if(K!==0){const p=u[pe+ge],m=K*ce;_+=(p&255)*m,N+=(p>>8&255)*m,z+=(p>>16&255)*m,O+=(p>>>24&255)*m}}let ve=0;ne&&(G^=G<<13,G^=G>>>17,G^=G<<5,ve=(G&255)%5-2);const ye=_+ve,be=N+ve,Ce=z+ve,He=ye<0?0:ye>=255.5?255:ye+.5|0,Xe=be<0?0:be>=255.5?255:be+.5|0,Ve=Ce<0?0:Ce>=255.5?255:Ce+.5|0,je=s?O<0?0:O>=255.5?255:O+.5|0:255;w[te++]=He|Xe<<8|Ve<<16|je<<24,M+=B,ie+=b}}g.putImageData(C,0,0)}var Mt=1766015824,St=1665684045,Pt=1732332865,Tt=1700284774,Rt=1950701684,Ot=2052348020,Lt=1767135348,Dt=1950960965,Bt=1883789683,_t=1229144912,Nt=1163413830,zt=1481461792;function $t(e,t){return e.length<12?e:t==="image/png"||e[0]===137&&e[1]===80&&e[2]===78&&e[3]===71?Gt(e):t==="image/jpeg"||e[0]===255&&e[1]===216?Ht(e):t==="image/webp"||e[0]===82&&e[1]===73&&e[2]===70&&e[3]===70?Yt(e):e}function Gt(e){if(e.length<8)return e;const t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(t.getUint32(0,!1)!==2303741511||t.getUint32(4,!1)!==218765834)return e;const n=new Uint8Array(e.length);n.set(e.subarray(0,8),0);let s=8,a=8;const i=e.length;for(;s+8<=i;){const c=t.getUint32(s,!1),r=t.getUint32(s+4,!1),l=12+c;if(s+l>i)break;r===Mt||r===St||r===Pt||r===Tt||r===Rt||r===Ot||r===Lt||r===Dt||r===Bt||(n.set(e.subarray(s,s+l),a),a+=l),s+=l}return n.subarray(0,a)}function Ht(e){if(e.length<4||e[0]!==255||e[1]!==216)return e;const t=new Uint8Array(e.length);t[0]=255,t[1]=216;let n=2,s=2;const a=e.length;for(;s<a-1;){if(e[s]!==255){t[n++]=e[s++];continue}const i=e[s+1];if(i===255||i===0){t[n++]=e[s++];continue}if(i===217){t[n++]=255,t[n++]=217;break}if(i===218){const l=e.subarray(s);t.set(l,n),n+=l.length;break}if(s+3>=a)break;const c=2+(e[s+2]<<8|e[s+3]);if(s+c>a)break;let r=!1;i===226?s+15<=a&&e[s+4]===73&&e[s+5]===67&&e[s+6]===67&&e[s+7]===95&&e[s+8]===80&&e[s+9]===82&&e[s+10]===79&&e[s+11]===70&&e[s+12]===73&&e[s+13]===76&&e[s+14]===69&&e[s+15]===0&&(r=!0):(i===225||i===237||i===238||i===254||i>=227&&i<=239)&&(r=!0),r||(t.set(e.subarray(s,s+c),n),n+=c),s+=c}return t.subarray(0,n)}var Xt=1448097880,Vt=1095520328,jt=1448097824,Wt=1448097868,qt=1095649613,Qt=1095650630;function Yt(e){if(e.length<12)return e;const t=new DataView(e.buffer,e.byteOffset,e.byteLength);if(t.getUint32(0,!1)!==1380533830||t.getUint32(8,!1)!==1464156752)return e;let n=!1,s=!1,a=null;const i=[];let c=12;const r=e.length;for(;c+8<=r;){const h=t.getUint32(c,!1),x=t.getUint32(c+4,!0),v=8+(x+x%2);if(c+v>r)break;h===Vt?(n=!0,i.push({offset:c,totalLen:v,type:h})):h===qt||h===Qt?(s=!0,i.push({offset:c,totalLen:v,type:h})):h===Xt?a={offset:c,totalLen:v}:h===jt||h===Wt?i.push({offset:c,totalLen:v,type:h}):h===_t||h===Nt||h===zt||i.push({offset:c,totalLen:v,type:h}),c+=v}const l=new Uint8Array(e.length);l.set(e.subarray(0,12),0);const o=new DataView(l.buffer,l.byteOffset,l.byteLength);let u=12;if((n||s)&&a){l.set(e.subarray(a.offset,a.offset+a.totalLen),u);let h=0;n&&(h|=16),s&&(h|=2),l[u+8]=h,u+=a.totalLen}for(const h of i)l.set(e.subarray(h.offset,h.offset+h.totalLen),u),u+=h.totalLen;return o.setUint32(4,u-8,!0),l.subarray(0,u)}function ee(e){const t=e<0?-e:e;return t<1?t*t*(1.5*t-2.5)+1:t<2?t*t*(-.5*t+2.5)-4*t+2:0}function Zt(e,t,n,s,a,i,c=!0){const r=t/a,l=n/i,o=n-1,u=t-1;let h=0;for(let x=0;x<i;x++){const v=(x+.5)*l-.5,g=Math.floor(v),C=v-g,w=ee(C+1),F=ee(C),y=ee(C-1),k=ee(C-2),A=(g-1<0?0:g-1>=n?o:g-1)*t,T=(g<0?0:g>=n?o:g)*t,R=(g+1<0?0:g+1>=n?o:g+1)*t,E=(g+2<0?0:g+2>=n?o:g+2)*t;for(let B=0;B<a;B++){const L=(B+.5)*r-.5,b=Math.floor(L),U=L-b,D=ee(U+1),$=ee(U),W=ee(U-1),G=ee(U-2),V=b-1<0?0:b-1>=t?u:b-1,j=b<0?0:b>=t?u:b,te=b+1<0?0:b+1>=t?u:b+1,ne=b+2<0?0:b+2>=t?u:b+2;let I=0,S=0,P=0,M=0;if(w!==0){if(D!==0){const f=e[A+V],d=D*w;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}if($!==0){const f=e[A+j],d=$*w;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}if(W!==0){const f=e[A+te],d=W*w;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}if(G!==0){const f=e[A+ne],d=G*w;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}}if(F!==0){if(D!==0){const f=e[T+V],d=D*F;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}if($!==0){const f=e[T+j],d=$*F;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}if(W!==0){const f=e[T+te],d=W*F;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}if(G!==0){const f=e[T+ne],d=G*F;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}}if(y!==0){if(D!==0){const f=e[R+V],d=D*y;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}if($!==0){const f=e[R+j],d=$*y;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}if(W!==0){const f=e[R+te],d=W*y;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}if(G!==0){const f=e[R+ne],d=G*y;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}}if(k!==0){if(D!==0){const f=e[E+V],d=D*k;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}if($!==0){const f=e[E+j],d=$*k;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}if(W!==0){const f=e[E+te],d=W*k;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}if(G!==0){const f=e[E+ne],d=G*k;I+=(f&255)*d,S+=(f>>8&255)*d,P+=(f>>16&255)*d,M+=(f>>>24&255)*d}}const ie=I<0?0:I>=255.5?255:I+.5|0,le=S<0?0:S>=255.5?255:S+.5|0,H=P<0?0:P>=255.5?255:P+.5|0,X=c?M<0?0:M>=255.5?255:M+.5|0:255;s[h++]=ie|le<<8|H<<16|X<<24}}}function Kt(e,t=!0){const n=e.width,s=e.height;if(n<4||s<4)return;const a=Math.max(2,n*.995+.5|0),i=Math.max(2,s*.995+.5|0);let c;typeof OffscreenCanvas<"u"?c=new OffscreenCanvas(a,i):(c=document.createElement("canvas"),c.width=a,c.height=i);const r=c.getContext("2d",{willReadFrequently:!0});r.drawImage(e,0,0,a,i);const l=r.getImageData(0,0,a,i),o=new Uint32Array(l.data.buffer),u=e.getContext("2d",{willReadFrequently:!0}),h=u.createImageData(n,s);Zt(o,a,i,new Uint32Array(h.data.buffer),n,s,t),u.putImageData(h,0,0)}function ke(e){for(let t=1;t<9;t++){const n=e[t];let s=t-1;for(;s>=0&&e[s]>n;)e[s+1]=e[s],s--;e[s+1]=n}}function Se(e,t,n){const s=e.length,a=new Uint8ClampedArray(s);a.set(e);const i=new Uint8Array(9),c=new Uint8Array(9),r=new Uint8Array(9),l=t-1,o=n-1;for(let u=0;u<n;u++){const h=u*t;for(let x=0;x<t;x++){let v=0;for(let C=-1;C<=1;C++){const w=(u+C<0?0:u+C>o?o:u+C)*t;for(let F=-1;F<=1;F++){const y=w+(x+F<0?0:x+F>l?l:x+F)<<2;i[v]=e[y],c[v]=e[y+1],r[v]=e[y+2],v++}}ke(i),ke(c),ke(r);const g=h+x<<2;a[g]=i[4],a[g+1]=c[4],a[g+2]=r[4]}}e.set(a)}function Jt(e){const t=e.width,n=e.height;if(t<3||n<3)return;const s=e.getContext("2d",{willReadFrequently:!0});if(!s)return;let a=null,i=null;try{typeof OffscreenCanvas<"u"?a=new OffscreenCanvas(t,n):(a=document.createElement("canvas"),a.width=t,a.height=n),i=a.getContext("webgl")}catch{i=null}if(!i){const c=s.getImageData(0,0,t,n);Se(c.data,t,n),s.putImageData(c,0,0);return}try{const c=`
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = (a_position + 1.0) * 0.5;
      }
    `,r=`
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
    `,l=i.createShader(i.VERTEX_SHADER);i.shaderSource(l,c),i.compileShader(l);const o=i.createShader(i.FRAGMENT_SHADER);i.shaderSource(o,r),i.compileShader(o);const u=i.createProgram();i.attachShader(u,l),i.attachShader(u,o),i.linkProgram(u),i.useProgram(u);const h=i.createBuffer();i.bindBuffer(i.ARRAY_BUFFER,h),i.bufferData(i.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),i.STATIC_DRAW);const x=i.getAttribLocation(u,"a_position");i.enableVertexAttribArray(x),i.vertexAttribPointer(x,2,i.FLOAT,!1,0,0);const v=i.getUniformLocation(u,"u_resolution");i.uniform2f(v,t,n);const g=i.createTexture();i.bindTexture(i.TEXTURE_2D,g),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MAG_FILTER,i.NEAREST),i.texImage2D(i.TEXTURE_2D,0,i.RGBA,i.RGBA,i.UNSIGNED_BYTE,e),i.viewport(0,0,t,n),i.drawArrays(i.TRIANGLES,0,6),s.drawImage(a,0,0)}catch{const c=s.getImageData(0,0,t,n);Se(c.data,t,n),s.putImageData(c,0,0)}}function en(e,t=1597463007){let n=t||305419896;const s=e.length;for(let a=0;a<s;a+=4){n^=n<<13,n^=n>>>17,n^=n<<5;const i=((n&1)===0?1:-1)*((n>>>1&1)+1),c=((n>>>2&1)===0?1:-1)*((n>>>3&1)+1),r=((n>>>4&1)===0?1:-1)*((n>>>5&1)+1);let l=e[a]+i,o=e[a+1]+c,u=e[a+2]+r;e[a]=l<0?0:l>255?255:l,e[a+1]=o<0?0:o>255?255:o,e[a+2]=u<0?0:u>255?255:u}}function tn(e,t,n){for(let s=0;s<n;s+=2){const a=s+1<n,i=s*t,c=(s+1)*t;for(let r=0;r<t;r+=2){const l=r+1<t,o=i+r<<2;let u=1;const h=e[o],x=e[o+1],v=e[o+2],g=.299*h+.587*x+.114*v;let C=-.168736*h-.331264*x+.5*v+128,w=.5*h-.418688*x-.081312*v+128,F=0,y=0,k=0,A=0,T=0,R=0;if(l){A=o+4;const L=e[A],b=e[A+1],U=e[A+2];F=.299*L+.587*b+.114*U,C+=-.168736*L-.331264*b+.5*U+128,w+=.5*L-.418688*b-.081312*U+128,u++}if(a){T=c+r<<2;const L=e[T],b=e[T+1],U=e[T+2];y=.299*L+.587*b+.114*U,C+=-.168736*L-.331264*b+.5*U+128,w+=.5*L-.418688*b-.081312*U+128,u++}if(a&&l){R=T+4;const L=e[R],b=e[R+1],U=e[R+2];k=.299*L+.587*b+.114*U,C+=-.168736*L-.331264*b+.5*U+128,w+=.5*L-.418688*b-.081312*U+128,u++}const E=C/u-128,B=w/u-128;e[o]=g+1.402*B,e[o+1]=g-.344136*E-.714136*B,e[o+2]=g+1.772*E,l&&(e[A]=F+1.402*B,e[A+1]=F-.344136*E-.714136*B,e[A+2]=F+1.772*E),a&&(e[T]=y+1.402*B,e[T+1]=y-.344136*E-.714136*B,e[T+2]=y+1.772*E),a&&l&&(e[R]=k+1.402*B,e[R+1]=k-.344136*E-.714136*B,e[R+2]=k+1.772*E)}}}function nn(e,t=!0){Kt(e,t),Jt(e);const n=e.getContext("2d",{willReadFrequently:!0});if(n){const s=n.getImageData(0,0,e.width,e.height);tn(s.data,e.width,e.height),en(s.data),n.putImageData(s,0,0)}}async function sn(e,t,n){n?.(10);const s=e instanceof File?e.name:"unnamed_image",a=e.size,i=await we(e,s);n?.(25);const c=!(e.type==="image/jpeg"||/\.(jpe?g|bmp)$/i.test(s)),r="image/webp",l=.6,o=!0,u=await e.arrayBuffer();let h=null;try{h=await new Promise((w,F)=>{const y=new Worker(new URL(new URL("image.worker-BQBqERYR.js",import.meta.url).href,""+import.meta.url),{type:"module"});y.onmessage=k=>{k.data.error?F(new Error(k.data.error)):w(new Uint8Array(k.data.buffer)),y.terminate()},y.onerror=k=>{F(k),y.terminate()},y.postMessage({buffer:u,mimeType:e.type||"image/jpeg",options:t,needsAlpha:c},[u])})}catch(w){console.warn("Worker pipeline failed, falling back to Main Thread row-batched chunks:",w);const F=new Blob([u],{type:e.type}),y=await createImageBitmap(F);let k=y.width,A=y.height;const T=Math.max(k,A);let R=y;if(T>1920){const U=1920/T;k=Math.floor(k*U),A=Math.floor(A*U);const D=document.createElement("canvas");D.width=k,D.height=A,D.getContext("2d",{alpha:c,willReadFrequently:!0}).drawImage(y,0,0,k,A),R=D,await new Promise($=>setTimeout($,0))}const E=document.createElement("canvas");if(E.width=k,E.height=A,!E.getContext("2d",{alpha:!!c,willReadFrequently:!0}))throw new Error("Main thread context instantiation failed");const B=t.defenseLevel==="standard"?"hardened":t.defenseLevel;It(R,E,B,c,!1),y.close(),await new Promise(U=>setTimeout(U,0)),nn(E,c),await new Promise(U=>setTimeout(U,0));const L=await(await new Promise((U,D)=>{E.toBlob($=>$?U($):D(new Error("toBlob failed")),r,l)})).arrayBuffer(),b=new Uint8Array(L);!c&&b.length>=16&&String.fromCharCode(b[12],b[13],b[14],b[15])==="VP8X"&&console.warn("Residual extended chunks detected: FourCC equals VP8X on intended non-transparent media."),h=$t(b,r)}n?.(92);const x=new Blob([h],{type:r}),v=await Ee(h,"webp"),g=await we(x,v);if(g.sha256===i.sha256)throw new Error("Mandatory re-synthesis invariant violated: output SHA-256 must diverge from input");n?.(100);const C={blob:x,originalBlob:e,originalName:s,sanitizedName:v,originalSize:a,sanitizedSize:x.size,format:r,sha256:g.sha256,defenseLevel:t.defenseLevel,auditBefore:i,auditAfter:g,processedAt:Date.now(),isDeepDecontaminated:o,extremeSanitization:t.extremeSanitization};return h=null,C}function ze(e,t){return e.startsWith("image/")||/\.(jpg|jpeg|png|webp|bmp|gif|tiff|tif|avif|heic|heif|svg)$/i.test(t)}var on=1718773093;function Pe(e){if(e.length<12)return!1;const t=new DataView(e.buffer,e.byteOffset,e.byteLength).getUint32(4,!1);return t===1718909296||t===1836019574}function Te(e,t){return e.startsWith("audio/")||/\.(mp3|wav|ogg|flac|aac|m4a)$/i.test(t)}function Re(e){const t=new Uint8Array(e.length);return t.set(e),$e(t,new DataView(t.buffer,t.byteOffset,t.byteLength),0,t.length),t}function $e(e,t,n,s){let a=n;for(;a+8<=s;){const i=t.getUint32(a,!1),c=t.getUint32(a+4,!1);let r=i,l=8;if(i===0)r=s-a;else if(i===1){if(a+16>s)break;r=Number(t.getBigUint64(a+8,!1)),l=16}if(r<l||a+r>s)break;if(c===1969517665||c===1835365473||c===1970628964||c===1768715124){t.setUint32(a+4,on,!1),e.fill(0,a+l,a+r),a+=r;continue}if(c===1836019574||c===1953653099||c===1835297121||c===1835626086||c===1937007212||c===1684631142)$e(e,t,a+l,a+r);else if(c===1835295092)an(e,a+l,a+r);else if((c===1836476516||c===1953196132||c===1835296868)&&r>=l+20){const o=e[a+l];o===0?(t.setUint32(a+l+4,0,!1),t.setUint32(a+l+8,0,!1)):o===1&&r>=l+28&&(t.setBigUint64(a+l+4,0n,!1),t.setBigUint64(a+l+12,0n,!1))}a+=r}}function an(e,t,n){const s=new TextEncoder().encode("x264 - core");for(let a=t;a<=n-s.length;a++){let i=!0;for(let c=0;c<s.length;c++)if(e[a+c]!==s[c]){i=!1;break}if(i)for(let c=0;c<256&&a+c<n;c++)e[a+c]=0}}function Oe(e){let t=0,n=e.length;if(e.length>=10&&e[0]===73&&e[1]===68&&e[2]===51&&(t=10+((e[6]&127)<<21|(e[7]&127)<<14|(e[8]&127)<<7|e[9]&127)),e.length>=128){const s=e.length-128;e[s]===84&&e[s+1]===65&&e[s+2]===71&&(n=s)}return e.subarray(t,n)}async function rn(e,t,n){if(ze(t,n))throw new Error(`Image payload rejected from media pipeline: MIME="${t}" name="${n}". Image assets must route exclusively through canvas re-synthesis.`);if(typeof Worker<"u")return new Promise((a,i)=>{try{const c=new Worker(new URL(new URL("media.worker-CuoXEA00.js",import.meta.url).href,""+import.meta.url),{type:"module"});c.onmessage=r=>{const l=new Uint8Array(r.data.buffer);c.terminate(),a(l)},c.onerror=r=>{c.terminate(),i(r)},c.postMessage({buffer:e,mimeType:t,originalName:n},[e])}catch{const c=new Uint8Array(e);a(Pe(c)?Re(c):Te(t,n)?Oe(c):c)}});const s=new Uint8Array(e);return Pe(s)?Re(s):Te(t,n)?Oe(s):s}async function cn(e,t,n){const s=e instanceof File?e.name:"",a=e.type||"";if(ze(a,s))throw new Error(`Image payload rejected from media pipeline: MIME="${a}" name="${s}". Image assets must route exclusively through canvas re-synthesis.`);n?.(15);const i=e instanceof File?e.name:"unnamed_media",c=await we(e,i);n?.(35);let r=await e.arrayBuffer();const l=e.type||"";let o=await rn(r,l,i);n?.(75);const u=new Blob([o],{type:l||"video/mp4"}),h=i.split(".").pop()||"mp4",x=await Ee(o,h);n?.(90);const v=await we(u,x);n?.(100);const g={blob:u,originalBlob:e,originalName:i,sanitizedName:x,originalSize:e.size,sanitizedSize:u.size,format:l,sha256:v.sha256,defenseLevel:t.defenseLevel,auditBefore:c,auditAfter:v,processedAt:Date.now()};return o=null,r=null,g}async function ln(e,t={},n){const s=e.type.toLowerCase(),a=e.name.toLowerCase(),i=t.defenseLevel||"paranoid",c=t.quality??.85,r=!0,l=s.startsWith("image/")||/\.(jpg|jpeg|png|webp|bmp|gif|tiff)$/i.test(a),o=s.startsWith("video/")||s.startsWith("audio/")||/\.(mp4|mov|mkv|webm|mp3|wav|ogg|aac|m4a)$/i.test(a);if(l)return await sn(e,{defenseLevel:i,outputFormat:"image/webp",quality:c,extremeSanitization:r},n);if(o)return await cn(e,{defenseLevel:i},n);throw new Error(`Unsupported file type: MIME="${s}" name="${a}". Only image (JPEG, PNG, WebP, BMP, TIFF, GIF) and media (MP4, MOV, MKV, WebM, MP3, WAV, OGG, AAC, M4A) formats are accepted.`)}var Ge=new Uint32Array(256);for(let e=0;e<256;e++){let t=e;for(let n=0;n<8;n++)t&1?t=3988292384^t>>>1:t=t>>>1;Ge[e]=t}function fn(e){let t=-1;for(let n=0;n<e.length;n++)t=Ge[(t^e[n])&255]^t>>>8;return(t^-1)>>>0}var dn=new TextEncoder;async function un(e,t){const n=[];let s=0,a=0;for(let w=0;w<e.length;w++){const F=e[w],y=await F.blob.arrayBuffer(),k=new Uint8Array(y),A=dn.encode(F.sanitizedName),T=fn(k),R=k.length;n.push({nameBytes:A,data:k,crc:T,size:R,offset:s});const E=30+A.length+R;s+=E,a+=46+A.length,t?.(Math.round((w+1)/e.length*40))}const i=s+a+22,c=new ArrayBuffer(i),r=new DataView(c),l=new Uint8Array(c);let o=0;const u=0,h=33,x=20,v=20,g=0;for(let w=0;w<n.length;w++){const F=n[w];r.setUint32(o,67324752,!0),o+=4,r.setUint16(o,x,!0),o+=2,r.setUint16(o,0,!0),o+=2,r.setUint16(o,g,!0),o+=2,r.setUint16(o,u,!0),o+=2,r.setUint16(o,h,!0),o+=2,r.setUint32(o,F.crc,!0),o+=4,r.setUint32(o,F.size,!0),o+=4,r.setUint32(o,F.size,!0),o+=4,r.setUint16(o,F.nameBytes.length,!0),o+=2,r.setUint16(o,0,!0),o+=2,l.set(F.nameBytes,o),o+=F.nameBytes.length,l.set(F.data,o),o+=F.size,t?.(40+Math.round((w+1)/n.length*40))}const C=o;for(let w=0;w<n.length;w++){const F=n[w];r.setUint32(o,33639248,!0),o+=4,r.setUint16(o,v,!0),o+=2,r.setUint16(o,x,!0),o+=2,r.setUint16(o,0,!0),o+=2,r.setUint16(o,g,!0),o+=2,r.setUint16(o,u,!0),o+=2,r.setUint16(o,h,!0),o+=2,r.setUint32(o,F.crc,!0),o+=4,r.setUint32(o,F.size,!0),o+=4,r.setUint32(o,F.size,!0),o+=4,r.setUint16(o,F.nameBytes.length,!0),o+=2,r.setUint16(o,0,!0),o+=2,r.setUint16(o,0,!0),o+=2,r.setUint16(o,0,!0),o+=2,r.setUint16(o,0,!0),o+=2,r.setUint32(o,32,!0),o+=4,r.setUint32(o,F.offset,!0),o+=4,l.set(F.nameBytes,o),o+=F.nameBytes.length}return r.setUint32(o,101010256,!0),o+=4,r.setUint16(o,0,!0),o+=2,r.setUint16(o,0,!0),o+=2,r.setUint16(o,n.length,!0),o+=2,r.setUint16(o,n.length,!0),o+=2,r.setUint32(o,a,!0),o+=4,r.setUint32(o,C,!0),o+=4,r.setUint16(o,0,!0),o+=2,t?.(100),{zipBlob:new Blob([c],{type:"application/zip"}),zipFileName:`bundle_${await bt(c,"zip",12)}`}}function Le(e,t){const n=URL.createObjectURL(e),s=document.createElement("a");s.href=n,s.download=t,s.rel="noopener noreferrer",document.body.appendChild(s),s.click(),document.body.removeChild(s),setTimeout(()=>{URL.revokeObjectURL(n)},1e3)}function pn(e){try{e instanceof Uint8Array?e.fill(0):new Uint8Array(e).fill(0)}catch{}}function mn(){const e=document.createElement("header");return e.className="w-full flex items-center justify-between py-6 text-[#FFFFFF] select-none",e.innerHTML=`
    <div class="flex items-center gap-3">
      <span class="text-base sm:text-lg font-bold tracking-widest uppercase font-mono text-[#FFFFFF]">Dodecoder</span>
    </div>

    <div class="flex items-center gap-6">
      <a href="https://github.com/mochilamv/dodecoder" target="_blank" rel="noopener noreferrer" 
         class="text-xs font-mono uppercase tracking-wider text-[#FFFFFF] hover:text-[#00FF00] transition-colors focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2">
        GitHub
      </a>
    </div>
  `,e}var q={shield:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',shieldCheck:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path stroke-linecap="round" stroke-linejoin="round" d="m9 12 2 2 4-4"/></svg>',lock:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',download:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',archive:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',trash:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',eye:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',alertTriangle:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',check:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',upload:'<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>',cpu:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3m-3 6h3M1 9h3m-3 6h3"/></svg>',info:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>',close:'<svg class="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',sparkles:'<svg class="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>'};function hn(e){const t=document.createElement("div");t.className="relative my-12 sm:my-20 py-20 sm:py-28 flex flex-col items-center justify-center text-center cursor-pointer select-none transition-all duration-150 bg-[#000000] focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-4",t.setAttribute("tabindex","0"),t.setAttribute("role","button"),t.setAttribute("aria-label","Sanitization Dropzone: Drop image, video, or audio files to sanitize. Batch processing for images, videos, and audio. Reconstruction."),t.setAttribute("title","Batch processing for images, videos, and audio. Reconstruction."),t.innerHTML=`
    <input type="file" id="file-input" multiple accept="image/*,video/*,audio/*,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.mp4,.mov,.mp3,.wav,.ogg" class="hidden" />

    <div class="flex flex-col items-center justify-center space-y-4 pointer-events-none">
      <div class="text-[#FFFFFF]">
        ${q.upload}
      </div>

      <div class="space-y-2">
        <div class="text-sm sm:text-base font-mono tracking-wider text-[#FFFFFF] uppercase">
          Drop media here or browse
        </div>
        <p class="text-xs font-mono text-[#FFFFFF]/70 max-w-md mx-auto">
          Batch processing for images, videos, and audio. Reconstruction.
        </p>
      </div>

      <span class="text-xs font-mono text-[#FFFFFF] tracking-widest hover:text-[#00FF00] transition-colors">
        Select Files
      </span>
    </div>
  `;const n=t.querySelector("#file-input");return t.addEventListener("click",()=>{n.click()}),t.addEventListener("keydown",s=>{(s.key==="Enter"||s.key===" ")&&(s.preventDefault(),n.click())}),n.addEventListener("change",()=>{n.files&&n.files.length>0&&(e(Array.from(n.files)),n.value="")}),t.addEventListener("dragover",s=>{s.preventDefault(),s.stopPropagation(),t.style.outline="2px solid #00FF00"}),t.addEventListener("dragleave",s=>{s.preventDefault(),s.stopPropagation(),t.style.outline=""}),t.addEventListener("drop",s=>{s.preventDefault(),s.stopPropagation(),t.style.outline="",s.dataTransfer&&s.dataTransfer.files.length>0&&e(Array.from(s.dataTransfer.files))}),t}function De(e,t){const n=document.createElement("div");if(n.className="mt-6 space-y-4",e.length===0)return n;const s=e.filter(l=>l.status==="done").length,a=e.length;n.innerHTML=`
    <!-- Batch Actions Bar -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 ${s===a?"bg-[#00FF00]":"bg-[#FFFFFF] animate-pulse"}"></span>
        <span class="text-xs font-mono font-medium text-[#FFFFFF]">
          Queue: ${s} / ${a} processed
        </span>
      </div>

      <div class="flex items-center gap-4 w-full sm:w-auto">
        ${s>0?`
          <button id="btn-download-zip" class="text-[#00FF00] hover:text-[#FFFFFF] text-xs font-mono tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00]">
            ${q.archive}
            <span>Download All (ZIP)</span>
          </button>
        `:""}

        <button id="btn-clear-all" class="text-[#FFFFFF] hover:text-[#FF4444] text-xs font-mono tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00]">
          ${q.trash}
          <span>Clear</span>
        </button>
      </div>
    </div>

    <!-- Items List -->
    <div class="space-y-4" id="queue-items-container"></div>
  `;const i=n.querySelector("#btn-download-zip");i&&i.addEventListener("click",t.onDownloadAllZip);const c=n.querySelector("#btn-clear-all");c&&c.addEventListener("click",t.onClearQueue);const r=n.querySelector("#queue-items-container");return e.forEach(l=>{const o=document.createElement("div");o.className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-4";const u=l.status==="done",h=l.status==="error",x=l.status==="processing"||l.status==="analyzing",v=[];if(l.result?.auditBefore){const w=l.result.auditBefore;w.hasGps&&v.push('<span class="text-[10px] font-mono text-[#FF4444]">GPS</span>'),w.hasThumbnail&&v.push('<span class="text-[10px] font-mono text-[#FF4444]">THUMB</span>'),w.hasMakerNotes&&v.push('<span class="text-[10px] font-mono text-[#FF4444]">OEM</span>'),w.hasExif&&!w.hasGps&&v.push('<span class="text-[10px] font-mono text-[#FFFFFF]">EXIF</span>')}o.innerHTML=`
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <div class="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5 text-[#FFFFFF]">
          ${u?`<span class="text-[#00FF00]">${q.check}</span>`:h?`<span class="text-[#FF4444]">${q.alertTriangle}</span>`:`<span class="text-[#FFFFFF] animate-spin">${q.cpu}</span>`}
        </div>

        <div class="min-w-0 flex-1 space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-mono font-medium text-[#FFFFFF] truncate max-w-[200px] sm:max-w-xs" title="${l.file.name}">
              ${l.file.name}
            </span>
            <span class="text-[10px] text-[#FFFFFF]/70 font-mono">(${Be(l.file.size)})</span>
            ${v.join(" ")}
          </div>

          ${u&&l.result?`
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-mono text-[#00FF00]">
                ${l.result.sanitizedName}
              </span>
              <span class="text-[10px] text-[#FFFFFF]/70 font-mono">
                (${Be(l.result.sanitizedSize)})
              </span>
              <span class="text-[10px] text-[#00FF00] font-mono">
                CLEAN
              </span>
              ${l.result.isDeepDecontaminated?`
                <span class="text-[10px] text-[#FFFFFF] font-mono" title="Anti-steganography pipeline applied" aria-label="Anti-steganography pipeline applied">
                  DECONTAMINATED
                </span>
              `:""}
            </div>
          `:""}

          ${x?`
            <div class="text-[10px] text-[#FFFFFF] font-mono flex justify-between">
              <span>${l.status==="analyzing"?"Scanning...":"Re-encoding..."}</span>
              <span>${l.progress}%</span>
            </div>
          `:""}

          ${h?`
            <div class="text-xs text-[#FF4444] font-mono mt-1">
              Error: ${l.error||"Failed to process"}
            </div>
          `:""}
        </div>
      </div>

      <!-- Action Buttons -->
      ${u&&l.result?`
        <div class="flex items-center gap-4 shrink-0">
          <button class="btn-inspect text-xs font-mono text-[#FFFFFF] hover:text-[#00FF00] transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00]">
            ${q.eye}
            <span>Inspect</span>
          </button>

          <button class="btn-download text-[#00FF00] hover:text-[#FFFFFF] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00]">
            ${q.download}
            <span>Download</span>
          </button>
        </div>
      `:""}
    `;const g=o.querySelector(".btn-inspect");g&&g.addEventListener("click",()=>t.onInspectForensics(l));const C=o.querySelector(".btn-download");C&&C.addEventListener("click",()=>t.onDownloadSingle(l)),r.appendChild(o)}),n}function Be(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],s=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,s)).toFixed(1))} ${n[s]}`}function Fn(e,t){const n=document.createElement("div");n.className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/90 backdrop-blur-sm";const s=document.createElement("div");s.className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#000000] text-[#FFFFFF] p-6 focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2",s.setAttribute("tabindex","-1");const a=e.auditBefore,i=e.auditAfter;s.innerHTML=`
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-mono font-bold tracking-wider text-[#FFFFFF]">Forensic Audit Report</h2>
      <button id="btn-close-modal" class="p-2 text-[#FFFFFF] hover:text-[#FF4444] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2" aria-label="Close modal">
        ${q.close}
      </button>
    </div>

    <div class="space-y-8">
      <!-- Overview -->
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <div class="text-[10px] text-[#FFFFFF] font-mono uppercase">Original</div>
          <div class="text-sm font-mono text-[#FFFFFF] truncate" title="${e.originalName}">${e.originalName}</div>
          <div class="text-xs text-[#FF4444] font-mono">${_e(e.originalSize)}</div>
          <div class="text-[10px] text-[#FF4444] font-mono break-all mt-1" title="Original SHA-256">${a.sha256}</div>
        </div>
        <div class="space-y-1">
          <div class="text-[10px] text-[#FFFFFF] font-mono uppercase">Sanitized</div>
          <div class="text-sm font-mono text-[#00FF00] truncate" title="${e.sanitizedName}">${e.sanitizedName}</div>
          <div class="text-xs text-[#00FF00] font-mono">${_e(e.sanitizedSize)}</div>
          <div class="text-[10px] text-[#00FF00] font-mono break-all mt-1" title="Sanitized SHA-256">${i.sha256}</div>
        </div>
      </div>

      <!-- Payload Diff -->
      <div class="space-y-4">
        <h3 class="text-xs font-mono font-bold tracking-widest text-[#FFFFFF] uppercase">Vector Analysis</h3>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${se("Format / MIME",a.mimeType,i.mimeType)}
          ${se("EXIF / TIFF",a.hasExif?"Detected":"Clean",i.hasExif?"Detected":"Clean")}
          ${se("GPS Coordinates",a.hasGps?"Exposed":"Clean",i.hasGps?"Exposed":"Clean")}
          ${se("MakerNotes / OEM",a.hasMakerNotes?"Exposed":"Clean",i.hasMakerNotes?"Exposed":"Clean")}
          ${se("Thumbnail Leak",a.hasThumbnail?"Exposed":"Clean",i.hasThumbnail?"Exposed":"Clean")}
          ${se("Steganography Deep Decon","N/A",e.isDeepDecontaminated?"Applied":"Skipped")}
        </div>
      </div>
    </div>
  `;const c=s.querySelector("#btn-close-modal");return c&&c.addEventListener("click",t),n.addEventListener("click",r=>{r.target===n&&t()}),n.appendChild(s),setTimeout(()=>s.focus(),10),n}function se(e,t,n){return`
    <div class="flex flex-col space-y-1">
      <div class="text-[10px] text-[#FFFFFF] font-mono tracking-wider uppercase">${e}</div>
      <div class="flex items-center gap-2 text-xs font-mono">
        <span class="${t!=="Clean"&&t!=="N/A"?"text-[#FF4444]":"text-[#FFFFFF]"}">${t}</span>
        <span class="text-[#FFFFFF]">-&gt;</span>
        <span class="${n==="Clean"||n==="Applied"?"text-[#00FF00]":"text-[#FFFFFF]"} font-bold">${n}</span>
      </div>
    </div>
  `}function _e(e){if(e===0)return"0 B";const t=1024,n=["B","KB","MB","GB"],s=Math.floor(Math.log(e)/Math.log(t));return`${parseFloat((e/Math.pow(t,s)).toFixed(1))} ${n[s]}`}function gn(e){const t=document.createElement("div");t.className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/90 backdrop-blur-sm";const n=document.createElement("div");n.className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#000000] text-[#FFFFFF] p-6 focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2",n.setAttribute("tabindex","-1"),n.innerHTML=`
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-mono font-bold tracking-wider text-[#FFFFFF]">Licenses & Legal</h2>
      <button id="btn-close-legal" class="p-2 text-[#FFFFFF] hover:text-[#FF4444] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00] outline-offset-2" aria-label="Close modal">
        ${q.close}
      </button>
    </div>

    <div class="space-y-8 font-mono text-xs text-[#FFFFFF]">
      
      <section class="space-y-3">
        <h3 class="text-sm font-bold text-[#FFFFFF] uppercase tracking-widest">MIT License</h3>
        <p>Copyright (c) 2024 Mochilamv</p>
        <p class="leading-relaxed text-[#FFFFFF]/80">
          Permission is hereby granted, free of charge, to any person obtaining a copy
          of this software and associated documentation files (the "Software"), to deal
          in the Software without restriction, including without limitation the rights
          to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
          copies of the Software, and to permit persons to whom the Software is
          furnished to do so, subject to the following conditions:
        </p>
        <p class="leading-relaxed text-[#FFFFFF]/80">
          The above copyright notice and this permission notice shall be included in all
          copies or substantial portions of the Software.
        </p>
        <p class="leading-relaxed font-bold text-[#FFFFFF]">
          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
          IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
          AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
          LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
          OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
          SOFTWARE.
        </p>
      </section>

      <div class="h-px bg-[#FFFFFF]/20 w-full"></div>

      <section class="space-y-3">
        <h3 class="text-sm font-bold text-[#FFFFFF] uppercase tracking-widest">Third-Party Dependencies</h3>
        <ul class="space-y-4">
          <li>
            <div class="font-bold text-[#FFFFFF]">FFmpeg.wasm (ffmpeg/ffmpeg)</div>
            <div class="text-[#FFFFFF]/70">Licensed under LGPL v2.1+ / GPL v2.0+</div>
            <div class="text-[#FFFFFF]/70">Used for local in-browser video/audio sanitization via WebAssembly.</div>
          </li>
          <li>
            <div class="font-bold text-[#FFFFFF]">JSZip</div>
            <div class="text-[#FFFFFF]/70">Licensed under MIT or GPLv3</div>
            <div class="text-[#FFFFFF]/70">Used for creating sanitized payload archives.</div>
          </li>
          <li>
            <div class="font-bold text-[#FFFFFF]">Lucide Icons</div>
            <div class="text-[#FFFFFF]/70">Licensed under ISC</div>
            <div class="text-[#FFFFFF]/70">SVG iconography used in the interface.</div>
          </li>
          <li>
            <div class="font-bold text-[#FFFFFF]">Tailwind CSS</div>
            <div class="text-[#FFFFFF]/70">Licensed under MIT</div>
            <div class="text-[#FFFFFF]/70">Utility-first CSS framework for interface styling.</div>
          </li>
        </ul>
      </section>

    </div>
  `;const s=n.querySelector("#btn-close-legal");return s&&s.addEventListener("click",e),t.addEventListener("click",a=>{a.target===t&&e()}),t.appendChild(n),setTimeout(()=>n.focus(),10),t}var vn=class{root;queue=[];activeAuditModal=null;activeLegalModal=null;isProcessingQueue=!1;constructor(e){this.root=e,this.render()}render(){this.root.innerHTML="";const e=document.createElement("main");e.className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col justify-between";const t=mn();e.appendChild(t);const n=hn(i=>this.handleFilesAdded(i));e.appendChild(n);const s=De(this.queue,{onDownloadSingle:i=>this.handleDownloadSingle(i),onDownloadAllZip:()=>this.handleDownloadAllZip(),onInspectForensics:i=>this.handleInspectForensics(i),onClearQueue:()=>this.handleClearQueue()});e.appendChild(s);const a=this.createFooter();e.appendChild(a),this.root.appendChild(e)}createFooter(){const e=document.createElement("footer");return e.className="mt-auto py-8 text-center text-[#FFFFFF]/60 text-xs font-mono select-none space-y-2",e.innerHTML=`
      <div class="text-xs font-mono tracking-wider uppercase text-[#FFFFFF]">
        Client-Side Sanitization
      </div>
      <div class="flex flex-wrap items-center justify-center gap-4">
        <span>MIT License</span>
        <span>•</span>
        <button id="footer-legal-btn" class="hover:text-[#FFFFFF] underline cursor-pointer focus-visible:outline-2 focus-visible:outline-[#00FF00]">
          Licenses & Legal
        </button>
      </div>
    `,e.querySelector("#footer-legal-btn")?.addEventListener("click",()=>{this.openLegalModal()}),e}handleFilesAdded(e){const t=e.map(n=>({id:`${Date.now()}-${Math.random().toString(36).slice(2,9)}`,file:n,status:"idle",progress:0}));this.queue.push(...t),this.render(),this.processQueue()}async processQueue(){if(!this.isProcessingQueue){this.isProcessingQueue=!0;for(let e=0;e<this.queue.length;e++){const t=this.queue[e];if(t.status==="idle"){t.status="analyzing",t.progress=25,this.updateQueueView();try{t.status="processing";const n=await ln(t.file,{quality:.6,extremeSanitization:!0},s=>{t.progress=s,this.updateQueueView()});t.status="done",t.progress=100,t.result=n}catch(n){t.status="error",t.error=n.message||"Processing failed"}this.updateQueueView()}}this.isProcessingQueue=!1}}updateQueueView(){const e=this.root.querySelector("#queue-items-container")?.parentElement;if(e){const t=De(this.queue,{onDownloadSingle:n=>this.handleDownloadSingle(n),onDownloadAllZip:()=>this.handleDownloadAllZip(),onInspectForensics:n=>this.handleInspectForensics(n),onClearQueue:()=>this.handleClearQueue()});e.replaceWith(t)}else this.render()}handleDownloadSingle(e){e.result&&Le(e.result.blob,e.result.sanitizedName)}async handleDownloadAllZip(){const e=this.queue.filter(s=>s.status==="done"&&s.result).map(s=>s.result);if(e.length===0)return;const{zipBlob:t,zipFileName:n}=await un(e);Le(t,n)}handleInspectForensics(e){e.result&&this.openAuditModal(e.result)}openAuditModal(e){this.activeAuditModal&&this.activeAuditModal.remove(),this.activeAuditModal=Fn(e,()=>{this.activeAuditModal?.remove(),this.activeAuditModal=null}),document.body.appendChild(this.activeAuditModal)}openLegalModal(){this.activeLegalModal&&this.activeLegalModal.remove(),this.activeLegalModal=gn(()=>{this.activeLegalModal?.remove(),this.activeLegalModal=null}),document.body.appendChild(this.activeLegalModal)}handleClearQueue(){for(const e of this.queue)e.result&&e.result.blob.arrayBuffer().then(t=>pn(t)).catch(()=>{});this.queue=[],this.render()}};document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("app");if(!e)throw new Error("Application root element (#app) not found");new vn(e)});

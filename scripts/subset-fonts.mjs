import fs from 'node:fs'
import subsetFont from 'subset-font'
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(dir+'/'+e.name) : [dir+'/'+e.name]) }
// Korean KS X 1001 syllables plus every UI character. Rare characters use the system fallback.
const decoder=new TextDecoder('euc-kr')
let text=''
for(let high=0xb0;high<=0xc8;high++)for(let low=0xa1;low<=0xfe;low++)text+=decoder.decode(Uint8Array.of(high,low))
for(let i=0x20;i<=0x24f;i++)text+=String.fromCharCode(i)
for(let i=0x2000;i<=0x206f;i++)text+=String.fromCharCode(i)
for(const file of walk('src').filter(p=>/\.(ts|tsx)$/.test(p)))text+=fs.readFileSync(file,'utf8')
text=[...new Set([...text])].join('')
fs.mkdirSync('src/assets/fonts/subset',{recursive:true})
function renameFamily(buffer) {
  const result=Buffer.from(buffer)
  let nameOffset=0
  for(let i=0;i<result.readUInt16BE(4);i++){const p=12+i*16;if(result.toString('ascii',p,p+4)==='name')nameOffset=result.readUInt32BE(p+8)}
  if(!nameOffset)throw new Error('OpenType name table missing')
  const count=result.readUInt16BE(nameOffset+2), stringStart=nameOffset+result.readUInt16BE(nameOffset+4)
  for(let i=0;i<count;i++){
    const p=nameOffset+6+i*12, platform=result.readUInt16BE(p), id=result.readUInt16BE(p+6), length=result.readUInt16BE(p+8), start=stringStart+result.readUInt16BE(p+10)
    if(![1,3,4,6,16,21].includes(id))continue
    const raw=result.subarray(start,start+length)
    const value=platform===0||platform===3?Buffer.from(raw).swap16().toString('utf16le'):raw.toString('latin1')
    const replacement=value.replaceAll('Pretendard',id===6?'Hovie-Sans':'Hovie Sans')
    const encoded=platform===0||platform===3?Buffer.from(replacement,'utf16le').swap16():Buffer.from(replacement,'latin1')
    if(encoded.length!==length)throw new Error('Font name length mismatch')
    encoded.copy(result,start)
  }
  return result
}
for(const weight of ['Regular','Bold']) {
  const sfnt=await subsetFont(fs.readFileSync('src/assets/fonts/woff2/Pretendard-'+weight+'.woff2'),text,{targetFormat:'sfnt',noHinting:true,preserveNameIds:[0,13,14]})
  const result=await subsetFont(renameFamily(sfnt),undefined,{targetFormat:'woff2',keepAllGlyphs:true,preserveNameIds:[0,13,14]})
  fs.writeFileSync('src/assets/fonts/subset/Hovie-'+weight+'.woff2',result)
  console.log(weight+': '+result.length+' bytes')
}

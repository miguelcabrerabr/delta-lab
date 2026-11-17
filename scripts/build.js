const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="src/styles.css">',()=>'<style>'+fs.readFileSync(path.join(root,'src/styles.css'),'utf8')+'</style>');
html=html.replace(/<script src="([^"]+)"><\/script>/g,(_,file)=>'<script>\n'+fs.readFileSync(path.join(root,file),'utf8').replace(/<\/script/gi,'<\\/script')+'\n</script>');
fs.mkdirSync(path.join(root,'dist'),{recursive:true});fs.writeFileSync(path.join(root,'dist/index.html'),html);console.log(`Built dist/index.html — ${Math.round(Buffer.byteLength(html)/1024)} KB, self-contained, no network dependencies.`);

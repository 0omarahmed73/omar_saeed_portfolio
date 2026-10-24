"""Builds ../atlas-3d.html: inlines three.js (MIT, from the repo's node_modules) as data-URL modules in an import map,
so the page works from file:// with no server and no network. Run: python3 atlas3d/build.py"""
import base64, pathlib
root = pathlib.Path(__file__).resolve().parents[3]
nm = root / 'node_modules' / 'three'
def b64(p): return 'data:text/javascript;base64,' + base64.b64encode(pathlib.Path(p).read_bytes()).decode()
imap = {
 'three': b64(nm / 'build' / 'three.module.min.js'),
 'three/addons/objects/MarchingCubes.js': b64(nm / 'examples/jsm/objects/MarchingCubes.js'),
 'three/addons/environments/RoomEnvironment.js': b64(nm / 'examples/jsm/environments/RoomEnvironment.js'),
}
import json
html = f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Atlas 3D — procedural experiment</title>
<style>html,body{{margin:0;height:100%;background:#F3EFE5}}canvas{{width:100%;height:100%;display:block}}
.note{{position:fixed;left:16px;bottom:12px;font:13px system-ui;color:#5b5f6b}}</style></head>
<body><canvas id="atlas-canvas" aria-label="Procedural marble sculpture of Atlas holding a gold celestial sphere" role="img"></canvas>
<div class="note">Procedural experiment. No external assets. Move the pointer to turn the figure.</div>
<script type="importmap">{json.dumps({"imports": imap})}</script>
<script type="module">{(pathlib.Path(__file__).parent / 'atlas.js').read_text()}</script></body></html>'''
out = pathlib.Path(__file__).resolve().parents[1] / 'atlas-3d.html'
out.write_text(html); print(out, round(len(html) / 1024), 'KB')

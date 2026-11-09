import os
order=['core','portrait','human','art','stairs','police','police2','police3','dog','dog2','main']
js='\n'.join(open(f'src/{n}.js').read() for n in order if os.path.exists(f'src/{n}.js'))
html=f'''<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI 어드벤처 · 강당 AI 과학 체험부스</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Gowun+Dodum&family=Nanum+Pen+Script&display=swap" rel="stylesheet">
<style>html,body{{margin:0;height:100%;background:#000;overflow:hidden}}body{{display:flex;align-items:center;justify-content:center}}canvas{{image-rendering:pixelated;display:block;cursor:pointer}}</style>
</head><body><canvas id="c" width="960" height="540"></canvas>
<script>
{js}
</script></body></html>'''
open('index.html','w').write(html)
print(len(html))

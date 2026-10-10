# lookalike/ 앱 전체를 파일 하나짜리 HTML(저장소 루트의 닮은꼴스타일.html)로 묶는다.
# 실행: python3 lookalike/scripts/build-standalone.py
# 단일 파일에는 manifest·서비스워커가 들어갈 수 없어 뺀다(홈 화면 설치·오프라인 캐시 없음).
import base64, os, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

def read(rel):
    with open(os.path.join(ROOT, rel), encoding='utf-8') as f:
        return f.read()

html = read('index.html')
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + read('css/style.css') + '</style>')
with open(os.path.join(ROOT, 'icons/favicon-32.png'), 'rb') as f:
    fav = base64.b64encode(f.read()).decode()
html = html.replace('<link rel="icon" href="icons/favicon-32.png" sizes="32x32">',
                    '<link rel="icon" href="data:image/png;base64,' + fav + '">')
html = re.sub(r'\s*<link rel="manifest"[^>]*>', '', html)
html = re.sub(r'\s*<link rel="apple-touch-icon"[^>]*>', '', html)
html = re.sub(r'\s*<script>\s*// 루트의 입시 앱과.*?</script>', '', html, flags=re.S)
html = re.sub(r'<script src="([^"]+)"></script>',
              lambda m: '<script>\n/* ' + m.group(1) + ' */\n' + read(m.group(1)).replace('</script', '<\\/script') + '</script>',
              html)
assert 'src="js/' not in html and 'href="css' not in html
with open(os.path.join(ROOT, '..', '닮은꼴스타일.html'), 'w', encoding='utf-8') as f:
    f.write(html)
print('ok', len(html))

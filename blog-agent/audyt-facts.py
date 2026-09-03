import re,glob,io,os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
FILES=(sorted(glob.glob('src/content/blog/*.md'))
       +sorted(glob.glob('src/app/**/*.tsx',recursive=True))
       +sorted(glob.glob('src/components/**/*.tsx',recursive=True)))
FILES=[f for f in FILES if '/admin/' not in f and '/konto/' not in f and '/checkout' not in f]
RULES=[
 ('A. ZMYWARKA', r'zmywar\w*'),
 ('B. ODPORNOŚĆ POZA ZAKRESEM', r'\b(rozpuszczaln\w*|benzyn\w*|tłuszcz\w*|tluszcz\w*|sól drogow\w*|soli drogow\w*|pranie|prania|tkanin\w*|na materia[łl]\w*)\b'),
 ('C. SUFIT TRWAŁOŚCI / MYJNIA', r'(myjni\w*|ciśnieniow\w*|przez lata|na lata|po latach|latami|kilka lat|wiele lat|karoseri\w*)'),
 ('D. REPOZYCJONOWALNE / WIELOKROTNE', r'(repozycjonowal\w*|wielokrotnego u[żz]ytku|wielokrotn\w* (prze)?klej\w*|wielorazow\w*|łatwo usuwaln\w*|ponownie przyklei\w*|przyklei[ćc] ponownie)'),
 ('E. OBIETNICA DORĘCZENIA', r'(dostarcz\w+ w \d|odbierzesz w \d|odbi[óo]r\w* (w |na )?paczkomaci\w*.{0,15}w \d|dotr[ąa] do (Ciebie|Was) w \d|wysyłk[aię]\w* w \d|w 72\s?h|72 godzin|paczk[aę] w \d|przesyłk[aę] w \d|u Ciebie w \d)'),
 ('F. MATERIAŁY NIEOFEROWANE', r'(hologram\w*|brokat\w*|transparentn\w*|wrapping\w*|oklejani\w* całych)'),
 ('G. DARMOWA DOSTAWA / RABAT', r'(darmow\w* (dostaw|wysyłk)\w*|rabat\w* (hurtow|ilościow)\w*|prog[ui] (ilościow|nakład)\w*|im więcej.{0,20}tym tani)'),
 ('H. SECURITY / VOID', r'("VOID"|właściwości?\w* (typu )?(security|void)|nie da si[ęe] (zdj|odklei)|zabezpieczeni\w* przed otwarciem|plomb\w* gwarantuj)'),
 ('I. GWARANCJA QR', r'(gwarant\w*.{0,30}(qr|skanow)|kod QR.{0,25}zawsze zadziała|na pewno się zeskanuje)'),
 ('J. LICZBA SZT. NA A4 JAKO GWARANCJA', r'(zmieści się (dokładnie|aż)|dokładnie \d+ naklej\w+ na (arkusz|A4)|gwarantujemy \d+ szt)'),
 ('K. DANE KONKURENCJI LICZBOWE', r'(StickerApp|Sticker\s?Mule|Redbubble|Stikets|Zap Creatives)[^.]{0,80}?(\d+\s?(zł|euro|eur|€|szt|dni|sztuk))'),
 ('L. NASZ GENERATOR AI (HOLD)', r'(nasz\w*|wbudowan\w*|w kreatorze)[^.]{0,40}generator\w*\s+ai|generator ai\s+w cenie'),
 ('M. "ZAPROJEKTUJ" NAKLEJKĘ/GRAFIKĘ', r'(zaprojektuj|projektowani\w*|projektuj\w*)\s+(własn\w+\s+)?(naklejk|grafik|wzór|wzor)'),
]
hits={}
for f in FILES:
    s=io.open(f,encoding='utf-8').read()
    lines=s.split('\n')
    for name,pat in RULES:
        for i,l in enumerate(lines,1):
            for m in re.finditer(pat,l,re.I):
                hits.setdefault(name,[]).append((f,i,l.strip()[:190],m.group(0)))
for name,_ in RULES:
    h=hits.get(name,[])
    print(f'\n{"="*100}\n### {name}  -> {len(h)} trafień')
    for f,i,l,g in h:
        print(f'  [{g}]  {f.replace("src/content/blog/","BLOG/").replace("src/app/","APP/")}:{i}')
        print(f'      {l}')

"""Generate original, self-contained fantasy item sprites and texture for a GW2-inspired fan quest.
No extracted game assets, fonts, or sound files are needed to run the project.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import random, math
D=Path(__file__).parent/'assets'
D.mkdir(exist_ok=True)
def svg(name, art, bg='#1b2527', outer=''):
    content=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs>
      <radialGradient id="back" cx="35%" cy="25%" r="85%"><stop stop-color="#58615a"/><stop offset=".5" stop-color="{bg}"/><stop offset="1" stop-color="#101315"/></radialGradient>
      <linearGradient id="gold" x1=".12" x2=".9" y1="0" y2="1"><stop stop-color="#fff1aa"/><stop offset=".25" stop-color="#c99d4b"/><stop offset=".61" stop-color="#77512d"/><stop offset=".82" stop-color="#e5bb69"/><stop offset="1" stop-color="#4d351e"/></linearGradient>
      <linearGradient id="paper" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f4e5b7"/><stop offset=".55" stop-color="#cfb783"/><stop offset="1" stop-color="#96774c"/></linearGradient>
      <linearGradient id="silver" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#eef5e4"/><stop offset=".35" stop-color="#abbab9"/><stop offset=".65" stop-color="#52676d"/><stop offset=".84" stop-color="#d3d5c4"/><stop offset="1" stop-color="#30494c"/></linearGradient>
      <linearGradient id="blue" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#d1fcff"/><stop offset=".3" stop-color="#7bc1d5"/><stop offset=".55" stop-color="#315e83"/><stop offset=".8" stop-color="#6499bd"/><stop offset="1" stop-color="#20334d"/></linearGradient>
      <linearGradient id="wood" x1="0" x2=".3" y1="0" y2="1"><stop stop-color="#a7754a"/><stop offset=".5" stop-color="#5c3227"/><stop offset="1" stop-color="#251d20"/></linearGradient>
      <radialGradient id="purple"><stop stop-color="#f6f0ff"/><stop offset=".36" stop-color="#dba9ff"/><stop offset=".7" stop-color="#9156c9"/><stop offset="1" stop-color="#392858"/></radialGradient>
      <filter id="shadow" x="-30%" width="160%" y="-30%" height="160%"><feGaussianBlur stdDeviation="3.2"/></filter>
      <filter id="glow" x="-60%" width="220%" y="-60%" height="220%"><feGaussianBlur stdDeviation="4"/></filter>
    </defs><rect width="128" height="128" fill="url(#back)"/><ellipse cx="66" cy="107" rx="43" ry="10" fill="#000" opacity=".55" filter="url(#shadow)"/>{outer}<g stroke-linejoin="round" stroke-linecap="round">{art}</g></svg>'''
    (D/f'{name}.svg').write_text(content)

book=lambda color,metal,leaf: f'''<path d="M19 29 Q39 17 63 28 L66 104 Q42 93 20 104Z" fill="{color}" stroke="{metal}" stroke-width="5"/><path d="M66 104 Q87 92 110 103 L110 29 Q87 18 63 28Z" fill="{color}" stroke="{metal}" stroke-width="5"/><path d="M65 31 66 100" stroke="{metal}" stroke-width="4"/><path d="M26 40 Q43 35 56 42 M76 42 Q88 36 101 40 M26 93 Q45 87 55 93 M77 94 Q90 89 102 93" stroke="#f9e8ac" opacity=".65" fill="none" stroke-width="2"/><circle cx="42" cy="68" r="16" fill="url(#gold)" stroke="#463525" stroke-width="3"/><path d="M42 54 L48 64 58 68 47 73 42 84 37 73 27 68 37 63Z" fill="{leaf}"/><path d="M77 57 Q91 52 99 60 M77 70 Q91 65 99 73 M77 83 Q89 79 98 85" stroke="{metal}" fill="none" stroke-width="2"/>'''
svg('book-1',book('#60503b','#b79557','#efe4ac'),'#293129')
svg('book-2',book('#303b4c','#9ba9b0','#c7e2e1'),'#202b34')
svg('book-3',book('#49384e','#bca1bd','#e2c9ff'),'#2b213b')
svg('book-final',f'''<circle cx="65" cy="65" r="47" fill="url(#purple)" opacity=".53" filter="url(#glow)"/>{book('#453355','url(#gold)','#faf1d5')}<path d="M40 50 43 29 46 50M24 68l-9 -6 11 1M102 68l10 -7 -9 1" stroke="#faf0cc" stroke-width="3" fill="none"/>''','#34263e')
svg('junk-seal','''<path d="M32 28 92 26 104 93 67 111 21 93Z" fill="url(#wood)" stroke="url(#gold)" stroke-width="6"/><path d="M34 39 87 38 93 86 66 101 33 85Z" fill="#553831" stroke="#ae8055" stroke-width="3"/><circle cx="65" cy="66" r="23" fill="url(#gold)" stroke="#332b2a" stroke-width="3"/><path d="M51 74 49 52 65 62 81 52 79 74 65 84Z" fill="#382e2b"/><circle cx="58" cy="65" r="2" fill="#efddad"/><circle cx="72" cy="65" r="2" fill="#efddad"/>''','#272628')
svg('junk-tooth','''<path d="M32 25 Q44 15 54 25L83 46 Q96 52 100 29 104 88 69 116 72 89 49 73L22 62Q16 44 32 25Z" fill="url(#silver)" stroke="#384244" stroke-width="5"/><path d="M33 32Q58 49 77 57M54 66Q77 73 76 91" stroke="#eef0d9" stroke-width="4" fill="none"/><path d="M27 53 44 67M87 50l-9 21" stroke="#514d4b" stroke-width="2"/>''','#293031')
svg('junk-box','''<path d="M24 45 65 23 106 43 106 94 65 116 24 94Z" fill="url(#wood)" stroke="#c99e65" stroke-width="4"/><path d="M24 45 66 68 106 43M65 68V115" fill="none" stroke="#241d1b" stroke-width="5"/><path d="M45 34 85 53M43 56 43 103M89 55 89 100" stroke="url(#gold)" stroke-width="9"/><circle cx="66" cy="75" r="10" fill="url(#gold)" stroke="#261e1c" stroke-width="3"/><path d="M66 69v12" stroke="#492c1a" stroke-width="3"/>''','#29302a')
svg('material-dust','''<path d="M23 94 Q25 68 44 72L58 47 75 75Q102 73 103 98Z" fill="url(#silver)" stroke="#6e8581" stroke-width="3"/><path d="M47 40 54 14 60 40 82 47 60 53 54 81 48 53 26 47Z" fill="#d9f5f5" stroke="#6b9eac" stroke-width="2"/><path d="M90 38l5-13 4 13 13 5-13 4-4 14-5-14-13-4Z" fill="#e6ffff"/><circle cx="39" cy="68" r="5" fill="#d4f7ff"/><circle cx="85" cy="79" r="6" fill="#83d5f0"/>''','#23383c')
svg('material-ore','''<path d="M19 90 37 44 72 28 104 52 110 98 65 112Z" fill="url(#silver)" stroke="#2f4048" stroke-width="4"/><path d="M41 48 59 64 65 107 35 98ZM74 33 84 62 109 96 104 52Z" fill="url(#blue)" stroke="#7aafb7" stroke-width="3"/><path d="M59 64 84 62 65 107" fill="#4b788f"/><path d="M45 51 75 34" stroke="#e0f4e7" stroke-width="4"/>''','#24313c')
svg('material-shard','''<path d="M58 9 93 36 87 102 60 121 27 95 37 33Z" fill="url(#blue)" stroke="#a3d6dd" stroke-width="4"/><path d="M58 10 63 67 60 120M37 33 63 67 93 36M27 95 63 67 87 102" stroke="#c7faff" stroke-width="3" fill="none" opacity=".7"/><path d="M58 10 63 67 37 33" fill="#e6ffff" opacity=".5"/><path d="M63 67 87 102 60 120" fill="#214a7d" opacity=".65"/>''','#273c52')
svg('material-eternal', '''<circle cx="64" cy="64" r="50" fill="url(#purple)" opacity=".5" filter="url(#glow)"/><path d="M64 8 80 43 117 64 80 80 64 118 46 80 12 64 46 44Z" fill="#d2b4ec" stroke="#fff0fd" stroke-width="3"/><path d="M64 12 64 112M16 64h96M42 42 87 88M87 40 41 90" stroke="#f7e9ff" stroke-width="2" opacity=".7"/>''','#372442')
svg('collectible-anchor','''<path d="M64 12v90M45 39h38" stroke="url(#gold)" stroke-width="11" fill="none"/><circle cx="64" cy="17" r="10" fill="none" stroke="url(#gold)" stroke-width="7"/><path d="M19 75Q20 106 64 112q45-6 45-37l-15 13M19 75l15 12" fill="none" stroke="url(#gold)" stroke-width="9"/><path d="M50 102h27" stroke="#f5dc94" stroke-width="3"/>''','#28393b')
svg('collectible-caravan','''<path d="M16 83 28 45 64 21 100 45 113 83 65 113Z" fill="url(#gold)" stroke="#2a211c" stroke-width="5"/><path d="M64 32 91 52 99 79 65 99 30 80 37 52Z" fill="#493830" stroke="#e6b968" stroke-width="4"/><path d="M39 75 52 57 77 57 91 75" stroke="#dfb972" stroke-width="5" fill="none"/><circle cx="47" cy="79" r="8" fill="#9e876a" stroke="#e6b968" stroke-width="3"/><circle cx="81" cy="79" r="8" fill="#9e876a" stroke="#e6b968" stroke-width="3"/>''','#302923')
svg('collectible-captain','''<path d="M64 10 75 37 110 43 84 67 93 109 64 92 34 109 44 67 17 43 53 37Z" fill="url(#gold)" stroke="#442c21" stroke-width="5"/><circle cx="64" cy="63" r="21" fill="#294551" stroke="#ead39c" stroke-width="5"/><path d="M64 46v35M48 58h32M54 77Q64 87 74 77" stroke="#e7daac" stroke-width="4" fill="none"/>''','#344046')
svg('collectible-final','''<path d="M64 5 80 30 111 22 101 55 123 78 88 86 79 120 64 99 47 120 40 85 5 78 27 54 17 22 48 30Z" fill="url(#gold)" stroke="#f7e4b7" stroke-width="4"/><path d="M43 47 64 32 85 47 81 83 65 94 47 83Z" fill="#703a57" stroke="#f5d88e" stroke-width="4"/><circle cx="57" cy="61" r="4" fill="#ffdcad"/><circle cx="74" cy="61" r="4" fill="#ffdcad"/><path d="M54 77 65 83 78 77" stroke="#d0a858" fill="none" stroke-width="4"/>''','#3c2d40')
svg('collectible-sigil','''<circle cx="64" cy="64" r="49" fill="url(#gold)" stroke="#403020" stroke-width="5"/><circle cx="64" cy="64" r="37" fill="#3e3a47" stroke="#e5c983" stroke-width="5"/><path d="M64 25 75 51 103 64 75 75 64 103 52 75 25 64 52 52Z" fill="#dca3ee" stroke="#e7d9fd" stroke-width="3"/><circle cx="64" cy="64" r="10" fill="#f5dba2"/>''','#3f3847')
# a soft-grain, painted environment -- unique original (not a game screenshot)
w,h=1600,1000
im=Image.new('RGB',(w,h)); px=im.load(); rng=random.Random(101)
for y in range(h):
 t=y/h
 for x in range(w):
  mist= max(0,1-abs(x-515)/900) * max(0,1-abs(y-255)/500)
  noise=rng.randrange(-9,10)
  color=(int(39+52*(1-t)+20*mist+noise),int(54+58*(1-t)+23*mist+noise),int(58+52*(1-t)+19*mist+noise))
  px[x,y]=tuple(max(0,min(255,k)) for k in color)
d=ImageDraw.Draw(im,'RGBA')
# drifting distant clouds
for i in range(35):
 x=rng.randrange(-150,w); y=rng.randrange(10,480); rx=rng.randrange(100,340)
 d.ellipse((x-rx,y-40,x+rx,y+40), fill=(170,183,163,rng.randint(5,20)))
# staggered mountains
mountain_sets=[(440,(32,60,61,180),110),(545,(24,49,55,210),80),(665,(22,42,46,240),55)]
for baseline,color,amp in mountain_sets:
 pts=[(-150,h),(-150,baseline)]
 for x in range(-120,w+140,80):pts.append((x,baseline+rng.randint(-amp,amp)))
 pts += [(w+150,h)]
 d.polygon(pts,fill=color)
# lighthouse + distant city towers
for i in range(33):
 x=rng.randint(-20,w+50); base=rng.randint(705,850); width=rng.randint(12,50); height=rng.randint(40,185)
 d.rectangle((x,base-height,x+width,base),fill=(14,29,31,rng.randint(85,210)))
 if i%3==0:
  d.polygon([(x-9,base-height),(x+width/2,base-height-45),(x+width+7,base-height)],fill=(18,32,34,205))
for x,y,scale in [(235,670,1.5),(480,720,.9),(1160,745,1.2)]:
 tw=50*scale
 d.rectangle((x,y-200*scale,x+tw,y), fill=(12,28,29,210))
 d.polygon([(x-12,y-200*scale),(x+tw/2,y-260*scale),(x+tw+12,y-200*scale)],fill=(14,28,30,220))
 d.ellipse((x+tw*.25,y-180*scale,x+tw*.75,y-135*scale), fill=(157,162,126,70))
# wisps of shallow harbor mist
d.polygon([(0,800),(w,780),(w,h),(0,h)],fill=(8,27,28,205))
for i in range(60):
 x=rng.randrange(w);y=rng.randint(760,h);rx=rng.randint(35,190)
 d.line((x,y,x+rx,y),fill=(132,159,148,rng.randint(10,39)),width=rng.randint(1,4))
im=im.filter(ImageFilter.GaussianBlur(1.5))
im.save(D/'tyria-harbor.webp',quality=83)
# Seamless-ish stone/cloth noise, translucent over panels
rr=random.Random(606); W=192; tex=Image.new('RGBA',(W,W),(100,105,100,0)); tp=tex.load()
for y in range(W):
 for x in range(W):
  z=rr.random();p=0 if z<.35 else int(z*32)
  tp[x,y]=(220,210,173,p)
tex.save(D/'granite-grain.png',optimize=True)
print('created',len(list(D.iterdir())),'assets')

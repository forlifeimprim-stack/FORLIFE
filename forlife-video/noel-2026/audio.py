# Musique originale + bruitages synthétisés (numpy), aucun fichier tiers. Sortie : out/audio.wav (-14 LUFS via ffmpeg).
import numpy as np, wave, subprocess, re, json
SR=48000; BPM=120; BT=60/BPM
Q=dict(re.findall(r'(\w+):([\d.]+)', open('cues.js').read())); Q={k:float(v) for k,v in Q.items()}
N=int((Q['END']+0.5)*SR); L=np.zeros(N); R=np.zeros(N)
rng=np.random.default_rng(5)
def add(sig,t,g=1.0,pan=0.0):
    i=int(t*SR); 
    if i>=N or i<0: return
    sig=sig[:N-i]; L[i:i+len(sig)]+=sig*g*(1-max(0,pan)); R[i:i+len(sig)]+=sig*g*(1+min(0,pan))
def tt(d): return np.arange(int(d*SR))/SR
def hz(m): return 440*2**((m-69)/12)
def bell(m,d=1.4):
    t=tt(d); f=hz(m)
    return (np.sin(2*np.pi*f*t)+.5*np.sin(2*np.pi*f*2.76*t)*np.exp(-t*9)+.25*np.sin(2*np.pi*f*5.4*t)*np.exp(-t*14))*np.exp(-t*4.2)*np.minimum(1,t*800)
def pad(ms,d):
    t=tt(d); s=sum(np.sin(2*np.pi*hz(m)*t)+.3*np.sin(2*np.pi*hz(m)*2*t) for m in ms)/len(ms)
    return s*np.minimum(1,t*4)*np.minimum(1,(d-t)*4)
def bass(m,d=.45):
    t=tt(d); f=hz(m); return (np.sin(2*np.pi*f*t)+.4*np.sin(4*np.pi*f*t))*np.exp(-t*5)*np.minimum(1,t*300)
def kick():
    t=tt(.25); return np.sin(2*np.pi*(45*t+ 60*(1-np.exp(-t*30))/30))*np.exp(-t*16)
def sleigh():
    t=tt(.16); n=rng.standard_normal(len(t)); n=np.diff(n,prepend=0); n=np.diff(n,prepend=0)
    return n*np.exp(-t*38)*(1+.6*np.sin(2*np.pi*5200*t))*.25
def whoosh(d=.6):
    t=tt(d); n=np.cumsum(rng.standard_normal(len(t))); n-=np.linspace(n[0],n[-1],len(n)); n/=np.abs(n).max()+1e-9
    hp=np.diff(rng.standard_normal(len(t)),prepend=0)*.4
    return (n*.5+hp)*np.sin(np.pi*t/d)**2
def pop(f0=500,f1=1100,d=.12):
    t=tt(d); f=np.linspace(f0,f1,len(t)); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*30)
def thump():
    t=tt(.3); return np.sin(2*np.pi*np.cumsum(np.linspace(150,45,len(t)))/SR)*np.exp(-t*12)
def chime(ms,gap=.06):
    d=2.2; s=np.zeros(int((d+gap*len(ms))*SR))
    for i,m in enumerate(ms): b=bell(m,d); j=int(i*gap*SR); s[j:j+len(b)]+=b
    return s
# --- musique : C | Am | F | G, mélodie originale au glockenspiel
CH=[[60,64,67],[57,60,64],[53,57,60],[55,59,62]]; BS=[36,33,29,31]
MEL=[[76,None,79,76, 72,None,74,76],[72,None,76,72, 69,None,72,74],[77,None,81,77, 76,None,72,74],[74,None,79,77, 74,71,74,None],
     [79,None,76,79, 84,None,83,79],[81,None,76,72, 76,None,74,72],[77,79,81,None, 84,None,81,77],[79,None,83,None, 86,None,None,None]]
nb=int(Q['END']/ (4*BT))+1
for b in range(nb):
    t0=b*4*BT; c=b%4
    intro = b<1
    add(pad(CH[c],4*BT+.2),t0,.10 if not intro else .07)
    add(pad([m+12 for m in CH[c]],4*BT+.2),t0,.035)
    for k in range(8):
        tk=t0+k*BT/2
        if not intro or k%2==0: add(sleigh(),tk,.5 if k%2==0 else .28, pan=.3 if k%2 else -.3)
        m=MEL[b%8][k]
        if m and b>=1: add(bell(m),tk,.16,pan=.15*np.sin(k))
    if b>=1:
        for k in (0,1.5,2,3): add(bass(BS[c]+12),t0+k*BT,.22)
        for k in (0,2): add(kick(),t0+k*BT,.35)
# intro : arpège de cloches
for i,m in enumerate([72,76,79,84]): add(bell(m,1.8),0.75+i*0.12,.2)
# --- bruitages calés sur l'animation
for k in ('B','C1','D','E'): add(whoosh(.6),Q[k]-.42,.22)
add(whoosh(.5),Q['C2']-.2,.14,pan=-.4); add(whoosh(.5),Q['C1']-.05,.12,pan=.4); add(whoosh(.7),Q['F']-.1,.2)
add(chime([72,76,79,84,88]),Q['D'],.26); add(thump(),Q['D']+.02,.5)
add(chime([79,84,88]),Q['C3'],.16)
for k in ('D1','D2'): add(thump(),Q[k],.45); add(pop(600,1400),Q[k]+.01,.3); add(chime([84,91]),Q[k]+.05,.14)
add(pop(900,1500),Q['D3'],.2)
for i,k in enumerate(('E1','E2','E3','E4','E5')): add(pop(520+60*i,1000+120*i),Q[k],.34); add(bell(79+[0,2,4,5,7][i],.8),Q[k],.12)
add(chime([84,88,91,96]),Q['E5']+.05,.16)
add(pop(400,900),Q['E']+.6,.25); add(thump(),Q['F']+.35,.35); add(thump(),Q['F']+.53,.3); add(pop(700,1300),Q['F1']+.1,.28)
add(chime([72,79,84,88,91,96],.09),Q['F1']+.3,.2)
for i,t0 in enumerate((.75,.87,.99)): add(pop(500+150*i,900+200*i),t0,.3)
# --- voix off : phrases replacées sur la timeline, musique baissée dessous
VO=json.loads(re.search(r'window\.VO = (\[.*\]);', open('cues.js').read()).group(1))
raw=subprocess.run(['ffmpeg','-loglevel','error','-i','work/vo.mp3','-f','s16le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout
v=np.frombuffer(raw,dtype='<i2').astype(float)/32768; v/=np.abs(v).max()
VT=np.zeros(N); pres=np.zeros(N)
for a0,a1,t0 in VO:
    c=v[int(a0*SR):int(a1*SR)].copy(); f=int(.02*SR); c[:f]*=np.linspace(0,1,f); c[-f:]*=np.linspace(1,0,f)
    i=int(t0*SR); c=c[:N-i]; VT[i:i+len(c)]+=c; pres[i:i+len(c)]=1
k=int(.25*SR); duck=np.convolve(pres,np.ones(k)/k,'same'); g=1-0.62*duck
mrms=np.sqrt(np.mean((L*g)[pres>0]**2)+1e-12); vrms=np.sqrt(np.mean(VT[pres>0]**2))
VT*= (mrms/vrms)*3.2
L=L*g+VT; R=R*g+VT
# fondu de fin
env=np.ones(N); f=int(1.6*SR); e0=int(Q['END']*SR); env[e0-f:e0]=np.linspace(1,0,f)**1.5; env[e0:]=0
x=np.stack([L,R],1)*env[:,None]; x/=np.abs(x).max()*1.05
w=wave.open('out/music_raw.wav','wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x*32767).astype('<i2').tobytes()); w.close()
r=subprocess.run(['ffmpeg','-hide_banner','-i','out/music_raw.wav','-af','loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json','-f','null','-'],capture_output=True,text=True).stderr
m=json.loads(r[r.rindex('{'):])
subprocess.run(['ffmpeg','-y','-loglevel','error','-i','out/music_raw.wav','-af',f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true",'-ar','48000','-t',str(Q['END']),'out/audio.wav'],check=True)
print('audio ok',m['input_i'])

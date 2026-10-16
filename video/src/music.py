import numpy as np, wave, sys
SR=48000; DUR=22.5; N=int(SR*DUR); t=np.arange(N)/SR
out=np.zeros((N,2))
rng=np.random.default_rng(7)
def add(sig,start,gain=1.0,pan=0.0):
    i=int(start*SR); sig=sig[:max(0,N-i)]
    out[i:i+len(sig),0]+=sig*gain*(1-pan*0.5); out[i:i+len(sig),1]+=sig*gain*(1+pan*0.5)
def lp(x,a):  # one-pole lowpass
    y=np.empty_like(x); acc=0.0
    a=np.broadcast_to(a,x.shape)
    for k in range(len(x)): acc+=a[k]*(x[k]-acc); y[k]=acc
    return y
BPM=120; beat=60/BPM
# kick
kt=np.arange(int(0.35*SR))/SR
kick=np.sin(2*np.pi*(45*kt+ (110/18)*(1-np.exp(-18*kt))))*np.exp(-kt*9)
kick+= 0.3*np.sin(2*np.pi*1800*kt)*np.exp(-kt*120)
# hat
ht=np.arange(int(0.06*SR))/SR
def hat(): n=rng.standard_normal(len(ht)); n=np.diff(np.concatenate([[0],n])); return n*np.exp(-ht*70)*0.5
# clap/snare
st=np.arange(int(0.2*SR))/SR
def snare(): n=rng.standard_normal(len(st)); n=n-lp(n,0.05); return n*np.exp(-st*22)*0.6
# chords Am F C G (A minor) – pad, 4 beats each
notes={'A':[220,261.63,329.63],'F':[174.61,220,261.63],'C':[196,261.63,329.63],'G':[196,246.94,293.66]}
bass={'A':55,'F':43.65,'C':65.41,'G':49}
prog=['A','F','C','G']
END_DROP=14.6
for bi in range(int(DUR/beat)):
    bt=bi*beat
    if bt<1.0-1e-6: continue
    if bt< END_DROP or bt>=15.0:
        add(kick,bt,0.9)
        add(hat(),bt+beat/2,0.35,0.4)
        if bi%2==1: add(snare(),bt,0.35)
    if bi%4==0:
        ch=prog[(bi//4)%4]; L=4*beat
        lt=np.arange(int(L*SR))/SR
        env=np.minimum(1,lt/0.05)*np.exp(-lt*0.25)
        pad=sum(np.sign(np.sin(2*np.pi*f*lt*(1+d)))*0.12 for f in notes[ch] for d in (-0.003,0.003))
        add(lp(pad*env,0.04),bt,0.5)
        # bass 8ths
        for e in range(8):
            et=np.arange(int(beat/2*SR))/SR
            b=np.sin(2*np.pi*bass[ch]*et)+0.3*np.sin(2*np.pi*2*bass[ch]*et)
            add(b*np.exp(-et*6),bt+e*beat/2,0.45)
# intro: shimmer riser 0-1s
rt=np.arange(int(1.0*SR))/SR
n=rng.standard_normal(len(rt)); add(lp(n,0.02+0.3*rt)*(rt**2)*0.8,0.0,1.0)
# whooshes at transitions
def whoosh(d=0.5):
    wt=np.arange(int(d*SR))/SR; n=rng.standard_normal(len(wt))
    env=np.sin(np.pi*wt/d)**2
    a=0.01+0.25*np.sin(np.pi*wt/d)
    y=np.empty_like(n); acc=0
    for k in range(len(n)): acc+=a[k]*(n[k]-acc); y[k]=acc
    return y*env*2.2
for tt in (0.85,3.77,7.55,11.35,14.45): add(whoosh(),tt,0.9,0.3)
# impacts
it=np.arange(int(1.2*SR))/SR
boom=np.sin(2*np.pi*(38*it+ (80/6)*(1-np.exp(-6*it))))*np.exp(-it*3.5)
for tt,g in ((2.5,1.0),(14.85,1.1),(18.75,0.6)): add(boom,tt,g)
# riser before end card
rt=np.arange(int(1.6*SR))/SR; n=rng.standard_normal(len(rt))
add(lp(n,0.01+0.2*(rt/1.6))*(rt/1.6)**3*1.2,13.0,1.0)
# fade out
fo=np.clip((DUR-t)/1.5,0,1)[:,None]; out*=fo
out/=np.abs(out).max()*1.12
with wave.open(sys.argv[1],'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767).astype('<i2').tobytes())

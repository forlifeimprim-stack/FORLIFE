import numpy as np, json, sys
S=sys.argv[1]
# (first_seen, last_seen, text) read from burned-in captions (sampled every 0.25s)
CAPS=[(0.0,0.9,"Je choisis"),(2.25,3.1,"d'aimer Dieu"),(5.25,8.1,"même si je ne comprends pas ce qu'il fait"),
(9.75,10.9,"Je choisis"),(12.0,14.9,"d'aimer Dieu. Et lorsque tu choisis d'aimer Dieu,"),
(15.75,17.1,"alors là, c'est plus la terre qui"),(17.25,18.6,"parle, parce que la terre, elle parle plus."),
(20.25,21.1,"Là,"),(22.0,24.1,"tu regardes le ciel et c'est comme un"),(25.0,25.6,"c'est tellement privé."),
(26.25,28.1,"J'ai du mal à vous l'exprimer, mais l'adoration"),(28.25,30.1,"c'est lorsque tu regardes à Dieu,"),
(30.5,31.6,"tu le regardes pour qui il est"),(31.75,33.1,"et non plus pour ce qu'il fait pour toi."),
(33.5,34.9,"Tu regardes Dieu pour qui il est"),(35.25,35.9,"et tu dis : Dieu,"),(38.5,39.1,"je sais"),
(39.25,42.1,"que tu te lèveras le dernier sur la terre des vivants."),(42.5,44.4,"Je sais que tu as le dernier mot."),
(46.25,47.0,"Je comprends pas,"),(47.75,49.1,"mais je choisis de dire"),
(49.75,53.1,"que tu es le Dieu de l'impossible et des miracles"),(53.75,54.9,"que je n'ai pas vu,"),
(56.25,58.9,"que tu es le Dieu de toute éternité, celui qui était,"),(59.75,61.1,"qui est et qui sera.")]
FPS=10
strip=np.fromfile(S+"/cap/strip.raw",dtype=np.uint8).reshape(-1,110,478)  # rows 540..650 of source
a=np.fromfile(S+"/a16.raw",dtype=np.int16).astype(float)/32768
hop=160; env=np.sqrt(np.convolve(a**2,np.ones(400)/400,'same')[::hop])  # 100 Hz
db=20*np.log10(env+1e-9)
out=[]
for i,(fs,ls,txt) in enumerate(CAPS):
    s=max(0,fs-0.25); e=ls+0.25
    # old box bbox (source px)
    fr=strip[int((fs+0.05)*FPS):int(ls*FPS)+1]
    m=(fr>238).mean(0)
    rows=np.where((m>0.35).mean(1)>0.25)[0]; cols=np.where((m>0.35).mean(0)>0.25)[0]
    if len(rows) and len(cols):
        box=[int(cols.min()),int(rows.min())+540,int(cols.max()),int(rows.max())+540]
    else: box=None
    # word timing: distribute over voiced frames
    words=txt.split()
    ws=int(s*100); we=int(min(e+0.2,64.7)*100)
    seg=db[ws:we]; thr=max(seg.max()-22,-30)
    voiced=np.where(seg>thr)[0]
    if len(voiced)<3: voiced=np.arange(len(seg))
    v0,v1=voiced[0],voiced[-1]
    vt=np.arange(v0,v1+1); w=(seg[v0:v1+1]>thr).astype(float)+0.15
    cum=np.cumsum(w); cum/=cum[-1]
    L=np.array([len(x)+1.5 for x in words]); cl=np.concatenate([[0],np.cumsum(L)/L.sum()])
    times=[(ws+vt[min(np.searchsorted(cum,c),len(vt)-1)])/100 for c in cl]
    wl=[{"w":words[k],"t0":round(times[k],3),"t1":round(times[k+1],3)} for k in range(len(words))]
    out.append({"i":i,"s":round(s,3),"e":round(e,3),"box":box,"text":txt,"words":wl})
    print(i,box,wl[0]["t0"],wl[-1]["t1"],txt)
json.dump(out,open(S+"/build/captions.json","w"),ensure_ascii=False,indent=1)

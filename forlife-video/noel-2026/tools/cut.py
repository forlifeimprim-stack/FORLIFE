import sys
from PIL import Image
from rembg import remove, new_session
s = new_session('isnet-general-use')
jobs = {
 'kids1': ('assets/affiche1.png', (0,180,880,1215)),
 'kids2': ('assets/affiche2.png', (420,70,1230,1110)),
 'noel1': ('assets/affiche1.png', (590,100,1162,480)),
 'sign2': ('assets/affiche2.png', (0,180,580,620)),
 'gifts2': ('assets/affiche2.png', (470,990,1040,1140)),
 'gift1': ('assets/affiche1.png', (1010,1080,1162,1215)),
}
for k,(f,box) in jobs.items():
    im = Image.open(f).convert('RGB').crop(box)
    im = im.resize((im.width*2, im.height*2), Image.LANCZOS)
    out = remove(im, session=s, post_process_mask=True)
    out.save(f'assets/{k}.png')
    bg = Image.new('RGB', out.size, (40,90,200)); bg.paste(out, mask=out.split()[3]); bg.thumbnail((700,700)); bg.save(f'work/prev_{k}.jpg')
    print(k, out.size)

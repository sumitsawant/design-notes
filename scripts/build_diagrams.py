"""Build accessible SVG diagrams from the lesson content. Uses Python's standard library."""
from pathlib import Path
from html import escape
import json

ROOT = Path(__file__).resolve().parents[1]
INK, MINT, PAPER, LINE = '#294637', '#edf4ed', '#ffffff', '#a5b8a9'
def text(x,y,value,size=15,anchor='middle',color=INK,halo=False):
    return f'<text x="{x}" y="{y}" fill="{color}" font-family="Arial, sans-serif" font-size="{size}" text-anchor="{anchor}" paint-order="stroke" stroke="{PAPER}" stroke-width="{4 if halo else 0}" stroke-linejoin="round">{escape(value)}</text>'
def svg(title,description,body,height):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="900" height="{height}" viewBox="0 0 900 {height}" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(description)}</desc><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="{INK}"/></marker></defs><rect width="900" height="{height}" rx="12" fill="{PAPER}"/>{body}</svg>'''
def sequence(title,actors,steps):
    xs=[65+i*770/(len(actors)-1) for i in range(len(actors))]
    h=125+len(steps)*68
    b=text(30,30,title,14,'start')
    for x,name in zip(xs,actors):
        b+=f'<rect x="{x-62}" y="50" width="124" height="42" rx="6" fill="{MINT}"/>'
        b+=text(x,76,name,14)
        b+=f'<path d="M{x} 96V{h-15}" stroke="{LINE}" stroke-dasharray="4 6"/>'
    for i,(sender,receiver,label) in enumerate(steps):
        y=130+i*68;a=xs[sender];z=xs[receiver]
        if sender==receiver:
            b+=f'<rect x="15" y="{y-25}" width="870" height="44" rx="5" fill="#f4ebda"/>'
            b+=text(450,y+2,f'{i+1}. {label}',14)
        else:
            b+=text((a+z)/2,y-10,f'{i+1}. {label}',14,halo=True)
            b+=f'<path d="M{a} {y}H{z}" fill="none" stroke="{INK}" stroke-width="1.5" marker-end="url(#arrow)"/>'
    desc=' '.join(f'{i+1}. {actors[a]} to {actors[z]}: {label}.' for i,(a,z,label) in enumerate(steps))
    return svg(title,desc,b,h)
def architecture(title,nodes,edges):
    positions=[(55,105),(355,105),(655,105),(55,285),(355,285),(655,285)]
    b=text(30,35,title,16,'start')
    for a,z,label in edges:
        ax,ay=positions[a];zx,zy=positions[z]
        if ay==zy:
            if ax<zx:x1,y1,x2,y2=ax+190,ay+34,zx,zy+34
            else:x1,y1,x2,y2=ax,ay+34,zx+190,zy+34
            path=f'M{x1} {y1}H{x2}';lx=(x1+x2)/2;ly=y1-13
        else:
            x1,y1,x2,y2=ax+95,ay+68,zx+95,zy
            path=f'M{x1} {y1}V{(y1+y2)/2}H{x2}V{y2}';lx=(x1+x2)/2+10;ly=(y1+y2)/2-12
        b+=f'<path d="{path}" fill="none" stroke="{INK}" stroke-width="1.6" marker-end="url(#arrow)"/>'+text(lx,ly,label,12,halo=True)
    for (name,note),(x,y) in zip(nodes,positions):
        b+=f'<rect x="{x}" y="{y}" width="190" height="68" rx="8" fill="{MINT if name not in ["Client","Customer"] else "#eeeee6"}" stroke="#ccdbcc"/>'
        b+=text(x+95,y+28,name,17)+text(x+95,y+49,note,12,color='#62675f')
    desc=' '.join(f'{nodes[a][0]} to {nodes[z][0]}: {label}.' for a,z,label in edges)
    return svg(title,desc,b,400 if len(nodes)>3 else 225)

def build():
    lessons=json.loads((ROOT/'lessons.json').read_text())
    out=ROOT/'diagrams';out.mkdir(exist_ok=True)
    for key,l in lessons.items():
        a=l['architecture']
        (out/f'{key}-system.svg').write_text(architecture(l['name']+' / System',a['nodes'],a['edges']))
        for kind in ['sequence','recovery']:
            s=l[kind]
            (out/f'{key}-{kind}.svg').write_text(sequence(s['title'],s['actors'],s['steps']))
    (ROOT/'lessons.js').write_text("'use strict';\nconst lessons = "+json.dumps(lessons,ensure_ascii=False,indent=2)+';\n')
    print(f'Built {len(lessons)*3} diagrams and lessons.js')
if __name__=='__main__':build()

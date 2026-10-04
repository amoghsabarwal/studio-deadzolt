"""Art Direction: a soft twisted chrome loop.

A rounded-square ring that turns five quarter-turns on its way around, so
light runs across it in a continuous ribbon. Self-initiated material study
in the spirit of "Soft Structures". Faces -Y in Blender (+Z in three.js).

Built as a direct sweep rather than a distance field: the twist makes the
field badly behaved, while a swept rounded square is exact, with true flat
faces and tight radiused edges.
"""

import math
import os
import sys

import bmesh
import bpy
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dz_lib as dz  # noqa: E402

R = 0.98
HALF = 0.27
CORNER = 0.045  # small radius on the section's corners: a crisp, hard edge
TWIST = 1.25  # five quarter turns: the square section lines up with itself
SEG_LOOP = 384
SIDE_STEPS = 6  # points along each half-side of the section
CORNER_STEPS = 9  # points round each corner


def quarter(half):
    """One quarter of a rounded square, from the middle of the right side to
    the middle of the top, spaced by arc length so the flats stay flat."""
    flat = half - CORNER
    pts = []
    for i in range(SIDE_STEPS):
        pts.append((half, flat * i / SIDE_STEPS))
    for i in range(CORNER_STEPS):
        a = 0.5 * math.pi * i / CORNER_STEPS
        pts.append((flat + CORNER * math.cos(a), flat + CORNER * math.sin(a)))
    for i in range(SIDE_STEPS):
        pts.append((flat * (1 - i / SIDE_STEPS), half))
    return pts


SEG_SECTION = 4 * (2 * SIDE_STEPS + CORNER_STEPS)


def section(half):
    q = np.array(quarter(half))
    rings = [q]
    for k in range(1, 4):
        c, s = math.cos(k * math.pi / 2), math.sin(k * math.pi / 2)
        rings.append(np.stack([q[:, 0] * c - q[:, 1] * s, q[:, 0] * s + q[:, 1] * c], axis=1))
    return np.concatenate(rings)


def build_loop():
    th = np.linspace(0, 2 * math.pi, SEG_LOOP, endpoint=False)
    us, vs = [], []
    for t in th:
        sec = section(HALF * (1 + 0.12 * math.sin(2 * t + 0.6)))
        a = TWIST * t
        us.append(sec[:, 0] * math.cos(a) - sec[:, 1] * math.sin(a))
        vs.append(sec[:, 0] * math.sin(a) + sec[:, 1] * math.cos(a))
    ur, vr = np.array(us), np.array(vs)
    TH = np.repeat(th[:, None], SEG_SECTION, axis=1)
    rad = R + ur
    verts = np.stack([rad * np.cos(TH), vr, rad * np.sin(TH)], axis=-1).reshape(-1, 3)

    shift = SEG_SECTION // 4
    faces = []
    for i in range(SEG_LOOP):
        last = i == SEG_LOOP - 1
        i2 = 0 if last else i + 1
        for j in range(SEG_SECTION):
            j1 = (j + 1) % SEG_SECTION
            a0 = i * SEG_SECTION + j
            a1 = i * SEG_SECTION + j1
            b0 = i2 * SEG_SECTION + ((j + shift) % SEG_SECTION if last else j)
            b1 = i2 * SEG_SECTION + ((j1 + shift) % SEG_SECTION if last else j1)
            faces.append((a0, a1, b1, b0))

    me = bpy.data.meshes.new("SoftLoop")
    me.from_pydata(verts.tolist(), [], faces)
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(me)
    bm.free()
    me.shade_smooth()
    obj = bpy.data.objects.new("SoftLoop", me)
    bpy.context.scene.collection.objects.link(obj)
    print(f"  SoftLoop: {dz.tri_count(obj)} triangles", flush=True)
    return obj


def main():
    dz.reset()
    obj = build_loop()
    dz.assign(obj, dz.chrome("HoloChrome"))
    dz.export("loop-art-direction", [obj])

    obj.rotation_euler = (math.radians(14), math.radians(-28), math.radians(8))
    dz.studio(cam_loc=(0, -9.5, 0.9), lens=60)
    dz.render("loop-art-direction")
    dz.save_blend("loop-art-direction")


main()

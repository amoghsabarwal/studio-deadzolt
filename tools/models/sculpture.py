"""Art Direction: a soft twisted chrome loop.

A rounded-square ring that turns five quarter-turns on its way around, so
light runs across it in a continuous ribbon. Self-initiated material study
in the spirit of "Soft Structures". Faces -Y in Blender (+Z in three.js).

Built as a direct sweep rather than a distance field: the twist makes the
field badly behaved, while a swept superellipse is exact and evenly spaced.
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
SQUARENESS = 3.2  # superellipse exponent: 2 is round, higher is squarer
TWIST = 1.25  # five quarter turns: the square section lines up with itself
SEG_LOOP = 384
SEG_SECTION = 72  # divisible by 4 so the quarter-turn seam lines up


def section(t, half):
    c, s = np.cos(t), np.sin(t)
    e = 2.0 / SQUARENESS
    return half * np.sign(c) * np.abs(c) ** e, half * np.sign(s) * np.abs(s) ** e


def build_loop():
    th = np.linspace(0, 2 * math.pi, SEG_LOOP, endpoint=False)
    t = np.linspace(0, 2 * math.pi, SEG_SECTION, endpoint=False)
    T, TH = np.meshgrid(t, th)  # rows: along the loop
    half = HALF * (1 + 0.12 * np.sin(2 * TH + 0.6))
    u, v = section(T, half)
    a = TWIST * TH
    ur = u * np.cos(a) - v * np.sin(a)
    vr = u * np.sin(a) + v * np.cos(a)
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

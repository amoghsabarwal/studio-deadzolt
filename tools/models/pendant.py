"""Branding: the D monogram as a solid chrome pendant.

Traced from public/brand/mark.webp: a rounded frame with a D-shaped window
and the star suspended inside it, its spikes fused into the frame, topped
with a bail. Faces -Y in Blender (+Z in three.js).
"""

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dz_lib as dz  # noqa: E402

HALF_W, HALF_H = 0.95, 1.18
TOP = HALF_H


def frame2d(x, z):
    outer = dz.box2d(x, z, 0, 0, HALF_W, HALF_H, 0.16)
    slot = dz.box2d(x, z, -0.196, -0.007, 0.406, 0.801, 0.07)
    bowl = dz.ellipse2d(x, z, 0.211, -0.007, 0.441, 0.801)
    hole = np.minimum(slot, bowl)
    return np.maximum(outer, -hole)


def star_in_window(x, z):
    return dz.star2d(x, z, scale=0.43, cx=0.0, cy=0.0, rot=-0.08, k=0.3)


def pendant_sdf(x, y, z):
    frame = dz.extrude_round(frame2d(x, z), y, 0.13, 0.05)
    # A raised bezel around the outer edge, like the pendant render.
    outer = dz.box2d(x, z, 0, 0, HALF_W, HALF_H, 0.16)
    bezel = dz.extrude_round(np.maximum(outer, -(outer + 0.13)), y, 0.165, 0.045)
    frame = dz.smin(frame, bezel, 0.02)
    star = dz.extrude_round(star_in_window(x, z), y, 0.105, 0.04)
    body = dz.smin(frame, star, 0.03)

    # Bail: a neck block and a loop whose opening faces sideways.
    neck = dz.extrude_round(dz.box2d(x, z, 0, TOP + 0.07, 0.13, 0.11, 0.05), y, 0.09, 0.04)
    ring_c = TOP + 0.36
    q = dz.length2(y, z - ring_c) - 0.2
    loop = dz.length2(q, x) - 0.06
    body = dz.smin(body, neck, 0.04)
    return dz.smin(body, loop, 0.03)


def main():
    dz.reset()
    obj = dz.build("DeadzoltPendant", pendant_sdf, (-1.05, -0.3, -1.3), (1.05, 0.3, 1.7), 0.0055, 50000)
    dz.assign(obj, dz.chrome("HoloChrome"))
    dz.export("pendant-branding", [obj])

    obj.rotation_euler = (math.radians(6), 0, math.radians(-24))
    obj.location = (0, 0, -0.2)
    dz.studio(cam_loc=(0, -9.5, 0.9), lens=62)
    dz.render("pendant-branding")
    dz.save_blend("pendant-branding")


main()

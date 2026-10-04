"""Motion Direction: a machined chrome control knob on a ticked dial.

Hard-surface throughout: fluted grip, chamfered edges, and a recessed top
with a spun-metal finish (fine concentric lathe grooves) cut into it. The
red indicator and glow ring carry the brand red. Stands upright (Z-up in
Blender, Y-up in three.js); spin it around that axis.
"""

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dz_lib as dz  # noqa: E402

R = 0.78
H = 0.62
RIDGES = 60
TICKS = 24
POCKET_R = 0.64  # spun face recessed inside a polished lip
POCKET_DEPTH = 0.022
LATHE_PITCH = 0.03
LATHE_DEPTH = 0.0028
LINE_IN, LINE_OUT = 0.16, 0.56


def lathe(r):
    return LATHE_DEPTH * (0.5 + 0.5 * np.cos(2 * math.pi * r / LATHE_PITCH))


def knob_sdf(x, y, z):
    r = dz.length2(x, y)
    th = np.arctan2(y, x)
    # Fluted grip, like a watch bezel, stopping short of the chamfers.
    band = np.clip((z - 0.08) / 0.03, 0, 1) * np.clip((H - 0.1 - z) / 0.03, 0, 1)
    ridge = 0.5 + 0.5 * np.cos(RIDGES * th)
    rr = r - (R - 0.016 * band * ridge)
    body = dz.chamfer_extrude(rr, z - H / 2, H / 2, 0.035, 0.004)
    # Recessed spun face with a chamfered lip.
    floor = H - POCKET_DEPTH - lathe(r)
    pocket = np.maximum(r - POCKET_R, floor - z)
    lip = np.maximum((r - POCKET_R - (z - (H - 0.012))) / dz.SQRT2, floor - z)
    pocket = np.minimum(pocket, lip)
    body = dz.smax(body, -pocket, 0.003)
    # Indicator slot through the spun face, filled by the red insert.
    slot = dz.box2d(x, y, (LINE_IN + LINE_OUT) / 2, 0, (LINE_OUT - LINE_IN) / 2, 0.022, 0.022)
    slot = np.maximum(slot, (H - POCKET_DEPTH - 0.03) - z)
    return dz.smax(body, -slot, 0.003)


def insert_sdf(x, y, z):
    line = dz.box2d(x, y, (LINE_IN + LINE_OUT) / 2, 0, (LINE_OUT - LINE_IN) / 2 - 0.005, 0.017, 0.017)
    return dz.chamfer_extrude(line, z - (H - POCKET_DEPTH - 0.022), 0.012, 0.004, 0.002)


def dial_sdf(x, y, z):
    r = dz.length2(x, y)
    plate = dz.chamfer_extrude(r - 1.12, z + 0.07, 0.05, 0.018, 0.003)
    # Channel under the knob so the glow ring sits below the face.
    channel = np.maximum(np.abs(r - 0.86) - 0.04, -(z + 0.045))
    plate = dz.smax(plate, -channel, 0.004)
    # Raised ticks, every fourth one longer.
    th = np.arctan2(y, x)
    step = 2 * math.pi / TICKS
    k = np.round(th / step)
    a = k * step
    lx = x * np.cos(-a) - y * np.sin(-a)
    ly = x * np.sin(-a) + y * np.cos(-a)
    inner = np.where(np.mod(k, 4) == 0, 0.92, 0.97)
    tick = dz.box2d(lx, ly, (inner + 1.07) / 2, 0, (1.07 - inner) / 2, 0.011, 0.002)
    tick = dz.chamfer_extrude(tick, z + 0.006, 0.014, 0.006, 0.002)
    return np.minimum(plate, tick)


def ring_sdf(x, y, z):
    return dz.length2(dz.length2(x, y) - 0.86, z + 0.045) - 0.02


def main():
    dz.reset()
    knob = dz.build("Knob", knob_sdf, (-0.82, -0.82, -0.02), (0.82, 0.82, 0.66), 0.003, 80000)
    insert = dz.build("Indicator", insert_sdf, (0.12, -0.05, H - 0.08), (0.6, 0.05, H), 0.0025, 3000)
    dial = dz.build("Dial", dial_sdf, (-1.15, -1.15, -0.14), (1.15, 1.15, 0.03), 0.004, 34000)
    ring = dz.build("GlowRing", ring_sdf, (-0.9, -0.9, -0.08), (0.9, 0.9, -0.01), 0.005, 5000)
    dz.assign(knob, dz.chrome("HoloChrome"))
    dz.assign(dial, dz.chrome("SatinChrome", rough=0.18, iridescent=False))
    red = dz.glow("BrandRed")
    dz.assign(insert, red)
    dz.assign(ring, red)
    parts = [knob, insert, dial, ring]
    dz.export("knob-motion-direction", parts)

    for p in parts:
        p.rotation_euler = (0, 0, math.radians(-35))
    dz.studio(cam_loc=(0, -6.2, 3.6), target=(0, 0, 0.12), lens=58)
    dz.render("knob-motion-direction")
    dz.save_blend("knob-motion-direction")


main()

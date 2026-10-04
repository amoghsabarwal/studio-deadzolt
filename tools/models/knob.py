"""Motion Direction: a knurled chrome control knob on a ticked dial.

Hardware turned into rhythm: the knob turns, the red indicator and the
glowing ring carry the brand red. Stands upright (Z-up in Blender, Y-up in
three.js); spin it around that axis.
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


def knob_sdf(x, y, z):
    r = dz.length2(x, y)
    th = np.arctan2(y, x)
    # Fluted grip, like a watch bezel: soft ridges that ease out at each end.
    band = np.clip((z - 0.07) / 0.05, 0, 1) * np.clip((H - 0.12 - z) / 0.05, 0, 1)
    ridge = 0.5 + 0.5 * np.cos(RIDGES * th)
    rr = r - (R - 0.016 * band * ridge)
    body = dz.length2(np.maximum(rr + 0.07, 0), np.maximum(np.abs(z - H / 2) - H / 2 + 0.07, 0)) \
        + np.minimum(np.maximum(rr + 0.07, np.abs(z - H / 2) - H / 2 + 0.07), 0) - 0.07
    # Dished top.
    rs = 2.4
    dish = np.sqrt(x * x + y * y + (z - (H + rs - 0.04)) ** 2) - rs
    body = dz.smax(body, -dish, 0.03)
    # Indicator groove, filled by the red insert.
    groove = dz.box2d(x, y, (0.16 + 0.6) / 2, 0, (0.6 - 0.16) / 2, 0.028, 0.028)
    groove = np.maximum(groove, -(z - (H - 0.075)))
    return dz.smax(body, -groove, 0.008)


def insert_sdf(x, y, z):
    line = dz.box2d(x, y, (0.16 + 0.6) / 2, 0, (0.6 - 0.16) / 2 - 0.006, 0.02, 0.02)
    return dz.extrude_round(line, z - (H - 0.075), 0.03, 0.015)


def dial_sdf(x, y, z):
    r = dz.length2(x, y)
    plate = dz.length2(np.maximum(r - 1.12 + 0.03, 0), np.maximum(np.abs(z + 0.07) - 0.05 + 0.03, 0)) \
        + np.minimum(np.maximum(r - 1.12 + 0.03, np.abs(z + 0.07) - 0.05 + 0.03), 0) - 0.03
    # Recess under the knob so the glow ring sits in a channel.
    channel = dz.length2(r - 0.86, z + 0.02) - 0.035
    plate = dz.smax(plate, -channel, 0.01)
    # Raised ticks, every fourth one longer.
    th = np.arctan2(y, x)
    step = 2 * math.pi / TICKS
    k = np.round(th / step)
    a = k * step
    lx = x * np.cos(-a) - y * np.sin(-a)
    ly = x * np.sin(-a) + y * np.cos(-a)
    major = (np.mod(k, 4) == 0)
    inner = np.where(major, 0.9, 0.96)
    tick = dz.box2d(lx, ly, (inner + 1.06) / 2, 0, (1.06 - inner) / 2, 0.012, 0.012)
    tick = dz.extrude_round(tick, z + 0.01, 0.016, 0.008)
    return dz.smin(plate, tick, 0.006)


def ring_sdf(x, y, z):
    return dz.length2(dz.length2(x, y) - 0.86, z + 0.02) - 0.022


def main():
    dz.reset()
    knob = dz.build("Knob", knob_sdf, (-0.85, -0.85, -0.05), (0.85, 0.85, 0.7), 0.0045, 60000)
    insert = dz.build("Indicator", insert_sdf, (0.1, -0.06, H - 0.14), (0.66, 0.06, H), 0.004, 2000)
    dial = dz.build("Dial", dial_sdf, (-1.15, -1.15, -0.15), (1.15, 1.15, 0.05), 0.005, 40000)
    ring = dz.build("GlowRing", ring_sdf, (-0.92, -0.92, -0.06), (0.92, 0.92, 0.02), 0.006, 4000)
    dz.assign(knob, dz.chrome("HoloChrome"))
    dz.assign(dial, dz.chrome("SatinChrome", rough=0.2, iridescent=False))
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

"""Space: a cratered chrome moon.

A polished sphere struck with craters of many sizes, each a clean bowl with
a raised, bevelled rim, like a moon cast in metal and hand-finished. Faces
-Y in Blender (+Z in three.js).
"""

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dz_lib as dz  # noqa: E402

R = 1.0


def craters(seed=11, count=38):
    rng = np.random.default_rng(seed)
    out = []
    for _ in range(count):
        c = rng.normal(size=3)
        c /= np.linalg.norm(c)
        # Many small craters, a few large ones.
        r = 0.06 + 0.34 * rng.random() ** 2.2
        out.append((c, r))
    return out


CRATERS = craters()


def moon_sdf(x, y, z):
    rho = np.sqrt(x * x + y * y + z * z)
    d = rho - R
    for c, r in CRATERS:
        along = x * c[0] + y * c[1] + z * c[2]
        # Rim: a low, soft lip of thrown-up metal around the crater mouth.
        px, py, pz = x - along * c[0], y - along * c[1], z - along * c[2]
        radial = np.sqrt(px * px + py * py + pz * pz)
        rim = dz.length2(radial - r * 1.05, along - R + r * 0.12) - r * 0.2
        d = dz.smin(d, rim, r * 0.25)
        # Bowl: a shallow spherical dish, a quarter of its width deep.
        a, b = 1.875 * r, 2.125 * r
        bowl = np.sqrt((x - c[0] * (R + a)) ** 2 + (y - c[1] * (R + a)) ** 2
                       + (z - c[2] * (R + a)) ** 2) - b
        d = dz.smax(d, -bowl, r * 0.12)
    return d


def main():
    dz.reset()
    moon = dz.build("ChromeMoon", moon_sdf, (-1.12, -1.12, -1.12), (1.12, 1.12, 1.12), 0.005, 70000,
                    normal_eps=0.8)
    dz.assign(moon, dz.chrome("HoloChrome", rough=0.06))
    dz.export("moon-space", [moon])

    moon.rotation_euler = (math.radians(20), 0, math.radians(30))
    dz.studio(cam_loc=(0, -9.0, 0.8), lens=60)
    dz.render("moon-space")
    dz.save_blend("moon-space")


main()

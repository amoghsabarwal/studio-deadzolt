"""Hero: the Deadzolt star as a solid, hard-surface chrome object.

A thick slab cut to the brand outline, with flat faces and a small chamfer
on every edge, eased by a hairline round so the chamfer catches a crisp
line of light like machined metal.

Blender is Z-up with the front facing -Y, which the glTF exporter turns into
three.js Y-up with the front facing +Z, so the star faces the site camera.
"""

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dz_lib as dz  # noqa: E402

HALF = 0.17  # half-thickness of the slab
CHAMFER = 0.045  # bevel width on the front and back edges
EASE = 0.006  # hairline round on the bevel's own edges

SQRT2 = math.sqrt(2)


def star_sdf(x, y, z):
    d2 = dz.star2d(x, z) + EASE
    wz = np.abs(y) - HALF + EASE
    bevel = (d2 + wz + CHAMFER) / SQRT2
    return np.maximum(np.maximum(d2, wz), bevel) - EASE


def main():
    dz.reset()
    star = dz.build("DeadzoltStar", star_sdf, (-1.6, -0.22, -1.8), (1.6, 0.22, 1.8), 0.004, 60000)
    dz.assign(star, dz.chrome("HoloChrome"))
    dz.export("deadzolt-star", [star])

    star.rotation_euler = (math.radians(-16), 0, math.radians(-30))
    dz.studio(cam_loc=(0, -9.5, 0.8), lens=60)
    dz.render("deadzolt-star")
    dz.save_blend("deadzolt-star")


main()

"""Hero: the Deadzolt star as a liquid chrome foil balloon.

The body is a balloon inflation of the brand outline. Real foil stars have
two tells that make them read as objects rather than renders: a flat
heat-sealed seam running round the edge, and soft pleats where the film
gathers into that seam. Both are modelled here.

Blender is Z-up with the front facing -Y, which the glTF exporter turns into
three.js Y-up with the front facing +Z, so the star faces the site camera.
"""

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dz_lib as dz  # noqa: E402

OX, OY = dz.STAR_CORE[0], dz.STAR_CORE[1]
SEAM_OUT = 0.04  # how far the sealed flange sticks out past the balloon
SEAM_HALF = 0.013  # half-thickness of the flange
PLEAT_REACH = 0.16  # how far in from the edge the gathers run


def pleats(x, z, inside):
    """Irregular gathers, strongest at the seam and gone by PLEAT_REACH."""
    th = np.arctan2(z - OY, x - OX)
    wave = (0.55 * np.sin(57 * th + 0.3) + 0.3 * np.sin(91 * th + 1.7)
            + 0.15 * np.sin(23 * th + 4.1))
    fade = np.exp(-np.maximum(inside, 0) / (PLEAT_REACH * 0.45))
    return 1.0 - 0.22 * fade * (0.5 + 0.5 * wave)


def star_sdf(x, y, z):
    field = dz.star_field()
    d2 = dz.star2d(x, z)
    u = field.potential(x, z) * pleats(x, z, -d2)
    body = (y * y - field.k * u) / 0.5
    # Sealed seam: a thin flat band hugging the outline at the equator.
    band = np.maximum(d2 - SEAM_OUT, -(d2 + 0.06))
    seam = dz.extrude_round(band, y, SEAM_HALF, 0.009)
    return np.minimum(body, seam)


def main():
    dz.reset()
    star = dz.build("DeadzoltStar", star_sdf, (-1.65, -0.42, -1.85), (1.65, 0.42, 1.85), 0.0048, 90000,
                    normal_eps=1.0)
    dz.assign(star, dz.chrome("HoloChrome"))
    dz.export("deadzolt-star", [star])

    star.rotation_euler = (math.radians(8), math.radians(-6), math.radians(-14))
    dz.studio(cam_loc=(0, -9.5, 0.8), lens=60)
    dz.render("deadzolt-star")
    dz.save_blend("deadzolt-star")


main()

"""3D Experience: a precision chrome sphere with a bezel ring and a star moon.

Worlds built from scratch, made like an instrument: a polished sphere split
by a recessed equator seam, a flat chamfered ring engraved with minute
marks and tilted across it, and a small hard-surface Deadzolt star riding
the ring. Faces -Y in Blender (+Z in three.js).

The ring and moon are built flat at the origin and placed with their object
transforms, which keeps their voxel grids small and their edges crisp.
"""

import math
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dz_lib as dz  # noqa: E402

R = 0.82
TILT = math.radians(22)
RING_R = 1.32
RING_HALF_W = 0.11
RING_HALF_T = 0.016
MARKS = 60
MOON_ANGLE = math.radians(-38)
MOON_SCALE = 0.16


def planet_sdf(x, y, z):
    sphere = np.sqrt(x * x + y * y + z * z) - R
    # Recessed equator seam with chamfered shoulders.
    seam = np.maximum(np.abs(z) - 0.014, (R - 0.02) - np.sqrt(x * x + y * y + z * z))
    shoulder = (np.abs(z) - 0.03 + (R - np.sqrt(x * x + y * y + z * z))) / dz.SQRT2
    cut = np.minimum(seam, np.maximum(shoulder, (R - 0.02) - np.sqrt(x * x + y * y + z * z)))
    return dz.smax(sphere, -cut, 0.002)


def ring_sdf(x, y, z):
    """Flat in the XY plane; tilted into place by its object rotation."""
    q = dz.length2(x, y) - RING_R
    band = np.abs(q) - RING_HALF_W
    ring = dz.chamfer_extrude(band, z, RING_HALF_T, 0.008, 0.002)
    # Engraved minute marks on both faces, longer every fifth.
    th = np.arctan2(y, x)
    step = 2 * math.pi / MARKS
    k = np.round(th / step)
    a = k * step
    lx = x * np.cos(-a) - y * np.sin(-a)
    ly = x * np.sin(-a) + y * np.cos(-a)
    length = np.where(np.mod(k, 5) == 0, 0.07, 0.035)
    mark = dz.box2d(lx, ly, RING_R + RING_HALF_W - 0.02 - length / 2, 0, length / 2, 0.006, 0.003)
    mark = np.maximum(mark, -(np.abs(z) - (RING_HALF_T - 0.006)))
    return dz.smax(ring, -mark, 0.002)


def moon_sdf(x, y, z):
    return dz.star_slab(x, y, z, MOON_SCALE)


def moon_centre():
    lx, ly = RING_R * math.cos(MOON_ANGLE), RING_R * math.sin(MOON_ANGLE)
    lz = RING_HALF_T + MOON_SCALE * 1.2
    c, s = math.cos(TILT), math.sin(TILT)
    return lx, ly * c - lz * s, ly * s + lz * c


def main():
    dz.reset()
    planet = dz.build("Planet", planet_sdf, (-0.86, -0.86, -0.86), (0.86, 0.86, 0.86), 0.004, 40000)
    ring = dz.build("Ring", ring_sdf, (-1.46, -1.46, -0.03), (1.46, 1.46, 0.03), 0.003, 30000)
    ring.rotation_euler = (TILT, 0, 0)
    m = MOON_SCALE * 1.95
    moon = dz.build("StarMoon", moon_sdf, (-m, -0.06, -m), (m, 0.06, m), 0.0015, 10000)
    moon.location = moon_centre()
    moon.rotation_euler = (0, 0, math.radians(-20))
    dz.assign(planet, dz.chrome("HoloChrome"))
    dz.assign(ring, dz.chrome("PolishedChrome", rough=0.03, iridescent=False))
    dz.assign(moon, dz.chrome("HoloChromeMoon", film=460.0))
    parts = [planet, ring, moon]
    dz.export("orb-3d-experience", parts)

    dz.studio(cam_loc=(0, -9.0, 1.2), lens=60)
    dz.render("orb-3d-experience")
    dz.save_blend("orb-3d-experience")


main()

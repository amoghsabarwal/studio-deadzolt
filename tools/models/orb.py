"""3D Experience: a liquid chrome world with a ring and a star moon.

Worlds built from scratch: a softly wobbling chrome planet, a polished ring
tilted across it and a small Deadzolt star riding the ring. Faces -Y in
Blender (+Z in three.js).
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
MOON_ANGLE = math.radians(-38)
MOON_SCALE = 0.16


def planet_sdf(x, y, z):
    wobble = (0.028 * np.sin(2.3 * x + 0.4) * np.sin(1.9 * y + 1.2) * np.sin(2.1 * z + 0.7)
              + 0.012 * np.sin(4.6 * x + 2.0) * np.sin(4.1 * z + 0.3))
    return np.sqrt(x * x + y * y + z * z) - R - wobble


def _ring_space(x, y, z):
    # Ring lies in a plane tilted around X, so it crosses in front of the planet.
    c, s = math.cos(TILT), math.sin(TILT)
    return x, y * c + z * s, -y * s + z * c


def ring_sdf(x, y, z):
    rx, ry, rz = _ring_space(x, y, z)
    q = dz.length2(rx, ry) - RING_R
    return dz.box2d(q, rz, 0, 0, 0.11, 0.014, 0.012)


def moon_centre():
    lx, ly = RING_R * math.cos(MOON_ANGLE), RING_R * math.sin(MOON_ANGLE)
    lz = 0.11
    c, s = math.cos(TILT), math.sin(TILT)
    # Inverse of _ring_space.
    return lx, ly * c - lz * s, ly * s + lz * c


def moon_sdf(x, y, z):
    cx, cy, cz = moon_centre()
    return dz.star_balloon(x - cx, y - cy, z - cz, MOON_SCALE)


def main():
    dz.reset()
    planet = dz.build("Planet", planet_sdf, (-0.9, -0.9, -0.9), (0.9, 0.9, 0.9), 0.006, 30000, normal_eps=1.0)
    ring = dz.build("Ring", ring_sdf, (-1.48, -1.48, -0.7), (1.48, 1.48, 0.7), 0.005, 16000)
    cx, cy, cz = moon_centre()
    m = MOON_SCALE * 1.95
    moon = dz.build("StarMoon", moon_sdf, (cx - m, cy - m, cz - m), (cx + m, cy + m, cz + m), 0.0025, 9000,
                    normal_eps=1.2)
    dz.assign(planet, dz.chrome("HoloChrome"))
    dz.assign(ring, dz.chrome("PolishedChrome", rough=0.035, iridescent=False))
    dz.assign(moon, dz.chrome("HoloChromeMoon", film=460.0))
    parts = [planet, ring, moon]
    dz.export("orb-3d-experience", parts)

    for p in parts:
        p.rotation_euler = (0, 0, math.radians(-12))
    dz.studio(cam_loc=(0, -9.0, 1.2), lens=60)
    dz.render("orb-3d-experience")
    dz.save_blend("orb-3d-experience")


main()

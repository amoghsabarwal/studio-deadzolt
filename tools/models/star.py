"""Hero: the Deadzolt star as a puffed, liquid chrome object.

Blender is Z-up with the front facing -Y, which the glTF exporter turns into
three.js Y-up with the front facing +Z, so the star faces the site camera.
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dz_lib as dz  # noqa: E402


def main():
    dz.reset()
    sdf = dz.star_balloon
    star = dz.build("DeadzoltStar", sdf, (-1.6, -0.55, -1.8), (1.6, 0.55, 1.8), 0.007, 60000, normal_eps=1.2)
    dz.assign(star, dz.chrome("HoloChrome"))
    dz.export("deadzolt-star", [star])

    star.rotation_euler = (math.radians(8), math.radians(-6), math.radians(-14))
    dz.studio(cam_loc=(0, -9.5, 0.8), lens=60)
    dz.render("deadzolt-star")
    dz.save_blend("deadzolt-star")


main()

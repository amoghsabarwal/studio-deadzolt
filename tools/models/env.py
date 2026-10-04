"""Bake the holographic studio into an equirectangular HDR for the site.

Use it as the scene environment in three.js so the chrome on the site
reflects the same softboxes and rainbow bands as the preview renders.
"""

import os
import sys

import bpy

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dz_lib as dz  # noqa: E402


def main():
    dz.reset()
    dz.PANELS_VISIBLE = True
    dz.studio(samples=64)
    sc = bpy.context.scene
    sc.world = dz.holo_world(sc, camera_black=False)
    cam = sc.camera
    cam.location = (0, 0, 0)
    cam.rotation_euler = (1.5708, 0, 0)  # level, centred on +Y (into the scene)
    cam.data.type = "PANO"
    cam.data.panorama_type = "EQUIRECTANGULAR"
    sc.render.resolution_x = 1024
    sc.render.resolution_y = 512
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.view_settings.exposure = 0.0
    sc.render.image_settings.file_format = "HDR"
    out = os.path.join(dz.MODELS, "env", "holo-studio.hdr")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    sc.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print(f"  baked {out} ({os.path.getsize(out) / 1024:.0f} KB)", flush=True)


main()

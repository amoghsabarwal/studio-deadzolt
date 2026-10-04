"""Space: a drifting cluster of faceted chrome asteroids.

Each rock is the convex hull of points scattered over a squashed sphere,
then bevelled the hard-surface way: a three-segment bevel on every edge and
weighted normals, so the flats stay perfectly flat and each edge carries a
thin, even line of light. The rocks are separate nodes so the site can
drift and spin them independently.
"""

import math
import os
import sys

import bmesh
import bpy
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dz_lib as dz  # noqa: E402

# name, seed, size, stretch (x, y, z), location, points on the hull
ROCKS = [
    ("Rock_A", 7, 0.85, (1.5, 0.85, 0.75), (0.0, 0.0, 0.0), 15),
    ("Rock_B", 19, 0.46, (1.0, 0.75, 1.45), (1.45, 0.5, 0.75), 13),
    ("Rock_C", 31, 0.34, (1.3, 1.0, 0.8), (-1.35, -0.2, -0.55), 18),
    ("Rock_D", 43, 0.22, (1.0, 1.0, 1.0), (0.95, -0.35, -0.9), 16),
    ("Rock_E", 57, 0.15, (1.2, 0.9, 1.0), (-0.75, 0.4, 1.0), 14),
    ("Rock_F", 71, 0.1, (1.0, 1.0, 1.0), (1.9, -0.2, -0.15), 12),
]


def make_rock(name, seed, size, stretch, count):
    rng = np.random.default_rng(seed)
    p = rng.normal(size=(count, 3))
    p /= np.linalg.norm(p, axis=1, keepdims=True)
    p *= rng.uniform(0.82, 1.0, (count, 1))
    p *= np.array(stretch) * size

    bm = bmesh.new()
    for v in p:
        bm.verts.new(v)
    hull = bmesh.ops.convex_hull(bm, input=bm.verts)
    bmesh.ops.delete(bm, geom=[g for g in hull["geom_interior"] if isinstance(g, bmesh.types.BMVert)],
                     context="VERTS")
    # Merge near-coplanar triangles into true flat facets before bevelling.
    bmesh.ops.dissolve_limit(bm, angle_limit=math.radians(4), verts=bm.verts, edges=bm.edges)
    bmesh.ops.bevel(bm, geom=bm.edges[:], offset=0.022 * size + 0.004, offset_type="OFFSET",
                    segments=3, profile=0.5, affect="EDGES", clamp_overlap=True)
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(obj)
    me.shade_smooth()
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = True
    wn.weight = 100
    dz.apply_all(obj)
    print(f"  {name}: {dz.tri_count(obj)} triangles", flush=True)
    return obj


def main():
    dz.reset()
    mat = dz.chrome("HoloChrome")
    rocks = []
    for name, seed, size, stretch, loc, count in ROCKS:
        obj = make_rock(name, seed, size, stretch, count)
        obj.location = loc
        rng = np.random.default_rng(seed + 1)
        obj.rotation_euler = tuple(rng.uniform(0, math.tau, 3))
        dz.assign(obj, mat)
        rocks.append(obj)
    dz.export("asteroids-space", rocks)

    dz.studio(cam_loc=(0, -10.0, 1.4), target=(0.2, 0, 0.1), lens=60)
    dz.render("asteroids-space")
    dz.save_blend("asteroids-space")


main()

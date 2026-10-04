"""Space: DZ-01, a small Deadzolt probe.

Built the classic hard-surface way from primitives: bevel modifiers with
hardened normals, weighted normals, and a boolean engraving. A hexagonal
chrome body with the star emblem and "DZ-01" engraved on its front face,
two solar wings with dark glass cells in chrome frames, a dish antenna, and
brand-red running lights. Faces -Y in Blender (+Z in three.js).
"""

import math
import os
import sys

import bmesh
import bpy
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dz_lib as dz  # noqa: E402

BODY_R = 0.36
BODY_H = 0.72
APOTHEM = BODY_R * math.cos(math.pi / 6)


def finish(obj, bevel=0.012, segments=3, angle=35):
    """Hard-surface finish: bevelled edges, hardened and weighted normals."""
    if bevel:
        b = obj.modifiers.new("Bevel", "BEVEL")
        b.width = bevel
        b.segments = segments
        b.limit_method = "ANGLE"
        b.angle_limit = math.radians(angle)
        b.harden_normals = True
    w = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    w.keep_sharp = True
    obj.data.shade_smooth()
    return obj


def active():
    return bpy.context.active_object


def body():
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=BODY_R, depth=BODY_H)
    ob = active()
    ob.name = "Body"
    # Turn so a flat face looks at the camera.
    ob.rotation_euler = (0, 0, math.radians(30))
    bpy.ops.object.transform_apply(rotation=True)
    finish(ob, bevel=0.014)
    engrave(ob)
    return ob


def engrave(ob):
    curve = bpy.data.curves.new("Label", "FONT")
    curve.body = "DZ-01"
    curve.size = 0.085
    curve.extrude = 0.012
    curve.align_x = "CENTER"
    curve.align_y = "CENTER"
    txt = bpy.data.objects.new("Label", curve)
    bpy.context.scene.collection.objects.link(txt)
    txt.rotation_euler = (math.radians(90), 0, 0)
    txt.location = (0, -APOTHEM, -0.2)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(txt.evaluated_get(dg))
    cutter = bpy.data.objects.new("LabelCut", me)
    bpy.context.scene.collection.objects.link(cutter)
    cutter.matrix_world = txt.matrix_world
    bpy.data.objects.remove(txt)
    boo = ob.modifiers.new("Engrave", "BOOLEAN")
    boo.operation = "DIFFERENCE"
    boo.solver = "EXACT"
    boo.object = cutter
    # Keep the weighted normals last.
    ob.modifiers.move(len(ob.modifiers) - 1, len(ob.modifiers) - 2)
    dz.apply_all(ob)
    bpy.data.objects.remove(cutter)


def emblem():
    """The hard-surface star, small and proud of the front face."""
    s = 0.075
    star = dz.build("Emblem", lambda x, y, z: dz.star_slab(x, y, z, s, half=0.12),
                    (-s * 1.9, -0.03, -s * 2.1), (s * 1.9, 0.03, s * 2.1), 0.0012, 6000)
    star.location = (0, -APOTHEM - 0.004, 0.1)
    return star


def caps():
    parts = []
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.24, depth=0.07, location=(0, 0, BODY_H / 2 + 0.035))
    parts.append(finish(active(), bevel=0.01))
    active().name = "TopCap"
    bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.2, radius2=0.12, depth=0.16,
                                    location=(0, 0, -BODY_H / 2 - 0.08))
    nozzle = active()
    nozzle.name = "Nozzle"
    nozzle.rotation_euler = (math.pi, 0, 0)
    sol = nozzle.modifiers.new("Shell", "SOLIDIFY")
    sol.thickness = 0.02
    nozzle.data.polygons.foreach_set("select", [False] * len(nozzle.data.polygons))
    # Open the nozzle mouth: drop the wide end cap.
    bm = bmesh.new()
    bm.from_mesh(nozzle.data)
    bm.faces.ensure_lookup_table()
    wide = max(bm.faces, key=lambda f: sum(v.co.length for v in f.verts) if len(f.verts) > 4 else -1)
    bmesh.ops.delete(bm, geom=[wide], context="FACES_ONLY")
    bm.to_mesh(nozzle.data)
    bm.free()
    parts.append(finish(nozzle, bevel=0.006, segments=2))
    return parts


def wing(side):
    parts = []
    sx = 1 if side > 0 else -1
    strut_len = 0.34
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.028, depth=strut_len,
                                        location=(sx * (APOTHEM + strut_len / 2), 0, 0),
                                        rotation=(0, math.pi / 2, 0))
    parts.append(finish(active(), bevel=0.004, segments=2))
    active().name = f"Strut{side}"
    # Hinge block where the strut meets the wing.
    x0 = APOTHEM + strut_len
    bpy.ops.mesh.primitive_cube_add(size=1, location=(sx * (x0 + 0.03), 0, 0))
    hinge = active()
    hinge.name = f"Hinge{side}"
    hinge.scale = (0.06, 0.06, 0.12)
    bpy.ops.object.transform_apply(scale=True)
    parts.append(finish(hinge, bevel=0.008))
    # Frame.
    w, h, t = 1.08, 0.5, 0.024
    cx = sx * (x0 + 0.06 + w / 2)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(cx, 0, 0))
    frame = active()
    frame.name = f"Wing{side}"
    frame.scale = (w, t, h)
    bpy.ops.object.transform_apply(scale=True)
    parts.append(finish(frame, bevel=0.006))
    # Glass cells, proud of the frame on both faces.
    cells = []
    cols, rows, gap = 6, 3, 0.016
    cw = (w - gap * (cols + 1)) / cols
    ch = (h - gap * (rows + 1)) / rows
    for i in range(cols):
        for j in range(rows):
            x = cx - w / 2 + gap + cw / 2 + i * (cw + gap)
            z = -h / 2 + gap + ch / 2 + j * (ch + gap)
            bpy.ops.mesh.primitive_cube_add(size=1, location=(x, 0, z))
            c = active()
            c.scale = (cw, t + 0.008, ch)
            bpy.ops.object.transform_apply(scale=True)
            cells.append(c)
    bpy.ops.object.select_all(action="DESELECT")
    for c in cells:
        c.select_set(True)
    bpy.context.view_layer.objects.active = cells[0]
    bpy.ops.object.join()
    glass = active()
    glass.name = f"Cells{side}"
    finish(glass, bevel=0.004, segments=2)
    # Running light at the tip.
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.022,
                                         location=(sx * (x0 + 0.06 + w + 0.03), 0, h / 2 - 0.03))
    light = active()
    light.name = f"Light{side}"
    light.data.shade_smooth()
    return parts, glass, light


def dish():
    """A parabolic dish on a short mast, tipped towards the viewer."""
    rad, depth, rings, segs = 0.26, 0.08, 12, 64
    verts, faces = [(0, 0, 0)], []
    for i in range(1, rings + 1):
        r = rad * i / rings
        for j in range(segs):
            a = 2 * math.pi * j / segs
            verts.append((r * math.cos(a), r * math.sin(a), depth * (r / rad) ** 2))
    for j in range(segs):
        faces.append((0, 1 + j, 1 + (j + 1) % segs))
    for i in range(rings - 1):
        for j in range(segs):
            a0 = 1 + i * segs + j
            a1 = 1 + i * segs + (j + 1) % segs
            faces.append((a0, a1, a1 + segs, a0 + segs))
    me = bpy.data.meshes.new("Dish")
    me.from_pydata(verts, [], faces)
    ob = bpy.data.objects.new("Dish", me)
    bpy.context.scene.collection.objects.link(ob)
    sol = ob.modifiers.new("Shell", "SOLIDIFY")
    sol.thickness = 0.014
    finish(ob, bevel=0.004, segments=2, angle=50)
    top = BODY_H / 2 + 0.07
    ob.location = (0.05, 0.02, top + 0.2)
    ob.rotation_euler = (math.radians(-35), math.radians(12), 0)
    parts = [ob]
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.02, depth=0.2, location=(0.05, 0.02, top + 0.1))
    parts.append(finish(active(), bevel=0.003, segments=2))
    active().name = "Mast"
    # Feed horn at the focus.
    feed = ob.matrix_world @ __import__("mathutils").Vector((0, 0, 0.2))
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.006, depth=0.2,
                                        location=(ob.matrix_world @ __import__("mathutils").Vector((0, 0, 0.1))),
                                        rotation=ob.rotation_euler)
    parts.append(finish(active(), bevel=0))
    active().name = "FeedRod"
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.022, location=feed)
    horn = active()
    horn.name = "FeedHorn"
    horn.data.shade_smooth()
    parts.append(horn)
    return parts


def antenna():
    top = BODY_H / 2 + 0.07
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.007, depth=0.42, location=(-0.13, -0.05, top + 0.21))
    rod = finish(active(), bevel=0)
    rod.name = "Whip"
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.02, location=(-0.13, -0.05, top + 0.43))
    tip = active()
    tip.name = "WhipLight"
    tip.data.shade_smooth()
    return rod, tip


def main():
    dz.reset()
    chrome = dz.chrome("HoloChrome", rough=0.14)
    polished = dz.chrome("PolishedChrome", rough=0.03, iridescent=False)
    satin = dz.chrome("SatinChrome", rough=0.2, iridescent=False)
    glass = dz.gloss_black("PanelGlass")
    glass.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.006, 0.01, 0.03, 1)
    red = dz.glow("BrandRed", strength=4.0)

    parts = []
    b = body()
    dz.assign(b, chrome)
    parts.append(b)
    e = emblem()
    dz.assign(e, polished)
    parts.append(e)
    for p in caps():
        dz.assign(p, satin)
        parts.append(p)
    for side in (1, -1):
        mech, cells, light = wing(side)
        for p in mech:
            dz.assign(p, polished)
        dz.assign(cells, glass)
        dz.assign(light, red)
        parts += mech + [cells, light]
    for p in dish():
        dz.assign(p, polished)
        parts.append(p)
    rod, tip = antenna()
    dz.assign(rod, polished)
    dz.assign(tip, red)
    parts += [rod, tip]
    for p in parts:
        dz.apply_all(p)
    print(f"  probe: {sum(dz.tri_count(p) for p in parts)} triangles in {len(parts)} parts", flush=True)
    dz.export("probe-space", parts)

    pivot = bpy.data.objects.new("Pivot", None)
    bpy.context.scene.collection.objects.link(pivot)
    for p in parts:
        p.parent = pivot
    pivot.rotation_euler = (math.radians(12), 0, math.radians(-28))
    dz.studio(cam_loc=(0, -9.0, 1.6), target=(0.1, 0, 0.15), lens=78)
    dz.render("probe-space")
    dz.save_blend("probe-space")


main()

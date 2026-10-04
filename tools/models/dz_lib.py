"""Shared helpers for the Deadzolt model scripts.

Every object is described as a signed distance field (negative inside) in
numpy, sampled onto a voxel grid, meshed through OpenVDB, decimated for the
web and then given normals taken straight from the field's gradient so the
chrome reflects cleanly even at low polygon counts.

Run a model script with:
  blender -b --factory-startup --python tools/models/<name>.py
"""

import math
import os
import tempfile

import bpy
import numpy as np
import openvdb

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
MODELS = os.path.join(REPO, "public", "models")
PREVIEWS = os.path.join(MODELS, "previews")

BRAND_RED = (1.0, 0.0137, 0.0137)  # #FF1F1F in linear


# ---------------------------------------------------------------------------
# SDF primitives (all vectorised over numpy arrays of x, y, z)

def smin(a, b, k):
    """Polynomial smooth minimum: a liquid join of radius k."""
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b * (1 - h) + a * h - k * h * (1 - h)


def smax(a, b, k):
    return -smin(-a, -b, k)


def length2(x, y):
    return np.sqrt(x * x + y * y)


def thorn2d(x, y, a, b, ra, rb, power=1.6):
    """A tapered spike from a to b whose radius curves from ra to rb."""
    bax, bay = b[0] - a[0], b[1] - a[1]
    pax, pay = x - a[0], y - a[1]
    t = np.clip((pax * bax + pay * bay) / (bax * bax + bay * bay), 0.0, 1.0)
    r = ra * (1 - t) ** power + rb
    return length2(pax - bax * t, pay - bay * t) - r


def box2d(x, y, cx, cy, hx, hy, r=0.0):
    qx = np.abs(x - cx) - hx + r
    qy = np.abs(y - cy) - hy + r
    return length2(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0) - r


def ellipse2d(x, y, cx, cy, rx, ry):
    # Cheap ellipse distance, exact enough near the boundary.
    k0 = length2((x - cx) / rx, (y - cy) / ry)
    k1 = length2((x - cx) / (rx * rx), (y - cy) / (ry * ry))
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-6)


def extrude_round(d2, z, half, r):
    """Extrude a 2D field to a slab of half-thickness `half` with edge radius r."""
    wx = d2 + r
    wz = np.abs(z) - half + r
    return length2(np.maximum(wx, 0), np.maximum(wz, 0)) + np.minimum(np.maximum(wx, wz), 0) - r


def inflate(d2, z, hmax, reach, rim):
    """Puff a 2D shape into a pillow: thickness grows with distance inside."""
    t = np.clip(-d2 / reach, 0.0, 1.0)
    h = hmax * np.sqrt(1 - (1 - t) ** 2)
    wz = np.abs(z) - h
    return length2(np.maximum(d2, 0), np.maximum(wz, 0)) + np.minimum(np.maximum(d2, wz), 0) - rim


class HeightField:
    """Balloon-style inflation of a 2D shape.

    Solves the Poisson equation (laplacian u = -1 inside, u = 0 on the edge)
    on a grid. sqrt(u) turns a disc into a perfect dome and gives every other
    outline the same soft, crease-free swell, like liquid metal under tension.
    """

    def __init__(self, d2fn, lo, hi, cell, gain=1.0):
        self.lo = np.array(lo, dtype=np.float64)
        self.cell = cell
        n = np.ceil((np.array(hi) - self.lo) / cell).astype(int) + 1
        u = None
        for level in (16, 8, 4, 2, 1):
            c = cell * level
            m = np.ceil((n - 1) / level).astype(int) + 1
            xs = self.lo[0] + np.arange(m[0]) * c
            ys = self.lo[1] + np.arange(m[1]) * c
            X, Y = np.meshgrid(xs, ys, indexing="ij")
            inside = d2fn(X, Y) < 0
            if u is None:
                u = np.zeros(m)
            else:
                u = np.repeat(np.repeat(u, 2, 0), 2, 1)[: m[0], : m[1]]
                u = np.pad(u, ((0, m[0] - u.shape[0]), (0, m[1] - u.shape[1])))
            h2 = c * c
            for _ in range(400 if level > 1 else 600):
                nb = np.roll(u, 1, 0) + np.roll(u, -1, 0) + np.roll(u, 1, 1) + np.roll(u, -1, 1)
                u = np.where(inside, (nb + h2) * 0.25, 0.0)
        self.k = gain * gain
        self.u = np.maximum(u, 0)
        print(f"  height field {u.shape}, peak {gain * np.sqrt(u.max()):.3f}", flush=True)

    def balloon(self, x, y, z):
        """Implicit balloon: z^2 = k u. Smooth everywhere, rounded at the rim."""
        return (z * z - self.k * self.potential(x, y)) / 0.5

    def potential(self, x, y):
        fx = (np.asarray(x) - self.lo[0]) / self.cell
        fy = (np.asarray(y) - self.lo[1]) / self.cell
        nx, ny = self.u.shape
        fx = np.clip(fx, 0, nx - 1.001)
        fy = np.clip(fy, 0, ny - 1.001)
        ix, iy = fx.astype(int), fy.astype(int)
        tx, ty = fx - ix, fy - iy
        h = self.u
        return (h[ix, iy] * (1 - tx) * (1 - ty) + h[ix + 1, iy] * tx * (1 - ty)
                + h[ix, iy + 1] * (1 - tx) * ty + h[ix + 1, iy + 1] * tx * ty)


# ---------------------------------------------------------------------------
# The Deadzolt star, traced from public/brand/star.webp

STAR_CORE = (-0.08, 0.12, 0.62)
STAR_SPIKES = [
    # tip (x, y), base radius
    ((-1.18, 1.50), 0.40),  # long upper-left
    ((0.80, 1.42), 0.38),  # upper-right
    ((1.42, -0.22), 0.36),  # right
    ((0.52, -1.62), 0.42),  # long bottom
    ((-1.36, 0.06), 0.30),  # left
    ((-0.92, -0.70), 0.26),  # small lower-left
]


def star2d(x, y, scale=1.0, cx=0.0, cy=0.0, rot=0.0, k=0.32):
    c, s = math.cos(-rot), math.sin(-rot)
    lx, ly = (x - cx) / scale, (y - cy) / scale
    x, y = lx * c - ly * s, lx * s + ly * c
    ox, oy, r = STAR_CORE
    d = length2(x - ox, y - oy) - r
    for tip, ra in STAR_SPIKES:
        d = smin(d, thorn2d(x, y, (ox, oy), tip, ra, 0.012), k)
    return d * scale


_STAR_FIELD = None


def star_field():
    """The star's balloon field, solved once and shared between models."""
    global _STAR_FIELD
    if _STAR_FIELD is None:
        _STAR_FIELD = HeightField(star2d, (-1.7, -1.9), (1.7, 1.9), 0.004, gain=0.95)
    return _STAR_FIELD


def star_balloon(x, y, z, scale=1.0):
    """The puffed star facing -Y, at the given scale."""
    return star_field().balloon(x / scale, z / scale, y / scale) * scale


# ---------------------------------------------------------------------------
# Meshing

def sample(sdf, lo, hi, voxel):
    lo = np.array(lo, dtype=np.float64)
    hi = np.array(hi, dtype=np.float64)
    n = np.ceil((hi - lo) / voxel).astype(int) + 1
    xs = lo[0] + np.arange(n[0]) * voxel
    ys = lo[1] + np.arange(n[1]) * voxel
    zs = lo[2] + np.arange(n[2]) * voxel
    out = np.empty(n, dtype=np.float32)
    Y, Z = np.meshgrid(ys, zs, indexing="ij")
    for i, x in enumerate(xs):
        out[i] = sdf(np.full_like(Y, x), Y, Z)
    print(f"  sampled {n[0]}x{n[1]}x{n[2]} voxels", flush=True)
    return out, lo


def field_to_mesh(name, sdf, lo, hi, voxel):
    arr, origin = sample(sdf, lo, hi, voxel)
    band = 4 * voxel
    dens = np.clip(-arr, -band, band).astype(np.float32)
    grid = openvdb.FloatGrid(-band)
    grid.copyFromArray(dens, tolerance=1e-7)
    grid.name = "density"
    grid.transform = openvdb.createLinearTransform(voxelSize=voxel)
    path = os.path.join(tempfile.gettempdir(), f"dz_{name}.vdb")
    openvdb.write(path, grids=[grid])

    vol_data = bpy.data.volumes.new(name + "_vol")
    vol_data.filepath = path
    vol = bpy.data.objects.new(name + "_vol", vol_data)
    bpy.context.scene.collection.objects.link(vol)

    me = bpy.data.meshes.new(name + "_tmp")
    obj = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(obj)
    mod = obj.modifiers.new("v2m", "VOLUME_TO_MESH")
    mod.object = vol
    mod.grid_name = "density"
    mod.threshold = 0.0
    mod.resolution_mode = "GRID"
    mod.adaptivity = 0.0
    apply_all(obj)
    bpy.data.objects.remove(vol)
    bpy.data.volumes.remove(vol_data)
    obj.data.transform(_translation(origin))
    print(f"  {name}: {len(obj.data.polygons)} faces from volume", flush=True)
    return obj


def _translation(v):
    from mathutils import Matrix
    return Matrix.Translation(tuple(float(c) for c in v))


def apply_all(obj):
    dg = bpy.context.evaluated_depsgraph_get()
    ev = obj.evaluated_get(dg)
    new = bpy.data.meshes.new_from_object(ev)
    old = obj.data
    obj.modifiers.clear()
    obj.data = new
    if old.users == 0:
        bpy.data.meshes.remove(old)


def tri_count(obj):
    return sum(len(p.vertices) - 2 for p in obj.data.polygons)


def decimate(obj, target_tris):
    tris = tri_count(obj)
    if tris > target_tris:
        mod = obj.modifiers.new("dec", "DECIMATE")
        mod.ratio = target_tris / tris
        mod.use_collapse_triangulate = True
        apply_all(obj)
    print(f"  {obj.name}: {tri_count(obj)} triangles", flush=True)


def raw_gradient(sdf, P, eps):
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    return np.stack([
        sdf(x + eps, y, z) - sdf(x - eps, y, z),
        sdf(x, y + eps, z) - sdf(x, y - eps, z),
        sdf(x, y, z + eps) - sdf(x, y, z - eps),
    ], axis=1) / (2 * eps)


def gradient(sdf, P, eps):
    g = raw_gradient(sdf, P, eps)
    return g / np.maximum(np.linalg.norm(g, axis=1, keepdims=True), 1e-9)


def finish_surface(obj, sdf, eps, project=True):
    """Snap vertices back onto the surface and use the field's exact normals."""
    me = obj.data
    P = np.empty(len(me.vertices) * 3)
    me.vertices.foreach_get("co", P)
    P = P.reshape(-1, 3)
    if project:
        for _ in range(4):
            d = sdf(P[:, 0], P[:, 1], P[:, 2])
            g = raw_gradient(sdf, P, eps)
            step = d / np.maximum((g * g).sum(1), 1e-6)
            step = np.clip(step, -eps * 2, eps * 2)
            P = P - g * step[:, None]
        me.vertices.foreach_set("co", P.ravel())
    N = gradient(sdf, P, eps)
    me.shade_smooth()
    me.normals_split_custom_set_from_vertices([tuple(n) for n in N])
    me.update()


def build(name, sdf, lo, hi, voxel, target_tris, project=True, normal_eps=0.5):
    obj = field_to_mesh(name, sdf, lo, hi, voxel)
    if not os.environ.get("DZ_NO_DECIMATE"):
        decimate(obj, target_tris)
    finish_surface(obj, sdf, voxel * normal_eps, project)
    return obj


# ---------------------------------------------------------------------------
# Materials

# What the site's chrome should look like in three.js. The exporter cannot
# express thin film without a custom node group, so export() writes these
# straight into the GLB as KHR_materials_iridescence.
IRIDESCENCE = {"iridescenceFactor": 1.0, "iridescenceIor": 1.7,
               "iridescenceThicknessMinimum": 120.0, "iridescenceThicknessMaximum": 520.0}


def chrome(name="Chrome", film=380.0, film_ior=1.45, rough=0.045, tint=(0.97, 0.97, 0.98),
           iridescent=True):
    m = bpy.data.materials.new(name)
    m.use_backface_culling = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*tint, 1)
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = rough
    m["dz_iridescent"] = iridescent
    m["dz_film"] = film
    m["dz_film_ior"] = film_ior
    return m


def holo_for_render(mat):
    """Oil-slick thin film for the preview stills.

    Film thickness drifts across the surface with a soft noise so the chrome
    breaks into the yellow, magenta and green bands of the brand mark.
    """
    if not mat.get("dz_iridescent"):
        return
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Thin Film IOR"].default_value = mat["dz_film_ior"]
    coord = nt.nodes.new("ShaderNodeTexCoord")
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 0.9
    noise.inputs["Detail"].default_value = 1.5
    noise.inputs["Distortion"].default_value = 0.6
    ramp = nt.nodes.new("ShaderNodeMapRange")
    ramp.inputs["From Min"].default_value = 0.3
    ramp.inputs["From Max"].default_value = 0.7
    ramp.inputs["To Min"].default_value = mat["dz_film"] * 0.55
    ramp.inputs["To Max"].default_value = mat["dz_film"] * 1.6
    nt.links.new(coord.outputs["Object"], noise.inputs["Vector"])
    nt.links.new(noise.outputs["Fac"], ramp.inputs["Value"])
    nt.links.new(ramp.outputs["Result"], bsdf.inputs["Thin Film Thickness"])


def glow(name="BrandRed", strength=1.2, color=BRAND_RED):
    m = bpy.data.materials.new(name)
    m.use_backface_culling = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Roughness"].default_value = 0.35
    bsdf.inputs["Emission Color"].default_value = (*color, 1)
    bsdf.inputs["Emission Strength"].default_value = strength
    return m


def gloss_black(name="GlossBlack"):
    m = bpy.data.materials.new(name)
    m.use_backface_culling = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.004, 0.004, 0.005, 1)
    bsdf.inputs["Roughness"].default_value = 0.08
    bsdf.inputs["Coat Weight"].default_value = 1.0
    return m


def assign(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)


# ---------------------------------------------------------------------------
# Scene, render and export

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def blender_datafile(*parts):
    base = os.path.dirname(bpy.app.binary_path)
    ver = f"{bpy.app.version[0]}.{bpy.app.version[1]}"
    return os.path.join(base, ver, "datafiles", *parts)


def look_at(ob, target):
    from mathutils import Vector
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


PANELS_VISIBLE = False  # env.py flips this to bake the studio into a panorama


def _panel(name, loc, size, color, strength, target=(0, 0, 0)):
    """An emissive card: seen in reflections, invisible to the camera."""
    me = bpy.data.meshes.new(name)
    sx, sy = size[0] / 2, size[1] / 2
    me.from_pydata([(-sx, -sy, 0), (sx, -sy, 0), (sx, sy, 0), (-sx, sy, 0)], [], [(3, 2, 1, 0)])
    ob = bpy.data.objects.new(name, me)
    ob.location = loc
    bpy.context.scene.collection.objects.link(ob)
    look_at(ob, target)  # -Z towards the target, so the reversed face points at it
    # Soft falloff to the edges, like a real diffused softbox.
    m = bpy.data.materials.new(name)
    nt = m.node_tree
    nt.nodes.clear()
    tc = nt.nodes.new("ShaderNodeTexCoord")
    centre = nt.nodes.new("ShaderNodeVectorMath")
    centre.operation = "MULTIPLY_ADD"
    centre.inputs[1].default_value = (2, 2, 0)
    centre.inputs[2].default_value = (-1, -1, 0)
    grad = nt.nodes.new("ShaderNodeTexGradient")
    grad.gradient_type = "QUADRATIC_SPHERE"
    soft = nt.nodes.new("ShaderNodeMath")
    soft.operation = "POWER"
    soft.inputs[1].default_value = 0.6
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1)
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = strength * 1.6
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    nt.links.new(tc.outputs["Generated"], centre.inputs[0])
    nt.links.new(centre.outputs[0], grad.inputs["Vector"])
    nt.links.new(grad.outputs["Fac"], soft.inputs[0])
    nt.links.new(soft.outputs[0], mul.inputs[0])
    nt.links.new(mul.outputs[0], em.inputs["Strength"])
    # Emission over a transparent card, so the soft edges never mask the sky.
    clear = nt.nodes.new("ShaderNodeBsdfTransparent")
    add = nt.nodes.new("ShaderNodeAddShader")
    nt.links.new(clear.outputs[0], add.inputs[0])
    nt.links.new(em.outputs[0], add.inputs[1])
    nt.links.new(add.outputs[0], out.inputs[0])
    me.materials.append(m)
    ob.visible_camera = PANELS_VISIBLE
    ob.visible_shadow = False
    return ob


HOLO_STOPS = [
    (0.00, (1.0, 1.0, 1.0)),
    (0.16, (1.0, 0.86, 0.25)),   # yellow
    (0.34, (1.0, 0.22, 0.70)),   # magenta
    (0.52, (0.25, 1.0, 0.55)),   # green
    (0.70, (0.22, 0.80, 1.0)),   # cyan
    (0.86, (0.75, 0.70, 1.0)),   # lilac
    (1.00, (1.0, 1.0, 1.0)),
]


def holo_world(sc, camera_black=True, strength=1.4):
    """A holographic studio: rainbow bands overhead, a bright horizon and a
    dark floor, warped by soft noise so reflections flow like liquid."""
    w = bpy.data.worlds.new("HoloStudio")
    sc.world = w
    nt = w.node_tree
    nt.nodes.clear()
    L = nt.links.new
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    L(tc.outputs["Generated"], sep.inputs[0])

    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 1.2
    noise.inputs["Detail"].default_value = 2.0
    L(tc.outputs["Generated"], noise.inputs["Vector"])

    # Band coordinate: diagonal sweep plus noise warp.
    a = nt.nodes.new("ShaderNodeMath"); a.operation = "MULTIPLY_ADD"
    a.inputs[1].default_value = 0.45
    L(sep.outputs["X"], a.inputs[0]); L(sep.outputs["Z"], a.inputs[2])
    b = nt.nodes.new("ShaderNodeMath"); b.operation = "MULTIPLY_ADD"
    b.inputs[1].default_value = 0.9
    L(noise.outputs["Fac"], b.inputs[0]); L(a.outputs[0], b.inputs[2])
    wrap = nt.nodes.new("ShaderNodeMath"); wrap.operation = "FRACT"
    L(b.outputs[0], wrap.inputs[0])

    ramp = nt.nodes.new("ShaderNodeValToRGB")
    els = ramp.color_ramp.elements
    els[0].position, els[0].color = HOLO_STOPS[0][0], (*HOLO_STOPS[0][1], 1)
    els[1].position, els[1].color = HOLO_STOPS[-1][0], (*HOLO_STOPS[-1][1], 1)
    for pos, col in HOLO_STOPS[1:-1]:
        e = els.new(pos)
        e.color = (*col, 1)
    L(wrap.outputs[0], ramp.inputs["Fac"])

    # Brightness by elevation: dark floor, glowing horizon, softer sky.
    elev = nt.nodes.new("ShaderNodeValToRGB")
    ee = elev.color_ramp.elements
    ee[0].position, ee[0].color = 0.0, (0.015, 0.015, 0.015, 1)
    ee[1].position, ee[1].color = 1.00, (0.9, 0.9, 0.9, 1)
    e = ee.new(0.53); e.color = (1.4, 1.4, 1.4, 1)
    e = ee.new(0.47); e.color = (0.10, 0.10, 0.10, 1)
    e = ee.new(0.62); e.color = (0.35, 0.35, 0.35, 1)
    zmap = nt.nodes.new("ShaderNodeMapRange")
    zmap.inputs["From Min"].default_value = -1.0
    zmap.inputs["From Max"].default_value = 1.0
    L(sep.outputs["Z"], zmap.inputs["Value"])
    L(zmap.outputs["Result"], elev.inputs["Fac"])

    mul = nt.nodes.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"
    mul.inputs["Factor"].default_value = 1.0
    L(ramp.outputs["Color"], mul.inputs[6]); L(elev.outputs["Color"], mul.inputs[7])

    bg = nt.nodes.new("ShaderNodeBackground")
    bg.inputs["Strength"].default_value = strength
    L(mul.outputs[2], bg.inputs["Color"])
    out = nt.nodes.new("ShaderNodeOutputWorld")
    if camera_black:
        black = nt.nodes.new("ShaderNodeBackground")
        black.inputs["Color"].default_value = (0, 0, 0, 1)
        lp = nt.nodes.new("ShaderNodeLightPath")
        mix = nt.nodes.new("ShaderNodeMixShader")
        L(lp.outputs["Is Camera Ray"], mix.inputs[0])
        L(bg.outputs[0], mix.inputs[1])
        L(black.outputs[0], mix.inputs[2])
        L(mix.outputs[0], out.inputs[0])
    else:
        L(bg.outputs[0], out.inputs[0])
    return w


def studio(cam_loc=(0, -9.0, 0.4), target=(0, 0, 0), lens=60, res=1600, samples=512):
    """Black void, big softboxes for chrome, Y2K coloured cards and a red rim."""
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    prefs = bpy.context.preferences.addons["cycles"].preferences
    prefs.compute_device_type = "OPTIX"
    prefs.get_devices()
    for d in prefs.devices:
        d.use = d.type == "OPTIX"
    sc.cycles.device = "GPU"
    sc.cycles.samples = samples
    sc.cycles.use_denoising = True
    sc.cycles.max_bounces = 16
    sc.cycles.glossy_bounces = 12
    sc.cycles.caustics_reflective = False
    sc.render.resolution_x = res
    sc.render.resolution_y = res
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Punchy"
    sc.view_settings.exposure = 0.35

    holo_world(sc, camera_black=True)

    # White softboxes give the chrome its crisp streaks; the world supplies
    # the holographic colour in between.
    _panel("Overhead", (0.0, -1.5, 5.0), (7.0, 3.0), (1, 1, 1), 5.0)
    _panel("StripL", (-4.5, -2.5, 0.5), (0.9, 7.0), (1, 1, 1), 9.0)
    _panel("StripR", (4.8, -1.0, 0.8), (0.6, 7.0), (1, 1, 1), 7.0)
    _panel("FrontStrip", (-2.5, -12.0, 3.5), (5.0, 0.5), (1, 1, 1), 10.0)
    _panel("Red", (0.0, 5.0, -3.0), (6.0, 2.0), BRAND_RED, 6.0)

    key = bpy.data.lights.new("Key", "AREA")
    key.size = 2.0
    key.energy = 250
    ko = bpy.data.objects.new("Key", key)
    ko.location = (-3.0, -4.0, 4.0)
    sc.collection.objects.link(ko)
    look_at(ko, target)

    cam_data = bpy.data.cameras.new("Camera")
    cam_data.lens = lens
    cam = bpy.data.objects.new("Camera", cam_data)
    cam.location = cam_loc
    sc.collection.objects.link(cam)
    look_at(cam, target)
    sc.camera = cam
    return cam


def render(stem):
    for m in list(bpy.data.materials):
        holo_for_render(m)
    os.makedirs(PREVIEWS, exist_ok=True)
    sc = bpy.context.scene
    sc.render.image_settings.file_format = "WEBP"
    sc.render.image_settings.quality = 90
    sc.render.filepath = os.path.join(PREVIEWS, stem + ".webp")
    bpy.ops.render.render(write_still=True)
    print("  rendered", sc.render.filepath, flush=True)


def export(stem, objects, root_name=None):
    """Parent everything under one empty and write a meshopt-compressed GLB.

    Meshopt rather than Draco because three.js ships the meshopt decoder,
    so the site loads these without fetching a decoder from a CDN.
    """
    os.makedirs(MODELS, exist_ok=True)
    root = bpy.data.objects.new(root_name or stem, None)
    bpy.context.scene.collection.objects.link(root)
    for o in objects:
        o.parent = root
    bpy.ops.object.select_all(action="DESELECT")
    root.select_set(True)
    for o in objects:
        o.select_set(True)
    path = os.path.join(MODELS, stem + ".glb")
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_normals=True,
        export_texcoords=False,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_extras=False,
        export_meshopt_compression_enable=True,
        export_meshopt_extension="EXT_meshopt_compression",
    )
    for o in objects:
        o.parent = None
    bpy.data.objects.remove(root)
    _patch_materials(path)
    print(f"  exported {path} ({os.path.getsize(path) / 1024:.0f} KB)", flush=True)
    return path


def _patch_materials(path):
    import json
    import struct
    data = open(path, "rb").read()
    jlen = struct.unpack("<I", data[12:16])[0]
    j = json.loads(data[20:20 + jlen])
    rest = data[20 + jlen:]
    used = set(j.get("extensionsUsed", []))
    for m in j.get("materials", []):
        bm = bpy.data.materials.get(m.get("name"))
        m["doubleSided"] = False
        if bm is not None and bm.get("dz_iridescent"):
            m.setdefault("extensions", {})["KHR_materials_iridescence"] = dict(IRIDESCENCE)
            used.add("KHR_materials_iridescence")
    if used:
        j["extensionsUsed"] = sorted(used)
    js = json.dumps(j, separators=(",", ":")).encode()
    js += b" " * ((4 - len(js) % 4) % 4)
    total = 12 + 8 + len(js) + len(rest)
    head = struct.pack("<III", 0x46546C67, 2, total) + struct.pack("<II", len(js), 0x4E4F534A)
    open(path, "wb").write(head + js + rest)


def save_blend(stem):
    """Keep the source scene in temp for hand tweaking."""
    out = os.path.join(tempfile.gettempdir(), "deadzolt_blend")
    os.makedirs(out, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out, stem + ".blend"))

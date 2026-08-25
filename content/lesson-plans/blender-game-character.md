---
title: "Blender: Low-Poly Game Character for Defold"
tags: [moc, lesson-plan]
level: fundamentals
type: moc
reviewed: 2026-08-24
---

A beginner path from opening Blender for the first time to shipping a **low-poly,
rigged, animated humanoid character into the [Defold](https://defold.com) game engine**.
It follows the real game-art pipeline in order, because each stage feeds the next: you
model the character, give it colors, build a skeleton, make it move, and export it so it
plays inside your game.

This is an ambitious first project. Rigging and a believable walk cycle are the genuinely
hard parts, and that is normal: the plan calls them out and points to gentler on-ramps
(like Blender's built-in **Rigify**) so you are not stuck. Work through the sections in
order the first time; the pipeline does not skip.

## Objectives

By the end of this path you can:

* Navigate Blender confidently and move, rotate, and scale objects without thinking about it.
* Box-model a low-poly humanoid with topology that deforms cleanly when animated.
* UV unwrap and give the character a game-friendly, low-poly look.
* Build a biped skeleton with a single root bone and weight-paint the mesh onto it.
* Animate an idle and a walk cycle as separate, reusable actions.
* Export the character as an animated glTF that Defold accepts.
* Import it into Defold and play its animations in a running project.

## Prerequisites

The latest [Blender](https://www.blender.org/download/) and
[Defold](https://defold.com/) installed, a three-button mouse (a numpad helps but is not
required), and patience. No prior 3D experience is assumed.

## How to use this path

Each section follows the same rhythm:

* **Focus:** the questions you should be able to answer.
* **Learn:** what to watch or read.
* **Practice:** build the next piece of your actual character, this path rewards doing.
* **Self-check:** you understand it when you can do these.
* **Ask yourself:** heuristic questions to test real understanding.

There is no timer. The sections build on each other and end with your character running in
Defold. Save often, and keep incremental versions so a mistake never costs you the whole model.

## 1. Fundamentals and navigation

Getting comfortable inside the 3D viewport before you build anything.

**Focus:** How do you orbit, pan, and zoom? What do grab, rotate, and scale do, and how do
you constrain them to an axis? What is the difference between Object Mode and Edit Mode?

**Learn:**
* [Blender Guru: the Donut tutorial](https://www.blenderguru.com/): the classic first project. Linking his site rather than a version-pinned playlist so you always land on the current-Blender edition; the early parts teach the interface, navigation, and basic editing.
* [CG Cookie: Blender Basics](https://cgcookie.com/courses/blender-basics-an-introduction-to-blender-4-x): a structured, up-to-date beginner course through the interface and first models.
* [Blender User Manual (latest)](https://docs.blender.org/manual/en/latest/): the version-current reference (the `/latest/` URL always tracks the newest Blender, e.g. 5.x).

**Practice:** Open Blender, delete the default cube, add a few primitives, and move, rotate,
and scale them along specific axes (press G then X, Y, or Z). Orbit and frame the scene until
navigation feels automatic. Save the file, close, and reopen it.

**Self-check:** you can navigate the viewport without hunting for controls, constrain a
transform to one axis, and switch between Object and Edit Mode on purpose.

**Ask yourself:**
* When something looks wrong, is it the object's position or the camera's? How can I tell?
* Which handful of shortcuts am I already reaching for without the menus?

## 2. Low-poly modeling and topology

Blocking out a humanoid body from simple shapes, with animation in mind.

**Focus:** What do extrude, loop cut, inset, and bevel each do? Why do quads and edge loops
at the joints matter for something that will bend?

**Learn:**
* [Grant Abbitt: course library](https://www.gabbitt.co.uk/courses): current, beginner-friendly modeling courses, and he specializes in **low-poly game characters**, exactly your goal. Start with his absolute-beginner and low-poly character material; his large free YouTube library is linked from there.
* [awesome-blender: Modeling resources](https://github.com/agmmnn/awesome-blender): a curated list to go deeper on any tool.

**Practice:** Block out a low-poly humanoid: head, torso, arms, and legs from primitives and
extrusions. Add edge loops where limbs will bend (shoulders, elbows, hips, knees), avoid long
thin triangles, and prefer quads while modeling. Aim for a modest budget, roughly a couple
thousand triangles and up to about 8,000 for a more detailed stylized character. The engine
triangulates your quads on export, so model in quads for clean deformation but budget in triangles.

**Self-check:** you can extrude and loop-cut deliberately, and you can point to the edge
loops that will let the elbows and knees bend without collapsing.

**Ask yourself:**
* If this arm has to bend, does it have enough geometry at the joint, and not too much elsewhere?
* Where am I adding detail the game camera will never see?

## 3. UV unwrapping and low-poly texturing

Turning the 3D surface into something you can color.

**Focus:** What is a UV map and why does a model need one? For a low-poly style, what is the
simplest way to get clean colors into the game (a small palette texture, vertex colors, or a
simple hand-painted image)?

**Learn:**
* [Blender User Manual: UV editing](https://docs.blender.org/manual/en/latest/): seams and unwrapping.
* [awesome-blender: Texture/UV and Materials](https://github.com/agmmnn/awesome-blender): curated low-poly texturing tools and palettes.

**Practice:** Mark seams, unwrap the character, and color it in a game-friendly way. Keep it
to a single texture or a small palette so it stays cheap to render. Aim for a look you like,
not photorealism.

**Self-check:** you can mark seams and unwrap without major stretching, and your character
reads clearly with its low-poly colors.

**Ask yourself:**
* Is my texture doing work a flat color could do more cheaply?
* Will these colors still read at the size the character appears in-game?

## 4. Rigging: armature, single root bone, weight painting

Giving the character a skeleton it can be posed and animated with.

**Focus:** What is an armature, and how does a mesh follow its bones? Why does Defold require
a **single root bone** at the top of the hierarchy, and how do you build the rig that way?
What does weight painting fix? Which rigging route fits a beginner making a game character:
hand-built with Rigify (most learning), auto-rigged with Mixamo (fastest, plus ready
animations), or a paid tool like Auto-Rig Pro?

**Learn:**
* [Blender User Manual: rigging and armatures (latest)](https://docs.blender.org/manual/en/latest/): bones, parenting, and weight paint, always current with your Blender version.
* **Rigify** (built-in, free): still the standard free rigger in Blender 5.x, not obsolete. Enable it in Preferences, Add-ons; it generates an editable meta-rig you shape to your character, and it is the best way to actually learn how a rig is built. The Blender Studio's CloudRig extends it if you want to go further.
* [Mixamo](https://www.mixamo.com/) (free, browser): the fastest route for a first humanoid, upload your model, get an auto-rig plus a large free library of ready animations (idle, walk, run). Two Defold caveats: it uses Mixamo-specific bone names, and you must ensure the exported skeleton has a single root bone.
* Auto-Rig Pro (paid add-on, on the Blender/Superhive market): what many professionals reach for, with smart auto-rigging and game-engine export presets. Worth knowing about, not required for a first character.
* [Defold: importing models](https://defold.com/manuals/importing-models/): the single-root-bone and hierarchy requirements to keep in mind whichever rigger you choose.

**Practice:** Rig your character one of two ways: generate a Rigify rig and adapt it (you learn
the most), or auto-rig it in Mixamo (fastest). Either way, make sure there is a single root
bone, skin the mesh to the armature, and weight-paint the shoulders, hips, and any spot that
deforms badly until posing looks clean.

**Self-check:** your rig has a single root bone, and you can pose an arm or leg and watch the
mesh follow without ugly pinching.

**Ask yourself:**
* When I rotate this bone, which vertices move that should not, and where do I fix that?
* Is my bone hierarchy something Defold will accept, one root at the top?

## 5. Animation: idle and walk cycle

Making the character move, in clips your game can play.

**Focus:** How do keyframes and the timeline work? What makes a walk cycle read as a walk?
Why should each animation be its own **action**, and how do you organize those actions (pushed
to named NLA strips) so the exporter and Defold see them as separate, named clips?

**Learn:**
* [Blender User Manual: animation (latest)](https://docs.blender.org/manual/en/latest/): keyframes, the dope sheet, and the Action Editor. The animation editors were streamlined in Blender 5.0, but these concepts are unchanged.
* **Organizing clips for export:** keep one Action per animation, then push each down to a named strip in the Nonlinear Animation (NLA) editor so it exports as a distinct, named glTF animation. Note that Blender 4.4 and later use a new "slotted actions" system, so the Action-assignment UI looks a little different from older tutorials.
* [awesome-blender: Animation resources](https://github.com/agmmnn/awesome-blender): curated walk-cycle and animation-principle tutorials.
* If you rigged in Mixamo, you can download ready idle, walk, and run animations from its library instead of hand-animating. That is the fast path; hand-animating even one cycle yourself teaches the most, so consider doing at least one by hand.

**Practice:** Create two separate actions: an **idle** (a small, looping breathing or sway)
and a **walk cycle** (contact, down, passing, up poses, looped). Name them clearly, then push
each down to a named NLA strip so the export produces two separate, named animations.

**Self-check:** you have at least an idle and a walk as named actions, each loops, and you can
switch between them in the Action Editor.

**Ask yourself:**
* Does my walk have weight, or does the character float? Where does the body dip and rise?
* If I loop this, does the last frame meet the first without a pop?

## 6. Export to Defold (animated glTF)

Packaging the model and its animations in a form Defold reads.

**Focus:** Why apply transforms (scale and rotation) before export? Why must the animations be
**baked** (sampled to per-bone matrices) rather than left as separate position, rotation, and
scale keys? Which glTF options matter: Skinning on, animation sampling on, and **Export
Deformation Bones Only** to drop the control and IK bones a Rigify or Mixamo rig adds?

**Learn:**
* [Defold: importing models](https://defold.com/manuals/importing-models/): the accepted formats and requirements.
* [Blender to Defold 3D animation guide (Defold forum)](https://forum.defold.com/t/blender-to-defold-3d-animation-guide/73771): a step-by-step of the exact export settings.

**Practice:** Apply transforms, then export as glTF with **Skinning** on, **Animation** included
with **sampling on**, and **Export Deformation Bones Only** enabled so only the deforming bones
ship (Rigify and Mixamo add control and IK bones you do not want in-game). Recent Blender and
Defold let you keep all animation clips in a single glTF file. Confirm the file contains the
mesh, a single-root skeleton, and your named animations.

**Self-check:** you produce one glTF that includes the mesh, a single-root skeleton, and both
animations baked in.

**Ask yourself:**
* Did I apply scale and rotation, and is the character the size I expect in meters?
* If Defold plays the animation but the mesh does not move, what does that tell me about the export or the material?

## 7. Integrate in Defold

Getting the character standing and animating inside a game project.

**Focus:** How do you add a Model component and point it at your glTF? Why does a skinned,
animated model need the **`model_skinned` material** rather than the default? How do you play
an animation from script?

**Learn:**
* [Defold: 3D model animation](https://defold.com/manuals/model-animation/): components, the skinned material, and playing animations.
* [Defold: skeletal animation example](https://defold.com/examples/model/character/): a working reference project.

**Practice:** In a Defold project, add a Model component, set its Mesh to your glTF, assign
`/builtins/materials/model_skinned.material`, and play the idle from a script, then switch to
the walk. Adjust scale and orientation until it looks right in the game.

**Self-check:** your character stands in a Defold scene and plays its idle and walk on command.

**Ask yourself:**
* If the mesh appears but stays in a T-pose, is it the material, the animation call, or the export?
* What would I change in Blender to make the next character drop into Defold with fewer surprises?

## Capstone

Tie it all together:

> A low-poly humanoid you modeled, textured, rigged with a single root bone, and animated with
> an idle and a walk cycle, exported as a baked-animation glTF and running inside a Defold
> project, switching between idle and walk on command.

## Self-assessment checklist

- [ ] I can navigate Blender's viewport and transform objects along a chosen axis without hunting.
- [ ] I can box-model a low-poly humanoid with edge loops where it needs to bend.
- [ ] I can UV unwrap and give the character a clean low-poly look on a single texture.
- [ ] I can build or generate a biped rig with a single root bone and weight-paint clean deformation.
- [ ] I can animate an idle and a walk cycle as separate, looping actions.
- [ ] I can export a baked-animation glTF that includes mesh, skeleton, and actions.
- [ ] I can import it into Defold, apply the skinned material, and play the animations.

## Resources and next steps

* [awesome-blender](https://github.com/agmmnn/awesome-blender): a large curated map of Blender add-ons, assets, and tutorials for going deeper on any stage.
* [Blender User Manual](https://docs.blender.org/manual/en/latest/) and [Defold manuals](https://defold.com/manuals/): the authoritative references.
* As you learn, capture your own notes in a `blender/` subject folder and link them back here; over time the **Learn** lists can point at your own notes instead of only outside videos.

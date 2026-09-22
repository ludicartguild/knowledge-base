---
title: "Tic-Tac-Toe in Defold"
tags: [lesson-plan, game-dev]
level: fundamentals
type: moc
reviewed: 2026-09-22
---

Learn the Defold engine by building one complete 2D game. Every section leaves you with
something that runs: by section 5 you can click cells, by section 7 the win condition
fires, by section 9 there is an opponent that cannot be beaten.

The point is to get Defold's mental model into your fingers rather than to read about it.
That model is small, and once the four nouns and one verb in section 3 click, the rest of
the engine stops being surprising.

This path assumes you come from TypeScript or JavaScript and treats Lua as something to
learn deliberately. Section 2 covers the differences that bite hardest in the first week.
Skim it if you already know Lua.

## Objectives

By the end of this path you can:

* Navigate the Defold editor and use hot reload without restarting the game.
* Write Lua without falling into the traps that catch JavaScript developers.
* Explain Defold's component and message-passing model and why it is not an object graph.
* Build a playable grid that responds to clicks and marks cells.
* Detect a win or draw with logic you can test outside the engine.
* Add a GUI, animation, and sound.
* Implement a minimax opponent with a tunable difficulty.
* Bundle the game for desktop and web.

## Prerequisites

[Defold](https://defold.com/download/) installed, which is a single download with no
toolchain to configure. Programming experience in any language. No engine experience
assumed.

## How to use this path

Work in order. Each section ends with the game in a working state, and the rule is
simple: **if it does not compile and run, do not move on.** Keep the project in git and
commit at each section boundary so you can roll back when you get stuck.

Each section follows the same rhythm:

* **Focus:** the questions you should be able to answer by the end.
* **Learn:** what to read.
* **Practice:** the state the game should reach.
* **Self-check:** you are ready to move on when you can do these.
* **Answer:** collapsed, so you can attempt the self-check first.
* **Ask yourself:** heuristics that test understanding rather than recall.

## 1. Setup and first run

Getting the editor open and something on screen before you learn anything.

**Focus:** What is in the Defold editor, and what does hot reload actually reload?

**Learn:**
* [Defold: getting started tutorial](https://defold.com/tutorials/getting-started/): finish this end to end. It is small and not optional.
* [Defold: the editor](https://defold.com/manuals/editor/): orientation to the interface.

**Practice:** Create an empty project, build it, and see the default window. Edit a script
while the game is running, save, and watch the change apply without a restart. Commit the
skeleton.

**Self-check:** you can create, build, and run a project, and you can describe what hot
reload does and does not cover.

> [!question]- Answer
> **The editor.** One application holding your project files, the scene editor, a code
> editor, asset import, and build target selection. Unlike Unity or Unreal there is no
> separate IDE for code, though you can use an external editor if you prefer.
> **Hot reload.** Save a `.lua` file while the game runs and the new code applies
> immediately, without restarting. This is the feature you will lean on most.
> **What it does not do.** Hot reload swaps code, not state. Variables already
> initialised keep their values, and a change to `init()` will not re-run on already
> existing objects. If behaviour looks stale after a reload, that is usually why.
> **On disk.** Defold projects are text files: Lua, and JSON-like `.collection`, `.go`,
> and `.script`. They diff and merge properly, which is why keeping this in git actually
> works.

**Ask yourself:**
* When a change does not seem to take effect, is it the code or the state that is stale?
* What would I lose if I had to restart on every edit, and how does that change how I work?

## 2. Lua for JavaScript developers

The handful of differences that will confuse you in week one.

**Focus:** What does Lua do differently from JavaScript in ways that produce bugs rather
than syntax errors?

**Learn:**
* [Learn X in Y minutes: Lua](https://learnxinyminutes.com/docs/lua/): a single-page tour. Read this first.
* [Lua 5.1 Reference Manual](https://www.lua.org/manual/5.1/): Defold uses 5.1. It is short, so bookmark it.
* [Programming in Lua](https://www.lua.org/pil/): the canonical book, by the language's creator.

**Practice:** Write a standalone Lua file that builds a 3 by 3 grid as a nested table,
fills it with `"X"`, `"O"`, and `nil`, prints it, and implements `check_winner` returning
`"X"`, `"O"`, `"draw"`, or `nil`. This is exactly the logic you will port in section 7,
written in isolation so the language is not fighting the engine while you learn it.

**Self-check:** you can write idiomatic Lua and name the differences from JavaScript that
cause silent bugs.

> [!question]- Answer
> **Tables are the only compound type.** Arrays, objects, hashmaps, and modules are all
> tables. The same `{}` literal builds all of them.
> **Indexing starts at 1.** `t[1]` is first, `#t` is the length. This is the single most
> common stumble coming from JavaScript, and it fails quietly rather than loudly.
> **`local` is not the default.** Variables are global unless declared `local`. A missing
> `local` leaks across scripts and produces bugs that look like action at a distance.
> Write `local` unless you have a specific reason.
> **Only `false` and `nil` are falsy.** Zero is truthy. The empty string is truthy. A
> guard written as `if count then` will not do what a JavaScript habit expects.
> **Concatenation is `..`.** The `+` operator is numeric only.
> **No classes.** `obj:method(args)` is sugar for `obj.method(obj, args)`, with methods
> stored on a table and usually reached through an `__index` metatable.
> **Multiple return values are real.** `local a, b = f()` returns two values, and is not
> destructuring an array.
> **`pairs` against `ipairs`.** Use `ipairs` for sequential integer keys, which stops at
> the first `nil`. Use `pairs` for hash tables, with no guaranteed order. Picking the
> wrong one on a sparse array silently truncates your loop.

**Ask yourself:**
* Which of these would produce a bug that looks like something else entirely?
* Where in my grid code does the difference between `pairs` and `ipairs` actually matter?

## 3. The Defold architecture

The model that makes the rest of the engine legible.

**Focus:** What are collections, game objects, and components, and how do they
communicate? Why is there no object graph you can traverse?

**Learn:**
* [Defold: building blocks](https://defold.com/manuals/building-blocks/): collections, game objects, components.
* [Defold: message passing](https://defold.com/manuals/message-passing/): the one verb the whole engine runs on.
* [Defold: addressing](https://defold.com/manuals/addressing/): how URLs identify things.

**Practice:** Build a scene with two game objects, each with a script. Make one post a
message to the other on a key press and have the receiver log it. Then break the address
deliberately and read the error, so you recognise it later.

**Self-check:** you can explain the four nouns and one verb, and address any component
from any script.

> [!question]- Answer
> **Collection.** A scene or a prefab: a tree of game objects saved as a file. The
> bootstrap collection is what loads at startup.
> **Game object.** A positioned container. It has a transform and an identity, and by
> itself does nothing.
> **Component.** The thing that acts: a sprite, a script, a sound, a collision shape.
> Components hang off game objects.
> **Script.** A component that runs Lua through lifecycle callbacks: `init`, `update`,
> `on_message`, `on_input`, `final`.
> **The verb is `msg.post`.** Components do not hold references to each other and there
> is no object graph to walk. You address a target by URL and post to it. The URL form is
> `socket:/path/to/object#component`, where `.` means this object and `#` names a
> component on it.
> **Why it is built this way.** Message passing keeps components independent, which is
> what makes hot reload safe and what stops a scene turning into a web of references. The
> cost is that a typo in an address is a runtime error rather than a compile error, which
> is why you should learn to recognise it early.
> **The usual confusion.** "Defold is not doing what I expect" almost always traces back
> to addressing the wrong thing or expecting a direct call where a message is required.

**Ask yourself:**
* If two components need to share state, where should that state actually live?
* What does message passing make hard, and is that a cost or a guardrail here?

## 4. Project setup

Laying out the project and getting the assets in.

**Focus:** What goes where, what does `game.project` control, and what is an atlas for?

**Learn:**
* [Defold: project settings](https://defold.com/manuals/project-settings/): what `game.project` configures.
* [Defold: atlas](https://defold.com/manuals/atlas/): packing images into one texture.
* [Defold: input](https://defold.com/manuals/input/): binding raw input to named actions.

**Practice:** Create `main/`, `assets/`, `gui/`, and `input/`. Build an atlas containing
an empty cell, an X, an O, and a win-line sprite. Set the bootstrap collection and window
size in `game.project`. Bind mouse click to a `place` action and a key to `restart` in
`/input/game.input_binding`.

**Self-check:** you can configure a project from scratch and explain why input bindings
exist rather than reading raw input.

> [!question]- Answer
> **Structure.** Defold enforces no layout, so the convention is folders by role:
> `main/`, `assets/`, `gui/`, `input/`. Decide once and hold to it, because addresses are
> paths and moving files later means fixing every URL that referenced them.
> **`game.project`.** The root configuration: render script, window dimensions, bootstrap
> collection, dependencies. Edit it through the editor's project settings rather than by
> hand.
> **Atlas.** A single packed texture built from individual PNGs. One texture means one
> draw call for everything on it, which is the difference between a game that runs and one
> that stutters once there are a hundred sprites.
> **Input bindings.** The map from raw input to logical action names. Scripts then react
> to `hash("place")` rather than to a specific mouse button. This is what lets you
> remap controls, support touch and mouse together, and change bindings without touching
> game code.
> **The render script.** Decides which layers draw in what order through which camera.
> The default 2D script is correct for this game and worth leaving alone until you have a
> reason.

**Ask yourself:**
* If I move a file, what breaks, and how would I find all of it?
* Which of these settings would I regret getting wrong late in a project?

## 5. Drawing the board and handling clicks

Making the grid visible and knowing which cell was pressed.

**Focus:** How does a sprite get on screen? How do you turn a click position into a grid
coordinate?

**Learn:**
* [Defold: sprite component](https://defold.com/manuals/sprite/): rendering an atlas image.
* [Defold: input](https://defold.com/manuals/input/): `on_input`, action fields, and input focus.

**Practice:** Place nine cell game objects in a grid, each with a sprite. Have a single
controller script acquire input focus, receive the `place` action, convert the click
position to a row and column, and log it. Click every cell and confirm the mapping.

**Self-check:** you can render a grid and map a screen click to the correct cell.

> [!question]- Answer
> **Sprites.** Add a sprite component to a game object, point it at an atlas image, and
> position the object. With the default render script one world unit is one screen pixel,
> which keeps the arithmetic simple in 2D.
> **Instances against factories.** Nine objects placed directly in the collection is
> simpler than spawning them, and for a fixed 3 by 3 grid there is no reason to use a
> factory. Factories earn their place when the count is dynamic.
> **Input focus.** Only objects that asked for it receive input. Call
> `msg.post(".", "acquire_input_focus")` from the one controller that needs it. Having
> every cell listen for clicks is the design that seems obvious and then makes the turn
> rule impossible to keep in one place.
> **Screen to cell.** Subtract the board origin, divide by cell size, and floor. Doing the
> arithmetic in the controller is cheaper and more testable than adding collision shapes
> to nine objects just to detect a press.
> **Action against message.** An action is raw input arriving in `on_input`, identified by
> `action_id`. A message is script-to-script, arriving in `on_message`, identified by
> `message_id`. They look similar and come from different places.

**Ask yourself:**
* Why does the controller own the click rather than each cell?
* If the board moved or resized, what in my mapping would break?

## 6. Turns and marking cells

Making the game stateful.

**Focus:** Where should game state live? How does a cell change its own appearance?

**Learn:**
* [Defold: Lua modules](https://defold.com/manuals/modules/): the `local M = {}` pattern.
* [Defold: animation](https://defold.com/manuals/animation/): `play_flipbook` for swapping sprite images.

**Practice:** Create `game_state.lua` holding the grid and the current player, with
functions to mark a cell and pass the turn. Have the controller post a `mark` message to
the clicked cell, and have the cell swap its own sprite in response. Clicking an occupied
cell must do nothing.

**Self-check:** you can hold state in a module, drive visuals by message, and explain why
the occupied-cell rule belongs in the controller.

> [!question]- Answer
> **Modules.** `local M = {} ... return M` gives you a file other scripts can `require`.
> Putting the grid and turn in `game_state.lua` means the rules live somewhere you can
> test without running the engine.
> **Posting to a specific object.** `msg.post("/cell_2_3#script", "mark", { player = "X" })`
> addresses one cell's script, and the receiver reads the table in `on_message`.
> **Changing a sprite.** `sprite.play_flipbook("#sprite", hash("x"))` swaps the displayed
> image. Each cell handling its own visual keeps the controller out of presentation.
> **Why the rule lives in the controller.** If each cell decided whether it was already
> marked, the turn rule would be spread across nine scripts and the bug where a click
> flips the turn without marking anything becomes very hard to find. One place owns the
> rule; the cells only render.
> **Sketch first.** Tic-tac-toe fits on a napkin as a state diagram. Drawing it before
> coding makes the implementation obvious, and this is the last project where that is
> true, so it is worth practising while it is easy.

**Ask yourself:**
* If I wanted to add a two-player-over-network mode later, what would have to change?
* Is any rule currently living in more than one place?

## 7. Win detection and game phases

Ending the game correctly.

**Focus:** What phases does the game have, and how does behaviour branch on them? Why
should win detection be testable outside the engine?

**Learn:** No new engine concepts here. This section is the Lua from section 2 meeting
the architecture from section 3.

**Practice:** Port `check_winner` into `game_state.lua`. Add `playing`, `won`, and `draw`
phases. On a win, position and rotate a win-line sprite over the winning line. Ignore
further `place` actions until `restart` fires, and make restart clear everything.

**Self-check:** you can detect wins and draws, branch on phase, and reset cleanly.

> [!question]- Answer
> **Keep the logic pure.** `check_winner` takes a grid and returns a result. It touches no
> engine API, which means you can run it from a terminal and test all eight winning lines
> in seconds rather than by clicking.
> **Phases.** `playing`, `won`, `draw`. Define them once as constants in one place and
> branch the controller on the current phase. Phases scattered as booleans is how you get
> a state that is both won and playing.
> **Disabling input.** When the game ends, drop `place` actions until `restart`. Without
> this the player keeps marking cells after the win line appears, which looks like a bug
> even though nothing crashed.
> **The win line.** A single game object with a sprite, positioned and rotated over the
> winning row, column, or diagonal with `go.set_position` and `go.set_rotation`. Eight
> possible lines means eight position and rotation pairs, which is small enough to table.
> **Resetting.** Clear the grid to nils, reset every cell sprite to empty, hide the win
> line, set the current player back to X, and return to `playing`. Forgetting any one of
> these produces a second game that behaves strangely.

**Ask yourself:**
* Could I test every win condition without launching the game? Why not?
* What state persists across a restart that should not?

## 8. GUI: score, menu, restart

Interface that lives above the game world.

**Focus:** How does Defold's GUI system differ from game objects? How do the world and
the GUI talk to each other?

**Learn:**
* [Defold: GUI](https://defold.com/manuals/gui/): nodes, the node tree, and gui scripts.
* [Defold: GUI script](https://defold.com/manuals/gui-script/): the scripting API.

**Practice:** Build a scoreboard showing wins for X and O, plus a restart button. Have the
controller post a `score_changed` message to the GUI when a game ends, and have the GUI
post back when restart is pressed.

**Self-check:** you can build a GUI, update it by message, and explain how nodes are
positioned.

> [!question]- Answer
> **The two files.** A `.gui` file is the node tree, analogous to a collection but for
> interface. A `.gui_script` is the script attached to it. Together they form a
> self-contained component you add to a game object.
> **Nodes.** Box, text, template, pie, and particle. This game needs box and text.
> **Pivots and anchors.** A node pivots from a reference point on itself and anchors to a
> parent or a screen edge. This is how a scoreboard stays in the corner when the window
> resizes, and it behaves close enough to CSS positioning that the intuition transfers.
> **Talking across the boundary.** The same `msg.post` as everywhere else. The controller
> posts `score_changed` to the GUI script, which updates its text node. The GUI is not
> special; it is another component with another address.
> **Why keep them separate.** The GUI renders above the world through a different render
> pass, so it does not participate in world-space positioning. Trying to place interface
> as game objects in the scene works until the window changes size.

**Ask yourself:**
* Should score live in the GUI script or in the game state module, and why?
* What happens to my layout at a window size I did not test?

## 9. Polish: animation, sound, and an opponent

The parts that make it feel like a game.

**Focus:** How do you tween a property? How does minimax work, and why is a perfect
opponent a design problem?

**Learn:**
* [Defold: property animation](https://defold.com/manuals/property-animation/): `go.animate` and easing functions.
* [Defold: sound](https://defold.com/manuals/sound/): sound components and playback.
* [Minimax with alpha-beta pruning](https://en.wikipedia.org/wiki/Minimax): the algorithm and the standard optimisation.

**Practice:** Animate a mark scaling from 0 to 1 over 0.2 seconds with an out-back easing.
Add a sound on mark and on win. Write `ai.lua` implementing minimax, call it on the
opponent's turn with a small delay, and add a difficulty knob.

**Self-check:** you can animate a property, play a sound, and explain minimax and why you
would deliberately weaken it.

> [!question]- Answer
> **`go.animate`.** Tweens a property over a duration with an easing function. Scaling a
> mark from 0 to 1 with `go.EASING_OUTBACK` over 0.2 seconds is what turns placing a
> piece from a state change into something that feels like an action.
> **Sound.** A `.sound` component holds one clip, triggered with `sound.play("#snd_mark")`.
> **Minimax.** Recursively score every reachable position by assuming both players play
> optimally: maximise on your turn, minimise on theirs, and back the value up the tree.
> Tic-tac-toe has at most 9 factorial leaves, far fewer with alpha-beta pruning, so brute
> force runs instantly.
> **Why weaken it.** Perfect minimax cannot be beaten. The best a human can achieve is a
> draw, every time, which stops being a game very quickly. A difficulty knob that plays
> randomly with probability `1 - difficulty` and optimally otherwise gives you the whole
> range from beatable to impossible with one number.
> **The delay.** An instant AI move reads as the board changing by itself. A small delay
> before the move makes it read as an opponent thinking, which costs nothing and changes
> the feel entirely.
> **Where it lives.** `main/ai.lua`, called by the controller. Like `check_winner`, it is
> pure logic and should be testable without the engine.

**Ask yourself:**
* Which of these polish items changed the feel most per minute spent?
* Could I test the AI without playing against it?

## 10. Bundling and what changes in 3D

Shipping it, and what transfers to the next project.

**Focus:** How do you produce something other people can run? If you rebuilt this in 3D,
what would actually change?

**Learn:**
* [Defold: bundling](https://defold.com/manuals/bundling/): per-platform build output.
* [Defold: 3D graphics](https://defold.com/manuals/3dgraphics/): what differs when you leave 2D.

**Practice:** Bundle for desktop and for HTML5. Run both. Then write down, without
opening the editor, which files you would change to rebuild this game in 3D and which you
would not touch at all.

**Self-check:** you can ship a build, and you can identify which parts of your code are
presentation and which are game logic.

> [!question]- Answer
> **Bundling.** Project, then Bundle, then pick a platform. You get a self-contained
> executable for desktop, a folder of HTML, JavaScript, and WASM for web, or a signable
> bundle for mobile.
> **HTML5 caveats.** The render target needs sizing to the canvas, download size makes
> asset compression matter, and there is no console, so debugging moves to the browser
> developer tools.
> **What changes for 3D.** The camera gains perspective and a third axis. Sprites become
> models with meshes and materials. Lighting becomes something you have to think about.
> Picking a cell becomes a ray cast rather than arithmetic on a click position.
> **What does not change.** `game_state.lua`, `check_winner`, `ai.lua`, turn management,
> and the entire messaging architecture. The game logic is untouched; only the
> presentation layer differs.
> **Why that matters.** That split is the actual lesson of this project. If your win
> detection had ended up inside a sprite script, the 3D rebuild would be a rewrite instead
> of a reskin. Being able to point at which files are which is the transferable skill.

**Ask yourself:**
* Which of my files would I have to rewrite for 3D, and is that the number I expected?
* What did I put in the wrong layer, and when did I notice?

## Capstone

Ship the 2D game: bundled for web, playable by someone who is not you, with an opponent
and a scoreboard. Put it somewhere with a link.

Then start the 3D version as a separate project and copy `game_state.lua`, `ai.lua`, and
nothing else. What you have to rewrite is your report card on section 10.

## Self-assessment checklist

- [ ] I can run a project and explain what hot reload does and does not cover.
- [ ] I can write Lua without the JavaScript traps producing silent bugs.
- [ ] I can explain collections, game objects, components, scripts, and message passing.
- [ ] I can configure a project, build an atlas, and bind named input actions.
- [ ] I can render a grid and map a click to the right cell.
- [ ] I can hold game state in a module and drive visuals by message.
- [ ] I can detect wins and draws with logic testable outside the engine.
- [ ] I can build a GUI and update it from the game world.
- [ ] I can animate, play sound, and explain minimax and its difficulty knob.
- [ ] I can bundle for desktop and web, and name which files are logic and which are presentation.

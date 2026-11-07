export type DocParam = { name: string; type: string; def?: string; desc: string };

export type DocController = {
  name: string;
  desc: string;
  methods: { name: string; desc: string }[];
};

export type DocEnum = {
  name: string;
  desc: string;
  values: { name: string; desc: string }[];
};

export type DocParamGroup = {
  name: string;
  desc: string;
  params: DocParam[];
};

export type AssetDoc = {
  summary: string;
  useCases: string[];
  /** The working call the get-code button copies. */
  getCode: string;
  params: DocParam[];
  paramGroups?: DocParamGroup[];
  enums?: DocEnum[];
  controller?: DocController;
  example: string;
  notes?: string[];
};

const BACKGROUND: DocParam = { name: "background", type: "Color?", def: "null", desc: "Fill behind the effect. Null keeps it transparent." };
const SPEED: DocParam = { name: "speed", type: "double", def: "1.0", desc: "Animation speed multiplier. 1.0 is the default speed." };
const PAUSED: DocParam = { name: "paused", type: "bool", def: "false", desc: "Freezes the animation when true." };
const DRAG: DocParam = { name: "dragSensitivity", type: "double", def: "1.0", desc: "How strongly a drag turns it." };
const CONTROLLER: DocParam = { name: "controller", type: "EffectController?", def: "null", desc: "Pause, resume or reset the effect from code." };
const SEMANTIC: DocParam = { name: "semanticLabel", type: "String?", def: "null", desc: "Description for screen readers. Null marks the effect as decorative." };
const interactive = (desc: string): DocParam => ({ name: "interactive", type: "bool", def: "true", desc });
const quality = (def: string, desc: string): DocParam => ({ name: "quality", type: "EffectQuality", def, desc });

const QUALITY_ENUM: DocEnum = {
  name: "EffectQuality",
  desc: "How much detail an effect draws. Lower settings draw less per frame, which keeps animations smooth on weaker phones.",
  values: [
    { name: "low", desc: "Fewest elements. Use on low-end devices." },
    { name: "medium", desc: "A balance of detail and speed." },
    { name: "high", desc: "Full detail." },
  ],
};

const MOOD: DocParam = { name: "mood", type: "CharacterMood", def: "neutral", desc: "How it feels, shown through its eyes. Changes ease in over a moment." };
const LOOK_AT: DocParam = { name: "lookAt", type: "Offset?", def: "null", desc: "A point on the screen for it to look at, in global coordinates (what a widget's localToGlobal gives). Null means no point. It wins over the pointer, and it works even when interactive is false." };
const LOOK_AT_KEY: DocParam = { name: "lookAtKey", type: "GlobalKey?", def: "null", desc: "A widget for it to look at: it follows that widget's centre even as it moves or scrolls. Null means none. It wins over lookAt and the pointer, and it works even when interactive is false." };
const FOLLOW: DocParam = { name: "follow", type: "PointerFollow", def: "screen", desc: "Whether it looks at the pointer, and where the pointer may be. The default follows a touch or the mouse anywhere on the screen. Needs interactive." };

const MOOD_ENUM: DocEnum = {
  name: "CharacterMood",
  desc: "How a character feels, shown through its eyes.",
  values: [
    { name: "neutral", desc: "Eyes open, blinking now and then." },
    { name: "happy", desc: "Eyes squinted or curved, as in a smile." },
    { name: "closed", desc: "Eyes shut and held shut, as when a password is being typed." },
  ],
};

const FOLLOW_ENUM: DocEnum = {
  name: "PointerFollow",
  desc: "What a character looks at when nothing from your code is steering it.",
  values: [
    { name: "off", desc: "It ignores the pointer." },
    { name: "widget", desc: "It looks at the pointer only while the pointer is over the widget." },
    { name: "screen", desc: "It looks at the last touch or mouse position anywhere on the screen." },
  ],
};

const CHARACTER_CONTROLLER: DocController = {
  name: "CharacterController",
  desc: "Everything EffectController does, plus one-off actions. Create one, pass it as controller, and dispose it when you are done. Use a plain property, such as mood, for something that stays true for a while, and these actions for something that just happened.",
  methods: [
    { name: "pause()", desc: "Freezes the animation." },
    { name: "resume()", desc: "Continues the animation after pause()." },
    { name: "reset()", desc: "Returns the character to its starting state and plays the animation from the start, including any intro or entrance." },
    { name: "blink()", desc: "Makes the character blink once, whatever its own blink setting." },
    { name: "shake()", desc: "Shakes its head, as for a no. For example, a wrong password." },
    { name: "nod()", desc: "Nods its head, as for a yes. For example, an accepted code." },
    { name: "bounce()", desc: "Makes it hop, as for a success." },
  ],
};

const EFFECT_CONTROLLER: DocController = {
  name: "EffectController",
  desc: "Create one, pass it as controller, and dispose it when you are done. It also has isPaused (whether the effect is paused) and resetCount (how many times reset was called).",
  methods: [
    { name: "pause()", desc: "Freezes the animation." },
    { name: "resume()", desc: "Continues the animation after pause()." },
    { name: "reset()", desc: "Returns the effect to its starting state." },
  ],
};

/** One entry per asset, keyed by its slug (the id in ASSETS). Robots read this too. */
export const DOCS: Record<string, AssetDoc> = {
  urchin: {
    summary:
      "A glass-bright sea urchin: a sphere whose radius is a set of standing waves, so it grows spikes, ridges and rings that slowly morph. Touch it and it leans toward your finger.",
    useCases: [
      "A striking centrepiece for a landing or splash screen",
      "A playful brand mark or mascot-like visual",
      "A living decoration for onboarding, empty states or music and creative apps",
    ],
    getCode: `Urchin(
  colors: [
    Color(0xFF3400FF),
    Color(0xFF00CFFF),
    Color(0xFFFF00EF),
    Color(0xFFAC0093),
  ],
)`,
    params: [
      { name: "colors", type: "List<Color>?", def: "original palette", desc: "Palette from the base of the spikes to their tips. Four colours are used as they are: base, middle, tips and rim. Three or fewer map to base, middle and tips, and the rim is made from the tips colour. More than four are blended down to four. Null uses the colours of the original design." },
      BACKGROUND,
      SPEED,
      { name: "spin", type: "double", def: "1.0", desc: "How fast it turns on its own. 1.0 matches the original, 0 stops it." },
      { name: "scale", type: "double", def: "1.0", desc: "Size of the urchin inside its box, from 0.2 to 1.1. At 1.0 the spikes nearly touch the edge of the box." },
      { name: "maxDiameter", type: "double", def: "300.0", desc: "The largest size, in logical pixels, the urchin is ever drawn at. In a bigger box it stays this size and sits in the centre. A lower value uses less battery; raising it makes every frame more expensive." },
      { name: "lobes", type: "int", def: "8", desc: "Number of lobes around the vertical axis, 0 to 8." },
      { name: "petals", type: "int", def: "8", desc: "Number of petals around the vertical axis, 0 to 8." },
      { name: "rings", type: "int", def: "8", desc: "Number of rings from pole to pole, 0 to 8." },
      { name: "bands", type: "int", def: "8", desc: "Number of bands from pole to pole, 0 to 8." },
      { name: "sharpness", type: "double", def: "20.0", desc: "How sharp the spikes are, 1 to 20. Higher is thinner." },
      { name: "amplitude", type: "double", def: "1.0", desc: "How tall the spikes are, 1 to 20." },
      { name: "morph", type: "double", def: "20.0", desc: "How much the shape drifts over time, 0 to 20." },
      { name: "tilt", type: "double", def: "0.0", desc: "Constant tilt toward the viewer, 0 to 20." },
      { name: "shine", type: "double", def: "20.0", desc: "Tightness of the highlight, 1 to 20. Higher is smaller and brighter." },
      { name: "glow", type: "double", def: "20.0", desc: "Strength of the glow at the edges, 0 to 20." },
      { name: "lean", type: "double", def: "20.0", desc: "How far it leans toward your finger, 0 to 20." },
      { name: "followPointer", type: "bool", def: "true", desc: "Whether it leans toward your finger while you touch it." },
      PAUSED,
      interactive("Whether touch affects the urchin."),
      quality("high", "Level of detail. Lower settings take fewer steps per pixel (44 on low, 64 on medium, 96 on high), which keeps the frame rate up on weaker phones."),
      CONTROLLER,
      SEMANTIC,
    ],
    enums: [QUALITY_ENUM],
    controller: EFFECT_CONTROLLER,
    example: `import 'package:flutter/material.dart';
import 'package:cocoverse_ui/cocoverse_ui.dart';

class Demo extends StatelessWidget {
  const Demo({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: SizedBox(
        width: 320,
        height: 320,
        child: Urchin(
          amplitude: 6,
          sharpness: 12,
          lean: 14,
        ),
      ),
    );
  }
}`,
    notes: [
      "It fills the space its parent gives it, but never draws larger than maxDiameter. The area around it is transparent.",
      "Dragging does not spin it. It leans toward your finger and turns slowly on its own.",
      "Its colours are shown deeper and more saturated than their plain values, to match the web original.",
      "Set the size with a SizedBox and the position with padding or Align. The parent must give bounded constraints.",
    ],
  },

  "shard-sphere": {
    summary:
      "A sphere of small prism-shaped shards that grow and shrink like a living crystal. Shards near your finger or mouse grow and light up, and dragging spins the sphere.",
    useCases: [
      "A tactile hero visual that reacts to the mouse or finger",
      "A showcase piece for tech, crypto or product pages",
      "A game menu or onboarding centrepiece",
    ],
    getCode: `ShardSphere(
  colors: [
    Color(0xFF1B1F3B),
    Color(0xFF4C6EF5),
    Color(0xFFFFD43B),
  ],
)`,
    params: [
      { name: "colors", type: "List<Color>?", def: "app theme", desc: "Three colours: the shadow side, the lit side, and the highlight near a finger. Null takes them from the app's theme." },
      BACKGROUND,
      { name: "density", type: "int", def: "3", desc: "Detail, from 1 to 5. Density 3 gives 180 shards and 5 gives 500." },
      { name: "shardSize", type: "double", def: "1.0", desc: "Size of the shards, from 0.1 to 2.0." },
      { name: "extrusion", type: "double", def: "1.0", desc: "How tall the shards are, from 0 to 2. 0 is flat." },
      { name: "distance", type: "double", def: "4.0", desc: "Camera distance. Larger makes the sphere look smaller. It never goes below a safe minimum, so the camera stays outside the shards." },
      { name: "lift", type: "double", def: "0.4", desc: "How much shards grow near a finger or mouse, from 0 to 3. 0 turns it off." },
      { name: "split", type: "double", def: "1.0", desc: "How far shards slide away from a finger or mouse, from 0 to 3. 0 turns it off." },
      { name: "reach", type: "double", def: "1.0", desc: "How far the finger's influence reaches, from 0.05 to 2.0." },
      SPEED,
      { name: "spin", type: "double", def: "1.0", desc: "How fast the sphere turns on its own. 0 stops the turning." },
      PAUSED,
      interactive("Whether touch, hover and drag affect the sphere."),
      DRAG,
      quality("high", "Level of detail. Low limits density to 2, medium to 3, and high allows up to 5."),
      CONTROLLER,
      SEMANTIC,
    ],
    enums: [QUALITY_ENUM],
    controller: EFFECT_CONTROLLER,
    example: `import 'package:flutter/material.dart';
import 'package:cocoverse_ui/cocoverse_ui.dart';

class Demo extends StatelessWidget {
  const Demo({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: SizedBox(
        width: 320,
        height: 320,
        child: ShardSphere(
          density: 4,
          lift: 0.8,
          split: 1.5,
        ),
      ),
    );
  }
}`,
    notes: [
      "It fills the space its parent gives it. Set the size with a SizedBox and the position with padding or Align.",
      "Shards slide back when the finger or mouse leaves.",
      "On weaker phones leave quality on medium or low, since high can draw up to 500 shards.",
    ],
  },

  pisces: {
    summary:
      "A goldfish that swims around on its own and follows a finger or cursor. It comes as two fish, swims, rests and wanders off by itself, or crosses the screen on demand. Tapping the fish catches it.",
    useCases: [
      "An ambient aquarium behind your content",
      "A loading indicator: keep it crossing while a task runs, then let it go",
      "A small game: catch the fish and react in onCaught",
      "A playful empty state or a visit that appears on a schedule",
    ],
    getCode: `Pisces(
  variant: PiscesVariant.redCap,
)`,
    params: [
      { name: "variant", type: "PiscesVariant", def: "oranda", desc: "Which fish swims: an orange oranda with a deeper orange hood, or a pale pearl oranda with a red cap." },
      { name: "mode", type: "PiscesMode", def: "idle", desc: "How the fish comes and goes. In idle it is an aquarium. In visit there is no fish until something sends one." },
      { name: "active", type: "bool", def: "false", desc: "In visit mode: while true, the fish keeps crossing, a new visit revisitDelay after each exit. Set it to false when the task is done." },
      { name: "every", type: "Duration?", def: "null", desc: "In visit mode: send a visit this often. Null for none." },
      { name: "enterFrom", type: "PiscesSide?", def: "null", desc: "The side a visit comes in from. Null picks one at random." },
      { name: "exitTo", type: "PiscesSide?", def: "null", desc: "The side a visit leaves by. Null is the side opposite the entry." },
      { name: "tapAction", type: "PiscesTap", def: "croak", desc: "What a tap on the fish does." },
      { name: "respawnDelay", type: "Duration", def: "8 seconds", desc: "In idle mode: how long after being caught the fish swims back in." },
      { name: "revisitDelay", type: "Duration", def: "3 seconds", desc: "In visit mode: the wait between visits, and after a catch." },
      { name: "restAfter", type: "Duration", def: "40 seconds", desc: "In idle mode: how long left alone before it goes to rest at the bottom. Zero means it never rests." },
      { name: "wanderOff", type: "bool", def: "true", desc: "In idle mode: whether it now and then swims off the screen and comes back." },
      { name: "onCaught", type: "VoidCallback?", def: "null", desc: "Called when the fish is caught by a tap or by the controller's kill()." },
      { name: "onVisitEnd", type: "VoidCallback?", def: "null", desc: "Called when a visit ends: the fish has left the screen." },
      { name: "size", type: "double", def: "1.0", desc: "Size of the fish." },
      { name: "bodyDepth", type: "double", def: "1.1", desc: "How deep and round the body is, from 0.6 to 1.6. 1.0 is slim, 1.1 plump." },
      { name: "bubbles", type: "bool", def: "true", desc: "Whether it lets out a few bubbles from its mouth now and then." },
      { name: "tailLength", type: "double", def: "1.0", desc: "How long the tail is, from 0.4 to 1.8." },
      { name: "finSway", type: "double", def: "1.7", desc: "How much the fins ripple and sway, from 0 to 3. 0 holds them still." },
      { name: "swimSpeed", type: "double", def: "1.0", desc: "How fast it cruises when left alone, from 0 to 4. 0 hangs it where it is." },
      { name: "roam", type: "double", def: "0.8", desc: "How much of its space it wanders over, from 0 to 1." },
      { name: "follow", type: "bool", def: "true", desc: "Whether it swims toward a finger or cursor over it." },
      { name: "eagerness", type: "double", def: "1.0", desc: "How keenly it chases a finger or cursor, from 0 to 4." },
      BACKGROUND,
      SPEED,
      PAUSED,
      interactive("Whether touch and hover affect the fish."),
      quality("medium", "Level of detail. Lower settings march fewer steps per pixel and build the fins from fewer segments."),
            { name: "controller", type: "PiscesController?", def: "null", desc: "Pause, reset, send the fish across, catch it or send it to rest from code." },
      SEMANTIC,
    ],
    enums: [
      {
        name: "PiscesVariant",
        desc: "Which fish swims.",
        values: [
          { name: "oranda", desc: "An orange oranda with a deeper orange hood." },
          { name: "redCap", desc: "A pale pearl oranda with a red cap." },
        ],
      },
      {
        name: "PiscesMode",
        desc: "How the fish comes and goes.",
        values: [
          { name: "idle", desc: "An aquarium: the fish swims around, rests and wanders off by itself." },
          { name: "visit", desc: "There is no fish until something sends one (active, every or the controller's swim()): it crosses and leaves." },
        ],
      },
      {
        name: "PiscesTap",
        desc: "What a tap on the fish does.",
        values: [
          { name: "croak", desc: "The fish croaks, turns belly up, floats up and fades out." },
          { name: "none", desc: "Taps do nothing." },
        ],
      },
      {
        name: "PiscesSide",
        desc: "A side of the space the fish swims in, used by enterFrom and exitTo.",
        values: [
          { name: "top", desc: "The top edge." },
          { name: "bottom", desc: "The bottom edge." },
          { name: "left", desc: "The left edge." },
          { name: "right", desc: "The right edge." },
        ],
      },
      QUALITY_ENUM,
    ],
    controller: {
      name: "PiscesController",
      desc: "It does everything EffectController does (pause(), resume(), reset() and isPaused), plus the actions below. Create one, pass it as controller, and dispose it when you are done.",
      methods: [
        { name: "swim({from, to})", desc: "Sends the fish across the space, in at from and out at to. Both are optional PiscesSide values: null picks a random entry side and the opposite exit. In visit mode it makes a visit. In idle mode only to is used: the fish swims off that side and comes back later." },
                { name: "kill()", desc: "Catches the fish, the same as a tap: it croaks, floats up and fades out. onCaught is called." },
        { name: "rest()", desc: "Sends an idle fish down to rest at the bottom. It does nothing in visit mode." },
      ],
    },
    example: `import 'package:flutter/material.dart';
import 'package:cocoverse_ui/cocoverse_ui.dart';

// A loader: the fish keeps crossing while loading is true.
class Loader extends StatelessWidget {
  const Loader({super.key, required this.loading});

  final bool loading;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 320,
      height: 240,
      child: Pisces(
        mode: PiscesMode.visit,
        active: loading,
        enterFrom: PiscesSide.left,
        exitTo: PiscesSide.right,
        variant: PiscesVariant.redCap,
      ),
    );
  }
}`,
    notes: [
      "It fills the space its parent gives it and swims within that space. Set the size with a SizedBox and the position with padding or Align.",
      "Tapping the fish catches it. Taps on the fish still reach the widgets beneath it.",
      "The fins appear a moment after the fish does, while their textures are made.",
      "While a visit is crossing, the fish ignores fingers until it has gone.",
    ],
  },

  "starfield-sphere": {
    summary:
      "A clear glass sphere with small stars drifting inside it. Drag to spin it. It draws a circle centred in its space, with the area behind it showing through.",
    useCases: [
      "A glass orb for a space, astronomy or night-sky theme",
      "An onboarding or splash centrepiece",
      "A calm loading visual, or a planet-like icon",
    ],
    getCode: `StarfieldSphere(
  colors: [
    Color(0xFF0B1026),
    Color(0xFF3A2D8F),
    Color(0xFF7B5CFF),
    Color(0xFF34D1BF),
  ],
)`,
    params: [
      { name: "colors", type: "List<Color>?", def: "app theme", desc: "Palette for the glass and mist. Any number of colours works. Null takes them from the app's theme." },
      BACKGROUND,
      SPEED,
      { name: "spin", type: "double", def: "1.0", desc: "How fast the sphere turns on its own. 0 stops the turning." },
      PAUSED,
      interactive("Whether dragging spins the sphere."),
      DRAG,
      quality("high", "Level of detail. Low draws one shell of stars, medium two, high three."),
      CONTROLLER,
      SEMANTIC,
    ],
    enums: [QUALITY_ENUM],
    controller: EFFECT_CONTROLLER,
    example: `import 'package:flutter/material.dart';
import 'package:cocoverse_ui/cocoverse_ui.dart';

class Demo extends StatelessWidget {
  const Demo({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: SizedBox(
        width: 320,
        height: 320,
        child: StarfieldSphere(
          spin: 1.5,
        ),
      ),
    );
  }
}`,
    notes: [
      "It fills the space its parent gives it and draws a circle in the middle. Pixels outside the circle stay transparent.",
      "Set the size with a SizedBox and the position with padding or Align. The parent must give bounded constraints.",
    ],
  },


    "link-chain": {
    summary:
      "A chain of interlocked links hanging between two points on real rope physics. Tilt or shake the phone and it follows, grab a link and swing it, and when it first appears it is lowered into place.",
    useCases: [
      "A hanging decoration across the top of a screen or card",
      "A tilt-and-shake toy that rewards touching and moving the phone",
      "A divider, header ornament or entrance flourish with real weight to it",
      "Brand visuals for jewellery or hardware, in the metallic finish",
    ],
    getCode: `SizedBox(
  height: 120,
  child: LinkChain(
    finish: LinkChainFinish.metallic,
    slack: 0.12,
  ),
)`,
    params: [
      { name: "finish", type: "LinkChainFinish", def: "cartoon", desc: "How the chain is painted: flat colour bands with an ink outline, or polished metal." },
      { name: "colors", type: "List<Color>?", def: "candy colours", desc: "Colours the links take, in order, for the cartoon finish. Any number from 1 to 16 works and they form a ring. Null uses the candy colours of the original." },
      { name: "metalColor", type: "Color", def: "0xFFC7CAD1", desc: "Colour of the metal for the metallic finish. Steel by default; gold or copper work well too." },
      BACKGROUND,
      { name: "start", type: "Alignment", def: "topLeft", desc: "Where the first end is fixed, inside the widget's box." },
      { name: "end", type: "Alignment", def: "topRight", desc: "Where the second end is fixed, inside the widget's box." },
      { name: "span", type: "double", def: "1.0", desc: "How much of the distance between start and end the chain covers, from 0.1 to 1.0. Less than 1 shortens it toward the middle." },
      { name: "slack", type: "double", def: "0.10", desc: "How saggy it hangs, from 0.02 (nearly tight) to 1.5 (a deep loop). It is the extra chain length as a share of the distance it spans." },
      { name: "density", type: "int", def: "22", desc: "Number of links, from 12 to 40. The links grow or shrink to fill the span." },
      { name: "linkLength", type: "double", def: "58.0", desc: "How long each link is, from 0 to 100. 58 matches the original." },
      { name: "linkThickness", type: "double", def: "36.0", desc: "How thick the metal of each link is, from 0 to 100. 36 matches the original." },
      { name: "outline", type: "double", def: "0.3", desc: "Thickness of the ink line in the cartoon finish, from 0 to 1." },
      { name: "sway", type: "double", def: "100.0", desc: "How far the two ends wander, from 0 to 200 percent. 0 hangs dead still." },
      { name: "speed", type: "double", def: "1.0", desc: "How fast the ends wander. 1.0 matches the original, 0 stops them." },
      { name: "drift", type: "double", def: "1.0", desc: "How fast the colours slide along the chain in the cartoon finish. 0 holds them still." },
      { name: "drag", type: "double", def: "60.0", desc: "How hard a grabbed link is pulled toward your finger, from 0 to 100. 0 turns grabbing off." },
      { name: "entrance", type: "bool", def: "true", desc: "Whether the chain is lowered into place when it first appears. It plays once, and again when the controller is reset." },
      { name: "entranceDuration", type: "Duration", def: "1100 milliseconds", desc: "How long the entrance takes." },
      { name: "reactToMotion", type: "bool", def: "true", desc: "Whether the chain follows the phone when it is tilted or shaken. Where there is no motion sensor, the chain just hangs down." },
      { name: "motionQuarterTurns", type: "int", def: "0", desc: "Quarter turns of the screen away from upright, for apps that rotate. One is a quarter turn anticlockwise." },
      { name: "pinned", type: "bool", def: "true", desc: "Whether the two ends are fixed. Set it to false and the chain lets go and falls." },
      PAUSED,
      interactive("Whether touch affects the chain."),
      quality("high", "Level of detail. Lower settings take fewer steps per pixel (48 on low, 72 on medium, 96 on high), and the metallic finish drops its occlusion and its reflection of the chain itself."),
      CONTROLLER,
      SEMANTIC,
    ],
    enums: [
      {
        name: "LinkChainFinish",
        desc: "How a LinkChain is painted.",
        values: [
          { name: "cartoon", desc: "Flat colour bands with an ink outline, like a drawing." },
          { name: "metallic", desc: "Polished metal that reflects a studio, and darkens where links meet." },
        ],
      },
      QUALITY_ENUM,
    ],
    controller: {
      name: "EffectController",
      desc: "Create one, pass it as controller, and dispose it when you are done.",
      methods: [
        { name: "pause()", desc: "Freezes the animation." },
        { name: "resume()", desc: "Continues the animation after pause()." },
        { name: "reset()", desc: "Builds the chain again and, when entrance is on, lowers it into place again." },
      ],
    },
    example: `import 'package:flutter/material.dart';
import 'package:cocoverse_ui/cocoverse_ui.dart';

class Demo extends StatelessWidget {
  const Demo({super.key});

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      height: 160,
      child: LinkChain(
        finish: LinkChainFinish.metallic,
        metalColor: Color(0xFFE8B64A),
        slack: 0.18,
      ),
    );
  }
}`,
    notes: [
      "It hangs from the edges of the space it is given: you set how long it is by sizing the widget, and how far it sags with slack. Give it a width as well as a height.",
      "Gravity always pulls down, like a real chain. With reactToMotion it follows the phone when it is tilted or shaken, using the accelerometer.",
      "Grab a link and swing it. The two ends are fixed, so only the links between them can be grabbed. Letting go throws the link at the speed it was moving.",
      "Set pinned to false and the chain falls. Setting it back to true lowers it into place again.",
      "The links stay interlocked: the chain cannot stretch past the point where links would come apart, or bend so sharply that they would unlink.",
    ],
  },

  "jelly-sphere": {
    summary:
      "A glossy sphere with a folded, flowing surface and a glowing core. Press it and it squashes like jelly, then wobbles back. Touch or hover and the core blooms under your finger. Drag to spin it.",
    useCases: [
      "A tactile hero piece that people want to poke",
      "An assistant or voice orb for an AI or music app",
      "A playful loading or empty-state visual",
    ],
    getCode: `JellySphere(
  colors: [
    Color(0xFF1A0B3B),
    Color(0xFF5B3FE0),
    Color(0xFFFF7A59),
    Color(0xFF34D1BF),
  ],
)`,
    params: [
      { name: "colors", type: "List<Color>?", def: "app theme", desc: "Four colours: the deep shadows, the main body, the glowing core, and the bright veins. Any number works and they are spread across the four roles. Null takes them from the app's theme." },
      BACKGROUND,
      { name: "size", type: "double", def: "0.8", desc: "Diameter of the sphere as a fraction of the shorter side, from 0.1 to 1.5." },
      { name: "turbulence", type: "double", def: "1.0", desc: "How strongly the surface folds and flows, from 0 to 3." },
      { name: "specks", type: "double", def: "0.2", desc: "How many small white specks cover the surface, from 0 to 1." },
      { name: "squish", type: "double", def: "1.0", desc: "How strongly a press squashes the sphere, from 0 to 3. 0 turns it off." },
      SPEED,
      PAUSED,
      interactive("Whether touch, hover, press and drag affect the sphere."),
      DRAG,
      quality("high", "Level of detail. Low is the cheapest, and high adds the relief shading of the folds."),
      CONTROLLER,
      SEMANTIC,
    ],
    enums: [QUALITY_ENUM],
    controller: EFFECT_CONTROLLER,
    example: `import 'package:flutter/material.dart';
import 'package:cocoverse_ui/cocoverse_ui.dart';

class Demo extends StatelessWidget {
  const Demo({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: SizedBox(
        width: 320,
        height: 320,
        child: JellySphere(
          squish: 1.5,
          turbulence: 1.4,
        ),
      ),
    );
  }
}`,
    notes: [
      "It fills the space its parent gives it and draws the sphere in the middle. Set the size with a SizedBox and the position with padding or Align.",
      "After you spin it with a drag, it eases back to rest when you let go.",
      "The sphere itself is sized by size, as a fraction of the shorter side of its space.",
    ],
  },

  "glossy-sphere": {
    summary:
      "A glossy sphere with flowing bands of colour, a bright glow at the rim and a soft highlight. Drag to spin it. It draws a circle centred in its space.",
    useCases: [
      "A clean, colourful orb for a hero or splash screen",
      "A calm centrepiece for onboarding or empty states",
      "A planet-like icon or decoration",
    ],
    getCode: `GlossySphere(
  colors: [
    Color(0xFFFF7A59),
    Color(0xFF7B5CFF),
    Color(0xFF34D1BF),
    Color(0xFFE8B64A),
  ],
)`,
    params: [
      { name: "colors", type: "List<Color>?", def: "app theme", desc: "Palette for the sphere. Any number of colours works. The first colour is the glow at the rim, and the other three blend through the flowing bands. Null takes them from the app's theme." },
      BACKGROUND,
      SPEED,
      { name: "spin", type: "double", def: "1.0", desc: "How fast the sphere turns on its own. 0 stops the turning." },
      PAUSED,
      interactive("Whether dragging spins the sphere."),
      DRAG,
      quality("high", "Level of detail. Lower settings are faster on weak phones."),
      CONTROLLER,
      SEMANTIC,
    ],
    enums: [QUALITY_ENUM],
    controller: EFFECT_CONTROLLER,
    example: `import 'package:flutter/material.dart';
import 'package:cocoverse_ui/cocoverse_ui.dart';

class Demo extends StatelessWidget {
  const Demo({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: SizedBox(
        width: 320,
        height: 320,
        child: GlossySphere(
          spin: 1.5,
        ),
      ),
    );
  }
}`,
    notes: [
      "It fills the space its parent gives it and draws a circle in the middle, with a soft one-pixel edge. Pixels outside the circle stay transparent.",
      "The light stays fixed while the surface turns, so the highlight does not move as it spins.",
    ],
  },


    "glass-ring": {
    summary:
      "A turning ring of clear glass that bends whatever is behind it. Give it text and the text shows through the ring, stretched and split into colour fringes at the edges. Touch and hold to tilt the ring toward your finger, and drag to spin it.",
    useCases: [
      "A premium hero: a brand word seen through a glass ring",
      "A logo or title reveal on a dark or white page",
      "A calm, glossy centrepiece for a splash or onboarding screen",
    ],
    getCode: `GlassRing(
  backdropText: 'GLASS',
  chromatic: 0.4,
  frost: 0.3,
)`,
    params: [
      { name: "tint", type: "Color", def: "0xFFFFFFFF", desc: "Colour of the glass. White is clear glass." },
      { name: "chromatic", type: "double", def: "0.25", desc: "How far the colours split at the edges, from 0 (none) to 1 (strong)." },
      { name: "frost", type: "double", def: "0.5", desc: "How frosted the glass looks, from 0 (clear) to 1 (very frosted)." },
      { name: "ringSize", type: "double", def: "0.7", desc: "Diameter of the ring as a fraction of the shorter side, from 0.1 to 1." },
      { name: "thickness", type: "double", def: "0.32", desc: "Thickness of the glass tube, from 0.05 (thin) to 1 (thick)." },
      { name: "backdropText", type: "String?", def: "null", desc: "Text drawn behind the ring so you can see it bend. Null draws nothing." },
      { name: "backdropStyle", type: "TextStyle?", def: "null", desc: "Style of the backdrop text. Null uses large bold white text (dark text on a light surface)." },
      { name: "backdropColor", type: "Color", def: "black", desc: "Fill behind the backdrop text." },
      { name: "brightness", type: "Brightness?", def: "null", desc: "Whether the effect sits on a light or a dark surface. Null works it out from backdropColor (when there is backdrop text) or background. Light switches to a glass look that reads on white." },
      BACKGROUND,
      SPEED,
      { name: "spin", type: "double", def: "1.0", desc: "How fast the ring turns on its own. 0 stops the turning." },
      PAUSED,
      interactive("Whether touch and drag affect the ring."),
      DRAG,
      quality("high", "Level of detail. Low skips the frost blur, medium blurs with 4 samples, high with 8."),
      CONTROLLER,
      SEMANTIC,
    ],
    enums: [QUALITY_ENUM],
    controller: EFFECT_CONTROLLER,
    example: `import 'package:flutter/material.dart';
import 'package:cocoverse_ui/cocoverse_ui.dart';

class Demo extends StatelessWidget {
  const Demo({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: SizedBox(
        width: 360,
        height: 360,
        child: GlassRing(
          backdropText: 'GLASS',
          chromatic: 0.4,
          frost: 0.3,
        ),
      ),
    );
  }
}`,
    notes: [
      "The ring bends only its own backdropText, not the widgets behind it. Without backdropText there is nothing for the glass to bend.",
      "Touch and hold tilts the ring toward your finger, and a drag spins it.",
      "It fills the space its parent gives it, so the parent must give bounded constraints.",
    ],
  },

  "geo-morph": {
    summary:
      "A solid that morphs between a box, a sphere, an octahedron and a torus. With no other settings it cycles through the four shapes on its own, which suits a loading screen. You can also choose the shape yourself, by condition, or from code.",
    useCases: [
      "A loading screen or splash visual that cycles on its own",
      "A shape that reflects state: a time of day, a score, a step of a flow",
      "A hero piece with a colour for each shape",
    ],
    getCode: `GeoMorph(
  shapeColors: {
    GeoShape.box: Colors.orange,
    GeoShape.torus: Colors.cyan,
    GeoShape.sphere: Colors.purple,
  },
)`,
    params: [
      { name: "color", type: "Color", def: "0xFF8700FF", desc: "Colour of the solid. shapeColors can override it for single shapes." },
      { name: "shapeColors", type: "Map<GeoShape, Color>?", def: "null", desc: "A colour for each shape. Shapes that are not listed use color. The colour blends smoothly while one shape morphs into another." },
      { name: "roomTop", type: "Color", def: "0xFF4B00FF", desc: "Colour the solid reflects from above." },
      { name: "roomBottom", type: "Color", def: "0xFF000000", desc: "Colour the solid reflects from below." },
      { name: "rimColor", type: "Color", def: "0xFFFFFFFF", desc: "Colour of the glow around the edges." },
      { name: "rimLight", type: "double", def: "20.0", desc: "Strength of the glow around the edges, from 0 to 20. 0 turns it off." },
      { name: "metalness", type: "double", def: "0.0", desc: "How mirror-like the solid is, from 0 (matte) to 20 (a mirror)." },
      BACKGROUND,
      { name: "speed", type: "double", def: "1.0", desc: "Animation speed multiplier. 1.0 matches the original, 0 stops it." },
      { name: "hold", type: "double", def: "11.0", desc: "How long each shape holds before it morphs, from 0 to 20. Higher holds longer and morphs faster. Only used when it cycles on its own." },
      { name: "size", type: "double", def: "1.0", desc: "Size of the solid, from 0.2 to 1.4. 1.0 matches the original." },
      { name: "orbit", type: "bool", def: "true", desc: "Whether the solid turns on its own. Dragging still works when this is false, as long as interactive is true." },
      { name: "reverseOrbit", type: "bool", def: "false", desc: "Turns the other way when orbit is on." },
      { name: "dragSensitivity", type: "double", def: "1.0", desc: "How strongly a drag turns the solid. 1.0 matches the original." },
      { name: "maxDiameter", type: "double", def: "300.0", desc: "The widest the solid is ever drawn, in logical pixels. In a bigger box it stays this size and sits in the centre. A lower value uses less battery." },
      { name: "shapes", type: "List<GeoShape>?", def: "all four", desc: "The shapes it cycles through on its own, in order." },
      { name: "shape", type: "GeoShape?", def: "null", desc: "Holds this shape instead of cycling. Changing it morphs to the new shape. Null cycles through shapes." },
      { name: "rules", type: "List<GeoMorphRule>?", def: "null", desc: "Conditions that choose the shape. The first rule that returns true wins, and they take priority over shape. When none match, shape is used, or the cycle if that is null." },
      { name: "refresh", type: "Listenable?", def: "null", desc: "When this notifies, rules are checked straight away, not at the next ruleInterval." },
      { name: "ruleInterval", type: "Duration", def: "1 second", desc: "How often rules are checked." },
      { name: "morphDuration", type: "Duration", def: "260 milliseconds", desc: "How long a morph takes when the shape is chosen by shape, rules or the controller, at speed 1.0." },
      { name: "onShapeChanged", type: "ValueChanged<GeoShape>?", def: "null", desc: "Called when the shape on show changes, once the morph is half done." },
      { name: "controller", type: "GeoMorphController?", def: "null", desc: "Optional control from code. It also pauses, resumes and resets." },
      PAUSED,
      interactive("Whether touch and drag affect the solid."),
      quality("high", "Level of detail. Lower settings take fewer steps per pixel (32 on low, 56 on medium, 90 on high)."),
      SEMANTIC,
    ],
    paramGroups: [
      {
        name: "GeoMorphRule",
        desc: "One condition for rules: show a shape while a function returns true. The rules are checked in order and the first one that returns true decides the shape. A rule that throws counts as false.",
        params: [
          { name: "shape", type: "GeoShape", desc: "The shape to show while this rule matches." },
          { name: "when", type: "bool Function()", desc: "The condition. It should be quick, because it is called about once a second." },
        ],
      },
    ],
    enums: [
      {
        name: "GeoShape",
        desc: "The solids GeoMorph can show.",
        values: [
          { name: "box", desc: "A cube." },
          { name: "sphere", desc: "A ball." },
          { name: "octahedron", desc: "Two pyramids joined at their bases." },
          { name: "torus", desc: "A ring, like a doughnut." },
        ],
      },
      QUALITY_ENUM,
    ],
    controller: {
      name: "GeoMorphController",
      desc: "Besides pausing, resuming and resetting, it can pick the shape. Create one, pass it as controller, and dispose it when you are done. It also has shape (the shape on show, null before the first frame) and pinned (the shape picked with show, next or previous, or null).",
      methods: [
        { name: "pause()", desc: "Freezes the animation." },
        { name: "resume()", desc: "Continues the animation after pause()." },
        { name: "reset()", desc: "Returns to the start. It also lets go of any shape picked with show(), next() or previous()." },
        { name: "show(shape)", desc: "Morphs to the shape and holds it until release() is called." },
        { name: "next()", desc: "Morphs to the shape after the current one in the widget's shapes list and holds it until release() is called." },
        { name: "previous()", desc: "Morphs to the shape before the current one in the widget's shapes list and holds it until release() is called." },
        { name: "release()", desc: "Lets go of a shape picked with show(), next() or previous(), so the widget's rules, shape or cycle take over again." },
      ],
    },
    example: `import 'package:flutter/material.dart';
import 'package:cocoverse_ui/cocoverse_ui.dart';

// A different shape for the morning, the afternoon and the evening.
class Demo extends StatelessWidget {
  const Demo({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: 320,
        height: 320,
        child: GeoMorph(
          shapeColors: {
            GeoShape.box: Colors.orange,
            GeoShape.torus: Colors.cyan,
            GeoShape.sphere: Colors.purple,
          },
          rules: [
            GeoMorphRule(shape: GeoShape.box, when: () => DateTime.now().hour < 12),
            GeoMorphRule(shape: GeoShape.torus, when: () => DateTime.now().hour < 17),
            GeoMorphRule(shape: GeoShape.sphere, when: () => true),
          ],
        ),
      ),
    );
  }
}`,
    notes: [
      "Which shape wins: one picked from the controller, then the first matching rule, then shape, and if none of those is set it cycles through shapes on its own.",
      "It fills the space its parent gives it, but is never drawn larger than maxDiameter. The area around it is transparent.",
      "Drag to turn it. Its colours are shown deeper and more saturated than their plain values, to match the web original.",
    ],
  },

  "foil-ring": {
    summary:
      "A twisting ring with a rounded polygon for a cross-section, covered in wavy foil brush strokes. Touch it and the ring spins faster, tips toward your finger and shifts a little, then settles back when you let go.",
    useCases: [
      "A bold, colourful hero ring for a landing page",
      "A loading or splash visual with real texture",
      "A brand piece: change the foil colours, the stroke count and the twist to make it your own",
    ],
    getCode: `FoilRing(
  advanced: const FoilRingAdvanced(rows: 4, glint: 80),
)`,
    params: [
      { name: "colors", type: "List<Color>?", def: "original foil", desc: "Colours of the foil strokes. Seven are used as they are; any other number is blended into seven. Null uses the colours of the original." },
      { name: "baseColor", type: "Color", def: "0xFF00B9A1", desc: "Colour of the ring under the strokes." },
      BACKGROUND,
      { name: "speed", type: "double", def: "1.0", desc: "Animation speed multiplier, from 0 to 10. 1.0 matches the original, 0 stops it." },
      { name: "scale", type: "double", def: "1.0", desc: "Size of the ring inside its box, from 0.2 to 1.6. 1.0 matches the original." },
      { name: "twist", type: "int", def: "4", desc: "How many times the cross-section twists around the ring, whole numbers from -16 to 16. 0 gives no twist." },
      { name: "strokeCount", type: "int", def: "24", desc: "Number of strokes around the ring, 1 to 120." },
      { name: "touchResponse", type: "double", def: "50.0", desc: "How strongly touch speeds up, tips and shifts the ring, from 0 to 100. 50 matches the original and 0 turns the response off." },
      { name: "maxDiameter", type: "double", def: "320.0", desc: "The widest the ring is ever drawn, in logical pixels. In a bigger box it stays this size and sits in the centre. A lower value uses less battery; raising it makes every frame more expensive." },
      { name: "advanced", type: "FoilRingAdvanced", def: "const FoilRingAdvanced()", desc: "Fine controls. Leave it out to get the original design. Every field is listed below." },
      PAUSED,
      interactive("Whether touch affects the ring."),
      quality("high", "Level of detail. Lower settings take fewer steps per pixel (36 on low, 56 on medium, 90 on high) and use fewer shadow samples (2, 3 and 4), which keeps the frame rate up on weaker phones."),
      CONTROLLER,
      SEMANTIC,
    ],
    paramGroups: [
      {
        name: "FoilRingAdvanced",
        desc: "Fine controls for FoilRing. Every field is optional and the defaults match the original design, so you only set what you want to change. Pass it as advanced, for example FoilRing(advanced: const FoilRingAdvanced(rows: 4, glint: 80)).",
        params: [
          { name: "cycleMs", type: "double", def: "1000.0", desc: "Milliseconds one lobe step takes at normal speed. Lower is faster. At least 100." },
          { name: "lobes", type: "int", def: "3", desc: "Number of sides of the tube's cross-section, 3 to 8." },
          { name: "ringRadius", type: "double", def: "280.0", desc: "Radius of the ring itself, from 20 to 700." },
          { name: "tubeRadius", type: "double", def: "64.0", desc: "Radius of the tube, from 5 to 400." },
          { name: "rounding", type: "double", def: "45.0", desc: "How round the corners of the tube are, from 0 (sharp) to 95." },
          { name: "tilt", type: "double", def: "12.0", desc: "Resting tilt of the ring, in degrees." },
          { name: "centerX", type: "double", def: "0.0", desc: "Moves the ring sideways, in thousandths of the picture size." },
          { name: "centerY", type: "double", def: "0.0", desc: "Moves the ring up, in thousandths of the picture size." },
          { name: "rows", type: "int", def: "3", desc: "Number of stroke rows around the tube, 1 to 12." },
          { name: "strokeLength", type: "double", def: "92.0", desc: "Length of each stroke as a percentage of its row, from 5 to 300." },
          { name: "strokeWidth", type: "double", def: "14.0", desc: "Width of each stroke, from 1 to 100." },
          { name: "waveAmp", type: "double", def: "26.0", desc: "How far strokes wave from side to side, from 0 to 100." },
          { name: "waves", type: "double", def: "15.0", desc: "How many waves a stroke has, from 0 to 60. 0 draws straight strokes." },
          { name: "blackShare", type: "double", def: "30.0", desc: "Share of strokes that are black, from 0 to 100." },
          { name: "sheenShift", type: "double", def: "50.0", desc: "How much the foil colour shifts with the viewing angle, from 0 to 200." },
          { name: "glint", type: "double", def: "45.0", desc: "Strength of the shiny highlight on strokes, from 0 to 200." },
          { name: "speckle", type: "double", def: "25.0", desc: "Strength of the fine speckle on strokes, from 0 to 200." },
          { name: "ambient", type: "double", def: "55.0", desc: "How much of the light is ambient rather than directional, from 0 to 100." },
          { name: "exposure", type: "double", def: "125.0", desc: "Overall brightness, from 20 to 300." },
          { name: "aoStrength", type: "double", def: "70.0", desc: "Strength of the soft shadows in crevices, from 0 to 200." },
          { name: "lightAngle", type: "double", def: "135.0", desc: "Direction the light comes from, in degrees." },
          { name: "lightHeight", type: "double", def: "50.0", desc: "How high the light is, in degrees from -90 to 90." },
          { name: "strokeBlack", type: "Color", def: "0xFF020101", desc: "Colour of the black strokes." },
          { name: "seed", type: "int", def: "7", desc: "Changes which strokes get which colours." },
        ],
      },
    ],
    enums: [QUALITY_ENUM],
    controller: EFFECT_CONTROLLER,
    example: `import 'package:flutter/material.dart';
import 'package:cocoverse_ui/cocoverse_ui.dart';

class Demo extends StatelessWidget {
  const Demo({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: SizedBox(
        width: 360,
        height: 360,
        child: FoilRing(
          twist: 6,
          strokeCount: 32,
          advanced: FoilRingAdvanced(rows: 4, glint: 80),
        ),
      ),
    );
  }
}`,
    notes: [
      "It fills the space its parent gives it, but the ring is never drawn wider than maxDiameter, so it stays cheap on big screens. The area around the ring is transparent.",
      "Dragging does not spin it. Touch speeds it up and tips it toward your finger, and it settles back when you let go.",
      "FoilRingAdvanced is exported with the package, so one import covers both.",
    ],
  },

  "clay-bot": {
    summary:
      "A small matte clay robot with a round helmet and a screen for a face. It follows your finger or pointer with its head and eyes, blinks, hops when you tap it and waves hello. It can walk, make an entrance, and be steered from your own code.",
    useCases: [
      "A friendly mascot or guide for onboarding",
      "A companion beside a login form: eyes shut while a password is typed, a shake for a wrong one, a nod for a right one",
      "A voice assistant that reacts to loudness",
      "A splash screen that drops in or walks in",
    ],
    getCode: `ClayBot(
  entrance: ClayBotEntrance.dropIn,
)`,
    params: [
      { name: "colors", type: "List<Color>?", def: "lavender, navy, white", desc: "Three colours: the helmet and body, the face (the screen), and the eyes. Missing colours keep their defaults: a lavender clay, a deep navy screen and white eyes." },
      { name: "size", type: "double", def: "1.0", desc: "Size of the robot, where 1.0 is about 160 logical pixels tall. The smallest is 0.5. On phones and tablets the biggest is 1.5, because a big robot is costly to draw; on desktop and web the biggest is 4.0. The robot never grows past the height of the space it is given." },
      { name: "shadowColor", type: "Color", def: "0xFF2E4D6A", desc: "Colour of the shadow on the invisible floor." },
      { name: "shadowStrength", type: "double", def: "0.45", desc: "How dark the shadow is, from 0 to 1. 0 draws no shadow." },
      MOOD,
      LOOK_AT,
      LOOK_AT_KEY,
      FOLLOW,
      { name: "reach", type: "double", def: "1.0", desc: "How far the head turns toward what it looks at, from 0 to 2. 0 keeps the head still." },
      { name: "hop", type: "double", def: "1.0", desc: "Height of the hop when you tap the robot, from 0 to 3. 0 turns tapping off." },
      { name: "blink", type: "bool", def: "true", desc: "Whether the robot blinks now and then." },
      { name: "glance", type: "double", def: "1.0", desc: "How often the robot glances about when nobody is pointing. 0 never glances." },
      { name: "walkSpeed", type: "double", def: "1.0", desc: "How fast the robot walks, where 2.0 is twice as fast. 0 means it never walks: it only reacts, and it appears, leaves and moves to a new position at once." },
      { name: "walkToPointer", type: "bool", def: "true", desc: "Whether the robot walks along the space to stand under your finger or pointer, and back to its place a few seconds after you go. It needs walkSpeed above 0, and follow and interactive on." },
      { name: "position", type: "double?", def: "null", desc: "Where the robot stands across the space, from -1 at the left edge to 1 at the right edge, with 0 the middle. When it changes, the robot walks there. Null means the middle." },
      { name: "entrance", type: "ClayBotEntrance", def: "none", desc: "How the robot first appears. Replays when the controller is reset." },
      { name: "entranceDelay", type: "Duration", def: "200 milliseconds", desc: "How long to wait before the entrance starts." },
      { name: "onEntranceEnd", type: "VoidCallback?", def: "null", desc: "Called once when the entrance is over: after it lands or arrives." },
      { name: "onExited", type: "VoidCallback?", def: "null", desc: "Called once when the robot has walked out of the space after the controller's walkOff()." },
      { name: "wave", type: "bool", def: "true", desc: "Whether the robot waves hello by itself: when its entrance ends and when a pointer arrives after being away. The controller's wave() always works." },
      { name: "level", type: "double", def: "0.0", desc: "How loud a voice is, from 0 to 1, for a robot used as an assistant. A louder voice makes it bob and open its eyes wider and glow. 0 does nothing." },
      { name: "background", type: "Color?", def: "null", desc: "Fill behind the robot. Null means transparent, which is what you want when it sits inside an app." },
      SPEED,
      PAUSED,
      interactive("Whether touch and the pointer affect the robot."),
      quality("medium", "Level of detail. Lower settings march fewer steps (40, 56 and 80) and probe less for shadow and occlusion, which is faster on weak phones."),
      { name: "controller", type: "EffectController?", def: "null", desc: "Optional control. reset() plays the animation from the start, including the entrance. Pass a ClayBotController to also make the robot blink, shake its head, nod, hop, wave, or walk out of and into the space." },
      SEMANTIC,
    ],
    enums: [
      {
        name: "ClayBotEntrance",
        desc: "How the robot first appears.",
        values: [
          { name: "none", desc: "It is simply there." },
          { name: "dropIn", desc: "It drops in from above, lands with a squash, then waves." },
          { name: "walkInFromLeft", desc: "It walks in from past the left edge to its place, then waves. Needs a walkSpeed above 0." },
          { name: "walkInFromRight", desc: "It walks in from past the right edge to its place, then waves. Needs a walkSpeed above 0." },
        ],
      },
      {
        name: "ClayBotSide",
        desc: "Which side of the space the robot walks in from or out to.",
        values: [
          { name: "left", desc: "The left edge." },
          { name: "right", desc: "The right edge." },
        ],
      },
      MOOD_ENUM,
      FOLLOW_ENUM,
      QUALITY_ENUM,
    ],
    controller: {
      name: "ClayBotController",
      desc: "Everything CharacterController does (pause(), resume(), reset(), blink(), shake(), nod() and bounce()), plus waving, and walking out of and back into the space. Create one, pass it as controller, and dispose it when you are done.",
      methods: [
        { name: "wave()", desc: "Makes the robot wave hello." },
        { name: "walkOff(side)", desc: "Makes the robot walk out of the space past the given ClayBotSide. onExited is called once it has gone. With a walkSpeed of 0 it disappears at once." },
        { name: "walkIn(side)", desc: "Makes a robot that has walked off, or never appeared, walk in from past the given edge to its place. With a walkSpeed of 0 it appears at once." },
        { name: "blink()", desc: "Makes the robot blink once, whatever its own blink setting." },
        { name: "shake()", desc: "Shakes its head, as for a no. For example, a wrong password." },
        { name: "nod()", desc: "Nods its head, as for a yes. For example, an accepted code." },
        { name: "bounce()", desc: "Makes it hop, as for a success." },
      ],
    },
    example: `import 'package:flutter/material.dart';
import 'package:cocoverse_ui/cocoverse_ui.dart';

class Demo extends StatefulWidget {
  const Demo({super.key});

  @override
  State<Demo> createState() => _DemoState();
}

class _DemoState extends State<Demo> {
  final controller = ClayBotController();

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: 240,
          width: double.infinity,
          child: ClayBot(
            controller: controller,
            entrance: ClayBotEntrance.dropIn,
          ),
        ),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextButton(onPressed: controller.nod, child: const Text('Nod')),
            TextButton(onPressed: controller.shake, child: const Text('Shake')),
            TextButton(onPressed: controller.wave, child: const Text('Wave')),
          ],
        ),
      ],
    );
  }
}`,
    notes: [
      "There is no ground and no background: it draws only the robot and its shadow, so it sits on whatever is behind it.",
      "It fills the space its parent gives it, which is also the space it walks in. Give it the full width of the screen if you want it to walk in from past the edges.",
      "It listens for touches and the mouse anywhere on the screen without taking part in any gesture, so it can sit over other widgets without stealing their taps.",
      "The robot looks at one thing at a time: lookAtKey wins over lookAt, which wins over the pointer.",
      "A mouse that stops moving is forgotten after a few seconds. A finger counts only while it is down.",
    ],
  },

  "capsule-sprite": {
    summary:
      "A sprite with two pill eyes, sealed in a thick glass capsule: the upper half clear, the lower half frosted. The sprite turns to look at your finger or pointer, the capsule leans toward it, and the sprite blinks on its own. Pressing makes it squint.",
    useCases: [
      "A splash screen that wakes up: asleep, eyes open, a blink, then a look left and right",
      "A companion that watches a form field or a button",
      "A compact assistant or mascot avatar",
    ],
    getCode: `CapsuleSprite(
  intro: true,
)`,
    params: [
      { name: "colors", type: "List<Color>?", def: "blue, pale", desc: "The first colour is the sprite, the second is its eyes. Missing colours keep their defaults: a deep blue sprite with pale eyes. The glass takes no colour." },
      { name: "frost", type: "double", def: "0.5", desc: "How milky the lower half of the capsule is, from 0 to 1. 0 is clear glass all round, 0.5 is the default and 1 is nearly opaque milk." },
      { name: "size", type: "double", def: "1.0", desc: "Size of the capsule, from 0.2 to 1.6." },
      MOOD,
      LOOK_AT,
      LOOK_AT_KEY,
      FOLLOW,
      { name: "intro", type: "bool", def: "false", desc: "Plays a short wake-up when the sprite first appears, like a splash screen: it is asleep, opens its eyes, blinks, then looks left and right." },
      { name: "introDuration", type: "Duration", def: "2800 milliseconds", desc: "How long the intro takes." },
      { name: "onIntroEnd", type: "VoidCallback?", def: "null", desc: "Called once when the intro has finished." },
      { name: "reach", type: "double", def: "1.0", desc: "How hard the sprite turns to look at its target. 0 stops it from turning to look." },
      { name: "lean", type: "double", def: "1.0", desc: "How far the capsule leans toward its target. 0 keeps it upright." },
      { name: "blink", type: "double", def: "1.0", desc: "How often the sprite blinks. 0 never blinks." },
      { name: "float", type: "double", def: "1.0", desc: "How much the capsule bobs and sways, and how much the sprite looks around when nothing is touching it. 0 keeps it still." },
      { name: "background", type: "Color?", def: "null", desc: "Fill behind the capsule. Null means transparent, so the clear glass shows whatever is behind it." },
      SPEED,
      PAUSED,
      interactive("Whether touch and the pointer affect the sprite."),
      quality("medium", "Reserved. This effect draws with a single shader, so every level looks the same and costs the same for now."),
      { name: "controller", type: "EffectController?", def: "null", desc: "Optional control. reset() plays the animation from the start, including the intro. Pass a CharacterController to also make the sprite blink, shake its head, nod or hop on demand." },
      SEMANTIC,
    ],
    enums: [MOOD_ENUM, FOLLOW_ENUM, QUALITY_ENUM],
    controller: CHARACTER_CONTROLLER,
    example: `import 'package:flutter/material.dart';
import 'package:cocoverse_ui/cocoverse_ui.dart';

class Demo extends StatelessWidget {
  const Demo({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: SizedBox(
        width: 320,
        height: 320,
        child: CapsuleSprite(
          intro: true,
          frost: 0.6,
        ),
      ),
    );
  }
}`,
    notes: [
      "It fills the space its parent gives it and draws the capsule centred in that space.",
      "Pressing makes it squint happily, held while the finger is down.",
      "By default it looks at the last touch or mouse position anywhere on the screen. Set follow to widget to look only while the pointer is over it, or off to ignore the pointer.",
      "With nothing to look at, it glances slowly about on its own.",
    ],
  },

  blossom: {
    summary:
      "A lotus cast in pink resin and lit from inside, that opens from a bud. Tap it to open and close it, set its progress from 0 to 1, or let it open on its own as a splash.",
    useCases: [
      "A progress indicator that blooms a little as each step of something is finished",
      "A splash or welcome screen: autoOpen and an onOpened callback to move on",
      "A calm centrepiece for wellness, meditation or beauty apps",
    ],
    getCode: `Blossom(
  autoOpen: true,
)`,
    params: [
      { name: "colors", type: "List<Color>", def: "pink, amber, periwinkle", desc: "Three colours: the resin of the petals, the light of the lamp inside, and the cool sheen on the coating. Missing colours keep their defaults." },
      { name: "petals", type: "int", def: "14", desc: "Petals in each of the outer whorls, from 3 to 16. The inner whorls carry fewer." },
      { name: "layers", type: "int", def: "4", desc: "Whorls of petals round the dome, from 1 to 4, counted from the inside." },
      { name: "size", type: "double", def: "1.0", desc: "Size of the flower." },
      { name: "glow", type: "double", def: "1.0", desc: "Brightness of the lamp inside the flower." },
      { name: "bloom", type: "double", def: "1.0", desc: "How strongly bright light spills past the petals. 0 turns it off, which is also the cheapest to draw." },
      { name: "motes", type: "int", def: "24", desc: "How many faint specks drift past. 0 turns them off." },
      { name: "open", type: "double?", def: "null", desc: "How open the flower is, from 0 (a closed bud) to 1 (fully open). When it is set, the flower eases to the value every time it changes, and taps no longer open it. Null leaves the flower to taps or autoOpen." },
      { name: "openOnTap", type: "bool", def: "true", desc: "Whether tapping the flower opens it and closes it again. It has no effect while open is set." },
      { name: "autoOpen", type: "bool", def: "false", desc: "Opens the flower on its own as soon as it appears, like a splash screen. It has no effect while open is set." },
      { name: "openDuration", type: "Duration", def: "3400 milliseconds", desc: "How long a full opening, from closed to open, takes. A smaller change takes a proportionally shorter time, but never under a third of a second." },
      { name: "curve", type: "Curve", def: "easeInOut", desc: "The easing of every opening and closing." },
      { name: "onOpened", type: "VoidCallback?", def: "null", desc: "Called once each time the flower finishes opening fully." },
      { name: "tilt", type: "double", def: "1.0", desc: "How far the flower leans toward the pointer." },
      { name: "float", type: "double", def: "1.0", desc: "How much the flower bobs and sways." },
      { name: "spin", type: "double", def: "1.0", desc: "How fast the flower turns on its own. Negative turns the other way." },
      { name: "background", type: "Color?", def: "null", desc: "Fill behind the flower. Null means transparent." },
      SPEED,
      PAUSED,
      interactive("Whether touch affects the flower: the lean, the glow under a finger and the tap."),
      quality("medium", "Level of detail. Low draws a coarse petal mesh and a single glow layer, medium a finer mesh and two glow layers, and high the finest mesh."),
      { name: "controller", type: "EffectController?", def: "null", desc: "Optional control. reset() plays the opening again." },
      SEMANTIC,
    ],
    enums: [QUALITY_ENUM],
    controller: {
      name: "EffectController",
      desc: "Create one, pass it as controller, and dispose it when you are done.",
      methods: [
        { name: "pause()", desc: "Freezes the animation." },
        { name: "resume()", desc: "Continues the animation after pause()." },
        { name: "reset()", desc: "Plays the opening again, from a closed bud." },
      ],
    },
    example: `import 'package:flutter/material.dart';
import 'package:cocoverse_ui/cocoverse_ui.dart';

class Demo extends StatelessWidget {
  const Demo({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: SizedBox(
        width: 360,
        height: 360,
        child: Blossom(
          autoOpen: true,
          bloom: 1.2,
        ),
      ),
    );
  }
}`,
    notes: [
      "There are three ways to open it. Tap: by default, tapping the flower opens it, and tapping again closes it. Progress: set open from 0 to 1 and the flower eases to that point each time the value changes. Splash: set autoOpen and it opens on its own as soon as it appears, with onOpened telling you when it is fully open.",
      "While open is set, taps no longer open the flower, and autoOpen has no effect.",
      "It fills the space its parent gives it. The glow and the specks are the costly parts: lower bloom or motes on weaker phones.",
    ],
  },

  "cube-sphere": {
  summary:
      "Thousands of small glossy cubes on a sphere that tumble and breathe outward in a wave. Drag to spin it; it tilts slightly toward your finger.",
    useCases: [
      "A hero visual on a landing or splash screen",
      "A calm loading state that stays interesting",
      "A decorative centrepiece on an onboarding page",
    ],
    getCode: `CubeSphere(
  colors: [Color(0xFFFFD000), Color(0xFF0081FF)],
)`,
    params: [
      { name: "colors", type: "List<Color>", def: "[0xFFFFD000, 0xFF0081FF]", desc: "The first colour is the cubes at rest, the second is the cubes pushed outward." },
      { name: "sheen", type: "Color", def: "white", desc: "Colour of the glossy highlight on the cubes." },
      { name: "density", type: "double", def: "1.0", desc: "Multiplies the number of cubes." },
      { name: "cubeSize", type: "double", def: "1.0", desc: "Scales each cube." },
      { name: "breath", type: "double", def: "1.0", desc: "How far the cubes push outward." },
      { name: "wave", type: "double", def: "1.0", desc: "Strength of the wave that travels over the sphere." },
      { name: "gap", type: "double", def: "1.0", desc: "Spacing between cubes." },
      { name: "gloss", type: "double", def: "0.47", desc: "How glossy the cubes look." },
      { name: "tumble", type: "double", def: "1.0", desc: "How much the cubes tumble." },
      { name: "spin", type: "double", def: "-1.0", desc: "Rotation of the sphere. A negative value turns it left." },
      { name: "size", type: "double", def: "1.0", desc: "Scales the whole sphere inside its space." },
      { name: "background", type: "Color?", def: "null", desc: "Fill behind the effect. Null keeps it transparent." },
      { name: "speed", type: "double", desc: "Speed of the animation." },
      { name: "paused", type: "bool", desc: "Freezes the animation." },
      { name: "interactive", type: "bool", desc: "Lets touch and drag act on it." },
      { name: "dragSensitivity", type: "double", desc: "How strongly a drag spins it." },
      { name: "quality", type: "EffectQuality", def: "medium", desc: "low, medium or high. Higher levels draw more cubes (about 769, 2065 and 3640)." },
      { name: "controller", type: "EffectController?", desc: "Pause, resume or reset it from code." },
      { name: "semanticLabel", type: "String?", desc: "Label for screen readers." },
    ],
    controller: {
      name: "EffectController",
      desc: "Create one, pass it as controller, and call it from anywhere.",
      methods: [
        { name: "pause()", desc: "Freezes the effect." },
        { name: "resume()", desc: "Starts it again." },
        { name: "reset()", desc: "Resets the effect." },
      ],
    },
    example: `import 'package:flutter/material.dart';
import 'package:cocoverse_ui/cocoverse_ui.dart';

class Demo extends StatelessWidget {
  const Demo({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: SizedBox(
        width: 320,
        height: 320,
        child: CubeSphere(
          colors: [Color(0xFFFFD000), Color(0xFF0081FF)],
        ),
      ),
    );
  }
}`,
    notes: [
      "It fills the space its parent gives it. Set the size with a SizedBox and the position with padding or Align. The parent must give bounded constraints.",
      "Drag spins it, and it tilts slightly toward the finger.",
    ],
  },
};

export function docFor(slug: string): AssetDoc | undefined {
  return DOCS[slug];
}
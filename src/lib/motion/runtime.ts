// Everything the site animates with, in one bundle that loads after the first
// paint (see load.ts). Import from here only through loadMotion/withMotion,
// never directly, or GSAP lands back in the first download.

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, Flip);

export { gsap, Flip, ScrollTrigger, Lenis };
export { holoScramble } from "./holo";
export { rollNumber, wipeFill } from "./text";

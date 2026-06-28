# Liquid Ascii CLI edition
Hi again! This is another Fluid simulation Thats runs entirely in your terminal.
It's my first Node.js project and it's a partial spinoff of my original Liquid Ascii and Matthias Müller's "Ten Minute Physics" but with a lot of modifications.

## showcase, click video below
[![Watch the video](https://img.youtube.com/vi/6aG8mmDsDds/hqdefault.jpg)](https://www.youtube.com/embed/6aG8mmDsDds)
## what it is 
It's a FLIP fluid sim (the physics kinda with particles and density ramp) but instead of pixels it draws it out of Ascii Characters in your terminal! there are zero images display only pure Ascii. 
Theres a shape in the middle that scts like a void that you can fling around if you enable it. i thought it was cool.

## [![Also check out my Web version!](https://github.com/N30Yang/ascii-fluid/)]

## requirements
- [Node.js](https://nodejs.org/) v14 or higher
- A terminal that supports ANSI escape codes ( basically every terminal except for Windows command prompt)
- Macos or Linux, just use native terminal
    - Windows just use like git bash or WSL

# how to run
''' bash
node index.js
'''

Or just run the executable
Make sure you are in the directory for this project in your terminal using 'cd'
Also make sure it is a decent size to make it has higher resolution

## how to use 
- **arrow keys** — move the shape around and push the water
- **[k / l]** — shrink or grow the shape live, it displaces the fluid as it changes size
- **[p]** — pause the simulation
- **[s]** — shake the tank, everything explodes, very cool
- **[r]** — rain in extra particles, don't put too much
- **[o]** — rain in oil that floats, was annoying to implement
- **[g]** — toggle between pinned and free moving  
  Pinned = not affected by gravity, moves when you press arrow keys  
  Free = acts like an air hockey puck, flings around and falls with gravity
- **[ctrl+c]** — exit cleanly

## resizing
Just resize the actual window of the terminal while it's running, the fluid will movee automatically

## The stack
Genuinely just one file:
- 'index.js'
Nothing else

## credit
backbone of the original is Matthias Müller's "Ten Minute Physics" tutorial #18, which I've changed so much just look at the og repo. I rewrote basically everything: the ASCII renderer, shake, resizing, oil, rain, puck, and pausing. this repo is a Rewrite of an overhaul so it's quite different
Still keeping the credit + license here and in script.js:

- tutorial: https://github.com/matthias-research/pages/blob/master/tenMinutePhysics/18-flip.html
- ten minute physics: https://www.youtube.com/c/TenMinutePhysics

Copyright 2022 Matthias Müller - Ten Minute Physics  
[www.youtube.com/c/TenMinutePhysics](https://www.youtube.com/c/TenMinutePhysics)  
[www.matthiasMueller.info/tenMinutePhysics](https://www.matthiasMueller.info/tenMinutePhysics)

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

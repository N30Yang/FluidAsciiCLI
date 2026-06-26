/*
Hi guys! this is another verison of my first fluid sim,
Now it runs in Javascript with NodeJS in CLi
For hack club Horions

So my first Fluid Sim i used Matthias Müller - Ten Minute Physics Flip Fluid Experiment
But I completely overhauled it and it is VERY HEAVILY modified.

I still have it linked because it is the backbon of the backbone of this project
--------------------------------
Copyright 2022 Matthias Müller - Ten Minute Physics, 
www.youtube.com/c/TenMinutePhysics
www.matthiasMueller.info/tenMinutePhysics

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

const min_grid_size = 1;
const cell_crop_x = 1;
const cell_crop_y = 2;

const base = [
    ["~", 12198],
    [":", 6921],
    ["-", 5589],
    [".", 3267],
    [" ", 0],
    [" ", 0],
];

const render_chars = [
    [
        ["N", 29420],
        ["N", 29420],
        ["n", 17950], ...base
    ],
    [
        ["E", 25880],
        ["E", 25880],
        ["e", 18840], ...base
    ],
    [
        ["O", 32973],
        ["O", 32973],
        ["o", 21645], ...base
    ],
    [
        ["X", 23150],
        ["X", 23150],
        ["x", 16420], ...base
    ],
    [
        ["Y", 19640],
        ["Y", 19640],
        ["y", 17110], ...base
    ],
];

// Made sizing variables mutable to support live adaptive terminal scaling
let grid_size = 1;
let real_width = 0;
let real_height = 0;
let y_resolution = 0;
let resolution = 0;

const speed_1 = 1.0 / 60.0 / 16;
const speed_base = 1.0 / 60.0 / 3;
const speed_2 = 1.0 / 60.0 / 1.25;

const gravity = -9.81;

var sim_height = 2.0;
var c_scale = 1.0;
var sim_width = 1.0;

var fluid_cell = 0;
var air_cell = 1;
var solid_cell = 2;

function clamp(x, min, max) {
    return x < min ? min : x > max ? max : x;
}

class FlipFluid {
    constructor(
        density,
        width,
        height,
        spacing,
        particleRadius,
        maxparticles
    ) {
        this.density = density;
        this.f_num_x = Math.floor(width / spacing);
        this.f_num_y = Math.floor(height / spacing);
        this.h = Math.max(width / this.f_num_x, height / this.f_num_y)
        this.f_inv_spacing = 1.0 / this.h;
        this.f_num_cells = this.f_num_x * this.f_num_y;
        this.u = new Float32Array(this.f_num_cells);
        this.v = new Float32Array(this.f_num_cells);
        this.du = new Float32Array(this.f_num_cells);
        this.dv = new Float32Array(this.f_num_cells);
        this.prev_u = new Float32Array(this.f_num_cells);
        this.prev_v = new Float32Array(this.f_num_cells);
        this.p = new Float32Array(this.f_num_cells);
        this.s = new Float32Array(this.f_num_cells);
        this.cell_type = new Float32Array(this.f_num_cells);
        this.cell_color = new Float32Array(3 * this.f_num_cells);
        this.cell_particle_ids = new Int32Array(maxparticles);
        this.max_particles = maxparticles;
        this.particle_pos = new Float32Array(2 * this.max_particles);
        this.particle_color = new Float32Array(3 * this.max_particles);
        for (var i = 0; i < this.max_particles; i++) this.particle_color[3 * i + 2] = 1.0;
        this.particle_vel = new Float32Array(2 * this.max_particles);
        this.particle_type = new Uint8Array(this.max_particles);
        this.oil_grid = new Uint8Array(this.f_num_cells);
        this.particle_density = new Float32Array(this.f_num_cells);
        this.particle_rest_density = 0.0;
        this.particle_radius = particleRadius;
        this.p_inv_spacing = 1.0 / (2.2 * this.particle_radius);
        this.p_num_x = Math.floor(width * this.p_inv_spacing) + 1;
        this.p_num_y = Math.floor(height * this.p_inv_spacing) + 1;
        this.p_num_cells = this.p_num_x * this.p_num_y;
        this.num_cell_particles = new Int32Array(this.p_num_cells);
        this.first_cell_particles = new Int32Array(this.p_num_cells + 1);
        this.num_particles = 0;
    }
    intergrate_particles(dt) {
        for (var i = 0; i < this.num_particles; i++) {
            let gravity_x = 0;
            let gravity_y = gravity;

            if (this.particle_type[i] === 1) {
                gravity_y += -gravity * 0.65;
            }

            this.particle_vel[2 * i] += dt * gravity_x;
            this.particle_vel[2 * i + 1] += dt * gravity_y;
            this.particle_pos[2 * i] += this.particle_vel[2 * i] * dt;
            this.particle_pos[2 * i + 1] += this.particle_vel[2 * i + 1] * dt;
        }
    }
    shake(strength) {
        var cx = (this.f_num_x * this.h) * 0.5;
        var cy = (this.f_num_y * this.h) * 0.5;
        for (var i = 0; i < this.num_particles; i++) {
            var dx = this.particle_pos[2 * i] - cx;
            var dy = this.particle_pos[2 * i + 1] - cy;
            var d = Math.sqrt(dx * dx + dy * dy);
            var ox = dx / d,
                oy = dy / d;
            var rx = (Math.random() - 0.5) * 2.0;
            var ry = (Math.random() - 0.5) * 2.0;
            this.particle_vel[2 * i] += (ox * 0.6 + rx) * strength;
            this.particle_vel[2 * i + 1] += (oy * 0.6 + ry) * strength + strength * 0.5;
        }
    }

    spawn_at(sx, sy, count, type) {
        if (type === undefined) type = 0;
        var r = this.particle_radius;
        for (var k = 0; k < count; k++) {
            if (this.num_particles >= this.max_particles) break;
            var i = this.num_particles++;
            var ang = Math.random() * Math.PI * 2;
            var rad = Math.random() * 8 * r;
            this.particle_pos[2 * i] = sx + Math.cos(ang) * rad;
            this.particle_pos[2 * i + 1] = sy + Math.sin(ang) * rad;
            this.particle_vel[2 * i] = 0;
            this.particle_vel[2 * i + 1] = 0;
            this.particle_type[i] = type;
            this.particle_color[3 * i] = 0;
            this.particle_color[3 * i + 1] = 0;
            this.particle_color[3 * i + 2] = 1.0;
        }
    }

    push_particles_apart(num_iters) {
        this.num_cell_particles.fill(0);

        for (var i = 0; i < this.num_particles; i++) {
            var x = this.particle_pos[2 * i];
            var y = this.particle_pos[2 * i + 1];
            var xi = clamp(Math.floor(x * this.p_inv_spacing), 0, this.p_num_x - 1);
            var yi = clamp(Math.floor(y * this.p_inv_spacing), 0, this.p_num_y - 1);
            var cell_nr = xi * this.p_num_y + yi;
            this.num_cell_particles[cell_nr]++;
        }

        var first = 0;
        for (var i = 0; i < this.p_num_cells; i++) {
            first += this.num_cell_particles[i];
            this.first_cell_particles[i] = first;
        }
        this.first_cell_particles[this.p_num_cells] = first;

        for (var i = 0; i < this.num_particles; i++) {
            var x = this.particle_pos[2 * i];
            var y = this.particle_pos[2 * i + 1];
            var xi = clamp(Math.floor(x * this.p_inv_spacing), 0, this.p_num_x - 1);
            var yi = clamp(Math.floor(y * this.p_inv_spacing), 0, this.p_num_y - 1);
            var cell_nr = xi * this.p_num_y + yi;
            this.first_cell_particles[cell_nr]--;
            this.cell_particle_ids[this.first_cell_particles[cell_nr]] = i;
        }

        var min_dist = 2.0 * this.particle_radius;
        var min_dist2 = min_dist * min_dist;

        for (var iter = 0; iter < num_iters; iter++)
            for (var i = 0; i < this.num_particles; i++) {
                var px = this.particle_pos[2 * i];
                var py = this.particle_pos[2 * i + 1];
                var pxi = Math.floor(px * this.p_inv_spacing);
                var pyi = Math.floor(py * this.p_inv_spacing);
                var x0 = Math.max(pxi - 1, 0);
                var y0 = Math.max(pyi - 1, 0);
                var x1 = Math.min(pxi + 1, this.p_num_x - 1);
                var y1 = Math.min(pyi + 1, this.p_num_y - 1);

                for (var xi = x0; xi <= x1; xi++) {
                    for (var yi = y0; yi <= y1; yi++) {
                        var cell_nr = xi * this.p_num_y + yi;
                        var first_c = this.first_cell_particles[cell_nr];
                        var last_c = this.first_cell_particles[cell_nr + 1];
                        for (var j = first_c; j < last_c; j++) {
                            var id = this.cell_particle_ids[j];
                            if (id == i) continue;
                            var qx = this.particle_pos[2 * id];
                            var qy = this.particle_pos[2 * id + 1];
                            var dx = qx - px;
                            var dy = qy - py;
                            var d2 = dx * dx + dy * dy;
                            if (d2 > min_dist2 || d2 == 0.0) continue;
                            var d = Math.sqrt(d2);
                            var s = (0.5 * (min_dist - d)) / d;
                            dx *= s;
                            dy *= s;
                            this.particle_pos[2 * i] -= dx;
                            this.particle_pos[2 * i + 1] -= dy;
                            this.particle_pos[2 * id] += dx;
                            this.particle_pos[2 * id + 1] += dy;
                        }
                    }
                }
            }
    }
}

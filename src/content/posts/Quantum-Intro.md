---
title: 'Introduction to Quantum Physics'
pubDate: 2024-07-11
description: 'An introduction to the world of quantum physics.'
author: 'David Kim'
image:
    url: 'https://docs.astro.build/assets/full-logo-light.png'
    alt: 'bleh'
tags: ["physics"]
---
Quantum physics stands at the beginning of the 20th century - with great minds from Planck to Hilbert 
navigating the complex world of quantum physics.<br><br>

We begin with a conceptual understanding of the field--moving down from our classical world (or should 
we say moving *smaller*?). <br><br>

### I. The Birth of Quantum Theory
Quantum theory goes hand-in-hand with the emergence of the **Bohr model** in atomic theory, and the 
initiation of **statistical mechanics** by Boltzmann, both conceptually and chronologically. To avoid 
meandering, we'll provide only the necessary bits from both of these conceptual bodies, but it's very useful 
to have a good understanding of both when going into quantum theory!

#### **1. Blackbodies and Energy Quantization**
A **blackbody** is an ideal object that absorbs all electromagnetic waves, regardless of the wave frequency 
and angle of incidence. Blackbody **radiation** is the radiation emitted by a blackbody in thermal equilibrium 
with its environment. 
<br><br>
A classic example of a blackbody is a cavity, such as a box, with thermally insulated walls with a small hole:
<img src='https://dvdkm.cc/public/assets/images/blog/quantum-intro/blackbody.png' class='mx-auto max-w-52 max-h-52'>
If an electromagnetic ray "hits" the hole, it will enter the insulated blackbody and will be reflected inside, 
with energy transferring between the cavity and the light, before it exits the cavity by chance. This energy 
transfer enables the light to reach **thermal equilibrium** with the cavity itself--making the light that exits the 
blackbody "different" from the initial ray.

##### 1.1 &nbsp; The Physics of the Blackbody
To understand the significance of the blackbody to quantum theory, we will first investigate the physics of
this blackbody with statistical mechanics--particularly, the *energy* of the wave.
<br><br>
First, consider a <u>cubic cavity</u> with side lengths $l$ and a small hole to allow a trapped electromagnetic wave
to escape. Given that an electromagnetic wave has been trapped in this blackbody, we establish:
> 1. **The electric field $E$ at the walls must be $0$.** <br>
> The walls of our blackbody are *conductive*, so $E=0$ at these boundaries.
> 2. **The trapped wave can be represented as a superposition of sinusoidal waves.** <br>
> With (1) established, we know that the Fourier expansion of this wave is complete.
> 3. **The modes of standing waves are dimensionally-independent.**<br>
> An extension of (2), this simply states that the standing wave modes that we use to represent our trapped wave
> in each direction are independent of each other--for example, any mode in the $x$ direction can exist with any
> mode in the $y$ or $z$ direction.

Opting to represent all *possible* modes of this wave mathematically, 
$$
l = n \frac {\lambda}{2}
$$
where n is an integer. Since we have 3 degrees of freedom with the same side length $l$, we have 3 separate
$n$ for each degree of freedom: $(n_x, n_y, n_z)$. <br><br>

How many different configurations of n can we have? Well, we know $n$ can be any positive integer, and we have
3 different $n$ for each degree of freedom. The total amount of different configurations of $n$ we can have 
would be:
$$
\text{all }n_x \times \text{all }n_y \times \text{all }n_z
$$
This isn't very useful of an expression, so we instead consider the volume of a coordinate system--the above
expression is the same as the volume of the positive octant of a cartesian coordinate system! So to represent
<u>all possible wave modes</u>:
$$
2 \times \int_{(+, +, +)}d^3n
$$
We integrate in the positive octant of a coordinate system $(n_x, n_y, n_z)$. The factor of 2 that we multiply
this integral by comes from the fact that all light has **two polarization modes** which doubles the
possible configurations of $n$.<br><br>
However, we want to represent the total modes in terms of a more typical quantity--angular frequency. To do this, 
we take a few steps:
$$
k = \frac{2\pi}{\lambda} = \frac{n\pi}{l}, \quad \omega = \frac{n\pi c}{l}
$$
Where $k$ represents the wavenumber, and $\omega$ represents the angular frequency of this wave. Then, converting
the above expression:
$$
\frac{2l^3}{\pi^3c^3}\int_{(+,+,+)}d^3\omega = \frac{2l^3}{\pi^3c^3}\times\frac{1}{8}\int 4\pi\omega^2d\omega = \frac{V}{\pi^2c^3}\int\omega^2d\omega 
$$
Where volume $V = l^3$. With this representation, we use the **equipartition theorem** to state the energy of this wave:
$$
E=\frac{V}{\pi^2c^3}k_BT\int\omega^2d\omega
$$

##### 1.2 &nbsp; Planck and The Ultraviolet Catastrophe
Physicists in the early 20th century came to the same conclusion as above. The **Rayleigh-Jeans Law** takes the 
above expression with intensity formula $E = \int I(\omega)d\omega$ to state
$$
I(\omega) = \frac{Vk_BT\omega^2}{\pi^2c^3}
$$
which makes $I\propto\omega^2$. This means, at high angular frequencies, our intensity increases rapidly without bound
--which is known as the **Ultraviolet Catastrophe**. We know this relation is untrue, due to the fact that the energy *inside*
the blackbody is finite, while the expression says that at infinitely high frequencies, the blackbody will emit an *infinite*
amount of radiation and energy. <br><br>

#### **The Double-Slit Experiment**

#### **The Wave Nature of...Matter?**

---
title: 'Linear Algebra'
pubDate: 2024-07-08
description: 'A brief introduction to basic linear algebra - particularly scoped towards its use in physics.'
author: 'David Kim'
image:
    url: 'https://docs.astro.build/assets/full-logo-light.png'
    alt: 'bleh'
tags: ["math", "physics"]
---
> "*Mathematics is the art of reducing any problem to linear algebra.*"

To provide a brief introduction, linear algebra concerns the behaviors of linear maps, and linear relations (hence "linear").
$$
\overbrace{a_1x_1+...+a_nx_n = c}^{\text{linear relations}}\quad \text{and} \quad \overbrace{V \rightarrow W}^{\text{linear maps}}
$$
More generally, however, linear algebra is the study of the behavior of mathematical structures that obey specific rules (vector addition and scalar multiplication), which apply to the aforementioned linear maps and relations. <br><br>
The field of linear algebra begins with the definition of its most fundamental unit...

## Vectors and Spaces
What is a vector? An immediate reaction might be to visualize an arrow in space, or a $n \times 1$ matrix, or the definition of "a quantity with magnitude and direction":
$$
\mathbf{\nearrow} ,\quad \begin{bmatrix}
a_1\\
\vdots\\
a_n
\end{bmatrix}, \quad \mathbf{v}
$$
These are all *examples* of vectors, but don't quite encompass what a vector is. Our general definition of a vector is as follows:
> **Definition**: A vector is an element of a vector space.

And the definition of a vector space:
> **Definition**: A vector space $V$ is a non-empty set over some field $F$ with associated vector addition and scalar multiplication that satisfy the following 8 axioms:
> 1. **Vector addition associativity:** 
> $\mathbf{(u + v) + w = u + (v + w)}$ <br>
> 2. **Vector addition commutativity:**
> $\mathbf{u} + \mathbf{v} = \mathbf{v} + \mathbf{u}$
> 3. **Existence of an identity element under vector addition:**
> $\mathbf{u} + \mathbf{0} = \mathbf{u}$ <br>
> This vector $\mathbf{0}$ is also called the *zero vector*, and denoted as such. There *always* exists a zero vector for any given vector space. 
> 4. **Existence of additive inverse under vector addition**:
> $\mathbf{u} + (\mathbf{-u}) = \mathbf{0}$ <br>
> For every vector $\mathbf{u}$, there must exist another vector $\mathbf{-u}$ within the vector space such that under vector addition, they will add to the zero vector. Recall from above that a vector space must be a *non-empty* set--the smallest possible set a vector space can be is simply just the zero vector.
> 5. **Existence of an identity element under scalar multiplication**:
> $1\mathbf{u} = \mathbf{u}$ <br>
> An identity element in $F$ under scalar multiplication. Analogous to **axiom 3**. 
> 6. **Scalar multiplication associativity**:
> $a(b\mathbf{u}) = (ab)\mathbf{u}$
> 7. **Scalar multiplication distributivity**:
> $(a + b)\mathbf{u} = a\mathbf{u}+ b\mathbf{u}$
> 8. **Scalar multiplication distributivity with respect to vector addition:**<br>
> $a(\mathbf{u} + \mathbf{v}) = a\mathbf{u} + a\mathbf{v}$
> <br>
> There are some caveats regarding axioms 5 and 6 with field $F$, but we'll disregard them for now. 

With these definitions established, we can create a few examples of vectors with respective vector spaces:
- Rational functions
  All 
  For example, here's a vector space
$$
x \in V \mid     V = \{nx\}, \quad n \in \mathbb{Z}
$$

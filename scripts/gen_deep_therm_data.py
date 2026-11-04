"""Regenerate the datasets used by the interactive figures in the
`deep_thermalization` post.

Writes two files into ``src/data/deep_therm``:

* ``bloch.json``  — exact projected ensembles of a 12-qubit kicked Ising chain
  with a single-qubit subsystem A, for three parameter sets (self-dual,
  generic chaotic, integrable).  Bloch coordinates are quantized to signed
  hundredths and Born weights to D_B * p_z in units of 1/32 so the payload
  stays small.  The reported epsilon_k are computed from *all* D_B outcomes,
  not from the drawn subsample.
* ``design.json`` — the committed disorder-averaged kicked Ising sweeps
  (L = 10 … 20, L_A = 2) together with the exact parameter-free Haar floors
  E eps_k^2 = (N_k - 1)(d + 1) / (d D_B + 1).

Requires a checkout of the deep_therm_gen dossier for the exact-state
simulation code and its committed CSV outputs.  Usage:

    python scripts/gen_deep_therm_data.py --repo /path/to/deep_therm_gen
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import sys
from pathlib import Path

import numpy as np

SITE = Path(__file__).resolve().parents[1]
OUT = SITE / "src" / "data" / "deep_therm"

L, L_A = 12, 1
D_A, D_B = 1 << L_A, 1 << (L - L_A)
TIMES = list(range(0, 13))
NSHOW = 220
SEED = 20260815

SX = np.array([[0, 1], [1, 0]], dtype=complex)
SY = np.array([[0, -1j], [1j, 0]], dtype=complex)
SZ = np.array([[1, 0], [0, -1]], dtype=complex)

LABELS = {
    "dual_unitary": "self-dual kicked Ising",
    "chaotic": "generic chaotic",
    "integrable": "integrable (free fermion)",
}


def bloch_dataset(baseline) -> dict:
    rng = np.random.default_rng(SEED)
    show = np.sort(rng.choice(D_B, size=NSHOW, replace=False))
    models = baseline.standard_models()

    out = {
        "L": L,
        "L_A": L_A,
        "D_A": D_A,
        "D_B": D_B,
        "nshow": NSHOW,
        "times": TIMES,
        "floor": {
            f"eps{k}": round(
                math.sqrt(
                    (baseline.symmetric_subspace_dimension(D_A, k) - 1)
                    * (D_A + 1)
                    / (D_A * D_B + 1)
                ),
                5,
            )
            for k in (1, 2, 3)
        },
        "models": {},
    }

    for key, model in models.items():
        psi = baseline.product_state(L, "plus")
        frames = []
        for t in TIMES:
            state = baseline.evolve_state(psi, L, model, t)
            ens = baseline.projected_ensemble(state, L, L_A)

            full_p = np.zeros(D_B)
            full_p[ens.outcome_indices] = ens.probabilities
            full_v = np.zeros((2, D_B), dtype=complex)
            full_v[:, ens.outcome_indices] = ens.states

            cols = full_v[:, show]
            bx = np.real(np.einsum("ai,ab,bi->i", cols.conj(), SX, cols))
            by = np.real(np.einsum("ai,ab,bi->i", cols.conj(), SY, cols))
            bz = np.real(np.einsum("ai,ab,bi->i", cols.conj(), SZ, cols))

            rho = (full_v * full_p[None, :]) @ full_v.conj().T
            eps = []
            for k in (1, 2, 3):
                Mk = baseline.moment_operator_symmetric(ens, k)
                Nk = baseline.symmetric_subspace_dimension(D_A, k)
                eps.append(
                    round(float(math.sqrt(Nk) * np.linalg.norm(Mk - np.eye(Nk) / Nk)), 5)
                )

            frames.append(
                {
                    "x": [int(round(v * 100)) for v in bx],
                    "y": [int(round(v * 100)) for v in by],
                    "z": [int(round(v * 100)) for v in bz],
                    "w": [int(min(255, round(v * D_B * 32))) for v in full_p[show]],
                    "r": [round(float(np.real(np.trace(rho @ M))), 4) for M in (SX, SY, SZ)],
                    "e": eps,
                }
            )

        out["models"][key] = {
            "label": LABELS[key],
            "J": round(float(model.J), 5),
            "b": round(float(model.b), 5),
            "hz": float(model.hz),
            "frames": frames,
        }
    return out


def design_dataset(repo: Path) -> dict:
    sources = [
        repo / "data/disordered_kicked_aggregate.csv",
        repo / "data/disordered_large/disordered_kicked_aggregate.csv",
    ]
    cols = {
        "eps1": "delta1_rms_relative",
        "eps2": "delta2_rms_relative",
        "inh": "l1_norm_rms_relative",
        "prim": "c2_norm_rms_relative",
        "meanMoment": "norm_of_disorder_mean_d2_relative",
    }
    series: dict[int, dict] = {}
    for src in sources:
        with open(src) as handle:
            for row in csv.DictReader(handle):
                size = int(row["L"])
                entry = series.setdefault(size, {"t": [], **{k: [] for k in cols}})
                entry["t"].append(int(float(row["time"])))
                for key, name in cols.items():
                    entry[key].append(float(f"{float(row[name]):.5g}"))

    d = 4  # L_A = 2
    out = []
    for size in sorted(series):
        m = 1 << (size - 2)
        floors = {
            "eps1": math.sqrt(3 * (d + 1) / (d * m + 1)),
            "eps2": math.sqrt(9 * (d + 1) / (d * m + 1)),
            "inh": math.sqrt(25 / (4 * m + 1)),
            "prim": math.sqrt(20 / (4 * m + 1)),
        }
        entry = series[size]
        out.append(
            {
                "L": size,
                "D_B": m,
                **{k: entry[k] for k in ("t", *cols)},
                "floor": {k: float(f"{v:.5g}") for k, v in floors.items()},
            }
        )
    return {"d": d, "L_A": 2, "series": out}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--repo",
        type=Path,
        default=Path.home() / "Documents/code/deep_therm_gen",
        help="path to the deep_therm_gen checkout",
    )
    args = parser.parse_args()
    if not (args.repo / "simulations" / "baseline_exact.py").exists():
        sys.exit(f"deep_therm_gen not found at {args.repo}")

    sys.path.insert(0, str(args.repo))
    from simulations import baseline_exact as baseline  # noqa: E402

    OUT.mkdir(parents=True, exist_ok=True)
    for name, payload in (
        ("bloch.json", bloch_dataset(baseline)),
        ("design.json", design_dataset(args.repo)),
    ):
        path = OUT / name
        path.write_text(json.dumps(payload, separators=(",", ":")))
        print(f"wrote {path.relative_to(SITE)}  ({path.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()

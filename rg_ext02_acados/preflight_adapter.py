#!/usr/bin/env python3
"""RG-EXT-02 exact native acados non-scientific target preflight.

Initialization-reconciliation revision. This module remains intentionally incapable
of estimating alpha, beta, Theta, a class, p_contact, mass response, or any
Resource Geometry boundary outcome. It verifies only the exact selected source
semantics, native optimized value, actuator-bound activity, envelope derivative
convention, and agreement with the preregistered independent numerical target
before scientific condition 1.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import importlib.util
import json
import math
import os
import platform
import subprocess
import sys
from pathlib import Path

import numpy as np

SELECTED_COMMIT = "21376cb1af6b7dd45f675367272d3ba8100b26c0"
BLASFEO_SHA = "d6251233923c9b475fe894fb729fb63ab693e301"
HPIPM_SHA = "e3a56c1caddd7f12d125d84f337b9a9e5c186271"
TERA_RENDERER_SHA = "a480a64b0a2cc15d4b1e6146e986388709ac0716"
CANONICAL_EXAMPLE = "examples/acados_python/pendulum_on_cart/ocp/example_optimal_value_derivative.py"
CANONICAL_MODEL = "examples/acados_python/pendulum_on_cart/common/pendulum_model.py"
DEFAULT_UMAX = 60.0
N = 25
DT = 0.05
X0 = np.array([0.0, np.pi, 0.0, 0.0])

# Frozen before native execution from the independent CasADi/IPOPT transcription.
TARGET_J = 2677.3876672643705
TARGET_DJ = -14.360363851528746
TARGET_DHDP = 861.6218310917248
TARGET_REL_TOL = 0.005
ACTIVE_LAMBDA_TOL = 1e-8

# Immutable parent native attempt and frozen initialization-reconciliation identity.
PARENT_NATIVE_ARTIFACT_SHA256 = "c84d023af73c54c9f06923aafda70a118ea2acaf3c8cf042b2e200208c6b0279"
RECONCILIATION_PROTOCOL = {
    "center_initialization": "x_guess[n]=(1-n/N)*X0 for n=0..N; u_guess[n]=0 for n=0..N-1",
    "solve_order_u_max_N": [60.0, 59.99, 60.01],
    "center_attempts": 1,
    "minus_attempts": 1,
    "plus_attempts": 1,
    "probe_seed": "identical deep copies of the successful full native center iterate via get_flat_iterate()/set_iterate()",
    "anti_rescue": "no alternate guesses, random restarts, adaptive continuation, target-guided initialization, or parameter/solver changes",
}


class NativeSolveFailure(RuntimeError):
    def __init__(self, phase: str, u_max: float, status: int):
        self.phase = phase
        self.u_max = float(u_max)
        self.status = int(status)
        super().__init__(f"acados solve failed at phase={phase}, u_max={u_max}: status={status}")


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def git_output(repo: Path, *args: str) -> str:
    return subprocess.check_output(["git", "-C", str(repo), *args], text=True).strip()


def relative_error(observed: float, target: float) -> float:
    return abs(observed - target) / max(abs(target), 1e-12)


def scientific_boundary() -> dict:
    return {
        "alpha_estimated": False,
        "beta_estimated": False,
        "theta_estimated": False,
        "predicted_class_computed": False,
        "p_contact_predicted": False,
        "mass_response_measured": False,
        "boundary_H_observed": False,
        "boundary_K_observed": False,
        "primary_boundary_sweep_executed": False,
        "condition_1_authorized": False,
        "note": "Only the frozen non-scientific center and +/-0.01 N convention probes are authorized. No Resource Geometry scientific measurement is executed.",
    }


def load_selected_example(acados_root: Path):
    example = acados_root / CANONICAL_EXAMPLE
    common = acados_root / "examples/acados_python/pendulum_on_cart/common"
    ocp_dir = example.parent
    sys.path.insert(0, str(common))
    old = os.getcwd()
    try:
        os.chdir(ocp_dir)
        spec = importlib.util.spec_from_file_location("rg_ext02_selected_example", example)
        if spec is None or spec.loader is None:
            raise RuntimeError("Could not load selected example module")
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return mod
    finally:
        os.chdir(old)


def set_symmetric_bound(solver, u_max: float) -> None:
    lb = np.array([-float(u_max)])
    ub = np.array([+float(u_max)])
    for stage in range(N):
        solver.constraints_set(stage, "lbu", lb)
        solver.constraints_set(stage, "ubu", ub)


def initialize_center_iterate(solver) -> dict:
    """Deterministic frozen initialization using only X0 and the zero reference."""
    x_guesses = []
    for stage in range(N + 1):
        tau = stage / N
        x_guess = (1.0 - tau) * X0
        solver.set(stage, "x", x_guess)
        x_guesses.append(x_guess.tolist())
    for stage in range(N):
        solver.set(stage, "u", np.zeros(1))
    return {
        "rule": RECONCILIATION_PROTOCOL["center_initialization"],
        "x_stage_0": x_guesses[0],
        "x_stage_N": x_guesses[-1],
        "u_guess": 0.0,
        "uses_native_or_independent_solution_data": False,
    }


def solve_native(solver, u_max: float, phase: str) -> dict:
    set_symmetric_bound(solver, u_max)
    status = int(solver.solve_for_x0(X0))
    if status != 0:
        raise NativeSolveFailure(phase, u_max, status)
    cost = float(solver.get_cost())

    lower = []
    upper = []
    forces = []
    active_stages = []
    for stage in range(N):
        u = np.asarray(solver.get(stage, "u"), dtype=float).reshape(-1)
        lam = np.asarray(solver.get(stage, "lam"), dtype=float).reshape(-1)
        if len(u) != 1:
            raise RuntimeError(f"Unexpected control dimension at stage {stage}: {len(u)}")
        if lam.ndim != 1 or len(lam) % 2 != 0:
            raise RuntimeError(f"Unexpected lambda shape at stage {stage}: {lam.shape}")
        half = len(lam) // 2
        ll = float(lam[0])
        lu = float(lam[half])
        lower.append(ll)
        upper.append(lu)
        forces.append(float(u[0]))
        if ll > ACTIVE_LAMBDA_TOL or lu > ACTIVE_LAMBDA_TOL:
            active_stages.append(stage)

    lambda_sum = float(np.sum(lower) + np.sum(upper))
    return {
        "phase": phase,
        "u_max": float(u_max),
        "p": float(u_max / DEFAULT_UMAX),
        "status": status,
        "J_star": cost,
        "H_orientation_only": -cost,
        "force_trajectory": forces,
        "lambda_lower": lower,
        "lambda_upper": upper,
        "lambda_lower_sum": float(np.sum(lower)),
        "lambda_upper_sum": float(np.sum(upper)),
        "lambda_total_bound_sum": lambda_sum,
        "active_bound_stage_count": len(active_stages),
        "active_bound_stages": active_stages,
        "envelope_dJ_du_max": -lambda_sum,
        "envelope_dH_dp": DEFAULT_UMAX * lambda_sum,
    }


def write_receipt(out: Path, receipt: dict) -> None:
    (out / "ACADOS_PREFLIGHT_RECEIPT.json").write_text(json.dumps(receipt, indent=2, sort_keys=True) + "\n")


def base_receipt(commit: str, submodule_assertions: dict, semantic_assertions: dict, example_path: Path, model_path: Path, initialization: dict) -> dict:
    return {
        "artifact_type": "RG_EXT_02_ACADOS_NON_SCIENTIFIC_PREFLIGHT_RECEIPT",
        "selected_commit": commit,
        "source_clean_before_preflight": True,
        "parent_native_artifact_sha256": PARENT_NATIVE_ARTIFACT_SHA256,
        "initialization_reconciliation_protocol": RECONCILIATION_PROTOCOL,
        "center_initialization_certificate": initialization,
        "submodule_assertions": submodule_assertions,
        "canonical_example": {"path": CANONICAL_EXAMPLE, "sha256": sha256_file(example_path)},
        "canonical_model": {"path": CANONICAL_MODEL, "sha256": sha256_file(model_path)},
        "semantic_assertions": semantic_assertions,
        "runtime": {"python": sys.version, "platform": platform.platform(), "machine": platform.machine()},
        "scientific_boundary": scientific_boundary(),
    }


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--acados-root", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--epsilon", type=float, default=1e-2)
    args = ap.parse_args()

    acados_root = Path(args.acados_root).resolve()
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)

    commit = git_output(acados_root, "rev-parse", "HEAD")
    if commit != SELECTED_COMMIT:
        raise SystemExit(f"Selected source mismatch: {commit} != {SELECTED_COMMIT}")
    dirty = git_output(acados_root, "status", "--porcelain")
    if dirty:
        raise SystemExit("Selected upstream source tree is dirty before preflight")

    submodule_assertions = {
        "blasfeo": git_output(acados_root / "external/blasfeo", "rev-parse", "HEAD") == BLASFEO_SHA,
        "hpipm": git_output(acados_root / "external/hpipm", "rev-parse", "HEAD") == HPIPM_SHA,
        "tera_renderer": git_output(acados_root / "interfaces/acados_template/tera_renderer", "rev-parse", "HEAD") == TERA_RENDERER_SHA,
    }
    if not all(submodule_assertions.values()):
        raise SystemExit("Pinned submodule assertion failed: " + json.dumps(submodule_assertions, sort_keys=True))

    example_path = acados_root / CANONICAL_EXAMPLE
    model_path = acados_root / CANONICAL_MODEL
    if not example_path.is_file() or not model_path.is_file():
        raise SystemExit("Canonical selected source files missing")

    mod = load_selected_example(acados_root)
    solver = mod.setup_solver(N=N, dt=DT, u_max=DEFAULT_UMAX)
    ocp = solver.ocp
    semantic_assertions = {
        "N_horizon": int(ocp.solver_options.N_horizon) == 25,
        "tf": math.isclose(float(ocp.solver_options.tf), 1.25, rel_tol=0.0, abs_tol=1e-12),
        "qp_solver": str(ocp.solver_options.qp_solver) == "PARTIAL_CONDENSING_HPIPM",
        "hessian_approx": str(ocp.solver_options.hessian_approx) == "EXACT",
        "integrator_type": str(ocp.solver_options.integrator_type) == "IRK",
        "nlp_solver_type": str(ocp.solver_options.nlp_solver_type) == "SQP",
        "nlp_solver_max_iter": int(ocp.solver_options.nlp_solver_max_iter) == 600,
        "x0": bool(np.allclose(np.asarray(ocp.constraints.x0, dtype=float), X0, rtol=0.0, atol=1e-14)),
        "default_lbu": bool(np.allclose(np.asarray(ocp.constraints.lbu, dtype=float), [-60.0])),
        "default_ubu": bool(np.allclose(np.asarray(ocp.constraints.ubu, dtype=float), [60.0])),
    }
    if not all(semantic_assertions.values()):
        raise SystemExit("Frozen source semantics assertion failed: " + json.dumps(semantic_assertions, sort_keys=True))

    eps = float(args.epsilon)
    if not math.isclose(eps, 0.01, rel_tol=0.0, abs_tol=1e-15):
        raise SystemExit("Preflight epsilon is frozen at exactly 0.01 N")

    initialization = initialize_center_iterate(solver)
    common = base_receipt(commit, submodule_assertions, semantic_assertions, example_path, model_path, initialization)

    try:
        # Frozen reconciliation solve order: center once, then +/- probes from identical center iterate copies.
        center = solve_native(solver, DEFAULT_UMAX, "center")
        center_iterate = copy.deepcopy(solver.get_flat_iterate())

        solver.set_iterate(copy.deepcopy(center_iterate))
        minus = solve_native(solver, DEFAULT_UMAX - eps, "minus")

        solver.set_iterate(copy.deepcopy(center_iterate))
        plus = solve_native(solver, DEFAULT_UMAX + eps, "plus")
    except NativeSolveFailure as exc:
        receipt = {
            **common,
            "status": "PREFLIGHT_RECONCILIATION_REQUIRED",
            "native_solve_failure": {
                "phase": exc.phase,
                "u_max_N": exc.u_max,
                "status": exc.status,
                "attempt_count_for_phase": 1,
                "alternate_initialization_attempted": False,
                "retry_attempted": False,
            },
        }
        write_receipt(out, receipt)
        print(json.dumps({"status": receipt["status"], "failure": receipt["native_solve_failure"]}, indent=2))
        return 3

    fd_dJ_du = (plus["J_star"] - minus["J_star"]) / (2.0 * eps)
    env_dJ_du = center["envelope_dJ_du_max"]
    env_dH_dp = center["envelope_dH_dp"]
    abs_err = abs(fd_dJ_du - env_dJ_du)
    denom = max(abs(fd_dJ_du), abs(env_dJ_du), 1e-12)
    env_rel_err = abs_err / denom
    sign_match = (abs(fd_dJ_du) < 1e-10 and abs(env_dJ_du) < 1e-10) or (np.sign(fd_dJ_du) == np.sign(env_dJ_du))
    envelope_pass = bool(sign_match and (abs_err <= 5e-3 or env_rel_err <= 0.10))

    target_comparison = {
        "relative_tolerance": TARGET_REL_TOL,
        "J_star": {"target": TARGET_J, "observed": center["J_star"], "relative_error": relative_error(center["J_star"], TARGET_J)},
        "dJ_du_max": {"target": TARGET_DJ, "observed": env_dJ_du, "relative_error": relative_error(env_dJ_du, TARGET_DJ)},
        "dH_dp": {"target": TARGET_DHDP, "observed": env_dH_dp, "relative_error": relative_error(env_dH_dp, TARGET_DHDP)},
    }
    for value in target_comparison.values():
        if isinstance(value, dict) and "relative_error" in value:
            value["pass"] = bool(value["relative_error"] <= TARGET_REL_TOL)
    target_pass = all(target_comparison[key]["pass"] for key in ["J_star", "dJ_du_max", "dH_dp"])
    active_pass = bool(center["lambda_total_bound_sum"] > ACTIVE_LAMBDA_TOL and center["active_bound_stage_count"] > 0)

    compiled = []
    for base in [acados_root / "lib", acados_root / "build", Path.cwd()]:
        if base.exists():
            for path in sorted(base.rglob("*.so")):
                if path.is_file():
                    compiled.append({"path": str(path), "bytes": path.stat().st_size, "sha256": sha256_file(path)})
    compiled = list({item["path"]: item for item in compiled}.values())
    compiled_pass = bool(compiled)

    pass_all = bool(target_pass and active_pass and envelope_pass and compiled_pass)
    receipt = {
        **common,
        "status": "PREFLIGHT_PASS" if pass_all else "PREFLIGHT_RECONCILIATION_REQUIRED",
        "native_default_solve": center,
        "native_active_constraint_certificate": {
            "lambda_activity_tolerance": ACTIVE_LAMBDA_TOL,
            "active_bound_stage_count": center["active_bound_stage_count"],
            "active_bound_stages": center["active_bound_stages"],
            "lambda_total_bound_sum": center["lambda_total_bound_sum"],
            "pass": active_pass,
        },
        "independent_target_certificate": {"pass": target_pass, **target_comparison},
        "envelope_sign_certificate": {
            "epsilon_u_max_N": eps,
            "minus": minus,
            "plus": plus,
            "finite_difference_dJ_du_max": fd_dJ_du,
            "native_multiplier_prediction_dJ_du_max": env_dJ_du,
            "sign_match": bool(sign_match),
            "absolute_error": abs_err,
            "relative_error": env_rel_err,
            "pass": envelope_pass,
            "certified_convention": "dJ*/du_max = -sum_k(lambda_lower_u[k] + lambda_upper_u[k]); dH/dp = 60*sum_k(lambda_lower_u[k] + lambda_upper_u[k]), with H=-J* and p=u_max/60",
        },
        "compiled_shared_libraries": compiled,
        "compiled_artifact_gate_pass": compiled_pass,
    }
    write_receipt(out, receipt)
    print(json.dumps({
        "status": receipt["status"],
        "commit": commit,
        "J_star_default": center["J_star"],
        "fd_dJ_du_max": fd_dJ_du,
        "envelope_dJ_du_max": env_dJ_du,
        "envelope_dH_dp": env_dH_dp,
        "active_bound_stage_count": center["active_bound_stage_count"],
        "target_pass": target_pass,
        "envelope_pass": envelope_pass,
        "compiled_library_count": len(compiled),
    }, indent=2))
    return 0 if pass_all else 2


if __name__ == "__main__":
    raise SystemExit(main())

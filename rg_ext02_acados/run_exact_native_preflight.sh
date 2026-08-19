#!/usr/bin/env bash
set -euo pipefail

# Exact non-scientific RG-EXT-02 acados preflight. This script cannot authorize
# or execute condition 1. It reproduces the same frozen target gate as CI.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_ROOT="${RG_EXT02_WORK_ROOT:-${TMPDIR:-/tmp}/rg-ext-02-acados-native-target-preflight}"
ACADOS_ROOT="$WORK_ROOT/acados"
WHEELHOUSE="$WORK_ROOT/wheelhouse"
OUT_DIR="${RG_EXT02_OUT_DIR:-$ROOT_DIR/rg_ext02_acados/preflight_out}"

ACADOS_COMMIT='21376cb1af6b7dd45f675367272d3ba8100b26c0'
BLASFEO_SHA='d6251233923c9b475fe894fb729fb63ab693e301'
HPIPM_SHA='e3a56c1caddd7f12d125d84f337b9a9e5c186271'
TERA_SHA='a480a64b0a2cc15d4b1e6146e986388709ac0716'

command -v git >/dev/null
command -v cmake >/dev/null
command -v python3 >/dev/null
command -v c++ >/dev/null || command -v g++ >/dev/null

rm -rf "$WORK_ROOT"
mkdir -p "$WORK_ROOT" "$WHEELHOUSE" "$OUT_DIR"

python3 -m pip install --upgrade pip setuptools wheel
python3 -m pip download --dest "$WHEELHOUSE" \
  'numpy==2.5.1' \
  'scipy==1.18.0' \
  'casadi==3.7.2' \
  'matplotlib==3.11.1' \
  'cython==3.2.9' \
  'Deprecated==1.3.1'
python3 -m pip install --no-index --find-links "$WHEELHOUSE" \
  'numpy==2.5.1' \
  'scipy==1.18.0' \
  'casadi==3.7.2' \
  'matplotlib==3.11.1' \
  'cython==3.2.9' \
  'Deprecated==1.3.1'

git clone https://github.com/acados/acados.git "$ACADOS_ROOT"
git -C "$ACADOS_ROOT" checkout --detach "$ACADOS_COMMIT"
git -C "$ACADOS_ROOT" submodule update --init --recursive

test "$(git -C "$ACADOS_ROOT" rev-parse HEAD)" = "$ACADOS_COMMIT"
test "$(git -C "$ACADOS_ROOT/external/blasfeo" rev-parse HEAD)" = "$BLASFEO_SHA"
test "$(git -C "$ACADOS_ROOT/external/hpipm" rev-parse HEAD)" = "$HPIPM_SHA"
test "$(git -C "$ACADOS_ROOT/interfaces/acados_template/tera_renderer" rev-parse HEAD)" = "$TERA_SHA"
test -z "$(git -C "$ACADOS_ROOT" diff --name-only)"
test -z "$(git -C "$ACADOS_ROOT" diff --cached --name-only)"

cmake -S "$ACADOS_ROOT" -B "$ACADOS_ROOT/build" \
  -DCMAKE_BUILD_TYPE=Release \
  -DACADOS_INSTALL_DIR="$ACADOS_ROOT" \
  -DBUILD_SHARED_LIBS=ON \
  -DBLASFEO_TARGET=GENERIC \
  -DHPIPM_TARGET=GENERIC \
  -DACADOS_WITH_OPENMP=OFF \
  -DACADOS_SILENT=OFF
cmake --build "$ACADOS_ROOT/build" --parallel 2
cmake --install "$ACADOS_ROOT/build"
test -f "$ACADOS_ROOT/lib/libacados.so"

export ACADOS_SOURCE_DIR="$ACADOS_ROOT"
export PYTHONPATH="$ACADOS_ROOT/interfaces/acados_template${PYTHONPATH:+:$PYTHONPATH}"
export LD_LIBRARY_PATH="$ACADOS_ROOT/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
export MPLBACKEND=Agg

set +e
python3 "$ROOT_DIR/rg_ext02_acados/preflight_adapter.py" \
  --acados-root "$ACADOS_ROOT" \
  --out "$OUT_DIR" \
  --epsilon 0.01 | tee "$OUT_DIR/PREFLIGHT_STDOUT.json"
ADAPTER_RC=${PIPESTATUS[0]}
set -e

python3 "$ROOT_DIR/rg_ext02_acados/environment_lock.py" \
  --acados-root "$ACADOS_ROOT" \
  --wheelhouse "$WHEELHOUSE" \
  --out "$OUT_DIR"
find "$ACADOS_ROOT/lib" -maxdepth 1 -type f -print0 | sort -z | xargs -0 sha256sum > "$OUT_DIR/ACADOS_LIBRARY_SHA256.txt"
git -C "$ACADOS_ROOT" submodule status --recursive > "$OUT_DIR/ACADOS_SUBMODULE_LOCK.txt"
if [ -f "$ACADOS_ROOT/bin/t_renderer" ]; then
  sha256sum "$ACADOS_ROOT/bin/t_renderer" > "$OUT_DIR/TERA_RENDERER_BINARY_SHA256.txt"
fi

python3 - "$OUT_DIR" <<'PY'
from pathlib import Path
import datetime, hashlib, json, sys
out=Path(sys.argv[1])
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
rp=out/'ACADOS_PREFLIGHT_RECEIPT.json'
if not rp.exists():
    receipt={'status':'PREFLIGHT_INFRASTRUCTURE_FAILURE','scientific_boundary':{'condition_1_authorized':False}}
    rp.write_text(json.dumps(receipt,indent=2,sort_keys=True)+'\n')
else:
    receipt=json.loads(rp.read_text())
status=receipt.get('status','UNKNOWN')
sci=receipt.get('scientific_boundary',{})
prohibited=['alpha_estimated','beta_estimated','theta_estimated','predicted_class_computed','p_contact_predicted','mass_response_measured','boundary_H_observed','boundary_K_observed','primary_boundary_sweep_executed','condition_1_authorized']
if any(bool(sci.get(k,False)) for k in prohibited):
    raise SystemExit('scientific boundary violated')
content=[]
for p in sorted(out.iterdir()):
    if p.is_file() and p.name not in {'CONTENT_MANIFEST_SHA256.txt','PREFLIGHT_FREEZE_RECORD.json','PREFLIGHT_RECONCILIATION_FREEZE_RECORD.json','FINAL_MANIFEST_SHA256.txt'}:
        content.append(f'{sha(p)}  {p.name}')
(out/'CONTENT_MANIFEST_SHA256.txt').write_text('\n'.join(content)+'\n')
base={
  'artifact_type':'RG_EXT_02_ACADOS_PREFLIGHT_FREEZE_RECORD',
  'selected_candidate':'CAND-E02-002',
  'selected_commit':'21376cb1af6b7dd45f675367272d3ba8100b26c0',
  'content_manifest_sha256':sha(out/'CONTENT_MANIFEST_SHA256.txt'),
  'created_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),
  'condition_1_authorized':False,
  'alpha_estimated':False,'beta_estimated':False,'theta_estimated':False,
  'predicted_class_computed':False,'p_contact_predicted':False,
  'mass_response_measured':False,'boundary_H_observed':False,
  'boundary_K_observed':False,'primary_boundary_sweep_executed':False,
}
if status == 'PREFLIGHT_PASS':
    base['status']='NON_SCIENTIFIC_PREFLIGHT_PASS_FROZEN_STOP_BEFORE_CONDITION_1'
    freeze=out/'PREFLIGHT_FREEZE_RECORD.json'
else:
    base['status']='NON_SCIENTIFIC_PREFLIGHT_RECONCILIATION_REQUIRED_STOP_BEFORE_CONDITION_1'
    base['preflight_receipt_status']=status
    freeze=out/'PREFLIGHT_RECONCILIATION_FREEZE_RECORD.json'
freeze.write_text(json.dumps(base,indent=2,sort_keys=True)+'\n')
final=[]
for p in sorted(out.iterdir()):
    if p.is_file() and p.name!='FINAL_MANIFEST_SHA256.txt':
        final.append(f'{sha(p)}  {p.name}')
(out/'FINAL_MANIFEST_SHA256.txt').write_text('\n'.join(final)+'\n')
print(json.dumps({'freeze_status':base['status'],'content_manifest_sha256':base['content_manifest_sha256'],'freeze_record_sha256':sha(freeze),'final_manifest_sha256':sha(out/'FINAL_MANIFEST_SHA256.txt')},indent=2))
PY

if [ "$ADAPTER_RC" -ne 0 ]; then
  echo "RG-EXT-02 native preflight terminated for reconciliation; condition 1 remains unauthorized." >&2
  exit "$ADAPTER_RC"
fi

echo 'NON_SCIENTIFIC_PREFLIGHT_PASS_FROZEN_STOP_BEFORE_CONDITION_1'

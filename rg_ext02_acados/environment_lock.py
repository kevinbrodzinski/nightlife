#!/usr/bin/env python3
from __future__ import annotations
import argparse, hashlib, importlib.metadata as md, json, os, platform, subprocess, sys
from pathlib import Path


def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda: f.read(1024 * 1024), b''):
            h.update(b)
    return h.hexdigest()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--acados-root', required=True)
    ap.add_argument('--wheelhouse', required=True)
    ap.add_argument('--out', required=True)
    args = ap.parse_args()
    acados = Path(args.acados_root).resolve()
    wheelhouse = Path(args.wheelhouse).resolve()
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)

    dists = []
    for d in sorted(md.distributions(), key=lambda x: (x.metadata.get('Name', '').lower(), x.version)):
        name = d.metadata.get('Name', '')
        record = None
        for f in d.files or []:
            if str(f).endswith('.dist-info/RECORD'):
                p = Path(d.locate_file(f))
                if p.exists():
                    record = {'path': str(p), 'sha256': sha256_file(p)}
                break
        dists.append({'name': name, 'version': d.version, 'record': record})

    wheels = []
    for p in sorted(wheelhouse.glob('*')):
        if p.is_file():
            wheels.append({'name': p.name, 'bytes': p.stat().st_size, 'sha256': sha256_file(p)})

    binaries = []
    for base in [acados / 'lib', acados / 'bin', acados / 'build']:
        if base.exists():
            for p in sorted(base.rglob('*')):
                if p.is_file() and (p.suffix in {'.so', '.a'} or os.access(p, os.X_OK)):
                    binaries.append({'path': str(p.relative_to(acados)), 'bytes': p.stat().st_size, 'sha256': sha256_file(p)})

    lock = {
        'artifact_type': 'RG_EXT_02_ACADOS_ENVIRONMENT_LOCK',
        'python': sys.version,
        'platform': platform.platform(),
        'machine': platform.machine(),
        'acados_commit': subprocess.check_output(['git', '-C', str(acados), 'rev-parse', 'HEAD'], text=True).strip(),
        'submodules': subprocess.check_output(['git', '-C', str(acados), 'submodule', 'status', '--recursive'], text=True).splitlines(),
        'python_distributions': dists,
        'downloaded_distribution_artifacts': wheels,
        'compiled_acados_artifacts': binaries,
    }
    (out / 'ACADOS_ENVIRONMENT_LOCK.json').write_text(json.dumps(lock, indent=2, sort_keys=True) + '\n')
    (out / 'PIP_FREEZE.txt').write_text(subprocess.check_output([sys.executable, '-m', 'pip', 'freeze', '--all'], text=True))
    print(json.dumps({'python_distributions': len(dists), 'downloaded_artifacts': len(wheels), 'compiled_artifacts': len(binaries)}, indent=2))


if __name__ == '__main__':
    main()

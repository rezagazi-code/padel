#!/bin/bash
# Vendors the Cafe Bazaar Poolakey AAR locally so the Android build does not
# need jitpack.io (unreachable from some networks). Run after every
# `npm install` that touches @salarizadi/capacitor-cafebazaar-poolakey.
set -e
PLUGIN_DIR="$(dirname "$0")/../node_modules/@salarizadi/capacitor-cafebazaar-poolakey/android"
AAR_SRC="$(dirname "$0")/../vendor/poolakey-2.2.0.aar"

if [ ! -d "$PLUGIN_DIR" ]; then
  echo "bazaar plugin not installed; skipping"
  exit 0
fi
mkdir -p "$PLUGIN_DIR/libs"
cp "$AAR_SRC" "$PLUGIN_DIR/libs/poolakey-2.2.0.aar"

# Replace the jitpack coordinates with the vendored AAR (keep rx out: unused).
python3 - "$PLUGIN_DIR/build.gradle" <<'EOF'
import re, sys
p = sys.argv[1]
s = open(p).read()
s = s.replace("implementation 'com.github.cafebazaar.Poolakey:poolakey:2.2.0'\n", "")
s = s.replace("implementation 'com.github.cafebazaar.Poolakey:poolakey-rx:2.2.0'\n", "")
s = s.replace("implementation 'com.github.cafebazaar.Poolakey:poolakey-rx3:2.2.0'\n", "")
if "poolakey-2.2.0.aar" not in s:
    s = s.replace(
        "implementation fileTree(dir: 'libs', include: ['*.jar'])",
        "implementation fileTree(dir: 'libs', include: ['*.jar'])\n    implementation files('libs/poolakey-2.2.0.aar')"
    )
open(p, 'w').write(s)
print("patched", p)
EOF

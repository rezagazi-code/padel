#!/bin/bash
# Vendors the Cafe Bazaar Poolakey AAR locally so the Android build does not
# need jitpack.io (flaky/unreachable from some networks). Run after every
# `npm install` that touches @salarizadi/capacitor-cafebazaar-poolakey
# (wired via package.json "postinstall").
#
# Method: flatDir repository. The AAR is resolved as a normal module
# (com.github.cafebazaar.Poolakey:poolakey:2.2.0 -> libs/poolakey-2.2.0.aar),
# which — unlike implementation files('...aar') — does NOT trip AGP's
# hasLocalAarDeps check for library modules.
set -e
PLUGIN_DIR="$(dirname "$0")/../node_modules/@salarizadi/capacitor-cafebazaar-poolakey/android"
AAR_SRC="$(dirname "$0")/../vendor/poolakey-2.2.0.aar"

if [ ! -d "$PLUGIN_DIR" ]; then
  echo "bazaar plugin not installed; skipping"
  exit 0
fi
mkdir -p "$PLUGIN_DIR/libs"
cp "$AAR_SRC" "$PLUGIN_DIR/libs/poolakey-2.2.0.aar"

python3 - "$PLUGIN_DIR/build.gradle" <<'EOF'
import sys
p = sys.argv[1]
s = open(p).read()
orig = s

# 1. Drop the old files() workaround (rejected by AGP) if a previous run added it.
s = s.replace("    implementation files('libs/poolakey-2.2.0.aar')\n", "")
# 2. Drop jitpack coordinates (rx/rx3 were never used by the plugin's Java code).
s = s.replace("implementation 'com.github.cafebazaar.Poolakey:poolakey:2.2.0'\n", "")
s = s.replace("implementation 'com.github.cafebazaar.Poolakey:poolakey-rx:2.2.0'\n", "")
s = s.replace("implementation 'com.github.cafebazaar.Poolakey:poolakey-rx3:2.2.0'\n", "")
# 3. Resolve the AAR from the local flatDir instead of jitpack (no network).
if "flatDir" not in s:
    s = s.replace("    maven { url 'https://jitpack.io' }", "    flatDir { dirs 'libs' }")
# 4. Re-add the single needed coordinate (now satisfied by flatDir).
if "com.github.cafebazaar.Poolakey:poolakey:2.2.0" not in s:
    s = s.replace(
        "implementation fileTree(dir: 'libs', include: ['*.jar'])",
        "implementation fileTree(dir: 'libs', include: ['*.jar'])\n    implementation 'com.github.cafebazaar.Poolakey:poolakey:2.2.0'",
    )
if s != orig:
    open(p, 'w').write(s)
print("patched", p)
EOF

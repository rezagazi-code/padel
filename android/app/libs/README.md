# DO NOT DELETE poolakey-2.2.0.aar

This AAR is REQUIRED for the Android build. The :app module resolves
`com.github.cafebazaar.Poolakey:poolakey:2.2.0` (Cafe Bazaar billing) from
this directory via `flatDir { dirs 'libs' }` in android/app/build.gradle.

If this file is deleted, the build fails at :app:mergeReleaseNativeLibs
because Gradle tries to fetch the AAR from the Tencent mirror, which
serves a corrupt/incomplete artifact.

The AAR is also vendored at vendor/poolakey-2.2.0.aar (source of truth).
If this copy is lost, restore it with:
  cp vendor/poolakey-2.2.0.aar android/app/libs/

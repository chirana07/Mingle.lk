# Mingle.lk branding assets

The original vector logo is `frontend/public/mingle-icon.svg`; the interface wordmark is in `frontend/src/components/MingleLogo.tsx`. Two joined arches form an m, with a dot over the shared meeting point. The mark was authored for this rebrand and is not an image-generation output.

Browser, PWA, iOS and Android launcher images are deterministic rasterizations of that SVG. Android adaptive foregrounds use a centered mark at 60% of their canvas. Native package identifiers and backend field/plan identifiers remain unchanged for data compatibility.

Existing profile photos remain the repository's demo image URLs. No new profile photography was sourced. The web UI was checked at desktop and mobile widths; native binary builds and simulators were not tested.

See `DESIGN.md` for the observed palette, typography, component rules and responsive layout.

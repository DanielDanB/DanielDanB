# Lifter render

Source for the scroll indicator in `../carter-mockup.html`: a rigged 3D figure
posed through a deadlift and rendered to a 60-frame WebP sprite (10 × 6 grid,
234 × 300 px per frame), which the page embeds as `window.LIFT_SPRITE`.

The figure is Mixamo's "Y Bot" (the `Samba Dancing.fbx` from the three.js
examples). The model file is not committed; only rendered frames ship.

## Re-render

```sh
npm i three@0.170.0 playwright
cp node_modules/three/build/three.module.js .
cp -r node_modules/three/examples/jsm jsm
curl -o samba.fbx "https://raw.githubusercontent.com/mrdoob/three.js/r170/examples/models/fbx/Samba%20Dancing.fbx"
node sprite.js 60 10 300 0.78 0.82 sprite.webp
```

Then base64 the WebP into `window.LIFT_SPRITE` in the page. Poses live in
`lift.html` (`K0` setup, `K1` bar at the knee, `K2` lockout); the setup hip
depth is solved so the plates rest on the floor.

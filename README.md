# A-Frame VR `leap-hand` for Leap Motion

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/donmccurdy/aframe-leap-hands/master/LICENSE)
![Work in progress](https://img.shields.io/badge/status-experimental-orange.svg)

A-Frame VR component for Leap Motion controller.

![4d731aec-193d-463c-8189-d54c5e023206-20847-0002ac9dc2db9992](https://cloud.githubusercontent.com/assets/1848368/23005782/0909f4aa-f3cc-11e6-83f3-072b53374000.gif)

## Installation (Scripts)

In the [dist/](https://github.com/openleap/aframe-leap-hands/tree/master/dist) folder, download either the minified or unminified build. Include the scripts on your page, and all components are automatically registered for you.

Or, use a CDN-hosted version:

```html
<script src="//unpkg.com/aframe-leap-hands/dist/aframe-leap-hands.min.js"></script>
```

## Installation (NPM)

Using NPM and Browserify or Webpack:

```bash
npm install --save aframe-leap-hands
```

```javascript
require('aframe-leap-hands').registerAll();
```

## Usage

```html
<a-entity camera="near: 0.01" look-controls position="0 1.5 0">
  <a-entity leap-hand="hand: left"></a-entity>
  <a-entity leap-hand="hand: right"></a-entity>
</a-entity>
```

## Options

### `leap-hand` component:

| Property           | Default      | Description |
|--------------------|--------------|-------------|
| hand               | —            | `left` or `right` |
| enablePhysics      | false        | Adds a physics body for [aframe-physics-system](https://github.com/donmccurdy/aframe-physics-system). |
| holdDistance       | 0.2          | Holding distance, in meters. |
| holdDebounce       | 100          | Debouncing on grip, in milliseconds. |
| holdSelector       | `[holdable]` | Selector that limits which objects may be held.                |
| holdSensitivity    | 0.95         | 0—1. |
| releaseSensitivity | 0.75         | 0–1. |
| debug              | false        | Shows a grip target indicator. |

### `leap` system:

| Property   | Default   | Description |
|------------|-----------|-------------|
| vr         | true      | If true, sets default VR position and quaternion. |
| scale      | 0.001     | |
| position   | `0 0 0`   | |
| quaternion | `0 0 0 1` | |

For example, to set both hands to **desktop** configuration:

```html
<a-scene leap="vr: false">
  <a-entity leap-hand="hand: left"></a-entity>
  <a-entity leap-hand="hand: right"></a-entity>
</a-scene>
```

## References:

### Official

+ [Leap JS](https://github.com/leapmotion/leapjs)
+ [Leap JS Plugins](https://github.com/leapmotion/leapjs-plugins)
+ [Leap JS cont'd](https://developer.leapmotion.com/javascript)
+ [Leap JS Network](https://github.com/leapmotion/leapjs-network)
+ [Leap JS Widgets](https://github.com/leapmotion/leapjs-widgets)
+ [Leap JS Rigged THREE.js Hand](https://github.com/leapmotion/leapjs-rigged-hand)

### Third-party

+ THREE.LeapMotion Wrapper [discussion](https://community.leapmotion.com/t/three-js-wrapper/769) and [GitHub](https://github.com/scottbyrns/THREE.LeapMotion)

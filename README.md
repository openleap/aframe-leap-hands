# A-Frame VR `leap-hand` for Leap Motion

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/donmccurdy/aframe-leap-hands/master/LICENSE)
![Work in progress](https://img.shields.io/badge/status-experimental-orange.svg)

A-Frame VR component for Leap Motion controller.

![4d731aec-193d-463c-8189-d54c5e023206-20847-0002ac9dc2db9992](https://cloud.githubusercontent.com/assets/1848368/23005782/0909f4aa-f3cc-11e6-83f3-072b53374000.gif)


## Installation

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

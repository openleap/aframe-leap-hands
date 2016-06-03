# Leap Motion `leap-hand` Components for A-Frame VR

*(In Progress)* A-Frame VR component for Leap Motion controller.

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

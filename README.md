## Icicle Bubbles

![](https://raw.githubusercontent.com/edankwan/Icicle-Bubbles/master/app/images/screenshot.jpg)

[Live demo](http://www.edankwan.com/experiments/icicle-bubbles/) | [Video](https://www.youtube.com/watch?v=EWe-3dbFkBY)

**Icicle Bubbles** is a WebGL experience by Edan Kwan. Unlike traditional 3D metaball effect, it only blends the depth. Which means there is no transparency support but in that case there is no need to deal with the blocked mesh. For the light scattering effect, it is faked by the depth blend and the depth blur with upside/downside rendering.

For more information about the cheap metaball technique, please check out my **[blog post](http://blog.edankwan.com/post/fake-and-cheap-3d-metaball)**.

## Development and deployment
- dev: `node dev`
- deploy: `node build`

## License
This experiment is under MIT License.


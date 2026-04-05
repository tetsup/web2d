# web2d - Lightweight 2D Game Runtime for the Web

- Minimal setup: only a canvas and a game class required
- High-performance rendering via Worker + SharedArrayBuffer
- Simple, stateless rendering model for predictable behavior

## 🌐 Languages

- [English(current page)](https://github.com/tetsup/web2d/README.md)
- [日本語](https://github.com/tetsup/web2d/README.ja.md)

---

# Usage

```js
import { GameApp } from '@tetsup/web2d';

const app = new GameApp(canvas, new TestGame(), {
  maxObjects: 10,
  rectSize: { width: 320, height: 240 },
  keyAssignment,
  assignPad,
});
```

### GameApp Constructor

```ts
new GameApp(
  canvas: HTMLCanvasElement,
  game: Game,
  options?: {
    maxObjects?: number;
    rectSize?: { width: number; height: number };
    keyAssignment?: any;
    assignPad?: any;
  }
)
```

- `canvas` → Target `<canvas>` element for rendering
- `game` → Instance of a class implementing game logic
- `options` (optional)
    - `maxObjects` → Maximum number of renderable objects
    - `rectSize` → Virtual screen size (internal resolution)
    - `keyAssignment` → Keyboard input mapping
    - `assignPad` → Gamepad input configuration

## 🎮 Game Class

You only need to implement the following two methods:

```js
class MyGame {
  async onInit(renderer) {}
  async onTick(input, clock, renderer) {}
}
```

- `onInit` → Called once at initialization  
- `onTick` → Called every frame  

---

## 🎮 App Control

Start the application with:

```js
app.start();
```

You can also control the game using the following methods:

### Methods

```js
app.start();    // Start game loop and input handling
app.pause();    // Pause
app.advance(n); // Advance simulation by n milliseconds
app.destroy();  // Fully stop and release resources
```

### Details

- **start()**
  - Starts the game loop and input handling

- **pause()**
  - Stops input handling
  - Pauses the game loop

- **advance(delta)**
  - Advances the game state by `delta` milliseconds
  - Useful for debugging and deterministic simulation

- **destroy()**
  - Stops all processes
  - Terminates the Worker
  - Should be called when disposing the app

---

## 🧩 Renderer API

The `renderer` is provided as an argument to lifecycle methods.

```js
renderer.registerImage({ imageId, imageData });
renderer.render([{ pos, imageId }]);
```

### registerImage(image)

Registers an image for rendering.

```js
renderer.registerImage({
  imageId: 'player',
  imageData: bitmap,
});
```

- `imageId: string`
  - Identifier for the image
- `imageData: ImageBitmap`
  - Transferred to Worker (ownership moves)

⚠️ Notes:
- `ImageBitmap` cannot be reused after transfer
- Re-register with a new bitmap to update

---

### render(imageObjects)

Submits objects to be rendered for the current frame.

```js
renderer.render([
  {
    pos: { x: 100, y: 200 },
    imageId: 'player',
  },
]);
```

- `pos: { x: number, y: number }`
  - Position in pixels
- `imageId: string`
  - Must be registered beforehand

⚠️ Notes:
- Rendering is **stateless per frame**
- All visible objects must be sent every frame
- Internally optimized using SharedArrayBuffer

---

## 🔗 Sample Code

Full example:

👉 https://github.com/tetsup/web2d/tree/main/test-game

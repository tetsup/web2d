# web2d - Web向け軽量2Dゲームランタイム

- canvasとゲームクラスだけで動作するシンプルな構成
- Worker + SharedArrayBuffer による高性能レンダリング
- ステートレスな描画モデルで予測しやすい動作

## 🌐 言語

- [English](https://github.com/tetsup/web2d/README.md)
- [日本語(このページ)](https://github.com/tetsup/web2d/README.ja.md)

---

# 使い方

```js
import { GameApp } from '@tetsup/web2d';

const app = new GameApp(canvas, new TestGame(), {
  maxObjects: 10,
  rectSize: { width: 320, height: 240 },
  keyAssignment,
  assignPad,
});
```

## GameApp コンストラクタ

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

- `canvas` → 描画対象の `<canvas>` 要素
- `game` → ゲームロジックを実装したクラスインスタンス
- `options`（任意）
    - `maxObjects` → 同時に描画できるオブジェクト数の上限
    - `rectSize` → 仮想画面サイズ（内部解像度）
    - `keyAssignment` → キーボード入力の割り当て設定
    - `assignPad` → ゲームパッド入力設定

## 🎮 ゲームクラスについて

実装が必要なのは以下の2つだけです：

```js
class MyGame {
  async onInit(renderer) {}
  async onTick(input, clock, renderer) {}
}
```

- `onInit` → 初期化時に1回だけ呼ばれる  
- `onTick` → 毎フレーム呼ばれる  

---

## 🎮 アプリの制御

アプリは以下の1行で起動できます：

```js
app.start();
```

さらに、以下のメソッドを使うことでゲームの状態を制御できます。

### メソッド一覧

```js
app.start();    // ゲーム開始（ループ + 入力受付）
app.pause();    // 一時停止
app.advance(n); // nミリ秒分だけ進める（手動ステップ）
app.destroy();  // 完全停止 + リソース解放
```

### 詳細

- **start()**
  - ゲームループと入力処理を開始します

- **pause()**
  - 入力受付を停止
  - ゲームループを停止

- **advance(delta)**
  - `delta` ミリ秒分だけゲームを進めます
  - デバッグや検証用途に便利です

- **destroy()**
  - すべての処理を停止
  - Worker を terminate
  - アプリ破棄時に呼び出してください

---

## 🧩 Renderer API

`renderer` はライフサイクルメソッドの引数として渡されます。

```js
renderer.registerImage({ imageId, imageData });
renderer.render([{ pos, imageId }]);
```

### registerImage(image)

描画に使用する画像を登録します。

```js
renderer.registerImage({
  imageId: 'player',
  imageData: bitmap,
});
```

- `imageId: string`
  - 画像の識別子
- `imageData: ImageBitmap`
  - Worker に transfer される（所有権が移動）

⚠️ 注意:
- `ImageBitmap` は再利用できません
- 更新する場合は新しい bitmap を再登録してください

---

### render(imageObjects)

現在フレームの描画対象を送信します。

```js
renderer.render([
  {
    pos: { x: 100, y: 200 },
    imageId: 'player',
  },
]);
```

- `pos: { x: number, y: number }`
  - 描画位置（ピクセル）
- `imageId: string`
  - 事前に登録されたものを指定

⚠️ 注意:
- 描画は**フレームごとに完全指定（ステートレス）**
- 毎フレームすべてのオブジェクトを送る必要があります
- 内部では SharedArrayBuffer により最適化されています

---

## 🔗 サンプルコード

完全なサンプルはこちら：

👉 https://github.com/tetsup/web2d/tree/master/test-game

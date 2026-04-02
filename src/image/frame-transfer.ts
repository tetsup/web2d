import type { ImageBufferData } from '@/types/image';

const IMAGE_HEADER_SIZE = 2;
const IMAGE_DATA_SIZE = 8;

const readImageFromView = (view: DataView, index: number): ImageBufferData => ({
  pos: {
    x: view.getInt16(IMAGE_HEADER_SIZE + index * IMAGE_DATA_SIZE),
    y: view.getInt16(IMAGE_HEADER_SIZE + index * IMAGE_DATA_SIZE + 2),
  },
  imageIndex: view.getUint32(IMAGE_HEADER_SIZE + index * IMAGE_DATA_SIZE + 4),
});

export const readImagesFromArray = (array: Uint8Array) => {
  const view = new DataView(array.buffer);
  const length = view.getUint16(0);
  return [...Array(length)].map((_, index) => readImageFromView(view, index));
};

const writeImageToView = (image: ImageBufferData, view: DataView, index: number) => {
  view.setInt16(IMAGE_HEADER_SIZE + index * IMAGE_DATA_SIZE, image.pos.x);
  view.setInt16(IMAGE_HEADER_SIZE + index * IMAGE_DATA_SIZE + 2, image.pos.y);
  view.setUint32(IMAGE_HEADER_SIZE + index * IMAGE_DATA_SIZE + 4, image.imageIndex);
};

const writeImagesToArray = (images: ImageBufferData[], array: Uint8Array) => {
  const view = new DataView(array.buffer);
  view.setUint16(0, images.length);
  images.forEach((image, index) => {
    writeImageToView(image, view, index);
  });
};

export const createArrayFromImages = (images: ImageBufferData[]) => {
  const array = new Uint8Array(IMAGE_HEADER_SIZE + IMAGE_DATA_SIZE * images.length);
  writeImagesToArray(images, array);
  return array;
};

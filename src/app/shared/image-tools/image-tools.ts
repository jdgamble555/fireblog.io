/**
 * Generate Random ID for Image Name
 * @returns randomly generated ID
 */
export const randomID = (): string => {
  // generate image id
  return Array(16)
    .fill(0)
    .map(() => String.fromCharCode(Math.floor(Math.random() * 26) + 97))
    .join('') +
    Date.now().toString(24);
};

export interface Preview {
  blob: Blob;
  filename: string;
}

/**
 *
 * Canvas tools to resize image
 *
 */

export const blobToData = async (blob: Blob): Promise<string> => {
  return new Promise((res: any) => {
    const reader = new FileReader();
    reader.onloadend = () => res(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

export const blobToFile = (blob: Blob, fileName: string, type = 'image/jpeg'): File => {
  return new File([blob], fileName, { type });
};

export const drawImageScaled = (img: HTMLImageElement, ctx: CanvasRenderingContext2D): void => {
  const canvas = ctx.canvas;
  const hRatio = canvas.width / img.width;
  const vRatio = canvas.height / img.height;
  const ratio = Math.max(hRatio, vRatio);
  const centerShift_x = (canvas.width - img.width * ratio) / 2;
  const centerShift_y = (canvas.height - img.height * ratio) / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, img.width, img.height,
    centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
};

export const scaleImage = async (doc: any, src: any, type = 'image/jpeg', newX?: number, newY?: number): Promise<Blob> => {
  return new Promise((res: any, rej: any) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const elem = doc.createElement('canvas');
      if (newX) {
        elem.width = newX;
      }
      if (newY) {
        elem.height = newY;
      }
      const ctx = elem.getContext('2d') as CanvasRenderingContext2D;
      drawImageScaled(img, ctx);
      ctx.canvas.toBlob(res, type, 1);
    }
    img.onerror = error => rej(error);
  });
};

/**
* Gets an image blob before upload
* @param event - file event
* @returns - string blob of image
*/
export const previewImage = async (doc: any, event: Event,): Promise<Preview | undefined> => {

  // add event to image service
  const target = event.target as HTMLInputElement;

  if (target.files?.length) {

    // view file before upload
    const file = target.files[0];
    const filename = file.name;

    // get image preview
    const image = await blobToData(file);

    // return resized version
    const blob = await scaleImage(doc, image, undefined, 800, 418);
    return { filename, blob };
  }
  return;
}

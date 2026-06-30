let heldImage: File | null = null;

const setHeldImage = (file: File | null) => {
  heldImage = file;
};

const getHeldImage = (): File | null => heldImage;

const clearHeldImage = () => {
  heldImage = null;
};

export { setHeldImage, getHeldImage, clearHeldImage };
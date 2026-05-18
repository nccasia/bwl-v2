export const splitFileName = (fileName: string): { originalName: string; fileExt: string } => {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return { originalName: fileName, fileExt: '' };
  return {
    originalName: fileName.substring(0, lastDot),
    fileExt: fileName.substring(lastDot + 1),
  };
};

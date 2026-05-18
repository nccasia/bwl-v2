export function isSameId(id1: string | number | undefined | null, id2: string | number | undefined | null): boolean {
  if (id1 === undefined || id1 === null || id2 === undefined || id2 === null) {
    return false;
  }
  
  return String(id1).trim().toLowerCase() === String(id2).trim().toLowerCase();
}

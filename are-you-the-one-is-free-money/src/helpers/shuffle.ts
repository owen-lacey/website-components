export function shuffle(array: any[]): any[] {
  // Make a shallow copy of the array to avoid modifying the original
  const shuffled = array.slice();

  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generate a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements at positions i and j
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
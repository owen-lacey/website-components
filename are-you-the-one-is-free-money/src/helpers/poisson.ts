/**
 * Calculates the Poisson probability mass function (PMF) for a given k and lambda.
 * PMF(k; lambda) = e^(-lambda) * lambda^k / k!
 */
export function poissonPMF(k: number, lambda: number): number {
  if (k < 0) return 0;
  let fact = 1;
  for (let i = 2; i <= k; i++) {
    fact *= i;
  }
  return Math.exp(-lambda) * Math.pow(lambda, k) / fact;
}
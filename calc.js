

export function calculateABTestPlan({
    // === INPUTS ===
    businessCycleDays = 7,
    power = 0.8,
    confidence = 0.95,
    visitorsPerDay,
    visitorsPerWeek,
    visitorsPerMonth,
    visitorsPer2Months,
    baselineCR,
    numVariants = 2,
    bonferroni = true,
    mde,


  } = {}) {
  
    // === INTERMEDIATE VARIABLES ===
    let daysPer1Cycle = businessCycleDays;
    let daysPer2Cycles = businessCycleDays * 2;
    let daysPer3Cycles = businessCycleDays * 3;
    let daysPer4Cycles = businessCycleDays * 4;

    let alpha = calulateAlpha(confidence);
    let alphaPrime = calulateAlphaPrime(alpha, numVariants, bonferroni);
    let anchor1 = 1;
    let anchor2 = 7;
    let anchor3 = 30;
    let anchor4 = 60;

    let usersPer1Cycle = getUsersPerNCycles(daysPer1Cycle, anchor1, anchor2, anchor3, anchor4, visitorsPerDay, visitorsPerWeek, visitorsPerMonth, visitorsPer2Months);
    let usersPer2Cycles = getUsersPerNCycles(daysPer2Cycles, anchor1, anchor2, anchor3, anchor4, visitorsPerDay, visitorsPerWeek, visitorsPerMonth, visitorsPer2Months);
    let usersPer3Cycles = getUsersPerNCycles(daysPer3Cycles, anchor1, anchor2, anchor3, anchor4, visitorsPerDay, visitorsPerWeek, visitorsPerMonth, visitorsPer2Months);
    let usersPer4Cycles = getUsersPerNCycles(daysPer4Cycles, anchor1, anchor2, anchor3, anchor4, visitorsPerDay, visitorsPerWeek, visitorsPerMonth, visitorsPer2Months);    

    let usersRequired = calculateUsersRequired(numVariants, alphaPrime, power, baselineCR, mde);
    let statsigDay = computeStatsigDay({anchor1, anchor2, anchor3, anchor4, visitorsPerDay, visitorsPerWeek, visitorsPerMonth, visitorsPer2Months, usersRequired});

    const statsigFirstCycle = statsigDay <= businessCycleDays;
    
    const cyclesNeeded = Math.ceil(statsigDay / businessCycleDays);

    const daysInCyclesNeeded = cyclesNeeded * businessCycleDays;

    const usersInDaysNeeded = calculateUsersInDaysNeeded({daysPer1Cycle, daysPer2Cycles, daysPer3Cycles, daysPer4Cycles, anchor1, anchor2, anchor3, anchor4, visitorsPerDay, visitorsPerWeek, visitorsPerMonth, visitorsPer2Months, usersRequired, daysInCyclesNeeded});

    const targetPct = usersRequired / usersInDaysNeeded;

    const lowerMdePossible = calculateLowerMdePossible(power, baselineCR, numVariants, alphaPrime, usersInDaysNeeded);
    const MdeFor1Cycle = calculateLowerMdePossible(power, baselineCR, numVariants, alphaPrime, usersPer1Cycle);
    const MdeFor2Cycles = calculateLowerMdePossible(power, baselineCR, numVariants, alphaPrime, usersPer2Cycles);
    const MdeFor3Cycles = calculateLowerMdePossible(power, baselineCR, numVariants, alphaPrime, usersPer3Cycles);
    const MdeFor4Cycles = calculateLowerMdePossible(power, baselineCR, numVariants, alphaPrime, usersPer4Cycles);
    const baselineCRFor1Cycle = calculateNewBaselineCr(numVariants, alphaPrime, power, mde, usersPer1Cycle);
    const baselineCRFor2Cycles = calculateNewBaselineCr(numVariants, alphaPrime, power, mde, usersPer2Cycles);
    const baselineCRFor3Cycles = calculateNewBaselineCr(numVariants, alphaPrime, power, mde, usersPer3Cycles);
    const baselineCRFor4Cycles = calculateNewBaselineCr(numVariants, alphaPrime, power, mde, usersPer4Cycles);


function getUsersPerNCycles(
    days,
    anchor1, anchor2, anchor3, anchor4,
    visitorsPerDay, visitorsPerWeek, visitorsPerMonth, visitorsPer2Months
  ) {
    const x = days;
  
    const anchors = [anchor1, anchor2, anchor3, anchor4];         
    const values  = [visitorsPerDay, visitorsPerWeek,              
                     visitorsPerMonth, visitorsPer2Months];
  
    let users;
  
    // Case 1: x <= anchor1  → scale proportionally from first point
    if (x <= anchors[0]) {
      users = values[0] * (x / anchors[0]);
      return users;
    }
  
    // Case 2: anchor1 < x <= anchor4 → interpolate between surrounding anchors
    if (x <= anchors[3]) {
      // Find i such that anchors[i] <= x <= anchors[i+1]
      let i = 0;
      for (let k = 0; k < anchors.length - 1; k++) {
        if (x >= anchors[k] && x <= anchors[k + 1]) {
          i = k;
          break;
        }
      }
      const x0 = anchors[i],     y0 = values[i];
      const x1 = anchors[i + 1], y1 = values[i + 1];
      users = y0 + (y1 - y0) * ((x - x0) / (x1 - x0));
      return users;
    }
  
    // Case 3: x > anchor4 → extrapolate using last two points (anchor3..anchor4)
    {
      const x0 = anchors[2], y0 = values[2];
      const x1 = anchors[3], y1 = values[3];
      const slope = (y1 - y0) / (x1 - x0);
      users = y1 + (x - x1) * slope;
      return users;
    }
  }
  
function calulateAlpha(confidence) {
    return 1 - confidence;
}

function calulateAlphaPrime(alpha, numVariants, bonferroni) {
    if (bonferroni) {
        return alpha / (numVariants - 1);
    }
    return alpha;
}

function calculateUsersRequired(
    numVariants,
    alphaPrime,
    power,
    baselineCR,
    mdeRel,
    twoSided = true,
  ) {
    // ---- input checks ----
    if (!Number.isInteger(numVariants) || numVariants < 2) {
      throw new Error("numVariants must be an integer >= 2 (includes control).");
    }
    if (!(alphaPrime > 0 && alphaPrime < 1)) {
      throw new Error("alphaPrime must be between 0 and 1.");
    }
    if (!(power > 0 && power < 1)) {
      throw new Error("power must be between 0 and 1.");
    }
    if (!(baselineCR > 0 && baselineCR < 1)) {
      throw new Error("baselineCR must be between 0 and 1.");
    }
    if (!(mdeRel > 0)) {
      throw new Error("mdeRel must be > 0 (e.g., 0.2 for +20%).");
    }
  
    // Accept 20 as 20% -> 0.20
    const rel = mdeRel > 1 ? mdeRel / 100 : mdeRel;
  
    const p1 = baselineCR;
    const p2 = p1 * (1 + rel); // relative lift
    if (p2 <= 0 || p2 >= 1) {
      throw new Error("baselineCR * (1 + mdeRel) must lie strictly between 0 and 1.");
    }
  
    // ---- z quantiles ----
    const alphaTail = twoSided ? alphaPrime / 2 : alphaPrime;
    const zAlpha = normInv(1 - alphaTail);
    const zPower = normInv(power);
  
    // ---- sample size per group (equal n) ----
    // n_per_group = [ z_{1-α/2} * sqrt(2 * p̄(1-p̄)) + z_{power} * sqrt(p1(1-p1) + p2(1-p2)) ]^2 / (p2 - p1)^2
    const pBar = (p1 + p2) / 2;
    const term1 = zAlpha * Math.sqrt(2 * pBar * (1 - pBar));
    const term2 = zPower * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
    const delta = p2 - p1;
  
    const nPerVariant = Math.pow(term1 + term2, 2) / (delta * delta);
  
    // Integer per variant, times number of variants
    const total = Math.ceil(nPerVariant) * numVariants;
    return total;
  
    // ---- helpers ----
  
    // Acklam's inverse normal CDF approximation
    function normInv(p) {
      if (!(p > 0 && p < 1)) throw new Error("normInv requires 0 < p < 1.");
      const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687,
                 138.3577518672690, -30.66479806614716, 2.506628277459239];
      const b = [-54.47609879822406, 161.5858368580409, -155.6989798598866,
                 66.80131188771972, -13.28068155288572];
      const c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838,
                 -2.549732539343734, 4.374664141464968, 2.938163982698783];
      const d = [0.007784695709041462, 0.3224671290700398, 2.445134137142996,
                 3.754408661907416];
      const plow = 0.02425;
      const phigh = 1 - plow;
      let q, r;
      if (p < plow) {
        q = Math.sqrt(-2 * Math.log(p));
        return (((((c[0]*q + c[1])*q + c[2])*q + c[3])*q + c[4])*q + c[5]) /
               ((((d[0]*q + d[1])*q + d[2])*q + d[3])*q + 1);
      } else if (p > phigh) {
        q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c[0]*q + c[1])*q + c[2])*q + c[3])*q + c[4])*q + c[5]) /
                 ((((d[0]*q + d[1])*q + d[2])*q + d[3])*q + 1);
      } else {
        q = p - 0.5; r = q * q;
        return (((((a[0]*r + a[1])*r + a[2])*r + a[3])*r + a[4])*r + a[5]) * q /
               (((((b[0]*r + b[1])*r + b[2])*r + b[3])*r + b[4])*r + 1);
      }
    }
  }

function computeStatsigDay({
    anchor1,
    anchor2,
    anchor3,
    anchor4,
    visitorsPerDay,
    visitorsPerWeek,
    visitorsPerMonth,
    visitorsPer2Months,
    usersRequired,
  }) {
    const anchors = [anchor1, anchor2, anchor3, anchor4];
    const thresholds = [visitorsPerDay, visitorsPerWeek, visitorsPerMonth, visitorsPer2Months];
    // Helper: linear interpolation between (x1,y1) and (x2,y2) at x
    const lerp = (x, x1, y1, x2, y2) => {
      if (x2 === x1) return y1; // avoid divide-by-zero; treat as flat
      const t = (x - x1) / (x2 - x1);
      return y1 + (y2 - y1) * t;
    };
  
    let statsigDay;
  
    if (usersRequired < thresholds[0]) {
      // Below the first threshold: scale proportionally from the first anchor
      statsigDay = anchors[0] * (usersRequired / thresholds[0]);
    } else if (usersRequired <= thresholds[2]) {
      // Between visitorsPerDay and visitorsPerMonth (inclusive): interpolate within the matching segment
      // Find the lower bucket index i in {0,1,2} such that thresholds[i] <= usersRequired
      let i = 0;
      if (usersRequired >= thresholds[1]) i = 1;
      if (usersRequired >= thresholds[2]) i = 2;
      statsigDay = lerp(
        usersRequired,
        thresholds[i], anchors[i],
        thresholds[i + 1], anchors[i + 1]
      );
    } else {
      // Above visitorsPerMonth: interpolate/extrapolate along the last segment using (month, 2 months)
      statsigDay = anchor4 + (usersRequired - visitorsPer2Months) *
        ((anchor4 - anchor3) / (visitorsPer2Months - visitorsPerMonth));
    }
  
    return Math.ceil(statsigDay);
}

function calculateUsersInDaysNeeded({
    // Provided variables (only some are used by the logic)
    daysPer1Cycle,
    daysPer2Cycles,
    daysPer3Cycles,
    daysPer4Cycles,
    anchor1,
    anchor2,
    anchor3,
    anchor4,
    visitorsPerDay,
    visitorsPerWeek,
    visitorsPerMonth,
    visitorsPer2Months,
    usersRequired,
    daysInCyclesNeeded,
  }) {
    const x = daysInCyclesNeeded;
  
    const anchors = [anchor1, anchor2, anchor3, anchor4];
    const values  = [visitorsPerDay, visitorsPerWeek, visitorsPerMonth, visitorsPer2Months];
  
    let statsigDay;
  
    if (x <= anchors[0]) {
      // Scale proportionally in the first segment
      statsigDay = values[0] * (x / anchors[0]);
    } else if (x <= anchors[3]) {
      // Find the lower index i such that anchors[i] <= x <= anchors[i+1]
      let i = 0;
      if (x > anchors[1]) i = 1;
      if (x > anchors[2]) i = 2;
  
      const x0 = anchors[i];
      const x1 = anchors[i + 1];
      const y0 = values[i];
      const y1 = values[i + 1];
  
      // Linear interpolation between (x0, y0) and (x1, y1)
      statsigDay = y0 + (y1 - y0) * ((x - x0) / (x1 - x0));
    } else {
      // Linear extrapolation using the last segment (anchor3 -> anchor4)
      statsigDay =
        visitorsPer2Months +
        (x - anchor4) * ((visitorsPer2Months - visitorsPerMonth) / (anchor4 - anchor3));
    }
  
    return statsigDay;
  }
    
  function calculateLowerMdePossible(power, baselineCR, numVariants, alphaPrime, totalUsers) {
    // ---- Basic validation
    if (!Number.isFinite(numVariants) || numVariants < 2) {
      throw new Error("numVariants must be a number >= 2.");
    }
    if (!(alphaPrime > 0 && alphaPrime < 1)) {
      throw new Error("alphaPrime must be in (0,1).");
    }
    if (!(power > 0 && power < 1)) {
      throw new Error("power must be in (0,1).");
    }
    if (!(baselineCR > 0 && baselineCR < 1)) {
      throw new Error("baselineCR must be in (0,1).");
    }
    if (!Number.isFinite(totalUsers) || totalUsers <= 0) {
      throw new Error("totalUsers must be a positive number.");
    }
  
    // ---- Users per arm (even split across all variants, incl. control)
    const nPerArm = totalUsers / numVariants;
  
    // ---- Z quantiles (two-sided test)
    const zAlpha = zQuantile(1 - alphaPrime / 2);
    const zPower = zQuantile(power);
  
    // ---- Binary search for the smallest relative lift (deltaRel)
    // We search over deltaRel in [lo, hi], where p2 = p1 * (1 + deltaRel) must stay < 1.
    const p1 = baselineCR;
    const eps = 1e-7;
  
    let lo = eps;
    let hi = Math.min(5, (1 - p1) / p1 - eps); // keep p2 < 1; cap at 500% lift
    let best = hi;
  
    for (let iter = 0; iter < 80; iter++) { // plenty for convergence
      const mid = 0.5 * (lo + hi);
      const p2 = p1 * (1 + mid);
  
      // Guard if p2 drifts to invalid due to numeric issues
      if (!(p2 > 0 && p2 < 1)) {
        // Too high; reduce hi
        hi = mid;
        continue;
      }
  
      // Conventional two-sample proportion test sample size formula (per arm):
      // n = [ z_{1-α/2} * sqrt(2 * p̄ * (1 - p̄)) + z_{1-β} * sqrt(p1(1-p1) + p2(1-p2)) ]^2 / (p2 - p1)^2
      const pbar = 0.5 * (p1 + p2);
      const num =
        zAlpha * Math.sqrt(2 * pbar * (1 - pbar)) +
        zPower * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2));
      const denom = Math.abs(p2 - p1);
      const nRequiredPerArm = (num * num) / (denom * denom);
  
      // If required n per arm is <= available n per arm, this delta is achievable; try smaller
      if (nRequiredPerArm <= nPerArm) {
        best = mid;
        hi = mid;
      } else {
        lo = mid;
      }
    }
  
    return best;
  
    // ---------- Helpers ----------
    // Accurate inverse standard normal CDF (Acklam's algorithm).
    function zQuantile(p) {
      if (!(p > 0 && p < 1)) {
        if (p === 0) return -Infinity;
        if (p === 1) return Infinity;
        throw new Error("Quantile input p must be in (0,1).");
      }
  
      // Coefficients for Acklam approximation
      const a = [
        -3.969683028665376e+01,
         2.209460984245205e+02,
        -2.759285104469687e+02,
         1.383577518672690e+02,
        -3.066479806614716e+01,
         2.506628277459239e+00
      ];
      const b = [
        -5.447609879822406e+01,
         1.615858368580409e+02,
        -1.556989798598866e+02,
         6.680131188771972e+01,
        -1.328068155288572e+01
      ];
      const c = [
        -7.784894002430293e-03,
        -3.223964580411365e-01,
        -2.400758277161838e+00,
        -2.549732539343734e+00,
         4.374664141464968e+00,
         2.938163982698783e+00
      ];
      const d = [
         7.784695709041462e-03,
         3.224671290700398e-01,
         2.445134137142996e+00,
         3.754408661907416e+00
      ];
  
      // Define break-points.
      const plow  = 0.02425;
      const phigh = 1 - plow;
  
      let q, r;
      if (p < plow) {
        // Rational approximation for lower region
        q = Math.sqrt(-2 * Math.log(p));
        return (((((c[0]*q + c[1])*q + c[2])*q + c[3])*q + c[4])*q + c[5]) /
               ((((d[0]*q + d[1])*q + d[2])*q + d[3])*q + 1);
      } else if (p > phigh) {
        // Rational approximation for upper region
        q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c[0]*q + c[1])*q + c[2])*q + c[3])*q + c[4])*q + c[5]) /
                 ((((d[0]*q + d[1])*q + d[2])*q + d[3])*q + 1);
      } else {
        // Rational approximation for central region
        q = p - 0.5;
        r = q * q;
        return (((((a[0]*r + a[1])*r + a[2])*r + a[3])*r + a[4])*r + a[5]) * q /
               (((((b[0]*r + b[1])*r + b[2])*r + b[3])*r + b[4])*r + 1);
      }
    }
  }
  

function normSInv(p) {
    if (p <= 0 || p >= 1 || Number.isNaN(p)) return NaN;
  
    // Coefficients in rational approximations
    const a = [
      -3.969683028665376e+01,
       2.209460984245205e+02,
      -2.759285104469687e+02,
       1.383577518672690e+02,
      -3.066479806614716e+01,
       2.506628277459239e+00
    ];
    const b = [
      -5.447609879822406e+01,
       1.615858368580409e+02,
      -1.556989798598866e+02,
       6.680131188771972e+01,
      -1.328068155288572e+01
    ];
    const c = [
      -7.784894002430293e-03,
      -3.223964580411365e-01,
      -2.400758277161838e+00,
      -2.549732539343734e+00,
       4.374664141464968e+00,
       2.938163982698783e+00
    ];
    const d = [
       7.784695709041462e-03,
       3.224671290700398e-01,
       2.445134137142996e+00,
       3.754408661907416e+00
    ];
  
    // Define break-points
    const plow  = 0.02425;
    const phigh = 1 - plow;
  
    let q, r, x;
  
    if (p < plow) {
      // Rational approximation for lower region
      q = Math.sqrt(-2 * Math.log(p));
      x = (((((c[0]*q + c[1])*q + c[2])*q + c[3])*q + c[4])*q + c[5]) /
          ((((d[0]*q + d[1])*q + d[2])*q + d[3])*q + 1);
    } else if (p > phigh) {
      // Rational approximation for upper region
      q = Math.sqrt(-2 * Math.log(1 - p));
      x = -(((((c[0]*q + c[1])*q + c[2])*q + c[3])*q + c[4])*q + c[5]) /
            ((((d[0]*q + d[1])*q + d[2])*q + d[3])*q + 1);
    } else {
      // Rational approximation for central region
      q = p - 0.5;
      r = q * q;
      x = (((((a[0]*r + a[1])*r + a[2])*r + a[3])*r + a[4])*r + a[5]) * q /
          (((((b[0]*r + b[1])*r + b[2])*r + b[3])*r + b[4])*r + 1);
    }
  
    // One-step Halley refinement for extra accuracy
    const e = 0.5 * (1 + erf(x / Math.SQRT2)) - p; // CDF(x) - p
    const u = e * Math.sqrt(2 * Math.PI) * Math.exp(0.5 * x * x); // f(x) = pdf(x)
    x = x - u / (1 + x * u / 2);
  
    return x;
  
    function erf(x) {
      // Abramowitz & Stegun formula 7.1.26
      const sign = Math.sign(x);
      x = Math.abs(x);
  
      const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741,
            a4 = -1.453152027, a5 = 1.061405429, p0 = 0.3275911;
  
      const t = 1 / (1 + p0 * x);
      const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x*x);
      return sign * y;
    }
  }
const SQRT2PI = Math.sqrt(2 * Math.PI); 
  // Convenience to avoid repetition
  function zSum(alphaPrime, power) {
    return normSInv(1 - alphaPrime / 2) + normSInv(power);
  }
  
  //  new Baseline CR 
  function calculateNewBaselineCr(numVariants, alphaPrime, power, mde, totalUsers) {
    // Standard Normal CDF inverse (quantile function)
    function qnorm(p) {
      // Approximation of probit function (Acklam’s algorithm)
      const a = [
        -39.6968302866538, 220.946098424521, -275.928510446969,
        138.357751867269, -30.6647980661472, 2.50662827745924
      ];
      const b = [
        -54.4760987982241, 161.585836858041, -155.698979859887,
        66.8013118877197, -13.2806815528857
      ];
      const c = [
        -0.00778489400243029, -0.322396458041136, -2.40075827716184,
        -2.54973253934373, 4.37466414146497, 2.93816398269878
      ];
      const d = [
        0.00778469570904146, 0.32246712907004, 2.445134137143,
        3.75440866190742
      ];
  
      const plow = 0.02425;
      const phigh = 1 - plow;
  
      let q, r;
      if (p < plow) {
        q = Math.sqrt(-2 * Math.log(p));
        return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
               ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
      } else if (phigh < p) {
        q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
                ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
      } else {
        q = p - 0.5;
        r = q * q;
        return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
               (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
      }
    }
  
    // Split total users evenly across arms
    const nPerArm = totalUsers / numVariants;
  
    // Z-scores for significance and power
    const zAlpha = qnorm(1 - alphaPrime / 2);
    const zBeta = qnorm(power);
  
    // Now solve iteratively for baseline p
    let p = 0.01; // starting guess
    let step = 0.01;
  
    for (let i = 0; i < 10000; i++) {
      const pVar = p * (1 - p);
      const diff = p * mde;
      const se = Math.sqrt(2 * pVar / nPerArm);
      const detectable = (zAlpha + zBeta) * se;
  
      if (detectable < diff) break;
  
      p += step;
      if (p >= 1) return NaN; // not achievable
    }
  
    return p;
  }
  
  
 

  
    // === RETURN OUTPUTS ===
    return {
        usersRequired,
        statsigDay,
        statsigFirstCycle, //boolean
        cyclesNeeded, //number
        daysInCyclesNeeded,
        usersInDaysNeeded,
        targetPct,
        lowerMdePossible,
        MdeFor1Cycle,
        MdeFor2Cycles,
        MdeFor3Cycles,
        MdeFor4Cycles,
        baselineCRFor1Cycle,
        baselineCRFor2Cycles,
        baselineCRFor3Cycles,
        baselineCRFor4Cycles
    };
  }
  


  calculateABTestPlan({
    businessCycleDays: 7,
    power: 0.8,
    confidence: 0.95,
    visitorsPerDay: 5000,
    visitorsPerWeek: 25000,
    visitorsPerMonth: 75000,
    visitorsPer2Months: 150000,
    baselineCR: 0.06,
    numVariants: 2,
    bonferroni: true,
    mde: 0.05
});


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

function calculateUsersRequired(numVariants, alphaPrime, power, baselineCR, mde) {

    return numVariants*((((p=>{if(p<=0||p>=1)throw new Error("p in (0,1)");const a1=-39.6968302866538,a2=220.946098424521,a3=-275.928510446969,a4=138.357751867269,a5=-30.6647980661472,a6=2.50662827745924,b1=-54.4760987982241,b2=161.585836858041,b3=-155.698979859887,b4=66.8013118877197,b5=-13.2806815528857,c1=-0.00778489400243029,c2=-0.322396458041136,c3=-2.40075827716184,c4=-2.54973253934373,c5=4.37466414146497,c6=2.93816398269878,d1=0.00778469570904146,d2=0.32246712907004,d3=2.445134137143,d4=3.75440866190742,pL=0.02425,pH=1-pL;let q,r,x;return p<pL?(q=Math.sqrt(-2*Math.log(p)),x=(((((c1*q+c2)*q+c3)*q+c4)*q+c5)*q+c6)/((((d1*q+d2)*q+d3)*q+d4)*q+1),-x):p<=pH?(q=p-0.5,r=q*q,(((((a1*r+a2)*r+a3)*r+a4)*r+a5)*r+a6)*q/(((((b1*r+b2)*r+b3)*r+b4)*r+b5)*r+1)):(q=Math.sqrt(-2*Math.log(1-p)),(((((c1*q+c2)*q+c3)*q+c4)*q+c5)*q+c6)/((((d1*q+d2)*q+d3)*q+d4)*q+1))}))(1-alphaPrime/2)+((p=>{if(p<=0||p>=1)throw new Error("p in (0,1)");const a1=-39.6968302866538,a2=220.946098424521,a3=-275.928510446969,a4=138.357751867269,a5=-30.6647980661472,a6=2.50662827745924,b1=-54.4760987982241,b2=161.585836858041,b3=-155.698979859887,b4=66.8013118877197,b5=-13.2806815528857,c1=-0.00778489400243029,c2=-0.322396458041136,c3=-2.40075827716184,c4=-2.54973253934373,c5=4.37466414146497,c6=2.93816398269878,d1=0.00778469570904146,d2=0.32246712907004,d3=2.445134137143,d4=3.75440866190742,pL=0.02425,pH=1-pL;let q,r,x;return p<pL?(q=Math.sqrt(-2*Math.log(p)),x=(((((c1*q+c2)*q+c3)*q+c4)*q+c5)*q+c6)/((((d1*q+d2)*q+d3)*q+d4)*q+1),-x):p<=pH?(q=p-0.5,r=q*q,(((((a1*r+a2)*r+a3)*r+a4)*r+a5)*r+a6)*q/(((((b1*r+b2)*r+b3)*r+b4)*r+b5)*r+1)):(q=Math.sqrt(-2*Math.log(1-p)),(((((c1*q+c2)*q+c3)*q+c4)*q+c5)*q+c6)/((((d1*q+d2)*q+d3)*q+d4)*q+1))}))(power))**2*baselineCR*(1-baselineCR))/((baselineCR*mde)**2);

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
    
  function calculateLowerMdePossible(power, baselineCR, numVariants, alphaPrime, users) {
    // Inverse CDF for standard normal (Acklam's approximation) — scoped inside this one function
    function normSInv(p) {
      if (p <= 0 || p >= 1 || Number.isNaN(p)) {
        throw new RangeError("normSInv requires 0 < p < 1");
      }
      const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
                 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
      const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
                 6.680131188771972e+01, -1.328068155288572e+01];
      const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
                 -2.549732539343734e+00,  4.374664141464968e+00,  2.938163982698783e+00];
      const d = [ 7.784695709041462e-03,  3.224671290700398e-01,  2.445134137142996e+00,
                  3.754408661907416e+00];
      const plow = 0.02425, phigh = 1 - plow;
      let q, r;
      if (p < plow) {
        q = Math.sqrt(-2 * Math.log(p));
        return ((((c[0]*q + c[1])*q + c[2])*q + c[3])*q + c[4])*q + c[5] /
               ((((d[0]*q + d[1])*q + d[2])*q + d[3])*q + 1);
      }
      if (p > phigh) {
        q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c[0]*q + c[1])*q + c[2])*q + c[3])*q + c[4])*q + c[5] /
                 ((((d[0]*q + d[1])*q + d[2])*q + d[3])*q + 1));
      }
      q = p - 0.5;
      r = q * q;
      return (((((a[0]*r + a[1])*r + a[2])*r + a[3])*r + a[4])*r + a[5]) * q /
             (((((b[0]*r + b[1])*r + b[2])*r + b[3])*r + b[4])*r + 1);
    }
  
    // Basic validations

  
    const zAlphaOver2 = normSInv(1 - alphaPrime / 2);
    const zPower = normSInv(power);
  
    const varianceTerm = baselineCR * (1 - baselineCR);
    const allocationFactor = (2 * (numVariants - 1)) / users;
  
    const lowerMdePossible = ((zAlphaOver2 + zPower) * Math.sqrt(varianceTerm * allocationFactor)) / baselineCR;
    return lowerMdePossible;
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
  function calculateNewBaselineCr(numVariants, alphaPrime, power, mde, users) {
    const z = zSum(alphaPrime, power);
    const num = numVariants * (z * z);
    const den = (mde * mde) * (users / (numVariants - 1)) + numVariants * (z * z);
    return num / den;
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
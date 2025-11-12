function getProblem(value, name) {
  const problem = null;
  const why = null;
  if (type(value) != number || Number.isNaN(value)) {
    problem = TypeError;
    why = `not a number, but a ${type(value)}`;
  } else if (value < 0) {
    problem = RangeError;
    why = "below 0";
  } else if (value > 1.0) {
    problem = RangeError;
    why = "above 1.0";
  }
  if(problemType) {
    return {
      problem: problem,
      why: `${name} is ${why} (must be a a number and 0 <= ${name} <= 1.0)`
    }
  }
  return null;
}



const noaFastColors = {
    lerp : function lerp(t, a, b) { return a + (b - a) * t }
};

const validation = {};
noaFastColors.validation = validation;

const fmtNameValue = function(name, value) {
    return (name)
        ? `${name}=${value}`
        : `${value}`;
}

validation.fmtNameValue = fmtNameValue;

const notNumber = function(value, name = undefined) {
    if (
        ((typeof value) != 'number')
        || Number.isNaN(value)
    ) {
        return {
            kind : TypeError,
            reason : `${fmtNameValue(name, value)} is not a number`
        } 
    } else {
        return null;
    }
}
validation.notNumber = notNumber;

const notAtLeast = function(value, atLeast, name=undefined) {
    let problem = null;
    if(! (atLeast <= value)) {
        problem = {
            kind : RangeError,
            reason : `${value} < ${fmtNameValue(name,value)}`
        }
    }
    return problem;
}
validation.notAtLeast = notAtLeast;

const notAtMost = function(value, atMost, name=undefined) {
    let problem = null;
    if (! (value <= atMost)) {
        problem = {
            kind : RangeError,
            reason : `${atMost} < ${fmtNameValue(name,value)}`
        };
    }
    return problem;
}
validation.notAtMost = notAtMost;


validation.notBetween = function(value, atLeast, atMost, name = undefined) {

    const {notANumber, notAtLeast, notAtMost} = noaFastColors.validation;

    let problem = notNumber(atLeast, 'atLeast');
    if (! problem) problem = notNumber(atMost, 'atMost');
    if (! problem) problem = notAtLeast(value, atLeast, name);
    if (! problem) problem = notAtMost(value, atMost, name);  

    return problem;
}


const mapping = {};
noaFastColors.mapping = mapping;

mapping.getIndexMapper = function(spanSize, {multiplyByScale = 1, addOffset = 0} = {}) {
  const maxIndex = spanSize - 1;
  function _mapper(t) {
    const tClamped = max(0.0, min(1.0, t));
    const unrounded = tClamped * maxIndex;
    const rounded = Math.round(unrounded);
    return rounded * multiplier;
  }
  return _mapper;
}


// Each of these is a function which will round to the nearest whole index
mapping.hMapper = mapping.getIndexMapper(12, 1000);
mapping.vMapper = mapping.getIndexMapper(10,   10);
mapping.lMapper = mapping.getIndexMapper(10 ,   1);


validation.indexOutsideArray = function(index, arr, name = 'index') {
    validation.notBetween(index, 0, arr.length, name);
}

validation.notAColorTable = (arr, name) => {
    let problem = null;
    console.log(name, typeof arr)
    if(! Array.isArray(arr)) {
        problem = {
            kind : TypeError,
            reason : `${name} is not a valid color array (${JSON.stringify(arr)})`
        };
    }
    return problem;
}

 
validation.noColorTable = (useColors, colors) => {
    const notAColorTable = noaFastColors.validation.notAColorTable;

    let problem = null;
    if(useColors) {
        problem = notAColorTable(useColors, 'useColors');
    }
    else if(colors) {
        useColors = colors;
        problem = notAColorTable(colors, 'colors');
    } else {
        const _reason =  
            `No data loaded and no useColors provided?
            Try running on the DOMContentReady event:
            https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event`;
        problem = {
            kind : RangeError,
            reason : _reason
        };
    }
    return problem;
}

noaFastColors.getByChannelIndex = function(hIndex, sIndex, lIndex, useColors = undefined) {
    const {noColorTable, notBetween, indexOutsideArray} = noaFastColors.validation;

    let problem = noColorTable(useColors, colors)
    if(problem) {
        throw problem.kind(problem.reason);
    } 
    
    useColors = useColors ? useColors : colors;
    problem = notBetween(hIndex, 0.0, 11.0, 'hIndex');
    if (! problem ) { problem = notBetween(sIndex, 0.0,  9.0, 'sIndex'); }
    if (! problem ) { problem = notBetween(lIndex, 0.0,  9.0, 'lIndex'); }
    if(problem) {
        throw problem.kind(problem.reason);
    }
    console.log("hIndex", hIndex);
    let index =  Math.round(hIndex * 100);
    index     += Math.round(sIndex *   10);
    index     += Math.round(lIndex);//*  1 
    console.log("index", index);
    problem = indexOutsideArray(colors, index);
    if(problem) {
         throw problem.kind(problem.reason);
    }

    return useColors[index]
}


/**
 * @param {float} hNorm
 * @param {float} sNorm
 * @param {lNorm} lNorm   
 */
noaFastColors.getByChannelNorms = function(hNorm, sNorm, lNorm, useColors = undefined) {
   const {noColorTable, indexOutsideArray} = noaFastColors.validation;

   let problem = noColorTable(useColors, colors);
   if(problem) {
        throw problem.kind(problem.reason);
   }

   const {hMapper, vMapper, lMApper} = noaFastColors.mapping; 

   // Just some validation for when we forget the range lol.
   const hOffset = hMapper(hNorm);
   const vOffset = vMapper(vNorm);
   const lOffset = lMappeR(lNorm);

   problem = indexOutsideArray(colors, index);
   if(problem) {
     throw problem.kind(problem.reason);
   }

   return useColors[index];
}


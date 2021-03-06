// @ts-check

let state = {};
let parlayOdds = 1;

const initialState = {
  currentRowIndex: 0,
  currentOddsIndex: 0,
  currentOddsRow: ["", ""],
  oddsInputs: [{"oddsRow": ["", ""], "nvo": 0}],

};

const amerOddsToProb = (amerOdds) => {
    let decimalOdds = 0 
    let fraction = 0 
    if (amerOdds < 0) {
        fraction = -100/amerOdds
        decimalOdds = fraction + 1;
    } else {
        fraction = amerOdds/100 
        decimalOdds = fraction + 1;
    }
    const percentOdds = 1/decimalOdds; 
    const profitOn100 = 100 * fraction
    return {"decimalOdds": decimalOdds, 
            "percentOdds": percentOdds,
            "profitOn100": profitOn100}

}

const makeOdds = (arr) => {
    let sum = arr.reduce(function (a, b) {
        return a + b;
        }, 0);
    let impliedOdds = arr.map(num => {
        return num/sum * 100 
    })
    return impliedOdds 
}

const vigCalc = (a, b) => {
    let vig = 100 * (1- (a*b)/(a+b))
}

const checkOddsInput = (valueString) => {
    const value = parseInt(valueString)
    if (Object.is(value, NaN)) {
        alert(`couldn't parse odds input: ${valueString}`)
    } else {
        const {decimalOdds, percentOdds} = amerOddsToProb(value)
        return percentOdds
    }
}

const getOddsRow = (index) => {
    const firstOdds = document.getElementById(`row-${index}-oddsInput-0`).value
    const secondOdds = document.getElementById(`row-${index}-oddsInput-1`).value
    return [firstOdds, secondOdds]
}

const checkOddsRow = (index) => {
    const row = getOddsRow(index)
    const impliedProbs = row.map(checkOddsInput)
    const oddsSum = makeOdds(impliedProbs)
    return oddsSum
}

const getClickedRow = (e) => {
    const row = e.target.id.search("row-");
    if (row === 0 ) {
        const rowIndex = parseInt(e.target.id.slice(4,5));
        state.currentRowIndex = rowIndex;
        return rowIndex
    } else {
        return undefined
    }
}

const getOddsRowElement = (i) => {
    const oddsRowId = `oddsRow-${i}`
    var oddsRow = document.getElementById(oddsRowId)
    return oddsRow
}

const makeNoVigOddsRow = (index, nvoArray) => {
    index = state.currentRowIndex
    const nvoString = `${nvoArray[0].toFixed(1)}%`
    const oddsRowElement = getOddsRowElement(index)
    if (oddsRowElement) {
        var newNVO = document.createElement("div");
        newNVO.classList.add("noVigOdds")
        newNVO.innerHTML = nvoString
        
        oddsRowElement.appendChild(newNVO)
    }
}

const makeNewRow = (index) => {
    state.currentOddsRow = ["", ""];
    state.currentOddsIndex = 0; 
    var newRow = document.createElement("div");
    newRow.classList.add("oddsRow");
    newRow.setAttribute("id", `oddsRow-${index}`)
    for (var i = 0; i < 2; i++) {
        var newOddsInput = document.createElement("input");
        newOddsInput.classList.add("oddsInput");
        newOddsInput.setAttribute("type", "number")
        // newOddsInput.setAttribute("pattern", "[0-9]*-")
        newOddsInput.setAttribute("id", `row-${index}-oddsInput-${i}`);
        newOddsInput.addEventListener("click", getClickedRow, false)
        newRow.appendChild(newOddsInput);
    }
    document.getElementById("oddsInputContainer").appendChild(newRow);
};

const reset = () => {
  // resets UI
  // remove all existing rows
  const containerRoot = document.getElementById("oddsInputContainer");
  while (containerRoot.firstChild) {
    containerRoot.removeChild(containerRoot.firstChild);
  }
  state = JSON.parse(JSON.stringify(initialState));
  // make the first row
  makeNewRow(0);
  // reset parlayOdds
  parlayOdds = 1 
  const parlayOddsElement = document.getElementById("parlayOdds")
  parlayOddsElement.innerHTML = "" 

  // reset americanOddsInput
  const americanOddsInputElement = document.getElementById("americanOddsInput")
  americanOddsInputElement.value = ""

  // reset impliedPercent
  const impliedPercentElement = document.getElementById("impliedPercent")
  impliedPercentElement.innerHTML = ""

  // reset eV
  const evElement = document.getElementById("evOutput")
  evElement.innerHTML = ""
  updateEvColor(0)

  // update UI
  updateUI(state);
};

const updateUI = (s) => {
  // refresh UI to match current state

  for (var i = 0; i < 2; i++) {
    document.getElementById(`row-${s.currentRowIndex}-oddsInput-${i}`).innerHTML =
      s.currentOddsRow[i] || "";
  }

  // handle error display
  el = document.getElementById("error");
  if (s.error) {
    el.classList.remove("hidden");
    el.innerHTML = s.error;
  } else {
    el.classList.add("hidden");
  }
};

const makeMinus = () => {
    const currentOddsValue = state.currentOddsRow[state.currentOddsIndex]
    if (currentOddsValue[0] === "-") {
        state.currentOddsRow[state.currentOddsIndex] = currentOddsValue.slice(1)
    } else {
    state.currentOddsRow[state.currentOddsIndex] = "-" + currentOddsValue
    }
}

const input = (char) => {
    // handle input, either from typing or from on screen keyboard
    const odds_index = state.currentOddsIndex;
    const odds_input = state.currentOddsRow[odds_index];
    
    if (char) {
        if (char === "back") {
            // only use back if current word isn't empty
            if (odds_input.length) {
            state.currentOddsRow[odds_index] = odds_input.slice(0, odds_input.length - 1);
            updateUI(state);
            }
        } else if (char === "enter") {
            submitOddsRow();
            
        } else if (char === "tab") {
            // add check that input is long enough
            if (odds_input.length > 2) {
                // if in first column, add 1 to index
                if (state.currentOddsIndex === 0) {   
                    state.currentOddsIndex = 1;
                } else {
                    // add another row? 
                    submitOddsRow();

                }
            }
        }
      
        else if (odds_input.length < 5) {
            // relying on inputs to input() to sanitize chars for us
            if (char === "-") {
                makeMinus();
            } else {
                state.currentOddsRow[odds_index] += char;
            }
            updateUI(state);
        }
    }
  };

  const updateParleyOdds = (newParlayOdds) => {
        var parlayOddsElement = document.getElementById("parlayOdds")
        parlayOddsElement.innerHTML = (newParlayOdds * 100).toFixed(1) + "%"
  }

const evCalc = (fairWinProb, profOn100) => {
  const ev = fairWinProb*profOn100 - (1-fairWinProb)* 100; 
  return ev
}
const handleAmOddsInputChange = () => {
    // get value of AmericanOddsInput
    var americanOddsInputElement = document.getElementById("americanOddsInput")
    var impliedPercentElement = document.getElementById("impliedPercent")
    var evOutputElement = document.getElementById("evOutput")
    const amOddsInput = americanOddsInputElement.value 

    // Calculate probabilities
    const probs = amerOddsToProb(amOddsInput)
    impliedPercentElement.innerHTML = (probs.percentOdds * 100).toFixed(1) + "%"

    const ev = evCalc(parlayOdds, probs.profitOn100)
    evOutputElement.innerHTML = ev.toFixed(2) 
    updateEvColor(ev)


    
}

const makeEvColor = (evValue) => {
    let evBgColor = "gray"
    if (evValue === 0) {
        evBgColor = "gray"
    } else if (evValue < 0) {
        evBgColor = "red"
    } else if (evValue < 3) {
        evBgColor = "yellow"
    } else if (evValue < 6) {
        evBgColor = "lightgreen"
    } else if (evValue >= 6) {
        evBgColor = "green"
    }
    return evBgColor
}

const updateEvColor = (evValue) => {
    const evBgColor = makeEvColor(evValue) 
    const evElement = document.getElementById("evOutput")
    evElement.style.backgroundColor = evBgColor;
}
const submitOddsRow = () => {
    // all submitting actions
    
    // 1. evaluate current odds row
    const index = state.currentRowIndex
    const oddsOut = checkOddsRow(index)
    if (~Object.is(oddsOut[0], NaN)) {
        makeNoVigOddsRow(index, oddsOut)
        state.oddsInputs[index] = {"oddsRow": state.currentOddsRow, "nvo": oddsOut[0]}
        parlayOdds = parlayOdds *  oddsOut[0]/100
        updateParleyOdds(parlayOdds)

        // 2. make a new row (this bumps state.currentRowIndex)
        state.currentRowIndex += 1;
        makeNewRow(state.currentRowIndex);
    };
}
  


document.onkeydown = (e) => {
    // magic

    var char = "";
    if (/^([0-9])/.test(e.key) && e.key.length === 1) {
        // single a-z or A-Z character
        char = e.key;
    } else if (e.key === "Backspace") {
        char = "back";
    } else if (e.key === "Enter") {
        if (e.path[0].id === "americanOddsInput") {
            handleAmOddsInputChange()
        } else {
            char = "enter";
            }
    } else if (e.key === 'Tab') {
        char = "tab";
    } else if (e.key === '-') {
        char = "-"
    }
    input(char);
};

reset();
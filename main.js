state = {};
const initialState = {
  currentRow: 0,
  currentOddsIndex: 0,
  currentOddsRow: ["", ""],

  oddsInputs: [],

};


const makeNewRow = (index) => {
//   state.currentRow = Number.isInteger(index) ? index : state.currentRow + 1;
    state.currentRow = state.currentRow + 1; 
    state.oddsInputs.push(state.currentOddsRow);
    state.currentOddsRow = ["", ""];
    state.currentOddsIndex = 0; 
    var newRow = document.createElement("div");
    newRow.classList.add("oddsRow");
    for (var i = 0; i < 2; i++) {
        var newOddsInput = document.createElement("div");
        newOddsInput.classList.add("oddsInput");
        // newOddsInput.setAttribute("onclick", `changeScore(${i})`);
        newOddsInput.setAttribute("id", `row-${state.currentRow}-oddsInput-${i}`);
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
  // reset state
  // update UI
  updateUI(state);
};

const updateUI = (s) => {
  // refresh UI to match current state
  // update current word

  console.log(s)
  for (var i = 0; i < 2; i++) {
    document.getElementById(`row-${s.currentRow}-oddsInput-${i}`).innerHTML =
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
        // only allow submit if current odds_input is length 5
        if (odds_input.length > 2) {
          submitStatus();
        }
      } else if (char === "tab") {
          // add check that input is long enough
          if (odds_input.length > 2) {
              // if in first column, add 1 to index
              if (state.currentOddsIndex === 0) {   
                state.currentOddsIndex = 1;
              } else {
                  // add another row? 
                  makeNewRow(odds_index);

              }
          }
      }
      
      else if (odds_input.length < 5) {
        // relying on inputs to input() to sanitize chars for us
        state.currentOddsRow[odds_index] += char;
        updateUI(state);
      }
    }
  };

// const updateWordList = (wordList, excludedLetters, solution, wrongSpot) => {
//   // helper function to prune down word list based on latest rules
//   let newList = [];
//   wordList.forEach((word) => {
//     // innocent until proven guilty
//     let pass = true;
//     [...word].forEach((char, index) => {
//       if (excludedLetters.includes(char)) {
//         // cannot include word if contains a letter we know doesn't exist
//         pass = false;
//       } else if (solution[index] && solution[index] !== char) {
//         // cannot include word if the letters don't match our known right spots
//         pass = false;
//       }
//     });
//     // has to also include all wrong spot characters
//     Object.keys(wrongSpot).forEach((char) => {
//       if (!word.includes(char)) {
//         // if there exists a character that must be in the word but is not in this word, fail
//         pass = false;
//       }
//       // cannot be a word where we already know the letter is in the wrong spot
//       // all the indicies that are wrong for this letter
//       const indicies = wrongSpot[char];
//       indicies.forEach((index) => {
//         if (word[index] === char) {
//           // word has this character at this index, fail
//           pass = false;
//         }
//       });
//     });
//     if (pass) {
//       newList.push(word);
//     }
//   });
//   return newList;
// };



const checkSubmission = (s) => {
  // will check the submission state
  // if current word has all 5 letters, we can check it
  // will add
  if (s?.currentOddsRow?.length < 5) {
    var newState = JSON.parse(JSON.stringify(s));
    var {
      currentOddsRow,
      letterScore,
      letterStates: { excludedLetters, wrongSpot, solution },
      wordList,
    } = newState;
    var win = true;
    var error = false;
    // iterate over all letters in the word, make sure they make sense
    for (var i = 0; i < 2; i++) {
      const letter = currentOddsRow[i];
      const status = letterScore[i];
      if (status === 0) {
        // letter not correct
        win = false;
        if (
          solution.includes(letter) ||
          Object.keys(wrongSpot).includes(letter)
        ) {
          // we were told previously that this letter is correct, now saying not found
          error = `${letter} marked as incorrect, but was previously indicated to be in the word`;
        } else if (!excludedLetters.includes(letter)) {
          // first time seeing this character be excluded
          excludedLetters.push(letter);
        //   possibleLetters = possibleLetters.filter((item) => item != letter);
        }
      } else {
        // letter is some kind of correct
        if (excludedLetters.includes(letter)) {
          // we were told previously this letter wasn't in word, but now saying it is
          error = `${letter} was previously in the word. Cannot be missing now!`;
        }
        if (status === 2) {
          // correct letter in correct spot
          if (solution[i] && solution[i] !== letter) {
            error = `${solution[i]} was previously said to be at position ${i} in word, now saying ${letter}`;
          }
          solution[i] = letter;
        } else {
          // correct letter in wrong spot
          if (!wrongSpot[letter]) {
            // if we don't know about this letter yet, add it to wrongSpot list
            wrongSpot[letter] = [i];
          } else if (!wrongSpot[letter].includes(i)) {
            // we know the letter but found a new spot it doesn't belong
            wrongSpot[letter].push(i);
          }
          win = false;
        }
      }
    }
    if (!error && !win) {
      // check if there are solutions left
      wordList = updateWordList(wordList, excludedLetters, solution, wrongSpot);
      if (wordList?.length === 0) {
        error = "No more solutions left!";
      }
    }
    return {
      win: win,
      error: error,
      letterStates: {
        excludedLetters: excludedLetters,
        possibleLetters: possibleLetters,
        wrongSpot: wrongSpot,
        solution: solution,
      },
      wordList: wordList,
    };
  } 
};

const submitStatus = () => {
  // all submitting actions

  // 1. evaluate state
  const newState = checkSubmission(state);
  console.log(newState)
  const { win, error } = newState;
  if (Object.keys(newState).length === 0) {
    // checkSubmission didn't run becuase state wasn't valid to run
    console.debug("nothing was done");
  } else if (error) {
    // if error, show error, but don't do anything else
    state.error = error;
    updateUI(state);
  } else if (win) {
    // if win, show win, don't do anything else
    document.getElementById("solutions").innerHTML = `Congratulations!!`;
  } else {
    // state checks out

    // 3. reset most of state, but keep the results we just found
    state = { ...initialState, ...newState, currentRow: state.currentRow };
    // 2. make a new row (this bumps state.currentRow)
    makeNewRow();
    // 4. update UI to match new state
    updateUI(state);
    // 5. update keyboard with new state
    // updateKeyboard(state);
  }
};



document.onkeydown = (e) => {
  // magic

  var char = "";
  if (/^([0-9])/.test(e.key) && e.key.length === 1) {
    // single a-z or A-Z character
    char = e.key.toLowerCase();
  } else if (e.key === "Backspace") {
    char = "back";
  } else if (e.key === "Enter") {
    char = "enter";
  } else if (e.key === 'Tab') {
      char = "tab";
  }
  input(char);
};

// reset application
reset();
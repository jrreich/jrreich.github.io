const randItem = (wordList) => {
    // randomly pick an element from array
    return wordList[Math.floor(Math.random() * (wordList.length + 1))];
  };
  
  const getNewSuggestion = (s) => {
    // algo to randomly pick a word from list of possible solutions.
    return randItem(s.wordList);
  };
  
  const getEliminateSuggestion = (s) => {
    // algo to find a word which eliminates the most number of unknown letters
    let lettersToExclude = [];
    s?.wordList?.forEach((word) => {
      [...word].forEach((char) => {
        // look through each character
        if (
          // letter isn't already excluded
          !s?.letterStates?.excludedLetters?.includes(char) &&
          // letter isn't already known (wrong spot or in solution)
          !(
            Object.keys(s?.letterStates?.wrongSpot)?.includes(char) ||
            s?.letterStates?.solution.includes(char)
          ) &&
          // not already on our next-to-exclude list
          !lettersToExclude.includes(char)
        ) {
          lettersToExclude.push(char);
        }
      });
    });
    let highestScore = 0;
    let matches = [];
  
    // go through entire dictionary of known words
    words.forEach((word) => {
      let uniqueLetters = [];
      [...word].forEach((char) => {
        if (lettersToExclude.includes(char) && !uniqueLetters.includes(char)) {
          uniqueLetters.push(char);
        }
      });
      if (uniqueLetters.length > highestScore) {
        highestScore = uniqueLetters.length;
        matches = [word];
      } else if (uniqueLetters.length === highestScore) {
        matches.push(word);
      }
    });
    return randItem(matches);
  };
  
//   const useGenerator = (gName) => {
//     // uses a generator to pick a new word, then updates state with that word, then updates UI
//     var newWord = "";
//     if (gName === "new") {
//       newWord = getNewSuggestion(state);
//     }
//     if (gName === "eliminate") {
//       newWord = getEliminateSuggestion(state);
//     }
//     state = {
//       ...state,
//       currentOddsRow: newWord,
//       letterScore: [0, 0, 0, 0, 0],
//     };
//     updateUI(state);
//   };
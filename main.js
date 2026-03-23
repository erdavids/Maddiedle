const valid_words = ["grasps", "hasps", "knosps", "risps", "cusps", "galliwasps", "handclasps", "clasps", "enclasps", "gasps", "handgrasps", "jasps", "rasps", "unclasps", "wisps", "crisps", "wasps"]

function getDailyWord(valid_words) {
  const today = new Date().toISOString().slice(0, 10); // "2026-03-23"

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash << 5) - hash + today.charCodeAt(i);
    hash |= 0; // Convert to 32-bit int
  }

  const index = Math.abs(hash) % valid_words.length;

  // set word in reveal
  const wordElement = document.getElementById('todaysWord')
  wordElement.textContent = valid_words[index]

  return valid_words[index];
}

const todays_word = getDailyWord(valid_words);
console.log(todays_word)

let words_dictionary = new Set();

async function loadDictionary() {
  const response = await fetch('./words_dictionary.json');
  const data = await response.json();
  words_dictionary = new Set(Object.keys(data));
}

function setupMaddiedle() {
  const letterGrid = document.getElementById("letterGrid")

  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div")
    row.classList.add("letterRow")
    for (let j = 0; j < todays_word.length; j++) {
      const text_input = document.createElement("input");
      text_input.type = 'text'
      text_input.maxLength = 1;
      text_input.classList.add("letterInput")
      row.appendChild(text_input)
    }
    letterGrid.appendChild(row)
  }

  console.log(words_dictionary)


}

document.addEventListener("input", function(event) {
  if (event.inputType === 'deleteContentBackward') {
    if (event.target.classList.contains("letterInput")) {
      const input = event.target
      input.value = ""
      const nextInput = event.target.previousElementSibling;
      if (nextInput && nextInput.classList.contains("letterInput")) {
        nextInput.focus();
      }
    }
  } else if (event.target.classList.contains("letterInput")) {
    const nextInput = event.target.nextElementSibling;
    if (nextInput && nextInput.classList.contains("letterInput")) {
      console.log("NEXT!!!")
      nextInput.focus();
    }
  }
})

document.addEventListener("click", function (event) {
  const el = event.target;

  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
    const length = el.value.length;
    el.setSelectionRange(length, length);
  }
});

document.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    const currentRow = event.target.parentElement;
    const inputs = currentRow.querySelectorAll(".letterInput")

    let current_guess = "";
    inputs.forEach(input => {
      current_guess += input.value.toLowerCase()
    })

    if (current_guess.length === todays_word.length) {

      console.log("check valid")
      // See if current guess is a valid word
      if (!words_dictionary.has(current_guess)) {
        console.log("NOT IN THE LIST")
        return;
      }

      console.log("seems valid")

      inputs.forEach((input, index) => {
        if (input.value.toLowerCase() === todays_word[index]) {
          input.classList.add("letterCorrect")
        } else if (todays_word.includes(input.value.toLowerCase())) {
          input.classList.add("letterMaybe")
        } else {
          input.classList.add("letterIncorrect")
        }
      })

      if (current_guess === todays_word) {
        const display = document.getElementById('todaysWord')
        display.classList.remove('todaysWordHidden')
      }
    }

    if (currentRow) {
      const nextRow = currentRow.nextElementSibling
      if (nextRow) {
        nextRow.querySelector(".letterInput").focus()
      }
    }
  }
})


window.onload = async function () {
  await loadDictionary();
  setupMaddiedle();
};

const valid_words = ["grasps", "hasps", "knosps", "risps", "cusps", "galliwasps", "handclasps", "clasps", "wisps", "gasps", "handgrasps", "jasps", "rasps", "unclasps", "enclasps", "crisps", "wasps"]

const rows_completed = 0;

let input_size = "64px"

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
  const windowWidth = window.innerWidth;
    input_size = Math.min(85, ((windowWidth / todays_word.length) - ((todays_word.length - 2) * 4))) + 'px';
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div")
    row.classList.add("letterRow")
    for (let j = 0; j < todays_word.length; j++) {
      const text_input = document.createElement("input");
      text_input.type = 'text'
      text_input.maxLength = 1;
      text_input.classList.add("letterInput")
      text_input.enterKeyHint = "done"
      text_input.disabled = i != 0;


      text_input.style.width = input_size 
      text_input.style.height = input_size
      text_input.style.fontSize = input_size * .85

      row.appendChild(text_input)
    }
    letterGrid.appendChild(row)
  }

  const title = document.getElementById('maddiedleTitle')
  title.style.fontSize = input_size;

  const tw = document.getElementById('todaysWord')
  tw.style.fontSize = input_size;


  console.log(words_dictionary)


}

// document.addEventListener("input", function(event) {
//   if (event.inputType === 'deleteContentBackward') {
//     if (event.target.classList.contains("letterInput")) {
//       const input = event.target
//       input.value = ""
//       const nextInput = event.target.previousElementSibling;
//       if (nextInput && nextInput.classList.contains("letterInput")) {
//         nextInput.focus();
//       }
//     }
//   } else if (event.target.classList.contains("letterInput")) {
//     const nextInput = event.target.nextElementSibling;
//     if (nextInput && nextInput.classList.contains("letterInput")) {
//       console.log("NEXT!!!")
//       nextInput.focus();
//     }
//   }
// })

// document.addEventListener("click", function (event) {
//   const el = event.target;

//   if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
//     const length = el.value.length;
//     el.setSelectionRange(length, length);
//   }
// });
document.addEventListener("keydown", function(event) {
  const el = event.target;

  if (!el.classList.contains("letterInput")) return;

  // LETTER INPUT
  if (event.key.length === 1) {
    event.preventDefault(); // stop normal typing

    el.value = event.key;

    const nextInput = el.nextElementSibling;
    if (nextInput && nextInput.classList.contains("letterInput")) {
      nextInput.focus();
    }
  }

  // BACKSPACE
  if (event.key === "Backspace") {
    event.preventDefault();

    if (el.value === "") {
      const prevInput = el.previousElementSibling;
      if (prevInput && prevInput.classList.contains("letterInput")) {
        prevInput.focus();
        prevInput.value = "";
      }
    } else {
      el.value = "";
    }
  }

  // ENTER (your existing logic stays mostly the same)
  if (event.key === "Enter") {
    const currentRow = el.parentElement;
    const inputs = currentRow.querySelectorAll(".letterInput");

    let current_guess = "";
    inputs.forEach(input => {
      current_guess += input.value.toLowerCase();
    });

    current_guess = current_guess.replace(" ", "");
    console.log(current_guess)
    if (current_guess.length === todays_word.length) {

      if (!words_dictionary.has(current_guess)) {
        console.log("NOT IN THE LIST");
        return;
      }

      inputs.forEach((input, index) => {
        if (input.value.toLowerCase() === todays_word[index]) {
          input.classList.add("letterCorrect");
        } else if (todays_word.includes(input.value.toLowerCase())) {
          input.classList.add("letterMaybe");
        } else {
          input.classList.add("letterIncorrect");
        }
        input.disabled = true;
      });

      if (current_guess === todays_word) {
        const display = document.getElementById('todaysWord');
        display.classList.remove('todaysWordHidden');
      }
    } else {
      return;
    }

    const nextRow = currentRow.nextElementSibling;
    if (nextRow) {
      // enable all the inputs?
      for (const child of nextRow.children) {
        child.disabled = false;
      }
      nextRow.querySelector(".letterInput").focus();
    } else {
        const display = document.getElementById('todaysWord');
        display.classList.remove('todaysWordHidden');
    }
  }
});

document.addEventListener("input", function(event) {
  const el = event.target;
  if (!el.classList.contains("letterInput")) return;

  // Ensure only 1 char (mobile can paste or suggest words)
  el.value = el.value.slice(0, 1);

  // Move forward if a letter was entered
  if (el.value !== "") {
    const nextInput = el.nextElementSibling;
    if (nextInput && nextInput.classList.contains("letterInput")) {
      nextInput.focus();
    }
  }
});


window.onload = async function () {
  await loadDictionary();
  setupMaddiedle();
};

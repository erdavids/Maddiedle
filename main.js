const valid_words = [
  "grasps",
  "hasps",
  "knosps",
  "risps",
  "cusps",
  "handclasps",
  "clasps",
  "wisps",
  "gasps",
  "handgrasps",
  "jasps",
  "rasps",
  "unclasps",
  "crisps",
  "enclasps",
  "wasps",
];

const rows_completed = 0;

let input_size = "64px";

function getDailyWord(valid_words) {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  // Convert date string to numeric seed
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed = seed * 31 + today.charCodeAt(i);
  }

  // Seeded random generator (mulberry32)
  function mulberry32(a) {
    return function () {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rand = mulberry32(seed);
  const index = Math.floor(rand() * valid_words.length);

  // set word in reveal
  const wordElement = document.getElementById("todaysWord");
  wordElement.textContent = valid_words[index];

  return valid_words[index];
}

const todays_word = getDailyWord(valid_words);
console.log(todays_word);

let words_dictionary = new Set();

async function loadDictionary() {
  const response = await fetch("./words_dictionary.json");
  const data = await response.json();
  words_dictionary = new Set(Object.keys(data));
}

function setupMaddiedle() {
  const letterGrid = document.getElementById("letterGrid");
  const windowWidth = window.innerWidth;
  input_size =
    Math.min(
      85,
      windowWidth / todays_word.length - (todays_word.length - 2) * 4,
    ) + "px";
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.classList.add("letterRow");
    for (let j = 0; j < todays_word.length; j++) {
      const text_input = document.createElement("input");
      text_input.type = "text";
      text_input.maxLength = 1;
      text_input.classList.add("letterInput");
      text_input.enterKeyHint = "done";
      text_input.disabled = i != 0;

      text_input.style.width = input_size;
      text_input.style.height = input_size;
      text_input.style.fontSize = input_size * 0.85;

      row.appendChild(text_input);
    }
    letterGrid.appendChild(row);
  }

  const title = document.getElementById("maddiedleTitle");
  title.style.fontSize = input_size;

  const tw = document.getElementById("todaysWord");
  tw.style.fontSize = input_size;

  console.log(words_dictionary);
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
document.addEventListener("keydown", function (event) {
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

  if (event.key === "Enter") {
    const currentRow = el.parentElement;
    const inputs = currentRow.querySelectorAll(".letterInput");

    let current_guess = "";
    inputs.forEach((input) => {
      current_guess += input.value.toLowerCase();
    });

    current_guess = current_guess.replace(" ", "");
    console.log(current_guess);
    if (current_guess.length === todays_word.length) {
      if (!words_dictionary.has(current_guess)) {
        console.log("NOT IN THE LIST");
        return;
      }

      const letter_counts = {};

      for (const letter of todays_word) {
        letter_counts[letter] = (letter_counts[letter] || 0) + 1;
      }

      inputs.forEach((input, index) => {
        const i_v = input.value.toLowerCase();
        if (i_v === todays_word[index]) {
          input.classList.add("letterCorrect");
          letter_counts[i_v] -= 1;
        }
      });

      inputs.forEach((input, index) => {
        const i_v = input.value.toLowerCase();

        if (input.classList.contains("letterCorrect")) return;

        if (todays_word.includes(i_v) && letter_counts[i_v] > 0) {
          input.classList.add("letterMaybe")
          letter_counts[i_v] -= 1;
        } else {
          input.classList.add("letterIncorrect")
        }
        // Need to see how many there are first, and if some are accounted for?
        //   const number_of_this_letter = todays_word.split(i_v).length - 1;
        //   const number_in_this_guess = current_guess.split(i_v).length - 1;

        //   const number_correctly_placed = 0
        //   for (let i = 0; i < todays_word.length; i++) {
        //     if (todays_word[i] == i_v && current_guess[i] == i_v) {
        //       number_correctly_placed += 1
        //     }
        //   }

        //   if (number_correctly_placed == number_of_this_letter) {
        //     input.classList.add("letterIncorrect");
        //   } else {
        //     // now occurs?
        //     let occurs_before = 0;
        //     for (let i = 0; i < index; i++) {
        //   }

        // } else {
        //   input.classList.add("letterIncorrect");
        // }
        input.disabled = true;
      });

      if (current_guess === todays_word) {
        const display = document.getElementById("todaysWord");
        display.classList.remove("todaysWordHidden");
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
      const display = document.getElementById("todaysWord");
      display.classList.remove("todaysWordHidden");
    }
  }
});

document.addEventListener("input", function (event) {
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

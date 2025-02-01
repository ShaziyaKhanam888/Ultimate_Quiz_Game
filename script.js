document.addEventListener("DOMContentLoaded", function () {
  let currentQuestionIndex = 0;
  let questions = [];
  let filteredQuestions = [];
  let selectedDifficulty = "easy"; // Default difficulty
  let score = 0; // Reset score for each new quiz
  let startSound; // Define startSound globally

  // Play start sound when the quiz starts
  const playStartSound = () => {
    startSound = new Audio("img_vid/uplifting.mp3");
    startSound.loop = true;
    startSound.play();
  };

  // Function to stop the audio when finishing the quiz or closing the popup
  const stopSound = () => {
    if (startSound) {
      startSound.pause();
      startSound.currentTime = 0;
    }
  };

  // Get DOM elements once
  const questionText = document.getElementById("question-text");
  const optionsContainer = document.getElementById("options");
  const progressBar = document.getElementById("progressBar");
  const finalScore = document.getElementById("final-score");
  const badgeText = document.getElementById("badge-text");
  const scorePopup = document.getElementById("score-popup");
  const quitBtn = document.getElementById("quit-btn");
  const closeBtn = document.querySelector(".close-btn");

  // Ensure all DOM elements exist before proceeding
  if (
    !questionText ||
    !optionsContainer ||
    !progressBar ||
    !finalScore ||
    !badgeText
  ) {
    console.error("One or more required DOM elements are missing.");
    return;
  }

  // Function to fetch questions from the API
  function fetchQuestions() {
    fetch("https://api.jsonbin.io/v3/b/679c99dbad19ca34f8f768c8/latest", {
      method: "GET",
      headers: {
        "X-Master-Key":
          "$2a$10$8o5/KlD4egpq0BKAcAQcR.LgkD0J9mYwf2Q7QD8iJc9IMddFCX4Y6",
        "X-Access-Key":
          "$2a$10$FdQQeq7L6Z0aCES3aMpkreEEE7CbmbAexV25axHJBulZaxuqr5l3m",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.record || !data.record.questions) {
          throw new Error("Invalid API response format.");
        }

        questions = data.record.questions;
        console.log("API Response:", questions);

        filterQuestionsByDifficulty();
        displayQuestion();
      })
      .catch((error) => console.error("API Fetch Error:", error));
  }

  // Function to filter questions based on the selected difficulty
  function filterQuestionsByDifficulty() {
    filteredQuestions = questions.filter(
      (question) => question.difficulty === selectedDifficulty
    );
    console.log("Filtered Questions Length:", filteredQuestions.length);
  }

  // Function to display the current question
  function displayQuestion() {
    if (currentQuestionIndex >= filteredQuestions.length) {
      showScore();
      return;
    }

    const question = filteredQuestions[currentQuestionIndex];

    if (questionText) {
      questionText.innerText = question.question;
    } else {
      console.error('Element with ID "question-text" not found.');
    }

    optionsContainer.innerHTML = ""; // Clear previous options

    // Create buttons for each option
    question.options.forEach((option) => {
      const optionBtn = document.createElement("button");
      optionBtn.innerText = option;
      optionBtn.classList.add("option-btn");

      // Attach the event listener directly within this loop
      optionBtn.addEventListener("click", () =>
        checkAnswer(option, question.answer)
      );

      optionsContainer.appendChild(optionBtn);
    });

    // Update question progress
    if (progressBar) {
      progressBar.innerText = `${currentQuestionIndex + 1} / ${
        filteredQuestions.length
      }`;
    } else {
      console.error('Element with ID "progressBar" not found.');
    }
  }

  // Function to check the selected answer
  function checkAnswer(selectedAnswer, correctAnswer) {
    if (selectedAnswer === correctAnswer) {
      score++;
    }
    currentQuestionIndex++; // Move to next question after selection
    displayQuestion(); // Load next question
  }

  // Function to show the final score and show the popup
  function showScore() {
    if (finalScore) {
      finalScore.innerText = score;
    } else {
      console.error('Element with ID "final-score" not found.');
    }

    // Display badge based on difficulty
    let badgeHTML = "";
    if (selectedDifficulty === "easy") {
      badgeHTML = "<span class='badge easy'>🥇 Easy Level</span>";
    } else if (selectedDifficulty === "medium") {
      badgeHTML = "<span class='badge medium'>🏅 Medium Level</span>";
    } else if (selectedDifficulty === "hard") {
      badgeHTML = "<span class='badge hard'>🏆 Hard Level</span>";
    }
    if (badgeText) {
      badgeText.innerHTML = badgeHTML;
    } else {
      console.error('Element with ID "badge-text" not found.');
    }

    // Hide question container and show the popup
    document.querySelector(".quiz-container").style.display = "none";
    if (scorePopup) {
      scorePopup.style.display = "flex";
      scorePopup.style.position = "fixed";
      scorePopup.style.top = "50%";
      scorePopup.style.left = "50%";
      scorePopup.style.transform = "translate(-50%, -50%)"; // Center the popup
    }
    stopSound(); // Stop the sound when the quiz is finished
  }

  // Function to close the score popup
  function closePopup() {
    if (scorePopup) {
      scorePopup.style.display = "none";
    }
    document.querySelector(".main-container").style.display = "block";
    document.querySelector(".quiz-container").style.display = "none";
  }

  // Difficulty selection event listener
  document.querySelectorAll(".difficulty").forEach((button) => {
    button.addEventListener("click", function () {
      selectedDifficulty = button.getAttribute("data-difficulty");

      // Reset the score when switching difficulty
      score = 0;
      currentQuestionIndex = 0; // Reset question index as well
      document.querySelector(".main-container").style.display = "none";
      document.querySelector(".quiz-container").style.display = "block";

      playStartSound();
      fetchQuestions(); // Fetch questions again for the selected difficulty
    });
  });

  // Quit button functionality
  if (quitBtn) {
    quitBtn.addEventListener("click", function () {
      closePopup();
      showScore();
    });
  }

  // Close button functionality
  if (closeBtn) {
    closeBtn.addEventListener("click", closePopup);
  }

  // Fetch questions once DOM is fully loaded
  fetchQuestions();
});

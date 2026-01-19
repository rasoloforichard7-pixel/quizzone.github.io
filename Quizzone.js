document.addEventListener("DOMContentLoaded", () => {
  const allQuestions = {
    geographie: [
      {
        question: "Quel est le plus grand océan du monde ?",
        options: ["Atlantique", "Indien", "Pacifique", "Arctique"],
        answer: "Pacifique"
      }
    ],
    histoire: [
      {
        question: "Qui a peint la Joconde ?",
        options: ["Van Gogh", "Picasso", "Léonard de Vinci", "Monet"],
        answer: "Léonard de Vinci"
      }
    ],
    sciences: [
      {
        question: "Quel gaz respirons-nous pour vivre ?",
        options: ["Hydrogène", "Oxygène", "Carbone", "Azote"],
        answer: "Oxygène"
      }
    ]
  };

  let quizData = [];
  let currentQuestion = 0;
  let score = 0;
  let timer;
  let timeLeft = 60;

  const questionText = document.getElementById("question-text");
  const answersForm = document.getElementById("answers-form");
  const questionNumber = document.getElementById("question-number");
  const scoreDisplay = document.getElementById("score");
  const progressBar = document.getElementById("progress-bar");
  const submitBtn = document.getElementById("submit-btn");
  const timerDisplay = document.getElementById("timer");
  const feedback = document.getElementById("feedback");

  const tabPlay = document.getElementById("tab-play");
  const tabCreate = document.getElementById("tab-create");
  const playSection = document.getElementById("play-section");
  const createSection = document.getElementById("create-section");

  tabPlay.addEventListener("click", () => {
    tabPlay.classList.add("active");
    tabCreate.classList.remove("active");
    playSection.classList.add("active");
    createSection.classList.remove("active");
  });

  tabCreate.addEventListener("click", () => {
    tabCreate.classList.add("active");
    tabPlay.classList.remove("active");
    createSection.classList.add("active");
    playSection.classList.remove("active");
  });

  document.getElementById("start-btn").addEventListener("click", () => {
    const selectedCategory = document.getElementById("category").value;
    if (!selectedCategory) return;

    const customKey = "custom_" + selectedCategory;
    const customQuestions = JSON.parse(localStorage.getItem(customKey)) || [];
    quizData = [...(allQuestions[selectedCategory] || []), ...customQuestions];

    currentQuestion = 0;
    score = 0;
    scoreDisplay.textContent = score;
    progressBar.max = quizData.length;
    progressBar.value = 1;

    document.getElementById("quiz-content").style.display = "block";
    submitBtn.style.display = "inline-block";
    loadQuestion();
  });

  function loadQuestion() {
    const q = quizData[currentQuestion];
    questionText.textContent = q.question;
    questionNumber.textContent = `Question ${currentQuestion + 1}/${quizData.length}`;
    answersForm.innerHTML = "";
    feedback.textContent = "";
    feedback.className = "feedback";

    q.options.forEach(option => {
      const label = document.createElement("label");
      label.innerHTML = `
        <input type="radio" name="answer" value="${option}" />
        ${option}
      `;
      answersForm.appendChild(label);
    });

    progressBar.value = currentQuestion + 1;
    startTimer();
  }

  function startTimer() {
    clearInterval(timer);
    timeLeft = 60;
    updateTimerDisplay();

    timer = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();

      if (timeLeft <= 0) {
        clearInterval(timer);
        handleTimeout();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const seconds = String(timeLeft % 60).padStart(2, "0");
    timerDisplay.textContent = `⏱️ ${minutes}:${seconds}`;
  }

  function handleTimeout() {
    showFeedback("⏰ Temps écoulé !", false);
    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion < quizData.length) {
        loadQuestion();
      } else {
        endQuiz();
      }
    }, 1500);
  }

  submitBtn.addEventListener("click", () => {
    const selected = document.querySelector('input[name="answer"]:checked');
    if (!selected) return;

    clearInterval(timer);

    const isCorrect = selected.value === quizData[currentQuestion].answer;
    if (isCorrect) {
      score += 10;
      showFeedback("✅ Bonne réponse !", true);
    } else {
      showFeedback("❌ Mauvaise réponse !", false);
    }

    scoreDisplay.textContent = score;

    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion < quizData.length) {
        loadQuestion();
      } else {
        endQuiz();
      }
    }, 1500);
  });

  function showFeedback(message, isSuccess) {
    feedback.textContent = message;
    feedback.className = "feedback " + (isSuccess ? "success" : "error");
  }

  function endQuiz() {
    questionText.textContent = "🎉 Quiz terminé !";
    answersForm.innerHTML = `<p>Score final : <strong>${score} pts</strong></p>`;
    submitBtn.style.display = "none";
    timerDisplay.textContent = "⏱️ Terminé";
    feedback.textContent = "";
  }

  window.saveQuestion = function () {
    const category = document.getElementById("new-category").value.trim().toLowerCase();
    const question = document.getElementById("question").value.trim();
    const options = [
      document.getElementById("option1").value.trim(),
      document.getElementById("option2").value.trim(),
      document.getElementById("option3").value.trim(),
      document.getElementById("option4").value.trim()
    ];
    const answer = document.getElementById("answer").value.trim();

    if (!category || !question || options.includes("") || !answer) {
      alert("Merci de remplir tous les champs.");
      return;
    }

    const newQuestion = { question, options, answer };
    const key = "custom_" + category;
    const existing = JSON.parse(localStorage.getItem(key)) || [];
    existing.push(newQuestion);
    localStorage.setItem(key, JSON.stringify(existing));

    document.getElementById("message").textContent = "✅ Question enregistrée avec succès !";
    document.querySelectorAll("#create-section input, #create-section textarea").forEach(el => el.value = "");
  };

  window.resetQuestions = function () {
    if (confirm("Supprimer toutes les questions personnalisées ?")) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith("custom_")) {
          localStorage.removeItem(key);
        }
      });
      alert("✅ Toutes les questions personnalisées ont été supprimées.");
    }
  };

  window.exportQuestions = function () {
    const exportData = {};
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith("custom_")) {
        exportData[key] = JSON.parse(localStorage.getItem(key));
      }
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quizzone_questions.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  window.importQuestions = function () {
    const fileInput = document.getElementById("import-file");
    const file = fileInput.files[0];
    if (!file) {
      alert("Sélectionne un fichier JSON à importer.");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        Object.keys(data).forEach(key => {
          if (key.startsWith("custom_")) {
            localStorage.setItem(key, JSON.stringify(data[key]));
          }
        });
        alert("✅ Questions importées avec succès !");
      } catch (err) {
        alert("❌ Fichier invalide. Assure-toi qu'il s'agit d'un JSON exporté depuis QuizZone.");
      }
    };
    reader.readAsText(file);
  };
});

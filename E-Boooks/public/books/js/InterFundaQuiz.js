
/* ==========================================
   CODEVERSE - INTERNET FUNDAMENTALS QUIZ
========================================== */

const quizData = [
    {
        question: "What is the Internet?",
        options: [
            "A local computer program",
            "A global Wide Area Network",
            "A single website",
            "A web browser"
        ],
        answer: 1
    },
    {
        question: "What does WWW stand for?",
        options: [
            "World Wide Web",
            "World Web Window",
            "Wireless Wide Web",
            "Web World Website"
        ],
        answer: 0
    },
    {
        question: "Which protocol enables communication between web clients and web servers?",
        options: [
            "HTML",
            "FTP",
            "HTTP",
            "CSS"
        ],
        answer: 2
    },
    {
        question: "What does ISP stand for?",
        options: [
            "Internet Security Program",
            "Internet Service Provider",
            "Internal System Protocol",
            "Internet Software Platform"
        ],
        answer: 1
    },
    {
        question: "Which device allows several devices to share an Internet connection?",
        options: [
            "Monitor",
            "Keyboard",
            "Router",
            "Printer"
        ],
        answer: 2
    },
    {
        question: "What is cloud computing?",
        options: [
            "Storing and using services online",
            "Using only offline software",
            "Repairing computer hardware",
            "Connecting a printer"
        ],
        answer: 0
    },
    {
        question: "What is the main function of a web browser?",
        options: [
            "To create computer viruses",
            "To display webpages",
            "To manufacture hardware",
            "To replace an ISP"
        ],
        answer: 1
    },
    {
        question: "What is a hyperlink?",
        options: [
            "A computer storage device",
            "A type of Internet connection",
            "An element linking to another location or document",
            "A computer security program"
        ],
        answer: 2
    },
    {
        question: "What does URL stand for?",
        options: [
            "Universal Router Link",
            "Uniform Resource Locator",
            "User Resource Language",
            "Unified Reference Line"
        ],
        answer: 1
    },
    {
        question: "What is the main purpose of a browser cache?",
        options: [
            "To permanently delete webpages",
            "To create new websites",
            "To store temporary web data for faster access",
            "To disconnect a computer from the Internet"
        ],
        answer: 2
    }
];

const quizContainer = document.getElementById("quizQuestions");
const submitButton = document.getElementById("submitQuiz");
const retryButton = document.getElementById("retryQuiz");
const quizResult = document.getElementById("quizResult");
const quizProgress = document.getElementById("quizProgress");

function loadQuiz() {
    quizContainer.innerHTML = "";

    quizData.forEach((item, index) => {
        const questionBox = document.createElement("div");
        questionBox.className = "quiz-question";

        const title = document.createElement("h3");
        title.textContent = `${index + 1}. ${item.question}`;
        questionBox.appendChild(title);

        item.options.forEach((option, optionIndex) => {
            const label = document.createElement("label");
            label.className = "quiz-option";

            const input = document.createElement("input");
            input.type = "radio";
            input.name = `question${index}`;
            input.value = optionIndex;

            input.addEventListener("change", updateProgress);

            const span = document.createElement("span");
            span.textContent = option;

            label.append(input, span);
            questionBox.appendChild(label);
        });

        quizContainer.appendChild(questionBox);
    });

    quizResult.hidden = true;
    retryButton.hidden = true;
    submitButton.hidden = false;
    submitButton.disabled = false;

    updateProgress();
}

function updateProgress() {
    let answered = 0;

    quizData.forEach((item, index) => {
        if (document.querySelector(
            `input[name="question${index}"]:checked`
        )) {
            answered++;
        }
    });

    quizProgress.textContent =
        `${answered} of ${quizData.length} answered`;
}

function submitQuiz() {
    let score = 0;

    const allAnswered = quizData.every((item, index) =>
        document.querySelector(
            `input[name="question${index}"]:checked`
        )
    );

    if (!allAnswered) {
        alert("Please answer all questions before submitting.");
        return;
    }

    quizData.forEach((item, index) => {
        const questionBox = quizContainer.children[index];
        const selected = questionBox.querySelector(
            `input[name="question${index}"]:checked`
        );

        const selectedAnswer = Number(selected.value);
        const labels = questionBox.querySelectorAll(".quiz-option");

        if (selectedAnswer === item.answer) {
            score++;
        }

        labels.forEach((label, optionIndex) => {
            const input = label.querySelector("input");
            input.disabled = true;

            if (optionIndex === item.answer) {
                label.classList.add("correct");
            } else if (optionIndex === selectedAnswer) {
                label.classList.add("incorrect");
            }
        });

        const feedback = document.createElement("p");
        feedback.className = "quiz-feedback";

        feedback.textContent =
            selectedAnswer === item.answer
                ? "Correct answer!"
                : `Correct answer: ${item.options[item.answer]}`;

        questionBox.appendChild(feedback);
    });

    const percentage = Math.round(
        (score / quizData.length) * 100
    );

    
async function saveQuizResult() {
    try {
        const response = await fetch("/api/quiz-results", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify({
                bookId: 1,
                score: score,
                totalQuestions: questions.length
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log("Quiz result saved:", data);
            alert("Your quiz score has been saved!");
        } else {
            console.warn("Quiz result not saved:", data.message);
            alert(data.message || "Unable to save quiz score.");
        }

    } catch (error) {
        console.error("Error saving quiz result:", error);
        alert("Unable to connect to the server.");
    }
}

saveQuizResult();


    let message;

    if (percentage >= 90) {
        message = "Excellent work!";
    } else if (percentage >= 75) {
        message = "Great job!";
    } else if (percentage >= 60) {
        message = "Good effort! Keep reviewing.";
    } else {
        message = "Review the chapters and try again.";
    }

    quizResult.innerHTML = `
        <h3>Quiz Completed!</h3>
        <p>Your Score</p>
        <h2>${score} / ${quizData.length}</h2>
        <p>${percentage}%</p>
        <strong>${message}</strong>
    `;

    quizResult.hidden = false;
    submitButton.hidden = true;
    retryButton.hidden = false;

    quizResult.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

submitButton.addEventListener("click", submitQuiz);

retryButton.addEventListener("click", () => {
    loadQuiz();

    document.getElementById("quiz").scrollIntoView({
        behavior: "smooth"
    });
});

loadQuiz();

const root = document.getElementsByClassName('quiz-content')[0];

/**
 * Main state object
 */
const quiz = {
  index: 0,
  intervalId: null,
  time: {
    limit: 100,
    current: null,
    penalty: 10,
  },
  items: [
    {
      answer: 2,
      question: 'Inside which HTML element do we put the JavaScript?',
      options: ['<js>', '<javascript>', '<script>', '<scripting>'],
    },
    {
      answer: 2,
      question: 'Where is the correct place to insert a JavaScript?',
      options: ['Both the <head> section and the <body>', 'The <head> section', 'The <body> section'],
    },
    {
      answer: 0,
      question: 'How do you write "Hello World" in an alert box?',
      options: ['alert(Hello World)', 'msg(Hello World)', 'msgBox(Hello World)', 'alertBox(Hello World)', 'alertBox2(Hello World'],
    },
    {
      answer: 2,
      question: 'How do you round the number 7.25, to the nearest integer?',
      options: ['rnd(7.25)', 'round(7.25)', 'Math.round(7.25)', 'Math.rnd(7.25)'],
    },
    {
      answer: 0,
      question: 'How do you declare a JavaScript variable?',
      options: ['var carName', 'variable carName', 'v carName', 'variableCarName'],
    },
    {
      answer: 1,
      question: 'Is JavaScript case-sensitive?',
      options: ['No', 'Yes'],
    },
  ],
  refs: {
    feedback: document.getElementById('quiz-feedback'),
    highScores: document.getElementById('quiz-high-scores'),
    highScoresContainer: document.getElementById('high-scores'),
    timer: document.getElementById('quiz-timer'),
    title: document.getElementById('title'),
  },
  highScores: JSON.parse(localStorage.getItem('highScores')) || [],
};

/**
 * Update the existing title text.
 * @param {string} text Text to replace the existing title text.
 */
const updateTitle = (text) => {
  quiz.refs.title.textContent = text;
};

/**
 * Update the existing feedback text.
 * @param {string} text Text to replace the existing feedback text.
 */
const updateFeedback = (text) => {
  quiz.refs.feedback.textContent = text;
};

/**
 * Update the existing timer text.
 * @param {string} text Text to replace the existing timer text.
 */
const updateTimer = (text) => {
  quiz.refs.timer.textContent = text;
};

const HighScoresComponent = () => {
  const f = new DocumentFragment();

  const h1 = document.createElement('h1');
  h1.textContent = 'High Scores';

  const table = document.createElement('table');
  const tbody = table.createTBody();

  quiz.highScores.forEach((item) => {
    const tr = tbody.insertRow();
    tr.insertCell().textContent = item.name;
    tr.insertCell().textContent = item.score;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);

  const footer = () => {
    const div = document.createElement('div');

    const button1 = Button('Go Back');
    button1.addEventListener('click', (e) => {
      e.preventDefault();
      toggleHighScoresModal();
    });

    const button2 = Button('Clear High Scores');
    button2.addEventListener('click', (e) => {
      e.preventDefault();
      quiz.highScores = [];
      localStorage.clear();
      quiz.refs.highScoresContainer.replaceChildren(HighScoresComponent());
    });

    div.appendChild(button1);
    div.appendChild(button2);

    return div;
  };

  f.appendChild(h1);
  f.appendChild(table);
  f.appendChild(footer());

  return f;
};

const toggleHighScoresModal = () => {
  quiz.refs.highScoresContainer.replaceChildren(HighScoresComponent());

  quiz.refs.highScoresContainer.classList.toggle('show');
};

/**
 * Helper function to create a button element.
 * @param {string} value Button value content.
 * @returns {HTMLInputElement} Button element.
 */
const Button = (value) => {
  const button = document.createElement('input');
  button.setAttribute('type', 'button');
  button.setAttribute('value', value);
  return button;
};

/**
 * Component to show when teh quiz has been completed.
 * @returns
 */
const CompletedQuizComponent = () => {
  updateTitle('Congratulations!');
  updateFeedback('');

  const submit = (e) => {
    e.preventDefault();

    // If the input field is empty
    if (!input.value) {
      return;
    }

    // Add new high score
    quiz.highScores.push({
      name: input.value,
      score: quiz.time.current,
    });

    // Save
    localStorage.setItem('highScores', JSON.stringify(quiz.highScores));

    // Reset score
    quiz.time.current = 0;

    // Reset index
    quiz.index = 0;

    // Get back to start
    root.replaceChildren(StartQuizComponent());
  };

  const p = document.createElement('p');
  p.textContent = 'Your final score is ' + quiz.time.current;

  const form = document.createElement('form');
  form.addEventListener('submit', (e) => submit(e));

  const label = document.createElement('label');
  label.setAttribute('for', 'high-score-input');
  label.textContent = 'Enter initals:';

  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('id', 'high-score-input');

  const button = Button('Submit');
  button.addEventListener('click', (e) => submit(e));

  form.appendChild(p);
  form.appendChild(label);
  form.appendChild(input);
  form.appendChild(button);

  return form;
};

const endQuiz = () => {
  clearInterval(quiz.intervalId);
  quiz.intervalId = null;
  root.replaceChildren(CompletedQuizComponent());
  updateTimer('0');
};

/**
 *
 * @param {{
 *   answer: number,
 *   question: string,
 *   options: string[],
 * }} props Quiz selection.
 */
const QuizItemsComponent = (props) => {
  /**
   *
   * @param {{
   *   option: string,
   *   correct: boolean
   * }} props Question item.
   * @returns {node}
   */
  const QuizItemComponent = (props) => {
    const li = document.createElement('li');
    li.setAttribute('class', 'quiz-item');

    const button = Button(props.option);
    button.addEventListener('click', (e) => {
      e.preventDefault();

      // Update the quiz state object
      if (props.correct) {
        updateFeedback('Correct!');
      } else {
        if (quiz.time.current - quiz.time.penalty < 1) {
          endQuiz();
          return;
        }

        quiz.time.current -= quiz.time.penalty;
        updateFeedback('Wrong!');
      }

      quiz.index++;

      // Completed the quiz
      if (quiz.index === quiz.items.length) {
        endQuiz();
        return;
      }

      root.replaceChildren(QuizItemsComponent(quiz.items[quiz.index]));
    });

    li.appendChild(button);

    return li;
  };

  const ul = document.createElement('ul');
  ul.setAttribute('class', 'quiz-items');

  // Update title
  updateTitle(props.question);

  // Create options for each one
  props.options.forEach((option, optionIndex) => {
    ul.appendChild(
      QuizItemComponent({ option, correct: props.answer === optionIndex })
    );
  });

  return ul;
};

/**
 *
 * Quiz content while in page
 */
const ActiveQuizComponent = () => {
  // Timer handler
  quiz.time.current = quiz.time.limit;

  quiz.intervalId = setInterval(() => {
    // If the timer runs out
    if (quiz.time.current === 1) {
      endQuiz();
      updateFeedback('Timeout');
      return;
    }

    // Update timer
    quiz.time.current--;
    updateTimer(quiz.time.current);
  }, 1000);

  return QuizItemsComponent(quiz.items[quiz.index]);
};

/**
 *
 * Start quiz content.
 */
const StartQuizComponent = () => {
  updateTitle('Coding Quiz Challenge');
  updateTimer(quiz.time.limit);

  const div = document.createElement('div');
  div.setAttribute('class', 'quiz-start');

  const p1 = document.createElement('p');
  p1.textContent =
    'Try to answer the following code-related questions within the time limit.';
  const p2 = document.createElement('p');
  p2.textContent =
    'Keep in mind that the incorrect answers will penalise your score/time by ten seconds!';

  const button = Button('Start Quiz');

  // Trigger quiz start when click on 'Start Quiz' button
  button.addEventListener('click', (e) => {
    e.preventDefault();
    root.replaceChildren(ActiveQuizComponent());
  });

  div.appendChild(p1);
  div.appendChild(p2);
  div.appendChild(button);

  return div;
};

// Log high scores
quiz.refs.highScores.addEventListener('click', (e) => {
  e.preventDefault();
  toggleHighScoresModal();
});

root.replaceChildren(StartQuizComponent());

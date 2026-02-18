import { QUIZ_MAX_OPTIONS, QUIZ_MIN_OPTIONS } from "./caseQuizHelpers";

function CaseQuizCreatePanel({
  questions,
  onQuestionFieldChange,
  onOptionFieldChange,
  onCorrectOptionChange,
  onAddQuestion,
  onRemoveQuestion,
  onAddOption,
  onRemoveOption,
}) {
  return (
    <section className="card case-quiz-editor-card">
      <div className="case-quiz-editor-top">
        <h3>Pitanja kviza</h3>
        <button type="button" className="btn btn-secondary" onClick={onAddQuestion}>
          Dodaj pitanje
        </button>
      </div>

      {questions.length === 0 ? (
        <p className="case-quiz-empty">Kviz trenutno nema pitanja. Dodaj prvo pitanje.</p>
      ) : null}

      <div className="case-quiz-question-list">
        {questions.map((question, questionIndex) => (
          <article key={question.localKey} className="case-quiz-question-card">
            <div className="case-quiz-question-top">
              <h4>Pitanje #{questionIndex + 1}</h4>
              <button
                type="button"
                className="btn btn-secondary inline-action"
                onClick={() => onRemoveQuestion(question.localKey)}
              >
                Ukloni pitanje
              </button>
            </div>

            <label className="case-quiz-field">
              Tekst pitanja
              <input
                type="text"
                value={question.questionText}
                onChange={(event) =>
                  onQuestionFieldChange(question.localKey, "questionText", event.target.value)
                }
                placeholder="Npr. Koji je motiv osumnjičenog?"
              />
            </label>

            <label className="case-quiz-field">
              Objašnjenje tačnog odgovora
              <textarea
                rows={3}
                value={question.explanationText}
                onChange={(event) =>
                  onQuestionFieldChange(question.localKey, "explanationText", event.target.value)
                }
                placeholder="Kratko objasni zašto je odgovor tačan."
              />
            </label>

            <div className="case-quiz-option-list">
              {question.options.map((option) => (
                <label key={option.localKey} className="case-quiz-option-row">
                  <input
                    type="radio"
                    name={`correct-option-${question.localKey}`}
                    checked={option.isCorrect}
                    onChange={() => onCorrectOptionChange(question.localKey, option.localKey)}
                  />
                  <input
                    type="text"
                    value={option.optionText}
                    onChange={(event) =>
                      onOptionFieldChange(question.localKey, option.localKey, event.target.value)
                    }
                    placeholder={`Odgovor ${option.label}`}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary inline-action"
                    onClick={() => onRemoveOption(question.localKey, option.localKey)}
                    disabled={question.options.length <= QUIZ_MIN_OPTIONS}
                  >
                    Ukloni
                  </button>
                </label>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-primary inline-action"
              onClick={() => onAddOption(question.localKey)}
              disabled={question.options.length >= QUIZ_MAX_OPTIONS}
            >
              Dodaj odgovor
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CaseQuizCreatePanel;

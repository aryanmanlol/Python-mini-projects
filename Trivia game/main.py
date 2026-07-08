import random

questions = {
    "Who was the first Prime Minister of India?": "jawaharlal nehru",
    "Which planet is known as the Red Planet?": "mars",
    "What is the capital of France?": "paris",
    "Who wrote the Indian National Anthem?": "rabindranath tagore",
    "Which is the largest ocean in the world?": "pacific ocean",
    "How many players are there in a cricket team?": "11",
    "Who is known as the Father of the Nation in India?": "mahatma gandhi",
    "Which is the tallest mountain in the world?": "mount everest",
    "What is the national animal of India?": "tiger",
    "Who invented the telephone?": "alexander graham bell"
}

def python_trivia_game():
    questions_list = list(questions.keys())
    total_questions = 5
    score = 0

    selected_questions = random.sample(questions_list, total_questions)

    for idx, question in enumerate(selected_questions):
        print(f"{idx + 1}. {question}")

        user_answer = input("Your Answer: ").lower().strip()

        correct_answer = questions[question].lower().strip()

        print("User Answer:", user_answer)
        print("Correct Answer:", correct_answer)

        if user_answer.replace(" ", "") == correct_answer.lower().replace(" ", ""):
            print("Correct!\n")
            score += 1
        else:
            print(f"Wrong. The answer is: {correct_answer}.\n")

    print(f"Your score: {score}/{total_questions}")

python_trivia_game()
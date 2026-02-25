// Массив с жанрами книг 
const SUBJECTS = [
    'fantasy',
    'science_fiction',
    'romance',
    'history',
    'horror',
    'love'
];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
/*Функция принимает массив и возвращает его случайный элемент. 
Метод Math.random() генерирует дробное число от 0 до 1, которое умножается на длину массива.
Затем Math.floor округляет это число в меньшую сторону, чтобы получить корректный 
целый индекс массива*/

// Основная функция генерации данных о книгах
export async function generateBooks(count = 10) {
    // Цикл на 5 попыток, если API вернет ошибку
    for (let attempt = 0; attempt < 5; attempt++) {
        const subject = randomItem(SUBJECTS); // Выбирается случайный жанр
        const url = `https://openlibrary.org/subjects/${subject}.json?limit=50`;

        const response = await fetch(url); // Делается асинхронный запрос к серверу
        if (!response.ok) continue; // Если сервер ответил ошибкой, начинается сл попытка
       
        const data = await response.json(); // Преобразуется ответ из формата JSON в объект JS
        if (!data.works || !Array.isArray(data.works)) continue;  // Проверка есть ли в данных массив книг (works)

        // Обработка полученного массива данных
        const books = data.works
            .filter(b => b.title && b.authors?.length) // Оставляются только те, где есть название и автор
            .slice(0, count) // Берется нужное количество (по умолчанию 10)
            .map(book => ({
                id: crypto.randomUUID(), // Генерируется уникальный ID для каждой книги
                title: book.title, // Название
                author: book.authors.map(a => a.name).join(', '), // Соединяются имена авторов через запятую
                genre: subject, // Жанр, который выбрали в начале
                year: book.first_publish_year ?? null, // Год издания (если есть)
                rating: +(Math.random() * 2 + 3).toFixed(1) // Генерируется случайный рейтинг от 3.0 до 5.0
            }));

        if (books.length > 0) {
            return books; // Если массив сформирован возвращаем его
        }
    }
    // Если после всех попыток данных нет, выходит ошибку
    throw new Error('Не удалось сгенерировать книги');
}
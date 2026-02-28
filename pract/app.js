import { generateBooks } from './script/bookGenerator.js';

// Основное хранилище данных — массив объектов книг
let books = [];

// Поиск и сохранение ссылок на элементы страницы (DOM-узлы)
const tableBody = document.getElementById('table-body'); // Тело таблицы для вывода книг
const countEl = document.getElementById('count'); // Счетчик количества книг
const searchInput = document.getElementById('search'); // Поле поиска
const form = document.getElementById('book-form'); // Форма добавления/редактирования

// Асинхронная функция для первичной или повторной загрузки данных
async function loadBooks() {
    try {
        books = await generateBooks(10); //Получение массива из 10 книг
        render(); //Отображение книг
    } catch (error) {
        console.error("Ошибка при загрузке книг:", error);
        alert('Не удалось загрузить данные');
    }
}

// Для кнопки загрузить/обновить
document.getElementById('reload').addEventListener('click', loadBooks);

// Функция для отрисовки данных в таблице
function render() {
    tableBody.innerHTML = ''; // Полностью очищается таблицу перед новой отрисовкой
    
    // Получается текст из поиска и приводится к нижнему регистру для сравнения
    const query = searchInput.value.toLowerCase().trim();
    
    // Фильтрация массива книг по названию или автору
    const filtered = books.filter(book => 
        (book.title.toLowerCase().includes(query)) || 
        (book.author.toLowerCase().includes(query))
    );
    
    // Проход по каждой отфильтрованной книге
    filtered.forEach(book => {
        const tr = document.createElement('tr'); // Создание новой строки таблицы
        tr.dataset.id = book.id; // Привязка ID книги к атрибуту строки (data-id)
        
        // Наполннение строки ячейками с данными и кнопками управления
        tr.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.genre || ''}</td>
            <td>${book.year ?? ''}</td>
            <td>${book.rating ?? ''}</td>
            <td>
                <button class="edit">Редактировать</button>
                <button class="delete">Удалить</button>
            </td>
        `;
        tableBody.appendChild(tr); // Добавляем готовую строку в таблицу на страницу
    });
    
    // Обновление текстовый счетчик на странице
    countEl.textContent = filtered.length;
}

// Передача событий для кнопок в таблице (удаление и редактирование)
tableBody.addEventListener('click', e => {
    // Находим строку tr, в которой нажали кнопку
    const row = e.target.closest('tr');
    if (!row) return;
    
    const id = row.dataset.id; // Берется id из атрибута строки

    // Если нажата кнопка удалить
    if (e.target.classList.contains('delete')) {
        if (!confirm('Действительно удалить книгу?')) return;
            // Остаются в массиве только те книги,  которых id не совпадает с выбранным

            books = books.filter(book => book.id !== id);
            render(); // Перерисовка таблицы
        }
    
     // Если нажата кнопка редактировать
    if (e.target.classList.contains('edit')) {
        const book = books.find(book => book.id === id); // Ищется объект книги в массиве
        if (book) fillForm(book); // Передаются данные книги в функцию заполнения формы
    }
});

// Обработка отправки формы (сохранение новой или отредактированной книги)
form.addEventListener('submit', e => {
    e.preventDefault(); // Запрет на стандартную перезагрузку страницы при отправке
    
    const formData = new FormData(form); // Сбор всех данных из полей формы
    const data = Object.fromEntries(formData); // Превращаение их в обычный объект

    const bookData = normalizeBook(data); // Формируем объект с данными книги, приводя строки в числа

 if (data.id) {
        // Если id в форме был это редактирование существующей книги
        const book = books.find(b => b.id === data.id);
        if (book) {
            Object.assign(book, bookData); // Обновление поля объекта в массиве
        } 
    }   else {
        // Если id нет это создание новой книги
        books.push({
            id: crypto.randomUUID(), // Создание нового id
            ...bookData // Добавление остальные поля
        });
    }
    
    form.reset(); // Очищение поля формы
    form.querySelector('[name="id"]').value = ''; // Очищаем скрытое поле id
    render(); // Обновление таблицу на экране
});

// Функция для заполнения формы данными книги перед редактированием
function fillForm(book) {
    form.querySelector('[name="id"]').value = book.id;
    form.querySelector('[name="title"]').value = book.title;
    form.querySelector('[name="author"]').value = book.author;
    form.querySelector('[name="genre"]').value = book.genre || '';
    form.querySelector('[name="year"]').value = book.year || '';
    form.querySelector('[name="rating"]').value = book.rating || '';
}
// Вызов render, чтобы искккать в реальном времени, при каждом вводе символа в поле поиска
searchInput.addEventListener('input', render);

// Экспорт массива книг в файл JSON
document.getElementById('export').addEventListener('click', () => {
    const json = JSON.stringify(books, null, 2); // Превращение массива объектов в строку JSON с отступами
    const blob = new Blob([json], { type: 'application/json' }); // Создание бинарного объекта файла
    const url = URL.createObjectURL(blob); // Создание временной ссылки на этот файл
    
    const a = document.createElement('a'); // Созданине невидимой ссылки
    a.href = url;
    a.download = 'books.json'; // Имя файла при скачивании
    a.click(); // Имитация клика для начала загрузки
    
    URL.revokeObjectURL(url); // Удаление временной ссылки из памяти
});
// Запуск начальной загрузки данных при открытии страницы
loadBooks();










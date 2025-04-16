const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');  // Модуль для работы с временными папками
const app = express();
const port = process.env.PORT || 3000;

// Конфигурируем multer для загрузки файлов в временную папку
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, os.tmpdir());  // Используем временную папку
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// Статические файлы
app.use(express.static('uploads'));

// Главная страница с формой загрузки
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Страница просмотра изображения
app.get('/view/:imageId', (req, res) => {
    const imagePath = path.join(os.tmpdir(), req.params.imageId);  // Путь к изображению в временной папке
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
        // После первого просмотра удаляем файл
        fs.unlink(imagePath, (err) => {
            if (err) console.error('Ошибка при удалении изображения:', err);
        });
    } else {
        res.status(404).send('Это изображение больше не доступно.');
    }
});

// Обработка загрузки изображения
app.post('/upload', upload.single('image'), (req, res) => {
    const imageId = req.file.filename;
    res.redirect(`/view/${imageId}`);
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер работает на порту ${port}`);
});

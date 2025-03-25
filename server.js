const fs = require("fs");
const express = require("express");
const path = require("path");
const app = express();
const PORT = 3000;

const RESULTS_FILE = path.join(__dirname, "results.json");

app.use(express.json());
app.use(express.static(__dirname + "/public"));

// Функція для перевірки існування JSON-файлу
function ensureResultsFile() {
    if (!fs.existsSync(RESULTS_FILE)) {
        fs.writeFileSync(RESULTS_FILE, "[]", "utf8"); // Якщо файл не існує, створюємо пустий масив
    }
}

// Функція для завантаження результатів з JSON
function loadResults() {
    ensureResultsFile();
    try {
        const data = fs.readFileSync(RESULTS_FILE, "utf8");
        return JSON.parse(data) || []; // Якщо файл порожній, повертаємо масив
    } catch (error) {
        console.error("🚨 Помилка читання JSON:", error);
        return [];
    }
}

// Функція для збереження результатів
function saveResults(results) {
    try {
        fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2), "utf8");
    } catch (error) {
        console.error("🚨 Помилка запису JSON:", error);
    }
}

// API для отримання результатів
app.get("/results", (req, res) => {
    res.json(loadResults());
});

// API для збереження результатів
app.post("/results", (req, res) => {
    const results = loadResults();
    const newResult = req.body;

    console.log("📥 Отримано новий результат:", newResult);

    results.push(newResult); // Додаємо новий результат
    saveResults(results);

    res.json({ success: true, message: "Результат збережено!" });
});

// API для скачування JSON-файлу
app.get("/download-results", (req, res) => {
    ensureResultsFile();
    res.download(RESULTS_FILE, "game_results.json", (err) => {
        if (err) {
            console.error("🚨 Помилка скачування файлу:", err);
            res.status(500).json({ error: "Помилка завантаження файлу" });
        }
    });
});

// Запускаємо сервер
app.listen(PORT, () => {
    ensureResultsFile();
    console.log(`🚀 Сервер працює на http://localhost:${PORT}`);
});

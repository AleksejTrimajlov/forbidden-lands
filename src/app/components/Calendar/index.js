// components/Calendar.js
"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./Calendar.module.css";

const Calendar = () => {
  // Определение структуры года
  const SEASONS = [
    { name: "Начало лета", days: 45 },
    { name: "Закат лета", days: 46 },
    { name: "Начало осени", days: 45 },
    { name: "Закат осени", days: 46 },
    { name: "Начало зимы", days: 45 },
    { name: "Закат зимы", days: 46 },
    { name: "Начало весны", days: 45 },
    { name: "Закат весны", days: 46 },
  ];

  const TOTAL_YEAR_MINUTES = 364 * 24 * 60; // Общее количество минут в году

  const [jsonData, setJsonData] = useState("");
  const [importJson, setImportJson] = useState("");
  const [showJson, setShowJson] = useState(false);
  const jsonTextareaRef = useRef(null);
  // Состояния компонента
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(0);
  const [selectedDay, setSelectedDay] = useState(1);
  const [startDate, setStartDate] = useState(null);
  const [elapsedTime, setElapsedTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  const generateJsonData = () => {
    const data = {
      currentDate: calculateCurrentDate(),
      startDate,
      elapsedTime,
      totalMinutes,
      version: "1.0",
      system: "Forbidden Lands",
    };
    return JSON.stringify(data, null, 2);
  };
  // Обновление JSON данных при изменении состояния
  useEffect(() => {
    setJsonData(generateJsonData());
  }, [totalMinutes, startDate, elapsedTime]);
  // Инициализация из localStorage
  useEffect(() => {
    const savedTime = localStorage.getItem("gameTime");
    const savedStartDate = localStorage.getItem("startDate");
    if (savedTime) {
      setTotalMinutes(parseInt(savedTime));
    }
    if (savedStartDate) setStartDate(JSON.parse(savedStartDate));
  }, []);
  // Копирование JSON в буфер обмена
  const copyToClipboard = () => {
    if (jsonTextareaRef.current) {
      jsonTextareaRef.current.select();
      document.execCommand("copy");
      alert("Данные скопированы в буфер обмена!");
    }
  };

  // Импорт данных из JSON
  const importFromJson = () => {
    try {
      const data = JSON.parse(importJson);

      if (data.totalMinutes !== undefined) {
        setTotalMinutes(data.totalMinutes);
      }

      if (data.startDate) {
        setStartDate(data.startDate);
      }

      if (data.currentDate && data.currentDate.totalMinutes !== undefined) {
        setTotalMinutes(data.currentDate.totalMinutes);
      }

      alert("Данные успешно загружены!");
    } catch (error) {
      alert("Ошибка при разборе JSON: " + error.message);
    }
  };
  // Сохранение состояния
  useEffect(() => {
    localStorage.setItem("gameTime", totalMinutes.toString());
    if (startDate) {
      localStorage.setItem("startDate", JSON.stringify(startDate));
    }
  }, [totalMinutes, startDate]);
  // Расчет прошедшего времени
  useEffect(() => {
    if (!startDate) return;

    const currentMinutes = totalMinutes;
    const startTotalMinutes = startDate.totalMinutes;

    let diffMinutes = currentMinutes - startTotalMinutes;
    if (diffMinutes < 0) {
      diffMinutes += TOTAL_YEAR_MINUTES;
    }

    const days = Math.floor(diffMinutes / (24 * 60));
    const hours = Math.floor((diffMinutes % (24 * 60)) / 60);
    const minutes = diffMinutes % 60;

    setElapsedTime({ days, hours, minutes });
  }, [totalMinutes, startDate, TOTAL_YEAR_MINUTES]);
  // Вычисление текущей даты
  const calculateCurrentDate = () => {
    const dayOfYear = Math.floor(totalMinutes / (24 * 60)) % 364;
    const minutesInDay = totalMinutes % (24 * 60);

    let daysCount = 0;
    for (let i = 0; i < SEASONS.length; i++) {
      if (dayOfYear < daysCount + SEASONS[i].days) {
        return {
          season: SEASONS[i].name,
          day: dayOfYear - daysCount + 1,
          hour: Math.floor(minutesInDay / 60),
          minute: minutesInDay % 60,
          totalMinutes: totalMinutes,
        };
      }
      daysCount += SEASONS[i].days;
    }
    return {
      season: "Начало лета",
      day: 1,
      hour: 0,
      minute: 0,
      totalMinutes: totalMinutes,
    };
  };

  // Изменение времени
  const adjustTime = (minutes) => {
    setTotalMinutes((prev) => {
      const newValue = prev + minutes;
      return newValue >= 0 ? newValue : TOTAL_YEAR_MINUTES + newValue;
    });
  };

  // Установка начальной даты
  const setStartDateHandler = () => {
    let totalDays = 0;
    for (let i = 0; i < selectedSeason; i++) {
      totalDays += SEASONS[i].days;
    }
    totalDays += selectedDay - 1;

    setTotalMinutes(totalDays * 24 * 60);
    setStartDate(calculateCurrentDate());
  };

  // Генерация опций дней для выбранного сезона
  const dayOptions = () => {
    return Array.from(
      { length: SEASONS[selectedSeason].days },
      (_, i) => i + 1
    );
  };

  const { season, day, hour, minute } = calculateCurrentDate();

  return (
    <div className={styles.calendar}>
      <div className={styles.timeDisplay}>
        {season}, День {day}, {hour.toString().padStart(2, "0")}:
        {minute.toString().padStart(2, "0")}
      </div>
      {/* Новый блок: Прошедшее время */}

      <div className={styles.elapsedTime}>
        <h3>Время с начала путешествия:</h3>
        <div className={styles.elapsedValues}>
          <span>{elapsedTime?.days ? elapsedTime.days : 0} дней</span>
          <span>{elapsedTime?.hours ? elapsedTime.hours : 0} часов</span>
          <span>{elapsedTime?.minutes ? elapsedTime.minutes : 0} минут</span>
        </div>
        <div className={styles.startDateInfo}>
          Старт: {startDate?.season ? startDate?.season : "Начало лета"}, День{" "}
          {startDate?.day ?? 0}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.timeAdjusters}>
          {[
            { label: "-1d", value: -1440 },
            { label: "-6h", value: -360 },
            { label: "-1h", value: -60 },
            { label: "-15m", value: -15 },
            { label: "-5m", value: -5 },
            { label: "-1m", value: -1 },
            { label: "+1m", value: 1 },
            { label: "+5m", value: 5 },
            { label: "+15m", value: 15 },
            { label: "+1h", value: 60 },
            { label: "+6h", value: 360 },
            { label: "+1d", value: 1440 },
          ].map((btn, index) => (
            <button
              key={index}
              onClick={() => adjustTime(btn.value)}
              className={styles.timeButton}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <div className={styles.dateSelector}>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
            className={styles.seasonSelect}
          >
            {SEASONS.map((season, index) => (
              <option key={index} value={index}>
                {season.name}
              </option>
            ))}
          </select>

          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(parseInt(e.target.value))}
            className={styles.daySelect}
          >
            {dayOptions().map((day) => (
              <option key={day} value={day}>
                День {day}
              </option>
            ))}
          </select>

          <button
            onClick={setStartDateHandler}
            className={styles.setDateButton}
          >
            Установить дату
          </button>
        </div>
      </div>
      <div className={styles.jsonSection}>
        <button
          onClick={() => setShowJson(!showJson)}
          className={styles.toggleJsonButton}
        >
          {showJson ? "Скрыть JSON" : "Показать JSON данные"}
        </button>

        {showJson && (
          <div className={styles.jsonContainer}>
            <div className={styles.jsonActions}>
              <button onClick={copyToClipboard} className={styles.jsonButton}>
                Копировать JSON
              </button>
              <button
                onClick={() => setJsonData(generateJsonData())}
                className={styles.jsonButton}
              >
                Обновить JSON
              </button>
            </div>

            <textarea
              ref={jsonTextareaRef}
              readOnly
              value={jsonData}
              className={styles.jsonData}
              rows={10}
            />

            <div className={styles.importSection}>
              <h4>Импортировать данные:</h4>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className={styles.jsonData}
                placeholder="Вставьте JSON данные здесь..."
                rows={5}
              />
              <button onClick={importFromJson} className={styles.importButton}>
                Загрузить из JSON
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;

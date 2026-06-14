// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then((reg) => console.log('[Service Worker] Registered successfully:', reg.scope))
      .catch((err) => console.error('[Service Worker] Registration failed:', err));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE VARIABLES ---
  let currentDate = new Date();
  let timerInterval = null;
  let timerTimeLeft = 1500; // Default 25 mins in seconds
  let timerDuration = 1500;
  let timerIsRunning = false;
  let timerMode = 'focus'; // 'focus', 'short', 'long'

  // --- CUSTOM PREMIUM MODALS HELPERS ---
  function showCustomAlert(title, message, onCloseCallback) {
    const alertModal = document.getElementById('modal-alert');
    document.getElementById('modal-alert-title').textContent = title;
    document.getElementById('modal-alert-message').textContent = message;
    
    const closeBtn = document.getElementById('modal-alert-close');
    const handleClose = () => {
      alertModal.classList.add('hidden');
      closeBtn.removeEventListener('click', handleClose);
      if (onCloseCallback) onCloseCallback();
    };
    
    closeBtn.addEventListener('click', handleClose);
    alertModal.classList.remove('hidden');
  }

  function showCustomConfirm(onProceed) {
    const confirmModal = document.getElementById('modal-confirm');
    const cancelBtn = document.getElementById('modal-confirm-cancel');
    const proceedBtn = document.getElementById('modal-confirm-proceed');
    
    const handleCancel = () => {
      confirmModal.classList.add('hidden');
      cleanup();
    };
    
    const handleProceed = () => {
      confirmModal.classList.add('hidden');
      cleanup();
      if (onProceed) onProceed();
    };
    
    const cleanup = () => {
      cancelBtn.removeEventListener('click', handleCancel);
      proceedBtn.removeEventListener('click', handleProceed);
    };
    
    cancelBtn.addEventListener('click', handleCancel);
    proceedBtn.addEventListener('click', handleProceed);
    confirmModal.classList.remove('hidden');
  }

  // --- TIME BLOCKS CONFIG ---
  const TIME_SLOTS = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00'
  ];

  // --- DOM ELEMENTS ---
  const dateLabel = document.getElementById('date-label');
  const printDateLabel = document.getElementById('print-date');
  const hiddenDatePicker = document.getElementById('hidden-date-picker');
  const prevDayBtn = document.getElementById('prev-day-btn');
  const nextDayBtn = document.getElementById('next-day-btn');
  const printBtn = document.getElementById('print-btn');
  const resetBtn = document.getElementById('reset-btn');

  const timeSlotsContainer = document.getElementById('time-slots-container');

  const focusWordInput = document.getElementById('focus-word-input');
  const priorityInputs = document.querySelectorAll('.priority-input');
  const priorityCheckboxes = document.querySelectorAll('.priority-checkbox');
  const priorityItems = document.querySelectorAll('.priority-item');

  const moodButtons = document.querySelectorAll('.mood-btn');
  const waterGlasses = document.querySelectorAll('.water-glass');
  const breakfastInput = document.getElementById('breakfast-input');
  const lunchInput = document.getElementById('lunch-input');
  const dinnerInput = document.getElementById('dinner-input');
  const exerciseInput = document.getElementById('exercise-input');
  const sleepInput = document.getElementById('sleep-input');

  const winsInput = document.getElementById('wins-input');
  const gratitudeInput = document.getElementById('gratitude-input');
  const tomorrowFocusInput = document.getElementById('tomorrow-focus-input');

  // Pomodoro
  const timerNumbers = document.getElementById('timer-numbers');
  const timerToggleBtn = document.getElementById('timer-toggle-btn');
  const timerResetBtn = document.getElementById('timer-reset-btn');
  const timerTabs = document.querySelectorAll('.timer-tab');
  const progressCircle = document.querySelector('.progress-ring-circle');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const timerSound = document.getElementById('timer-sound');
  const timerTaskLabel = document.getElementById('timer-task-label');

  // Insights Sidebar
  const insightsSidebar = document.getElementById('insights-sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const completionBar = document.getElementById('completion-bar');
  const completionRateText = document.getElementById('completion-rate-text');
  const hydrationBar = document.getElementById('hydration-bar');
  const avgHydrationText = document.getElementById('avg-hydration-text');
  const avgMoodStars = document.getElementById('avg-mood-stars');

  // Circle Circumference: 2 * Math.PI * 72 = 452.389
  const CIRCLE_CIRCUMFERENCE = 452.389;

  // --- INITIALIZE APP ---
  function init() {
    setupTimeSlots();
    updateDateDisplay();
    loadDayData();
    setupEventListeners();
    initTimerDisplay();
    updateInsights();
  }

  // Generate scheduler time slot rows
  function setupTimeSlots() {
    timeSlotsContainer.innerHTML = '';
    TIME_SLOTS.forEach(time => {
      const row = document.createElement('div');
      row.className = 'time-slot-row';
      row.dataset.hour = time;
      row.innerHTML = `
        <span class="time-label">${time}</span>
        <input type="text" class="time-input" placeholder="Plan schedule / activities...">
        <div class="category-dots no-print">
          <button class="dot-btn dot-work" data-cat="work" title="Work / Project"></button>
          <button class="dot-btn dot-self" data-cat="self" title="Self-Care / Rest"></button>
          <button class="dot-btn dot-meals" data-cat="meals" title="Health / Meals"></button>
          <button class="dot-btn dot-focus" data-cat="focus" title="Deep Focus"></button>
          <button class="dot-btn dot-exercise" data-cat="exercise" title="Exercise / Sport"></button>
        </div>
      `;
      timeSlotsContainer.appendChild(row);
    });
  }

  // --- DATE MANAGEMENT ---
  function formatDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function updateDateDisplay() {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formatted = currentDate.toLocaleDateString(navigator.language || 'en-US', options);
    dateLabel.textContent = formatted;
    printDateLabel.textContent = formatted;
    hiddenDatePicker.value = formatDateString(currentDate);
  }

  // --- LOCAL STORAGE DATA SYNC ---
  function getStorageKey() {
    return `focusflow_log_${formatDateString(currentDate)}`;
  }

  // Load data for the selected day
  function loadDayData() {
    const key = getStorageKey();
    const data = JSON.parse(localStorage.getItem(key)) || {};

    // Focus Intention
    focusWordInput.value = data.focusWord || '';

    // Priorities
    const pText = data.prioritiesText || ['', '', ''];
    const pChecked = data.prioritiesChecked || [false, false, false];
    priorityInputs.forEach((input, index) => {
      input.value = pText[index] || '';
    });
    priorityCheckboxes.forEach((checkbox, index) => {
      if (pChecked[index]) {
        checkbox.classList.add('checked');
        priorityItems[index].classList.add('completed');
      } else {
        checkbox.classList.remove('checked');
        priorityItems[index].classList.remove('completed');
      }
    });

    // Mood
    const selectedMood = data.mood || 3;
    updateMoodUI(selectedMood);

    // Water Log
    const filledGlassesCount = data.water || 0;
    updateWaterUI(filledGlassesCount);

    // Diet / Workout / Sleep
    breakfastInput.value = data.breakfast || '';
    lunchInput.value = data.lunch || '';
    dinnerInput.value = data.dinner || '';
    exerciseInput.value = data.exercise || '';
    sleepInput.value = data.sleep || '';

    // Reflections
    winsInput.value = data.wins || '';
    gratitudeInput.value = data.gratitude || '';
    tomorrowFocusInput.value = data.tomorrowFocus || '';

    // Time slots
    const slotsData = data.timeSlots || {};
    const rows = document.querySelectorAll('.time-slot-row');
    rows.forEach(row => {
      const hour = row.dataset.hour;
      const input = row.querySelector('.time-input');
      const slotInfo = slotsData[hour] || { text: '', category: '' };

      input.value = slotInfo.text;
      
      // Clear old category classes
      row.className = 'time-slot-row';
      if (slotInfo.category) {
        row.classList.add(`cat-${slotInfo.category}`);
        row.dataset.category = slotInfo.category;
      } else {
        delete row.dataset.category;
      }
    });
  }

  // Auto-Save details of current page state to LocalStorage
  function saveDayData() {
    const key = getStorageKey();

    // Priorities Text & Checks
    const prioritiesText = Array.from(priorityInputs).map(input => input.value);
    const prioritiesChecked = Array.from(priorityCheckboxes).map(box => box.classList.contains('checked'));

    // Mood
    const activeMoodBtn = document.querySelector('.mood-btn.active');
    const mood = activeMoodBtn ? parseInt(activeMoodBtn.dataset.mood) : 3;

    // Hydration Glasses filled
    const water = document.querySelectorAll('.water-glass.filled').length;

    // Time Slots scheduler data
    const timeSlots = {};
    const rows = document.querySelectorAll('.time-slot-row');
    rows.forEach(row => {
      const hour = row.dataset.hour;
      const text = row.querySelector('.time-input').value;
      const category = row.dataset.category || '';
      timeSlots[hour] = { text, category };
    });

    const data = {
      focusWord: focusWordInput.value,
      prioritiesText,
      prioritiesChecked,
      mood,
      water,
      breakfast: breakfastInput.value,
      lunch: lunchInput.value,
      dinner: dinnerInput.value,
      exercise: exerciseInput.value,
      sleep: sleepInput.value,
      wins: winsInput.value,
      gratitude: gratitudeInput.value,
      tomorrowFocus: tomorrowFocusInput.value,
      timeSlots
    };

    localStorage.setItem(key, JSON.stringify(data));
    updateInsights();
  }

  // --- UI UPDATERS ---
  function updateMoodUI(moodValue) {
    moodButtons.forEach(btn => {
      if (parseInt(btn.dataset.mood) === moodValue) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function updateWaterUI(filledGlassesCount) {
    waterGlasses.forEach((glass, index) => {
      if (index < filledGlassesCount) {
        glass.classList.add('filled');
      } else {
        glass.classList.remove('filled');
      }
    });
  }

  // --- EVENT LISTENERS REGISTRATION ---
  function setupEventListeners() {
    // Save state on any keystroke or input selection changes
    const inputsToWatch = [
      focusWordInput, breakfastInput, lunchInput, dinnerInput,
      exerciseInput, sleepInput, winsInput, gratitudeInput, tomorrowFocusInput
    ];
    inputsToWatch.forEach(input => {
      input.addEventListener('input', saveDayData);
    });

    // Priorities inputs
    priorityInputs.forEach(input => {
      input.addEventListener('input', saveDayData);
    });

    // Scheduler inputs
    timeSlotsContainer.addEventListener('input', (e) => {
      if (e.target.classList.contains('time-input')) {
        saveDayData();
      }
    });

    // Date Navigation
    prevDayBtn.addEventListener('click', () => {
      currentDate.setDate(currentDate.getDate() - 1);
      updateDateDisplay();
      loadDayData();
    });

    nextDayBtn.addEventListener('click', () => {
      currentDate.setDate(currentDate.getDate() + 1);
      updateDateDisplay();
      loadDayData();
    });

    hiddenDatePicker.addEventListener('change', (e) => {
      currentDate = new Date(e.target.value);
      updateDateDisplay();
      loadDayData();
    });

    // Reset current day's fields
    resetBtn.addEventListener('click', () => {
      showCustomConfirm(() => {
        const key = getStorageKey();
        localStorage.removeItem(key);
        loadDayData();
        updateInsights();
      });
    });

    // Print / Export
    printBtn.addEventListener('click', () => {
      window.print();
    });

    // Checkbox priorities triggers
    priorityCheckboxes.forEach((checkbox, index) => {
      checkbox.addEventListener('click', () => {
        checkbox.classList.toggle('checked');
        priorityItems[index].classList.toggle('completed');
        saveDayData();
      });
    });

    // Mood triggers
    moodButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseInt(btn.dataset.mood);
        updateMoodUI(val);
        saveDayData();
      });
    });

    // Water glass triggers
    waterGlasses.forEach((glass, index) => {
      glass.addEventListener('click', () => {
        const isFilled = glass.classList.contains('filled');
        let newFilledCount = index + 1;
        
        // If they click the exact glass that was the highest filled glass, toggle it off
        const filledGlassesCount = document.querySelectorAll('.water-glass.filled').length;
        if (isFilled && filledGlassesCount === index + 1) {
          newFilledCount = index;
        }

        updateWaterUI(newFilledCount);
        saveDayData();
      });
    });

    // Category dot toggling on Time Blocker
    timeSlotsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('dot-btn')) {
        const btn = e.target;
        const row = btn.closest('.time-slot-row');
        const cat = btn.dataset.cat;
        
        // If clicked active one, toggle category off
        if (row.classList.contains(`cat-${cat}`)) {
          row.className = 'time-slot-row';
          delete row.dataset.category;
        } else {
          row.className = `time-slot-row cat-${cat}`;
          row.dataset.category = cat;
        }
        saveDayData();
      }
    });

    // Sidebar Slide Toggle
    sidebarToggle.addEventListener('click', () => {
      insightsSidebar.classList.toggle('open');
    });

    // Pomodoro Timer Controls
    timerToggleBtn.addEventListener('click', toggleTimer);
    timerResetBtn.addEventListener('click', resetTimer);

    timerTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        timerTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        const mode = e.target.dataset.mode;
        setTimerMode(mode);
      });
    });
  }

  // --- POMODORO TIMER CORE ---
  function initTimerDisplay() {
    progressCircle.style.strokeDasharray = CIRCLE_CIRCUMFERENCE;
    progressCircle.style.strokeDashoffset = 0;
    setTimerMode('focus');
  }

  function setTimerMode(mode) {
    timerMode = mode;
    stopTimer();

    if (mode === 'focus') {
      timerDuration = 1500; // 25m
      timerTaskLabel.textContent = 'Time to focus!';
    } else if (mode === 'short') {
      timerDuration = 300; // 5m
      timerTaskLabel.textContent = 'Take a short breath.';
    } else if (mode === 'long') {
      timerDuration = 900; // 15m
      timerTaskLabel.textContent = 'Relax & stretch.';
    }

    timerTimeLeft = timerDuration;
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const mins = Math.floor(timerTimeLeft / 60);
    const secs = timerTimeLeft % 60;
    const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    // Update digits
    timerNumbers.textContent = formattedTime;

    // Update browser tab title
    const modeEmoji = timerMode === 'focus' ? '🎯' : '☕';
    document.title = `(${formattedTime}) ${modeEmoji} Focus Flow`;

    // Update SVG progress circle
    const progressFraction = timerTimeLeft / timerDuration;
    const offset = CIRCLE_CIRCUMFERENCE * (1 - progressFraction);
    progressCircle.style.strokeDashoffset = offset;
  }

  function toggleTimer() {
    if (timerIsRunning) {
      stopTimer();
    } else {
      startTimer();
    }
  }

  function startTimer() {
    if (timerIsRunning) return;
    timerIsRunning = true;
    
    // Toggle button icons
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');

    timerInterval = setInterval(() => {
      timerTimeLeft--;
      if (timerTimeLeft < 0) {
        timerSound.play();
        clearInterval(timerInterval);
        timerIsRunning = false;
        
        // Auto alert / Switch modes
        if (timerMode === 'focus') {
          showCustomAlert(
            "Focus Session Complete!", 
            "Excellent job staying on task. Take 5 minutes to stretch, hydrate, and relax.",
            () => { setTimerMode('short'); }
          );
        } else {
          showCustomAlert(
            "Break Complete!", 
            "Ready to dive back into deep work? Let's start the next session.",
            () => { setTimerMode('focus'); }
          );
        }
      } else {
        updateTimerDisplay();
      }
    }, 1000);
  }

  function stopTimer() {
    timerIsRunning = false;
    clearInterval(timerInterval);
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
  }

  function resetTimer() {
    stopTimer();
    timerTimeLeft = timerDuration;
    updateTimerDisplay();
  }

  // --- STATS & INSIGHTS GENERATION ---
  function updateInsights() {
    const last7DaysData = [];
    const dateCursor = new Date(currentDate);

    // Get last 7 days keys
    for (let i = 0; i < 7; i++) {
      const formatted = formatDateString(dateCursor);
      const log = JSON.parse(localStorage.getItem(`focusflow_log_${formatted}`));
      if (log) {
        last7DaysData.push(log);
      }
      dateCursor.setDate(dateCursor.getDate() - 1);
    }

    if (last7DaysData.length === 0) {
      completionBar.style.width = '0%';
      completionRateText.textContent = '0% (No data recorded yet)';
      hydrationBar.style.width = '0%';
      avgHydrationText.textContent = '0.0 / 8 Glasses';
      avgMoodStars.textContent = 'Neutral (3.0/5.0)';
      return;
    }

    // 1. Completion rate of Top 3 priorities
    let totalPriorities = 0;
    let completedPriorities = 0;
    
    last7DaysData.forEach(dayLog => {
      // Find how many text inputs had actual content
      const activePrioritiesCount = dayLog.prioritiesText 
        ? dayLog.prioritiesText.filter(text => text.trim() !== '').length 
        : 0;
      
      totalPriorities += activePrioritiesCount;
      
      if (dayLog.prioritiesChecked && dayLog.prioritiesText) {
        dayLog.prioritiesChecked.forEach((isChecked, idx) => {
          if (isChecked && dayLog.prioritiesText[idx] && dayLog.prioritiesText[idx].trim() !== '') {
            completedPriorities++;
          }
        });
      }
    });

    const completionRate = totalPriorities > 0 ? Math.round((completedPriorities / totalPriorities) * 100) : 0;
    completionBar.style.width = `${completionRate}%`;
    completionRateText.textContent = `${completionRate}% (${completedPriorities} of ${totalPriorities} tasks completed)`;

    // 2. Average daily hydration
    let totalWaterGlasses = 0;
    last7DaysData.forEach(dayLog => {
      totalWaterGlasses += dayLog.water || 0;
    });
    const avgWater = Math.round((totalWaterGlasses / last7DaysData.length) * 10) / 10;
    const waterPercentage = Math.min(Math.round((avgWater / 8) * 100), 100);
    hydrationBar.style.width = `${waterPercentage}%`;
    avgHydrationText.textContent = `${avgWater} / 8 Glasses average`;

    // 3. Average Energy/Mood
    let totalMood = 0;
    last7DaysData.forEach(dayLog => {
      totalMood += dayLog.mood || 3;
    });
    const avgMood = Math.round((totalMood / last7DaysData.length) * 10) / 10;
    
    let moodDescr = 'Neutral';
    if (avgMood < 2.0) moodDescr = 'Low Energy';
    else if (avgMood < 2.8) moodDescr = 'Tired';
    else if (avgMood < 3.8) moodDescr = 'Focused / Good';
    else if (avgMood < 4.6) moodDescr = 'Inspired';
    else moodDescr = 'Peak Flow';

    avgMoodStars.textContent = `${moodDescr} (${avgMood} / 5.0)`;
  }

  // Start application
  init();
});

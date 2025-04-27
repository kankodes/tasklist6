document.addEventListener('DOMContentLoaded', function() {
  
  let tasks = [];
  let currentFilter = 'all';

  // Theme Toggle
  const toggle = document.getElementById('toggleTheme');
  if (toggle) {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark', currentTheme === 'dark');
    toggle.checked = currentTheme === 'dark';
    toggle.addEventListener('change', () => {
      document.body.classList.toggle('dark', toggle.checked);
      localStorage.setItem('theme', toggle.checked ? 'dark' : 'light');
    });
  }

  // Filter Buttons
  document.querySelectorAll('.filters button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.filters button.active').classList.remove('active');
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // Clock
  function updateTime() {
    const now = new Date();
    document.getElementById('currentTime').innerText =
      `it’s ${now.toLocaleString('en-GB',{day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})} right now.`;
  }
  setInterval(updateTime, 1000);
  updateTime();

  // Main Functions
  window.addTask = function() {
    const name = document.getElementById('taskName').value.trim();
    const date = document.getElementById('taskDate').value;
    const time = document.getElementById('taskTime').value;
    if (!name || !date || !time) {
      alert('Please fill all fields!');
      return;
    }
    tasks.push({ id: Date.now(), name, date, time, completed: false });
    renderTasks();
    closePopup();
    clearFields();
  }

  window.deleteTask = function(id) {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
  }

  window.toggleComplete = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      renderTasks();
    }
  }

  window.editTime = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const time = prompt("New time (HH:MM)", task.time || "11:00");
      const date = prompt("New date (YYYY-MM-DD)", task.date || new Date().toISOString().slice(0,10));
      if (time && date) {
        task.time = time;
        task.date = date;
        renderTasks();
      }
    }
  }

  window.editName = function(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const newName = prompt("Edit task name", task.name);
      if (newName) {
        task.name = newName;
        renderTasks();
      }
    }
  }

  window.clearAll = function() {
    if (confirm("Clear all tasks?")) {
      tasks = [];
      renderTasks();
    }
  }

  function formatTime(t) {
    let [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;
    return `${h}:${String(m).padStart(2,'0')} ${ampm}`;
  }

  function formatDate(d) {
    const today = new Date().toDateString();
    const selected = new Date(d).toDateString();
    if (today === selected) return "Today";
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }

  function clearFields() {
    document.getElementById('taskName').value = '';
    document.getElementById('taskDate').value = '';
    document.getElementById('taskTime').value = '';
  }

  window.openPopup = function() {
    document.getElementById('popup').style.display = 'flex';
  }

  window.closePopup = function() {
    document.getElementById('popup').style.display = 'none';
  }

  function renderTasks() {
    const tasksContainer = document.getElementById('tasks');
    tasksContainer.innerHTML = '';

    tasks
      .filter(task => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'completed') return task.completed;
        if (currentFilter === 'pending') return !task.completed;
      })
      .forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-item' + (task.completed ? ' completed' : '');

        if (new Date(task.date).toDateString() === new Date().toDateString()) {
          taskDiv.style.backgroundColor = 'var(--highlight)';
        }

        taskDiv.innerHTML = `
          <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete(${task.id})">
          <label ondblclick="editName(${task.id})">${task.name}</label>
          <div class="task-time" onclick="editTime(${task.id})">
            <span>${formatTime(task.time)}</span>
            <span>${formatDate(task.date)}</span>
          </div>
          <button class="delete-btn" onclick="deleteTask(${task.id})">delete</button>
        `;
        tasksContainer.appendChild(taskDiv);
      });

    const doneCount = tasks.filter(t => t.completed).length;
    document.getElementById('progress').innerText = `${doneCount} of ${tasks.length} completed`;
  }

  // ✅ Binding Done button to Add Task!
  document.getElementById('doneButton').addEventListener('click', addTask);

  // Initial render
  renderTasks();
});

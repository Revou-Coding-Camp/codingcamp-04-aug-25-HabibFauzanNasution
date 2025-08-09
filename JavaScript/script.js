        class TodoApp {
            constructor() {
                this.tasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
                this.currentFilter = 'all';
                this.taskInput = document.getElementById('taskInput');
                this.dateInput = document.getElementById('dateInput');
                this.addBtn = document.getElementById('addBtn');
                this.deleteAllBtn = document.getElementById('deleteAllBtn');
                this.todoList = document.getElementById('todoList');
                this.noTasks = document.getElementById('noTasks');
                this.filterBtns = document.querySelectorAll('.filter-btn');

                this.initEventListeners();
                this.renderTasks();
            }

            initEventListeners() {
                this.addBtn.addEventListener('click', () => this.addTask());
                this.taskInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.addTask();
                });
                
                // Delete All button - using direct binding
                this.deleteAllBtn.onclick = () => {
                    console.log('Delete All clicked!');
                    this.deleteAllTasks();
                };
                
                // Filter button event listeners
                this.filterBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.setFilter(e.target.getAttribute('data-filter'));
                    });
                });

                // Event delegation for dynamically created buttons
                this.todoList.addEventListener('click', (e) => {
                    if (e.target.classList.contains('delete-task-btn')) {
                        const taskId = parseInt(e.target.getAttribute('data-task-id'));
                        this.deleteTask(taskId);
                    } else if (e.target.classList.contains('status-toggle')) {
                        const taskId = parseInt(e.target.getAttribute('data-task-id'));
                        this.toggleTaskStatus(taskId);
                    }
                });
            }

            setFilter(filter) {
                this.currentFilter = filter;
                
                // Update active filter button
                this.filterBtns.forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
                
                this.renderTasks();
            }

            getFilteredTasks() {
                switch (this.currentFilter) {
                    case 'completed':
                        return this.tasks.filter(task => task.completed);
                    case 'pending':
                        return this.tasks.filter(task => !task.completed);
                    default:
                        return this.tasks;
                }
            }

            addTask() {
                const taskText = this.taskInput.value.trim();
                const taskDate = this.dateInput.value;

                if (!taskText) {
                    alert('Please enter a task!');
                    return;
                }

                const newTask = {
                    id: Date.now(),
                    text: taskText,
                    date: taskDate || this.getCurrentDate(),
                    completed: false,
                    createdAt: new Date().toISOString()
                };

                this.tasks.unshift(newTask);
                this.saveTasks();
                this.renderTasks();
                this.clearInputs();
            }

            deleteTask(taskId) {
                console.log('Deleting task with ID:', taskId);
                if (confirm('Are you sure you want to delete this task?')) {
                    this.tasks = this.tasks.filter(t => t.id !== taskId);
                    console.log('Task deleted. Remaining tasks:', this.tasks.length);
                    this.saveTasks();
                    this.renderTasks();
                }
            }

            toggleTaskStatus(taskId) {
                console.log('Toggling task status for ID:', taskId);
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    task.completed = !task.completed;
                    console.log('Task status changed to:', task.completed ? 'completed' : 'pending');
                    this.saveTasks();
                    this.renderTasks();
                }
            }

            deleteAllTasks() {
                console.log('Delete All button clicked!'); // Debug log
                const filteredTasks = this.getFilteredTasks();
                console.log('Filtered tasks:', filteredTasks); // Debug log
                
                if (filteredTasks.length === 0) {
                    let message = 'No tasks to delete!';
                    if (this.currentFilter === 'completed') {
                        message = 'No completed tasks to delete!';
                    } else if (this.currentFilter === 'pending') {
                        message = 'No pending tasks to delete!';
                    }
                    alert(message);
                    return;
                }

                let confirmMessage = 'Are you sure you want to delete all tasks?';
                if (this.currentFilter === 'completed') {
                    confirmMessage = 'Are you sure you want to delete all completed tasks?';
                } else if (this.currentFilter === 'pending') {
                    confirmMessage = 'Are you sure you want to delete all pending tasks?';
                }

                if (confirm(confirmMessage)) {
                    console.log('User confirmed deletion'); // Debug log
                    if (this.currentFilter === 'all') {
                        this.tasks = [];
                        console.log('Deleted all tasks');
                    } else if (this.currentFilter === 'completed') {
                        // Keep only pending tasks
                        this.tasks = this.tasks.filter(task => !task.completed);
                        console.log('Deleted completed tasks');
                    } else if (this.currentFilter === 'pending') {
                        // Keep only completed tasks
                        this.tasks = this.tasks.filter(task => task.completed);
                        console.log('Deleted pending tasks');
                    }
                    console.log('Remaining tasks:', this.tasks); // Debug log
                    this.saveTasks();
                    this.renderTasks();
                }
            }

            formatDate(dateString) {
                if (!dateString) return 'No date';
                
                const date = new Date(dateString);
                const options = { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                };
                return date.toLocaleDateString('id-ID', options);
            }

            getCurrentDate() {
                const today = new Date();
                return today.toISOString().split('T')[0];
            }

            renderTasks() {
                const filteredTasks = this.getFilteredTasks();
                
                if (filteredTasks.length === 0) {
                    let message = 'No task found';
                    if (this.currentFilter === 'completed') {
                        message = 'No completed tasks';
                    } else if (this.currentFilter === 'pending') {
                        message = 'No pending tasks';
                    }
                    this.todoList.innerHTML = `<div class="no-tasks">${message}</div>`;
                    return;
                }

                const tasksHTML = filteredTasks.map(task => `
                    <div class="todo-item">
                        <div class="task-text ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.text)}</div>
                        <div class="task-date">${this.formatDate(task.date)}</div>
                        <button class="status-toggle ${task.completed ? 'completed' : ''}" 
                                data-task-id="${task.id}">
                            ${task.completed ? 'Completed' : 'Pending'}
                        </button>
                        <button class="delete-task-btn" data-task-id="${task.id}">
                            Delete
                        </button>
                    </div>
                `).join('');

                this.todoList.innerHTML = tasksHTML;
            }

            escapeHtml(text) {
                const map = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                };
                return text.replace(/[&<>"']/g, m => map[m]);
            }

            clearInputs() {
                this.taskInput.value = '';
                this.dateInput.value = '';
                this.taskInput.focus();
            }

            saveTasks() {
                localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
            }
        }

        // Initialize the app
        const todoApp = new TodoApp();
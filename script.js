const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const fileInput = document.getElementById('file-input');

// State initialization from LocalStorage
const getLocalStorage = () => {
  const data = localStorage.getItem('transactions');
  try {
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error loading transactions:', e);
    return [];
  }
};

let transactions = getLocalStorage();

/* Add transaction */
function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('請輸入名稱和金額');
    return;
  }

  const transaction = {
    id: generateID(),
    text: text.value,
    amount: +amount.value,
    date: new Date().toLocaleString()
  };

  transactions.push(transaction);
  updateLocalStorage();
  init();

  // Clear input fields
  text.value = '';
  amount.value = '';
}



// Generate random ID
function generateID() {
  return Math.floor(Math.random() * 100000000);
}

// Add transactions to DOM list
function addTransactionDOM(transaction) {
  // Get sign
  const sign = transaction.amount < 0 ? '-' : '+';

  const item = document.createElement('li');

  // Add class based on value
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

  // Include transaction text, amount, and date
  item.innerHTML = `
    <div class="content-box">
      <span class="text-content">${transaction.text}</span>
      <small class="date">${transaction.date || '無日期'}</small>
    </div>
    <div class="amount-box">
      <span>${sign}$${Math.abs(transaction.amount)}</span>
      <div class="action-btns">
        <button class="edit-btn" onclick="editTransaction(${transaction.id})">✎</button>
        <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
      </div>
    </div>
  `;

  list.appendChild(item);
}

// Update the balance, income and expense
function updateValues() {
  const amounts = transactions.map(transaction => transaction.amount);

  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

  const income = amounts
    .filter(item => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);

  const expense = (
    amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) *
    -1
  ).toFixed(2);

  balance.innerText = `$${total}`;
  money_plus.innerText = `+$${income}`;
  money_minus.innerText = `-$${expense}`;
}

// Edit transaction
function editTransaction(id) {
  const transaction = transactions.find(t => t.id === id);
  if (!transaction) return;

  const newText = prompt('修改項目名稱:', transaction.text);
  if (newText === null || newText.trim() === '') return;

  const newAmount = prompt('修改金額 (正數為收入，負數為支出):', transaction.amount);
  if (newAmount === null || isNaN(newAmount) || newAmount.trim() === '') return;

  transaction.text = newText;
  transaction.amount = +newAmount;
  
  updateLocalStorage();
  init();
}

// Remove transaction by ID
function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);

  updateLocalStorage();

  init();
}

// Update local storage transactions
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Init app
function init() {
  list.innerHTML = '';
  // Show all transactions, newest first
  const allTransactions = [...transactions].reverse();
  allTransactions.forEach(addTransactionDOM);
  updateValues();
}

init();

// Export data to a file
function exportData() {
  const dataStr = JSON.stringify(transactions, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `expense_tracker_backup_${new Date().toLocaleDateString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import data from a file
function importData(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const importedTransactions = JSON.parse(event.target.result);
      if (Array.isArray(importedTransactions)) {
        if (confirm('匯入將會覆蓋目前的紀錄，確定嗎？')) {
          transactions = importedTransactions;
          updateLocalStorage();
          init();
          alert('資料匯入成功！');
        }
      } else {
        alert('檔案格式錯誤');
      }
    } catch (err) {
      alert('解析檔案失敗');
    }
  };
  reader.readAsText(file);
  // Reset input so the same file can be imported again if needed
  e.target.value = '';
}

form.addEventListener('submit', addTransaction);
exportBtn.addEventListener('click', exportData);
importBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', importData);

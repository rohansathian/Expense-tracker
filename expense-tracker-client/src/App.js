import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editExpenseId, setEditExpenseId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/expenses')
      .then(response => setExpenses(response.data))
      .catch(error => console.error('Error fetching expenses:', error));
  }, []);

  const addOrUpdateExpense = async () => {
    if (!title || !amount || !category || !date) return alert('Please enter title, amount, category, and select a date.');

    const expenseData = { title, amount: parseFloat(amount), category, date };

    try {
      if (isEditing) {
        const response = await axios.put(`http://localhost:5000/expenses/${editExpenseId}`, expenseData);
        setExpenses(expenses.map(expense => expense._id === editExpenseId ? response.data : expense));
        setIsEditing(false);
        setEditExpenseId(null);
      } else {
        const response = await axios.post('http://localhost:5000/expenses', expenseData);
        setExpenses([...expenses, response.data]);
      }
      setTitle('');
      setAmount('');
      setCategory('');
      setDate('');
    } catch (error) {
      console.error(isEditing ? 'Error updating expense:' : 'Error adding expense:', error);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/expenses/${id}`);
      setExpenses(expenses.filter(expense => expense._id !== id));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const startEditing = (expense) => {
    setIsEditing(true);
    setEditExpenseId(expense._id);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDate(expense.date.split('T')[0]);
  };

  const categories = ['Home', 'College', 'Travelling', 'Food', 'Medicine'];

  // Function to get expenses categorized and filtered by selected month
  const getCategorizedExpenses = () => {
    const [year, month] = selectedMonth.split('-');
    return categories.reduce((acc, category) => {
      const categoryExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return (
          expense.category === category &&
          (!selectedMonth || (
            expenseDate.getFullYear() === parseInt(year) &&
            expenseDate.getMonth() + 1 === parseInt(month)
          ))
        );
      });
      
      if (categoryExpenses.length > 0) { // Only include categories with expenses
        acc[category] = {
          expenses: categoryExpenses,
          total: categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        };
      }
      return acc;
    }, {});
  };

  const categorizedExpenses = getCategorizedExpenses();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Expense Tracker</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Expense Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ marginRight: '10px' }}
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        <button onClick={addOrUpdateExpense}>{isEditing ? 'Update Expense' : 'Add Expense'}</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Select Month to View Total Expense:</h3>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        {selectedMonth && (
          <h3>Total for {selectedMonth}: ₹{
            Object.values(categorizedExpenses).reduce((sum, { total }) => sum + total, 0)
          }</h3>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {Object.keys(categorizedExpenses).map(cat => (
          <div key={cat} style={{ flex: '1', padding: '10px', border: '1px solid #ccc', margin: '10px', width: '100%' }}>
            <h2>{cat}</h2>
            <ul>
              {categorizedExpenses[cat].expenses.map(expense => (
                <li key={expense._id}>
                  {new Date(expense.date).toLocaleDateString()} - {expense.title}: ₹{expense.amount}
                  <button onClick={() => startEditing(expense)} style={{ marginLeft: '10px' }}>Edit</button>
                  <button onClick={() => deleteExpense(expense._id)} style={{ marginLeft: '10px' }}>Delete</button>
                </li>
              ))}
            </ul>
            <h3>Total for {cat}: ₹{categorizedExpenses[cat].total}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

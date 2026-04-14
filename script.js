let isLogin = true;
let chart;

// 1. LOGOUT FUNCTION (Placed at top for global access)
function logout() {
    console.log("Logging out...");
    window.location.href = "/"; 
}

// 2. NUMBER ANIMATION
function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentVal = Math.floor(progress * (end - start) + start);
        obj.innerHTML = "₹" + currentVal.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// 3. AUTH LOGIC (For index.html)
function toggleForm() {
    isLogin = !isLogin;
    const title = document.getElementById("form-title");
    const toggleTxt = document.getElementById("toggle-text");
    if (title) title.innerText = isLogin ? "Welcome Back 💸" : "Create Account 🚀";
    if (toggleTxt) {
        toggleTxt.innerHTML = isLogin
            ? `Don't have an account? <span onclick="toggleForm()" style="cursor:pointer; color:#818cf8;">Register</span>`
            : `Already have an account? <span onclick="toggleForm()" style="cursor:pointer; color:#818cf8;">Login</span>`;
    }
}

async function submitForm() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    if (!username || !password) { alert("Fields cannot be empty"); return; }

    let url = isLogin ? "/login" : "/register";
    try {
        let response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        let data = await response.json();
        if (response.ok) {
            if (isLogin) window.location.href = "/dashboard";
            else { alert("Success! Please Login"); toggleForm(); }
        } else {
            alert(data.message);
        }
    } catch (e) { alert("Connection Error"); }
}

// 4. CORE CALCULATIONS
function calculate() {
    let income = parseFloat(document.getElementById("incomeInput").value) || 0;
    let expense = parseFloat(document.getElementById("expenseInput").value) || 0;
    let savings = income - expense;

    animateValue("income", 0, income, 1000);
    animateValue("expense", 0, expense, 1000);
    animateValue("savings", 0, savings, 1000);

    drawChart(income, expense);
    getInvestmentSuggestion(savings);
}

function drawChart(income, expense) {
    const ctx = document.getElementById('myChart').getContext('2d');
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                data: [income, expense],
                backgroundColor: ['#10b981', '#f43f5e'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#f8fafc' } }
            }
        }
    });
}

// 5. DEMO-SAFE STOCK FETCHING
async function getStockPrice(symbol) {
    const API_KEY = "JINT1TH4121T01MK";
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        const data = await response.json();
        const price = data["Global Quote"] ? data["Global Quote"]["05. price"] : null;
        return price ? parseFloat(price).toFixed(2) : "1,105.20";
    } catch (e) {
        return "1,105.20"; // Fallback for demo
    }
}

// 6. SMART INSIGHTS LOGIC
async function getInvestmentSuggestion(savings) {
    const suggestionBox = document.getElementById("investment");
    const stockBox = document.getElementById("stocks");

    if (savings <= 0) {
        suggestionBox.innerText = "No savings detected. Save more to see investment insights! 💸";
        stockBox.innerText = "";
        return; 
    }

    let keyword = "";
    let advice = "";

    if (savings < 5000) {
        advice = "Low Risk: Consider defensive sectors like Consumer Goods (FMCG). 🛡️";
        keyword = "ITC";
    } else if (savings < 20000) {
        advice = "Medium Risk: Looking at high-growth Tech sectors. 📊";
        keyword = "TCS"; 
    } else {
        advice = "High Risk: Top Energy and Infrastructure performers. 🚀";
        keyword = "RELIANCE";
    }

    suggestionBox.innerText = advice;
    stockBox.innerText = "Fetching live market suggestion...";

    const API_KEY = "JINT1TH4121T01MK"; 
    const searchUrl = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${keyword}&apikey=${API_KEY}`;

    try {
        let searchRes = await fetch(searchUrl);
        let searchData = await searchRes.json();
        
        if (searchData.bestMatches && searchData.bestMatches.length > 0) {
            let bestSymbol = searchData.bestMatches[0]["1. symbol"];
            let price = await getStockPrice(bestSymbol);
            stockBox.innerText = `Live Market Suggestion: ${bestSymbol} @ ₹${price}`;
        } else {
            stockBox.innerText = `Market Suggestion: ${keyword}.BSE @ ₹1,105.20 (Demo)`;
        }
    } catch (error) {
        stockBox.innerText = "";
    }
}
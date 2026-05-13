import { initCart } from './cart.js';

const API_URL = 'v1/api';

export function initAuth() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.removeEventListener('submit', handleLogin);
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.removeEventListener('submit', handleRegister);
        registerForm.addEventListener('submit', handleRegister);
    }

    updateAuthUI();
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const token = await response.text();
            const cleanToken = token.startsWith('"') && token.endsWith('"') ? token.slice(1, -1) : token;
            localStorage.setItem('token', cleanToken);
            initCart();
            updateAuthUI();
            window.showToast?.('Login realizado com sucesso!', 'success');
            window.showSection('home');
        } else {
            const data = await response.json();
            window.showToast?.(data.errors ? data.errors.join(' ') : 'Erro ao realizar login', 'error');
        }
    } catch {
        window.showToast?.('Erro de conexão com o servidor', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (password !== confirmPassword) {
        alert('As senhas não coincidem');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, confirmPassword })
        });

        if (response.status === 201) {
            window.showToast?.('Cadastro realizado! Faça login para continuar.', 'success');
            window.showSection('login');
        } else {
            const data = await response.json();
            window.showToast?.(data.errors ? data.errors.join(' ') : 'Erro ao realizar cadastro', 'error');
        }
    } catch {
        window.showToast?.('Erro de conexão com o servidor', 'error');
    }
}

export function updateAuthUI() {
    const token = localStorage.getItem('token');
    document.getElementById('login-nav')?.classList.toggle('d-none', !!token);
    document.getElementById('logout-nav')?.classList.toggle('d-none', !token);
}

export function logout() {
    localStorage.removeItem('token');
    updateAuthUI();
    location.reload();
}

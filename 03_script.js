
const aiChatBtn = document.getElementById('aiChatBtn');
const aiChatModal = document.getElementById('aiChatModal');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const chatMessages = document.getElementById('chatMessages');
const quickQuestions = document.querySelectorAll('.quick-question');

const aiResponses = {
    'post-workout': "As a Pro member, here's the perfect post-workout meal: Try a protein smoothie with Greek yogurt, banana, and spinach within 30 minutes. Follow with grilled chicken and sweet potato within 2 hours. Aim for 3:1 carb to protein ratio for optimal recovery!",
    'muscle': "Building muscle as a Pro member: Focus on progressive overload with your premium workouts, eat 1g protein per lb bodyweight (use your calorie tracker!), get 7-9 hours sleep, and stay consistent. Your meal plans are designed to support muscle growth perfectly!",
    'recovery': "Pro recovery tips: Use your premium Zen Flow Yoga sessions, prioritize sleep, stay hydrated, and eat anti-inflammatory foods from your meal plans. Consider adding magnesium supplements and foam rolling. Recovery is where the magic happens!",
    'default': "Great question! As your Pro AI coach, I recommend checking your personalized meal plans and premium workout library. Every Pro member gets customized advice based on their goals. What specific area would you like to focus on today?"
};

function getAIResponse(message) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('post-workout') || lowerMessage.includes('meal')) return aiResponses['post-workout'];
    if (lowerMessage.includes('muscle') || lowerMessage.includes('build')) return aiResponses['muscle'];
    if (lowerMessage.includes('recovery') || lowerMessage.includes('rest')) return aiResponses['recovery'];
    return aiResponses['default'];
}

function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex gap-3';

    messageDiv.innerHTML = isUser ? `
        <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 ml-auto">
            <i class="fas fa-user text-gray-600 text-sm"></i>
        </div>
        <div class="bg-indigo-600 text-white rounded-lg p-3 max-w-[80%] ml-auto">
            <p class="text-sm">${text}</p>
        </div>
    ` : `
        <div class="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <i class="fas fa-robot text-white text-sm"></i>
        </div>
        <div class="bg-gray-100 rounded-lg p-3 max-w-[80%]">
            <p class="text-sm">${text}</p>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    addMessage(message, true);
    chatInput.value = '';
    setTimeout(() => addMessage(getAIResponse(message)), 1000);
}

aiChatBtn.addEventListener('click', () => {
    aiChatModal.classList.remove('hidden');
    chatInput.focus();
});

closeChatBtn.addEventListener('click', () => aiChatModal.classList.add('hidden'));

aiChatModal.addEventListener('click', e => {
    if (e.target === aiChatModal) aiChatModal.classList.add('hidden');
});

sendChatBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});

quickQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
        const question = btn.textContent;
        addMessage(question, true);
        setTimeout(() => addMessage(getAIResponse(question)), 1000);
    });
});

const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const icon = darkModeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.transform = 'translateY(0)';
            entry.target.style.opacity = '1';
        }
    });
}, observerOptions);

document.querySelectorAll('.floating-card').forEach(card => {
    card.style.transform = 'translateY(20px)';
    card.style.opacity = '0';
    card.style.transition = 'all 0.6s ease';
    observer.observe(card);
});

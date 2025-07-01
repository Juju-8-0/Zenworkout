const aiChatBtn = document.getElementById('aiChatBtn');
const aiChatModal = document.getElementById('aiChatModal');
const closeChatBtn = document.getElementById('closeChatBtn');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const chatMessages = document.getElementById('chatMessages');
const quickQuestions = document.querySelectorAll('.quick-question');

const aiResponses = {
  "post-workout": "Try a protein smoothie with Greek yogurt, banana, and spinach.",
  "muscle": "Focus on progressive overload and eat enough protein.",
  "recovery": "Get 8+ hours of sleep, stretch, and hydrate.",
  "default": "I’m here to help! Ask me anything about your fitness journey."
};

function getAIResponse(msg) {
  const text = msg.toLowerCase();
  if (text.includes("eat") || text.includes("meal")) return aiResponses["post-workout"];
  if (text.includes("muscle") || text.includes("build")) return aiResponses["muscle"];
  if (text.includes("rest") || text.includes("recovery")) return aiResponses["recovery"];
  return aiResponses["default"];
}

function addMessage(text, isUser = false) {
  const msg = document.createElement('div');
  msg.textContent = text;
  msg.style.margin = "0.5rem 0";
  msg.style.textAlign = isUser ? "right" : "left";
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;
  addMessage(msg, true);
  chatInput.value = "";
  setTimeout(() => {
    addMessage(getAIResponse(msg));
  }, 1000);
}

aiChatBtn.addEventListener('click', () => aiChatModal.classList.remove('hidden'));
closeChatBtn.addEventListener('click', () => aiChatModal.classList.add('hidden'));
sendChatBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', e => {
  if (e.key === "Enter") sendMessage();
});
quickQuestions.forEach(btn => {
  btn.addEventListener('click', () => {
    const question = btn.textContent;
    addMessage(question, true);
    setTimeout(() => addMessage(getAIResponse(question)), 1000);
  });
});

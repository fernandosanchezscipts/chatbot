const form = document.getElementById('chat-form');
const chatbox = document.getElementById('chatbox');
const saveBtn = document.getElementById('save-btn');
let conversation = [];

// Format time as HH:MM AM/PM
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Add a chat bubble
function addMessage(role, text, isImage = false) {
  const bubble = document.createElement('div');
  bubble.classList.add('bubble', role);

  if (isImage) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(text);
    img.className = 'preview-img';
    bubble.appendChild(img);
  } else {
    bubble.innerText = text;
  }

  const timestamp = document.createElement('span');
  timestamp.className = 'timestamp';
  timestamp.innerText = formatTime(new Date());
  bubble.appendChild(timestamp);

  chatbox.appendChild(bubble);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// Handle chat submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const message = document.getElementById('user-input').value.trim();
  const image = document.getElementById('image-upload').files[0];
  if (!message && !image) return;

  if (message) {
    addMessage('user', message);
    conversation.push({ role: 'user', content: message });
  } else {
    addMessage('user', image, true);
    conversation.push({ role: 'user', content: '[Image uploaded]' });
  }

  const formData = new FormData();
  formData.append('message', message);
  if (image) formData.append('image', image);

  // Show typing animation
  const loadingBubble = document.createElement('div');
  loadingBubble.classList.add('bubble', 'gpt', 'loading');
  loadingBubble.innerHTML = `<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>`;
  chatbox.appendChild(loadingBubble);
  chatbox.scrollTop = chatbox.scrollHeight;

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    loadingBubble.remove();

    addMessage('gpt', data.reply);
    conversation.push({ role: 'assistant', content: data.reply });
  } catch (err) {
    loadingBubble.remove();
    addMessage('gpt', "❌ Something went wrong. Please try again.");
  }

  form.reset();
});

// Save chat history as JSON
saveBtn.addEventListener('click', () => {
  const filename = `chat_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
  const blob = new Blob([JSON.stringify(conversation, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
});


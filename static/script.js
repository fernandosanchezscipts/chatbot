const form = document.getElementById('chat-form');
const chatbox = document.getElementById('chatbox');
const saveBtn = document.getElementById('save-btn');
const toggle = document.getElementById('theme-toggle');
let conversation = [];

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

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

  const loading = document.createElement('div');
  loading.classList.add('bubble', 'gpt', 'loading');
  loading.innerHTML = `<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>`;
  chatbox.appendChild(loading);
  chatbox.scrollTop = chatbox.scrollHeight;

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    loading.remove();
    addMessage('gpt', data.reply);
    conversation.push({ role: 'assistant', content: data.reply });
  } catch (err) {
    loading.remove();
    addMessage('gpt', "Something went wrong.");
  }

  form.reset();
});

saveBtn.addEventListener('click', () => {
  const filename = `chat_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
  const blob = new Blob([JSON.stringify(conversation, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
});

toggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
});


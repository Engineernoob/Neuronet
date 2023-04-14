import bot from './assets/bot2.svg';
import user from './assets/u.svg';

const form = document.querySelector('form');
const chatcontainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  element.innerHTML = '';

  loadInterval = setInterval(() => {
    element.innerHTML += '...';

    if (element.innerHTML === '....') {
      element.innerHTML = '';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi && 'ai'}">
      <div class="chat">
        <div class="profile">
          <img
            src="${isAi ? bot : user}"
            alt="${isAi ? 'bot' : 'user'}"
          />
        </div>
        <div className="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
  `;
}

const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(form);

  // user's chatstripe
  chatcontainer.innerHTML += chatStripe(false, formData.get('prompt'));

  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();

  chatcontainer.innerHTML += chatStripe(true, '', uniqueId);

  chatcontainer.scrollTop = chatcontainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server -> bot's response

  const response = await fetch(
    'http://localhost:5173',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: formData.get('prompt'),
      })
    }
  )
  typeText(messageDiv, 'Bot is typing...');

  response.ok ? typeText(messageDiv, await response.json().bot.trim()) : (messageDiv.innerHTML = 'Something went wrong', alert(await response.text()));
  clearInterval(loadInterval);
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    handleSubmit(e);
  }
});
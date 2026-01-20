function hideAll() {
  document.querySelectorAll('.card > div').forEach(div => {
    div.classList.add('hidden');
  });
}

function showLogin() {
  hideAll();
  document.getElementById('login').classList.remove('hidden');
}

function showRegister() {
  hideAll();
  document.getElementById('reg1').classList.remove('hidden');
}

function nextStep(step) {
  hideAll();
  if (step === 1) document.getElementById('reg2').classList.remove('hidden');
  if (step === 2) document.getElementById('reg3').classList.remove('hidden');
}

function goBack() {
  hideAll();
  document.getElementById('landing').classList.remove('hidden');
}

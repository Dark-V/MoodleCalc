async function login() {
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  var url = `https://lk.sakhgu.ru/login/token.php?username=${username}&password=${password}&service=moodle_mobile_app`;
  var data = await(await fetch(url)).json();

  console.log(data);

  if (data.error)  { 
    document.getElementById('login-data').textContent = data.error;

    return false
  }
  // Update token data in chrome storage
  chrome.storage.sync.set({"wstoken" : data.token}, function() {
    console.log(`Value is set to ${data.token}`);
  });

  Hide();

  // clear login data result
  document.getElementById('login-data').textContent = "";

  return true
}

async function Hide() {
    // Disable input
    document.getElementById('username').disabled = true;
    document.getElementById('password').disabled = true;
  
    // change text and color of login button
    document.querySelector('.login-button').classList.add('denied-button');
    document.getElementById('login-button').textContent = 'Exit';
}

async function Show() {
  // change text and color of login button
  document.querySelector('.login-button').classList.remove('denied-button');
  document.getElementById('login-button').textContent = 'Login';

  // Enable input
  document.getElementById('username').disabled = false; 
  document.getElementById('password').disabled = false;
}

async function unlogin() {
  console.log('Unlogging');
  Show();
  chrome.storage.sync.set({"wstoken" : ""}, function() {});
}

async function login_button() {
  chrome.storage.sync.get(["wstoken"], async function(r) {
    if (r["wstoken"] != "") unlogin()
    else login();
  });
}

function Main() {
  // when page is loaded
  document.addEventListener('DOMContentLoaded', () => {

    // TODO: add here time-token life

    // check if user has token
    // if yes -> disable input, display exit button
    // if not -> start auth process
    chrome.storage.sync.get(["wstoken"], async function(r) {
      if (r["wstoken"] != "") Hide()
      else Show();
    });

    var settingsButton = document.getElementById('setting_btn');
    settingsButton.addEventListener('click', () => {
      chrome.tabs.create({
      url: 'html/settings.html'
    })});
  
    var login_button_ = document.getElementById('login-button');
    login_button_.addEventListener('click', login_button, false);
  }, false);
}

Main();
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

  // diplasy user name
  chrome.storage.sync.set({"username" : username}, function() {});
  RestoreLoginData();

  // clear login data result
  document.getElementById('login-data').textContent = "Вы авторизированы!";
  return true
}

async function RestoreLoginData() {

  chrome.storage.sync.get(["username"], async function(r) {
    if (r['username'] == undefined) r['username'] = ''

    document.getElementById('username').value = r['username']
    document.getElementById('password').value = 'xxxxxxxxxx'
  });

}

async function Hide() {

    // Display user login and hidden password (which not real)
    RestoreLoginData();

    // Disable input
    document.getElementById('username').disabled = true;
    document.getElementById('username').title = "ACCESS DENIED";
    document.getElementById('password').disabled = true;
    document.getElementById('password').title = "ACCESS DENIED";
  
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
  document.getElementById('password').value = '';
  chrome.storage.sync.set({"wstoken" : ""}, function() {});
}

async function login_button() {
  chrome.storage.sync.get(["wstoken"], async function(r) {
    if (r["wstoken"] != "") unlogin()
    else login();
  });
}

function Main() {
  document.addEventListener('DOMContentLoaded', () => {

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
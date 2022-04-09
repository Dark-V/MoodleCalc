async function login_button() {
  if (document.getElementById("token") != 'Выйти') {
    var login = document.getElementById("username").value;
    var pass = document.getElementById("password").value;
    
    document.getElementById("loading-img").style = "display:inline-block";

    var url = `https://lk.sakhgu.ru/login/token.php?username=${login}&password=${pass}&service=moodle_mobile_app`;
    var data = await(await fetch(url)).json();

    var return_ = 'Invaid username or password';
    if (!data.error) {
      chrome.storage.sync.set({"wstoken" : data.token}, function() {
        console.log(`Value is set to ${data.token}`);
      });

      // Token save in Chrome Sync https://developer.chrome.com/docs/extensions/reference/storage/
      return_ = `Your token: ${data.token.slice(0, 7)}...${data.token.slice(16, 32)}`; // Your token: 7e1025f...7020dab4b0c4de23
      document.getElementById("token").innerHTML = 'Выйти';
    }

    document.getElementById("loading-img").style = "display:none";
    document.getElementById("func_return").innerHTML = return_;
  }
  else {
    chrome.storage.sync.set({"wstoken" : ''}, function() {
      console.log(`Value is set to NULL`);
      document.getElementById("token").innerHTML = 'Войти';
    });
  }
}

function StartListener() {
  document.addEventListener('DOMContentLoaded', () => {
    var settingsButton = document.getElementById('setting_btn');
    settingsButton.addEventListener('click', () => {
      chrome.tabs.create({
      url: 'html/settings.html'
    })});
  
    var checkButton = document.getElementById('token');
    checkButton.addEventListener('click', login_button, false);
  }, false);
}

function main() {
  StartListener();
}

main();
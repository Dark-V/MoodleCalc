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

async function main() {
    // Get a reference to the login button
    const loginButton = document.getElementById('loginbtn');

    // Add an onclick event listener to the login button
    loginButton.onclick = function() {
        // Your function code goes here
        console.log('Login button is clicked, using auto-logon');
        login()
    };
}

main();
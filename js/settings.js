function load_token(hide) {
    chrome.storage.sync.get(["wstoken"], ({wstoken}) => {
        const start = wstoken.slice(0, 7);
        const end = wstoken.slice(16, 32);
        const token = `Your token: ${hide ? start + "..." + end : wstoken}`;
        document.getElementById('token').innerHTML = token;
      });      
}   

function show_token_button() {
    const button = document.getElementById('show_token_button');

    if (button.classList.contains('hidden')) {
      button.innerHTML = 'Hide token';
      button.classList.remove('hidden');
    } else {
      button.innerHTML = 'Show token';
      button.classList.add('hidden');
    }

    load_token(button.classList.contains('hidden'));
}

function copy_token_button() {
    chrome.storage.sync.get(["wstoken"], function(result) {
        navigator.clipboard.writeText(result["wstoken"]);
    });
}

function StartButtonsOnClick() {
    document.getElementById('show_token_button').addEventListener('click', show_token_button, false);
    document.getElementById('copy_token_button').addEventListener('click', copy_token_button, false);
}

function main() {
    document.addEventListener('DOMContentLoaded', () => {
        StartButtonsOnClick();
        load_token(true);
    }); 
}

main();
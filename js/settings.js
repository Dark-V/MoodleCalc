function load_token(hide) {

    chrome.storage.sync.get(["wstoken"], function(result) {
        if (hide) document.getElementById('token').innerHTML = `Your token: ${result["wstoken"].slice(0, 7)}...${result["wstoken"].slice(16, 32)}`
        else document.getElementById('token').innerHTML = `Your token: ${result["wstoken"]}`;
    });     
}   

function show_token_button() {

    if (document.getElementById('show_token_button').innerHTML === 'Show token') {
        document.getElementById('show_token_button').innerHTML = 'Hide token';
        load_token(false);
    }
    else {
        document.getElementById('show_token_button').innerHTML = 'Show token';
        load_token(true);
    }

}

function copy_token_button() {
    chrome.storage.sync.get(["wstoken"], function(result) {
        navigator.clipboard.writeText(result["wstoken"]);
    });
}

function StartButtonsOnClick() {
    var show_token_btn = document.getElementById('show_token_button');
    show_token_btn.addEventListener('click', show_token_button, false);

    var copy_token_btn = document.getElementById('copy_token_button');
    copy_token_btn.addEventListener('click', copy_token_button, false);
}

function main() {
    document.addEventListener('DOMContentLoaded', () => {
        StartButtonsOnClick();
        load_token(true); // Load "Your token: 7e1025f...7020dab4b0c4de23"
     }, false); 
}

main();
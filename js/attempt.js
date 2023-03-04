function HideOrShow() {
  var secretBlock = document.getElementById('secret-block');
  secretBlock.style.display = (secretBlock.style.display === 'none') ? '' : 'none';
}

function SecretNavBlock() {
      // Create new navblock
      var targetEl = document.querySelector('.columnright.blockcolumn.has-blocks > :first-child');

      // Create the aside element with all properties at once
      var asideEl = document.createElement('aside');
        asideEl.id = 'secret-block';
        asideEl.style.marginTop = "5px";
        asideEl.style.display = 'none';
        asideEl.className = 'block card mb-3';
  
      // Set the class name for the div element
      var divEl = document.createElement('div');
        divEl.className = 'card-body p-3';
        divEl.id = 'secret-body';

      asideEl.appendChild(divEl);

      // Append the aside element to the target element
      targetEl.appendChild(asideEl);

      // Add to text "Навигация по тесту" secret button event
      document.getElementsByClassName('card-title d-inline')[0].onclick = HideOrShow;;

}

function CreateLoadButton() {
    const url = new URL(window.location.href);
    const attemptid = url.searchParams.get('attempt');

    const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.id = "fileInput";

    fileInput.addEventListener("change", function(e) {
      if (e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function() {
          const data = JSON.parse(reader.result);
          console.log(data);
        };
      }
    });

    document.getElementById('secret-body').appendChild(fileInput);
}

async function main() {

    // Create Secret Nav block
    SecretNavBlock();
    
    // "Загрузить?" btn
    CreateLoadButton();

}

main();
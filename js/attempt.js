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
    const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.id = "fileInput";

    fileInput.addEventListener("change", function(e) {
      const file = e.target.files[0];
      if (file && file.name.endsWith(".qz")) {
        const reader = new FileReader();

        reader.onload = function() {
          const data = JSON.parse(reader.result);
          QuizPayload(data);
        };

        reader.readAsText(file);
      }
    });

    document.getElementById('secret-body').appendChild(fileInput);
}

function ParseSettings() {
  // TODO:
  // Add setting checkboxes, use them
}

async function QuizPayload(localData) {
  const url = new URL(window.location.href);
  const attemptid = url.searchParams.get('attempt');

  let serverData;

  const parser = new DOMParser();

  try {
    const {questions} = await GetQuizData(attemptid);

    for (const item of questions) {
      const html = parser.parseFromString(item.html, "text/html");
      item.qid = html.querySelector(".questionflagpostdata").value.split("qid=")[1].split("&slot")[0];
      item.qtext = html.querySelector(".qtext").textContent;
    }

    const localQids = new Set(localData.answers.map(item => item.qid));

    for (const serverItem of questions) {
      if (localQids.has(serverItem.qid)) {
        const localItem = localData.answers.find(item => item.qid === serverItem.qid);

        console.log(`Question ${serverItem.qid} is in localData and serverData`);
        SendQuestion(localItem, serverItem);
      }
    }

  } catch (error) {
    console.error(error);
  }

}

async function GetQuizData(attemptid) {
  const result = await new Promise((resolve) => {
    chrome.storage.sync.get(["wstoken"], function(result) {
      resolve(result["wstoken"]);
    });
  });
  
  const wsfunction = "mod_quiz_get_attempt_summary";
  const payload_url = `https://lk.sakhgu.ru/webservice/rest/server.php?wstoken=${result}&moodlewsrestformat=json&wsfunction=${wsfunction}&attemptid=${attemptid}`;
  
  const response = await fetch(payload_url);
  return response.json();
} 
  
async function SendQuestion(localItem, serverItem) {
  const parser = new DOMParser();
  let data = [];

  let html = parser.parseFromString(serverItem.html, "text/html");

  if (serverItem.type === "multichoice") {
    if (localItem.isCorrect) {
      html.querySelectorAll('.answer input[type="radio"]').forEach((input, index) => {
        let label = html.querySelectorAll('.answer .flex-fill.ml-1')[index].textContent;
  
        if (localItem.answers[0] == label) data.push({name: input.name, value: input.value});
      });
    }
  } else {
    console.log(`Error, the "${localItem.type}" local type is not supported!`);
    return null;
  }

  if (data === []) return null;

  chrome.storage.sync.get(["wstoken"], async function(result) {
    const url = new URL(window.location.href);
    const attemptid = url.searchParams.get('attempt');

    const sequencecheck= html.querySelector('input[name*=":sequencecheck"]');
    const sequencecheckName= sequencecheck.getAttribute('name');
    const sequencecheckValue= sequencecheck.getAttribute('value');

    const wstoken = result["wstoken"];
    const wsfunction = "mod_quiz_process_attempt";

    let payload_url = `https://lk.sakhgu.ru/webservice/rest/server.php?wstoken=${wstoken}&moodlewsrestformat=json&wsfunction=${wsfunction}&attemptid=${attemptid}&data[0][name]=${sequencecheckName}&data[0][value]=${sequencecheckValue}`;

    data.forEach((param, index) => {
      payload_url += `&data[${index+1}][name]=${param.name}&data[${index+1}][value]=${param.value}`;
    });
    
    var body = await(await fetch(payload_url)).json();
  });


}

async function main() {
    const url = new URL(window.location.href);
    const attemptid = url.searchParams.get('attempt');

    // for future highlights feature
    //data = GetQuizData(attemptid);

    // Create Secret Nav block
    SecretNavBlock();
    
    // "Загрузить?" btn
    CreateLoadButton();

}

main();
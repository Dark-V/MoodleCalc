function DownloadFileByString(filename, content) {
    var a = document.createElement('a');
    var blob = new Blob([content], {type : "text"});
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click(); //this is probably the key - simulating a click on a download link
    delete a;// we don't need this anymore
}

function ParseQuestion(item) {
    if (item.status !== "Ответ сохранен" && item.status !== "Выполнен") {
      return null;
    }
  
    const parser = new DOMParser();
    const html = parser.parseFromString(item.html, "text/html");
  
    const qid = html.querySelector(".questionflagpostdata").value.split("qid=")[1].split("&slot")[0];
    const qtext = html.querySelector(".qtext").textContent;
  
    let answers;
    if (item.type === "multichoice" || item.type === "truefalse") {
      const rawAnswers = html.querySelectorAll('[checked="checked"]');
      answers = Array.from(rawAnswers, (rawAnswer) => rawAnswer.parentNode.textContent);
    } else if (item.type === "multianswer") {
      answers = [html.querySelector(".form-control.mb-1").value];
    } else if (item.type === "match") {
      const rawAnswers = html.querySelectorAll('[selected="selected"]');
      const rawTexts = html.querySelectorAll(".text");
      answers = Array.from(rawAnswers, (rawAnswer, i) => [rawAnswer.textContent, rawTexts[i].textContent]);
    } else if (item.type === "ddwtos") {
      const rawAnswers = html.querySelector(".draggrouphomes1").children;
      answers = Array.from(rawAnswers, (rawAnswer) => rawAnswer.textContent);
    } else if (item.type === "ordering") {
      const rawAnswers = html.querySelectorAll(".sortableitem");
      answers = Array.from(rawAnswers, (rawAnswer) => rawAnswer.textContent);
    } else {
      console.log(`Error, the "${item.type}" type is not supported!`);
      return null;
    }

    item.mark = parseFloat(item.mark.replace(",", "."));
    return {
        qid,
        qtype: item.type,
        qtext,
        mark: item.mark,
        isCorrect: item.mark > parseFloat(document.getElementById('range-value').value),
        answers
    }
  }

function CreateLoadButton() {
    var input = document.createElement("input");
            input.type = "file";
            input.id = "load-quiz-data"
        document.getElementsByClassName("card-body p-3")[0].append(input)

        // when button is pressed or smth
        document.getElementById('load-quiz-data').addEventListener('change', event => {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', event => {
            // when data loaded do..
            console.log(event.target.result);
            });
            reader.readAsText(file);
        });
}

async function GenerateQuizShare(attemptid, wstoken) {

    // create data
    // standad -> mod_quiz_get_attempt_summary
    // review -> mod_quiz_get_attempt_review
    var wsfunction = "mod_quiz_get_attempt_review";
    var url = `https://lk.sakhgu.ru/webservice/rest/server.php?wstoken=${wstoken}&moodlewsrestformat=json&wsfunction=${wsfunction}&attemptid=${attemptid}`;
    console.log(url);
    var body = await(await fetch(url)).json();

    // Create json template
    // set "timestamp" -> Math.floor(Date.now() / 1000)
    // set "username"  -> document.getElementsByClassName('usertext')[0].textContent
    // set "attemtid"  -> ${attemptid}
    // set "answers"   -> []

    var json = {
        "timestamp": Math.floor(Date.now() / 1000),
        "username": document.getElementsByClassName('usertext')[0].textContent, 
        "attemtid": `${attemptid}`,
        "answers": []
    };

    for (var i=0, max=body.questions.length; i < max; i++) {
        question_data = ParseQuestion(body.questions[i]);
        if (question_data != undefined) json.answers.push(question_data);
    }

    // create json file
    return JSON.stringify(json);  
}

async function DownloadJson() {
    var node = document.getElementById('quiz-share-button');

    chrome.storage.sync.get(["wstoken"], async ({ wstoken }) => {
      DownloadFileByString(this.title, await GenerateQuizShare(this.getAttribute('attempt-id'), wstoken));
    });
}

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
}

function CreateShareButton() {
    const url = new URL(window.location.href);
    const attemptid = url.searchParams.get('attempt');
    
    // Create the krutilka 
    const rangeDiv = document.createElement('div');

    const rangeInput = document.createElement('input');
      rangeInput.type = 'range';
      rangeInput.min = '0';
      rangeInput.max = '1';
      rangeInput.step = '0.01';
      rangeInput.value = '0.5';
      rangeInput.addEventListener('input', function() {
        rangeValueInput.value = this.value;
      });

    const rangeValueInput = document.createElement('input');
      rangeValueInput.type = 'text';
      rangeValueInput.id = 'range-value';
      rangeValueInput.value = '0.5';
      rangeValueInput.style.width = "40px";
      rangeValueInput.style.marginLeft = "5px";
      rangeValueInput.title = "Это число будет влиять, будет ли считаться ответ правильным или нет."
      rangeValueInput.readOnly = true;

    rangeDiv.appendChild(rangeInput);
    rangeDiv.appendChild(rangeValueInput);

    // "Поделиться" button
    const a = document.createElement("a");
      a.id = "quiz-share-button";
      a.innerText = "Поделиться?";
      a.title = `moodle-${attemptid}.qz`;
      a.onclick = DownloadJson;
      a.href = "#";
      a.setAttribute("attempt-id", attemptid)
      a.setAttribute("filterMarkBy", "0.5")
        
    // Append this button
    document.getElementById('secret-body').appendChild(rangeDiv);
    document.getElementById('secret-body').appendChild(a);
}

async function main() {

    // Create Secret Nav block
    SecretNavBlock();

    // Add to text "Навигация по тесту" secret button event
    var test = document.getElementsByClassName('card-title d-inline')[0];
    test.onclick = HideOrShow;

    // TODO:
    // add feature with hiding all uncorrect answers for html

    // "Поделиться?" btn
    CreateShareButton();

}

main();
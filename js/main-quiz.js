function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

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
    var parser = new DOMParser();
    if (item.status == "Ответ сохранен") {
        var html = parser.parseFromString(item.html, 'text/html');
        
        var qid = "";
        var qtext = "";
        var answers = [];

        if (item.type == "multichoice") {
            qid = html.getElementsByClassName('questionflagpostdata')[0].value.split('qid=')[1].split('&slot')[0]
            qtext = html.getElementsByClassName('qtext')[0].textContent;

            var RawAnswers = html.querySelectorAll('[checked="checked"]');
            for (var i=0, max=RawAnswers.length; i < max; i++) {
                answers.push(RawAnswers[i].parentNode.textContent)
            }
        }
        else if (item.type == "truefalse") {
            qid = html.getElementsByClassName('questionflagpostdata')[0].value.split('qid=')[1].split('&slot')[0]
            qtext = html.getElementsByClassName('qtext')[0].textContent;

            var RawAnswers = html.querySelectorAll('[checked="checked"]');
            for (var i=0, max=RawAnswers.length; i < max; i++) {
                answers.push(RawAnswers[i].parentNode.textContent)
            }
        }
        else if (item.type == "multianswer") {
            qid = html.getElementsByClassName('questionflagpostdata')[0].value.split('qid=')[1].split('&slot')[0];
            qtext = html.getElementsByClassName('subquestion form-inline d-inline')[0].parentElement.textContent;
            answers.push(html.getElementsByClassName('form-control mb-1')[0].value)
        }
        else if (item.type == "match") {
            qid = html.getElementsByClassName('questionflagpostdata')[0].value.split('qid=')[1].split('&slot')[0];
            qtext = html.getElementsByClassName('qtext')[0].textContent;

            var RawAnswers = html.querySelectorAll('[selected="selected"]');
            var RawTexts = html.getElementsByClassName('text');

            for (var i=0, max=RawAnswers.length; i < max; i++) {
                var pair = []
                pair.push(RawAnswers[i].textContent);
                pair.push(RawTexts[i].textContent)

                answers.push(pair);
            }

        }
        else if (item.type == "ddwtos") {
            qid = html.getElementsByClassName('questionflagpostdata')[0].value.split('qid=')[1].split('&slot')[0];
            qtext = html.getElementsByClassName('qtext')[0].textContent;

            var RawAnswers = html.getElementsByClassName('draggrouphomes1')[0].children
            for (var i=0, max=RawAnswers.length; i < max; i++) {
                answers.push(RawAnswers[i].textContent);
            }
        }
        else if (item.type == "ordering") {
            qid = html.getElementsByClassName('questionflagpostdata')[0].value.split('qid=')[1].split('&slot')[0]
            qtext = html.getElementsByClassName('qtext')[0].textContent;

            var RawAnswers = html.getElementsByClassName('sortableitem')
            for (var i=0, max=RawAnswers.length; i < max; i++) {
                answers.push(RawAnswers[i].textContent);
            }
        }
        else
        {
            console.log(`Error, the "${item.type}" type is not supported!`);
            return null;
        }

        var question_data = {
             "qid": qid,
             "qtype": item.type,
             "qtext": qtext,
             "answers": answers
        };
        return question_data;
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
    var url = `https://lk.sakhgu.ru/webservice/rest/server.php?wstoken=${wstoken}&moodlewsrestformat=json&wsfunction=mod_quiz_get_attempt_summary&attemptid=${attemptid}`;
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
    DownloadFileByString(node.title, node.getAttribute('json-data'));
}

function HideOrShow() {
    var atr = document.getElementsByClassName('card-title d-inline')[0];

    if (atr.getAttribute('q-hidden') == 'true') {
        atr.setAttribute('q-hidden','false')
        document.getElementById('quiz-share-button').style.display = '';
        document.getElementById('load-file-button').style.display = '';
    }
    else {
        atr.setAttribute('q-hidden','true');
        document.getElementById('quiz-share-button').style.display = 'none';
        document.getElementById('load-file-button').style.display = 'none';
    }
}

async function main() {

    // "Навигация по тесту" secret button
    var test = document.getElementsByClassName('card-title d-inline')[0];
    test.onclick = HideOrShow;
    test.setAttribute('q-hidden','true')

    // Create load button
    var input = document.createElement("input");
        input.type = "file";
        input.id = "load-file-button";
        input.style.display = 'none';

    // Download quiz data & create dump button
    chrome.storage.sync.get(["wstoken"], async function(result) {

        var wstoken = result["wstoken"];
        var url = new URL(window.location.href);
        var attemptid = url.searchParams.get('attempt');
        let data = await GenerateQuizShare(attemptid, wstoken);

        // Create "Поделиться" button
        var a = document.createElement("a");
            a.style.display = 'none';
            a.id = "quiz-share-button";
            a.innerText = "Поделиться?";
            a.title = `moodle-${attemptid}.qz`;
            a.setAttribute('json-data', data);
            a.onclick = DownloadJson;
            a.href = "#";
        
        // append this button
        var target = document.getElementById('quiz-timer');
        target.parentNode.insertBefore(a, target);
    });

    var target = document.getElementById('quiz-timer');
    target.append(input);

}

main();
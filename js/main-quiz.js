
function quizDump() {
    // TODO
    // Get attemptid from url
    // mod_quiz_get_attempt_summary?attemptid=... 
    // load data
    // sync data in json format
    // zlib this
}

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

function en(c){var x='charCodeAt',b,e={},f=c.split(""),d=[],a=f[0],g=256;for(b=1;b<f.length;b++)c=f[b],null!=e[a+c]?a+=c:(d.push(1<a.length?e[a]:a[x](0)),e[a+c]=g,g++,a=c);d.push(1<a.length?e[a]:a[x](0));for(b=0;b<d.length;b++)d[b]=String.fromCharCode(d[b]);return d.join("")}

function de(b){var a,e={},d=b.split(""),c=f=d[0],g=[c],h=o=256;for(b=1;b<d.length;b++)a=d[b].charCodeAt(0),a=h>a?d[b]:e[a]?e[a]:f+c,g.push(a),c=a.charAt(0),e[o]=f+c,o++,f=a;return g.join("")}


async function main() {

    chrome.storage.sync.get(["wstoken"], async function(result) {

        // Generate name for file & attemptid 
        var url = new URL(window.location.href);

        // create data
        var wstoken = result["wstoken"];
        var attemptid = url.searchParams.get('attempt');

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
        
        // json.answers.push('test');

        for (var i=0, max=body.questions.length; i < max; i++) {
            question_data = ParseQuestion(body.questions[i]);
            if (question_data != undefined) json.answers.push(question_data);
        }


        // Download file
        console.log(JSON.stringify(json));
        DownloadFileByString(`moodle-${attemptid}.qz`, JSON.stringify(json));
        
        // create choose button
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
    });
}

main();
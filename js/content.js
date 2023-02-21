function replaceAllChild(old, new_) {
    // old - instancename
    // new - a
    var span = document.getElementsByClassName(old);

    for (var i=0, max=span.length; i < max; i++) {
        var a = document.createElement(new_);
        // https://stackoverflow.com/questions/13071860/replace-a-tag-with-span-tag
        a.innerHTML = span[i].innerHTML;
        a.className = span[i].className;
        a.id = span[i].id;
    
        span[i].parentNode.replaceChild(a, span[i]);
    }   
}

function moveAllHref() {
    // TODO: FIX
    // instance = GetByClass("activityinstance")
    // if (instance.GeyByClass(" dimmed dimmed_text") is null) -> do code
    // else -> skip node

    var instance = document.getElementsByClassName("activityinstance")

    for (var i=0, max=instance.length; i < max; i++) {
        if (instance[i].getElementsByClassName(' dimmed dimmed_text')[0] == null) {

            var href = instance[i].getElementsByClassName("aalink")[0].href;
            instance[i].getElementsByClassName("aalink")[0].removeAttribute("href")
            document.getElementsByClassName("instancename")[i].href = href;
        }
    }
}

function nthParent(element, n) {
    // make {element}.parentNode.parentNode... .parentNode of N times
    while(n-- && element)  
      element = element.parentNode;
    return element;
}

function button1() {
    var spoiler = document.getElementsByClassName(`spoiler-head-${this.value}`)[0];
    var url = `${spoiler.getElementsByClassName('instancename')[0].href}&pageid=-9`;
    window.open(url, '_blank').focus();
}

function button2() {
    // `http://188.113.170.119:8080/GetAnswers?cmid=2178&userid=4397&token=${wstoken}`
}
  
async function loadSpoilerItems(this_, ModuleId) {

    document.getElementById(`${ModuleId}-button-1`).onclick = button1;
    document.getElementById(`${ModuleId}-button-1`).value = ModuleId;

    document.getElementById(`${ModuleId}-button-2`).onclick = button2;
    document.getElementById(`${ModuleId}-button-2`).value = ModuleId;

    chrome.storage.sync.get(["wstoken"], async function(result) {
        var wstoken = result["wstoken"];

        var type = this_.getElementsByClassName('accesshide ')[0].textContent;
        var url = new URL(this_.getElementsByClassName('instancename')[0].href);
        var cmid = url.searchParams.get('id');

        url = `https://lk.sakhgu.ru/webservice/rest/server.php?wstoken=${wstoken}&moodlewsrestformat=json&wsfunction=core_course_get_course_module&cmid=${cmid}`
        obj = await(await fetch(url)).json();
        var instanceid = obj.cm.instance;
        console.log(`http://192.168.0.211:8080/quizRandom?quizid=${instanceid}&token=0eefd09efe53cbf93b415993b61578f7`);

        if (type == ' Лекция') {
            var retake = 'Нет';
            var amountQusetions = 'Отсуствуют';
            var amountAttemps = 1;
            var timelimit = 'Нет';
            
            url = `https://lk.sakhgu.ru/webservice/rest/server.php?wstoken=${wstoken}&moodlewsrestformat=json&wsfunction=mod_lesson_get_lesson&lessonid=${instanceid}`
            obj = await(await fetch(url)).json();

            url = `https://lk.sakhgu.ru/webservice/rest/server.php?wstoken=${wstoken}&moodlewsrestformat=json&wsfunction=mod_lesson_get_pages&lessonid=${instanceid}`;
            pagesdata = await(await fetch(url)).json();
            
            if (obj.lesson.review) amountAttemps = obj.lesson.maxattempts;
            if (obj.lesson.timelimit > 0) timelimit = obj.lesson.timelimit;
            if (obj.lesson.retake) {
                amountAttemps = obj.lesson.maxattempts;
                retake = 'Да';
            };

            try { if (pagesdata.errorcode.length > 1) amountQusetions = pagesdata.message; }
            catch {
                amountQusetions = 0;
                for (var i=0, max=pagesdata.pages.length; i < max; i++) {
                    if (pagesdata.pages[i].page.typeid != 20) amountQusetions += 1;
                }
            }

            document.getElementById(`${ModuleId}-value-1`).innerHTML = `Попыток: ${amountAttemps}`;
            document.getElementById(`${ModuleId}-value-2`).innerHTML = `Кол-во вопросов: ${amountQusetions}`; 
            document.getElementById(`${ModuleId}-value-2`).value = amountQusetions;
            document.getElementById(`${ModuleId}-value-3`).innerHTML = `Время: ${timelimit}`;
            document.getElementById(`${ModuleId}-value-4`).innerHTML = `Повторный доступ: ${retake}`; 
        }
        else if (type == '') {
    
        }
    });
}

function SecretFunction() {
    
    ModuleId = nthParent(this, 6).id
    if (this.parentNode.parentNode.parentNode.className === `spoiler-head-${ModuleId}`) {
       document.getElementById(`spoiler-${ModuleId}`).remove(); 
       this.parentNode.parentNode.parentNode.id = ""
    }
    else {

        var newNode = document.createElement('div');
        newNode.style = "margin-left: 10%";

        newNode.id = `spoiler-${ModuleId}`;
        newNode.innerHTML = `
        <table style="border-collapse: collapse; width: 400px;height: 36px; word-break: keep-all;" border="0">
        <tbody>
        <tr style="height: 18px; white-space: nowrap; overflow: hidden;">
        <td style="width: 5%; height: 36px;" rowspan="2">
            <button class="button1" id="${ModuleId}-button-1">Skip</button>
        </td>
        <td style="width: 5%; height: 36px;" rowspan="2">
            <button class="button2" id="${ModuleId}-button-2">Debug</button>
        </td>   
        <td style="width: 12.5%;" rowspan="2"></td> 
        <td style="width: 25%;" id="${ModuleId}-value-1">#: #</td>
        <td style="width: 25%;" id="${ModuleId}-value-2">#: #</td>
        </tr>
         <tr style="height: 18px; white-space: nowrap; overflow: hidden;">
          <td style="width: 25%;"id="${ModuleId}-value-3">#: #</td>
          <td style="width: 25%;"id="${ModuleId}-value-4">#: #</td>
         </tr>
        </tbody>
        </table>`;

        this.parentNode.parentNode.parentNode.className = `spoiler-head-${ModuleId}`;
        nthParent(this, 3).appendChild(newNode);

        loadSpoilerItems(this.parentNode.parentNode, ModuleId);
    }
   
}

function AddSecretButton() {
    var icons = document.getElementsByClassName('iconlarge activityicon')

    for (var i=0, max=icons.length; i < max; i++) {
        icons[i].onclick = SecretFunction
    }
}

function CantKickMe() {
    console.log("[MoodleCalc] CantKickMe() update!");
    location.reload();
}

function main() {
    setTimeout(CantKickMe, 3600000); // Disable auto-logut after 7200sec non-active

    replaceAllChild("instancename", "a");
    moveAllHref();
    AddSecretButton();
}

main();

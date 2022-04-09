async function MakeOnePage() {

    chrome.storage.sync.get(["wstoken"], async function(result) {
        var wstoken = result["wstoken"];
        const sourceUrl = new URLSearchParams(window.location.search);
        var cmid = sourceUrl.get('id');
        
        var url = `https://lk.sakhgu.ru/webservice/rest/server.php?wstoken=${wstoken}&moodlewsrestformat=json&wsfunction=core_course_get_course_module&cmid=${cmid}`;
        let obj = await(await fetch(url)).json();
        var lessonid = obj.cm.instance;
        
        url = `https://lk.sakhgu.ru/webservice/rest/server.php?wstoken=${wstoken}&moodlewsrestformat=json&wsfunction=mod_lesson_get_pages&lessonid=${lessonid}`;
        obj = await(await fetch(url)).json();
        
        var parser = new DOMParser();
        var htmlDoc = '';
        for (var i=0, max=obj.pages.length; i < max; i++) {
            // console.log(obj.pages[i].page.nextpageid ,'!= 0', obj.pages[i].page.typeid,' == 20');
            if (obj.pages[i+1].page.typeid != 20) break; // Skip pages with type = question 
            if (obj.pages[i].page.nextpageid != 0) {
                url = `https://lk.sakhgu.ru/webservice/rest/server.php?wstoken=${wstoken}&moodlewsrestformat=json&wsfunction=mod_lesson_get_page_data&lessonid=${lessonid}&pageid=${obj.pages[i].page.nextpageid}`;
                current = await(await fetch(url)).json();
                html = parser.parseFromString(current.page.contents, 'text/html');
        
                var h3=document.createElement("h3");
                h3.innerHTML = current.page.title;
                
                document.getElementsByClassName('box py-3 contents')[0].appendChild(h3);
                document.getElementsByClassName('box py-3 contents')[0].appendChild(html.getElementsByClassName('no-overflow')[0]);
            }
        };
    });
    document.getElementById('OnePageButton').disabled = true;
}

function OnePage() {

    var header = document.getElementsByClassName('headermain')[0]
    header.style = "display: inline;";
        
    var button = document.createElement("button");
    button.innerHTML = "One Page";
    button.id = "OnePageButton";
    button.style = "float: right;background: none;";
    button.onclick = MakeOnePage;

    header.appendChild(button);
}

function main() {
    OnePage();
}

main();
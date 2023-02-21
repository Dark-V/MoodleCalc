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
        
        console.log(url);
        var htmlDoc = '';
        var parser = new DOMParser();
        for (var i=1, max=obj.pages.length; i < max; i++) {
            // console.log(obj.pages[i].page.nextpageid ,'!= 0', obj.pages[i].page.typeid,' == 20');
            // if (obj.pages[i+1].page.typeid != 20) break; // Skip pages with type = question 

            if (obj.pages[i].page.typeid == 20) {
                url = `https://lk.sakhgu.ru/webservice/rest/server.php?wstoken=${wstoken}&moodlewsrestformat=json&wsfunction=mod_lesson_get_page_data&lessonid=${lessonid}&pageid=${obj.pages[i].page.id}`;
                current = await(await fetch(url)).json();
                html = parser.parseFromString(current.page.contents, 'text/html');
        
                var h3 = document.createElement("h3");
                h3.innerText = current.page.title;
                
                document.getElementsByClassName('box py-3 contents')[0].appendChild(h3);
                document.getElementsByClassName('box py-3 contents')[0].appendChild(html.getElementsByClassName('no-overflow')[0]);
                // MathMLs2Latex(); avoid
            }
        };
    });
    document.getElementById('OnePageButton').disabled = true;
}

function MakeButton(innerHTML_, id_, func_) {

    var header = document.getElementsByClassName('headermain')[0]
    header.style = "display: inline;";
        
    var button = document.createElement("button");
    button.innerHTML = innerHTML_;
    button.id = id_;
    button.style = "float: right;background: none;";
    button.onclick = func_;

    header.appendChild(button);
}

// AVOID, need mathl.js support, don't need anymore
// async function MathMLs2Latex() {
//     var MathMLs = document.getElementsByClassName('Wirisformula');
//     for (var i=0, max=MathMLs.length; i < max; i++) {
//         var MathML = MathMLs[i].getAttribute('data-mathml');

//         MathML = MathML.replaceAll('«','<').replaceAll('»','>').replaceAll('¨','"') <- looks like i can just use only mathml for word
//         var latex = MathML2LaTeX.convert(MathML);
//         MathMLs[i].setAttribute('alt', latex);
//     }
// }

async function div2Image() {
    document.getElementById('canvasconverting').innerText = "...";
    var tagName = document.getElementsByClassName("box py-3 contents")[0];
    await html2canvas(tagName).then(async function(canvas) {
        saveAs(canvas.toDataURL(), `image.png`);
    });
    document.getElementById('canvasconverting').innerText = "Get Image";
}   

function saveAs(uri, filename) {
    var link = document.createElement('a');
    if (typeof link.download === 'string') {
        link.href = uri;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        window.open(uri);
    }
}

function main() {
    MakeButton("One Page", "OnePageButton", MakeOnePage);
    MakeButton("Get Image", "canvasconverting", div2Image);
}

main();
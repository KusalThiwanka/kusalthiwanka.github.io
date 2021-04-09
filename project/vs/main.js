// UI comp
const startBtn = document.getElementById("startBtn");
startBtn.innerHTML = "Start listening";
const input = document.getElementById("input");
const question = document.getElementById("question");
const answer = document.getElementById("answer");
const reply = document.getElementById("reply_section");

reply.style.display = "none";

// speech to text
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let toggleBtn = null;
if (typeof SpeechRecognition === "undefined") {
	startBtn.remove();
	question.innerHTML = "<b>Browser does not support Speech API. Please download latest chrome.</b>";
	reply.style.display = "block";
} else {
	const recognition = new SpeechRecognition();
	console.log("Initializing...")
	// recognition.continuous = true;
	recognition.interimResults = true;
	recognition.onresult = async (event) => {
		const last = event.results.length - 1;
		const res = event.results[last];
		const text = res[0].transcript;
		if (res.isFinal) {
			recognition.stop();
			reply.style.display = "block";
            input.value = "";
			const response = await process(text);
			question.innerHTML = `${text}`;
			answer.innerHTML = `${response}`;
			// speak( response, function() { recognition.start(); });
			speak(response, function() { console.log("Complete"); });
			toggleBtn();
		} else {
			input.value = `listening: ${text}`;
		}
	}
	let listening = false;
	toggleBtn = () => {
		if (listening) {
			recognition.stop();
			startBtn.textContent = "Start listening";
		} else {
			recognition.start();
			startBtn.textContent = "Stop listening";
		}
		listening = !listening;
	};
	startBtn.addEventListener("click", toggleBtn);
}

function speak( text, onend ) {
	window.speechSynthesis.cancel();
	window.speechSynthesis.speak( new SpeechSynthesisUtterance( text ) );
	function _wait() {
	  if ( ! window.speechSynthesis.speaking ) {
		onend();
		return;
	  }
	  window.setTimeout( _wait, 200 );
	}
	_wait();
}

// processor
async function process(rawText) {
	let text = rawText.replace(/\s/g, "");
	text = text.toLowerCase();
	let response = null;
	switch(text) {
		case "hello":
			response = "hi, What do you want me to do for you?"; break;
		case "howareyou":
			response = "I'm good. Thank you for asking"; break;
		case "whattimeisit":
			response = new Date().toLocaleTimeString(); break;
		case "whatdayisit":
			response = new Date().toString().split(' ').splice(1,3).join(' '); break;
		case "goodmorning":
			response = "good morning, How can i help you?"; break;
		case "goodevening":
			response = "good evening, How can i help you?"; break;
		case "goodafternoon":
			response = "good afternoon, How can i help you?"; break;
		case "stop":
			response = "Bye!!";
			toggleBtn();
	}
    if(text.substring(0,4)==="open"){
        window.open(`http://google.com/search?q=${rawText.replace("open", "")}`, "_blank");
	    response = `openning ${rawText.substring(5)}`;
    }
	if (!response) {
        // if (text === "") return "I didn't get it. Try again";
        // const resultArray = await retrieveSearchResults(rawText);
        // if(resultArray[0].text!==undefined){ response = resultArray[0].text }
        // else { response = resultArray[1].text }
		// console.log(resultArray);
        const response = await retrieveSearchResults(rawText);
		console.log(response);
	}
    return response;
}

const retrieveSearchResults = async (searchTerm) => {
    const wikiSearchString = getWikiSearchString(searchTerm);
    const wikiSearchResults = await requestData(wikiSearchString);
	console.log(wikiSearchResults);
	return wikiSearchResults;
    // let resultArray = [];
    // if (wikiSearchResults.hasOwnProperty("query")) {
    //     resultArray = processWikiResults(wikiSearchResults.query.pages);
    // }
    // return resultArray;
};

const getWikiSearchString = (searchTerm) => {
	const url = `https://api.wolframalpha.com/v1/result?appid=26Q368-9Q9ERTXHP6&i=${searchTerm.replaceAll(" ", "+")}`;
    return url;
    // const url = encodeURI(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchTerm}&gsrlimit=2&prop=pageimages|extracts&explaintext&exsentences=1&exlimit=max&format=json&origin=*`);
    // return url;
};
  
const requestData = async (url) => {
    try {
        const data = await fetch(url);
		console.log(data);
        return data;
        // const response = await fetch(url);
        // const data = await response.json();
        // return data;
    } catch (err) {
        console.error(err);
    }
};
  
const processWikiResults = (results) => {
    const resultArray = [];
    Object.keys(results).forEach((key) => {
        const id = key;
        const title = results[key].title;
        const text = results[key].extract;
        const img = results[key].hasOwnProperty("thumbnail") ? results[key].thumbnail.source : null;
        const item = { id: id, title: title, img: img, text: text };
        resultArray.push(item);
    });
    return resultArray;
};

const stopTalking = () => {
	window.speechSynthesis.cancel();
}
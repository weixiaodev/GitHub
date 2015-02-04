/*
 * Copyright (C) 2014-2015 Samsung Electronics. All Rights Reserved. Source code is
 * licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 * 
 * IMPORTANT LICENSE NOTE: The IMAGES AND RESOURCES are licensed under the
 * Creative Commons BY-NC-SA 3.0 License
 * (http://creativecommons.org/licenses/by-nc-sa/3.0/). The source code is
 * allows commercial re-use, but IMAGES and RESOURCES forbids it.
 */

var	logElement = document.getElementById('log')
 	URL="http://www.cnet.com/rss/news/";

function log(msg, sameLine) {
	logElement.innerHTML += msg + (sameLine === true ? '' : '<br>');
}

function onListItemClicked() {
	var url = this.__link,
		newwindow = window.open(url,'_blank',''); //Opens the URL in a new browser window
	
	if (window.focus) {
		newwindow.focus();
	}
	
	newwindow.addEventListener('tizenhwkey', function ( ev ) {
	    if (ev.keyName === "back") {
	    	newwindow.close();
	    }
	});
	
	return false;
}


/**
 * Process received response and display max. 15 titles
 *  @param response
 *
 * e,g here is what a RSS feed looks like
 * <item>
 * <title>Vizio mercilessly mocks Samsung, LG curved TVs</title>
 * <link>
 * http://cnet.com.feedsportal.com/c/34938/f/645093/s/41cfe66e/sc/28/l/0L0Scnet0N0Cnews0Cvizio0Elaunches0Ebrilliant0Eanti0Ecurved0Etv0Eglasses0C0Tftag0FCAD590Aa51e/story01.htm
 * </link>
 * <description>
 * Your curved-screen TV hurts your head, doesn't it? 
 * </description>
 * <pubDate>Sat, 27 Dec 2014 20:43:09 GMT</pubDate>
 * <guid>
 * http://cnet.com.feedsportal.com/c/34938/f/645093/s/41cfe66e/sc/28/l/0L0Scnet0N0Cnews0Cvizio0Elaunches0Ebrilliant0Eanti0Ecurved0Etv0Eglasses0C0Tftag0FCAD590Aa51e/story01.htm
 * </guid>
 * </item>
 */
function processResponse(response) {
    var feedContainer = document.getElementById('feedContainer'),
	 	titles = response.querySelectorAll('item > title'),
		max = 15, listitem;

	feedContainer.innerHTML = '';
	
	max = titles.length < max ? titles.length : max;

	for (var i = 0; i < max; i++) {
		/* Fetch RSS feed title and link */
		/* DOM Level 3 Core */
		var title = response.getElementsByTagName("item")[i].getElementsByTagName("title")[0].textContent;
		var link = response.getElementsByTagName("item")[i].getElementsByTagName("link")[0].textContent;
		
		listitem = document.createElement('div');
		listitem.className = 'feedTitle';
		listitem.innerHTML ='<a href="#">'+ title.fontcolor("white") + '</a><br>';
		listitem.onclick = onListItemClicked;
		listitem.__link = link;  //use a custom field to save the url
		feedContainer.appendChild(listitem);
	}
}

/**
 * State change handler, more about XHR can be found here:
 * http://www.w3.org/TR/XMLHttpRequest2/
 *
 * W3C XMLHttpRequest specification allows HTML parsing via the XMLHttpRequest.responseXML property
 */
function stateChangeHandler() {
	log('.', true);
	
	if ((this.readyState === 4 /* Completed */) && (this.status === 200)) {
		log('Loaded Successfully!');
		if (this.responseXML != null) {
			processResponse(this.responseXML);
		}
	}
}


 /**
 * retrieve news feed
 * http://www.w3.org/TR/XMLHttpRequest2/
 * 
 * Use XMLHttpRequest to get the content of a remote HTML webpage.
 * When using XMLHTTPRequest in an async operation, define a callback function in the onreadystatechange event.
 */
function sendRequest(url) {
	log('Start fetching feed');
	var client = new XMLHttpRequest();
	client.onreadystatechange = stateChangeHandler;
	client.timeout = 3000;
	client.ontimeout = log.bind('Timeout!');

	client.open("GET", url);
	client.send();
}

sendRequest(URL);    //Fetch news feed from CNET News

document.addEventListener('tizenhwkey', function ( ev ) {
    if (ev.keyName === "back") {
        tizen.application.getCurrentApplication().exit();
    }
});

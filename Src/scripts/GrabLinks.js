// Listen for message to start gathering the links
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.msg == "grabLinks") {
		sendResponse({response: "grabLinksOK"});
		grabLinks();
		//console.log("Grabbing Links");
	}
});

var linkarray   = [];
var currenturl  = "";

// Function for grabbing links
function grabLinks(downloadurl, notifications, ndownload) {

	if (window.location.pathname.match(/.*\/read.*/)) {
		currenturl = "https://api.fakku.net" + $('a.a-series-title.manga-title').attr('href') + "/read";
		//console.log("GrabLinks URL: " + currenturl);
	} else if (window.location.pathname.match(/\/DropdownNotes.html$/)) {
		//console.log("GrabLinks triggered from DropdownNotes");
		currenturl = downloadurl.replace("www", "api") + "/read";
	} else {
		currenturl = "https://api.fakku.net" + $('div#container div.sub-navigation.with-breadcrumbs div.breadcrumbs a:last-child').attr('href') + "/read";
		//console.log("GrabLinks URL: " + currenturl);
	}

	$.ajax({     
		type: "GET",
		url: currenturl,
		dataType: "JSON",
		async: false,
		success: function(data) {
		//console.log("GrabLinks Success");
			if (data.content != "" || !$.isEmptyObject(data.content)) {
				linkarray = ["linkarray"];
				$.each(data.pages, function(i, data) {
					linkarray.push(data.image);
				});
				linkarray.push(linkarray[1].match(/t.fakku.net\/.*\/images\/.*/).toString().slice(-4));
				msgDocReadyLink(ndownload);
			} else  {
				this.error({status: 0, statusText: "Query returned empty."});
			}
		},
		error: function(error) {
			msgError(error);
			//console.log("Error!");
		}
	});
}

// Sends a message stating that the links have been grabbed properly.
function msgDocReadyLink(ndownload) {
	chrome.runtime.sendMessage({msg: "docReadyLink", data: linkarray});
	// if (ndownload) {
	// 	nDocReadyLink(linkarray);
	// }
}

// Sends a message stating that there was an error when grabbing the links.
// This is used by GrabInfo as well.
function msgError(error) {
	chrome.runtime.sendMessage({msg: "Error", errorMessage: error});
}
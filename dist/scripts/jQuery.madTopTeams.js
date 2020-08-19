
/**********************************************************************\
*
*	jQuery.madTopTeams
*	----------------------
*	version: 2.0.3
*	date: 2020/08/19
*	license: GPL-3.0-or-later
*	copyright (C) 2020 Brian Patrick Mucha
*
\**********************************************************************/

/**********************************************************************\
*
* <div class="section">
*   <div class="container">
*     <h2>Top Teams</h2>
*     <div id="top_teams_results" class="row list-results"></div>
*   </div>
* </div>
* 
* <!--// Results Template //-->
* <script id="results_template_top_teams" type="text/template">
*   <div class="col-12 col-lg-8">
*     <strong>%%name%%</strong>
*   </div>
*   <div class="col-12 col-lg-4 text-right">
*     <em>%%total%%</em>
*   </div>
* </script>
* 
* <!--// Init Top Teams //-->
* <script>
*  jQuery(document).ready(function ($) {
*    var options =
*    {
*      "proxyURL":"AjaxProxy?auth=[[S86:true]]&cnv_url=",
*      "nonsecureConvioPath":"http://[[S29:DOMAIN]][[S29:PATH]]",
*      "secureConvioPath":"https://[[S29:SECURE_DOMAIN]][[S29:SECURE_PATH]]",
*      "apiKey":"[[S0:CONVIO_API_KEY]]",
*      "fr_ids":["1234", "5678"],
*      "maxCount": "10",
*      "loadingImage": "../images/loader.gif",
*      "loadingImageAlt": "&#x1F551",
*      "results_template_id": "results_template_top_teams"
*    }
*   $("#top_teams_results").madTopTeams( options );
*  });
* </script>
*
\**********************************************************************/
(function ($) {

	"use strict";

	/* ********** Private Functions ********** */

	function markLoading(element, settings) {
		$(element).empty();
		if (settings.loadingImage && settings.loadingText) {
			element.append("<div class=\"list_loading\"><img alt=\"" + settings.loadingImageAlt + "\" src=\"" + settings.loadingImage + "\" />" + settings.loadingText + "</div>");
		} else if (settings.loadingImage) {
			element.append("<div class=\"list_loading\"><img alt=\"" + settings.loadingImageAlt + "\" src=\"" + settings.loadingImage + "\" /></div>");
		} else if (settings.loadingText) {
			element.append("<div class=\"list_loading\">" + settings.loadingText + "</div>");
		}
	}

	function getAllTopTeams(element, settings) {

		var deferreds = [];
		var results = [];

		$.each(settings.fr_ids, function( index, value ) {

			var paramString =
				"method=getTopTeamsData" +
				"&v=1.0" +
				"&api_key=" + settings.apiKey +
				"&response_format=json" +
				"&suppress_response_codes=true" +
				"&fr_id=" + value;

			var requestURL = settings.proxyURL + escape(settings.secureConvioPath + "CRTeamraiserAPI?" + paramString);
			var deferred = $.getJSON(requestURL, function (result) { results.push(result); });

			deferreds.push(deferred);

		});

		$.when.apply($, deferreds)
			.then(function()
			{
				var compiledResults = [];
				$.each(results, function( index, value ) {
					if(value.getTopTeamsDataResponse) {
						var counter;
						for (counter = 0; counter < value.getTopTeamsDataResponse.teamraiserData.length; counter++) {
							value.getTopTeamsDataResponse.teamraiserData[counter].total_num = Number(value.getTopTeamsDataResponse.teamraiserData[counter].total.replace(/[^0-9.-]+/g,""));
						}
						compiledResults = [].concat(compiledResults, value.getTopTeamsDataResponse.teamraiserData);
					}
				});
				updateDomElement(compiledResults, element, settings);
			})
			.fail(function()
			{
				window.console && console.error("Top Teams: unsuccessful");
			});

	}

	function updateDomElement(data, element, settings) {
		if( data.errorResponse )
		{
			element.html("<div class=\"list_message\">(" + data.errorResponse.message + ")</div>");
		} else {
			$(element).empty();
			var trObject = ensureArray(data);
			if ($(trObject).length > 0) {
				trObject.sort((a,b)=>b.total_num-a.total_num);
				$.each(trObject, function (idx, val) {

					var template = document.getElementById(settings.results_template_id);
					var templateHtml = template.innerHTML;

					var newEntry;

					var id;
					var name;
					var total;

					id = this.id;
					name = this.name;
					total = this.total;

					newEntry = templateHtml
						.replace(/%%id%%/g, id)
						.replace(/%%name%%/g, name)
						.replace(/%%total%%/g, total);

					element.append(newEntry);

					if(idx+1 == settings.maxCount) { return false; }

				});
			} else {
				element.html("<div class=\"list_message\">(end of list)</div>");
			}
			if (settings.callBack) { settings.callBack(); }
		}
	}

	function ensureArray(a, b, n) {
		if (arguments.length === 0) return [];
		if (arguments.length === 1) {
			if (a === undefined || a === null) return [];
			if (Array.isArray(a)) return a;
		}
		return Array.prototype.slice.call(arguments);
	}

	/* ********** Plugin Functions ********** */

	var settings = {};

	var defaults =
	{
		"fr_ids": [],
		"maxCount": 10,
		"loadingImage": null,
		"loadingImageAlt": null,
		"loadingText": null,
		"callback": function() {}
	};

	var methods =
	{
		init: function (options) {
			settings = $.extend({}, defaults, options);
			markLoading(this, settings);
			this.data("settings", settings);	// Store the state for pagination.
			getAllTopTeams(this, settings);
		}
	};

	$.fn.madTopTeams = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === "object" || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error("Method " + method + " does not exist on jQuery.madTopTeams");
		}
	};

})(jQuery);

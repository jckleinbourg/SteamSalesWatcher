// AUTHOR: JCK

var _stores = {
	"steam": true,
	"amazonus": true,
	"impulse": true,
	"gamersgate": true,
	"direct2drive": true,
	"origin": true,
	"uplay": true,
	"indiegalastore": true,
	"gamesplanet": true,
	"indiegamestand": true,
	"gog": true,
	"nuuvem": true,
	"dlgamer": true,
	"humblestore": true,
	"squenix": true,
	"bundlestars": true,
	"fireflower": true,
	"humblewidgets": true,
	"newegg": true,
	"wingamestore": true,
	"macgamestore": true,
	"gamebillet": true,
	"silagames": true,
	"itchio": true,
	"gamejolt": true,
	"paradox": true,
	"dreamgame": true,
	"chrono": true,
	"savemi": true
};

var _storesStr;

var _cc = "fr";

var _data;
var total, counter;

function init() {

	_data = [];

	$("#part1").hide();
	$("#loading-wishlist").show();

	// generate store list
	_storesStr = "";
	$.each(_stores, function (store, value) {
		if (_stores[store] === true) {
			_storesStr += store + ",";
		}
	});

	// get user wishlist
	$.ajaxPrefilter(function (options) {
		if (options.crossDomain && jQuery.support.cors) {
			var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
			options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
		}
	});

	$.get(
		"https://store.steampowered.com/wishlist/id/" + $("#steamid").val(),
		function (response) {

		// this parse the wishlist to get the data (updated 2018 with the new Steam wishlist):

		var el = document.createElement('html');
		el.innerHTML = response;

		var script_elements = el.getElementsByTagName("script");

		var wish_index;
		for (var i = 0; i < script_elements.length; i++) {
			if (script_elements[i].innerHTML.indexOf("g_rgWishlistData") >= 0) {
				wish_index = i;
			}
		}
		var GDynamicStore = {};
		$.globalEval(script_elements[wish_index].innerHTML);

		parseWishlist(g_rgWishlistData, g_rgAppInfo);
	});
}

function parseWishlist(wish_data, wish_info) {

	$("#part2").show();
	$("#loading-wishlist").hide();

	counter = 0;
	total = wish_data.length;

	for (var i = 0; i < wish_data.length; i++) {

		var obj = new Object();
		if (wish_info[wish_data[i].appid] != undefined) {

			obj.id = wish_data[i].appid;
			obj.title = wish_info[wish_data[i].appid].name;

			if (wish_info[wish_data[i].appid].subs[0] != undefined) {
				var html_block = wish_info[wish_data[i].appid].subs[0]["discount_block"];
				if ($(html_block).find('.discount_original_price').html() != undefined) {
					obj.price_string = $(html_block).find('.discount_original_price').html();
				} else {
					obj.price_string = $(html_block).find('.discount_final_price').html();
				}
			}
			if (obj.price_string != undefined) {
				obj.price_string = obj.price_string.replace("$", "") + "€";
			}
			obj.url = "https://store.steampowered.com/app/" + obj.id;

			obj.thumb_url = wish_info[wish_data[i].appid].capsule;

			var api_infos = get_price_data(obj, obj.id, addInfos);

		} else {
			total--;
		}

		function addInfos(new_obj) {

			_data.push(new_obj);
			var pct = Math.round(counter / total * 100);
			$("#loading").attr("aria-valuenow", pct);
			$("#loading").attr("style", "width: " + pct + "%");
			$("#loading").html(pct + "%");

			counter++;

			if (counter >= total) {

				_data.sort(SortByDiscount);
				showWishlist();

				$("#part2").hide();
				$("#part3").show();

				function showWishlist() {
					$("#wishlist").empty();
					$.each(_data, function (index, obj) {
						$("#wishlist").append(generateView(obj));
					});
				}

				// sort alphabetical
				$("#bt-sort-az").click(function () {
					function SortByTitle(a, b) {
						var aTitle = a.title.toLowerCase();
						var bTitle = b.title.toLowerCase();
						return ((aTitle < bTitle) ? -1 : ((aTitle > bTitle) ? 1 : 0));
					}
					_data.sort(SortByTitle);
					showWishlist();
				});

				// sort by price
				$("#bt-sort-price").click(function () {
					function SortByPrice(a, b) {
						var aPrice = a.current_price;
						var bPrice = b.current_price;
						if ((aPrice == 0) || (aPrice == "_")) {
							return 1;
						} else if ((bPrice == 0) || (bPrice == "_")) {
							return -1;
						} else {
							return ((aPrice < bPrice) ? -1 : ((aPrice > bPrice) ? 1 : 0));
						}
					}
					_data.sort(SortByPrice);
					showWishlist();
				});

				// sort by discount
				$("#bt-sort-discount").click(function () {
					_data.sort(SortByDiscount);
					showWishlist();
				});
				function SortByDiscount(a, b) {
					var aDiscount = a.current_cut;
					var bDiscount = b.current_cut;
					if (aDiscount == "_") {
						return 1;
					} else if (bDiscount == "_") {
						return -1;
					} else {
						return ((aDiscount > bDiscount) ? -1 : ((aDiscount < bDiscount) ? 1 : 0));
					}
				}

			}
		}
	}
}

function generateView(obj) {

	function currency(val) {
		var str = parseFloat(Math.round(val * 100) / 100).toFixed(2) + "€";
		if ((str == "NaN€") || (val == 0)) {
			str = "__€"
		}
		return str;
	}

	var str = '<div class="list-group-item"><div class="media-left"><img class="media-object" src="' + obj.thumb_url + '"></div><div class="media-body"><a href="' + obj.url + '" target="_blank"><h4 class="list-group-item-heading">' + obj.title + '</h4></a><p class="list-group-item-text"><strong>' + currency(obj.current_price) + '</strong>&nbsp;';

	if (obj.current_cut > 0) {
		str += '<small>instead of ' + obj.price_string + '</small>&nbsp;&nbsp;<span class="label ';
		if (obj.current_cut >= 75) {
			str += 'label-danger';
		} else if (obj.current_cut >= 50) {
			str += 'label-warning';
		} else {
			str += 'label-info';
		}

		str += '">' + obj.current_cut + '%</span>&nbsp;&nbsp;at <a href="' + obj.current_link + '" target="_blank">' + obj.current_store + '</a>';
	}

	str += '<p class="h6 text-muted"><em>Lowest price: ' + currency(obj.lowest_price) + ', ' + obj.lowest_date + ' at ' + obj.lowest_store + '</em></p></div></div>';

	return str;
}

function get_price_data(obj, id, callback) {
	var xhr = createCORSRequest('GET', "https://api.enhancedsteam.com/pricev3/?appid=" + id + "&stores=" + _storesStr + "&cc=" + _cc + "&coupon=true");
	xhr.send();
	xhr.onload = function () {
		var responseText = xhr.responseText;
		var data = JSON.parse(responseText);

		if (data != undefined) {
			data = data["app/" + id];
		}

		obj.current_price = "_";
		obj.current_store = "_";
		obj.current_cut = "_";
		obj.current_link = "_";
		obj.lowest_price = "_";
		obj.lowest_store = "_";
		obj.lowest_date = "_";

		if (data) {
			// Lowest Price
			if (data["price"]) {
				obj.current_price = data["price"]["price"];
				obj.current_store = data["price"]["store"];
				obj.current_cut = data["price"]["cut"];
				obj.current_link = data["price"]["url"];
			}
			// History
			if (data["lowest"]) {
				obj.lowest_price = data["lowest"]["price"];
				obj.lowest_store = data["lowest"]["store"];
				obj.lowest_date = data["lowest"]["recorded_formatted"];
			}
		} else {
			console.log("NO DATA FOR APP " + id);
		}

		if (obj.current_cut == "_") {
			if (obj.price_string != undefined) {
				var price = obj.price_string.replace(",", ".");
				price = price.replace("€", "");
				obj.current_price = price;
			}
		}
		callback(obj);
	}
	xhr.onerror = function () {
		console.log('There was an error!');
		total--;
	};
};

function get_http(url, callback) {
	var jqxhr = $.ajax(url, {
			dataType: "text"
		});
	jqxhr.done(callback);
	jqxhr.fail(function (jqxhr, textStatus, errorThrown) {
		console.log(jqxhr.status + ": " + errorThrown);
	});
	return jqxhr;
}

function createCORSRequest(method, url) {
	var xhr = new XMLHttpRequest();
	if ("withCredentials" in xhr) {
		xhr.open(method, url, true);
	} else if (typeof XDomainRequest != "undefined") {
		xhr = new XDomainRequest();
		xhr.open(method, url);

	} else {
		xhr = null;
	}
	return xhr;
}
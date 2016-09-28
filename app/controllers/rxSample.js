var args = $.args;

var parts = Alloy.Models.appload.get("sampl_rx_image").split('_'),
						whole = parts[0],
						fractional = parts[1] || '';
						
$.img.image = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, fractional).read();

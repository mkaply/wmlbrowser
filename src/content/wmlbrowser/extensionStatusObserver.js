var wmlbrowser_extension_observer =  {
    QueryInterface: function (iid) { 
        if (iid.equals(Components.interfaces.nsISupports) ||
            iid.equals(Components.interfaces.nsIObserver))
            return this;

        throw Components.results.NS_ERROR_NO_INTERFACE;
    },

    observe: function (aSubject, aTopic, aData ) {
        // Find which extension is being altered
        var subject = aSubject.QueryInterface (Components.interfaces.nsIUpdateItem);
        // Check that it's UUID matches that of wmlbrowser
        if (subject.id == "{c4dc572a-3295-40eb-b30f-b54aa4cdc4b7}") {
            // If we are either disabling or uninstalling the extension,
            // switch off the WML preference
            if (aData == "item-disabled" || aData == "item-uninstalled") {
                _wmlbrowser_setPreference (false);
            }
            // Note: we could in principle try to reinstate the previous
            // preference values if the user enabled the extension.
        }
    }
};

window.addEventListener
   ("load",
    function(e) {
        Components.classes["@mozilla.org/observer-service;1"]
           .getService(Components.interfaces.nsIObserverService)
           .addObserver(wmlbrowser_extension_observer, "em-action-requested", false);
    },
     false);

window.addEventListener
   ("unload",
    function(e) {
        Components.classes["@mozilla.org/observer-service;1"]
           .getService(Components.interfaces.nsIObserverService)
           .removeObserver(wmlbrowser_extension_observer, "em-action-requested");
    },
    false);

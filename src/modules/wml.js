const EXPORTED_SYMBOLS = [];

Components.classes["@mozilla.org/parentprocessmessagemanager;1"]
    .getService(Components.interfaces.nsIMessageBroadcaster)
    .loadProcessScript("resource://wmlbrowser/wml-service.js", true);

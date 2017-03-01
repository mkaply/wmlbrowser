/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is wmlbrowser.
 *
 * The Initial Developer of the Original Code is
 * Matthew Wilson <matthew@mjwilson.demon.co.uk>.
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/**
 * A WebProgressListener for the wmlbrowser extension.
 * @param b Browser to monitor
 * @param d Direction of web progress (1=forwards or new entry, -1=back.
 */
function wmlbrowserWebProgressListener (b,d) {
    this.browser = b;
    this.direction = d;
    this.logger =
        Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
}

/**
 * The namespace used for our internal attributes set on the
 * transformed HTML document.
 */
wmlbrowserWebProgressListener.prototype.WMLBROWSER_NS = "http://wmlbrowser.mozdev.org/ns/forms#";

/**
 * Standard QueryInterface function.
 * This module implements nsIWebProgressListener, nsISupportsWeakReference,
 * and nsISupports.
 */
wmlbrowserWebProgressListener.prototype.QueryInterface = function(aIID)
{
    if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
        aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
        aIID.equals(Components.interfaces.nsISupports))
        return this;
    throw Components.results.NS_NOINTERFACE;
};

wmlbrowserWebProgressListener.prototype.afterLoad = function (aProgress, aURI) {
    try {
        //this.logger.logStringMessage ("wmlbrowserWebProgressListener.afterLoad uri="+aURI);

        var doc = aProgress.DOMWindow.document;

        if (doc.documentElement.hasAttributeNS (this.WMLBROWSER_NS, "wmlbrowser")) {
            var card;
            if (aURI.indexOf ("#") > 0) {
                var fragid = aURI.substring (1+aURI.indexOf("#"));
                var card = doc.getElementById (fragid);
            } else {
                var card = doc.getElementsByTagName ("div")[0];
            }
            //this.logger.logStringMessage ("wmlbrowserWebProgressListener.afterLoad card=" + card);
            var sandbox = Components.utils.Sandbox(aURI);
            sandbox.window = aProgress.DOMWindow;
            sandbox.document = doc;
            sandbox.card = card;
            if (card.hasAttributeNS(this.WMLBROWSER_NS, "onformentered")) {
                Components.utils.evalInSandbox (card.getAttributeNS(this.WMLBROWSER_NS, "onformentered"), sandbox);
            }
            if (this.direction == +1 && card.hasAttributeNS(this.WMLBROWSER_NS, "onenterforward")) {
                Components.utils.evalInSandbox (card.getAttributeNS(this.WMLBROWSER_NS, "onenterforward"), sandbox);
            } else if (this.direction == -1 && card.hasAttributeNS(this.WMLBROWSER_NS, "onenterbackward")) {
                Components.utils.evalInSandbox (card.getAttributeNS(this.WMLBROWSER_NS, "onenterbackward"), sandbox);
            }
        }
    } catch (e) {
        this.logger.logStringMessage(e);
    }
}

wmlbrowserWebProgressListener.prototype.onStateChange = function(aProgress,aRequest,aFlag,aStatus)
{
    //this.logger.logStringMessage ("wmlbrowserWebProgressListener.onStateChange " + aFlag);
    if (aFlag & Components.interfaces.nsIWebProgressListener.STATE_STOP) {
        //this.logger.logStringMessage ("wmlbrowserWebProgressListener.onStateChange STATE_STOP");
        this.afterLoad (aProgress, aRequest.name);
        this.browser.removeProgressListener (this);
    }
};

wmlbrowserWebProgressListener.prototype.onLocationChange = function(aProgress,aRequest,aLocation) {
    //this.logger.logStringMessage ("wmlbrowserWebProgressListener.onLocationChange window=" + aProgress.DOMWindow + ", request=" + aRequest + ", location=" + aLocation.spec + ", document=" + aProgress.DOMWindow.document + ", isLoadingDocument=" + aProgress.isLoadingDocument + ", title="+aProgress.DOMWindow.document.title);
    if (!aProgress.isLoadingDocument) {
        this.afterLoad (aProgress, aLocation.spec);
        this.browser.removeProgressListener (this);
    }
};

wmlbrowserWebProgressListener.prototype.onProgressChange =
  function(aWebProgress,aRequest,aCurSelfProgress,aMaxSelfProgress,aCurTotalProgress,aMaxTotalProgress) {
      //this.logger.logStringMessage ("wmlbrowserWebProgressListener.onProgressChange " + aCurSelfProgress + "/" + aMaxSelfProgress);
};
wmlbrowserWebProgressListener.prototype.onStatusChange = function(a,b,c,d){
    //this.logger.logStringMessage ("wmlbrowserWebProgressListener.onStatusChange");
};
wmlbrowserWebProgressListener.prototype.onSecurityChange =
   function(aWebProgress,aRequest,aState) {
}; 


function wmlbrowserHistoryListener (b) {
    this.browser = b;
    this.logger =
        Components.classes['@mozilla.org/consoleservice;1'].getService(Components.interfaces.nsIConsoleService);
}

wmlbrowserHistoryListener.prototype.QueryInterface = function(aIID)
{
    if (aIID.equals(Components.interfaces.nsISHistoryListener) ||
        aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
        aIID.equals(Components.interfaces.nsISupports))
        return this;
    throw Components.results.NS_NOINTERFACE;
}; 

wmlbrowserHistoryListener.prototype.OnHistoryNewEntry = function (uri) {
    this.logger.logStringMessage ("OnHistoryNewEntry uri=" + uri.spec);
    try {
        this.browser.addProgressListener
               (new wmlbrowserWebProgressListener(this.browser, 1),
                Components.interfaces.nsIWebProgress.NOTIFY_STATE_REQUEST ||
                Components.interfaces.nsIWebProgress.STATE_IS_DOCUMENT ||
                Components.interfaces.nsIWebProgress.STATE_IS_NETWORK ||
                Components.interfaces.nsIWebProgress.STATE_IS_WINDOW
                );
    } catch (e) {
        this.logger.logStringMessage (e);
    }
    return true;
};

wmlbrowserHistoryListener.prototype.OnHistoryGoBack = function (uri) {
    this.logger.logStringMessage ("OnHistoryGoBack " + uri.spec);
    try {
        this.browser.addProgressListener
               (new wmlbrowserWebProgressListener(this.browser, -1),
                Components.interfaces.nsIWebProgress.NOTIFY_STATE_REQUEST ||
                Components.interfaces.nsIWebProgress.STATE_IS_DOCUMENT ||
                Components.interfaces.nsIWebProgress.STATE_IS_NETWORK ||
                Components.interfaces.nsIWebProgress.STATE_IS_WINDOW
                );
    } catch (e) {
        this.logger.logStringMessage (e);
    }
    return true;
};

wmlbrowserHistoryListener.prototype.OnHistoryGoForward = function (uri) {
    this.logger.logStringMessage ("OnHistoryGoForward " + uri.spec);
    try {
        this.browser.addProgressListener
               (new wmlbrowserWebProgressListener(this.browser, 1),
                Components.interfaces.nsIWebProgress.NOTIFY_STATE_REQUEST ||
                Components.interfaces.nsIWebProgress.STATE_IS_DOCUMENT ||
                Components.interfaces.nsIWebProgress.STATE_IS_NETWORK ||
                Components.interfaces.nsIWebProgress.STATE_IS_WINDOW
                );
    } catch (e) {
        this.logger.logStringMessage (e);
    }
    return true;
};

wmlbrowserHistoryListener.prototype.OnHistoryReload = function (uri) {
    this.logger.logStringMessage ("OnHistoryReload " + uri.spec);
    return true;
};

wmlbrowserHistoryListener.prototype.OnHistoryPurge = function (uri) {
    this.logger.logStringMessage ("OnHistoryPurge " + uri.spec);
    return true;
}

// http://forums.mozillazine.org/viewtopic.php?p=2381777&sid=61f73c3c12953f5f195deb9b18eb3030
function initialiseWmlbrowserHistoryListener() {

    try {

        // add first History Listener to focused browser at start-up.
        gBrowser.wmlbrowserHistoryListener = new wmlbrowserHistoryListener(gBrowser);
        gBrowser.sessionHistory.addSHistoryListener(gBrowser.wmlbrowserHistoryListener);

        // listen for new tabs and add a HistoryListener
        gBrowser.mTabContainer.addEventListener("DOMNodeInserted",

            function(event) {

                if(event.target.localName == "tab") {

                    Components.classes['@mozilla.org/consoleservice;1']
                            .getService(Components.interfaces.nsIConsoleService)
                            .logStringMessage ("wmlbrowser historyListener got new tab");

                    // wait until new Browser is initialized
                    setTimeout(
                        function() {

                            var tab = event.target;
                            var browser = gBrowser.getBrowserForTab(tab);         

                            browser.wmlbrowserHistoryListener = new wmlbrowserHistoryListener(browser);
                            browser.sessionHistory.addSHistoryListener( browser.wmlbrowserHistoryListener );

                        },
                        50);
                }
            }
        , false);

    } catch (e) {
     Components.classes['@mozilla.org/consoleservice;1']
        .getService(Components.interfaces.nsIConsoleService)
           .logStringMessage (e);
    }
};

window.addEventListener("load", function() { initialiseWmlbrowserHistoryListener(); }, false); 

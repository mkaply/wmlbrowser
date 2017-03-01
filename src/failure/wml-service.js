/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * The Original Code is the wmlbrowser extension.
 * 
 * The Initial Developer of the Original Code is Matthew Wilson
 * <matthew@mjwilson.demon.co.uk>. Portions created by the Initial Developer
 * are Copyright (C) 2004 the Initial Developer. All Rights Reserved.
 * 
 * Contributor(s): 
 *
 * This file contains the content handler for converting content of type
 * text/vnd.wap.wml (WMLStreamConverter)
 */

/* components defined in this file */

const WMLSTREAM_CONVERT_CONVERSION =
    "?from=text/vnd.wap.wml&to=*/*";
const WMLSTREAM_CONVERTER_CONTRACTID =
    "@mozilla.org/streamconv;1" + WMLSTREAM_CONVERT_CONVERSION;
const WMLSTREAM_CONVERTER_CID =
    Components.ID("{51427b76-8626-4a72-bd5f-2ac0ce5d101a}");

/* text/vnd.wap.wml -> text/html stream converter */
function WMLStreamConverter ()
{
    this.logger = Components.classes['@mozilla.org/consoleservice;1']
        .getService(Components.interfaces.nsIConsoleService);

}

WMLStreamConverter.prototype.QueryInterface =
function (iid) {

    if (iid.equals(Components.interfaces.nsISupports) ||
        iid.equals(Components.interfaces.nsIStreamConverter) ||
        iid.equals(Components.interfaces.nsIStreamListener) ||
        iid.equals(Components.interfaces.nsIRequestObserver))
        return this;

    throw Components.results.NS_ERROR_NO_INTERFACE;

}

// nsIRequest observer methods
WMLStreamConverter.prototype.onStartRequest =
function (aRequest, aContext) {

    this.logger.logStringMessage ("onStartRequest");

    this.data = '';

    this.uri = aRequest.QueryInterface (Components.interfaces.nsIChannel).URI.spec;

    this.channel = aRequest;
    this.channel.contentType = "text/html";

    this.listener.onStartRequest (this.channel, aContext);

};

WMLStreamConverter.prototype.onStopRequest =
function (aRequest, aContext, aStatusCode) {

    this.logger.logStringMessage ("onStopRequest; document is:\n" + this.data);

    var result = "<html><body><pre>got<br>" + this.data + "</pre></body></html>";

    var sis =
        Components.classes["@mozilla.org/io/string-input-stream;1"]
        .createInstance(Components.interfaces.nsIStringInputStream);
    sis.setData (result, result.length);

    // Pass the data to the main content listener
    this.listener.onDataAvailable (this.channel, aContext, sis, 0, result.length);

    this.listener.onStopRequest (this.channel, aContext, aStatusCode);

};

// nsIStreamListener methods
WMLStreamConverter.prototype.onDataAvailable =
function (aRequest, aContext, aInputStream, aOffset, aCount) {

    var si = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance();
    si = si.QueryInterface(Components.interfaces.nsIScriptableInputStream);
    si.init(aInputStream);
    this.data += si.read(aCount);

    this.logger.logStringMessage ("onDataAvailable, document so far is:\n" + this.data);

    si.close();

}

// nsIStreamConverter methods
WMLStreamConverter.prototype.AsyncConvertData =
function (aFromType, aToType, aListener, aCtxt) {
    // Store the listener passed to us
    this.listener = aListener;
}

WMLStreamConverter.prototype.Convert =
function (aFromStream, aFromType, aToType, aCtxt) {
    return aFromStream;
}

/* stream converter factory object (WMLStreamConverter) */
var WMLStreamConverterFactory = new Object();

WMLStreamConverterFactory.createInstance =
function (outer, iid) {
    if (outer != null)
        throw Components.results.NS_ERROR_NO_AGGREGATION;

    if (iid.equals(Components.interfaces.nsISupports) ||
        iid.equals(Components.interfaces.nsIStreamConverter) ||
        iid.equals(Components.interfaces.nsIStreamListener) ||
        iid.equals(Components.interfaces.nsIRequestObserver))

        return new WMLStreamConverter();

    throw Components.results.NS_ERROR_INVALID_ARG;

}

var WMLBrowserModule = new Object();

WMLBrowserModule.registerSelf =
function (compMgr, fileSpec, location, type)
{

    var compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);

    compMgr.registerFactoryLocation(WMLSTREAM_CONVERTER_CID,
                                    "WML Stream Converter",
                                    WMLSTREAM_CONVERTER_CONTRACTID, 
                                    fileSpec,
                                    location, 
                                    type);

    var catman = Components.classes["@mozilla.org/categorymanager;1"]
                     .getService(Components.interfaces.nsICategoryManager);
    catman.addCategoryEntry("@mozilla.org/streamconv;1",
                            WMLSTREAM_CONVERT_CONVERSION,
                            "WML to HTML stream converter",
                            true, true);
};

WMLBrowserModule.unregisterSelf =
function(compMgr, fileSpec, location)
{
}

WMLBrowserModule.getClassObject =
function (compMgr, cid, iid) {

    if (cid.equals(WMLSTREAM_CONVERTER_CID))
        return WMLStreamConverterFactory;

    if (!iid.equals(Components.interfaces.nsIFactory))
        throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

    throw Components.results.NS_ERROR_NO_INTERFACE;
    
}

WMLBrowserModule.canUnload =
function(compMgr)
{
    return true;
}

/* entrypoint */
function NSGetModule(compMgr, fileSpec) {
    return WMLBrowserModule;
}

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
 * The Original Code is the Mozilla WBMP Decoder.
 *
 * The Initial Developer of the Original Code is
 * Matthew Wilson <matthew@mjwilson.demon.co.uk>.
 * Portions created by the Initial Developer are Copyright (C) 2003
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Matthew Wilson <matthew@mjwilson.demon.co.uk>
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


#include "mozilla/ModuleUtils.h"
#include "nsIModule.h"
#include "nsICategoryManager.h"
#include "nsXPCOMCID.h"
#include "nsServiceManagerUtils.h"
#include "nsWBMPDecoder.h"

// objects that just require generic constructors

NS_GENERIC_FACTORY_CONSTRUCTOR(nsWBMPDecoder)

/*
static NS_METHOD WbmpRegisterProc(nsIComponentManager *aCompMgr,
                                  nsIFile *aPath,
                                  const char *registryLocation,
                                  const char *componentType,
                                  const nsModuleComponentInfo *info) {
  nsresult rv;
  nsCOMPtr<nsICategoryManager> catMan(do_GetService(NS_CATEGORYMANAGER_CONTRACTID, &rv));
  if (NS_FAILED(rv))
    return rv;
  catMan->AddCategoryEntry("Gecko-Content-Viewers", "image/vnd.wap.wbmp",
                           "@mozilla.org/content/document-loader-factory;1",
                           PR_TRUE, PR_TRUE, nsnull);
  return NS_OK;
}

static NS_METHOD WbmpUnregisterProc(nsIComponentManager *aCompMgr,
                                    nsIFile *aPath,
                                    const char *registryLocation,
                                    const nsModuleComponentInfo *info) {
  nsresult rv;
  nsCOMPtr<nsICategoryManager> catMan(do_GetService(NS_CATEGORYMANAGER_CONTRACTID, &rv));
  if (NS_FAILED(rv))
    return rv;
  catMan->DeleteCategoryEntry("Gecko-Content-Viewers", "image/vnd.wap.wbmp", PR_TRUE);
  return NS_OK;
}

static const nsModuleComponentInfo components[] =
{
  { "WBMP decoder",
    NS_WBMPDECODER_CID,
    "@mozilla.org/image/decoder;2?type=image/vnd.wap.wbmp",
    nsWBMPDecoderConstructor,
    WbmpRegisterProc,
    WbmpUnregisterProc },
};

NS_IMPL_NSGETMODULE(nsWBMPDecoderModule, components)
*/

NS_DEFINE_NAMED_CID(NS_WBMPDECODER_CID);

#define NS_WBMPDECODER_CONTRACTID "@mozilla.org/image/decoder;2?type=image/vnd.wap.wbmp"

static const mozilla::Module::CIDEntry kWBMPDecoderCIDs[] = {
    { &kNS_WBMPDECODER_CID, false, NULL, nsWBMPDecoderConstructor },
    { NULL }
};
 
static const mozilla::Module::ContractIDEntry kWBMPDecoderContracts[] = {
    { NS_WBMPDECODER_CONTRACTID, &kNS_WBMPDECODER_CID },
    { NULL }
};

// Category entries are category/key/value triples which can be used
// to register contract ID as content handlers or to observe certain
// notifications. Most modules do not need to register any category
// entries: this is just a sample of how you'd do it.
// @see nsICategoryManager for information on retrieving category data.
static const mozilla::Module::CategoryEntry kWBMPDecoderCategories[] = {
    { "Gecko-Content-Viewers", "image/vnd.wap.wbmp", "@mozilla.org/content/document-loader-factory;1" },
    { NULL }
};
/*
  nsCOMPtr<nsICategoryManager> catMan(do_GetService(NS_CATEGORYMANAGER_CONTRACTID, &rv));
  if (NS_FAILED(rv))
    return rv;
  catMan->AddCategoryEntry("Gecko-Content-Viewers", "image/vnd.wap.wbmp",
                           "@mozilla.org/content/document-loader-factory;1",
                           PR_TRUE, PR_TRUE, nsnull);
  return NS_OK;
*/

static const mozilla::Module kWBMPDecoderModule = {
    mozilla::Module::kVersion,
    kWBMPDecoderCIDs,
    kWBMPDecoderContracts,
    kWBMPDecoderCategories
};

NSMODULE_DEFN(nsWBMPDecoderModule) = &kWBMPDecoderModule;

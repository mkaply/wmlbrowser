/* vim:set tw=80 expandtab softtabstop=4 ts=4 sw=4: */
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
 * The Initial Developer of the Original Code is Christian Biesinger
 * <cbiesinger@web.de>.  Portions created by Christian Biesinger are
 * Copyright (C) 2001 Christian Biesinger.  All Rights Reserved.
 *
 * Contributor(s):
 *   Arunan Balasubramaniam <arunan_bala@hotmail.com>
 *   Vladimir Vukicevic
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

/* Format description from http://www.wapforum.org/what/technical/SPEC-WAESpec-19990524.pdf */

#ifndef _nsWBMPDecoder_h
#define _nsWBMPDecoder_h

#include "nsCOMPtr.h"
#include "imgIDecoder.h"
#include "imgIContainer.h"
#include "imgIDecoderObserver.h"
#include "gfxColor.h"

#define NS_WBMPDECODER_CID \
{ /* {01E85D60-F795-47fc-B48A-B6A60DAEEE7D} */ \
  0x01E85D60, \
  0xF795, \
  0x47fc, \
  { 0xB4, 0x8A, 0xB6, 0xA6, 0x0D, 0xAE, 0xEE, 0x7D } \
}

typedef enum {
  INT_PARSE_SUCCEEDED,
  INT_PARSE_FAILED,
  INT_PARSE_IN_PROGRESS
} WbmpIntDecodeStatus;

typedef enum {
  DECODING_TYPE,
  DECODING_FIX_HEADER,
  DECODING_WIDTH,
  DECODING_HEIGHT,
  DECODING_IMAGE_DATA,
  DECODING_FAILED
} WbmpDecodingState;


class nsWBMPDecoder : public imgIDecoder
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_IMGIDECODER

  nsWBMPDecoder();
  virtual ~nsWBMPDecoder();

private:
  /** Callback for ReadSegments to avoid copying the data */
  static NS_METHOD ReadSegCb(nsIInputStream* aIn, void* aClosure,
              const char* aFromRawSegment, PRUint32 aToOffset,
              PRUint32 aCount, PRUint32 *aWriteCount);

  /** Processes the data.
   * @param aBuffer  Data to process.
   * @param aCount   Number of bytes in aBuffer */
  NS_METHOD ProcessData(const char* aBuffer, PRUint32 aCount);

  /** Processes data from the variable length header.  After returning, aBuffer
   *  will point to the byte following those processed by this function, and
   *  aCount will contain the number of bytes now pointed at by aBuffer.
   * @param aBuffer  Data to process (will be updated to point past data processed by this function).
   * @param aCount   Number of bytes in aBuffer (decremented by number of bytes processed by this function).
   */
  nsresult ProcessHeaderData(const char*& aBuffer, PRUint32& aCount);

  nsCOMPtr<imgIDecoderObserver> mObserver;

  nsCOMPtr<imgIContainer> mImage;

  PRUint32 mFlags;

  PRUint32 *mImageData; ///< Pointer to the image data for the frame

  PRUint32 mWidth;
  PRUint32 mHeight;

  PRUint8 *mRow;                    // Holds one raw line of the image
  PRUint32 mRowBytes;               // How many bytes of the row were already received
  PRUint32 mCurLine;                // The current line being decoded (0 to mHeight - 1)
  PRUint32 mOldLine;

  WbmpDecodingState mDecodingState; // Describes what part of the file we are decoding now.
};

inline void SetPixel(PRUint32*& aDecoded, PRBool aPixelWhite)
{
  *aDecoded++ =
      GFX_PACKED_PIXEL(255,
                       aPixelWhite ? 255 : 0,
                       aPixelWhite ? 255 : 0,
                       aPixelWhite ? 255 : 0);
}

#endif


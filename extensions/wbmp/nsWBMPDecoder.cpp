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

#include "nsWBMPDecoder.h"

#include "nsIInputStream.h"
#include "nsComponentManagerUtils.h"
#include "imgIContainerObserver.h"
#include "nsMemory.h"
#include "nsRect.h"
#include "nsIInterfaceRequestor.h"
#include "nsIInterfaceRequestorUtils.h"

NS_IMPL_ISUPPORTS1(nsWBMPDecoder, imgIDecoder)

#define LINE(row) (row)
#define PIXEL_OFFSET(row, col) (LINE(row) * mWidth + col)

nsWBMPDecoder::nsWBMPDecoder()
{
  mRow = nsnull;
  mWidth = mHeight = mRowBytes = mOldLine = mCurLine = 0;
}

nsWBMPDecoder::~nsWBMPDecoder()
{
}

NS_IMETHODIMP nsWBMPDecoder::Init(imgIContainer *aImage, imgIDecoderObserver *aObserver, PRUint32 aFlags)
{
  mDecodingState = DECODING_TYPE;

  mImage = aImage;
  mObserver = aObserver;
  mFlags = aFlags;

  if (!(mFlags & imgIDecoder::DECODER_FLAG_HEADERONLY) && mObserver)
    mObserver->OnStartDecode(nsnull);

  return NS_OK;
}

NS_IMETHODIMP nsWBMPDecoder::Close(PRUint32 aFlags)
{

  delete[] mRow;
  mRow = nsnull;
  mRowBytes = 0;
  mCurLine = 0;

  mImage->DecodingComplete();

  if (mObserver) {
    mObserver->OnStopFrame(nsnull, 0);
    mObserver->OnStopContainer(nsnull, mImage);
    mObserver->OnStopDecode(nsnull, NS_OK, nsnull);
    mObserver = nsnull;
  }
  mImage = nsnull;
  return NS_OK;
}

NS_IMETHODIMP nsWBMPDecoder::Flush()
{
  return NS_OK;
}

// ----------------------------------------
// Actual Data Processing
// ----------------------------------------

/** Parses a WBMP encoded int field.  Returns INT_PARSE_IN_PROGRESS (out of
 *  data), INT_PARSE_SUCCEEDED if the field was read OK or INT_PARSE_FAILED
 *  on an error.
 *  The encoding used for WBMP ints is per byte.  The high bit is a
 *  continuation flag saying (when set) that the next byte is part of the
 *  field, and the low seven bits are data.  New data bits are added in the
 *  low bit positions, i.e. the field is big-endian (ignoring the high bits).
 * @param aField Variable holds current value of field.  When this function
 *               returns INT_PARSE_IN_PROGRESS, aField will hold the
 *               intermediate result of the decoding, so this function can be
 *               called repeatedly for new bytes on the same field and will
 *               operate correctly.
 * @param aBuffer Points to encoded field data.
 * @param aCount Number of bytes in aBuffer. */
static WbmpIntDecodeStatus DecodeEncodedInt (PRUint32& aField, const char*& aBuffer, PRUint32& aCount)
{
  while (aCount > 0) {
    // Check if the result would overflow if another seven bits were added.
    // The actual test performed is AND to check if any of the top seven bits are set.
    if (aField & 0xFE000000) {
      // Overflow :(
      return INT_PARSE_FAILED;
    }

    // Get next encoded byte.
    char encodedByte = *aBuffer;

    // Update buffer state variables now we have read this byte.
    aBuffer++;
    aCount--;

    // Work out and store the new (valid) value of the encoded int with this byte added.
    aField = (aField << 7) + (PRUint32)(encodedByte & 0x7F);

    if (!(encodedByte & 0x80)) {
      // No more bytes, value is complete.
      return INT_PARSE_SUCCEEDED;
    }
  }

  // Out of data but in the middle of an encoded int.
  return INT_PARSE_IN_PROGRESS;
}

NS_METHOD nsWBMPDecoder::Write(const char* aBuffer, PRUint32 aCount)
{
  if (mDecodingState == DECODING_FAILED)
    return NS_ERROR_FAILURE;

  if (!aCount) // aCount=0 means EOF.
    return NS_OK;

  nsresult rv;

  // Check if we can skip the header fields; the image data will be the bulk of the file.
  if (mDecodingState != DECODING_IMAGE_DATA) {
    // We are still processing the header.
    rv = ProcessHeaderData(aBuffer, aCount);
    NS_ENSURE_SUCCESS(rv, rv);
  }

  // If we have read the whole header, store image data.
  if (mDecodingState == DECODING_IMAGE_DATA) {
    PRUint32 rowSize = (mWidth + 7) / 8; // +7 to round up to nearest byte

    // Process up to one row of data at a time until there is no more data.
    while ((aCount > 0) && (mCurLine < mHeight)) {
      // Calculate if we need to copy data to fill the next buffered row of raw data.
      PRUint32 toCopy = rowSize - mRowBytes;

      // If required, copy raw data to fill a buffered row of raw data.
      if (toCopy) {
        if (toCopy > aCount)
          toCopy = aCount;
        memcpy(mRow + mRowBytes, aBuffer, toCopy);
        aCount -= toCopy;
        aBuffer += toCopy;
        mRowBytes += toCopy;
      }

      // If there is a filled buffered row of raw data, process the row.
      if (rowSize == mRowBytes) {

        PRUint8* p = mRow;
        PRUint32* d = mImageData + PIXEL_OFFSET(mCurLine, 0);
        PRUint32 lpos = 0;

        while (lpos < mWidth) {
          PRInt8 bit;

          for (bit = 7; bit >= 0; bit--) {
            if (lpos >= mWidth)
              break;
            PRBool pixelWhite = (*p >> bit) & 1;
            SetPixel(d, pixelWhite);
            ++lpos;
          }
          ++p;
        }

        mCurLine++; 
        if (mCurLine == mHeight) {
          // Finished last line
          break;
        }
        mRowBytes = 0;

      }
    }
  }

    const PRUint32 rows = mCurLine;
    if (rows) {
        nsIntRect r(0, 0, mWidth, rows);
        // Tell the image that its data has been updated
	rv = mImage->FrameUpdated(0, r); 
        NS_ENSURE_SUCCESS(rv, rv);

        mObserver->OnDataAvailable(nsnull, PR_TRUE, &r);
        mOldLine = mCurLine;
    }                                                                           

  return NS_OK;
}

nsresult nsWBMPDecoder::ProcessHeaderData(const char*& aBuffer, PRUint32& aCount)
{
  nsresult rv;

  // Check if we need to read the type field.
  if (mDecodingState == DECODING_TYPE) {
    // Since we only accept a type 0 WBMP we can just check the first byte is 0.
    // (The specification says a well defined type 0 bitmap will start with a 0x00 byte).
    if (*aBuffer++ == 0x00) {
      // This is a type 0 WBMP.
      rv = mObserver->OnStartDecode(nsnull);
      NS_ENSURE_SUCCESS(rv, rv);
      aCount--;
      mDecodingState = DECODING_FIX_HEADER;
    } else {
      // This is a new type or WBMP or a type 0 WBMP defined oddly (e.g. 0x80 0x00)
      return NS_ERROR_FAILURE;
    }
  }

  // Check if we need to read the fix header field.
  if ((mDecodingState == DECODING_FIX_HEADER) && aCount) {
    if ((*aBuffer++ & 0x9F) == 0x00) {
      // Fix header field is as expected
      aCount--;
      // For now, we skip the ext header field as it is not in a well-defined type 0 WBMP.
      mDecodingState = DECODING_WIDTH;
    } else {
      // Can't handle this fix header field.
      return NS_ERROR_FAILURE;
    }
  }

  // For now, ignore ext header field as it is not present in well defined type 0 WBMP.
  // (The above code will ensure that we would have returned an error by this point if
  // there was an ext header field present, as we both check for type 0 and check the
  // fix header field for (bit 7 == 0), i.e. no ext header field.

  // Check if we need to read the width field.
  if ((mDecodingState == DECODING_WIDTH) && aCount) {
    WbmpIntDecodeStatus widthReadResult = DecodeEncodedInt (mWidth, aBuffer, aCount);

    if (widthReadResult == INT_PARSE_SUCCEEDED) {
      mDecodingState = DECODING_HEIGHT;
    } else if (widthReadResult == INT_PARSE_FAILED) {
      // Encoded width was bigger than a PRUint32.
      return NS_ERROR_FAILURE;
    } else {
      // We are still parsing the encoded int field.
      NS_ASSERTION((widthReadResult == INT_PARSE_IN_PROGRESS), "nsWBMPDecoder got bad result from an encoded width field");
      return NS_OK;
    }
  }

  // Check if we need to read the height field.
  if ((mDecodingState == DECODING_HEIGHT) && aCount) {
    WbmpIntDecodeStatus heightReadResult = DecodeEncodedInt (mHeight, aBuffer, aCount);

    if (heightReadResult == INT_PARSE_SUCCEEDED) {
      // The header has now been entirely read.
      rv = mImage->SetSize(mWidth, mHeight);
      NS_ENSURE_SUCCESS(rv, rv);
      rv = mObserver->OnStartContainer(nsnull, mImage);
      NS_ENSURE_SUCCESS(rv, rv);

      // Create mRow, the buffer that holds one line of the raw image data
      mRow = new PRUint8[(mWidth + 7) / 8];
      if (!mRow) {
        return NS_ERROR_OUT_OF_MEMORY;
      }

      PRUint32 imageLength;

      rv = mImage->AppendFrame(0, 0, mWidth, mHeight, gfxASurface::ImageFormatARGB32,
                               (PRUint8**)&mImageData, &imageLength);

      NS_ENSURE_SUCCESS(rv, rv);

      if (!mImageData)
          return NS_ERROR_FAILURE;
 
      memset(mImageData, 0, imageLength);

      mObserver->OnStartFrame(nsnull, 0);
      NS_ENSURE_SUCCESS(rv, rv);

      // Update internal state so we don't call ProcessHeaderData again.
      mDecodingState = DECODING_IMAGE_DATA;
      return NS_OK;
    } else if (heightReadResult == INT_PARSE_FAILED) {
      // Encoded height was bigger than a PRUint32.
      return NS_ERROR_FAILURE;
    } else {
      // We are still parsing the encoded int field.
      NS_ASSERTION((heightReadResult == INT_PARSE_IN_PROGRESS), "nsWBMPDecoder got bad result from an encoded height field");
      return NS_OK;
    }
  }

  // This catches cases like "type" and "fix header" fields are OK and no data follows.
  return NS_OK;
}


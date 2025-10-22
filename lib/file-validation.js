/**
 * File Validation Utilities with Magic Number (File Signature) Checking
 *
 * This module provides secure file validation that checks actual file content,
 * not just MIME types or extensions, preventing malicious file uploads.
 */

/**
 * File signatures (magic numbers) for common image formats
 * These are the first bytes of each file type
 */
const FILE_SIGNATURES = {
  jpeg: [
    [0xFF, 0xD8, 0xFF, 0xDB], // JPEG raw
    [0xFF, 0xD8, 0xFF, 0xE0], // JPEG/JFIF
    [0xFF, 0xD8, 0xFF, 0xE1], // JPEG/EXIF
    [0xFF, 0xD8, 0xFF, 0xE2], // JPEG (Canon)
    [0xFF, 0xD8, 0xFF, 0xE3], // JPEG
    [0xFF, 0xD8, 0xFF, 0xE8], // JPEG/SPIFF
  ],
  png: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]], // PNG signature
  gif: [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], // GIF89a
  ],
  webp: [[0x52, 0x49, 0x46, 0x46]], // RIFF header (WebP container)
  // Dangerous file types we want to block
  exe: [[0x4D, 0x5A]], // EXE/DLL (MZ header)
  elf: [[0x7F, 0x45, 0x4C, 0x46]], // Linux executable
  php: [[0x3C, 0x3F, 0x70, 0x68, 0x70]], // <?php
};

/**
 * Check if bytes match a signature
 */
function matchesSignature(bytes, signature) {
  if (bytes.length < signature.length) return false;
  return signature.every((byte, index) => bytes[index] === byte);
}

/**
 * Detect file type by magic number
 * @param {Uint8Array} bytes - First bytes of the file
 * @returns {string|null} - Detected file type or null
 */
export function detectFileType(bytes) {
  // Check for malicious file types first
  if (FILE_SIGNATURES.exe.some(sig => matchesSignature(bytes, sig))) {
    return 'exe';
  }
  if (FILE_SIGNATURES.elf.some(sig => matchesSignature(bytes, sig))) {
    return 'elf';
  }
  if (FILE_SIGNATURES.php.some(sig => matchesSignature(bytes, sig))) {
    return 'php';
  }

  // Check for valid image types
  if (FILE_SIGNATURES.jpeg.some(sig => matchesSignature(bytes, sig))) {
    return 'jpeg';
  }
  if (FILE_SIGNATURES.png.some(sig => matchesSignature(bytes, sig))) {
    return 'png';
  }
  if (FILE_SIGNATURES.gif.some(sig => matchesSignature(bytes, sig))) {
    return 'gif';
  }

  // WebP requires additional check (WEBP after RIFF)
  if (matchesSignature(bytes, FILE_SIGNATURES.webp[0])) {
    // Check for "WEBP" at bytes 8-11
    if (bytes.length >= 12 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 &&
        bytes[10] === 0x42 && bytes[11] === 0x50) {
      return 'webp';
    }
  }

  return null;
}

/**
 * Validate file by checking magic number against claimed type
 * @param {ArrayBuffer} arrayBuffer - File content
 * @param {string} claimedMimeType - MIME type from client
 * @returns {Object} - {valid: boolean, detectedType: string, reason: string}
 */
export function validateFileMagicNumber(arrayBuffer, claimedMimeType) {
  const bytes = new Uint8Array(arrayBuffer);

  // Need at least 12 bytes to check most formats
  if (bytes.length < 12) {
    return {
      valid: false,
      detectedType: null,
      reason: 'File too small to validate'
    };
  }

  const detectedType = detectFileType(bytes);

  // Block dangerous file types immediately
  if (detectedType === 'exe' || detectedType === 'elf' || detectedType === 'php') {
    return {
      valid: false,
      detectedType,
      reason: `Dangerous file type detected: ${detectedType}`
    };
  }

  // No recognizable signature
  if (!detectedType) {
    return {
      valid: false,
      detectedType: null,
      reason: 'Unrecognized file format'
    };
  }

  // Map claimed MIME type to expected file type
  const mimeToType = {
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpeg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  };

  const expectedType = mimeToType[claimedMimeType.toLowerCase()];

  if (!expectedType) {
    return {
      valid: false,
      detectedType,
      reason: `Unsupported MIME type: ${claimedMimeType}`
    };
  }

  // Check if detected type matches claimed type
  if (detectedType !== expectedType) {
    return {
      valid: false,
      detectedType,
      reason: `File type mismatch: claimed ${expectedType}, detected ${detectedType}`
    };
  }

  return {
    valid: true,
    detectedType,
    reason: 'File signature validated successfully'
  };
}

/**
 * Get human-readable file type name
 */
export function getFileTypeName(type) {
  const names = {
    jpeg: 'JPEG Image',
    png: 'PNG Image',
    gif: 'GIF Image',
    webp: 'WebP Image',
    exe: 'Executable',
    elf: 'Linux Executable',
    php: 'PHP Script'
  };
  return names[type] || 'Unknown';
}

export default {
  validateFileMagicNumber,
  detectFileType,
  getFileTypeName
};
